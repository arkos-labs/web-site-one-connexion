/**
 * app/tarifs/page.tsx
 * Page tarifaire ONE CONNEXION — répond aux requêtes "prix coursier express Paris",
 * "tarif coursier moto Paris". Pas de grille rigide : explication de la logique
 * de prix + prix affiché avant de commander.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { CheckCircle2, Clock, MapPin, Shield } from "lucide-react";
import { gridPrice, pcKmPrice, PC_INCLUDED_KM, splitTTC, type Zone } from "@/lib/pricing";

// 31,5 → « 31,50 € », 42 → « 42 € »
const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

export const metadata: Metadata = {
  title: "Prix coursier Paris : dès 28 € TTC",
  description:
    "Tarifs coursier : dès 28€ à Paris, 39€ en petite couronne (puis 2€/km au-delà de 8 km). Grille par zone, prix affiché avant de commander. Compte entreprise 30j.",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Tarifs coursier express Paris - ONE CONNEXION",
    description:
      "Tarif à la course ou compte entreprise payable à 30 jours pour vos livraisons urgentes en Île-de-France. Prix affiché avant de commander.",
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

const FAQ = [
  {
    q: "Quel est le prix d'un coursier à Paris ?",
    a: "À Paris intramuros, une course normale sous 3 h démarre à 28 € TTC, une course urgente sous 1 h 30 à 42 € TTC et une course Super sous 1 h à 56 € TTC.",
  },
  {
    q: "Quel est le tarif d'un coursier en petite couronne ?",
    a: "En petite couronne (92, 93, 94), le prix suit les kilomètres parcourus : 39 € TTC jusqu'à 8 km, puis 2 € TTC par km en normal ; 58,50 € puis 3 € par km en urgent ; 78 € puis 4 € par km en Super. Une course de 15 km coûte 53 € TTC en normal. En grande couronne (77, 78, 91, 95), le prix suit la distance depuis Paris : 76 € TTC pour Versailles, 158 € TTC pour Meaux en normal.",
  },
  {
    q: "Combien coûte un coursier moto à Paris ?",
    a: "Une course en moto dans Paris intramuros démarre à 28 € TTC en normal 3 h et 56 € TTC en formule Super (enlèvement et livraison sous 1 h).",
  },
  {
    q: "Quel est le prix d'un coursier express à Paris ?",
    a: "Une course express dans Paris se facture 42 € TTC en urgent (1 h 30) ou 56 € TTC en formule Super (1 h). En petite couronne : 58,50 € TTC en urgent et 78 € TTC en Super jusqu'à 8 km, puis 3 € ou 4 € TTC par km.",
  },
  {
    q: "Quel est le tarif d'un coursier en banlieue de Paris ?",
    a: "En banlieue proche (92, 93, 94), comptez 39 € TTC jusqu'à 8 km, puis 2 € TTC par km en normal : par exemple 53 € TTC pour 15 km. Plus loin en Île-de-France (77, 78, 91, 95), le prix suit la distance depuis Paris, dès 59 € TTC en normal.",
  },
  {
    q: "Combien coûte un coursier en Île-de-France ?",
    a: "Le tarif d'un coursier en Île-de-France part de 28 € TTC (Paris, délai 3 h). En petite couronne, 39 € TTC jusqu'à 8 km puis 2 € TTC par km. En grande couronne, le prix suit la distance depuis Paris : 76 € TTC pour Versailles, 158 € TTC pour Meaux, en délai 3 h. Le délai Urgent coûte 1,5 fois le prix Normal, le Super 2 fois.",
  },
  {
    q: "Le prix d'un coursier pour un pli confidentiel ou un transport médical est-il différent ?",
    a: "Les plis confidentiels et le transport médical sont facturés au tarif standard de la zone, selon le délai demandé. Retrouvez le détail sur nos pages plis confidentiels et transport médical.",
  },
  {
    q: "Les tarifs sont-ils HT ou TTC ?",
    a: "Les tarifs indiqués sont TTC : la TVA de 20 % est comprise dans le prix, pour les professionnels comme pour les particuliers. La facture détaille le montant HT et la TVA.",
  },
  {
    q: "Comment connaître le prix avant de commander ?",
    a: "Le prix s’affiche automatiquement dès que vous saisissez les adresses et le délai, avant de valider la commande. Les clients avec un compte entreprise bénéficient d'une grille dégressive selon le volume mensuel.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const FACTORS = [
  {
    icon: MapPin,
    title: "Distance & zone",
    desc: "Paris intramuros, petite couronne (92/93/94) ou grande couronne (77/78/91/95). La zone la plus éloignée entre l'enlèvement et la livraison détermine le tarif.",
  },
  {
    icon: Clock,
    title: "Délai demandé",
    desc: "Course immédiate (enlèvement dans l'heure), course planifiée (créneau défini) ou navette régulière (tournée hebdomadaire). Le délai module le tarif.",
  },
  {
    icon: Shield,
    title: "Même tarif pour tout colis",
    desc: "Pli confidentiel, dossier, prélèvement médical ou colis jusqu'à 18 kg : le prix est le même. Seules la zone et le délai le font varier.",
  },
  {
    icon: CheckCircle2,
    title: "Volume mensuel",
    desc: "Les clients avec compte entreprise bénéficient d'une grille dégressive selon le volume mensuel. Les factures se règlent sous 30 jours.",
  },
];

const FORMULES = [
  {
    name: "Course à la demande",
    tag: "Ponctuel",
    tagColor: "bg-accent/10 text-accent",
    price: "Prix instantané",
    priceNote: "affiché avant de commander",
    items: [
      "Enlèvement en moins de 45 min",
      "Suivi en ligne de chaque course",
      "Preuve de livraison horodatée",
      "Course dédiée, sans regroupement",
      "Paiement à la course",
    ],
    cta: "Commander une course",
    href: "/#commander",
    highlight: false,
  },
  {
    name: "Compte entreprise",
    tag: "Recommandé",
    tagColor: "bg-accent text-white",
    price: "Grille officielle",
    priceNote: "factures à régler sous 30 jours",
    items: [
      "Ouverture du compte immédiate",
      "Plusieurs comptes avec le même SIRET",
      "Chaque compte suit ses propres courses",
      "Factures à régler sous 30 jours",
      "Tarif dégressif selon volume",
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
      <JsonLd data={faqSchema} />

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
            Prix coursier Paris : tarif dès 28 € TTC la course.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Course moto dès 28 € TTC dans Paris en
            normal 3 h, 56 € TTC en formule Super 1 h. Voici la grille par zone
            et par délai, et ce qui fait varier le prix d'un coursier.
          </p>
        </div>
      </section>

      {/* ── Facteurs de prix ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Prix coursier Paris : ce qui compte
        </div>
        <h2 className="mb-14 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Comment se calcule le prix d'une course.
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
            À la course ou en compte entreprise, à 30 jours.
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
          Tarif d&apos;une course selon la zone et le délai.
        </h2>
        <p className="mb-10 max-w-[60ch] text-[15.5px] leading-[1.7] text-muted">
          En petite couronne (92, 93, 94), le prix suit les kilomètres de route
          entre l&apos;enlèvement et la livraison : 39 € TTC fixe jusqu&apos;à 8 km,
          puis 2 € TTC par km en Normal (3 € en Urgent, 4 € en Super). Saint-Mandé
          vers Paris 12e : 39 € TTC. En grande
          couronne, le prix suit la distance depuis Paris, retour du coursier
          compris : 76 € TTC pour Versailles, 158 € TTC pour Meaux en Normal.
          Le prix exact s&apos;affiche avant de valider votre commande.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14.5px]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Zone</th>
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Dépt.</th>
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Normal 3 h</th>
                <th className="py-3 pr-6 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Urgent 1 h 30</th>
                <th className="py-3 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Super 1 h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { zone: "Paris", dept: "75", z: 0 },
                { zone: "Petite couronne", dept: "92, 93, 94", z: 1 },
                { zone: "Grande couronne", dept: "77, 78, 91, 95", z: 2 },
              ].map(({ z, ...row }) => ({ ...row, z, from: z !== 0, prix: (["standard", "urgent", "flash"] as const).map((s) => gridPrice(s, z as Zone)) })).map((row) => (
                <tr key={row.zone}>
                  <td className="py-4 pr-6 font-medium text-ink">{row.zone}</td>
                  <td className="py-4 pr-6 font-mono text-[13px] text-muted">{row.dept}</td>
                  {row.prix.map((p, i) => (
                    <td key={i} className={`py-4 ${i < 2 ? "pr-6" : ""}`}>
                      <div className="font-semibold text-ink">{row.from ? "dès " : ""}{euro(p)} TTC</div>
                      <div className="text-[12px] text-muted">{euro(splitTTC(p).ht)} HT</div>
                      {row.z === 1 && (
                        <div className="text-[12px] font-medium text-accent-dark">
                          + {euro(pcKmPrice((["standard", "urgent", "flash"] as const)[i]))} TTC/km au-delà de {PC_INCLUDED_KM} km
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] text-muted/70">
          * Tarifs par course, TVA 20 % comprise dans le prix TTC (HT = TTC ÷ 1,20). Compte entreprise : tarif dégressif selon le volume mensuel.
        </p>
      </section>

      {/* ── Maillage interne ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <h2 className="mb-6 text-[clamp(22px,2.5vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Le tarif selon votre besoin.
        </h2>
        <ul className="grid max-w-[780px] gap-3 text-[15px] leading-[1.6] text-muted sm:grid-cols-2">
          <li><Link href="/services/plis-confidentiels" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Pli confidentiel</Link> : remise en main propre</li>
          <li><Link href="/services/transport-medical" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Coursier médical</Link> : laboratoires et prélèvements</li>
          <li><Link href="/services/livraison-e-commerce" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Livraison e-commerce</Link> : le jour même en Île-de-France</li>
          <li><Link href="/services/coursier-express-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Coursier express Paris</Link> : enlèvement en moins de 45 min</li>
          <li><Link href="/services/coursier-moto-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Coursier moto et scooter</Link> : livraison en deux-roues</li>
          <li><Link href="/guides/prix-coursier-express-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Prix d'un coursier express à Paris</Link> : le guide complet</li>
          <li><Link href="/zones/paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">Coursier Paris</Link> et <Link href="/zones/petite-couronne" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">petite couronne</Link> : zones desservies</li>
        </ul>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Questions fréquentes
        </div>
        <h2 className="mb-10 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Prix et tarif coursier : vos questions.
        </h2>
        <div className="grid max-w-[780px] gap-8">
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <h3 className="mb-2 font-bold tracking-[-0.01em]">{q}</h3>
              <p className="text-[15px] leading-[1.65] text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA prix ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Connaissez le prix en quelques secondes.
              </h2>
              <p className="text-[15px] text-white/60">
                Saisissez vos adresses et votre délai : le prix s’affiche avant de valider.
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
                href="/#commander"
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
