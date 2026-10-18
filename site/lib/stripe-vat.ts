import type Stripe from 'stripe';

// Taux de TVA française à 20 % côté Stripe (créé au premier besoin, puis réutilisé).
// Tous les tarifs sont TTC (pros et particuliers) : la TVA est « dont », comprise dans le prix.
export async function vatRateId(stripe: Stripe): Promise<string> {
  const inclusive = true;
  const rates = await stripe.taxRates.list({ active: true, limit: 100 });
  const existing = rates.data.find((r) => r.percentage === 20 && r.inclusive === inclusive && r.country === 'FR');
  if (existing) return existing.id;
  const created = await stripe.taxRates.create({
    display_name: 'TVA',
    percentage: 20,
    inclusive,
    country: 'FR',
    jurisdiction: 'FR',
  });
  return created.id;
}
