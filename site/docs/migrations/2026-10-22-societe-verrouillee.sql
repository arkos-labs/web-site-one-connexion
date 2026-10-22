-- 2026-10-22 — Les informations de la société ne se modifient plus par le client une fois remplies.
-- Nom, SIRET et TVA : verrouillés dès qu'ils sont renseignés. Adresse de facturation : verrouillée
-- pour un compte pro (SIRET renseigné). Un champ vide (ou « À remplir ») peut encore être complété.
-- Le client ne touche jamais aux champs internes (client Stripe, compte actif, notes).
-- L'admin et le serveur (clé service, sans auth.uid()) gardent la main.

create or replace function public.clients_lock_company_info()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  filled boolean;
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  -- Champs internes : jamais modifiés par le client.
  new.stripe_customer_id := old.stripe_customer_id;
  new.is_active := old.is_active;
  new.notes := old.notes;

  if (nullif(trim(old.company_name), '') is not null and new.company_name is distinct from old.company_name)
     or (nullif(trim(old.siret), '') is not null and new.siret is distinct from old.siret)
     or (nullif(trim(old.tax_id), '') is not null and new.tax_id is distinct from old.tax_id) then
    raise exception 'Les informations de la société ne peuvent plus être modifiées. Contactez-nous pour les changer.'
      using errcode = 'P0001';
  end if;

  filled := nullif(trim(old.siret), '') is not null
            and nullif(trim(old.billing_address), '') is not null and old.billing_address <> 'À remplir';
  if filled and (new.billing_address is distinct from old.billing_address
                 or new.billing_postal_code is distinct from old.billing_postal_code
                 or new.billing_city is distinct from old.billing_city) then
    raise exception 'L''adresse de facturation ne peut plus être modifiée. Contactez-nous pour la changer.'
      using errcode = 'P0001';
  end if;

  return new;
end $function$;

drop trigger if exists clients_lock_company_info on public.clients;
create trigger clients_lock_company_info
  before update on public.clients
  for each row execute function public.clients_lock_company_info();
