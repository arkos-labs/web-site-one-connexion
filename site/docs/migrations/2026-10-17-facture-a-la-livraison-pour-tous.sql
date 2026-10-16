-- 2026-10-17 — Facture envoyée au client à la livraison, pour tous les parcours.
--  * pro avec compte (30 jours)            -> facture Stripe (lib/issue-invoice.ts)
--  * paiement par carte à la commande      -> facture acquittée (lib/deliver-order-invoice.ts)
--  * pro « fin de mois » carte / RIB        -> facture prélevée à l'échéance par le cron deferred-payments
--  * pro « fin de mois » virement           -> déjà facturé à la commande (IBAN)
-- Déjà appliqué en production.

alter table public.orders add column if not exists invoice_sent_at timestamptz;

create or replace function public.orders_invoice_trigger()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public.sync_order_invoice(new.id);

  begin
    if new.status in ('delivered', 'livree') and new.invoice_sent_at is null
       and (
         new.payment_mode in ('carte', 'fin_de_mois')
         or exists (
           select 1 from public.invoice_items ii
           join public.invoices i on i.id = ii.invoice_id
           where ii.order_id = new.id and i.status = 'en_cours'
         )
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
