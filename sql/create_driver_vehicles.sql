-- Create driver_vehicles table (Admin vehicle management)
create table if not exists public.driver_vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  vehicle_type text not null,
  registration text,
  brand text,
  model text,
  capacity text,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_driver_vehicles_driver_id on public.driver_vehicles(driver_id);

-- Optional RLS (admin-only)
alter table public.driver_vehicles enable row level security;

create policy if not exists "admin_manage_driver_vehicles"
  on public.driver_vehicles
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','super_admin','dispatcher')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','super_admin','dispatcher')
    )
  );
