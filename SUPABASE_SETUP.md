# Supabase — configuração da MMS

Use somente a **Project URL** e a chave pública **Publishable/anon** no navegador. Nunca coloque senha do banco, connection string ou chave administrativa no projeto.

## A. Executar a migration 001

No Supabase, abra **SQL Editor**, cole o conteúdo completo de `supabase/migrations/001_mms_phase2.sql` e execute.

## B. Executar a migration 002

No SQL Editor, cole e execute `supabase/migrations/002_admin_allowlist_and_phase21.sql`. Ela registra a allowlist administrativa e substitui as policies abertas a qualquer usuário autenticado. É idempotente e pode ser executada mesmo se o patch já tiver sido aplicado manualmente.

## C. Criar a conta administrativa

Abra **Authentication → Users → Add user** e crie manualmente a conta da responsável. Não habilite cadastro público. Copie o **User UID** exibido pelo Supabase.

## D. Autorizar o UID

Execute no SQL Editor, substituindo somente o valor de exemplo:

```sql
insert into public.admin_users (user_id)
values ('UUID_DO_ADMIN')
on conflict do nothing;
```

Confirme:

```sql
select * from public.admin_users;
```

O UID real nunca deve ser colocado no repositório.

## E. Configurar o site

Abra **Project Settings → API** e copie apenas **Project URL** e **Publishable Key**. Copie `config.example.js` para `config.js` e preencha:

```js
window.MMS_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_CHAVE_PUBLICA',
};
```

## F. Publicar

Publique normalmente no GitHub Pages, mantendo a URL existente. A Publishable Key é pública; a proteção dos dados depende das policies RLS e da allowlist `admin_users`.

## Validação de segurança

### Sessão anônima

- `availability`: SELECT somente dos registros ativos, com quantidade positiva e data atual em `America/Sao_Paulo`.
- `orders`: SELECT/INSERT/UPDATE/DELETE negados.
- `settings`: SELECT/INSERT/UPDATE/DELETE negados.
- `availability`: INSERT/UPDATE/DELETE negados.

### Admin autenticado e presente em `admin_users`

- CRUD esperado em `availability`, `orders` e `settings`.
- SELECT somente do próprio registro em `admin_users`.
- INSERT/UPDATE/DELETE em `admin_users` continuam negados pelo frontend.

### Usuário autenticado fora da allowlist

- CRUD negado em `availability`, `orders` e `settings`.

Para conferir as policies instaladas:

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('admin_users', 'availability', 'orders', 'settings')
order by tablename, policyname;
```

## Fallback local

Se `config.js` estiver vazio ou a rede falhar, o catálogo, carrinho e WhatsApp continuam funcionando. Sem configuração remota, o painel mostra **Modo local** e salva somente no navegador atual.
