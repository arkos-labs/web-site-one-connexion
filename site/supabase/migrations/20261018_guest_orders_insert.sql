-- Commande sans compte depuis le site public (modal / formulaire) : le visiteur
-- envoie user_id = null, ce que « Clients insert own orders » refuse.
-- Insertion seule, jamais de relecture ; les triggers orders_guard et
-- orders_payment_guard forcent statut, chauffeur et champs de paiement.
drop policy if exists "Guests insert orders" on public.orders;
create policy "Guests insert orders" on public.orders
  for insert to anon
  with check (user_id is null);
