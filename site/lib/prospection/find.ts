/**
 * lib/prospection/find.ts
 * Pour une entreprise : son site officiel, une adresse générique publique (contact@, accueil@…) et une
 * phrase personnalisée. Recherche web faite par Claude (clé PROSPECTION_ANTHROPIC_API_KEY, réservée à la prospection).
 * Une adresse personnelle (prenom.nom@…) est refusée. Une adresse qui ne correspond pas au site est refusée.
 */
import Anthropic from "@anthropic-ai/sdk";
import { SECTORS, type Company, type Sector } from "@/lib/prospection/sirene";

export type Contact = { website: string | null; email: string | null; pitch: string | null };
const EMPTY: Contact = { website: null, email: null, pitch: null };

const GENERIC = /^(contact|accueil|info|bonjour|hello|secretariat|administration|direction|commercial)@[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function findContact(company: Company, sector: Sector): Promise<Contact> {
  const key = process.env.PROSPECTION_ANTHROPIC_API_KEY;
  if (!key) return EMPTY;
  const label = SECTORS.find((s) => s.key === sector)!.label;
  const place = [company.postcode, company.city].filter(Boolean).join(" ");
  const client = new Anthropic({ apiKey: key });
  const prompt = `Entreprise : « ${company.name} » (${label}), ${place}, SIREN ${company.siren}.
1. Trouve son site officiel (pas un annuaire).
2. Sur ce site (contact ou mentions légales), cherche une adresse e-mail générique publique : contact@, accueil@, info@, secretariat@ ou commercial@. Ne prends jamais une adresse personnelle (prenom.nom@…). N'invente rien : si tu ne la trouves pas, mets null.
3. Écris une phrase en français, 25 mots maximum, sans formule de politesse, sur le besoin concret de cette entreprise en coursier urgent pour envoyer ou recevoir plis, colis ou échantillons, en lien avec son activité.
Réponds uniquement avec ce JSON : {"website": "https://… ou null", "email": "… ou null", "pitch": "…"}`;
  try {
    const res = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
      messages: [{ role: "user", content: prompt }],
    } as unknown as Anthropic.MessageCreateParamsNonStreaming);
    const text = res.content
      .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text ?? "" : ""))
      .join("\n");
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return EMPTY;
    const data = JSON.parse(json) as { website?: unknown; email?: unknown; pitch?: unknown };

    const website = typeof data.website === "string" && /^https?:\/\/[^\s]+$/.test(data.website) ? data.website : null;
    let email = typeof data.email === "string" && GENERIC.test(data.email.trim()) ? data.email.trim().toLowerCase() : null;
    if (email) {
      // L'adresse doit appartenir au site trouvé.
      const domain = email.split("@")[1];
      const host = website ? new URL(website).hostname.replace(/^www\./, "") : null;
      if (!host || !(domain === host || domain.endsWith(`.${host}`))) email = null;
    }
    const pitch = typeof data.pitch === "string" && data.pitch.trim() ? data.pitch.trim().slice(0, 200) : null;
    return { website, email, pitch };
  } catch {
    return EMPTY;
  }
}
