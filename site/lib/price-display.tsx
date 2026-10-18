// Affichage HT/TTC — TVA 20% dont (comprise dans les montants stockés).
// HT = TTC / 1.20, arrondi à 2 décimales (conforme facture PDF, chiffre d'affaires admin).

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

/** Composant React : affiche HT et TTC verticalement (HT petit, TTC gros) */
export function PriceDisplay({ ttc, className = "" }: { ttc: number; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs font-medium text-muted">{formatEur(htOf(ttc))} € HT</div>
      <div className="text-lg font-bold text-ink">{formatEur(ttc)} € TTC</div>
    </div>
  );
}
