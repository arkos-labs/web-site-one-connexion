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
