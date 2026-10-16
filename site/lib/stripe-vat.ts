import type Stripe from 'stripe';

// Taux de TVA française à 20 % côté Stripe (créé au premier besoin, puis réutilisé).
// - exclusif (défaut) : prix HT, la TVA s'ajoute (pros).
// - inclusif : le prix affiché est TTC, la TVA est « dont » (particuliers).
export async function vatRateId(stripe: Stripe, inclusive = false): Promise<string> {
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
