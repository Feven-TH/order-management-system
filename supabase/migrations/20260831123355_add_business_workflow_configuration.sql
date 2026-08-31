alter table public.businesses
  add column order_statuses text[] not null default array['Confirmed', 'In Progress', 'Ready for Fitting', 'Ready', 'Completed']::text[],
  add column measurement_fields jsonb not null default '["shoulder", "bust", "waist", "hips", "length", "sleeve", "neck", "inseam"]'::jsonb;
