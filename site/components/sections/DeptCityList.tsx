"use client";
/**
 * components/sections/DeptCityList.tsx
 * Villes d'un département (cartes DeptCards). Sur téléphone, la liste est repliée derrière
 * « Voir les N villes » pour que la page reste courte ; à partir de md, elle est toujours visible.
 * Les liens restent dans la page (référencement).
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";

export default function DeptCityList({ cities }: { cities: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg bg-white/70 px-3 py-2.5 text-[13px] font-semibold text-ink md:hidden"
      >
        {open ? "Masquer les villes" : `Voir les ${cities.length} villes`}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <ul className={`${open ? "grid" : "hidden"} mt-3 grid-cols-2 gap-1.5 md:mt-0 md:grid`}>
        {cities.map((z) => (
          <li key={z.slug}>
            <Link href={`/zones/${z.slug}`} className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink">
              <MapPin size={10} className="shrink-0 text-accent" />
              {z.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
