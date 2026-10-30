import { createClient } from "@supabase/supabase-js";
import { refreshPinnedDashboard } from "@/lib/telegram-dashboard";
import { visitorHash } from "@/lib/visitor-hash";

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

  // Chaque page vue met à jour visites + pages vues du tableau épinglé (édition silencieuse).
  await refreshPinnedDashboard().catch((err) => console.error("Telegram dashboard refresh failed:", err));
  return new Response(null, { status: 204 });
}
