/**
 * lib/track-event.ts
 * Envoie une étape du parcours (cf. app/api/event). Ne bloque jamais l'interface : en cas d'échec, rien.
 */
export function trackEvent(event: string, data: { step?: number; detail?: string } = {}) {
  if (typeof window === "undefined") return;
  fetch("/api/event", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, path: window.location.pathname, ...data }),
  }).catch(() => {});
}
