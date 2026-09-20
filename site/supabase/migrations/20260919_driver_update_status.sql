-- Allow drivers to update their own status
drop policy if exists "Drivers update own status" on public.drivers;
create policy "Drivers update own status" on public.drivers
  for update
  using (auth_id = auth.uid())
  with check (auth_id = auth.uid());
