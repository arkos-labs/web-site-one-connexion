-- 2026-10-16 — Facture Stripe par course livrée + données pro à l'inscription.
--
-- 1) Une facture interne par course livrée (au lieu d'une par client et par mois), émise tout de suite
--    par Stripe : un trigger prévient /api/invoices/issue via pg_net dès que la course est livrée.
--    Le cron quotidien /api/cron/monthly-invoices reste en filet de sécurité.
-- 2) Inscription pro : SIRET, TVA, raison sociale et adresse de facturation recopiés dans `clients`.

-- ---------------------------------------------------------------------------
-- 1) Facture par course
-- ---------------------------------------------------------------------------
create extension if not exists pg_net with schema extensions;

-- Plus de facture unique par client et par mois.
drop index if exists public.invoices_client_month_key;

-- Numérotation continue : FA-AAAAMM-00001, FA-AAAAMM-00002...
create sequence if not exists public.invoice_number_seq;

create or replace function public.sync_order_invoice(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  o public.orders%rowtype;
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_month_start date := date_trunc('month', now() at time zone 'Europe/Paris')::date;
  v_inv public.invoices%rowtype;
  v_item public.invoice_items%rowtype;
begin
  select * into o from public.orders where id = p_order_id;
  if not found then return; end if;

  select * into v_item from public.invoice_items where order_id = o.id;

  -- Course plus livrée (statut modifié par l'admin) ou déjà payée via Stripe :
  -- on la retire tant que la facture est ouverte, et on supprime la facture si elle devient vide.
  -- (un particulier paie par carte avant la prise en charge : jamais de facture à émettre pour lui)
  if o.status not in ('delivered', 'livree') or o.payment_mode is not null or o.client_type = 'particulier' then
    if found then
      delete from public.invoice_items ii using public.invoices i
      where ii.order_id = o.id and i.id = ii.invoice_id and i.status = 'en_cours';
      perform public.recalc_invoice(v_item.invoice_id);
      delete from public.invoices
      where id = v_item.invoice_id and status = 'en_cours'
        and not exists (select 1 from public.invoice_items where invoice_id = v_item.invoice_id);
    end if;
    return;
  end if;

  if o.user_id is null or o.price_estimate is null
     or not exists (select 1 from public.clients where id = o.user_id) then
    return;
  end if;

  -- Déjà facturée : on met à jour le prix tant que la facture est ouverte.
  if v_item.id is not null then
    update public.invoice_items ii
    set unit_price = o.price_estimate, total_price = o.price_estimate
    from public.invoices i
    where ii.id = v_item.id and i.id = ii.invoice_id and i.status = 'en_cours';
    perform public.recalc_invoice(v_item.invoice_id);
    return;
  end if;

  -- Une facture par course.
  insert into public.invoices (client_id, invoice_number, billing_period_start, billing_period_end,
                               invoice_date, due_date, subtotal, tax_amount, total_amount, status)
  values (o.user_id,
          'FA-' || to_char(v_today, 'YYYYMM') || '-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0'),
          v_month_start, (v_month_start + interval '1 month - 1 day')::date,
          v_today, v_today + 30, 0, 0, 0, 'en_cours')
  returning * into v_inv;

  insert into public.invoice_items (invoice_id, item_type, order_id, description, quantity, unit_price, total_price)
  values (v_inv.id, 'order', o.id,
          'Course ' || coalesce(o.tracking_code, left(o.id::text, 8)) || ' — ' || o.pickup_address || ' → ' || o.dropoff_address,
          1, o.price_estimate, o.price_estimate)
  on conflict (order_id) where order_id is not null do nothing;

  -- Appel simultané : la course est déjà facturée ailleurs, on retire la facture vide.
  if not found then
    delete from public.invoices where id = v_inv.id;
    return;
  end if;

  perform public.recalc_invoice(v_inv.id);
end $function$;

-- Après synchronisation : course livrée et facturable -> le site émet tout de suite la facture Stripe.
-- Jamais bloquant : une erreur d'appel ne doit pas empêcher la mise à jour de la course.
create or replace function public.orders_invoice_trigger()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.sync_order_invoice(new.id);

  begin
    if new.status in ('delivered', 'livree') and new.payment_mode is null
       and exists (
         select 1 from public.invoice_items ii
         join public.invoices i on i.id = ii.invoice_id
         where ii.order_id = new.id and i.status = 'en_cours'
       ) then
      perform net.http_post(
        url := 'https://www.oneconnexion.com/api/invoices/issue',
        body := jsonb_build_object('order_id', new.id),
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
    end if;
  exception when others then
    null;
  end;

  return new;
end $function$;

-- ---------------------------------------------------------------------------
-- 2) Données pro à l'inscription
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_raw text := lower(coalesce(new.raw_user_meta_data ->> 'role', 'client'));
  v_role user_role;
  v_addr text := nullif(trim(new.raw_user_meta_data ->> 'adresse_facturation'), '');
  v_m text[];
begin
  v_role := case when v_raw in ('driver','courier','chauffeur') then 'driver'::user_role else 'client'::user_role end;
  insert into public.profiles (id, role, full_name, phone)
  values (new.id, v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''))
  on conflict (id) do nothing;

  if v_role = 'client' then
    -- "2 rue X, 75008 PARIS" -> adresse / code postal / ville
    if v_addr is not null then
      v_m := regexp_match(v_addr, '^(.*),\s*(\d{5})\s+(.+)$');
    end if;

    insert into public.clients (id, company_name, siret, tax_id, contact_email, contact_name, contact_phone,
      billing_address, billing_postal_code, billing_city)
    values (new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), nullif(new.raw_user_meta_data ->> 'company', ''),
               nullif(new.raw_user_meta_data ->> 'raison_sociale', ''), ''),
      nullif(new.raw_user_meta_data ->> 'siret', ''),
      nullif(new.raw_user_meta_data ->> 'tva_number', ''),
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      coalesce(v_m[1], v_addr, new.raw_user_meta_data ->> 'billing_address', 'À remplir'),
      coalesce(v_m[2], new.raw_user_meta_data ->> 'billing_postal_code', ''),
      coalesce(v_m[3], new.raw_user_meta_data ->> 'billing_city', ''))
    on conflict (id) do nothing;
  end if;
  return new;
end $function$;

-- Rattrapage des pros déjà inscrits dont la fiche est restée vide.
update public.clients c
set company_name = coalesce(nullif(c.company_name, ''), nullif(u.raw_user_meta_data ->> 'raison_sociale', ''), c.company_name),
    siret        = coalesce(c.siret, nullif(u.raw_user_meta_data ->> 'siret', '')),
    tax_id       = coalesce(c.tax_id, nullif(u.raw_user_meta_data ->> 'tva_number', ''))
from auth.users u
where u.id = c.id
  and (u.raw_user_meta_data ->> 'siret') is not null
  and (c.siret is null or c.company_name = '' or c.tax_id is null);

update public.clients c
set billing_address = s.m[1], billing_postal_code = s.m[2], billing_city = s.m[3]
from (
  select u.id, regexp_match(trim(u.raw_user_meta_data ->> 'adresse_facturation'), '^(.*),\s*(\d{5})\s+(.+)$') as m
  from auth.users u
  where nullif(trim(u.raw_user_meta_data ->> 'adresse_facturation'), '') is not null
) s
where s.id = c.id and s.m is not null and c.billing_address = 'À remplir';
