"use client";
/**
 * lib/use-route-price.ts
 * Prix TTC affiché dans les formulaires pour une course A → B, identique à celui facturé par le serveur
 * (priceRoute). Paris et grande couronne : prix immédiat. Petite couronne : prix au km, calculé avec la
 * distance par la route, après une courte pause de saisie ; null pendant le calcul.
 */
import { useEffect, useState } from "react";
import { calculatePrice, isPerKmRoute, isServedAddress, type ServiceLevel } from "@/lib/pricing";
import { priceRoute } from "@/lib/route-distance";

const DEBOUNCE_MS = 400;

export function useRoutePrice(pickup: string, dropoff: string, service: ServiceLevel | ""): number | null {
  const [price, setPrice] = useState<number | null>(null);
  const level = (service || "standard") as ServiceLevel;
  const served = !!pickup && !!dropoff && isServedAddress(pickup) && isServedAddress(dropoff);
  const perKm = served && isPerKmRoute(pickup, dropoff);

  useEffect(() => {
    if (!perKm) return;
    let live = true;
    const timer = setTimeout(() => {
      priceRoute(pickup, [dropoff], level)
        .then((r) => live && setPrice(r.total))
        .catch(() => live && setPrice(null));
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      setPrice(null);
    };
  }, [perKm, pickup, dropoff, level]);

  if (!served) return null;
  if (!perKm) return calculatePrice(pickup, dropoff, level);
  return price;
}
