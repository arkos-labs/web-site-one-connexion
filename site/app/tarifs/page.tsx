/**
 * app/tarifs/page.tsx
 * Page tarifaire ONE CONNEXION — répond aux requêtes "prix coursier express Paris",
 * "tarif coursier moto Paris". Pas de grille rigide : explication de la logique
 * de prix + invitation à demander un devis.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { CheckCircle2, Clock, MapPin, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs coursier express Paris — Devis en 2 h | ONE CONNEXION",
  description:
    "Découvrez la logique tarifaire de One Connexion pour vos courses urgentes à Paris et en Île-de-France. Tarif à la course ou compte entreprise mensuel. Devis gratuit sous 2 h.",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    title: "Tarifs coursier express Paris — ONE CONNEXION",
    description:
      "Tarif à la course ou compte entreprise mensuel pour vos livraisons urgentes en Île-de-France. Devis gratuit sous 2 h.",
    url: "/tarifs",
    type: "website",
    locale: "fr_FR",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Tarifs", item: `${SITE_URL}/tarifs` },
  ],
};

const FACTORS = [
  {
    icon: MapPin,
    title: "Distance & zone",
    desc: "Paris intramuros, petite couronne (92/93/94) ou grande couronne. La zone détermine la base tarifaire. Roissy et Orly sont accessibles sur devis spécifique.",
  },
  {
    icon: Clock,
    title: "Délai demandé",
    desc: "Course immédiate (enlèvement dans l'heure), course planifiée (créneau défini) ou navette régulière (tournée hebdomadaire). Le délai module le tarif.",
  },
  {
    icon: Shield,
    title: "Nature du transport",
    desc: "Plis confidentiels avec remise contre signature, transport médical avec protocole de manutention, ou colis standard. Chaque nature a ses exigences opérationnelles.",
  },
  {
    icon: CheckCircle2,
    title: "Volume mensuel",
    desc: "Les clients avec compte entreprise bénéficient d'une grille dégressive selon le volume mensuel. La facturation est centralisée et mensuelle.",
  },
];

const FORMULES = [
  {
    name: "Course à la demande",
    tag: "Ponctuel",
    tagColor: "bg-accent/10 text-accent",
    price: "Sur devis",
    priceNote: "réponse sous 2 h",
    items: [
      "Enlèvement en moins de 45 min",
      "Suivi en temps réel",
      "Preuve de livraison horodatée",
      "Assurance marchandises incluse",
      "Paiement à la course",
    ],
    cta: "Commander une course",
    href: "/#contact",
    highlight: false,
  },
  {
    name: "Compte entreprise",
    tag: "Recommandé",
    tagColor: "bg-accent text-white",
    price: "Grille mensuelle",
    priceNote: "facturation en fin de mois",
    items: [
      "Tarif dégressif selon volume",
      "Imputation par dossier ou service",
      "Interlocuteur dispatch dédié",
      "Rapport mensuel des courses",
      "Paiement à 30 jours",
      "Ouverture de compte en 24 h",
    ],
    cta: "Ouvrir un compte",
    href: "/inscription",
    highlight: true,
  },
];

export default function TarifsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Tarifs</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Tarification
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Des tarifs clairs, adaptés à vos volumes.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Pas de grille tarifaire figée : chaque mission a ses paramètres.
            Voici ce qui détermine le coût d'une course, et comment obtenir
            votre devis en moins de 2 heures.
          </p>
        </div>
      </section>

      {/* ── Facteurs de prix ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Ce qui détermine le prix
        </div>
        <h2 className="mb-14 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          4 paramètres entrent dans chaque calcul.
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FACTORS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Icon size={18} className="text-accent" strokeWidth={2} />
              </div>
              <h3 className="font-bold tracking-[-0.01em]">{title}</h3>
              <p className="text-[14px] leading-[1.65] text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formules ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Nos formules
          </div>
          <h2 className="mb-14 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            À la course ou en compte mensuel.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-[780px]">
            {FORMULES.map((f) => (
              <div
                key={f.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  f.highlight
                    ? "border-accent bg-ink text-white"
                    : "border-line bg-white"
                }`}
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <div className={`mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.1em] uppercase ${f.tagColor}`}>
                      {f.tag}
                    </div>
                    <h3 className={`text-[18px] font-bold tracking-[-0.02em] ${f.highlight ? "text-white" : "text-ink"}`}>
                      {f.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-[17px] font-bold ${f.highlight ? "text-accent" : "text-ink"}`}>
                      {f.price}
                    </div>
                    <div className={`text-[11px] ${f.highlight ? "text-white/50" : "text-muted"}`}>
                      {f.priceNote}
                    </div>
                  </div>
                </div>
                <ul className="mb-8 flex flex-col gap-3">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={15}
                        className={`mt-0.5 shrink-0 ${f.highlight ? "text-accent" : "text-accent-dark"}`}
                        strokeWidth={2.5}
                      />
                      <span className={`text-[14px] leading-[1.5] ${f.highlight ? "text-white/80" : "text-muted"}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={f.href}
                  className={`mt-auto rounded-[4px] px-6 py-3 text-center text-[13px] font-bold transition-colors ${
                    f.highlight
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white"
                  }`}
                >
                  {f.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zones ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Grille par zone
        </div>
        <h2 className="mb-8 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Indicatif selon la zone de livraison.
        </h2>
        <p className="mb-10 max-w-[60ch] text-[15.5px] leading-[1.7] text-muted">
          Ces fourchettes sont indicatives et données à titre d'orientation.
          Le devis définitif tient compte du délai, de la nature du transport
          et du volume mensuel. Contactez-nous pour un tarif personnalisé.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14.5px]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Zone</th>
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Dépt.</th>
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Course planifiée</th>
                <th className="py-3 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Course immédiate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { zone: "Paris intramuros", dept: "75", planifie: "À partir de 15 €", immediat: "À partir de 22 €" },
                { zone: "Petite couronne", dept: "92, 93, 94", planifie: "À partir de 22 €", immediat: "À partir de 30 €" },
                { zone: "Grande couronne", dept: "77, 78, 91, 95", planifie: "Sur devis", immediat: "Sur devis" },
                { zone: "Aéroports (CDG / Orly)", dept: "—", planifie: "Sur devis", immediat: "Sur devis" },
              ].map((row) => (
                <tr key={row.zone}>
                  <td className="py-4 pr-6 font-medium text-ink">{row.zone}</td>
                  <td className="py-4 pr-6 font-mono text-[13px] text-muted">{row.dept}</td>
                  <td className="py-4 pr-6 text-muted">{row.planifie}</td>
                  <td className="py-4 text-muted">{row.immediat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] text-muted/70">
          * Tarifs HT, hors options (prise en charge après 21h, week-end, assurance renforcée). TVA 20 % applicable.
        </p>
      </section>

      {/* ── CTA devis ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Obtenez votre devis en moins de 2 h.
              </h2>
              <p className="text-[15px] text-white/60">
                Décrivez votre besoin par téléphone ou par email — nous revenons vers vous rapidement.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-[4px] bg-accent px-6 py-3.5 text-center text-[14px] font-bold text-white transition-colors hover:bg-accent-dark"
              >
                {PHONE_DISPLAY}
              </a>
              <Link
                href="/#contact"
                className="rounded-[4px] border border-white/20 px-6 py-3.5 text-center text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Formulaire de contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
