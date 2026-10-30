import { createClient } from "@supabase/supabase-js";
import { refreshPinnedDashboard } from "@/lib/telegram-dashboard";
import { visitorHash } from "@/lib/visitor-hash";

// Adresse d'une page publique : chemin seul, sans paramètres ni espace admin.
const cleanPath = (value: unknown) => {
  if (typeof value !== "string" || value.length > 120) return null;
  if (!/^\/[a-z0-9\/_-]*$/i.test(value)) return null;
  if (/^\/(admin|dashboard|telegram)(\/|$)/.test(value)) return null;
  return value;
};

// Compte une page vue du site public, sans cookie (cf. migration site_visits).
export async function POST(req: Request) {
  const visitor = visitorHash(req);
  if (!visitor) return new Response(null, { status: 204 });
  const { date, hash } = visitor;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.rpc("track_site_visit", { p_date: date, p_hash: hash });
  if (error) {
    console.error("Visit tracking failed:", error.message);
    return new Response(null, { status: 204 });
  }

  // Page vue détaillée (adresse de la page) pour le parcours : cf. lib/telegram-dashboard.ts.
  const path = await req.json().then((b: { path?: unknown }) => cleanPath(b.path)).catch(() => null);
  if (path) {
    await supabase.from("site_events").insert({ event_date: date, visitor_hash: hash, event: "page_view", path, detail: path });
  }

  // Chaque page vue met à jour visites + pages vues du tableau épinglé (édition silencieuse).
  await refreshPinnedDashboard().catch((err) => console.error("Telegram dashboard refresh failed:", err));
  return new Response(null, { status: 204 });
}
