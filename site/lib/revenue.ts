/**
 * lib/revenue.ts
 * Quelles courses comptent dans le chiffre d'affaires et les listes admin.
 * - Jamais : annulée, paiement échoué (« commande échouée », ni CA ni compte du mois).
 * - Pro (client_type « entreprise ») : facturé à 30 jours, compté tant que le débit n'a pas été annulé.
 * - Particulier (paiement « carte ») : compté seulement une fois payé.
 * - Course saisie par l'admin : comptée.
 */
export type RevenueOrder = {
  status?: string | null;
  client_type?: string | null;
  payment_mode?: string | null;
  billing_status?: string | null;
  source?: string | null;
};

export function isRevenueOrder(o: RevenueOrder): boolean {
  if (o.status === "annulee") return false;
  if (o.billing_status === "echec") return false;
  if (o.source === "admin") return true;
  if (o.client_type === "entreprise" || o.payment_mode === "fin_de_mois") return o.billing_status !== "annule";
  // Particulier : compté une fois payé (le mode de paiement n'est pas toujours renseigné sur les paiements carte).
  return o.billing_status === "paye";
}

/** Commande valide pour le compte « commandes » : ni annulée, ni échouée. */
export function isCountedOrder(o: RevenueOrder): boolean {
  return o.status !== "annulee" && o.billing_status !== "echec";
}
