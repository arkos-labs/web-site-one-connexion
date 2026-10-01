// Prévient le bot Telegram qu'une commande vient d'être créée (alerte + tableau de bord).
// Sans attente ni échec bloquant : keepalive laisse partir la requête même si la page
// redirige ensuite vers Stripe.
export function notifyNewOrder() {
  fetch("/api/notify/telegram", { method: "POST", keepalive: true }).catch(() => {});
}
