"use client";
/**
 * components/QuickOrderBar.tsx
 * Barre de commande rapide des hauts de page sombres (accueil, pages zones) : deux adresses,
 * le prix s'affiche tout de suite, le bouton ouvre la fenêtre de commande déjà remplie.
 */
import { useEffect, useRef, useState } from "react";
import { MapPin, Flag } from "lucide-react";
import dynamic from "next/dynamic";
import { useRoutePrice } from "@/lib/use-route-price";
import { trackEvent } from "@/lib/track-event";
import { formatEur } from "@/lib/price-display";

const ADDRESS_INPUT =
  "w-full rounded-[2px] bg-paper-card py-3 pl-10 pr-4 text-[14px] font-medium text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent";

const AddressAutocomplete = dynamic(
  () => import("@/components/AddressAutocomplete").then((mod) => ({ default: mod.AddressAutocomplete })),
  { ssr: false, loading: () => <input placeholder="Adresse..." className={ADDRESS_INPUT} /> }
);

export default function QuickOrderBar({ className = "" }: { className?: string }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  // Première saisie de chaque adresse (une fois par visiteur) : cf. lib/track-event.
  const addressTracked = useRef({ pickup: false, dropoff: false });
  useEffect(() => {
    if (pickup.trim() && !addressTracked.current.pickup) {
      addressTracked.current.pickup = true;
      trackEvent("order_address_pickup");
    }
  }, [pickup]);
  useEffect(() => {
    if (dropoff.trim() && !addressTracked.current.dropoff) {
      addressTracked.current.dropoff = true;
      trackEvent("order_address_dropoff");
    }
  }, [dropoff]);

  // Prix tout de suite, avant tout formulaire : formule la moins chère, même grille que le formulaire de commande.
  // Petite couronne : prix au km, calculé avec la distance par la route.
  const price = useRoutePrice(pickup, dropoff, "standard");

  return (
    <div className={className}>
      <div className="relative z-10 flex flex-col gap-2 rounded-[4px] border border-white/15 bg-ink/90 p-2 backdrop-blur-md md:flex-row">
        <div className="relative z-20 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
            <MapPin className="h-5 w-5 text-accent" />
          </div>
          <AddressAutocomplete
            value={pickup}
            onChange={setPickup}
            placeholder="Adresse d'enlèvement"
            className={ADDRESS_INPUT}
          />
        </div>
        <div className="relative z-10 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
            <Flag className="h-5 w-5 text-accent" />
          </div>
          <AddressAutocomplete
            value={dropoff}
            onChange={setDropoff}
            placeholder="Adresse de livraison"
            className={ADDRESS_INPUT}
          />
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal", { detail: { pickup, dropoff } }))}
          className="flex items-center justify-center whitespace-nowrap rounded-[2px] bg-accent px-8 py-3 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark"
        >
          Commander ma course
        </button>
      </div>
      <p aria-live="polite" className="mt-3 text-[14px] text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
        {price != null ? (
          <>
            Votre course : <strong className="text-[16px] font-bold text-white">dès {formatEur(price)} € TTC</strong>
          </>
        ) : (
          <>Entrez vos deux adresses : le prix exact s&rsquo;affiche tout de suite, sans inscription.</>
        )}
      </p>
    </div>
  );
}
