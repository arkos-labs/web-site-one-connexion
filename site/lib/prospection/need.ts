/**
 * lib/prospection/need.ts
 * Une phrase sur le besoin probable de chaque entreprise. Avec la clé IA : une phrase adaptée au nom et
 * à la ville. Sans clé (ou en cas d'erreur) : la phrase fixe du secteur.
 */
import Anthropic from "@anthropic-ai/sdk";
import { SECTORS, type Sector } from "@/lib/prospection/sirene";

export async function needPhrase(sector: Sector, name: string, city: string | null): Promise<string> {
  const fixed = SECTORS.find((s) => s.key === sector)!.need;
  if (!process.env.ANTHROPIC_API_KEY) return fixed;
  try {
    const client = new Anthropic();
    const label = SECTORS.find((s) => s.key === sector)!.label;
    const res = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `Écris une seule phrase en français, de 20 mots au maximum, sur le besoin probable de livraison urgente de l'entreprise « ${name} » (${label}${city ? `, ${city}` : ""}). Pas de nom de personne, pas de guillemets, pas de formule de politesse.`,
        },
      ],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    return text || fixed;
  } catch {
    return fixed;
  }
}
