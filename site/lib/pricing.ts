import { COMMUNES_IDF } from "./communes-idf";

export type Zone = 0 | 1 | 2 | 3 | 4;
export type ServiceLevel = 'navette' | 'standard' | 'urgent' | 'flash';

// Prix TTC, TVA 20 % comprise, identiques pour les pros et les particuliers.
const PRICING_GRID = {
  navette: [18.00, 30.00, 66.00, 72.00, 78.00],
  standard: [21.00, 42.00, 78.00, 96.00, 109.20],
  urgent: [31.50, 63.00, 117.00, 144.00, 163.80],
  flash: [42.00, 84.00, 156.00, 192.00, 218.40]
};

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

/** Département de l'adresse : par le code postal, sinon par le nom de la ville (« Montreuil », « Paris 15e »). */
export function getDepartmentFromAddress(address: string): string | null {
  const match = address.match(/\b([0-9]{2})[0-9]{3}\b/);
  if (match) return match[1];

  // La ville est en général à la fin (« 54 rue de Paris, Montreuil ») : on garde la commune
  // trouvée le plus loin dans l'adresse, et la plus longue à égalité (« Saint-Denis » > « Denis »).
  const text = ` ${normalize(address)} `;
  let best: { end: number; len: number; depts: string[] } | null = null;
  for (const [name, depts] of communes()) {
    const at = text.lastIndexOf(` ${name} `);
    if (at < 0) continue;
    const end = at + name.length;
    if (!best || end > best.end || (end === best.end && name.length > best.len)) best = { end, len: name.length, depts };
  }
  if (!best) return null;
  // Homonyme : on retient la zone la plus éloignée.
  return best.depts.reduce((a, b) => (getZoneFromDepartment(b) > getZoneFromDepartment(a) ? b : a));
}

export function getZoneFromDepartment(dept: string | null): Zone {
  if (!dept) return 4; // Par défaut, zone la plus chère si introuvable (ou gérer l'erreur)
  if (dept === '75') return 0; // Intra-muros
  if (['92', '93', '94'].includes(dept)) return 1; // Petite Couronne
  if (['77', '78', '91', '95'].includes(dept)) return 2; // Moyenne Couronne (simplification)
  // Par défaut pour le reste de l'IDF
  return 3;
}

/** Prix TTC d'une formule pour une zone (0 Paris, 1 petite couronne, 2 grande couronne), pour l'affichage. */
export function gridPrice(service: ServiceLevel, zone: Zone): number {
  return PRICING_GRID[service][zone];
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

  return PRICING_GRID[service][maxZone];
}
