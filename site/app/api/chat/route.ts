/**
 * app/api/chat/route.ts
 * Assistant du site : répond aux visiteurs à partir de lib/chatbot/knowledge.ts.
 * Sécurité : clé API côté serveur uniquement, aucune donnée client accessible, messages limités
 * en nombre et en taille, limite par IP, requêtes acceptées seulement depuis le site.
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/chatbot/knowledge";
import { calculatePrice, isServedAddress, type ServiceLevel } from "@/lib/pricing";
import { EMAIL, PHONE_DISPLAY } from "@/lib/site-content";

const MODEL = "claude-opus-5-5";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(20)
    .refine((m) => m[0].role === "user" && m[m.length - 1].role === "user"),
});

// Limite par IP (par instance serverless) : 20 messages / 10 min.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

/** Refuse les appels venant d'un autre site (le navigateur envoie toujours Origin sur un POST). */
function fromOtherSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}

const FALLBACK = `Je ne peux pas répondre pour le moment. Appelez-nous au ${PHONE_DISPLAY} (lundi au samedi, 9 h - 19 h) ou écrivez à ${EMAIL}.`;

const DELAIS: Record<string, ServiceLevel> = { normal: "standard", urgent: "urgent", super: "flash" };

const tools: Anthropic.Beta.BetaTool[] = [
  {
    name: "estimer_prix",
    description:
      "Calcule le prix TTC d'une course ONE CONNEXION entre deux adresses d'Île-de-France (une ville ou un code postal suffit). À utiliser dès que le visiteur donne un départ et une arrivée.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        depart: { type: "string", description: "Adresse, ville ou code postal d'enlèvement" },
        arrivee: { type: "string", description: "Adresse, ville ou code postal de livraison" },
        delai: { type: "string", enum: ["normal", "urgent", "super"], description: "normal = 3 h, urgent = 1 h 30, super = 1 h" },
      },
      required: ["depart", "arrivee", "delai"],
      additionalProperties: false,
    },
  },
];

function estimerPrix(input: unknown): string {
  const parsed = z
    .object({ depart: z.string().max(200), arrivee: z.string().max(200), delai: z.enum(["normal", "urgent", "super"]) })
    .safeParse(input);
  if (!parsed.success) return "Entrée invalide.";
  const { depart, arrivee, delai } = parsed.data;
  const unserved = [depart, arrivee].filter((a) => !isServedAddress(a));
  if (unserved.length) {
    return `Adresse non reconnue ou hors Île-de-France : ${unserved.join(", ")}. Demander la ville ou le code postal ; hors Île-de-France, la course n'est pas desservie.`;
  }
  const prix = calculatePrice(depart, arrivee, DELAIS[delai]);
  return `Prix estimé : ${prix.toFixed(2).replace(".", ",")} € TTC (délai ${delai}).`;
}

export async function POST(req: Request) {
  if (fromOtherSite(req)) return NextResponse.json({ error: "Interdit." }, { status: 403 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ reply: `Vous avez envoyé beaucoup de messages. Pour continuer, appelez le ${PHONE_DISPLAY}.` }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message invalide." }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ reply: FALLBACK });

  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = parsed.data.messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    // Au plus 3 tours : la question, un calcul de prix éventuel, la réponse.
    for (let turn = 0; turn < 3; turn++) {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools,
        messages,
      });

      if (response.stop_reason === "refusal") return NextResponse.json({ reply: FALLBACK });

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = response.content
          .filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use")
          .map((b) => ({
            type: "tool_result",
            tool_use_id: b.id,
            content: b.name === "estimer_prix" ? estimerPrix(b.input) : "Outil inconnu.",
          }));
        messages.push({ role: "user", content: results });
        continue;
      }

      const text = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return NextResponse.json({ reply: text || FALLBACK });
    }
    return NextResponse.json({ reply: FALLBACK });
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error("chat: API error", error.status, error.message);
    else console.error("chat: error", error);
    return NextResponse.json({ reply: FALLBACK });
  }
}
