/**
 * app/zones/[slug]/page.tsx
 * Pages programmatiques SEO — une page par arrondissement / ville.
 * Couvre les 6 secteurs (juridique, médical, e-commerce, corporate,
 * événementiel, grands comptes) avec du contenu spécifique à chaque zone.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL, EMAIL } from "@/lib/site-content";
import { ZONES, getZone } from "@/lib/zones/data";
import {
  Scale, Activity, ShoppingBag, Briefcase, Stethoscope, Building2,
  MapPin, Phone, Clock, CheckCircle, ArrowRight, ChevronRight
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Props = {
  params: Promise<{ slug: string }>;
};

/* ─── Static params ─────────────────────────────────────────────────────── */

export async function generateStaticParams() {
  return ZONES.map((zone) => ({ slug: zone.slug }));
}

/* ─── Metadata ──────────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const zone = getZone(slug);
  if (!zone) return {};

  return {
    title: zone.seo.title,
    description: zone.seo.description,
    keywords: zone.seo.keywords,
    alternates: { canonical: `/zones/${slug}` },
    openGraph: {
      title: zone.seo.title,
      description: zone.seo.description,
      url: `/zones/${slug}`,
      type: "website",
      locale: "fr_FR",
    },
    robots: { index: true, follow: true },
  };
}

/* ─── Icônes par secteur ─────────────────────────────────────────────────── */

const SECTOR_ICONS: Record<string, React.ElementType> = {
  "Juridique & Notarial":   Scale,
  "Médical & Laboratoires": Activity,
  "E-commerce & Luxe":      ShoppingBag,
  "Corporate & Agences":    Briefcase,
  "Événementiel":           Stethoscope,
  "Grands comptes":         Building2,
  // fallbacks
  "Médical":                Activity,
  "E-commerce":             ShoppingBag,
};

const SECTOR_COLORS: Record<string, string> = {
  "Juridique & Notarial":   "border-blue-200 bg-blue-50",
  "Médical & Laboratoires": "border-green-200 bg-green-50",
  "E-commerce & Luxe":      "border-orange-200 bg-orange-50",
  "Corporate & Agences":    "border-purple-200 bg-purple-50",
  "Événementiel":           "border-pink-200 bg-pink-50",
  "Grands comptes":         "border-gray-200 bg-gray-50",
  "Médical":                "border-green-200 bg-green-50",
  "E-commerce":             "border-orange-200 bg-orange-50",
};

const SECTOR_ICON_BG: Record<string, string> = {
  "Juridique & Notarial":   "bg-blue-100 text-blue-700",
  "Médical & Laboratoires": "bg-green-100 text-green-700",
  "E-commerce & Luxe":      "bg-orange-100 text-orange-700",
  "Corporate & Agences":    "bg-purple-100 text-purple-700",
  "Événementiel":           "bg-pink-100 text-pink-700",
  "Grands comptes":         "bg-gray-100 text-gray-700",
  "Médical":                "bg-green-100 text-green-700",
  "E-commerce":             "bg-orange-100 text-orange-700",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getIcon(name: string): React.ElementType {
  return SECTOR_ICONS[name] ?? Briefcase;
}

function getColor(name: string): string {
  return SECTOR_COLORS[name] ?? "border-gray-200 bg-gray-50";
}

function getIconBg(name: string): string {
  return SECTOR_ICON_BG[name] ?? "bg-gray-100 text-gray-700";
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    "paris":            "Paris intramuros",
    "hauts-de-seine":   "Hauts-de-Seine (92)",
    "seine-saint-denis":"Seine-Saint-Denis (93)",
    "val-de-marne":     "Val-de-Marne (94)",
  };
  return map[cat] ?? cat;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function ZonePage({ params }: Props) {
  const { slug } = await params;
  const zone = getZone(slug);
  if (!zone) notFound();

  /* Schémas JSON-LD */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Zones", item: `${SITE_URL}/zones` },
      { "@type": "ListItem", position: 3, name: categoryLabel(zone.category), item: `${SITE_URL}/zones/${zone.category === "paris" ? "paris" : zone.category}` },
      { "@type": "ListItem", position: 4, name: zone.fullName, item: `${SITE_URL}/zones/${slug}` },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MovingCompany"],
    "@id": `${SITE_URL}/zones/${slug}#business`,
    name: "ONE CONNEXION",
    description: zone.seo.description,
    url: `${SITE_URL}/zones/${slug}`,
    telephone: PHONE_TEL,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 Square Nungesser",
      addressLocality: "Saint-Mandé",
      postalCode: "94160",
      addressRegion: "Île-de-France",
      addressCountry: "FR",
    },
    areaServed: {
      "@type": "City",
      name: zone.fullName,
      containsPlace: zone.landmarks.map((l) => ({
        "@type": "LandmarksOrHistoricalBuildings",
        name: l,
      })),
    },
    openingHours: "Mo-Su 07:00-23:00",
    priceRange: zone.pricingZone === "standard" ? "€€" : "Sur devis",
  };

  /* Zones voisines à suggérer */
  const related = ZONES.filter(
    (z) => z.slug !== slug && (z.category === zone.category || z.dept.startsWith(zone.dept.slice(0, 2)))
  ).slice(0, 4);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={localBusinessSchema} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          {/* Fil d'Ariane */}
          <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-1 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight size={10} className="text-white/25" />
            <Link href="/zones" className="hover:text-white transition-colors">Zones</Link>
            <ChevronRight size={10} className="text-white/25" />
            <span className="text-white/70">{zone.fullName}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            <div>
              {/* Tag département */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <MapPin size={11} className="text-accent" />
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">
                  {categoryLabel(zone.category)} · {zone.dept}
                </span>
              </div>

              <h1 className="mb-6 text-balance text-[clamp(32px,5vw,60px)] font-bold leading-[1.05] tracking-[-0.035em]">
                Coursier express<br />
                <span style={{ color: "#ed5518" }}>{zone.name}</span>
              </h1>

              <p className="mb-8 max-w-[60ch] text-pretty text-[17px] leading-[1.65] text-white/66">
                {zone.intro}
              </p>

              {/* Landmarks */}
              <div className="flex flex-wrap gap-2">
                {zone.landmarks.map((l) => (
                  <span key={l} className="rounded-[4px] border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/50">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Carte info rapide */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 self-start">
              <div className="mb-5 font-mono text-[10px] tracking-[0.14em] uppercase text-white/30">Infos pratiques</div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={14} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[13px] font-semibold text-white">Enlèvement &lt; 45 min</div>
                    <div className="text-[11px] text-white/40">7j/7, 7h–23h</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {zone.distanceParis ?? "Paris & petite couronne"}
                    </div>
                    <div className="text-[11px] text-white/40">Depuis notre siège Saint-Mandé</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      Tarif {zone.pricingZone === "standard" ? "standard" : "sur devis"}
                    </div>
                    <div className="text-[11px] text-white/40">Facturation à la course ou mensuelle</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-6">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-2 text-[15px] font-bold text-white hover:text-accent transition-colors"
                >
                  <Phone size={14} className="text-accent" />
                  {PHONE_DISPLAY}
                </a>
                <Link
                  href="/#contact"
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

      {/* ── Contexte logistique ──────────────────────────────────────────── */}
      <section className="bg-paper border-b border-gray-100">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-12">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 items-center">
            <div>
              <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                <span className="h-px w-6 bg-accent" />
                Logistique locale
              </div>
              <h2 className="mb-4 text-[clamp(22px,2.5vw,30px)] font-bold tracking-tight text-ink">
                Notre connaissance du terrain à {zone.name}
              </h2>
              <p className="text-[15px] leading-[1.7] text-muted max-w-[60ch]">
                {zone.logisticsContext}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: "Réactivité", value: "< 45 min" },
                { icon: MapPin, label: "Couverture", value: "Toute la zone" },
                { icon: CheckCircle, label: "Traçabilité", value: "100% des courses" },
                { icon: Phone, label: "Disponibilité", value: "7j/7 · 7h–23h" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-4">
                    <Icon size={16} className="mb-2 text-accent" />
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted mb-1">{item.label}</div>
                    <div className="text-[14px] font-bold text-ink">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Secteurs ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Tous secteurs
          </div>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-tight text-ink">
            Nos solutions à {zone.name}, secteur par secteur
          </h2>
          <p className="mt-3 text-[15px] text-muted max-w-[58ch]">
            Chaque métier a ses contraintes. Nos procédures s&apos;adaptent à votre secteur,
            avec des exemples concrets dans votre zone.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {zone.sectors.map((sector) => {
            const Icon = getIcon(sector.name);
            const cardColor = getColor(sector.name);
            const iconBg = getIconBg(sector.name);
            return (
              <div key={sector.name} className={`flex flex-col gap-4 rounded-2xl border p-6 ${cardColor}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-ink leading-tight">{sector.name}</h3>
                  </div>
                </div>
                <p className="text-[13.5px] leading-[1.65] text-muted flex-1">
                  {sector.example}
                </p>
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
      </section>

      {/* ── Clients types ────────────────────────────────────────────────── */}
      {zone.keyClients.length > 0 && (
        <section className="bg-paper border-y border-gray-100">
          <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-16">
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                <span className="h-px w-6 bg-accent" />
                Ils nous font confiance
              </div>
              <h2 className="text-[clamp(20px,2.5vw,28px)] font-bold text-ink">
                Nos clients types à {zone.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {zone.keyClients.map((client) => (
                <span
                  key={client}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {client}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Comment ça marche ──────────────────────────────────────────── */}
      <section className="bg-paper border-t border-gray-100">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="mb-12 text-center">
            <div className="mb-3 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              <span className="h-px w-6 bg-accent" />
              Processus simple
              <span className="h-px w-6 bg-accent" />
            </div>
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-tight text-ink">
              Votre course à {zone.name} en 3 étapes
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Demande immédiate", desc: "Contactez-nous par téléphone ou via notre formulaire. Devis en moins de 2 minutes." },
              { num: "02", title: "Enlèvement < 45 min", desc: `Un coursier spécialisé se présente à vos bureaux à ${zone.name} en moins de 45 minutes.` },
              { num: "03", title: "Livraison & Suivi", desc: "Suivez l'acheminement en temps réel jusqu'à la signature électronique à la réception." }
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="absolute -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white shadow-md">
                  {step.num}
                </div>
                <h3 className="mt-4 mb-3 text-[18px] font-bold text-ink">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-20">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Questions fréquentes
            <span className="h-px w-6 bg-accent" />
          </div>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-tight text-ink">
            Vos questions sur nos services à {zone.name}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { q: `Quels sont les délais d'enlèvement à ${zone.name} ?`, a: `Pour toute urgence, un coursier intervient à ${zone.name} en moins de 45 minutes après validation de la commande, quel que soit le quartier.` },
            { q: `Effectuez-vous des livraisons volumineuses depuis ${zone.name} ?`, a: "Oui, notre flotte comprend des motos, mais aussi des utilitaires et camions de 20m³ pour répondre à tous vos besoins de fret léger et lourd." },
            { q: `Puis-je regrouper mes expéditions depuis ${zone.name} ?`, a: "Absolument. Nous proposons des tournées régulières et la création de comptes entreprise pour optimiser vos coûts logistiques au quotidien." }
          ].map((faq, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-accent/30 transition-colors">
              <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
              <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[42ch]">
              <h2 className="mb-4 text-[clamp(28px,3vw,42px)] font-bold leading-[1.1] tracking-[-0.02em]">
                Une course urgente à {zone.name} ?
              </h2>
              <p className="text-[16px] text-white/60 leading-[1.6]">
                Appelez-nous ou décrivez votre besoin — nous intervenons dans les 45 minutes pour assurer la continuité de votre activité.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex items-center justify-center gap-2 rounded-[4px] border border-white/20 px-8 py-4 text-center text-[15px] font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Phone size={15} />
                {PHONE_DISPLAY}
              </a>
              <Link
                href="/#contact"
                className="rounded-[4px] px-8 py-4 text-center text-[15px] font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
                style={{ background: "#ed5518" }}
              >
                Commander une course
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zones voisines ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-16">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
              <span className="h-px w-6 bg-accent" />
              Zones proches
            </div>
            <h2 className="text-[clamp(20px,2.5vw,26px)] font-bold text-ink">
              Nous intervenons aussi dans ces zones
            </h2>
          </div>
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
                <div className="text-[12px] text-muted line-clamp-2">{z.seo.description.split(".")[0]}.</div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-accent mt-auto">
                  Voir la zone <ArrowRight size={10} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
