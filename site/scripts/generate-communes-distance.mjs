/**
 * Régénère lib/communes-distance.ts : km par la route depuis le centre de Paris (Notre-Dame)
 * jusqu'au centre de chaque commune du 77, 78, 91 et 95.
 * Communes : geo.api.gouv.fr. Itinéraire : IGN Géoplateforme (gratuit, sans clé).
 * Usage : node scripts/generate-communes-distance.mjs
 */
import { writeFileSync } from "node:fs";

const PARIS = "2.3499,48.8530"; // Notre-Dame
const DEPTS = ["77", "78", "91", "95"];
const CONCURRENCY = 2;
const PAUSE_MS = 400; // limite de débit de l’IGN (HTTP 429 au-delà)

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

async function roadKm(lon, lat, attempt = 1) {
  const url =
    "https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&profile=car&optimization=shortest" +
    `&start=${PARIS}&end=${lon},${lat}&distanceUnit=kilometer&getSteps=false&getBbox=false`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (typeof d.distance !== "number") throw new Error("pas de distance");
    return Math.round(d.distance);
  } catch (e) {
    if (attempt >= 6) throw e;
    await new Promise((res) => setTimeout(res, 3000 * attempt));
    return roadKm(lon, lat, attempt + 1);
  }
}

const communes = [];
for (const dept of DEPTS) {
  const r = await fetch(`https://geo.api.gouv.fr/departements/${dept}/communes?fields=nom,centre,codesPostaux`);
  for (const c of await r.json()) communes.push({ dept, ...c });
}
console.log(`${communes.length} communes`);

let next = 0, done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < communes.length) {
      const c = communes[next++];
      const [lon, lat] = c.centre.coordinates;
      c.km = await roadKm(lon, lat);
      await new Promise((res) => setTimeout(res, PAUSE_MS));
      if (++done % 100 === 0) console.log(`${done}/${communes.length}`);
    }
  }),
);

const byCommune = communes.map((c) => `${c.dept}|${normalize(c.nom)}:${c.km}`).join(",");
const postcodes = {};
for (const c of communes) for (const cp of c.codesPostaux) postcodes[cp] = Math.max(postcodes[cp] ?? 0, c.km);
const byPostcode = Object.keys(postcodes).sort().map((cp) => `${cp}:${postcodes[cp]}`).join(",");

writeFileSync(
  new URL("../lib/communes-distance.ts", import.meta.url),
  `/**
 * lib/communes-distance.ts — GÉNÉRÉ par scripts/generate-communes-distance.mjs, ne pas modifier à la main.
 * Distance par la route (IGN Géoplateforme, itinéraire voiture le plus court) depuis le centre de Paris
 * (Notre-Dame) jusqu'au centre de chaque commune du 77, 78, 91 et 95, arrondie au km.
 * Sert au prix des courses en grande couronne, qui suit la distance depuis Paris.
 */

const parse = (s: string) => Object.fromEntries(s.split(",").map((e) => { const i = e.lastIndexOf(":"); return [e.slice(0, i), Number(e.slice(i + 1))]; }));

/** « dept|nom normalisé » → km depuis Paris. */
export const KM_BY_COMMUNE: Record<string, number> = parse(
  "${byCommune}",
);

/** Code postal → km depuis Paris (la commune la plus éloignée quand plusieurs partagent le code). */
export const KM_BY_POSTCODE: Record<string, number> = parse(
  "${byPostcode}",
);
`,
);
console.log("lib/communes-distance.ts écrit");
