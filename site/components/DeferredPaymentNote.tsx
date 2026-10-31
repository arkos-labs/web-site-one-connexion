/**
 * components/DeferredPaymentNote.tsx
 * Pro qui règle à 30 jours : rappelle qu'il n'y a rien à payer aujourd'hui et dit ce qui va se passer,
 * selon le mode choisi (prélèvement : RIB enregistré sur Stripe ; virement : facture envoyée par e-mail).
 */
import { Info } from "lucide-react";

export default function DeferredPaymentNote({ method }: { method: "sepa" | "virement" }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-[13px] leading-snug text-gray-700">
      <Info size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      <p>
        <strong className="text-gray-900">Rien à payer aujourd&apos;hui.</strong>{" "}
        {method === "sepa"
          ? "Après validation, vous enregistrez votre RIB sur la page sécurisée Stripe. Le montant sera prélevé dans 30 jours."
          : "La commande est validée tout de suite et la facture, avec nos coordonnées bancaires, part par e-mail. À régler sous 30 jours, par virement ou par carte depuis la facture."}
      </p>
    </div>
  );
}
