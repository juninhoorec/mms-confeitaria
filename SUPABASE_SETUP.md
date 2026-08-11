# Supabase — configuração da MMS

1. Crie um projeto em https://supabase.com e guarde a senha do banco em local seguro.
2. No painel do Supabase, abra **SQL Editor**, crie uma consulta, cole todo o conteúdo de `supabase/migrations/001_mms_phase2.sql` e execute.
3. Abra **Authentication → Users → Add user** e crie manualmente a conta da responsável. Não habilite cadastro público.
4. Abra **Project Settings → API** e copie apenas **Project URL** e a chave pública **anon/publishable**.
5. Copie `config.example.js` para `config.js` e preencha:

```js
window.MMS_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_CHAVE_PUBLICA_ANON',
};
```

6. Publique o projeto no GitHub Pages. A chave `anon` é pública por definição; a segurança está nas políticas RLS. Nunca use uma chave administrativa no site.
7. Acesse `/admin/`, entre com a conta criada e marque um produto para hoje. Abra o site em outro aparelho e recarregue.

## Teste rápido de segurança

- Sem login, `availability` permite apenas leitura de itens ativos, com quantidade positiva e data de hoje.
- Sem login, `orders` e `settings` não retornam nem aceitam dados.
- Com login administrativo, o painel pode gerenciar as três tabelas.

## Fallback

Se `config.js` estiver vazio ou a rede falhar, o site público mantém catálogo, carrinho e WhatsApp. Sem configuração, o painel mostra **Modo local** e salva apenas no navegador atual.
