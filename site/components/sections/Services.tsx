/**
 * components/sections/Services.tsx
 * "Prestations" — quatre métiers, chacun avec sa procédure propre.
 * Les données proviennent de lib/services : source unique partagée avec
 * les pages de détail, l'index et le sitemap.
 */
import Link from "next/link";
import { SERVICES } from "@/lib/services";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[104px]">
      <div className="mb-14 grid items-end gap-12 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Prestations
          </div>
          <h2 className="text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">
            Quatre métiers, un même niveau d&rsquo;exigence.
          </h2>
        </div>
        <p className="min-w-0 max-w-[52ch] text-pretty text-[16.5px] leading-[1.65] text-muted">
          Chaque secteur a ses contraintes : signature manuscrite, chaîne du froid,
          créneau de réception. Nos procédures sont écrites par type de flux, pas
          improvisées à la course.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {SERVICES.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="flex flex-col gap-3.5 border border-line bg-paper-card px-[30px] pb-[30px] pt-[34px] text-ink hover:border-ink hover:text-ink"
          >
            <div className="font-mono text-[10px] tracking-[0.16em] text-label uppercase">
              {service.card.tag}
            </div>
            <h3 className="text-xl font-bold tracking-[-0.02em]">{service.card.title}</h3>
            <p className="text-[15px] leading-[1.6] text-muted">{service.card.body}</p>
            <div className="mt-auto flex items-center justify-between gap-4 pt-5 font-mono text-[10.5px] tracking-[0.1em] uppercase">
              <span className="text-accent-dark">{service.card.note}</span>
              <span className="text-label">Voir →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
