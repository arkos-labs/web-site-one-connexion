/**
 * app/zones/paris/page.tsx
 * Page locale "Coursier Paris intramuros" — cible les requêtes
 * géo-localisées "coursier Paris 75", "livraison express Paris intramuros".
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { Clock, MapPin, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Coursier Paris intramuros — Livraison express 75 | ONE CONNEXION",
  description:
    "Coursier moto dédié dans tout Paris intramuros (1er–20e). Enlèvement en moins de 45 min, suivi GPS en temps réel, preuve de remise horodatée. Devis gratuit sous 2 h.",
  alternates: { canonical: "/zones/paris" },
  openGraph: {
    title: "Coursier Paris intramuros — ONE CONNEXION",
    description: "Livraison express dans tout Paris (75). Course dédiée, sans regroupement, remise contre signature.",
    url: "/zones/paris",
    type: "website",
    locale: "fr_FR",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Zones", item: `${SITE_URL}/zones` },
    { "@type": "ListItem", position: 3, name: "Paris intramuros", item: `${SITE_URL}/zones/paris` },
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ONE CONNEXION — Coursier Paris",
  telephone: PHONE_TEL,
  areaServed: {
    "@type": "City",
    name: "Paris",
    containedInPlace: { "@type": "AdministrativeArea", name: "Île-de-France" },
  },
  url: `${SITE_URL}/zones/paris`,
};

const ARRONDISSEMENTS = [
  "1er — Louvre, Châtelet", "2e — Bourse", "3e — Le Marais", "4e — Île de la Cité",
  "5e — Quartier Latin", "6e — Saint-Germain", "7e — Tour Eiffel", "8e — Champs-Élysées",
  "9e — Opéra", "10e — Gare du Nord / Est", "11e — Bastille", "12e — Gare de Lyon",
  "13e — Italie", "14e — Montparnasse", "15e — Vaugirard", "16e — Trocadéro",
  "17e — Batignolles", "18e — Montmartre", "19e — Buttes-Chaumont", "20e — Belleville",
];

const STATS = [
  { value: "< 30 min", label: "Délai moyen intramuros" },
  { value: "99,4 %", label: "Ponctualité constatée" },
  { value: "7j/7", label: "7h–23h" },
  { value: "20/20", label: "Arrondissements couverts" },
];

export default function ZoneParis() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={localBusinessSchema} />

      {/* ── Hero ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <Link href="/zones" className="hover:text-white">Zones</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Paris (75)</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Zone couverte · Paris 75
          </div>
          <h1 className="mb-6 max-w-[20ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier express dans tout Paris intramuros.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion couvre les 20 arrondissements de Paris avec sa flotte de
            scooters et motos. Enlèvement en moins de 45 minutes, suivi GPS en
            continu, preuve de remise électronique à chaque livraison.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={`tel:${PHONE_TEL}`}
              className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark"
            >
              Commander une course
            </a>
            <Link
              href="/tarifs"
              className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
        {/* Stats */}
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-white/10 px-[clamp(20px,4vw,28px)] md:grid-cols-4 md:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-[clamp(22px,2.5vw,30px)] font-bold text-white">{s.value}</span>
                <span className="mt-1 text-[12px] font-medium text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Arrondissements ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Couverture complète
        </div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Les 20 arrondissements, sans exception.
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ARRONDISSEMENTS.map((arr) => {
            const match = arr.match(/^(\d+(?:er|e))/);
            const slug = match ? `paris-${match[1]}` : "";
            return (
              <Link key={arr} href={`/zones/${slug}`} className="flex items-center gap-2 rounded-lg border border-line bg-paper-card px-3 py-2.5 transition-colors hover:border-accent">
                <MapPin size={12} className="shrink-0 text-accent" />
                <span className="text-[13px] text-muted hover:text-ink">{arr}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Avantages intramuros ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Pourquoi choisir One Connexion à Paris
          </div>
          <h2 className="mb-14 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Conçu pour la densité parisienne.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Scooters électriques & 125cc", desc: "Nos scooters naviguent dans les rues les plus denses sans subir les restrictions ZFE. Idéals pour les livraisons hyper-centre." },
              { icon: Clock, title: "Enlèvement < 45 min", desc: "Le coursier le plus proche est dispatché dès la confirmation. Le temps de trajet moyen dans Paris intramuros est inférieur à 30 minutes." },
              { icon: Shield, title: "Zone piétonne & accès restreint", desc: "Nos coursiers connaissent les accès réglementés (Marais, île de la Cité, quartier Latin). Aucune mission refusée pour cause de restriction." },
              { icon: MapPin, title: "Tous les sites judiciaires", desc: "Palais de Justice, Tribunal de Commerce, Conseil d'État, Cour de Cassation : tous couverts aux mêmes conditions tarifaires." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Icon size={18} className="text-accent" strokeWidth={2} />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-[14px] leading-[1.65] text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-paper border-t border-gray-100">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase text-center">Processus simple</div>
          <h2 className="mb-12 text-center text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Votre livraison dans la capitale en 3 étapes.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Demande immédiate", desc: "Contactez-nous pour une course urgente. Un devis transparent vous est fourni sur-le-champ pour n'importe quel arrondissement." },
              { num: "02", title: "Enlèvement express", desc: "Un coursier expérimenté se faufile dans le trafic parisien pour récupérer votre pli en moins de 45 minutes." },
              { num: "03", title: "Preuve de livraison", desc: "Suivez le trajet en direct. Une fois le pli remis en main propre, recevez une notification instantanée avec signature." }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-line shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-[16px] font-bold text-white shadow-md">
                  {step.num}
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-ink">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prestations ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations parisiennes</div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Une solution pour chaque urgence intramuros.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-line bg-paper-card p-6 hover:border-ink transition-colors"
            >
              <div className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">{s.card.tag}</div>
              <h3 className="font-bold tracking-[-0.01em]">{s.card.title}</h3>
              <p className="text-[13.5px] leading-[1.55] text-muted flex-1">{s.card.body}</p>
              <div className="mt-4 font-mono text-[10px] tracking-[0.1em] text-accent-dark uppercase">Voir →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Foire Aux Questions</div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Livrer à Paris : vos questions fréquentes
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { q: "Comment gérez-vous la circulation parisienne (ZFE, embouteillages) ?", a: "Notre flotte est majoritairement composée de deux-roues et de véhicules récents répondant aux normes Crit'Air. Nos coursiers expérimentés connaissent les meilleurs itinéraires pour éviter les axes engorgés." },
              { q: "Quels sont les horaires d'enlèvement à Paris intramuros ?", a: "Nous opérons 7j/7, de 7h à 23h. En journée, nous garantissons un enlèvement en moins de 45 minutes quel que soit l'arrondissement." },
              { q: "Livrez-vous aussi bien les particuliers que les entreprises ?", a: "Notre service est principalement orienté B2B (plis confidentiels, médical, événementiel) mais nous assurons également la livraison du dernier kilomètre pour les commandes e-commerce premium destinées aux particuliers." }
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course à Paris maintenant ?
              </h2>
              <p className="text-[15px] text-white/60">Dispatch en moins de 2 minutes, 7j/7 de 7h à 23h.</p>
            </div>
            <a
              href={`tel:${PHONE_TEL}`}
              className="rounded-[4px] bg-accent px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-accent-dark"
            >
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
