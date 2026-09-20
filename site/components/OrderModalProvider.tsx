"use client";
/**
 * components/OrderModalProvider.tsx
 * Rend le modal de commande accessible depuis toute l'app via
 * un event custom "open-order-modal" dispatché sur window.
 *
 * Usage :
 *   window.dispatchEvent(new CustomEvent("open-order-modal"))
 */
import { useState, useEffect } from "react";
import OrderModal from "./OrderModal";

export default function OrderModalProvider() {
  const [open, setOpen] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      setPickup(detail.pickup ?? "");
      setDropoff(detail.dropoff ?? "");
      setOpen(true);
    };
    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, []);

  return (
    <OrderModal
      open={open}
      onClose={() => setOpen(false)}
      initialPickup={pickup}
      initialDropoff={dropoff}
    />
  );
}
