/**
 * Itinéraire d'une course pour les libellés de facture.
 * Sans étape : « A → B ». Avec des étapes (orders.stops), ce sont des points de livraison en plus :
 * « Enlèvement : A — Livraison 1 : S1 — Livraison 2 : B ».
 * Même format que public.order_route_label() côté base (factures du compte entreprise).
 */
export function orderRouteLabel(o: { pickup_address: string; dropoff_address: string; stops?: unknown }): string {
  const stops = (Array.isArray(o.stops) ? o.stops : [])
    .map((s: any) => String(s?.address ?? s ?? "").trim())
    .filter(Boolean);
  if (!stops.length) return `${o.pickup_address} → ${o.dropoff_address}`;
  const deliveries = [...stops, o.dropoff_address].map((a, i) => `Livraison ${i + 1} : ${a}`);
  return [`Enlèvement : ${o.pickup_address}`, ...deliveries].join(" — ");
}
