-- 20260913_admin_dashboard_setup.sql

-- Roles
alter table public.profiles
  add column if not exists role text not null default 'client';

do $$
begin
  alter table public.profiles
    add constraint profiles_role_check check (role in ('client', 'admin'));
exception when duplicate_object then
  null;
end $$;

-- Helper used by RLS policies below (security definer avoids recursive
-- RLS evaluation on profiles when profiles' own policies check role).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Drivers
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle text,
  status text not null default 'disponible'
    check (status in ('disponible', 'en_course', 'hors_service')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.drivers enable row level security;

drop policy if exists "Admins manage drivers" on public.drivers;
create policy "Admins manage drivers" on public.drivers
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Dispatch columns
alter table public.orders
  add column if not exists driver_id uuid references public.drivers(id);

alter table public.navettes
  add column if not exists driver_id uuid references public.drivers(id);

-- Admin RLS: admins can see/manage every row, in addition to existing
-- owner-scoped policies.
drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders" on public.orders
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage all navettes" on public.navettes;
create policy "Admins manage all navettes" on public.navettes
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins view all profiles" on public.profiles;
create policy "Admins view all profiles" on public.profiles
  for select
  using (public.is_admin());

drop policy if exists "Admins update all profiles" on public.profiles;
create policy "Admins update all profiles" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());
