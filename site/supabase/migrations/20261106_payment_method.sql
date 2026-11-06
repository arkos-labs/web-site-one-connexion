-- Mode de paiement hors Stripe (espèces, virement, carte, autre), renseigné par l'admin
-- quand il marque une course ou une facture payée. NULL = mode non renseigné (comportement inchangé).
alter table public.orders add column if not exists payment_method text;
alter table public.invoices add column if not exists payment_method text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('especes', 'virement', 'carte', 'autre'));

alter table public.invoices drop constraint if exists invoices_payment_method_check;
alter table public.invoices add constraint invoices_payment_method_check
  check (payment_method is null or payment_method in ('especes', 'virement', 'carte', 'autre'));
