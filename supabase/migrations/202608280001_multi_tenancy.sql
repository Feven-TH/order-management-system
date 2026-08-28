-- Tenant isolation model
--
-- Businesses are the root of tenant ownership.  A user has one workspace
-- membership in this version of the product, so the current business can be
-- resolved exclusively from auth.uid() and never from a client supplied ID.

create type public.business_member_role as enum ('owner', 'member');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text,
  phone text,
  currency text not null default 'ETB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_members (
  -- A primary key on user_id intentionally makes a user belong to exactly one
  -- business.  This gives the application one unambiguous server-side tenant.
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role public.business_member_role not null default 'member',
  full_name text,
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index business_members_business_id_idx on public.business_members (business_id);

create table public.business_themes (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  logo_url text,
  primary_color text not null default '#885000',
  primary_hover text not null default '#6d3e00',
  primary_light text not null default '#fff1e7',
  secondary_color text not null default '#f3e6d8',
  accent_color text not null default '#c49a6c',
  background_color text not null default '#fff8f4',
  surface_color text not null default '#ffffff',
  surface_container text not null default '#f9ebe2',
  surface_container_high text not null default '#f3e6dc',
  text_color text not null default '#211a15',
  text_muted text not null default '#524438',
  border_color text not null default '#d7c3b2',
  theme_mode text not null default 'dark' check (theme_mode in ('light', 'dark', 'auto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  alt_phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create index customers_business_id_created_at_idx on public.customers (business_id, created_at desc);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  partner_type text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create index partners_business_id_created_at_idx on public.partners (business_id, created_at desc);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null,
  order_number text not null,
  item_type text not null,
  price numeric(12, 2) not null check (price >= 0),
  deposit numeric(12, 2) not null default 0 check (deposit >= 0),
  paid numeric(12, 2) not null default 0 check (paid >= 0),
  status text not null,
  due_date date,
  description text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  unique (business_id, order_number),
  -- This composite FK is the important guard: an order cannot select a
  -- customer that belongs to a different business.
  constraint orders_customer_same_business_fkey
    foreign key (business_id, customer_id)
    references public.customers (business_id, id)
    on delete restrict
);

create index orders_business_id_created_at_idx on public.orders (business_id, created_at desc);
create index orders_business_id_customer_id_idx on public.orders (business_id, customer_id);

-- These are owned only by an order.  They deliberately do not repeat
-- business_id: their RLS policy resolves ownership through orders.
create table public.order_measurements (
  order_id uuid primary key references public.orders(id) on delete cascade,
  measurements jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null,
  paid_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

create index order_payments_order_id_idx on public.order_payments (order_id, paid_at desc);

create table public.order_reference_photos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (order_id, storage_path)
);

create index order_reference_photos_order_id_idx on public.order_reference_photos (order_id);

-- A cost belongs to an order but also optionally references a partner.  It
-- repeats business_id for a reason: the two composite FKs make a cross-tenant
-- order/partner relationship structurally impossible.
create table public.order_costs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null,
  partner_id uuid,
  item text not null,
  cost_type text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_costs_order_same_business_fkey
    foreign key (business_id, order_id)
    references public.orders (business_id, id)
    on delete cascade,
  constraint order_costs_partner_same_business_fkey
    foreign key (business_id, partner_id)
    references public.partners (business_id, id)
    on delete restrict
);

create index order_costs_business_id_order_id_idx on public.order_costs (business_id, order_id);
create index order_costs_business_id_partner_id_idx on public.order_costs (business_id, partner_id);

create table public.partner_invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  partner_id uuid not null,
  invoice_number text not null,
  title text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date,
  status text not null,
  category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number),
  constraint partner_invoices_partner_same_business_fkey
    foreign key (business_id, partner_id)
    references public.partners (business_id, id)
    on delete restrict
);

create index partner_invoices_business_id_partner_id_idx on public.partner_invoices (business_id, partner_id);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid,
  title text not null,
  description text not null default '',
  due_at timestamptz not null,
  reminder_type text not null,
  completed boolean not null default false,
  recipient_name text,
  recipient_phone text,
  amount numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_order_same_business_fkey
    foreign key (business_id, order_id)
    references public.orders (business_id, id)
    on delete cascade
);

create index reminders_business_id_due_at_idx on public.reminders (business_id, due_at);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  category text not null,
  stock numeric(12, 3) not null default 0,
  unit text not null,
  cost_per_unit numeric(12, 2) not null default 0 check (cost_per_unit >= 0),
  min_stock_level numeric(12, 3) not null default 0,
  supplier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inventory_items_business_id_name_idx on public.inventory_items (business_id, name);

-- SECURITY DEFINER is limited to internal boolean lookups.  It checks the
-- authenticated user itself, has a fixed empty search path, and is not callable
-- by anon/PUBLIC roles.
create or replace function app_private.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members membership
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function app_private.is_business_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members membership
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'owner'
  );
$$;

create or replace function app_private.is_order_in_current_business(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders order_record
    join public.business_members membership on membership.business_id = order_record.business_id
    where order_record.id = p_order_id
      and membership.user_id = (select auth.uid())
  );
$$;

revoke all on function app_private.is_business_member(uuid) from public, anon;
revoke all on function app_private.is_business_owner(uuid) from public, anon;
revoke all on function app_private.is_order_in_current_business(uuid) from public, anon;
grant execute on function app_private.is_business_member(uuid) to authenticated;
grant execute on function app_private.is_business_owner(uuid) to authenticated;
grant execute on function app_private.is_order_in_current_business(uuid) to authenticated;

-- The Auth trigger creates the complete tenant boundary atomically for every
-- signup.  Metadata is display-only; it is never used for authorization.
create or replace function public.create_business_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_business_id uuid;
  requested_name text;
begin
  requested_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'business_name', '')), '');

  insert into public.businesses (name, email)
  values (
    coalesce(left(requested_name, 120), left(split_part(coalesce(new.email, 'My shop'), '@', 1) || '''s shop', 120)),
    new.email
  )
  returning id into new_business_id;

  insert into public.business_members (user_id, business_id, role, full_name)
  values (
    new.id,
    new_business_id,
    'owner',
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  );

  insert into public.business_themes (business_id) values (new_business_id);
  return new;
end;
$$;

revoke all on function public.create_business_for_new_user() from public, anon, authenticated;

create trigger auth_user_creates_business
after insert on auth.users
for each row execute function public.create_business_for_new_user();

-- Accounts created before this migration need the same complete tenant setup.
do $$
declare
  existing_user record;
  existing_business_id uuid;
begin
  for existing_user in
    select id, email, raw_user_meta_data
    from auth.users
    where not exists (
      select 1 from public.business_members membership
      where membership.user_id = auth.users.id
    )
  loop
    insert into public.businesses (name, email)
    values (
      coalesce(
        nullif(trim(coalesce(existing_user.raw_user_meta_data ->> 'business_name', '')), ''),
        left(split_part(coalesce(existing_user.email, 'My shop'), '@', 1) || '''s shop', 120)
      ),
      existing_user.email
    )
    returning id into existing_business_id;

    insert into public.business_members (user_id, business_id, role, full_name)
    values (
      existing_user.id,
      existing_business_id,
      'owner',
      nullif(trim(coalesce(existing_user.raw_user_meta_data ->> 'full_name', '')), '')
    );

    insert into public.business_themes (business_id) values (existing_business_id);
  end loop;
end;
$$;

-- Keep timestamps uniform for mutable tenant records.
create trigger businesses_set_updated_at before update on public.businesses
for each row execute function public.set_updated_at();
create trigger business_themes_set_updated_at before update on public.business_themes
for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();
create trigger partners_set_updated_at before update on public.partners
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger order_measurements_set_updated_at before update on public.order_measurements
for each row execute function public.set_updated_at();
create trigger order_costs_set_updated_at before update on public.order_costs
for each row execute function public.set_updated_at();
create trigger partner_invoices_set_updated_at before update on public.partner_invoices
for each row execute function public.set_updated_at();
create trigger reminders_set_updated_at before update on public.reminders
for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.business_themes enable row level security;
alter table public.customers enable row level security;
alter table public.partners enable row level security;
alter table public.orders enable row level security;
alter table public.order_measurements enable row level security;
alter table public.order_payments enable row level security;
alter table public.order_reference_photos enable row level security;
alter table public.order_costs enable row level security;
alter table public.partner_invoices enable row level security;
alter table public.reminders enable row level security;
alter table public.inventory_items enable row level security;

-- Only authenticated application sessions receive table privileges. RLS below
-- supplies the tenant authorization; anon receives no access at all.
grant select, update on public.businesses to authenticated;
grant select on public.business_members to authenticated;
grant select, update on public.business_themes to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.partners to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_measurements to authenticated;
grant select, insert, update, delete on public.order_payments to authenticated;
grant select, insert, update, delete on public.order_reference_photos to authenticated;
grant select, insert, update, delete on public.order_costs to authenticated;
grant select, insert, update, delete on public.partner_invoices to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;

create policy "Members can read their business" on public.businesses for select to authenticated
  using ((select app_private.is_business_member(id)));
create policy "Owners can update their business" on public.businesses for update to authenticated
  using ((select app_private.is_business_owner(id)))
  with check ((select app_private.is_business_owner(id)));

create policy "Members can read business membership" on public.business_members for select to authenticated
  using ((select app_private.is_business_member(business_id)));

create policy "Members can read their business theme" on public.business_themes for select to authenticated
  using ((select app_private.is_business_member(business_id)));
create policy "Owners can update their business theme" on public.business_themes for update to authenticated
  using ((select app_private.is_business_owner(business_id)))
  with check ((select app_private.is_business_owner(business_id)));

create policy "Members manage their business customers" on public.customers for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage their business partners" on public.partners for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage their business orders" on public.orders for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage order measurements" on public.order_measurements for all to authenticated
  using ((select app_private.is_order_in_current_business(order_id)))
  with check ((select app_private.is_order_in_current_business(order_id)));
create policy "Members manage order payments" on public.order_payments for all to authenticated
  using ((select app_private.is_order_in_current_business(order_id)))
  with check ((select app_private.is_order_in_current_business(order_id)));
create policy "Members manage order reference photos" on public.order_reference_photos for all to authenticated
  using ((select app_private.is_order_in_current_business(order_id)))
  with check ((select app_private.is_order_in_current_business(order_id)));
create policy "Members manage their business order costs" on public.order_costs for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage their business partner invoices" on public.partner_invoices for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage their business reminders" on public.reminders for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
create policy "Members manage their business inventory" on public.inventory_items for all to authenticated
  using ((select app_private.is_business_member(business_id)))
  with check ((select app_private.is_business_member(business_id)));
