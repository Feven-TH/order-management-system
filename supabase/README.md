# Supabase Setup

This app uses Supabase Auth with a business as the tenant root. Every
admin-provisioned Auth user receives one owned business, a membership, and a
default theme through a database trigger.

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
4. `supabase/migrations/202608280003_set_user_password.sql`
5. `supabase/migrations/20260831121221_add_order_materials.sql`
6. `supabase/migrations/20260831123355_add_business_workflow_configuration.sql`
7. `supabase/migrations/20260903000000_add_customer_measurement_profiles.sql`
8. `supabase/migrations/20260907000000_add_must_change_password.sql`
9. `supabase/migrations/20260908000000_add_business_activation_controls.sql`

Then sign in as a superadmin and create shops through `/admins`. RLS and
composite foreign keys prevent one business from reading or linking to another
business's data.

Also disable **Authentication → General Configuration → Allow new users to sign
up** in the Supabase Dashboard. This prevents public Auth API registration.
