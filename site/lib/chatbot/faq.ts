/**
 * lib/chatbot/faq.ts
 * Réponse sans IA à partir de la banque lib/chatbot/qa-bank.ts : on compare les mots de la question
 * (sans accents, sans mots vides, radicaux de 5 lettres) avec chaque formulation, et on garde la meilleure.
 * Chaque formulation de la banque est déclinée en variantes par synonymes (GROUPS), 10 au plus par question.
 */
import { norm, type Choice } from "@/lib/chatbot/quick-questions";
import { QA } from "@/lib/chatbot/qa-bank";

const STOP = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "je", "tu", "il", "on", "vous", "nous", "et", "ou", "a", "au", "aux",
  "en", "pour", "est", "ce", "que", "qu", "qui", "dans", "sur", "mon", "ma", "mes", "votre", "vos", "notre", "nos", "y",
  "t", "l", "d", "s", "c", "m", "ca", "suis", "etes", "pas", "si", "par", "avec", "svp", "bien", "ici", "moi",
]);

/** Mots interchangeables pour un visiteur : une formulation avec l'un suggère les autres. */
const GROUPS: string[][] = [
  ["livrer", "livrez", "livraison", "envoyer", "envoi", "déposer", "transporter"],
  ["prix", "tarif", "tarifs", "coût", "combien"],
  ["annuler", "annulation", "supprimer", "stopper"],
  ["colis", "paquet", "marchandise", "pli", "envoi"],
  ["coursier", "livreur", "chauffeur"],
  ["commander", "commande", "réserver", "réservation"],
  ["facture", "facturation", "justificatif"],
  ["horaires", "heures", "ouverture", "ouvert"],
  ["course", "livraison", "mission"],
  ["urgent", "urgence", "rapide", "vite"],
  ["entreprise", "société", "professionnel", "pro"],
  ["particulier", "personne", "privé"],
  ["payer", "paiement", "règlement", "régler"],
  ["adresse", "destination", "lieu"],
  ["problème", "souci", "erreur", "bug"],
  ["rappel", "rappeler", "appel", "appeler"],
  ["retard", "attente", "long"],
  ["réclamation", "plainte", "litige"],
  ["remboursement", "rembourser", "argent"],
  ["assuré", "assurance", "garanti", "couvert"],
  ["Paris", "parisien", "capitale"],
  ["compte", "espace client", "inscription", "inscrire"],
];

/** Nombre maximal de variantes par formulation de la banque. 1 = pas de variante : les synonymes donnaient de mauvaises réponses. */
const VARIANTS_PER_QUESTION = 1;

/** Variantes d'une question : on remplace un mot par un synonyme, puis un second, sans dépasser la limite. */
function variants(question: string): string[] {
  const seen = new Set([question]);
  let frontier = [question];
  for (let depth = 0; depth < 2 && seen.size < VARIANTS_PER_QUESTION; depth++) {
    const next: string[] = [];
    for (const text of frontier) {
      const plain = norm(text);
      for (const group of GROUPS) {
        for (const from of group) {
          if (!plain.includes(norm(from))) continue;
          for (const to of group) {
            if (to === from || seen.size >= VARIANTS_PER_QUESTION) continue;
            const variant = text.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), to);
            if (!seen.has(variant)) {
              seen.add(variant);
              next.push(variant);
            }
          }
        }
      }
    }
    frontier = next;
  }
  return [...seen];
}

/** Mots utiles d'un texte : sans accents, sans mots vides, radical de 5 lettres. */
function tokens(text: string): string[] {
  return norm(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => w.slice(0, 5));
}

/** Seuil de ressemblance : en dessous, on ne répond pas à la place du visiteur. */
const MIN_SCORE = 0.5;

const INDEX = QA.flatMap((entry) =>
  entry.questions.flatMap((question) =>
    variants(question)
      .map((text) => tokens(text))
      .filter((forms) => forms.length > 0)
      .map((forms) => ({ answer: entry.answer, forms })),
  ),
);

/** Nombre de formulations indexées (banque + variantes). */
export const FAQ_SIZE = INDEX.length;

/** Réponse à une question, ou null si aucune formulation ne ressemble assez. */
export function matchFaq(text: string): { content: string; choices: Choice[] } | null {
  const words = new Set(tokens(text));
  if (words.size === 0) return null;

  // Score : part des mots du visiteur retrouvés dans la formulation ; à égalité, la formulation la plus courte gagne.
  let best: { answer: string; score: number; length: number } | null = null;
  for (const { answer, forms } of INDEX) {
    const common = forms.filter((w) => words.has(w)).length;
    if (common === 0) continue;
    const score = common / words.size;
    if (!best || score > best.score || (score === best.score && forms.length < best.length)) best = { answer, score, length: forms.length };
  }
  if (!best || best.score < MIN_SCORE) return null;
  return { content: best.answer, choices: [{ label: "Commander maintenant", action: "order" }, { label: "Autre question", step: "menu" }] };
}
