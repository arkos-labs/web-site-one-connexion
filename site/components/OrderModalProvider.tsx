"use client";
/**
 * components/OrderModalProvider.tsx
 * Rend le modal de commande accessible depuis toute l'app via
 * un event custom "open-order-modal" dispatché sur window.
 *
 * Usage :
 *   window.dispatchEvent(new CustomEvent("open-order-modal"))
 */
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import OrderModal from "./OrderModal";
import { loadOrderDraft, cameBackFromCheckout, abandonCheckout } from "@/lib/order-draft";

export default function OrderModalProvider() {
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [restoreDraft, setRestoreDraft] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      setPickup(detail.pickup ?? "");
      setDropoff(detail.dropoff ?? "");
      setRestoreDraft(false);
      setOpen(true);
    };
    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, []);

  // Lien direct vers le modal (pubs Google Ads, e-mails…) : oneconnexion.com/?commander
  // ouvre le modal au chargement, puis retire le paramètre de l'adresse.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("commander")) return;
    setOpen(true);
    url.searchParams.delete("commander");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  // Le modal vit dans le layout : il se ferme dès qu'on change de page (lien « Connectez-vous », etc.).
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return; // pas au chargement : seulement un vrai changement de page
    lastPath.current = pathname;
    setOpen(false);
  }, [pathname]);

  // Retour de Stripe sans payer (bouton « retour » de Stripe ou flèche du navigateur) :
  // la commande abandonnée est annulée et le modal se rouvre, rempli, à la dernière étape.
  useEffect(() => {
    const comeBack = (persisted: boolean) => {
      const draft = loadOrderDraft();
      if (draft?.source !== "modal" || (!persisted && !cameBackFromCheckout())) return;
      abandonCheckout(draft);
      if (!persisted) { setRestoreDraft(true); setOpen(true); } // page restaurée du cache : le modal est déjà rempli
      const url = new URL(window.location.href);
      if (url.searchParams.has("commande_annulee")) {
        url.searchParams.delete("commande_annulee");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    };
    comeBack(false);
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) comeBack(true); };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <OrderModal
      open={open}
      onClose={() => setOpen(false)}
      initialPickup={pickup}
      initialDropoff={dropoff}
      restoreDraft={restoreDraft}
    />
  );
}
