-- Correctif de 20261004_deferred_payment : orders.payment_status existait déjà (NOT NULL, avec
-- valeur par défaut) et le trigger orders_payment_guard la remettait à NULL à chaque insertion,
-- ce qui bloquait toutes les commandes. On laisse cette ancienne colonne intacte et le suivi
-- du débit à 30 jours passe sur billing_status : a_debiter -> paye | echec | annule.

alter table public.orders add column if not exists billing_status text;

drop index if exists public.orders_deferred_due_idx;
create index if not exists orders_deferred_due_idx
  on public.orders (payment_due_date) where billing_status = 'a_debiter';

create or replace function public.orders_payment_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then return new; end if;

  if tg_op = 'INSERT' then
    new.payment_mode := null; new.billing_status := null; new.amount_due := null;
    new.payment_due_date := null; new.stripe_customer_id := null; new.stripe_payment_method_id := null;
    new.stripe_invoice_id := null; new.paid_at := null;
  else
    new.payment_mode := old.payment_mode; new.billing_status := old.billing_status; new.amount_due := old.amount_due;
    new.payment_due_date := old.payment_due_date; new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_payment_method_id := old.stripe_payment_method_id;
    new.stripe_invoice_id := old.stripe_invoice_id; new.paid_at := old.paid_at;
  end if;
  return new;
end $$;

revoke execute on function public.orders_payment_guard() from public, anon, authenticated;
