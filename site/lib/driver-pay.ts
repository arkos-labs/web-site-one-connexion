/**
 * lib/driver-pay.ts
 * Part du chauffeur sur une course : 35 % du prix HT, jamais moins de 10 €.
 * L'admin peut fixer un autre montant à la main (orders.driver_pay), qui remplace la règle.
 */
export const DRIVER_SHARE = 0.35;
export const DRIVER_MIN_PAY = 10;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Montant par défaut pour une course à `priceTTC` € TTC. */
export function defaultDriverPay(priceTTC: number): number {
  if (!(priceTTC > 0)) return 0;
  return round2(Math.max(DRIVER_MIN_PAY, (priceTTC / 1.2) * DRIVER_SHARE));
}

/** Montant du chauffeur : celui saisi par l'admin, sinon la règle. `manual` dit lequel. */
export function driverPayOf(priceTTC: number, saved: number | string | null | undefined): { amount: number; manual: boolean } {
  if (saved !== null && saved !== undefined && saved !== "") return { amount: Number(saved), manual: true };
  return { amount: defaultDriverPay(priceTTC), manual: false };
}

/** Estimation des frais Stripe d'un paiement par carte : 1,5 % + 0,25 €. */
export const stripeFeeEstimate = (priceTTC: number) => (priceTTC > 0 ? round2(priceTTC * 0.015 + 0.25) : 0);

/** Impôt sur les sociétés, taux réduit des PME (15 %). */
export const CORPORATE_TAX = 0.15;

/**
 * Ce qui reste vraiment à la société sur une course (estimation) : prix HT, moins la part du chauffeur,
 * moins les frais Stripe, moins l'impôt sur les sociétés. Pas d'URSSAF : la SAS ne verse pas de salaire.
 */
export function companyNet(priceTTC: number, driverPay: number): number {
  const beforeTax = priceTTC / 1.2 - driverPay - stripeFeeEstimate(priceTTC);
  return round2(beforeTax > 0 ? beforeTax * (1 - CORPORATE_TAX) : beforeTax);
}
