# Order Management System

Next.js multi-tenant workspace for AtelierOS order management.

## Stack

- Next.js App Router for frontend and server routes
- Supabase Auth for business sign-in and signup
- Supabase Postgres with business-scoped tenant isolation
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
APP_URL="http://localhost:3000"
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are safe for browser use. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.

4. Apply the Supabase migrations in order.

Use the Supabase SQL editor or Supabase CLI to run:

- `supabase/migrations/202608230001_admin_auth.sql`
- `supabase/migrations/202608280001_multi_tenancy.sql`

5. Create a business account.

Open `/signup`. Creating an Auth user atomically creates its `businesses`,
`business_members` (with the `owner` role), and default `business_themes` rows.
The tenant is then resolved from the authenticated user on the server; the
browser never chooses a business ID.

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

## Tenant isolation

- Every customer, order, partner, invoice, reminder, and inventory item is scoped to `business_id` and protected by RLS.
- Order-only data (payments, measurements, and photos) inherits tenant ownership through its order instead of duplicating `business_id`.
- Cross-root links use composite foreign keys. An order cannot reference another business's customer, and an order cost cannot reference another business's partner.
- `src/lib/auth/tenant.ts` is the only server-side tenant resolver. New server actions and route handlers must call `requireTenant()` and derive their `businessId` from its return value, never request input.

## Scripts

```bash
npm run dev        # Start local development server
npm run lint       # Type-check the app
npm run build      # Create a production build
npm run start      # Start the production server after building
```

## Current Data Storage

The prototype UI no longer persists domain records in browser storage, because
browser storage is not safe across accounts sharing a device. The Supabase
migration is the authoritative persistent schema; new data workflows must use
server actions that call `requireTenant()`.
