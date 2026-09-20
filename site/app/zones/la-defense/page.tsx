/**
 * app/zones/la-defense/page.tsx
 * Page locale "Coursier La Défense & Hauts-de-Seine (92)".
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Coursier La Défense & Hauts-de-Seine (92) — Livraison express | ONE CONNEXION",
  description:
    "Coursier moto dédié à La Défense, Nanterre, Neuilly, Boulogne-Billancourt et tout le 92. Enlèvement < 45 min, suivi en temps réel. Devis sous 2 h.",
  alternates: { canonical: "/zones/la-defense" },
  openGraph: {
    title: "Coursier La Défense & Hauts-de-Seine — ONE CONNEXION",
    description: "Livraison express professionnelle à La Défense et dans tout le 92. Course dédiée, sans regroupement.",
    url: "/zones/la-defense",
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
    { "@type": "ListItem", position: 3, name: "La Défense & 92", item: `${SITE_URL}/zones/la-defense` },
  ],
};

const VILLES = [
  "La Défense", "Nanterre", "Neuilly-sur-Seine", "Boulogne-Billancourt",
  "Levallois-Perret", "Issy-les-Moulineaux", "Clamart", "Châtillon",
  "Montrouge", "Antony", "Suresnes", "Puteaux",
  "Courbevoie", "Asnières-sur-Seine", "Colombes", "Gennevilliers",
];

const STATS = [
  { value: "< 45 min", label: "Prise en charge" },
  { value: "99,4 %", label: "Ponctualité" },
  { value: "7j/7", label: "7h–23h" },
  { value: "92", label: "Dépt. couvert" },
];

export default function ZonelaDefense() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <Link href="/zones" className="hover:text-white">Zones</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">La Défense & Hauts-de-Seine (92)</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Zone couverte · Hauts-de-Seine 92
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier express à La Défense et dans les Hauts-de-Seine.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            La Défense concentre une densité exceptionnelle de sièges sociaux, de
            directions juridiques et de cabinets de conseil. One Connexion intervient
            dans tout le 92 avec le même niveau d'exigence qu'à Paris intramuros.
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

      {/* ── Villes couvertes ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Couverture 92</div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Tout le département Hauts-de-Seine.
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VILLES.map((v) => {
            const slug = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
            return (
              <Link key={v} href={`/zones/${slug}`} className="flex items-center gap-2 rounded-lg border border-line bg-paper-card px-3 py-2.5 transition-colors hover:border-accent">
                <MapPin size={12} className="shrink-0 text-accent" />
                <span className="text-[13px] text-muted hover:text-ink">{v}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Contexte La Défense ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Particularités du secteur</div>
          <h2 className="mb-8 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            La Défense, un territoire logistique à part.
          </h2>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <p>
              Le quartier d'affaires de La Défense regroupe les sièges de nombreuses multinationales, des
              cabinets juridiques de grande taille et des directions financières soumises à des délais
              contractuels stricts. Les livraisons y exigent souvent une procédure d'accueil spécifique
              (badge, interlocuteur désigné) que nos coursiers anticipent à chaque mission.
            </p>
            <p>
              Les motos routières de notre flotte (300–600cc) sont adaptées aux axes autoroutiers
              (A14, A86, périphérique) qui relient La Défense à Paris et aux autres pôles du 92.
              Le temps de trajet moyen La Défense ↔ Paris Centre est inférieur à 20 minutes en
              dehors des pointes de trafic.
            </p>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-paper border-t border-gray-100">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase text-center">Processus simple</div>
          <h2 className="mb-12 text-center text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Votre livraison dans le 92 en 3 étapes.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Demande immédiate", desc: "Contactez-nous par téléphone ou formulaire. Un devis vous est communiqué instantanément pour les courses express dans le 92." },
              { num: "02", title: "Prise en charge rapide", desc: "Un coursier dédié se présente à l'adresse indiquée (La Défense, Nanterre, etc.) en moins de 45 minutes." },
              { num: "03", title: "Suivi & Confirmation", desc: "Suivez votre course en temps réel et recevez une notification dès que le pli est remis en main propre." }
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
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations dans le 92</div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Toutes les missions, au même niveau d'exigence.
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
              Vos questions sur la livraison à La Défense
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { q: "Quels sont les délais d'intervention à La Défense ?", a: "Pour une course urgente, nous garantissons un enlèvement en moins de 45 minutes sur tout le parvis de La Défense et les communes limitrophes (Courbevoie, Puteaux, Nanterre)." },
              { q: "Vos coursiers accèdent-ils aux étages des tours ?", a: "Oui, nos coursiers sont habitués aux protocoles de sécurité des grandes tours (badges, quais de livraison, contrôle d'identité) et assurent une remise en main propre." },
              { q: "Proposez-vous la livraison depuis le 92 vers la banlieue éloignée ?", a: "Tout à fait. Bien que spécialistes de Paris et petite couronne, nous assurons des livraisons dédiées depuis le 92 vers toute l'Île-de-France et la province." }
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course dans le 92 maintenant ?
              </h2>
              <p className="text-[15px] text-white/60">Dispatch en moins de 2 minutes, 7j/7.</p>
            </div>
            <a href={`tel:${PHONE_TEL}`} className="rounded-[4px] bg-accent px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-accent-dark">
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
