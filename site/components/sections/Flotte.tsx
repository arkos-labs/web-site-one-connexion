/**
 * components/sections/Flotte.tsx
 * "Flotte & couverture" — chiffres opérationnels, photo flotte
 * (placeholder en attente d'un vrai visuel) et zones couvertes.
 */
import { FOUNDED_YEAR } from "@/lib/site-content";

const STATS = [
  { value: "18 kg", label: "Charge par course" },
  { value: "60 × 40 cm", label: "Volume top-case" },
  { value: "3,5 M€", label: "Assurance marchandises" },
];

const COVERAGE = ["Paris 1–20", "92", "93", "94", "Roissy · Orly sur devis"];

export default function Flotte({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  return (
    <section id="flotte" className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-14 px-[clamp(20px,4vw,28px)] py-10">
        <div className="min-w-0">
          {!hideHeader && (
            <>
              <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                Flotte &amp; couverture
              </div>
              <h2 className="mb-[22px] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
                Paris et la petite couronne, en deux-roues.
              </h2>
            </>
          )}
          <p className="mb-[34px] max-w-[50ch] text-pretty text-[16.5px] leading-[1.65] text-white/66">
            Scooters électriques et motos pour les distances longues. Le deux-roues
            reste le seul format qui ne subit ni les bouchons ni les zones à trafic
            limité.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px border border-white/10 bg-white/10">
            <div className="bg-ink px-[18px] py-[22px]">
              <div className="text-[26px] font-bold tracking-[-0.02em]">{FOUNDED_YEAR}</div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.12em] text-white/44 uppercase">
                Année de création
              </div>
            </div>
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-ink px-[18px] py-[22px]">
                <div className="text-[26px] font-bold tracking-[-0.02em]">{stat.value}</div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.12em] text-white/44 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          {/* Carte de la zone de couverture (Île-de-France) — figée, non interactive. */}
          <div className="relative aspect-[4/3] overflow-hidden border border-white/12">
            <iframe
              title="Zone de couverture One Connexion — Île-de-France"
              src="https://www.google.com/maps?ll=48.7,2.5&hl=fr&z=9&output=embed"
              className="pointer-events-none h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
            />
            {/* Calque invisible : empêche tout clic/scroll/drag d'atteindre la carte (figée). */}
            <div className="absolute inset-0" />
          </div>
          <div className="mt-4 flex items-stretch divide-x divide-white/10 border border-white/10 bg-white/[0.03]">
            {COVERAGE.map((zone) => (
              <div
                key={zone}
                className="flex-1 whitespace-nowrap px-3 py-3 text-center font-mono text-[10.5px] tracking-[0.1em] text-white/60 uppercase"
              >
                {zone}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
