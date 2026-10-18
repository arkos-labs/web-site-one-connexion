/**
 * lib/saved-payment.ts (navigateur)
 * Moyen de paiement enregistré du client connecté et paiement en 1 clic.
 */
export type SavedMethod = { id: string; type: "card" | "sepa_debit"; label: string; detail: string | null };

export async function fetchSavedMethod(): Promise<SavedMethod | null> {
  try {
    const res = await fetch("/api/payment-method", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).method ?? null;
  } catch {
    return null;
  }
}

export type OneClickResult = { ok: true; paid?: boolean; scheduled?: boolean; method?: string } | { ok: false };

/**
 * Règle la commande avec le moyen enregistré. { ok: false } : pas de moyen enregistré, refus de la
 * banque ou authentification demandée → le client passe par la page Stripe habituelle.
 */
export async function payWithSavedMethod(trackingCode: string, paymentMode: "carte" | "fin_de_mois"): Promise<OneClickResult> {
  try {
    const res = await fetch("/api/orders/pay-saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode, paymentMode }),
    });
    const data = await res.json().catch(() => ({}));
    return data?.ok ? { ok: true, paid: data.paid, scheduled: data.scheduled, method: data.method } : { ok: false };
  } catch {
    return { ok: false };
  }
}
