# Order Management System

Next.js admin workspace for AtelierOS order management.

## Stack

- Next.js App Router for frontend and server routes
- Supabase Auth for admin sign-in
- Supabase Postgres for admin role profiles
- Tailwind CSS for styling

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are safe for browser use. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.

4. Apply the Supabase migration.

Use the Supabase SQL editor or Supabase CLI to run:

```text
supabase/migrations/202608230001_admin_auth.sql
```

This creates:

- `public.admin_role`
- `public.admin_profiles`
- `app_private.is_superadmin()`
- RLS policies for admin profile reads

5. Create the first superadmin.

Create the first user in Supabase Auth, copy their Auth user UUID, then run the bootstrap SQL shown at the bottom of `supabase/migrations/202608230001_admin_auth.sql`:

```sql
insert into public.admin_profiles (id, email, full_name, role)
values (
  'AUTH_USER_UUID_HERE',
  'owner@example.com',
  'Owner Name',
  'superadmin'
);
```

After this first account exists, sign in as the superadmin and manage admins from `/admins`.

6. Configure Supabase Auth URLs.

In the Supabase dashboard, add these Auth redirect URLs for local development:

```text
http://localhost:3000/auth/callback
http://localhost:3000
```

For production, also add your deployed app URL and `/auth/callback` URL.

7. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000`. Unauthenticated users are redirected to `/login`.

## Admin Roles

- `superadmin`: can sign in, use the admin workspace, invite admins, and remove admins.
- `admin`: can sign in and use the admin workspace, but cannot invite or remove admins.

Admin invites and removals use the server-only Supabase service role key. Normal admins do not have database policies that allow them to add or remove admin profiles.

## Scripts

```bash
npm run dev        # Start local development server
npm run lint       # Type-check the app
npm run build      # Create a production build
npm run start      # Start the production server after building
```

## Current Data Storage

Auth and admin roles are backed by Supabase. Order, customer, partner, inventory, reminder, and finance records currently use empty local browser storage placeholders. The next backend step is to add Supabase tables and migrate those workflows from local storage to database reads/writes.
