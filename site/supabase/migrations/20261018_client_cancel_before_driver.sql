-- Le client ne peut plus annuler dès qu'un chauffeur est attribué à la course.
-- (L'annulation passe par /api/orders/cancel, qui rembourse aussi le paiement carte.)
create or replace function public.orders_guard() returns trigger language plpgsql set search_path = public as $$
declare
  ignored text[] := array['updated_at','status','viewed_at','notification_count'];
begin
  -- appels internes (fonctions securisees, service_role) et admin : libre
  if current_user not in ('anon','authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    new.status := 'en_attente';
    new.payment_status := 'en_attente';
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

  -- client proprietaire : seule l'annulation avant attribution d'un chauffeur est permise
  if (to_jsonb(new) - ignored) is distinct from (to_jsonb(old) - ignored) then
    raise exception 'Le client ne peut pas modifier une commande, seulement l''annuler';
  end if;
  if new.status is distinct from old.status then
    if new.status not in ('annulee','cancelled') then
      raise exception 'Le client peut seulement annuler';
    end if;
    if old.driver_id is not null or old.status not in ('en_attente','pending','confirmee') then
      raise exception 'Annulation impossible : un chauffeur est deja attribue';
    end if;
  end if;
  return new;
end $$;
