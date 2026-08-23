# Supabase Setup

This app uses Supabase Auth for admin login and `public.admin_profiles` for role checks.

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Only `NEXT_PUBLIC_*` values are available in the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## First Superadmin

1. Create the first user in Supabase Auth.
2. Run `supabase/migrations/202608230001_admin_auth.sql` in the Supabase SQL editor, or apply it through Supabase CLI.
3. Insert the first superadmin row using the bootstrap SQL at the bottom of the migration.

After that, the superadmin can sign in at `/login` and manage admins at `/admins`.
