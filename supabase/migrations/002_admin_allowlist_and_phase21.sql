-- Phase 2.1: make the manually applied admin allowlist reproducible.
-- Safe after 001 and safe when the table/policies already exist.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon;
revoke all on public.admin_users from authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "admin can read own membership" on public.admin_users;
create policy "admin can read own membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin reads availability" on public.availability;
drop policy if exists "admin inserts availability" on public.availability;
drop policy if exists "admin updates availability" on public.availability;
drop policy if exists "admin deletes availability" on public.availability;
drop policy if exists "admin reads orders" on public.orders;
drop policy if exists "admin inserts orders" on public.orders;
drop policy if exists "admin updates orders" on public.orders;
drop policy if exists "admin deletes orders" on public.orders;
drop policy if exists "admin reads settings" on public.settings;
drop policy if exists "admin writes settings" on public.settings;
drop policy if exists "admin updates settings" on public.settings;
drop policy if exists "admin deletes settings" on public.settings;

create policy "admin reads availability" on public.availability for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin inserts availability" on public.availability for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin updates availability" on public.availability for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin deletes availability" on public.availability for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admin reads orders" on public.orders for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin inserts orders" on public.orders for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin updates orders" on public.orders for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin deletes orders" on public.orders for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admin reads settings" on public.settings for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin writes settings" on public.settings for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin updates settings" on public.settings for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admin deletes settings" on public.settings for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Keep the public availability policy from 001 unchanged.
