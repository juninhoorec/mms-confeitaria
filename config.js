// Copie config.example.js para este arquivo e preencha somente a chave anon pública.
window.MMS_CONFIG = window.MMS_CONFIG || {
  SUPABASE_URL: 'https://mqlldhlvsbwsjtfomzuw.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_onTsf2_0AzHbVwf9S8Ouwg_wuLROmjH',
};
if (location.pathname.includes('/admin/')) {
  document.head.insertAdjacentHTML('beforeend', '<style>[hidden]{display:none!important}</style>');
}
