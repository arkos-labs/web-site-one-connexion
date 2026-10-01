import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { refreshPinnedDashboard } from "@/lib/telegram-dashboard";

const BOT_UA = /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|axios/i;

const parisDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

// Compte une page vue du site public, sans cookie (cf. migration site_visits).
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return new Response(null, { status: 204 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const date = parisDate();
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const hash = createHash("sha256").update(`${date}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 32);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data: nouveauVisiteur, error } = await supabase.rpc("track_site_visit", { p_date: date, p_hash: hash });
  if (error) {
    console.error("Visit tracking failed:", error.message);
    return new Response(null, { status: 204 });
  }

  // Nouveau visiteur : le compteur du tableau épinglé est mis à jour (édition silencieuse).
  if (nouveauVisiteur) {
    await refreshPinnedDashboard().catch((err) => console.error("Telegram dashboard refresh failed:", err));
  }
  return new Response(null, { status: 204 });
}
