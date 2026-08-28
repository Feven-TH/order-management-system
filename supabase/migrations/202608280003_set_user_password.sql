-- Administrative password reset for existing Auth users.
-- This function is deliberately not callable by anon or authenticated users.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_user_password(
  p_email text,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(char_length(p_password), 0) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  if coalesce(char_length(trim(p_email)), 0) = 0 then
    raise exception 'Email is required';
  end if;

  -- A normal authenticated request may only use this routine when it belongs
  -- to the platform superadmin. SQL Editor and service-role calls have no
  -- auth.uid() and already require privileged project access.
  if (select auth.uid()) is not null
     and not exists (
       select 1
       from public.admin_profiles profile
       where profile.id = (select auth.uid())
         and profile.role = 'superadmin'
         and profile.active = true
     ) then
    raise exception 'Only a platform superadmin can reset user passwords';
  end if;

  update auth.users
  set
    encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
  where lower(email) = lower(trim(p_email));

  if not found then
    raise exception 'Auth user not found';
  end if;
end;
$$;

revoke all on function public.set_user_password(text, text) from public, anon, authenticated;
grant execute on function public.set_user_password(text, text) to service_role;
