/**
 * lib/zones/plan.ts
 * Plan SEO des pages de ville listées dans le brief de correction (novembre 2026) :
 * les 20 arrondissements et Villejuif. Chaque page vise une seule requête
 * (« coursier Paris Ne », « coursier Villejuif ») et compte exactement quatre H2.
 * Les autres communes gardent le gabarit d'origine.
 */
import type { Zone } from "./types";

export type ZonePlan = {
  kind: "arrondissement" | "commune";
  title: string;
  description: string;
  h1: string;
  h2: [string, string, string, string];
};

/**
 * Meta descriptions propres à un arrondissement : chacune cite des lieux de
 * l'arrondissement (plan SEO, fiche 4.14). Les arrondissements absents gardent
 * la description générique ci-dessous, en attendant leur tour (3 pages par semaine).
 */
const ARRONDISSEMENT_DESCRIPTIONS: Record<string, string> = {
  "paris-17e":
    "Coursier Paris 17e : dépôts au Tribunal de Paris (Batignolles), plis vers Wagram et les Ternes. Course dédiée, suivi de la prise en charge à la remise.",
  "paris-8e":
    "Coursier Paris 8e : plis vers Haussmann et le Triangle d'Or, livraisons aux Champs-Élysées et à Saint-Lazare. Course dédiée, suivi jusqu'à la remise.",
  "paris-15e":
    "Coursier Paris 15e : prélèvements vers l'HEGP et Necker, matériel pour la Porte de Versailles, plis à Beaugrenelle. Course dédiée, suivi jusqu'à la remise.",
};

export function getZonePlan(zone: Zone): ZonePlan | undefined {
  if (zone.category === "paris" && zone.slug.startsWith("paris-")) {
    const ne = zone.name.replace("Paris ", ""); // « 1er », « 2e »… « 20e »
    return {
      kind: "arrondissement",
      title: `Coursier Paris ${ne} : course dédiée en 45 min`,
      description:
        ARRONDISSEMENT_DESCRIPTIONS[zone.slug] ??
        `Coursier à Paris ${ne} : une course dédiée par envoi, prise en charge en moins de 45 minutes, tarif affiché à la commande et suivi en direct jusqu'à la remise.`,
      h1: `Coursier Paris ${ne} : une course dédiée dans l'arrondissement`,
      h2: [
        `Les rues et quartiers du ${ne} arrondissement`,
        `Ce que nous transportons dans le ${ne}`,
        "Organiser une course dans l'arrondissement",
        `Le ${ne} et le reste de Paris`,
      ],
    };
  }
  if (zone.slug === "villejuif") {
    return {
      kind: "commune",
      title: "Coursier Villejuif : courses dédiées pour vos envois",
      description:
        "Coursier à Villejuif pour vos envois professionnels : une course dédiée vers Paris et le reste de l'Île-de-France, avec un interlocuteur unique.",
      h1: "Coursier Villejuif : une course dédiée pour vos envois",
      h2: [
        "Les quartiers de Villejuif desservis",
        "Courses depuis et vers Villejuif",
        "Ce que nous transportons",
        "Organiser une course à Villejuif",
      ],
    };
  }
  if (zone.slug === "charenton-le-pont") {
    return {
      kind: "commune",
      title: "Coursier Charenton-le-Pont : course dédiée en 45 min",
      description:
        "Coursier à Charenton-le-Pont : une course dédiée par envoi, prise en charge en moins de 45 minutes, tarif affiché à la commande et suivi en direct jusqu'à la remise.",
      h1: "Coursier Charenton-le-Pont : une course dédiée pour vos envois",
      h2: [
        "Les quartiers de Charenton-le-Pont desservis",
        "Courses depuis et vers Charenton-le-Pont",
        "Ce que nous transportons",
        "Organiser une course à Charenton-le-Pont",
      ],
    };
  }
  return undefined;
}

/** Ces pages ne parlent pas de prix : les questions et réponses chiffrées vont sur /tarifs. */
export const mentionsPrice = (text: string) => /prix|tarif|co[uû]t|€/i.test(text);
