-- Facturation mensuelle : chaque course livrée s'ajoute à la facture du mois du client.
-- Statuts d'une facture : en_cours (mois ouvert) -> emise (envoyée via Stripe) -> payee | echec.

alter table public.invoices
  add column if not exists stripe_invoice_id text,
  add column if not exists hosted_invoice_url text;

alter table public.clients
  add column if not exists stripe_customer_id text;

create unique index if not exists invoices_stripe_invoice_id_key
  on public.invoices (stripe_invoice_id) where stripe_invoice_id is not null;
create unique index if not exists invoices_client_month_key
  on public.invoices (client_id, billing_period_start);
create unique index if not exists invoice_items_order_key
  on public.invoice_items (order_id) where order_id is not null;

create or replace function public.recalc_invoice(p_invoice_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.invoices i
  set subtotal = s.sub,
      tax_amount = round(s.sub * 0.2, 2),
      total_amount = s.sub + round(s.sub * 0.2, 2),
      updated_at = now()
  from (select coalesce(sum(total_price), 0) as sub from public.invoice_items where invoice_id = p_invoice_id) s
  where i.id = p_invoice_id and i.status = 'en_cours';
$$;

create or replace function public.sync_order_invoice(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  v_month_start date := date_trunc('month', now() at time zone 'Europe/Paris')::date;
  v_month_end date;
  v_inv public.invoices%rowtype;
  v_item public.invoice_items%rowtype;
begin
  select * into o from public.orders where id = p_order_id;
  if not found then return; end if;

  select * into v_item from public.invoice_items where order_id = o.id;

  -- Course plus livrée (statut modifié par l'admin) : on la retire tant que la facture est ouverte.
  if o.status not in ('delivered', 'livree') then
    if found then
      delete from public.invoice_items ii using public.invoices i
      where ii.order_id = o.id and i.id = ii.invoice_id and i.status = 'en_cours';
      perform public.recalc_invoice(v_item.invoice_id);
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

  v_month_end := (v_month_start + interval '1 month - 1 day')::date;

  insert into public.invoices (client_id, invoice_number, billing_period_start, billing_period_end,
                               invoice_date, due_date, subtotal, tax_amount, total_amount, status)
  values (o.user_id,
          'FA-' || to_char(v_month_start, 'YYYY-MM') || '-' || upper(substr(replace(o.user_id::text, '-', ''), 1, 8)),
          v_month_start, v_month_end, v_month_end, v_month_end + 30, 0, 0, 0, 'en_cours')
  on conflict (client_id, billing_period_start) do nothing;

  select * into v_inv from public.invoices where client_id = o.user_id and billing_period_start = v_month_start;
  if v_inv.status <> 'en_cours' then return; end if;

  insert into public.invoice_items (invoice_id, item_type, order_id, description, quantity, unit_price, total_price)
  values (v_inv.id, 'order', o.id,
          'Course ' || coalesce(o.tracking_code, left(o.id::text, 8)) || ' — ' || o.pickup_address || ' → ' || o.dropoff_address,
          1, o.price_estimate, o.price_estimate);

  perform public.recalc_invoice(v_inv.id);
end $$;

create or replace function public.orders_invoice_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.sync_order_invoice(new.id);
  return new;
end $$;

drop trigger if exists orders_invoice on public.orders;
create trigger orders_invoice after update of status, price_estimate on public.orders
for each row execute function public.orders_invoice_trigger();

revoke execute on function public.sync_order_invoice(uuid), public.recalc_invoice(uuid), public.orders_invoice_trigger()
  from public, anon, authenticated;

-- Rattrapage des courses déjà livrées.
select public.sync_order_invoice(id) from public.orders where status in ('delivered', 'livree');
