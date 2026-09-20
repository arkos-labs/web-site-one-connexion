import { createClient } from "@/lib/supabase/client";

const PARIS_LAT = 48.8566;
const PARIS_LON = 2.3522;

export type Zone = "intramuros" | "zone1" | "zone2" | "zone3" | "zone4";
export type Delai = "flash" | "standard" | "programme";

export interface PricingRow {
  zone: Zone;
  zone_label: string;
  base_bons: number;
  bon_value_standard: number;
  bon_value_navette: number;
  flash_multiplier: number;
  stop_bons: number;
}

const FALLBACK_GRID: PricingRow[] = [
  { zone: "intramuros", zone_label: "Intra-muros (Paris 75)", base_bons: 3.5, bon_value_standard: 7, bon_value_navette: 5, flash_multiplier: 1.5, stop_bons: 2 },
  { zone: "zone1", zone_label: "Zone 1 (Petite Couronne)", base_bons: 5, bon_value_standard: 7, bon_value_navette: 5, flash_multiplier: 1.5, stop_bons: 2 },
  { zone: "zone2", zone_label: "Zone 2 (Moyenne Couronne)", base_bons: 7, bon_value_standard: 7, bon_value_navette: 5, flash_multiplier: 1.5, stop_bons: 2 },
  { zone: "zone3", zone_label: "Zone 3 (Grande Couronne)", base_bons: 9, bon_value_standard: 7, bon_value_navette: 5, flash_multiplier: 1.5, stop_bons: 2 },
  { zone: "zone4", zone_label: "Zone 4 (Banlieue Lointaine)", base_bons: 13, bon_value_standard: 7, bon_value_navette: 5, flash_multiplier: 1.5, stop_bons: 2 },
];

let cachedGrid: PricingRow[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function loadPricingGrid(): Promise<PricingRow[]> {
  if (cachedGrid && Date.now() - cacheTime < CACHE_TTL) return cachedGrid;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pricing_grid")
      .select("zone, zone_label, base_bons, bon_value_standard, bon_value_navette, flash_multiplier, stop_bons");

    if (!error && data && data.length > 0) {
      cachedGrid = data as PricingRow[];
      cacheTime = Date.now();
      return cachedGrid;
    }
  } catch {
    // fallback
  }
  return FALLBACK_GRID;
}

export function getGridSync(): PricingRow[] {
  return cachedGrid ?? FALLBACK_GRID;
}

// --- Zone detection ---

export function getZoneFromPostcode(postcode: string): Zone {
  const dept = postcode.substring(0, 2);
  if (dept === "75") return "intramuros";
  if (["92", "93", "94"].includes(dept)) return "zone1";
  if (["91", "95"].includes(dept)) return "zone2";
  if (["78", "77"].includes(dept)) return "zone3";
  return "zone4";
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getZoneFromCoords(lat: number, lon: number): Zone {
  const dist = haversineKm(PARIS_LAT, PARIS_LON, lat, lon);
  if (dist <= 7) return "intramuros";
  if (dist <= 15) return "zone1";
  if (dist <= 25) return "zone2";
  if (dist <= 40) return "zone3";
  return "zone4";
}

export function detectZone(postcode: string, lat?: number, lon?: number): Zone {
  const zoneByCode = getZoneFromPostcode(postcode);
  if (lat && lon && ["zone2", "zone3"].includes(zoneByCode)) {
    return getZoneFromCoords(lat, lon);
  }
  return zoneByCode;
}

export function farthestZone(a: Zone, b: Zone): Zone {
  const order: Zone[] = ["intramuros", "zone1", "zone2", "zone3", "zone4"];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

// --- Price calculation ---

export function estimatePrice(
  zone: Zone,
  delai: Delai,
  stopsCount: number,
  isNavette = false,
  grid?: PricingRow[],
): number {
  const rows = grid ?? getGridSync();
  const row = rows.find(r => r.zone === zone) ?? rows[0];

  const bonValue = isNavette ? Number(row.bon_value_navette) : Number(row.bon_value_standard);
  const base = Number(row.base_bons) * bonValue;
  const stopsPrice = stopsCount * Number(row.stop_bons) * bonValue;
  let total = base + stopsPrice;

  if (delai === "flash" && !isNavette) {
    total *= Number(row.flash_multiplier);
  }

  return Math.round(total * 100) / 100;
}

export function getZoneLabel(zone: Zone, grid?: PricingRow[]): string {
  const rows = grid ?? getGridSync();
  return rows.find(r => r.zone === zone)?.zone_label ?? zone;
}
