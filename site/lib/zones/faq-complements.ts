/**
 * lib/zones/faq-complements.ts
 * Une page de ville affiche au moins 5 questions. Quand sa FAQ propre en compte moins, on complète
 * avec des questions construites sur ses données (département, prix réels de la grille, horaires),
 * en sautant tout sujet que la page traite déjà.
 */
import { getZoneFromDepartment, gridPrice, pcKmPrice, PC_INCLUDED_KM } from "@/lib/pricing";
import type { Zone, ZoneFaqItem } from "./types";

const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

const ZONE_LABEL = ["Paris", "la petite couronne", "la grande couronne", "l’Île-de-France", "l’Île-de-France"];

export const MIN_FAQ = 5;
/** Jamais plus de 5 questions par page : au-delà, la FAQ devient trop longue à lire. */
export const MAX_FAQ = 5;

export function withFaqComplements(zone: Zone, faq: ZoneFaqItem[]): ZoneFaqItem[] {
  if (faq.length >= MIN_FAQ) return faq.slice(0, MAX_FAQ);
  const covered = faq.map((f) => f.q.toLowerCase()).join(" ");
  // zone.dept vaut parfois un code postal (« 91120 ») : les 2 premiers chiffres donnent le département.
  const dept = zone.dept.slice(0, 2);
  const z = getZoneFromDepartment(dept);
  const [normal, urgent, flash] = (["standard", "urgent", "flash"] as const).map((s) => euro(gridPrice(s, z)));

  const candidates: { topic: RegExp; item: ZoneFaqItem }[] = [
    {
      topic: /prix|tarif|co[uû]t/,
      item: {
        q: `Quel est le prix d’une course depuis ${zone.name} ?`,
        a:
          z === 1
            ? `${zone.name} (${dept}) est en petite couronne : le prix suit les kilomètres de route. ${normal} TTC en Normal (3 h), ${urgent} en Urgent (1 h 30) et ${flash} en Super (1 h) jusqu’à ${PC_INCLUDED_KM} km, puis ${euro(pcKmPrice("standard"))}, ${euro(pcKmPrice("urgent"))} ou ${euro(pcKmPrice("flash"))} TTC par km. Le prix exact s’affiche avant de commander.`
            : `${zone.name} (${dept}) est en ${ZONE_LABEL[z]} : ${normal} TTC en Normal (3 h), ${urgent} en Urgent (1 h 30) et ${flash} en Super (1 h), vers Paris ou une commune de la même zone. Le prix s’affiche avant de commander.`,
      },
    },
    {
      topic: /horaire|heure|soir|week|dimanche|samedi/,
      item: {
        q: `Quels sont vos horaires à ${zone.name} ?`,
        a: `Du lundi au samedi, de 9h à 19h. Un coursier vient chercher le colis à ${zone.name} en moins de 45 minutes après la confirmation de la course. Nous sommes fermés le dimanche et les jours fériés.`,
      },
    },
    {
      topic: /commander|réserver|commande/,
      item: {
        q: `Comment commander un coursier à ${zone.name} ?`,
        a: `En ligne, en indiquant l’adresse d’enlèvement à ${zone.name}, la destination et le délai : le prix s’affiche tout de suite. Vous pouvez aussi nous appeler pour une demande particulière.`,
      },
    },
    {
      topic: /volum|lourd|poids|kg|gros/,
      item: {
        q: `Quel poids maximum pour une course depuis ${zone.name} ?`,
        a: `Jusqu’à 18 kg, dans le top-case d’un deux-roues. Au-delà de 10 kg, ou pour un colis encombrant, appelez-nous avant de commander : nous vérifions que nous pouvons le prendre.`,
      },
    },
  ];

  const out = [...faq];
  for (const c of candidates) {
    if (out.length >= MIN_FAQ) break;
    if (!c.topic.test(covered)) out.push(c.item);
  }
  return out;
}
