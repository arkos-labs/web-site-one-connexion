-- Tous les tarifs sont TTC (TVA 20 % comprise), pros comme particuliers.
-- Les lignes de facture portent donc des montants TTC : HT = TTC / 1,20, TVA = TTC − HT.
create or replace function public.recalc_invoice(p_invoice_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.invoices i
  set subtotal = round(s.ttc / 1.2, 2),
      tax_amount = s.ttc - round(s.ttc / 1.2, 2),
      total_amount = s.ttc,
      updated_at = now()
  from (select coalesce(sum(total_price), 0) as ttc from public.invoice_items where invoice_id = p_invoice_id) s
  where i.id = p_invoice_id and i.status = 'en_cours';
$$;
