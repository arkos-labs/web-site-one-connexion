import { createClient } from "@supabase/supabase-js";
import { cleanPath } from "@/lib/clean-path";

// Temps passé sur une page publique, ajouté au total du jour : aucun identifiant de visiteur n'est lu ni stocké.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { path?: unknown; seconds?: unknown } | null;
  const path = cleanPath(body?.path);
  const seconds = typeof body?.seconds === "number" ? Math.round(body.seconds) : NaN;
  if (!path || !Number.isFinite(seconds) || seconds < 1) return new Response(null, { status: 204 });

  const today = new Date().toISOString().slice(0, 10);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.rpc("record_site_time", {
    p_date: today,
    p_path: path,
    p_seconds: Math.min(seconds, 1800),
  });
  if (error) console.error("Time tracking failed:", error.message);
  return new Response(null, { status: 204 });
}
