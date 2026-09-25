param([switch]$Uninstall)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$taskName = 'MMS Confeitaria Local Server'
$launcherPath = Join-Path $env:APPDATA 'MMS Confeitaria\start-server.ps1'
$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$watchdogPath = Join-Path $startupDir 'MMS Confeitaria Server.vbs'

if ($Uninstall) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $launcherPath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath (Split-Path -Parent $launcherPath) -Force -Recurse -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $watchdogPath -Force -ErrorAction SilentlyContinue
  Write-Output 'Inicialização automática removida.'
  exit 0
}

$node = (Get-Command node -ErrorAction Stop).Source
New-Item -ItemType Directory -Path (Split-Path -Parent $launcherPath) -Force | Out-Null
New-Item -ItemType Directory -Path $startupDir -Force | Out-Null

$launcher = @'
$ErrorActionPreference = 'Continue'
$projectRoot = '__PROJECT_ROOT__'
$node = '__NODE_PATH__'
Set-Location -LiteralPath $projectRoot
while ($true) {
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8000)
    $listener.Start()
    $listener.Stop()
  } catch {
    if ($listener) { $listener.Stop() }
    Start-Sleep -Seconds 15
    continue
  }
  & $node (Join-Path $projectRoot 'tools/local-server.mjs')
  Start-Sleep -Seconds 3
}
'@.Replace('__PROJECT_ROOT__', $projectRoot.Replace("'", "''")).Replace('__NODE_PATH__', $node.Replace("'", "''"))
Set-Content -LiteralPath $launcherPath -Value $launcher -Encoding UTF8

$powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
$action = New-ScheduledTaskAction -Execute $powershell -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launcherPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description 'Inicia e recupera automaticamente o servidor local do painel MMS.' -Force | Out-Null

@'
Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File ""__LAUNCHER__""", 0, False
'@.Replace('__LAUNCHER__', $launcherPath) | Set-Content -LiteralPath $watchdogPath -Encoding ASCII

Start-ScheduledTask -TaskName $taskName
Write-Output 'Servidor configurado para iniciar ao entrar no Windows e recuperar automaticamente se parar.'
Write-Output 'Painel: http://localhost:8000/admin/'
