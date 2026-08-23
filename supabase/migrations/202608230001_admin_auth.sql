create type public.admin_role as enum ('superadmin', 'admin');

create schema if not exists app_private;

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.admin_role not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index admin_profiles_role_active_idx
  on public.admin_profiles (role, active);

alter table public.admin_profiles enable row level security;

create or replace function app_private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = (select auth.uid())
      and role = 'superadmin'
      and active = true
  );
$$;

revoke all on schema app_private from public;
revoke all on function app_private.is_superadmin() from public, anon;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_superadmin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();

create policy "Admins can read their own profile"
on public.admin_profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Superadmins can read all admin profiles"
on public.admin_profiles
for select
to authenticated
using ((select app_private.is_superadmin()));

-- Admin profile writes are intentionally performed only from trusted server code
-- with the Supabase service role key. There are no anon/authenticated insert,
-- update, or delete policies, so ordinary admins cannot add or remove admins.

-- Bootstrap the first superadmin after creating their Auth user:
--
-- insert into public.admin_profiles (id, email, full_name, role)
-- values (
--   'AUTH_USER_UUID_HERE',
--   'owner@example.com',
--   'Owner Name',
--   'superadmin'
-- );
