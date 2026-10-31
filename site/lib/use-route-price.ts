"use client";
/**
 * lib/use-route-price.ts
 * Prix TTC affiché dans les formulaires pour une course A → B, identique à celui facturé par le serveur
 * (priceRoute). Paris et grande couronne : prix immédiat. Petite couronne : prix au km, calculé avec la
 * distance par la route, après une courte pause de saisie ; null pendant le calcul.
 */
import { useEffect, useState } from "react";
import { calculatePrice, isPerKmRoute, isServedAddress, returnPrice, type ServiceLevel } from "@/lib/pricing";
import { priceRoute } from "@/lib/route-distance";

const DEBOUNCE_MS = 400;

export function useRoutePrice(
  pickup: string,
  dropoff: string,
  service: ServiceLevel | "",
  returnTrip = false,
  stops: string[] = []
): number | null {
  const [price, setPrice] = useState<number | null>(null);
  const level = (service || "standard") as ServiceLevel;
  const filledStops = stops.map((s) => s.trim()).filter(Boolean);
  const deliveries = [...filledStops, dropoff];
  const served = !!pickup && !!dropoff && deliveries.every(isServedAddress) && isServedAddress(pickup);
  const perKm = served && (filledStops.length > 0 || isPerKmRoute(pickup, dropoff));
  const key = deliveries.join("|");

  useEffect(() => {
    if (!perKm) return;
    let live = true;
    const timer = setTimeout(() => {
      priceRoute(pickup, deliveries, level, returnTrip)
        .then((r) => live && setPrice(r.total))
        .catch(() => live && setPrice(null));
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      setPrice(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perKm, pickup, key, level, returnTrip]);

  if (!served) return null;
  if (!perKm) {
    const base = calculatePrice(pickup, dropoff, level);
    return returnTrip ? base + returnPrice(calculatePrice(dropoff, pickup, level)) : base;
  }
  return price;
}
