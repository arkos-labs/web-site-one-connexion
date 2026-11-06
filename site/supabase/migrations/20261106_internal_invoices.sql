-- Factures internes (sans Stripe) : émises à la demande de l'admin, avant ou après le paiement
-- (espèces, virement…). Numérotation séquentielle sans trou par année (F<AAAA>-<n sur 5 chiffres>).
-- Écriture : uniquement la route admin (clé service). Lecture : aucun accès direct client.
create table if not exists public.internal_invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  order_id uuid not null unique references public.orders(id) on delete restrict,
  buyer_name text not null,
  buyer_address text,
  buyer_siret text,
  amount_ht numeric(10,2) not null,
  vat_amount numeric(10,2) not null,
  amount_ttc numeric(10,2) not null,
  issued_at date not null default ((now() at time zone 'Europe/Paris')::date),
  created_at timestamptz not null default now()
);

alter table public.internal_invoices enable row level security;
revoke all on public.internal_invoices from anon, authenticated;

-- Émission atomique : verrou, numéro suivant de l'année, insertion, dans une seule transaction.
-- Une seule facture par course (contrainte unique sur order_id) : rappeler la fonction renvoie l'existante.
create or replace function public.issue_internal_invoice(
  p_order_id uuid,
  p_buyer_name text,
  p_buyer_address text,
  p_buyer_siret text,
  p_amount_ttc numeric
) returns public.internal_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  yr text := to_char((now() at time zone 'Europe/Paris'), 'YYYY');
  last_n int;
  existing public.internal_invoices;
  result public.internal_invoices;
  ht numeric(10,2);
begin
  perform pg_advisory_xact_lock(hashtext('internal_invoice_number'));

  select * into existing from public.internal_invoices where order_id = p_order_id;
  if found then
    return existing;
  end if;

  select coalesce(max(substring(number from '(\d+)$')::int), 0) into last_n
    from public.internal_invoices where number like 'F' || yr || '-%';

  ht := round(p_amount_ttc / 1.2, 2);

  insert into public.internal_invoices (number, order_id, buyer_name, buyer_address, buyer_siret, amount_ht, vat_amount, amount_ttc)
  values ('F' || yr || '-' || lpad((last_n + 1)::text, 5, '0'), p_order_id, p_buyer_name, p_buyer_address, p_buyer_siret,
          ht, round(p_amount_ttc, 2) - ht, round(p_amount_ttc, 2))
  returning * into result;

  return result;
end;
$$;

revoke all on function public.issue_internal_invoice(uuid, text, text, text, numeric) from public, anon, authenticated;
grant execute on function public.issue_internal_invoice(uuid, text, text, text, numeric) to service_role;
