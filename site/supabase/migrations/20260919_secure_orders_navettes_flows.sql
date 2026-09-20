
-- ===== ORDERS : suppression des regles trop ouvertes =====
drop policy if exists "Enable insert for anonymous users" on orders;
drop policy if exists "anonymous users" on orders;
drop policy if exists "Allow anonymous select" on orders;
drop policy if exists "Users manage own orders" on orders;
create policy "Clients insert own orders" on orders for insert with check (user_id = auth.uid());
create policy "Clients update own orders" on orders for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.orders_guard() returns trigger language plpgsql set search_path = public as $$
declare
  ignored text[] := array['updated_at','status','viewed_at','notification_count'];
begin
  -- appels internes (fonctions securisees, service_role) et admin : libre
  if current_user not in ('anon','authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    new.status := 'en_attente';
    new.driver_id := null; new.assigned_at := null; new.driver_accepted_at := null;
    new.picked_up_at := null; new.delivered_at := null;
    return new;
  end if;

  -- chauffeur de la course
  if old.driver_id = auth.uid() then
    if new.user_id is distinct from old.user_id or new.driver_id is distinct from old.driver_id
       or new.price_estimate is distinct from old.price_estimate or new.tracking_code is distinct from old.tracking_code then
      raise exception 'Le chauffeur ne peut pas modifier le client, le chauffeur, le prix ou le code de suivi';
    end if;
    if new.status is distinct from old.status and new.status not in ('driver_accepted','in_progress','picked_up','delivered') then
      raise exception 'Statut non autorise pour le chauffeur';
    end if;
    return new;
  end if;

  -- client proprietaire : seule l'annulation avant enlevement est permise
  if (to_jsonb(new) - ignored) is distinct from (to_jsonb(old) - ignored) then
    raise exception 'Le client ne peut pas modifier une commande, seulement l''annuler';
  end if;
  if new.status is distinct from old.status then
    if new.status not in ('annulee','cancelled') then
      raise exception 'Le client peut seulement annuler';
    end if;
    if old.status not in ('en_attente','pending','confirmee','assigned','driver_accepted') then
      raise exception 'Annulation impossible : le colis est deja enleve';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists orders_guard on orders;
create trigger orders_guard before insert or update on orders for each row execute function public.orders_guard();

-- ===== NAVETTES =====
drop policy if exists "Enable all for authenticated users" on navettes;
create policy "Clients insert own navettes" on navettes for insert with check (user_id = auth.uid());
create policy "Clients update own navettes" on navettes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Clients delete own navettes" on navettes for delete using (user_id = auth.uid());

create or replace function public.navettes_guard() returns trigger language plpgsql set search_path = public as $$
declare
  driver_fields text[] := array['updated_at','status','point_progress','picked_up_at','delivered_at','driver_accepted_at',
                                'delivery_recipient','delivery_department','delivery_comment','delivery_photo_url'];
begin
  if current_user not in ('anon','authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    new.status := 'en_attente';
    new.driver_id := null; new.last_dispatch_date := null; new.last_dispatch_driver_id := null;
    return new;
  end if;

  -- chauffeur : seulement la progression de la tournee
  if old.driver_id = auth.uid() and old.user_id is distinct from auth.uid() then
    if (to_jsonb(new) - driver_fields) is distinct from (to_jsonb(old) - driver_fields) then
      raise exception 'Le chauffeur peut seulement mettre a jour la progression de la navette';
    end if;
    if new.status is distinct from old.status then raise exception 'Le chauffeur ne peut pas changer le statut'; end if;
    return new;
  end if;

  -- client : pas de dispatch, pas de progression, pas d'auto-activation
  if new.driver_id is distinct from old.driver_id or new.last_dispatch_date is distinct from old.last_dispatch_date
     or new.last_dispatch_driver_id is distinct from old.last_dispatch_driver_id
     or new.point_progress is distinct from old.point_progress or new.picked_up_at is distinct from old.picked_up_at
     or new.delivered_at is distinct from old.delivered_at or new.driver_accepted_at is distinct from old.driver_accepted_at then
    raise exception 'Le client ne peut pas modifier le dispatch ou la progression';
  end if;
  if new.status is distinct from old.status then
    if old.status = 'en_attente' or new.status not in ('active','inactive') then
      raise exception 'La navette doit d''abord etre confirmee par One Connexion';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists navettes_guard on navettes;
create trigger navettes_guard before insert or update on navettes for each row execute function public.navettes_guard();

-- ===== Desistement chauffeur (course ou navette) =====
create or replace function public.driver_decline(p_type text, p_id uuid, p_driver_name text default null)
returns void language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if p_type = 'navette' then
    update navettes set driver_id = null, last_dispatch_date = null, driver_accepted_at = null, picked_up_at = null,
      point_progress = '{}'::jsonb, updated_at = now()
    where id = p_id and driver_id = auth.uid();
  else
    update orders set status = 'en_attente', driver_id = null, refused_by_driver = p_driver_name,
      picked_up_at = null, driver_accepted_at = null, pickup_photo_url = null, delivery_photo_url = null,
      delivery_signature_url = null, updated_at = now()
    where id = p_id and driver_id = auth.uid() and status in ('assigned','driver_accepted','pending');
  end if;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Desistement impossible (mission non assignee a vous ou deja enlevee)'; end if;
end $$;
revoke all on function public.driver_decline(text, uuid, text) from public, anon;
grant execute on function public.driver_decline(text, uuid, text) to authenticated;

-- ===== Historique d'une navette livree =====
create or replace function public.record_navette_delivery(p_navette_id uuid, p_recipient text, p_department text,
  p_comment text, p_photo_url text default null, p_point_progress jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare nv navettes; new_id uuid;
begin
  select * into nv from navettes where id = p_navette_id and driver_id = auth.uid();
  if not found then raise exception 'Navette non assignee a vous'; end if;
  insert into orders (user_id, driver_id, status, pickup_address, dropoff_address, stops, notes, price_estimate,
    delivered_at, picked_up_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url, point_progress)
  values (nv.user_id, nv.driver_id, 'delivered', coalesce(nv.pickup_address,'-'), coalesce(nv.dropoff_address,'-'),
    coalesce(nv.stops,'[]'::jsonb), 'Navette : ' || coalesce(nv.name,''), nv.estimated_price,
    now(), nv.picked_up_at, p_recipient, p_department, p_comment, p_photo_url, coalesce(p_point_progress,'{}'::jsonb))
  returning id into new_id;
  return new_id;
end $$;
revoke all on function public.record_navette_delivery(uuid, text, text, text, text, jsonb) from public, anon;
grant execute on function public.record_navette_delivery(uuid, text, text, text, text, jsonb) to authenticated;

-- ===== Infos chauffeur visibles par le client de la course =====
create or replace function public.get_mission_driver(p_type text, p_id uuid)
returns table(name text, phone text, vehicle text) language sql stable security definer set search_path = public as $$
  select d.name, d.phone, d.vehicle from drivers d
  where d.auth_id = (
    case when p_type = 'navette' then (select n.driver_id from navettes n where n.id = p_id and (n.user_id = auth.uid() or public.is_admin()))
         else (select o.driver_id from orders o where o.id = p_id and (o.user_id = auth.uid() or public.is_admin())) end)
  limit 1;
$$;
revoke all on function public.get_mission_driver(text, uuid) from public, anon;
grant execute on function public.get_mission_driver(text, uuid) to authenticated;

-- ===== Arrets de navette lisibles par le chauffeur =====
drop policy if exists navette_stops_read_driver on navette_stops;
create policy navette_stops_read_driver on navette_stops for select
  using (exists (select 1 from navettes n where n.id = navette_stops.navette_id and n.driver_id = auth.uid()));

-- ===== Roles chauffeurs =====
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_raw text := lower(coalesce(new.raw_user_meta_data ->> 'role', 'client'));
  v_role user_role;
begin
  -- jamais d'admin a l'inscription ; 'courier' = chauffeur
  v_role := case when v_raw in ('driver','courier','chauffeur') then 'driver'::user_role else 'client'::user_role end;
  insert into public.profiles (id, role, full_name, phone)
  values (new.id, v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''))
  on conflict (id) do nothing;
  if v_role = 'client' then
    insert into public.clients (id, company_name, contact_email, contact_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'company_name', ''), coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

update profiles set role = 'driver' where role = 'client' and id in (select auth_id from drivers where auth_id is not null);
