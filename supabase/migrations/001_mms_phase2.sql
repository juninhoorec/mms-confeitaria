create extension if not exists pgcrypto;
create sequence if not exists public.mms_order_number_seq start 1042;

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(), product_id text not null,
  options jsonb not null default '{}'::jsonb, quantity integer not null default 0 check (quantity >= 0),
  available_date date not null, price_override numeric(10,2), note text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(product_id, available_date, options)
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique default ('#' || nextval('public.mms_order_number_seq')::text),
  customer_name text not null, customer_phone text, source text not null default 'manual', items jsonb not null default '[]'::jsonb,
  delivery_type text, address text, date date not null, time time, payment_method text,
  payment_status text not null default 'Pendente' check(payment_status in ('Pendente','Pago')),
  status text not null default 'NOVO' check(status in ('NOVO','CONFIRMADO','EM PREPARO','PRONTO','SAIU PARA ENTREGA','ENTREGUE','CANCELADO')),
  notes text, subtotal numeric(10,2) not null default 0, delivery_fee numeric(10,2), total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.settings (id text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());

alter table public.availability enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;
create policy "public reads today's active availability" on public.availability for select to anon using (active = true and quantity > 0 and available_date = (now() at time zone 'America/Sao_Paulo')::date);
create policy "admin reads availability" on public.availability for select to authenticated using (true);
create policy "admin inserts availability" on public.availability for insert to authenticated with check (true);
create policy "admin updates availability" on public.availability for update to authenticated using (true) with check (true);
create policy "admin deletes availability" on public.availability for delete to authenticated using (true);
create policy "admin reads orders" on public.orders for select to authenticated using (true);
create policy "admin inserts orders" on public.orders for insert to authenticated with check (true);
create policy "admin updates orders" on public.orders for update to authenticated using (true) with check (true);
create policy "admin deletes orders" on public.orders for delete to authenticated using (true);
create policy "admin reads settings" on public.settings for select to authenticated using (true);
create policy "admin writes settings" on public.settings for insert to authenticated with check (true);
create policy "admin updates settings" on public.settings for update to authenticated using (true) with check (true);
create policy "admin deletes settings" on public.settings for delete to authenticated using (true);
revoke insert, update, delete on public.availability from anon;
revoke all on public.orders from anon;
revoke all on public.settings from anon;
grant select on public.availability to anon;
grant all on public.availability, public.orders, public.settings to authenticated;
grant usage, select on sequence public.mms_order_number_seq to authenticated;
