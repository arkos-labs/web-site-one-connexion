import { createHash } from "node:crypto";

const BOT_UA = /bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|axios/i;

export const parisDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** Identifiant anonyme du visiteur du jour (IP + navigateur + date + sel), sans cookie. Null pour les bots. */
export function visitorHash(req: Request): { date: string; hash: string } | null {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return null;
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const date = parisDate();
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const hash = createHash("sha256").update(`${date}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 32);
  return { date, hash };
}
