alter table public.customers
  add column if not exists measurements jsonb not null default '{}'::jsonb;
