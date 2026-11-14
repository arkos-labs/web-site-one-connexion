/**
 * components/sections/Services.tsx
 * "Prestations" — quatre métiers, chacun avec sa procédure propre.
 * Les données proviennent de lib/services : source unique partagée avec
 * les pages de détail, l'index et le sitemap.
 */
import Link from "next/link";
import { Scale, FlaskConical, ShoppingBag, Route, CalendarDays, Building2, Package, type LucideIcon } from "lucide-react";
import { SERVICES } from "@/lib/services";

// Une icône par métier, pour distinguer les cartes d'un coup d'œil.
const ICONS: Record<string, LucideIcon> = {
  "plis-confidentiels": Scale,
  "transport-medical": FlaskConical,
  "livraison-e-commerce": ShoppingBag,
  "tournees-regulieres": Route,
  "transport-evenementiel": CalendarDays,
  "compte-entreprise": Building2,
};

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px] md:py-[104px]">
      <div className="mb-10 grid items-end gap-6 sm:gap-12 md:mb-14 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Prestations
          </div>
          <h2 className="text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">
            Nos services de coursier
          </h2>
        </div>
        <p className="min-w-0 max-w-[52ch] text-pretty text-[16.5px] leading-[1.65] text-muted">
          Un pli d&rsquo;avocat ne se transporte pas comme un prélèvement sanguin
          ou une commande e-commerce. Pour chaque type de course, nos coursiers
          savent ce qu&rsquo;il faut faire avant même de démarrer le scooter.
          Comparez{" "}
          <Link href="/services" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">
            nos services de coursier
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {SERVICES.map((service) => {
          const Icon = ICONS[service.slug] ?? Package;
          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col gap-3.5 border border-line bg-paper-card p-6 text-ink transition-colors hover:border-ink hover:text-ink md:px-[30px] md:pb-[30px] md:pt-[30px]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-ink text-white">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{service.card.tag}</span>
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-[-0.02em]">{service.card.title}</h3>
              <p className="text-[15px] leading-[1.6] text-muted">{service.card.body}</p>
              <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 font-mono text-[11px] tracking-[0.1em] uppercase">
                <span className="text-accent-dark">{service.card.note}</span>
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink">Voir →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
