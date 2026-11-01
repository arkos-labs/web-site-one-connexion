/**
 * components/zones/PlannedZonePage.tsx
 * Page de ville avec plan SEO (lib/zones/plan.ts) : un H1, exactement quatre H2
 * dans l'ordre du plan, aucun prix. FAQ et appel à l'action restent, sans H2.
 * Le contenu vient des données propres à chaque zone : aucune phrase de
 * remplissage commune à toutes les pages.
 */
import Link from "next/link";
import type { Zone, ZoneFaqItem } from "@/lib/zones/types";
import type { ZonePlan } from "@/lib/zones/plan";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { getColor, getIcon, getIconBg, categoryLabel } from "./sector-style";
import { MapPin, Phone, Clock, CheckCircle, ArrowRight, ChevronRight } from "lucide-react";

const H2 = "text-[clamp(24px,3vw,36px)] font-bold leading-[1.1] tracking-tight text-ink";
const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";
const PILL =
  "flex items-center gap-1.5 rounded-[4px] border border-ink/20 bg-white px-4 py-2 text-[13px] font-bold text-ink transition-all hover:bg-ink hover:text-white";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
      <span className="h-px w-6 bg-accent" />
      {children}
    </div>
  );
}

export default function PlannedZonePage({
  zone,
  plan,
  faqItems,
  related,
}: {
  zone: Zone;
  plan: ZonePlan;
  faqItems: ZoneFaqItem[];
  related: Zone[];
}) {
  const isArr = plan.kind === "arrondissement";
  const inZone = isArr ? `dans le ${zone.name.replace("Paris ", "")} arrondissement` : `à ${zone.name}`;
  const [h2Places, h2Second, h2Third, h2Fourth] = plan.h2;

  const services = [
    { href: "/services/plis-confidentiels", label: "Plis et actes juridiques" },
    { href: "/services/transport-medical", label: "Prélèvements et labos" },
    { href: "/services/livraison-e-commerce", label: "Livraison le jour même" },
    { href: "/services/tournees-regulieres", label: "Navettes entre vos sites" },
  ];

  /* ── Blocs ── */

  const places = (
    <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-[72px]">
      <Eyebrow>Logistique locale</Eyebrow>
      <h2 className={`mb-6 max-w-[28ch] ${H2}`}>{h2Places}</h2>
      {zone.localGuide && (
        <>
          <p className="mb-5 max-w-[60ch] text-[18px] font-bold leading-[1.35] text-ink">{zone.localGuide.title}</p>
          <div className="grid max-w-[68ch] gap-5">
            {zone.localGuide.paragraphs.map((p) => (
              <p key={p} className="text-[16px] leading-[1.7] text-muted">{p}</p>
            ))}
          </div>
        </>
      )}
      {isArr && (
        <p className="mt-5 max-w-[68ch] text-[16px] leading-[1.7] text-muted">{zone.logisticsContext}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        {zone.landmarks.map((l) => (
          <span key={l} className="flex items-center gap-1.5 rounded-[4px] border border-line bg-paper-card px-3 py-1.5 text-[12.5px] text-muted">
            <MapPin size={11} className="shrink-0 text-accent" />
            {l}
          </span>
        ))}
      </div>
    </section>
  );

  const cases = zone.cases && zone.cases.length > 0 && (
    <div className="grid gap-6 md:grid-cols-3">
      {zone.cases.map((c) => (
        <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-3 text-[16px] font-bold leading-tight text-ink">{c.title}</h3>
          <p className="text-[14.5px] leading-[1.7] text-muted">{c.body}</p>
        </div>
      ))}
    </div>
  );

  const tips = zone.tips && zone.tips.length > 0 && (
    <div className="mt-12">
      <p className="mb-5 text-[clamp(20px,2.3vw,26px)] font-bold tracking-tight text-ink">
        Avant de commander {inZone}
      </p>
      <ul className="grid max-w-[78ch] gap-3">
        {zone.tips.map((t) => (
          <li key={t} className="flex items-start gap-3 text-[15px] leading-[1.65] text-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  const sectors = (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {zone.sectors.map((sector) => {
        const Icon = getIcon(sector.name);
        return (
          <div key={sector.name} className={`flex flex-col gap-4 rounded-2xl border p-6 ${getColor(sector.name)}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getIconBg(sector.name)}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-bold text-ink leading-tight">{sector.name}</h3>
            </div>
            <p className="text-[13.5px] leading-[1.65] text-muted flex-1">{sector.example}</p>
            <Link
              href={sector.serviceHref}
              className="self-start rounded-[4px] border border-ink/20 bg-white/60 px-4 py-2 text-[12px] font-bold text-ink transition-all hover:bg-ink hover:text-white flex items-center gap-1.5"
            >
              {sector.serviceLabel}
              <ArrowRight size={11} />
            </Link>
          </div>
        );
      })}
    </div>
  );

  const keyClients = zone.keyClients.length > 0 && (
    <div className="mt-10">
      <p className="mb-4 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">Là où on livre le plus souvent</p>
      <div className="flex flex-wrap gap-3">
        {zone.keyClients.map((client) => (
          <span key={client} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {client}
          </span>
        ))}
      </div>
    </div>
  );

  const relatedGrid = related.length > 0 && (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {related.map((z) => (
        <Link
          key={z.slug}
          href={`/zones/${z.slug}`}
          className="group flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-accent/30 hover:shadow-sm"
        >
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-accent" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{z.dept}</span>
          </div>
          <div className="font-bold text-ink text-[14px] group-hover:text-accent transition-colors">{z.fullName}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-accent mt-auto">
            Voir la zone <ArrowRight size={10} />
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-1 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight size={10} className="text-white/25" />
            <Link href="/zones" className="hover:text-white transition-colors">Zones</Link>
            <ChevronRight size={10} className="text-white/25" />
            {zone.category === "paris" && (
              <>
                <Link href="/zones/paris" className="hover:text-white transition-colors">Paris</Link>
                <ChevronRight size={10} className="text-white/25" />
              </>
            )}
            <span className="text-white/70">{zone.fullName}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <MapPin size={11} className="text-accent" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">
                  {categoryLabel(zone.category)} · {zone.dept}
                </span>
              </div>
              <h1 className="mb-6 text-balance text-[clamp(32px,5vw,60px)] font-bold leading-[1.05] tracking-[-0.035em]">
                {plan.h1}
              </h1>
              <p className="max-w-[60ch] text-pretty text-[17px] leading-[1.65] text-white/66">{zone.intro}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 self-start">
              <div className="mb-5 font-mono text-[10px] tracking-[0.14em] uppercase text-white/30">Infos pratiques</div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={14} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[13px] font-semibold text-white">Un coursier chez vous en moins de 45 min</div>
                    <div className="text-[11px] text-white/40">Du lundi au samedi, de 9 h à 19 h</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[13px] font-semibold text-white">Une course dédiée par envoi</div>
                    <div className="text-[11px] text-white/40">Sans regroupement, remise horodatée</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-2 text-[15px] font-bold text-white hover:text-accent transition-colors">
                  <Phone size={14} className="text-accent" />
                  {PHONE_DISPLAY}
                </a>
                <Link
                  href="/#commander"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[4px] py-3 text-[13px] font-bold transition-opacity hover:opacity-90"
                  style={{ background: "#ed5518", color: "#fff" }}
                >
                  Commander une course
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isArr ? (
        <>
          {/* 1. Rues et quartiers */}
          {places}

          {/* 2. Ce que nous transportons */}
          <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
            <Eyebrow>Tous secteurs</Eyebrow>
            <h2 className={`mb-10 ${H2}`}>{h2Second}</h2>
            {sectors}
            {keyClients}
          </section>

          {/* 3. Organiser une course */}
          <section className="bg-paper border-y border-gray-100">
            <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
              <Eyebrow>Cas concrets</Eyebrow>
              <h2 className={`mb-8 ${H2}`}>{h2Third}</h2>
              {cases}
              {tips}
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/services/coursier-express-paris" className={PILL}>
                  coursier express Paris <ArrowRight size={11} />
                </Link>
                <Link href="/tarifs" className={PILL}>
                  grille tarifaire <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </section>

          {/* 4. Le reste de Paris */}
          <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
            <Eyebrow>Zones proches</Eyebrow>
            <h2 className={`mb-8 ${H2}`}>{h2Fourth}</h2>
            {relatedGrid}
            <div className="mt-8">
              <Link href="/zones/paris" className={PILL}>
                coursier Paris <ArrowRight size={11} />
              </Link>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* 1. Quartiers */}
          {places}

          {/* 2. Courses depuis et vers la commune */}
          <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
            <Eyebrow>Cas concrets</Eyebrow>
            <h2 className={`mb-4 ${H2}`}>{h2Second}</h2>
            <p className="mb-8 max-w-[68ch] text-[16px] leading-[1.7] text-muted">{zone.logisticsContext}</p>
            {cases}
          </section>

          {/* 3. Ce que nous transportons */}
          <section className="bg-paper border-y border-gray-100">
            <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
              <h2 className={`mb-6 ${H2}`}>{h2Third}</h2>
              <div className="flex flex-wrap gap-3">
                {services.map((s) => (
                  <Link key={s.href} href={s.href} className={PILL}>
                    {s.label} <ArrowRight size={11} />
                  </Link>
                ))}
              </div>
              {keyClients}
            </div>
          </section>

          {/* 4. Organiser une course */}
          <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
            <h2 className={`mb-4 ${H2}`}>{h2Fourth}</h2>
            <p className="max-w-[68ch] text-[16px] leading-[1.7] text-muted">
              Vers les communes voisines, voyez notre page{" "}
              <Link href="/zones/petite-couronne" className={LINK}>coursier en petite couronne</Link> ; vers la
              capitale, notre page <Link href="/zones/paris" className={LINK}>coursier Paris</Link>.
            </p>
            {tips}
            {related.length > 0 && (
              <div className="mt-12">
                <p className="mb-6 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">Zones proches</p>
                {relatedGrid}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── FAQ (sans H2 : hors plan) ── */}
      {faqItems.length > 0 && (
        <section className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              <span className="h-px w-6 bg-accent" />
              Questions fréquentes
              <span className="h-px w-6 bg-accent" />
            </div>
            <p className="text-[clamp(24px,3vw,36px)] font-bold tracking-tight text-ink">
              Ce qu&apos;on nous demande souvent {inZone}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {faqItems.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA (sans H2 : hors plan) ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-[42ch] text-[clamp(28px,3vw,42px)] font-bold leading-[1.1] tracking-[-0.02em]">
              Une course urgente {inZone} ?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex items-center justify-center gap-2 rounded-[4px] border border-white/20 px-8 py-4 text-center text-[15px] font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Phone size={15} />
                {PHONE_DISPLAY}
              </a>
              <Link
                href="/#commander"
                className="rounded-[4px] px-8 py-4 text-center text-[15px] font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
                style={{ background: "#ed5518" }}
              >
                Commander une course
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
