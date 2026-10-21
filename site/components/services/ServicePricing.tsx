/**
 * components/services/ServicePricing.tsx
 * Tarifs d'une prestation : la grille officielle (lib/pricing, TTC et HT), présentée pour ce service
 * avec ses formules conseillées et son conseil propre.
 */
import Link from "next/link";
import { gridPrice, splitTTC, type Zone } from "@/lib/pricing";
import type { ServicePricing as Pricing } from "@/lib/services/types";

const ZONES: { zone: Zone; label: string; dept: string }[] = [
  { zone: 0, label: "Paris", dept: "75" },
  { zone: 1, label: "Petite couronne", dept: "92, 93, 94" },
  { zone: 2, label: "Grande couronne", dept: "77, 78, 91, 95" },
];

const FORMULES = {
  standard: "Normal · 3 h",
  urgent: "Urgent · 1 h 30",
  flash: "Super · 1 h",
  navette: "Navette · par passage",
} as const;

const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

export default function ServicePricing({ pricing }: { pricing: Pricing }) {
  const navette = pricing.recommended.includes("navette");
  const columns = (navette ? ["navette"] : ["standard", "urgent", "flash"]) as (keyof typeof FORMULES)[];

  return (
    <div>
      <p className="mb-8 max-w-[68ch] text-[16.5px] leading-[1.65] text-muted">{pricing.intro}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Zone</th>
              {columns.map((c) => (
                <th key={c} className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">
                  {FORMULES[c]}
                  {!navette && pricing.recommended.includes(c) && (
                    <span className="ml-2 rounded-sm bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent-dark">Conseillé</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ZONES.map(({ zone, label, dept }) => (
              <tr key={zone}>
                <td className="py-4 pr-6">
                  <div className="font-medium text-ink">{label}</div>
                  <div className="font-mono text-[12px] text-muted">{dept}</div>
                </td>
                {columns.map((c) => {
                  const ttc = gridPrice(c, zone);
                  const highlight = navette || pricing.recommended.includes(c);
                  return (
                    <td key={c} className={`py-4 pr-6 ${highlight ? "" : "opacity-60"}`}>
                      <div className="font-semibold text-ink">{navette || zone === 2 ? `dès ${euro(ttc)}` : euro(ttc)} TTC</div>
                      <div className="text-[12px] text-muted">{euro(splitTTC(ttc).ht)} HT</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-[68ch] border-l-2 border-accent pl-4 text-[15px] leading-[1.6] text-ink">{pricing.note}</p>
      <p className="mt-4 text-[12.5px] text-muted">
        Prix par course, TVA 20 % comprise. Le prix dépend de la zone la plus éloignée du trajet et du délai, jamais du contenu. En grande couronne, il suit la distance depuis Paris.{" "}
        <Link href="/tarifs" className="font-semibold text-accent-dark hover:underline">Grille complète</Link>
      </p>
    </div>
  );
}
