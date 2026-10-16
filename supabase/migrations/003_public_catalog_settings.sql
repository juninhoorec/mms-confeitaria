-- Migration 003: Permitir que o catálogo de produtos e configurações públicas
-- possam ser lidos pelos visitantes do site (sessão anônima), mantendo a edição
-- permitida exclusivamente para administradores autenticados.

grant select on public.settings to anon;

drop policy if exists "public can read public settings" on public.settings;
create policy "public can read public settings"
on public.settings
for select
to anon
using (true);
