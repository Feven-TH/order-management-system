-- The application calls this tenant root "businesses". Each auth user has one
-- business_members row, so the password-reset requirement belongs here.
alter table public.businesses
  add column if not exists must_change_password boolean not null default true;

-- A tenant owner may update business settings, but must not be able to clear
-- the forced-reset flag directly. Only the Auth trigger below changes it after
-- Auth has actually accepted a new password.
create or replace function app_private.can_update_business(
  p_business_id uuid,
  p_must_change_password boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.businesses business
    join public.business_members membership on membership.business_id = business.id
    where business.id = p_business_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'owner'
      and business.must_change_password is not distinct from p_must_change_password
  );
$$;

revoke all on function app_private.can_update_business(uuid, boolean) from public, anon;
grant execute on function app_private.can_update_business(uuid, boolean) to authenticated;

drop policy if exists "Owners can update their business" on public.businesses;
create policy "Owners can update their business" on public.businesses for update to authenticated
  using ((select app_private.is_business_owner(id)))
  with check ((select app_private.can_update_business(id, must_change_password)));

-- This runs in the same transaction as supabase.auth.updateUser(). It makes
-- the database mutation inseparable from a real credential change.
create or replace function public.complete_forced_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.businesses business
    set must_change_password = false
    from public.business_members membership
    where membership.business_id = business.id
      and membership.user_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.complete_forced_password_change() from public, anon, authenticated;

drop trigger if exists auth_user_completes_forced_password_change on auth.users;
create trigger auth_user_completes_forced_password_change
after update of encrypted_password on auth.users
for each row execute function public.complete_forced_password_change();
