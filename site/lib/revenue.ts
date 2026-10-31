/**
 * lib/revenue.ts
 * Quelles courses comptent dans le chiffre d'affaires de l'admin.
 * - Pro (payment_mode « fin_de_mois ») : facturé à 30 jours, compté tant que le débit n'a pas échoué ou été annulé.
 * - Particulier (payment_mode « carte ») : compté seulement une fois payé.
 * - Course saisie par l'admin : comptée, comme dans la liste des courses.
 * Tout le reste (pas de mode de paiement, paiement non abouti) n'est pas compté.
 */
export type RevenueOrder = {
  payment_mode?: string | null;
  billing_status?: string | null;
  source?: string | null;
};

export function isRevenueOrder(o: RevenueOrder): boolean {
  if (o.source === "admin") return true;
  if (o.payment_mode === "fin_de_mois") return o.billing_status !== "echec" && o.billing_status !== "annule";
  if (o.payment_mode === "carte") return o.billing_status === "paye";
  return false;
}
