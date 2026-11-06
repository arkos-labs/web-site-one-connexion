import { calculatePrice, RETURN_RATE, SPEEDS, type ServiceLevel } from "./pricing";

const SPEED_TO_SERVICE: Record<keyof typeof SPEEDS, ServiceLevel> = {
  normal: "standard",
  urgent: "urgent",
  super: "flash",
};

/**
 * Devis TTC unique pour le simulateur et le formulaire de zone.
 * S'appuie sur calculatePrice (lib/pricing.ts) : aucun prix écrit en dur ici.
 * `returnToPickup` ajoute 40 % du prix de la course.
 */
export function quote(
  pickup: string,
  dropoff: string,
  speed: keyof typeof SPEEDS,
  km?: number,
  returnToPickup = false,
) {
  const base = calculatePrice(pickup, dropoff, SPEED_TO_SERVICE[speed], km);
  const returnFee = returnToPickup ? Math.round(base * RETURN_RATE * 100) / 100 : 0;
  return { base, returnFee, total: Math.round((base + returnFee) * 100) / 100 };
}
