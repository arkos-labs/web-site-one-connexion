-- 20260915_link_drivers_to_auth.sql
-- Link drivers table to Supabase auth users so the driver app can find its missions.
-- The admin dashboard assigns driver_id on orders/navettes using the driver's auth user ID.

-- 1. Add auth_id column to drivers (links to auth.users)
alter table public.drivers
  add column if not exists auth_id uuid unique;

-- 2. Drop old FK constraints on orders.driver_id and navettes.driver_id
--    These referenced drivers(id), but we now store auth user IDs instead.
do $$
declare
  r record;
begin
  for r in (
    select conname from pg_constraint
    where conrelid = 'public.orders'::regclass
      and confrelid = 'public.drivers'::regclass
      and contype = 'f'
  ) loop
    execute format('alter table public.orders drop constraint %I', r.conname);
  end loop;

  for r in (
    select conname from pg_constraint
    where conrelid = 'public.navettes'::regclass
      and confrelid = 'public.drivers'::regclass
      and contype = 'f'
  ) loop
    execute format('alter table public.navettes drop constraint %I', r.conname);
  end loop;
end $$;

-- 3. Allow drivers to read their own record (courier role)
drop policy if exists "Drivers read own record" on public.drivers;
create policy "Drivers read own record" on public.drivers
  for select
  using (auth_id = auth.uid());

-- 4. Allow drivers to see orders assigned to them
drop policy if exists "Drivers see own orders" on public.orders;
create policy "Drivers see own orders" on public.orders
  for select
  using (driver_id = auth.uid() or user_id = auth.uid());

drop policy if exists "Drivers update own orders" on public.orders;
create policy "Drivers update own orders" on public.orders
  for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- 5. Allow drivers to see navettes assigned to them
drop policy if exists "Drivers see own navettes" on public.navettes;
create policy "Drivers see own navettes" on public.navettes
  for select
  using (driver_id = auth.uid() or user_id = auth.uid());

drop policy if exists "Drivers update own navettes" on public.navettes;
create policy "Drivers update own navettes" on public.navettes
  for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());
