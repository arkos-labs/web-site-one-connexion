-- Paiement des pros : carte tout de suite, ou carte enregistrée débitée 30 jours après la commande.
-- payment_status : a_debiter (en attente des 30 jours) -> paye | echec ; annule si la course est annulée.
-- ATTENTION : payment_status existait déjà en prod ; remplacé par billing_status dans 20261004b_fix_payment_status.
-- Colonnes remplies uniquement côté serveur (webhook Stripe, cron) avec la clé service_role.

alter table public.orders
  add column if not exists payment_mode text,
  add column if not exists payment_status text,
  add column if not exists amount_due numeric(10, 2),
  add column if not exists payment_due_date date,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text,
  add column if not exists stripe_invoice_id text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_deferred_due_idx
  on public.orders (payment_due_date) where payment_status = 'a_debiter';
create unique index if not exists orders_stripe_invoice_id_key
  on public.orders (stripe_invoice_id) where stripe_invoice_id is not null;

-- Un visiteur ou un client ne peut pas écrire ces colonnes lui-même (sinon il pourrait
-- se déclarer payé ou faire débiter un autre client).
create or replace function public.orders_payment_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    new.payment_mode := null; new.payment_status := null; new.amount_due := null;
    new.payment_due_date := null; new.stripe_customer_id := null; new.stripe_payment_method_id := null;
    new.stripe_invoice_id := null; new.paid_at := null;
  else
    new.payment_mode := old.payment_mode; new.payment_status := old.payment_status; new.amount_due := old.amount_due;
    new.payment_due_date := old.payment_due_date; new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_payment_method_id := old.stripe_payment_method_id;
    new.stripe_invoice_id := old.stripe_invoice_id; new.paid_at := old.paid_at;
  end if;
  return new;
end $$;

drop trigger if exists orders_payment_guard on public.orders;
create trigger orders_payment_guard before insert or update on public.orders
for each row execute function public.orders_payment_guard();

revoke execute on function public.orders_payment_guard() from public, anon, authenticated;

-- Une course payée par carte à la commande (payment_mode 'carte') ou débitée seule à J+30
-- (payment_mode 'fin_de_mois') est déjà réglée via Stripe : elle ne doit jamais entrer
-- dans la facture mensuelle, sinon le client paierait deux fois.
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

  -- Course plus livrée (statut modifié par l'admin) ou déjà payée via Stripe :
  -- on la retire tant que la facture est ouverte.
  if o.status not in ('delivered', 'livree') or o.payment_mode is not null then
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

-- Re-synchroniser aussi quand le webhook Stripe enregistre le mode de paiement.
drop trigger if exists orders_invoice on public.orders;
create trigger orders_invoice after update of status, price_estimate, payment_mode on public.orders
for each row execute function public.orders_invoice_trigger();

revoke execute on function public.sync_order_invoice(uuid) from public, anon, authenticated;
