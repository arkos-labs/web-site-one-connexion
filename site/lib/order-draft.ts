/**
 * lib/order-draft.ts
 * Brouillon de commande gardé dans l'onglet (sessionStorage) avant la redirection vers Stripe :
 * si le client revient en arrière pour corriger, le formulaire est rempli comme il l'avait laissé.
 * Effacé à la commande réussie ; ignoré au bout de 2 h.
 */
const KEY = "oc-order-draft";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type OrderDraft = {
  source: "modal" | "form";
  trackingCode: string;
  checkoutSessionId: string | null;
  savedAt: number;
  values: Record<string, any>;
};

export function saveOrderDraft(d: Omit<OrderDraft, "savedAt">) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...d, savedAt: Date.now() })); } catch {}
}

export function loadOrderDraft(): OrderDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as OrderDraft;
    if (!d?.values || Date.now() - d.savedAt > MAX_AGE_MS) { sessionStorage.removeItem(KEY); return null; }
    return d;
  } catch { return null; }
}

export function clearOrderDraft() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

/** Identifiant de la session Checkout dans son URL (…/pay/cs_live_xxx#…). */
export const checkoutSessionIdFromUrl = (url: string) => url.match(/\/(cs_(?:live|test)_[A-Za-z0-9]+)/)?.[1] ?? null;

/** Le client revient de Stripe : bouton « retour » de Stripe (?commande_annulee) ou flèche du navigateur. */
export function cameBackFromCheckout(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has("commande_annulee")) return true;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === "back_forward";
  } catch { return false; }
}

/** Annule la commande non payée et sa page de paiement Stripe (le client va en refaire une corrigée). */
export function abandonCheckout(d: OrderDraft) {
  fetch("/api/orders/abandon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackingCode: d.trackingCode, sessionId: d.checkoutSessionId }),
    keepalive: true,
  }).catch(() => {});
}
