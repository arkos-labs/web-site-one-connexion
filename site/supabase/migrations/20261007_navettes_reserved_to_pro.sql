-- Les navettes sont réservées aux comptes professionnels.
-- Un compte pro est créé avec un SIRET (14 chiffres) dans raw_user_meta_data ; un particulier n'en a pas.
-- L'interface masque déjà les navettes aux particuliers : on verrouille aussi côté base.

create or replace function public.is_pro_account() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and coalesce(u.raw_user_meta_data ->> 'siret', '') ~ '^\d{14}$'
  );
$$;

revoke execute on function public.is_pro_account() from public, anon;
grant execute on function public.is_pro_account() to authenticated;

-- Même garde que 20260919_secure_orders_navettes_flows.sql, avec le contrôle pro à l'INSERT.
create or replace function public.navettes_guard() returns trigger language plpgsql set search_path = public as $$
declare
  driver_fields text[] := array['updated_at','status','point_progress','picked_up_at','delivered_at','driver_accepted_at',
                                'delivery_recipient','delivery_department','delivery_comment','delivery_photo_url'];
begin
  if current_user not in ('anon','authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    if not public.is_pro_account() then
      raise exception 'Les navettes sont reservees aux comptes professionnels';
    end if;
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

-- navettes_guard est un trigger : pas d'appel direct via l'API (comme 20260919_revoke_trigger_functions_rpc.sql)
revoke execute on function public.navettes_guard() from public, anon, authenticated;
