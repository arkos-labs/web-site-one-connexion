import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { notifyNewContact } from "@/lib/contact-notify";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  // Champ piège : invisible pour un humain, rempli par les robots.
  website: z.string().optional().default(""),
});

// Limite basique par IP (par instance serverless) : 5 messages / 10 min.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Trop de demandes, réessayez plus tard." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { website, ...data } = parsed.data;

  // Robot détecté : on répond OK sans rien enregistrer.
  if (website) return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    company: data.company || null,
    message: data.message,
  });
  if (error) {
    console.error("contact_messages insert failed:", error.message);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
  await notifyNewContact(data);
  return NextResponse.json({ ok: true });
}
