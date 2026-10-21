/**
 * components/sections/DeptCards.tsx
 * Une carte par département, avec un lien vers la page de chaque ville qui en a une.
 */
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getIndexedZonesByDept } from "@/lib/zones/data";

export type DeptCard = { dept: string; name: string; color: string; dotColor: string; sub: string };

export const DEPT_CARDS: Record<string, DeptCard> = {
  "92": { dept: "92", name: "Hauts-de-Seine", color: "border-blue-200 bg-blue-50", dotColor: "bg-blue-500", sub: "Petite couronne · dès 59 € TTC" },
  "93": { dept: "93", name: "Seine-Saint-Denis", color: "border-green-200 bg-green-50", dotColor: "bg-green-500", sub: "Petite couronne · dès 59 € TTC" },
  "94": { dept: "94", name: "Val-de-Marne", color: "border-orange-200 bg-orange-50", dotColor: "bg-orange-500", sub: "Petite couronne · dès 59 € TTC" },
  "77": { dept: "77", name: "Seine-et-Marne", color: "border-violet-200 bg-violet-50", dotColor: "bg-violet-500", sub: "Grande couronne · dès 76 € TTC" },
  "78": { dept: "78", name: "Yvelines", color: "border-sky-200 bg-sky-50", dotColor: "bg-sky-500", sub: "Grande couronne · dès 62 € TTC" },
  "91": { dept: "91", name: "Essonne", color: "border-rose-200 bg-rose-50", dotColor: "bg-rose-500", sub: "Grande couronne · dès 62 € TTC" },
  "95": { dept: "95", name: "Val-d'Oise", color: "border-amber-200 bg-amber-50", dotColor: "bg-amber-500", sub: "Grande couronne · dès 60 € TTC" },
};

export default function DeptCards({ depts }: { depts: string[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {depts.map((code) => {
        const d = DEPT_CARDS[code];
        return (
          <div key={d.dept} id={`dept-${d.dept}`} className={`scroll-mt-28 rounded-2xl border p-6 ${d.color}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.dotColor} text-[13px] font-bold text-white`}>
                {d.dept}
              </div>
              <div>
                <h3 className="font-bold text-ink">{d.name}</h3>
                <div className="text-[12px] text-muted">{d.sub}</div>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-1.5">
              {getIndexedZonesByDept(d.dept).map((z) => (
                <li key={z.slug}>
                  <Link href={`/zones/${z.slug}`} className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink">
                    <MapPin size={10} className="shrink-0 text-accent" />
                    {z.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
