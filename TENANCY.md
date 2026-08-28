# Tenant administration

## What a tenant is

A tenant is one shop or business. `businesses` is the root record for that
tenant. Its users, customers, orders, partners, invoices, reminders, inventory,
and branding are isolated from every other business.

Two separate roles exist:

| Role | Purpose |
| --- | --- |
| Business owner | Runs one shop and can access only that shop's data. |
| Platform superadmin | Operates the SaaS administration screen at `/admins`. This is not a normal shop role. |

## Create a tenant as a superadmin

1. Sign in with your platform superadmin account.
2. Open `/admins`.
3. Under **Create tenant owner**, enter the business name, owner email, and optionally their name.
4. Set a temporary password and select **Create tenant**.
5. Share the credentials with the owner through your approved secure channel.

Creating the account creates, in one database transaction:

1. The Auth user.
2. A `businesses` row.
3. A `business_members` row that connects the user to that business with the `owner` role.
4. A default `business_themes` row.

Do **not** use **Invite admin** for a shop owner. That option gives the recipient
platform administration privileges; it is only for staff who should manage
`/admins`.

## Self-service signup

A shop can alternatively register at `/signup`. The result is identical: the
new account owns one newly-created business. The business name entered on the
form is used for the tenant's name.

## How isolation is enforced

- Server code resolves the current business from the authenticated user's
  `business_members` row in `src/lib/auth/tenant.ts`. It never accepts a tenant
  ID from the browser as authority.
- Row-Level Security allows a user to read or mutate only records belonging to
  their business.
- Composite foreign keys prevent cross-tenant relationships. For example, an
  order's `(business_id, customer_id)` must match the same row in `customers`,
  and an order cost's partner must be in the order's business.
- Payments, measurements, and photos belong to an order and derive their tenant
  access through that order rather than repeating `business_id` without need.

## Required configuration

Set the deployed URL in your environment:

```env
APP_URL="https://app.example.com"
```

In Supabase Auth settings, set **Site URL** to this URL and add the exact
`https://app.example.com/auth/callback` path to **Redirect URLs**. An invitation
or confirmation redirect must be on that allow list.

## Important current limitation

The interface loads and saves workspace records through `/api/workspace`. This
route resolves the authenticated tenant on the server and never accepts a
business ID from a form, URL, or request body as authority.
