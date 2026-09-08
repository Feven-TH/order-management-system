-- "businesses" is this application's atelier/tenant root table.
alter table public.businesses
  add column if not exists is_active boolean not null default true;

-- Every tenant-scoped policy calls one of these helpers. Including the active
-- check here makes deactivation apply consistently to all tenant data,
-- including rows reached indirectly through orders.
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
    join public.businesses business on business.id = membership.business_id
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
      and business.is_active = true
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
    join public.businesses business on business.id = membership.business_id
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'owner'
      and business.is_active = true
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
    join public.businesses business on business.id = membership.business_id
    where order_record.id = p_order_id
      and membership.user_id = (select auth.uid())
      and business.is_active = true
  );
$$;

revoke all on function app_private.is_business_member(uuid) from public, anon;
revoke all on function app_private.is_business_owner(uuid) from public, anon;
revoke all on function app_private.is_order_in_current_business(uuid) from public, anon;
grant execute on function app_private.is_business_member(uuid) to authenticated;
grant execute on function app_private.is_business_owner(uuid) to authenticated;
grant execute on function app_private.is_order_in_current_business(uuid) to authenticated;
