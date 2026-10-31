import { createClient } from "@supabase/supabase-js";
import { visitorHash } from "@/lib/visitor-hash";
import { refreshPinnedDashboard } from "@/lib/telegram-dashboard";

// Événements autorisés : toute autre valeur est refusée.
const EVENTS = new Set([
  "order_open",        // formulaire de commande affiché
  "order_step",        // étape atteinte (step = 1, 2 ou 3)
  "order_error",       // message de validation affiché (detail = message fixe)
  "order_address_pickup",   // adresse d'enlèvement saisie pour la première fois
  "order_address_dropoff",  // adresse de livraison saisie pour la première fois
  "order_submit",      // envoi lancé (passé la validation)
  "order_checkout",    // redirection vers Stripe
  "order_submitted",   // commande enregistrée (virement, ou paiement à 1 clic)
]);

// Enregistre une étape du parcours, sans cookie et sans donnée personnelle (cf. migration site_events).
export async function POST(req: Request) {
  const visitor = visitorHash(req);
  if (!visitor) return new Response(null, { status: 204 });

  let body: { event?: unknown; step?: unknown; path?: unknown; detail?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }
  if (typeof body.event !== "string" || !EVENTS.has(body.event)) {
    return new Response(null, { status: 400 });
  }

  const step = typeof body.step === "number" && body.step >= 1 && body.step <= 3 ? Math.trunc(body.step) : null;
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : null;
  const detail = typeof body.detail === "string" ? body.detail.slice(0, 200) : null;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("site_events").insert({
    event_date: visitor.date,
    visitor_hash: visitor.hash,
    event: body.event,
    step,
    path,
    detail,
  });
  if (error) console.error("Event tracking failed:", error.message);

  // Sans cela, le tableau Telegram ne se met à jour qu'à la prochaine page vue.
  await refreshPinnedDashboard().catch((err) => console.error("Telegram dashboard refresh failed:", err));
  return new Response(null, { status: 204 });
}
