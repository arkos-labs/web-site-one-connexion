/**
 * components/sections/References.tsx
 * "Références" — chiffres tenus sur la durée + témoignages
 * (masquables via SHOW_TESTIMONIALS en attendant les vrais retours clients).
 */
import { SHOW_TESTIMONIALS } from "@/lib/site-content";

const STATS = [
  { value: "12 000+", label: "Courses livrées" },
  { value: "98 %", label: "Livrées dans le créneau" },
  { value: "4,9/5", label: "Satisfaction clients" },
];

// PLACEHOLDER : témoignages réels à intégrer avant mise en ligne.
const TESTIMONIALS = [
  "« [Témoignage à remplacer — remise contre signature, traçabilité, réactivité : le retour d'un client réel viendra ici.] »",
  "« [Deuxième témoignage à remplacer — idéalement un cabinet ou un laboratoire, avec un cas précis et un délai chiffré.] »",
];

export default function References({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  return (
    <section id="references" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[104px]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-14">
        <div className="min-w-0">
          {!hideHeader && (
            <>
              <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
                Références
              </div>
              <h2 className="mb-8 max-w-[22ch] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
                Des chiffres tenus sur la durée.
              </h2>
            </>
          )}
          <div className="grid gap-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={i < STATS.length - 1 ? "border-b border-line pb-[22px]" : ""}
              >
                <div className="text-[clamp(34px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
                  {stat.value}
                </div>
                <div className="mt-2.5 font-mono text-[10.5px] tracking-[0.14em] text-label uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {SHOW_TESTIMONIALS && (
          <div className="grid min-w-0 gap-5">
            {TESTIMONIALS.map((quote) => (
              <blockquote key={quote} className="border border-line bg-paper-card p-8">
                <p className="mb-6 text-pretty text-[17px] leading-[1.6]">{quote}</p>
                <footer className="flex items-center gap-3.5">
                  <span className="block h-10 w-10 border border-dashed border-[#C9C4BB]" />
                  <span className="font-mono text-[10.5px] leading-relaxed tracking-[0.12em] text-label uppercase">
                    Nom du client
                    <br />
                    Fonction — entreprise
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
