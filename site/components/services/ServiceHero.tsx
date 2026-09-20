/**
 * components/services/ServiceHero.tsx
 * Fil d'Ariane, H1 ciblé, chapô, CTA et bandeau de chiffres.
 * Fond sombre : reprend le registre du hero de la homepage.
 */
import Link from "next/link";
import type { Service } from "@/lib/services";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function ServiceHero({ service }: { service: Service }) {
  const subject = encodeURIComponent(`Demande de devis — ${service.card.title}`);

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
        <nav
          aria-label="Fil d’Ariane"
          className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase"
        >
          <Link href="/" className="text-white/40 hover:text-white">
            Accueil
          </Link>
          <span className="px-2 text-white/25">›</span>
          <Link href="/services" className="text-white/40 hover:text-white">
            Prestations
          </Link>
          <span className="px-2 text-white/25">›</span>
          <span className="text-white/70">{service.card.title}</span>
        </nav>

        <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          <span className="h-px w-6 bg-accent" />
          {service.card.tag}
        </div>

        <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
          {service.h1}
        </h1>

        <p className="mb-9 max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
          {service.intro}
        </p>

        <div className="mb-14 flex flex-wrap gap-3">
          <a
            href="/#commander"
            className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark"
          >
            Commander une course
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white"
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        {/* flex-col + order : <dt> doit précéder <dd> dans le DOM (règle
            des listes de définitions), mais la valeur s'affiche au-dessus
            du libellé, comme dans le bloc de stats de la homepage. */}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px border border-white/10 bg-white/10">
          {service.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col bg-ink px-[18px] py-[22px]">
              <dt className="order-2 mt-2 font-mono text-[10px] tracking-[0.12em] text-white/44 uppercase">
                {stat.label}
              </dt>
              <dd className="order-1 text-[26px] font-bold tracking-[-0.02em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
