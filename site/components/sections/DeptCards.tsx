/**
 * components/sections/DeptCards.tsx
 * Une carte par département, avec un lien vers la page de chaque ville qui en a une
 * (liste repliée sur téléphone, voir DeptCityList).
 */
import DeptCityList from "./DeptCityList";
import { getIndexedZonesByDept } from "@/lib/zones/data";

export type DeptCard = { dept: string; name: string; color: string; dotColor: string; sub: string };

export const DEPT_CARDS: Record<string, DeptCard> = {
  "92": { dept: "92", name: "Hauts-de-Seine", color: "border-blue-200 bg-blue-50", dotColor: "bg-blue-500", sub: "Petite couronne · dès 28 € TTC" },
  "93": { dept: "93", name: "Seine-Saint-Denis", color: "border-green-200 bg-green-50", dotColor: "bg-green-500", sub: "Petite couronne · dès 28 € TTC" },
  "94": { dept: "94", name: "Val-de-Marne", color: "border-orange-200 bg-orange-50", dotColor: "bg-orange-500", sub: "Petite couronne · dès 28 € TTC" },
  "77": { dept: "77", name: "Seine-et-Marne", color: "border-violet-200 bg-violet-50", dotColor: "bg-violet-500", sub: "Grande couronne · dès 76 € TTC" },
  "78": { dept: "78", name: "Yvelines", color: "border-sky-200 bg-sky-50", dotColor: "bg-sky-500", sub: "Grande couronne · dès 62 € TTC" },
  "91": { dept: "91", name: "Essonne", color: "border-rose-200 bg-rose-50", dotColor: "bg-rose-500", sub: "Grande couronne · dès 62 € TTC" },
  "95": { dept: "95", name: "Val-d'Oise", color: "border-amber-200 bg-amber-50", dotColor: "bg-amber-500", sub: "Grande couronne · dès 60 € TTC" },
};

export default function DeptCards({ depts }: { depts: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {depts.map((code) => {
        const d = DEPT_CARDS[code];
        return (
          <DeptCityList
            key={d.dept}
            dept={d.dept}
            name={d.name}
            sub={d.sub}
            cities={getIndexedZonesByDept(d.dept).map((z) => ({ slug: z.slug, name: z.name }))}
          />
        );
      })}
    </div>
  );
}
