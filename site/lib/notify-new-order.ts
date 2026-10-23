// Prévient le bot Telegram qu'une commande vient d'être créée (alerte + tableau de bord).
// Avec le code de suivi d'une commande pro : envoie aussi au client l'e-mail de confirmation
// (le particulier le reçoit après son paiement, depuis le webhook Stripe).
// Sans attente ni échec bloquant : keepalive laisse partir la requête même si la page
// redirige ensuite vers Stripe.
export function notifyNewOrder(trackingCode?: string) {
  fetch("/api/notify/telegram", { method: "POST", keepalive: true }).catch(() => {});
  if (trackingCode) {
    fetch("/api/orders/confirm", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode }),
    }).catch(() => {});
  }
}
