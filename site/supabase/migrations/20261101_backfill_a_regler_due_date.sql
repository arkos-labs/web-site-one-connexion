-- Les factures « à régler » émises avant la correction de lib/deliver-order-invoice.ts
-- n'avaient pas de payment_due_date : l'admin affichait « À régler » sans date.
-- On complète avec la date d'émission (livraison ou création) + 30 jours, comme la facture Stripe.
update public.orders
set payment_due_date = (coalesce(delivered_at, created_at)::date + 30)
where billing_status = 'a_regler'
  and payment_due_date is null;
