# Supabase Setup

This app uses Supabase Auth with a business as the tenant root. Every Auth user
receives one owned business, a membership, and a default theme through a database
trigger at signup.

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
APP_URL="http://localhost:3000"
```

Only `NEXT_PUBLIC_*` values are available in the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Apply migrations

Run these in filename order in the Supabase SQL editor, or apply them with the
Supabase CLI:

1. `supabase/migrations/202608230001_admin_auth.sql`
2. `supabase/migrations/202608280001_multi_tenancy.sql`
3. `supabase/migrations/202608280002_partner_payments.sql`

Then create the first shop at `/signup`. RLS and composite foreign keys prevent
one business from reading or linking to another business's data.
