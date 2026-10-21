/**
 * components/sections/CityLinks.tsx
 * Liste compacte des villes desservies, groupées par département.
 */
import Link from "next/link";
import { getIndexedZonesByDept } from "@/lib/zones/data";
import { DEPT_CARDS } from "./DeptCards";

export default function CityLinks({ depts }: { depts: string[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {depts.map((code) => (
        <div key={code}>
          <div className="mb-3 text-[13px] font-bold text-ink">
            {DEPT_CARDS[code].name} ({code})
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {getIndexedZonesByDept(code).map((z) => (
              <li key={z.slug}>
                <Link href={`/zones/${z.slug}`} className="text-[13px] text-muted underline-offset-2 transition-colors hover:text-ink hover:underline">
                  {z.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
