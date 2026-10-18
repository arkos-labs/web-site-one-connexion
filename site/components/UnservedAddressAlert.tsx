"use client";
/**
 * components/UnservedAddressAlert.tsx
 * Adresse hors Paris / Île-de-France (ou non reconnue) : alerte rouge, pas de tarif, pas de commande.
 * useUnservedAddresses attend une courte pause de frappe avant d'alerter, pour ne pas clignoter en rouge
 * pendant que le client tape encore l'adresse.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, Phone } from "lucide-react";
import { isServedAddress } from "@/lib/pricing";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

/** true si une des adresses saisies n'est pas desservie (les champs vides sont ignorés). */
export function useUnservedAddresses(addresses: string[], delay = 700): boolean {
  const key = addresses.map((a) => a.trim()).join("\n");
  const unserved = addresses.some((a) => a.trim().length > 0 && !isServedAddress(a));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!unserved) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), delay);
    return () => clearTimeout(t);
  }, [key, unserved, delay]);

  return unserved && settled;
}

export default function UnservedAddressAlert({ className = "" }: { className?: string }) {
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 ${className}`}>
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
      <div>
        <p className="font-bold text-red-900">Adresse non reconnue</p>
        <p className="mt-0.5">
          Nous livrons uniquement à Paris et en Île-de-France. Vérifiez la ville ou le code postal, ou
          contactez-nous pour une course hors zone&nbsp;:
        </p>
        <a href={`tel:${PHONE_TEL}`} className="mt-2 inline-flex items-center gap-1.5 font-bold text-red-900 underline hover:text-red-700">
          <Phone size={14} /> {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
