import { COMMUNES_IDF } from "./communes-idf";
import { KM_BY_COMMUNE, KM_BY_POSTCODE } from "./communes-distance";

export type Zone = 0 | 1 | 2 | 3 | 4;
export type ServiceLevel = 'navette' | 'standard' | 'urgent' | 'flash';

// Prix TTC, TVA 20 % comprise, identiques pour les pros et les particuliers.
// Bâtis sur le coût réel d'un coursier deux-roues (octobre 2026) : 4 720 € de charges hors véhicule
// + 3 000 € de bénéfice visé, sur 180 h roulées par mois → 42,89 € HT de l'heure ; véhicule
// remboursé en indemnités kilométriques (barème 2026, 125 cm³) : 0,248 € par km.
// Paris : course de 30 min, approche comprise, 8 km → 28 € TTC.
// Petite couronne : 1 h environ avec un retour partiel → 59 € TTC.
// Grande couronne (zone 2) : prix selon la distance depuis Paris, retour à vide compris.
// Les zones 3 et 4 (hors Île-de-France, adresse introuvable) ne sont pas desservies.
// La navette régulière est sur devis. « navette » reste le délai d'une course programmée (date et heure
// choisies au formulaire) : elle se paie au tarif Normal.
const PRICING_GRID = {
  standard: [28.00, 59.00, 0, 96.00, 109.20],
  urgent: [42.00, 88.50, 0, 144.00, 163.80],
  flash: [56.00, 118.00, 0, 192.00, 218.40]
};

/** Majoration par délai, appliquée au prix Normal de la grande couronne (comme sur la grille Paris). */
const DELAY_FACTOR: Record<ServiceLevel, number> = { navette: 1, standard: 1, urgent: 1.5, flash: 2 };
const gridLevel = (service: ServiceLevel) => (service === "navette" ? "standard" : service);

// Grande couronne : aller avec le colis + retour à vide vers Paris à 50 km/h de moyenne,
// plus 20 min d'approche, d'enlèvement et de remise. HT = heures × 42,89 € + km × 0,248 €.
const GC_HOURLY_HT = 42.89;
const GC_KM_HT = 0.248;
const GC_SPEED_KMH = 50;
const GC_FIXED_HOURS = 20 / 60;

/** Prix Normal TTC d'une course grande couronne à `km` de Paris, jamais sous le prix petite couronne. */
function grandeCouronneTTC(km: number): number {
  const roundTrip = 2 * km;
  const ht = (roundTrip / GC_SPEED_KMH + GC_FIXED_HOURS) * GC_HOURLY_HT + roundTrip * GC_KM_HT;
  return Math.max(PRICING_GRID.standard[1], Math.round(ht * 1.2));
}

/** Prix d'appel de la grande couronne : la commune la plus proche de Paris. */
const GC_FROM_KM = Math.min(...Object.values(KM_BY_COMMUNE));

/** Décomposition d'un prix TTC (TVA 20 % comprise) : HT = TTC / 1,20, TVA = TTC − HT. */
export function splitTTC(ttc: number) {
  const ht = Math.round((ttc / 1.2) * 100) / 100;
  return { ht, tva: Math.round((ttc - ht) * 100) / 100, ttc };
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// Nom de commune normalisé → départements (4 homonymes en IDF, ex. Marolles-en-Brie 77 et 94).
let communeIndex: Map<string, string[]> | null = null;
function communes(): Map<string, string[]> {
  if (communeIndex) return communeIndex;
  communeIndex = new Map();
  for (const [dept, names] of Object.entries(COMMUNES_IDF)) {
    for (const name of names.split("|")) {
      const key = normalize(name);
      communeIndex.set(key, [...(communeIndex.get(key) ?? []), dept]);
    }
  }
  return communeIndex;
}

/**
 * Commune nommée dans l'adresse, limitée à `dept` s'il est connu. La ville est en général à la fin
 * (« 54 rue de Paris, Montreuil ») : on garde la commune trouvée le plus loin dans l'adresse,
 * et la plus longue à égalité (« Saint-Denis » > « Denis »).
 */
function findCommune(address: string, dept?: string): { name: string; depts: string[] } | null {
  const text = ` ${normalize(address)} `;
  let best: { end: number; len: number; name: string; depts: string[] } | null = null;
  for (const [name, all] of communes()) {
    const depts = dept ? all.filter((d) => d === dept) : all;
    if (!depts.length) continue;
    const at = text.lastIndexOf(` ${name} `);
    if (at < 0) continue;
    const end = at + name.length;
    if (!best || end > best.end || (end === best.end && name.length > best.len)) best = { end, len: name.length, name, depts };
  }
  return best && { name: best.name, depts: best.depts };
}

/** Département de l'adresse : par le code postal, sinon par le nom de la ville (« Montreuil », « Paris 15e »). */
export function getDepartmentFromAddress(address: string): string | null {
  const match = address.match(/\b([0-9]{2})[0-9]{3}\b/);
  if (match) return match[1];

  const found = findCommune(address);
  if (!found) return null;
  // Homonyme : on retient la zone la plus éloignée.
  return found.depts.reduce((a, b) => (getZoneFromDepartment(b) > getZoneFromDepartment(a) ? b : a));
}

/** Km estimés depuis Paris d'une adresse de grande couronne : la commune, sinon le code postal, sinon la médiane du département. */
function kmFromParis(address: string, dept: string): number {
  const commune = findCommune(address, dept);
  if (commune) {
    const km = KM_BY_COMMUNE[`${dept}|${commune.name}`];
    if (km != null) return km;
  }
  const cp = address.match(/\b([0-9]{5})\b/)?.[1];
  if (cp && KM_BY_POSTCODE[cp] != null) return KM_BY_POSTCODE[cp];
  // Code postal CEDEX ou inconnu : distance médiane du département.
  const kms = Object.entries(KM_BY_COMMUNE).filter(([k]) => k.startsWith(`${dept}|`)).map(([, v]) => v).sort((a, b) => a - b);
  return kms[Math.floor(kms.length / 2)];
}

export function getZoneFromDepartment(dept: string | null): Zone {
  if (!dept) return 4; // Par défaut, zone la plus chère si introuvable (ou gérer l'erreur)
  if (dept === '75') return 0; // Intra-muros
  if (['92', '93', '94'].includes(dept)) return 1; // Petite Couronne
  if (['77', '78', '91', '95'].includes(dept)) return 2; // Moyenne Couronne (simplification)
  // Par défaut pour le reste de l'IDF
  return 3;
}

/**
 * Prix TTC d'une formule pour une zone (0 Paris, 1 petite couronne, 2 grande couronne), pour l'affichage.
 * Grande couronne : prix d'appel (« dès »), celui de la commune la plus proche de Paris.
 */
export function gridPrice(service: ServiceLevel, zone: Zone): number {
  if (zone === 2) return grandeCouronneTTC(GC_FROM_KM) * DELAY_FACTOR[service];
  return PRICING_GRID[gridLevel(service)][zone];
}

/** Prix TTC d'une course entre Paris et `address` (une commune suffit : « Meaux 77 », « Cergy »). */
export function priceFromParis(address: string, service: ServiceLevel): number {
  return calculatePrice("Paris 75001", address, service);
}

/** Départements desservis : Paris et Île-de-France. */
export const SERVED_DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

/** Adresse reconnue en Paris / Île-de-France (code postal ou nom de commune). */
export function isServedAddress(address: string): boolean {
  const dept = getDepartmentFromAddress(address);
  return !!dept && SERVED_DEPARTMENTS.includes(dept);
}

export function calculatePrice(pickup: string, dropoff: string, service: ServiceLevel): number {
  const deptPickup = getDepartmentFromAddress(pickup);
  const deptDropoff = getDepartmentFromAddress(dropoff);

  const zonePickup = getZoneFromDepartment(deptPickup);
  const zoneDropoff = getZoneFromDepartment(deptDropoff);

  const maxZone = Math.max(zonePickup, zoneDropoff) as Zone;

  // Grande couronne : le coursier part de Paris, le prix suit l'adresse la plus éloignée de Paris.
  if (maxZone === 2) {
    const km = Math.max(
      ...[[pickup, deptPickup, zonePickup], [dropoff, deptDropoff, zoneDropoff]]
        .filter(([, , zone]) => zone === 2)
        .map(([address, dept]) => kmFromParis(address as string, dept as string)),
    );
    return grandeCouronneTTC(km) * DELAY_FACTOR[service];
  }

  return PRICING_GRID[gridLevel(service)][maxZone];
}

/* ── Adresses de livraison en plus ──────────────────────────────────────────────────────────────
 * La course A → B garde le prix de la grille. Chaque adresse de livraison en plus se paie
 * uniquement au km depuis l'adresse précédente, sans forfait par arrêt, puis la majoration du délai.
 * Prix au km bâti sur le coût du coursier (42,89 € HT/h + 0,248 €/km) :
 * Paris et petite couronne ~18 km/h → 3 € TTC/km ; grande couronne ~50 km/h → 1,50 € TTC/km.
 */
export const EXTRA_KM_CITY = 3;
export const EXTRA_KM_GC = 1.5;
/** En Super (sous 1 h), au plus 2 adresses de livraison : au-delà, le délai n'est pas tenable. */
export const MAX_FLASH_DELIVERIES = 2;

export type ExtraStop = { from: string; to: string; km: number; price: number };

/** Prix TTC d'une adresse en plus, arrondi à 0,50 € : zone grande couronne si l'une des deux adresses y est. */
export function extraStopPrice(from: string, to: string, km: number, service: ServiceLevel): number {
  const gc = [from, to].some((a) => getZoneFromDepartment(getDepartmentFromAddress(a)) === 2);
  const normal = (gc ? EXTRA_KM_GC : EXTRA_KM_CITY) * Math.max(0, km);
  return Math.round(normal * DELAY_FACTOR[service] * 2) / 2;
}

/**
 * Prix TTC d'un itinéraire : enlèvement, puis livraisons dans l'ordre (la dernière est orders.dropoff_address).
 * `legKm[i]` = km entre la livraison i et la livraison i + 1 (voir lib/route-distance.ts).
 */
export function calculateRoutePrice(pickup: string, deliveries: string[], service: ServiceLevel, legKm: number[]) {
  const base = calculatePrice(pickup, deliveries[0], service);
  const extras: ExtraStop[] = deliveries.slice(1).map((to, i) => {
    const from = deliveries[i];
    const km = Math.round((legKm[i] ?? 0) * 10) / 10;
    return { from, to, km, price: extraStopPrice(from, to, km, service) };
  });
  const total = Math.round((base + extras.reduce((s, e) => s + e.price, 0)) * 100) / 100;
  return { base, extras, total };
}
