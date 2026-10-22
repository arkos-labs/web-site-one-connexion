-- Facture d'une course à plusieurs livraisons : la ligne nomme l'enlèvement et chaque livraison.
-- Les étapes (orders.stops) sont des points de livraison en plus, avant la livraison finale.
-- Sans étape, le libellé ne change pas : « A → B ».
-- Même format que lib/order-route.ts (factures Stripe émises par le site).

create or replace function public.order_route_label(p_pickup text, p_dropoff text, p_stops jsonb)
returns text
language sql
immutable
set search_path to 'public'
as $function$
  with s as (
    select nullif(trim(coalesce(e->>'address', e #>> '{}')), '') as address, n
    from jsonb_array_elements(case when jsonb_typeof(p_stops) = 'array' then p_stops else '[]'::jsonb end)
         with ordinality as t(e, n)
  ),
  d as (
    select address, row_number() over (order by n) as n
    from (select address, n from s where address is not null
          union all select p_dropoff, 1e9) x
  )
  select case
    when (select count(*) from d) = 1 then p_pickup || ' → ' || p_dropoff
    else 'Enlèvement : ' || p_pickup || ' — '
         || (select string_agg('Livraison ' || n || ' : ' || address, ' — ' order by n) from d)
  end
$function$;

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

  if v_item.id is not null then
    update public.invoice_items ii
    set unit_price = o.price_estimate, total_price = o.price_estimate
    from public.invoices i
    where ii.id = v_item.id and i.id = ii.invoice_id and i.status = 'en_cours';
    perform public.recalc_invoice(v_item.invoice_id);
    return;
  end if;

  insert into public.invoices (client_id, invoice_number, billing_period_start, billing_period_end,
                               invoice_date, due_date, subtotal, tax_amount, total_amount, status)
  values (o.user_id,
          'FA-' || to_char(v_today, 'YYYYMM') || '-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0'),
          v_month_start, (v_month_start + interval '1 month - 1 day')::date,
          v_today, v_today + 30, 0, 0, 0, 'en_cours')
  returning * into v_inv;

  insert into public.invoice_items (invoice_id, item_type, order_id, description, quantity, unit_price, total_price)
  values (v_inv.id, 'order', o.id,
          'Course ' || coalesce(o.tracking_code, left(o.id::text, 8)) || ' — '
            || public.order_route_label(o.pickup_address, o.dropoff_address, to_jsonb(o.stops)),
          1, o.price_estimate, o.price_estimate)
  on conflict (order_id) where order_id is not null do nothing;

  if not found then
    delete from public.invoices where id = v_inv.id;
    return;
  end if;

  perform public.recalc_invoice(v_inv.id);
end $function$;

-- Factures pas encore envoyées au client : libellé corrigé pour les courses à plusieurs livraisons.
-- Une facture déjà préparée sur Stripe (« prete ») se refait depuis la fiche client : « Annuler et refaire ».
update public.invoice_items ii
set description = 'Course ' || coalesce(o.tracking_code, left(o.id::text, 8)) || ' — '
                  || public.order_route_label(o.pickup_address, o.dropoff_address, to_jsonb(o.stops))
from public.orders o, public.invoices i
where ii.order_id = o.id and i.id = ii.invoice_id
  and i.status in ('en_cours', 'prete', 'retenue')
  and jsonb_typeof(to_jsonb(o.stops)) = 'array' and jsonb_array_length(to_jsonb(o.stops)) > 0;
