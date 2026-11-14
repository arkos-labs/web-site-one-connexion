/**
 * components/zones/ZonesDiagram.tsx
 * Plan schématique de l'Île-de-France : une case par département, placée à peu près là où il se
 * trouve autour de Paris, colorée selon sa zone tarifaire. Chaque case mène à la page de sa zone.
 */
import Link from "next/link";
import { ZONES } from "@/lib/pricing";

type Tier = "paris" | "petite" | "grande";

const TILES: { code: string; name: string; tier: Tier; area: string }[] = [
  { code: "95", name: "Val-d'Oise", tier: "grande", area: "col-start-1 col-end-5 row-start-1" },
  { code: "77", name: "Seine-et-Marne", tier: "grande", area: "col-start-5 row-start-1 row-end-5" },
  { code: "78", name: "Yvelines", tier: "grande", area: "col-start-1 row-start-2 row-end-4" },
  { code: "92", name: "Hauts-de-Seine", tier: "petite", area: "col-start-2 row-start-2 row-end-4" },
  { code: "93", name: "Seine-Saint-Denis", tier: "petite", area: "col-start-3 col-end-5 row-start-2" },
  { code: "75", name: "Paris", tier: "paris", area: "col-start-3 row-start-3" },
  { code: "94", name: "Val-de-Marne", tier: "petite", area: "col-start-4 row-start-3" },
  { code: "91", name: "Essonne", tier: "grande", area: "col-start-1 col-end-5 row-start-4" },
];

const TIER: Record<Tier, { href: string; tile: string; swatch: string; label: string; price: string }> = {
  paris: {
    href: "/zones/paris",
    tile: "bg-accent text-white hover:bg-accent-dark hover:text-white",
    swatch: "bg-accent",
    label: "Paris",
    price: `dès ${ZONES.paris.from} € TTC`,
  },
  petite: {
    href: "/zones/petite-couronne",
    tile: "bg-ink text-white hover:bg-ink/85 hover:text-white",
    swatch: "bg-ink",
    label: "Petite couronne",
    price: "dès 39 € TTC",
  },
  grande: {
    href: "/zones/grande-couronne",
    tile: "border border-line bg-paper-card text-ink hover:border-ink hover:text-ink",
    swatch: "border border-line bg-paper-card",
    label: "Grande couronne",
    price: "selon la distance",
  },
};

export default function ZonesDiagram() {
  return (
    <div>
      <div className="grid grid-cols-5 grid-rows-[repeat(4,68px)] gap-1.5">
        {TILES.map((t) => (
          <Link
            key={t.code}
            href={TIER[t.tier].href}
            aria-label={`${t.name} (${t.code}), ${TIER[t.tier].label} : ${TIER[t.tier].price}`}
            className={`flex flex-col items-center justify-center rounded-[2px] px-1 text-center transition-colors ${t.area} ${TIER[t.tier].tile}`}
          >
            <span className="text-[20px] font-bold leading-none tracking-[-0.02em]">{t.code}</span>
            <span className="mt-1 hidden text-[11px] font-medium leading-tight opacity-75 min-[420px]:block">{t.name}</span>
          </Link>
        ))}
      </div>
      <ul className="mt-5 grid gap-2 text-[14px]">
        {(["paris", "petite", "grande"] as Tier[]).map((tier) => (
          <li key={tier} className="flex items-center gap-3">
            <span aria-hidden className={`h-3.5 w-3.5 shrink-0 rounded-[2px] ${TIER[tier].swatch}`} />
            <span className="font-semibold text-ink">{TIER[tier].label}</span>
            <span className="text-muted">{TIER[tier].price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
