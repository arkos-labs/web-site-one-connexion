import { calculatePrice, ServiceLevel } from "@/lib/pricing";

const TVA_RATE = 0.2;
const LOCALE = "fr-FR";
const NUM_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

/** Calcule HT à partir de TTC (TVA 20% comprise) */
export const htOf = (ttc: number): number => Math.round((ttc / (1 + TVA_RATE)) * 100) / 100;

/** Formate un nombre en euros (sans le symbole €) */
export const formatEur = (n: number): string => 
  n.toLocaleString(LOCALE, NUM_FORMAT);

/** Affiche un montant TTC seul */
export const priceTTC = (ttc: number): string => 
  `${formatEur(ttc)} € TTC`;

/** Affiche un montant HT seul */
export const priceHT = (ttc: number): string => 
  `${formatEur(htOf(ttc))} € HT`;

/** Affiche HT et TTC sur une même ligne */
export const priceHTTTC = (ttc: number, separator = " • "): string =>
  `${priceHT(ttc)}${separator}${priceTTC(ttc)}`;

/**
 * Normalise le prix d'une course en TTC.
 * Gère la transition avec les anciennes commandes où le montant stocké était en HT
 * (ex: 17.50 € HT au lieu de 21 € TTC, ou 35.00 € HT au lieu de 42 € TTC).
 */
export function normalizeOrderPriceTTC(
  storedPrice: number | null | undefined,
  pickup?: string | null,
  dropoff?: string | null,
  delai?: string | null
): number | null {
  if (storedPrice != null && Number(storedPrice) > 0) {
    const val = Number(storedPrice);
    if (pickup && dropoff) {
      try {
        const gridPrice = calculatePrice(pickup, dropoff, (delai || "standard") as ServiceLevel);
        // Si l'ancien montant correspond au montant HT de la grille (ex: 17.50 pour 21, 35 pour 42, 65 pour 78)
        if (Math.abs(val * 1.2 - gridPrice) < 0.1 || Math.abs(gridPrice / 1.2 - val) < 0.1) {
          return gridPrice;
        }
      } catch {}
    }
    // Mapping direct des anciens montants HT de l'ancienne grille vers leur montant TTC
    const oldHtToTtc: Record<string, number> = {
      "15.00": 18, "15": 18,
      "17.50": 21, "17.5": 21,
      "25.00": 30, "25": 30,
      "26.25": 31.5,
      "35.00": 42, "35": 42,
      "45.00": 54, "45": 54,
      "49.00": 58.8, "49": 58.8,
      "52.50": 63, "52.5": 63,
      "63.00": 75.6, "63": 75.6,
      "65.00": 78, "65": 78,
      "70.00": 84, "70": 84,
      "73.50": 88.2,
      "80.00": 96, "80": 96,
      "91.00": 109.2, "91": 109.2,
      "94.50": 113.4,
      "97.50": 117, "97.5": 117,
      "98.00": 117.6,
      "120.00": 144, "120": 144,
      "126.00": 151.2,
      "130.00": 156, "130": 156,
      "136.50": 163.8,
      "160.00": 192, "160": 192,
      "182.00": 218.4,
    };
    const key = val.toFixed(2);
    if (oldHtToTtc[key] || oldHtToTtc[String(val)]) {
      return oldHtToTtc[key] ?? oldHtToTtc[String(val)];
    }
    return val;
  }
  if (pickup && dropoff) {
    try {
      return calculatePrice(pickup, dropoff, (delai || "standard") as ServiceLevel);
    } catch {}
  }
  return storedPrice != null ? Number(storedPrice) : null;
}

/** Composant React : affiche HT et TTC verticalement (HT petit, TTC gros) */
export function PriceDisplay({ ttc, className = "" }: { ttc: number; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs font-medium text-muted">{formatEur(htOf(ttc))} € HT</div>
      <div className="text-lg font-bold text-ink">{formatEur(ttc)} € TTC</div>
    </div>
  );
}
