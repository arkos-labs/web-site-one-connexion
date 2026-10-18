-- Les particuliers paient uniquement par carte : une commande « entreprise » (facturée à 30 jours)
-- n'est acceptée que si un SIRET la justifie. Sinon, n'importe quel compte pourrait insérer
-- directement une commande « entreprise » et recevoir une facture au lieu de payer par carte.
--
-- SIRET accepté : celui saisi sur la commande, celui du compte (clients.siret) ou celui donné
-- à l'inscription (métadonnées du compte). Ne concerne que les requêtes venant du site
-- (rôles anon et authenticated) ; l'admin, le service et l'éditeur SQL ne sont pas bloqués.

create or replace function public.orders_check_entreprise_siret()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_type is distinct from 'entreprise' then
    return new;
  end if;
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;
  if nullif(trim(coalesce(new.siret, '')), '') is not null then
    return new;
  end if;
  if new.user_id is not null and auth.uid() = new.user_id and (
       exists (select 1 from public.clients c where c.id = new.user_id and nullif(trim(coalesce(c.siret, '')), '') is not null)
    or exists (select 1 from auth.users u where u.id = new.user_id and nullif(trim(coalesce(u.raw_user_meta_data->>'siret', '')), '') is not null)
  ) then
    return new;
  end if;
  raise exception 'Commande professionnelle impossible sans SIRET : les particuliers paient par carte.'
    using errcode = 'check_violation';
end;
$$;

drop trigger if exists orders_check_entreprise_siret on public.orders;
create trigger orders_check_entreprise_siret
  before insert or update of client_type, siret on public.orders
  for each row execute function public.orders_check_entreprise_siret();
