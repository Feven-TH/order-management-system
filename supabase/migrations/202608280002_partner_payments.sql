-- Partner settlements are separate financial events. business_id is required
-- here because a payment links directly to a tenant-owned partner.
create table public.partner_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  partner_id uuid not null,
  amount numeric(12, 2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint partner_payments_partner_same_business_fkey
    foreign key (business_id, partner_id)
    references public.partners (business_id, id)
    on delete restrict
);

create index partner_payments_business_id_partner_id_idx
  on public.partner_payments (business_id, partner_id, paid_at desc);

alter table public.partner_payments enable row level security;
grant select, insert, update, delete on public.partner_payments to authenticated;

create policy "Members manage their business partner payments"
on public.partner_payments for all to authenticated
using ((select app_private.is_business_member(business_id)))
with check ((select app_private.is_business_member(business_id)));
