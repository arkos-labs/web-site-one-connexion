/**
 * lib/route-distance.ts
 * Distance entre deux adresses de livraison, pour le prix des adresses en plus (lib/pricing.ts).
 * Position de chaque adresse : Base Adresse Nationale. Distance par la route : itinéraire voiture le plus
 * court de l'IGN (Géoplateforme, gratuit, sans clé), arrondie à 0,1 km. Si l'IGN ne répond pas :
 * vol d'oiseau × 1,3. Même calcul côté formulaire et serveur.
 */
import { joinNumberSuffix } from "./address-idf";
import { calculateRoutePrice, type ServiceLevel } from "./pricing";

const ROAD_FACTOR = 1.3;
/** Adresse introuvable ou service indisponible : distance d'une course dans Paris. */
const FALLBACK_KM = 8;

type Point = { lat: number; lon: number };
const cache = new Map<string, Promise<Point | null>>();
const routeCache = new Map<string, Promise<number | null>>();

function locate(address: string): Promise<Point | null> {
  const q = joinNumberSuffix(address.trim());
  if (!cache.has(q)) {
    cache.set(
      q,
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1&lat=48.8566&lon=2.3522`, {
        signal: AbortSignal.timeout(6000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const c = d?.features?.[0]?.geometry?.coordinates;
          return Array.isArray(c) ? { lon: Number(c[0]), lat: Number(c[1]) } : null;
        })
        .catch(() => {
          cache.delete(q);
          return null;
        })
    );
  }
  return cache.get(q)!;
}

function haversineKm(a: Point, b: Point): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Km par la route entre deux points (IGN), null si le service ne répond pas. */
function routeKm(a: Point, b: Point): Promise<number | null> {
  const key = `${a.lon},${a.lat};${b.lon},${b.lat}`;
  if (!routeCache.has(key)) {
    routeCache.set(
      key,
      fetch(
        "https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&profile=car&optimization=shortest" +
          `&start=${a.lon},${a.lat}&end=${b.lon},${b.lat}&distanceUnit=kilometer&getSteps=false&getBbox=false`,
        { signal: AbortSignal.timeout(8000) }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (typeof d?.distance === "number" ? d.distance : null))
        .catch(() => null)
        .then((km) => {
          if (km == null) routeCache.delete(key);
          return km;
        })
    );
  }
  return routeCache.get(key)!;
}

/** Km par la route entre chaque livraison et la suivante. */
export async function legDistancesKm(deliveries: string[]): Promise<number[]> {
  const points = await Promise.all(deliveries.map(locate));
  return Promise.all(
    deliveries.slice(1).map(async (_, i) => {
      const a = points[i], b = points[i + 1];
      if (!a || !b) return FALLBACK_KM;
      const km = (await routeKm(a, b)) ?? haversineKm(a, b) * ROAD_FACTOR;
      return Math.round(km * 10) / 10;
    })
  );
}

/** Prix complet d'une course à une ou plusieurs adresses de livraison (la dernière = dropoff). */
export async function priceRoute(pickup: string, deliveries: string[], service: ServiceLevel) {
  const legKm = deliveries.length > 1 ? await legDistancesKm(deliveries) : [];
  return calculateRoutePrice(pickup, deliveries, service, legKm);
}

/** Livraisons dans l'ordre d'une commande : étapes (orders.stops) puis adresse finale. */
export function deliveriesOf(o: { dropoff_address: string; stops?: unknown }): string[] {
  const stops = (Array.isArray(o.stops) ? o.stops : [])
    .map((s: any) => String(s?.address ?? s ?? "").trim())
    .filter(Boolean);
  return [...stops, o.dropoff_address];
}
