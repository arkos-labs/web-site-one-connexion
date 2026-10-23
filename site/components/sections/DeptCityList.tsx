"use client";
/**
 * components/sections/DeptCityList.tsx
 * Carte d'un département (DeptCards) : numéro, nom, prix de départ, puis ses villes.
 * Sur téléphone, la carte est une ligne qu'on touche pour ouvrir la liste des villes ;
 * à partir de md, la liste est toujours visible. Les liens restent dans la page (référencement).
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function DeptCityList({
  dept,
  name,
  sub,
  cities,
}: {
  dept: string;
  name: string;
  sub: string;
  cities: { slug: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id={`dept-${dept}`} className="scroll-mt-28 rounded-xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left md:pointer-events-none md:pb-3 md:pt-5"
      >
        <span className="font-mono text-[22px] font-bold leading-none tracking-tight text-accent">{dept}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">{name}</span>
          <span className="block text-[12.5px] text-muted">{sub}</span>
        </span>
        <span className="flex items-center gap-1 text-[12px] font-semibold text-muted md:hidden">
          {cities.length} villes
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <ul className={`${open ? "grid" : "hidden"} grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-4 md:grid`}>
        {cities.map((z) => (
          <li key={z.slug} className="min-w-0">
            <Link href={`/zones/${z.slug}`} className="block truncate text-[13px] text-muted transition-colors hover:text-ink">
              {z.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
