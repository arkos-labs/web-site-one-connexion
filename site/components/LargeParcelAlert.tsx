/**
 * components/LargeParcelAlert.tsx
 * Format « Volumineux » choisi : au-delà de 10 kg, ou si le colis est encombrant même léger, il peut ne
 * pas tenir dans le top-case (18 kg maximum). On prévient et on invite à appeler avant de commander.
 */
import { Package, Phone } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function LargeParcelAlert({ className = "" }: { className?: string }) {
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 ${className}`}>
      <Package size={18} className="mt-0.5 shrink-0 text-amber-600" />
      <div>
        <p className="font-bold">Colis volumineux : appelez-nous avant de commander</p>
        <p className="mt-0.5">
          Nos coursiers transportent jusqu&apos;à 18 kg, dans un top-case. Au-delà de 10 kg, ou si le colis est
          encombrant (même léger), il peut ne pas passer : nous vérifions avec vous que nous pouvons le prendre.
        </p>
        <a href={`tel:${PHONE_TEL}`} className="mt-2 inline-flex items-center gap-1.5 font-bold underline hover:text-amber-700">
          <Phone size={14} /> {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
