/**
 * app/zones/ile-de-france/page.tsx
 * Page locale globale Île-de-France (75, 92, 93, 94, 77, 78, 91, 95).
 * Requête visée : « coursier ile de france ».
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import TrustBlock from "@/components/TrustBlock";
import DeptCards from "@/components/sections/DeptCards";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { Clock, Shield, MapPin, Zap } from "lucide-react";

const TITLE = "Coursier en Île-de-France : courses dédiées 7j/7, 7h-23h";
const DESCRIPTION =
  "Coursier en Île-de-France pour entreprises : enlèvement en moins de 45 minutes, course 100% dédiée sans rupture, 8 départements couverts. Suivi en direct et preuve de remise.";

const H2 = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]";
const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/zones/ile-de-france" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
    url: "/zones/ile-de-france",
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
    { "@type": "ListItem", position: 3, name: "Île-de-France", item: `${SITE_URL}/zones/ile-de-france` },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/zones/ile-de-france#service`,
  name: "Coursier Île-de-France",
  serviceType: "Coursier Express B2B",
  url: `${SITE_URL}/zones/ile-de-france`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
};

const FAQ_IDF = [
  {
    q: "Quels sont les délais d'enlèvement d'un coursier en Île-de-France ?",
    a: "À Paris et en petite couronne (92, 93, 94), nos coursiers interviennent en moins de 45 minutes. En grande couronne (77, 78, 91, 95), le délai d'enlèvement varie selon la distance mais reste planifié sans rupture ni regroupement intermédiaire.",
  },
  {
    q: "Quelles formules de livraison proposez-vous en Île-de-France ?",
    a: "Nous proposons 3 niveaux d'urgence : Normal (3 h), Urgent (1 h 30) et Super (1 h pour Paris et communes limitrophes). En grande couronne, le délai est calculé au plus court selon le temps de trajet réel.",
  },
  {
    q: "Comment est calculé le tarif d'une course en Île-de-France ?",
    a: "À Paris intramuros, le tarif démarre à 28 € TTC (23,33 € HT). En banlieue et grande couronne, le tarif dépend de la distance kilométrique exacte entre l'enlèvement et la livraison. Le prix s'affiche automatiquement avant toute confirmation de commande.",
  },
  {
    q: "Assurez-vous les courses le week-end et les jours fériés ?",
    a: "Oui, notre flotte opère 7j/7, de 7h à 23h, partout en région parisienne.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_IDF.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function ZoneIleDeFrance() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Hero ── */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[clamp(48px,6vw,72px)]">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wider text-muted uppercase">
              <li><Link href="/" className="hover:text-ink">Accueil</Link></li>
              <li>/</li>
              <li><Link href="/zones" className="hover:text-ink">Zones</Link></li>
              <li>/</li>
              <li className="font-semibold text-accent-dark">Île-de-France</li>
            </ol>
          </nav>

          <div className="max-w-[760px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 font-mono text-[11px] font-semibold text-accent-dark">
              <span>8 DÉPARTEMENTS COUVERTS</span>
            </div>
            <h1 className="text-[clamp(32px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
              Coursier en Île-de-France : course dédiée et express
            </h1>
            <p className="mt-6 text-[clamp(16px,2vw,19px)] leading-[1.6] text-muted">
              Une seule paire de mains, un coursier unique du départ à l&apos;arrivée. Nous assurons vos livraisons urgentes,
              plis confidentiels et transferts médicaux dans l&apos;ensemble de la région parisienne, 7j/7 de 7h à 23h.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/commande"
                className="rounded-[4px] bg-accent px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-accent-dark"
              >
                Commander une course
              </Link>
              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-[4px] border border-line bg-white px-6 py-3.5 text-[15px] font-bold text-ink transition-colors hover:bg-paper"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-line/80 pt-8 sm:grid-cols-4">
            {[
              { val: "< 45 min", label: "Enlèvement Paris & 92, 93, 94" },
              { val: "100%", label: "Course dédiée sans groupage" },
              { val: "8 / 8", label: "Départements IDF desservis" },
              { val: "7j/7", label: "De 7h à 23h en continu" },
            ].map((st, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[clamp(24px,3vw,32px)] font-extrabold text-ink">{st.val}</span>
                <span className="text-[13px] text-muted">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1. Nos zones en Île-de-France ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Territoires desservis
        </div>
        <h2 className={`mb-4 ${H2}`}>Les zones couvertes par notre flotte en Île-de-France</h2>
        <p className="mb-10 max-w-[65ch] text-[15.5px] leading-[1.7] text-muted">
          De l&apos;hyper-centre parisien jusqu&apos;aux pôles d&apos;activité de grande couronne, nos coursiers moto et utilitaires interviennent au départ ou à destination de toute l&apos;Île-de-France.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="mb-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent-dark font-bold">
              Zone 75
            </span>
            <h3 className="mb-2 text-[20px] font-bold text-ink">Paris intramuros</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-muted">
              Tous les 20 arrondissements. Idéal pour les plis d&apos;avocats, actes de notaires, laboratoires et urgences B2B. Enlèvement immédiat.
            </p>
            <div className="font-semibold text-accent-dark mb-4 text-[14px]">Dès 28 € TTC</div>
            <Link href="/zones/paris" className={LINK}>Voir les détails Paris →</Link>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="mb-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent-dark font-bold">
              Zone 92 · 93 · 94
            </span>
            <h3 className="mb-2 text-[20px] font-bold text-ink">Petite couronne & La Défense</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-muted">
              Liaisons rapides entre Paris et Nanterre, Boulogne, Saint-Denis, Montreuil, Créteil ou La Défense. Deux-roues rapides anti-bouchons.
            </p>
            <div className="font-semibold text-accent-dark mb-4 text-[14px]">Dès 35 € TTC</div>
            <div className="flex gap-4">
              <Link href="/zones/petite-couronne" className={LINK}>Petite couronne →</Link>
              <Link href="/zones/la-defense" className={LINK}>La Défense →</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <span className="mb-2 inline-block font-mono text-[11px] uppercase tracking-wider text-accent-dark font-bold">
              Zone 77 · 78 · 91 · 95
            </span>
            <h3 className="mb-2 text-[20px] font-bold text-ink">Grande couronne</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-muted">
              Versailles, Roissy CDG, Cergy, Évry, Marne-la-Vallée, Melun. Trajet direct porte-à-porte, tarification kilométrique sans surprise.
            </p>
            <div className="font-semibold text-accent-dark mb-4 text-[14px]">Dès 59 € TTC selon distance</div>
            <Link href="/zones/grande-couronne" className={LINK}>Voir grande couronne →</Link>
          </div>
        </div>
      </section>

      {/* ── 2. Grille des départements ── */}
      <section className="bg-paper py-[72px]">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Couverture départementale
          </div>
          <h2 className={`mb-8 ${H2}`}>Tous les départements d&apos;Île-de-France</h2>
          <DeptCards depts={["92", "93", "94", "77", "78", "91", "95"]} />
        </div>
      </section>

      {/* ── 3. Nos prestations en IDF ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Spécialités régionales
        </div>
        <h2 className={`mb-8 ${H2}`}>Nos solutions de coursier en Île-de-France</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.slice(0, 6).map((s) => (
            <div key={s.slug} className="flex flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-sm">
              <div>
                <div className="font-mono text-[10px] tracking-wider uppercase text-accent-dark mb-2">
                  {s.card.tag}
                </div>
                <h3 className="text-[18px] font-bold text-ink mb-2">{s.card.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed mb-4">{s.card.body}</p>
              </div>
              <Link href={`/services/${s.slug}`} className={LINK}>
                En savoir plus →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Tableau indicatif des délais ── */}
      <section className="bg-paper py-[72px] border-t border-line">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Délais moyens
          </div>
          <h2 className={`mb-4 ${H2}`}>Délais indicatifs de livraison en Île-de-France</h2>
          <p className="mb-8 max-w-[65ch] text-[15px] text-muted">
            Chaque course est exclusive : le coursier effectue le trajet direct de l&apos;adresse d&apos;enlèvement à l&apos;adresse de remise, sans aucun arrêt intermédiaire.
          </p>

          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[560px] border-collapse text-[14.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/50">
                  <th className="p-4 text-left font-mono text-[11px] uppercase tracking-wider text-label">Trajet indicatif</th>
                  <th className="p-4 text-center font-mono text-[11px] uppercase tracking-wider text-label">Enlèvement</th>
                  <th className="p-4 text-center font-mono text-[11px] uppercase tracking-wider text-label">Formule Super</th>
                  <th className="p-4 text-center font-mono text-[11px] uppercase tracking-wider text-label">Formule Normale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="p-4 font-semibold text-ink">Paris ↔ Paris intramuros</td>
                  <td className="p-4 text-center text-muted">&lt; 45 min</td>
                  <td className="p-4 text-center font-bold text-accent-dark">1 heure</td>
                  <td className="p-4 text-center text-muted">3 heures</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-ink">Paris ↔ Petite Couronne (92/93/94)</td>
                  <td className="p-4 text-center text-muted">&lt; 45 min</td>
                  <td className="p-4 text-center font-bold text-accent-dark">1 h à 1 h 30</td>
                  <td className="p-4 text-center text-muted">3 heures</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-ink">Paris ↔ Pôles économiques (La Défense, Roissy, Orly)</td>
                  <td className="p-4 text-center text-muted">&lt; 45 min</td>
                  <td className="p-4 text-center font-bold text-accent-dark">1 h 15 à 1 h 45</td>
                  <td className="p-4 text-center text-muted">3 heures</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-ink">Paris ↔ Grande Couronne (77/78/91/95)</td>
                  <td className="p-4 text-center text-muted">Sur créneau / 1h</td>
                  <td className="p-4 text-center font-bold text-accent-dark">Direct sans escale</td>
                  <td className="p-4 text-center text-muted">Demi-journée</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Foire Aux Questions
            </div>
            <p className={H2}>Vos questions sur un coursier en Île-de-France</p>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ_IDF.map((faq, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Besoin d&apos;un coursier en Île-de-France immédiatement ?
              </p>
              <p className="text-[15px] text-white/60">
                Commande directe en ligne avec tarification instantanée ou par téléphone 7j/7 de 7h à 23h.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/commande"
                className="rounded-[4px] bg-accent px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-accent-dark"
              >
                Commander en ligne
              </Link>
              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-[4px] border border-white/20 bg-white/10 px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-white/20"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>

      <TrustBlock />
    </>
  );
}

