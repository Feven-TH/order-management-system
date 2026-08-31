-- Inventory consumption is represented separately from labour and partner
-- costs so stock movements retain their own auditable order ledger.
alter table public.inventory_items
  add constraint inventory_items_business_id_id_key unique (business_id, id);

create table public.order_materials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null,
  material_id uuid not null,
  quantity_used numeric(12, 3) not null check (quantity_used > 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0),
  total_cost numeric(12, 2) generated always as (round(quantity_used * unit_cost, 2)) stored,
  created_at timestamptz not null default now(),
  constraint order_materials_order_same_business_fkey
    foreign key (business_id, order_id)
    references public.orders (business_id, id)
    on delete cascade,
  constraint order_materials_inventory_same_business_fkey
    foreign key (business_id, material_id)
    references public.inventory_items (business_id, id)
    on delete restrict
);

create index order_materials_business_order_created_at_idx
  on public.order_materials (business_id, order_id, created_at);
create index order_materials_business_material_created_at_idx
  on public.order_materials (business_id, material_id, created_at);

alter table public.order_materials enable row level security;
grant select on public.order_materials to authenticated;

create policy "Members read their business order materials" on public.order_materials for select to authenticated
  using ((select app_private.is_business_member(business_id)));

-- Restoring stock in a trigger also covers cascading deletion of an order.
create or replace function public.restore_inventory_for_order_material()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.inventory_items
  set stock = stock + old.quantity_used
  where id = old.material_id
    and business_id = old.business_id;
  return old;
end;
$$;

create trigger order_materials_restore_inventory_before_delete
before delete on public.order_materials
for each row execute function public.restore_inventory_for_order_material();

-- These short, permission-gated functions keep stock validation, deduction,
-- and ledger writes in one database transaction. Direct writes are not
-- granted, so every inventory movement must pass through these checks.
create or replace function public.consume_order_material(
  p_order_id uuid,
  p_material_id uuid,
  p_quantity_used numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_inventory public.inventory_items%rowtype;
  v_order_material public.order_materials%rowtype;
begin
  if p_quantity_used is null or p_quantity_used <= 0 then
    raise exception 'Quantity used must be greater than zero' using errcode = '22023';
  end if;

  select business_id into v_business_id
  from public.orders
  where id = p_order_id
  for update;

  if v_business_id is null then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  if not (select app_private.is_business_member(v_business_id)) then
    raise exception 'Not authorized for this order' using errcode = '42501';
  end if;

  select * into v_inventory
  from public.inventory_items
  where id = p_material_id
    and business_id = v_business_id
  for update;

  if not found then
    raise exception 'Material not found' using errcode = 'P0002';
  end if;

  if v_inventory.stock < p_quantity_used then
    raise exception 'Requested quantity exceeds available inventory' using errcode = '22023';
  end if;

  update public.inventory_items
  set stock = stock - p_quantity_used
  where id = v_inventory.id
    and business_id = v_business_id;

  insert into public.order_materials (business_id, order_id, material_id, quantity_used, unit_cost)
  values (v_business_id, p_order_id, p_material_id, p_quantity_used, v_inventory.cost_per_unit)
  returning * into v_order_material;

  return jsonb_build_object(
    'id', v_order_material.id,
    'orderId', v_order_material.order_id,
    'materialId', v_order_material.material_id,
    'materialName', v_inventory.name,
    'unit', v_inventory.unit,
    'quantityUsed', v_order_material.quantity_used,
    'unitCost', v_order_material.unit_cost,
    'totalCost', v_order_material.total_cost,
    'availableStock', v_inventory.stock - p_quantity_used,
    'createdAt', v_order_material.created_at
  );
end;
$$;

create or replace function public.release_order_material(p_order_material_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_material public.order_materials%rowtype;
  v_inventory public.inventory_items%rowtype;
begin
  select * into v_order_material
  from public.order_materials
  where id = p_order_material_id
  for update;

  if not found then
    raise exception 'Material consumption record not found' using errcode = 'P0002';
  end if;

  if not (select app_private.is_business_member(v_order_material.business_id)) then
    raise exception 'Not authorized for this material consumption record' using errcode = '42501';
  end if;

  delete from public.order_materials where id = v_order_material.id;

  select * into v_inventory
  from public.inventory_items
  where id = v_order_material.material_id
    and business_id = v_order_material.business_id;

  return jsonb_build_object(
    'id', v_order_material.id,
    'orderId', v_order_material.order_id,
    'materialId', v_order_material.material_id,
    'quantityUsed', v_order_material.quantity_used,
    'availableStock', coalesce(v_inventory.stock, 0)
  );
end;
$$;

revoke all on function public.restore_inventory_for_order_material() from public, anon, authenticated;
revoke all on function public.consume_order_material(uuid, uuid, numeric) from public, anon;
revoke all on function public.release_order_material(uuid) from public, anon;
grant execute on function public.consume_order_material(uuid, uuid, numeric) to authenticated;
grant execute on function public.release_order_material(uuid) to authenticated;
