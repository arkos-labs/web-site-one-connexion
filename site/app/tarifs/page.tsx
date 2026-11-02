/**
 * app/tarifs/page.tsx
 * Page tarifaire ONE CONNEXION. Requête visée : « tarif coursier Paris ».
 * « prix coursier Paris » appartient au guide /guides/prix-coursier-express-paris.
 */
import type { Metadata } from "next";
import Link from "next/link";
import InlineLinks from "@/components/InlineLinks";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { CheckCircle2, Clock, MapPin, Shield } from "lucide-react";
import { gridPrice, pcKmPrice, PC_INCLUDED_KM, splitTTC, type Zone } from "@/lib/pricing";

// 31,5 → « 31,50 € », 42 → « 42 € »
const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

const TITLE = "Tarifs coursier Paris : prix clairs, sans surprise";
const DESCRIPTION =
  "Grille de prix coursier à Paris et en Île-de-France : course dédiée, plis confidentiels, transport médical. Devis gratuit sous 2 h ouvrées.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/tarifs" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
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
    q: "Combien coûte une course dans Paris intra-muros ?",
    a: "À Paris intra-muros, une course coûte 28 € TTC en Normal (3 h), 42 € TTC en Urgent (1 h 30) et 56 € TTC en Super (1 h). Le prix exact s’affiche avant de valider la commande.",
  },
  {
    q: "Y a-t-il un supplément pour la banlieue ?",
    a: "En petite couronne, une course démarre à 39 € TTC en Normal, avec 8 km de route compris, puis 2 € TTC par km en plus. En grande couronne, le prix dépend de la distance depuis Paris et s’affiche avant la commande.",
  },
  {
    q: "Existe-t-il un tarif de nuit ou du dimanche ?",
    a: "Il n’existe pas de grille distincte : les tarifs ci-dessus s’appliquent tous les jours. Pour une demande en dehors de nos horaires habituels, contactez-nous avant de commander.",
  },
  {
    q: "Comment fonctionne la facturation mensuelle pour une entreprise ?",
    a: "Avec un compte entreprise, vos courses sont regroupées et facturées : les factures se règlent sous 30 jours, avec un tarif dégressif selon le volume mensuel.",
  },
  {
    q: "Qu’est-ce qui est inclus dans le prix ?",
    a: "La course dédiée, l’enlèvement, le suivi en ligne et la remise en main propre avec preuve horodatée. La TVA de 20 % est incluse dans le prix TTC, et le poids ne change pas le prix jusqu’à 18 kg.",
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

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Courses de coursier moto à Paris et en Île-de-France",
  serviceType: "Coursier express B2B",
  url: `${SITE_URL}/tarifs`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
  offers: (
    [
      ["Course Normale 3 h à Paris", "standard"],
      ["Course Urgente 1 h 30 à Paris", "urgent"],
      ["Course Super 1 h à Paris", "flash"],
    ] as const
  ).map(([name, level]) => ({
    "@type": "Offer",
    name,
    price: String(gridPrice(level, 0)),
    priceCurrency: "EUR",
    url: `${SITE_URL}/tarifs`,
    priceSpecification: {
      "@type": "PriceSpecification",
      price: String(gridPrice(level, 0)),
      priceCurrency: "EUR",
      valueAddedTaxIncluded: true,
    },
  })),
};

const FACTORS = [
  {
    icon: MapPin,
    title: "Distance & zone",
    desc: "La zone la plus éloignée entre l'enlèvement et la livraison détermine le tarif.",
  },
  {
    icon: Clock,
    title: "Délai demandé",
    desc: "Course immédiate (enlèvement dans l'heure), course planifiée (créneau défini) ou navette régulière (tournée hebdomadaire). Le délai module le tarif.",
  },
  {
    icon: Shield,
    title: "Même tarif pour tout colis",
    desc: "Pli confidentiel, dossier, prélèvement médical ou colis jusqu'à 18 kg : le prix est le même. Seules la zone et le délai le font varier. C’est aussi le cas pour un [coursier pour particulier](/services/coursier-particulier-paris).",
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

const linkClass = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

export default function TarifsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={serviceSchema} />

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
            Tarif coursier Paris : notre grille de prix
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Course moto dès 28 € TTC en intramuros, en normal 3 h, 56 € TTC en
            formule Super 1 h. Voici comment le tarif est calculé, la grille par
            délai et les options possibles.
          </p>
        </div>
      </section>

      {/* ── 2. Grille ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Grille
          </div>
          <h2 className="mb-8 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Tarif coursier Paris : la grille complète
          </h2>
          <p className="mb-10 max-w-[60ch] text-[15.5px] leading-[1.7] text-muted">
            Trois types de course, selon le délai : Normal, Urgent et Super. Le
            prix exact s&apos;affiche avant de valider votre commande. Pour savoir
            d&apos;où vient chaque montant, lisez notre guide pour{" "}
            <Link href="/guides/prix-coursier-express-paris" className={linkClass}>
              comprendre le prix d&apos;une course express
            </Link>
            .
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
        </div>
      </section>

      {/* ── 1. Calcul du tarif ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Calcul du tarif
        </div>
        <h2 className="mb-6 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Prix coursier Paris : ce qui fait varier le tarif
        </h2>
        <p className="mb-14 max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          Le prix d&apos;une course dépend de deux choses : la zone, c&apos;est-à-dire la distance entre
          l&apos;enlèvement et la livraison, et le délai demandé. Une course Urgente coûte 1,5 fois le prix
          Normal, une course Super 2 fois. À l&apos;inverse, la nature de l&apos;envoi ne change rien : un pli
          confidentiel, un dossier, un prélèvement médical ou un colis jusqu&apos;à 18 kg sont facturés de la
          même façon, sans supplément de confidentialité ni de poids dans cette limite. Le montant exact
          s&apos;affiche avant de valider la commande, dès que vous saisissez les adresses et le délai. Pour
          comprendre le détail d&apos;un montant, lisez{" "}
          <Link href="/guides/prix-coursier-express-paris" className={linkClass}>
            Prix coursier Paris : comprendre le coût d&apos;une course
          </Link>
          , ou découvrez notre{" "}
          <Link href="/services/coursier-express-paris" className={linkClass}>
            coursier express à Paris
          </Link>
          .
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FACTORS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Icon size={18} className="text-accent" strokeWidth={2} />
              </div>
              <h3 className="font-bold tracking-[-0.01em]">{title}</h3>
              <p className="text-[14px] leading-[1.65] text-muted"><InlineLinks text={desc} /></p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Petite couronne et Île-de-France ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Banlieue
          </div>
          <h2 className="mb-6 max-w-[28ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Tarifs en petite couronne et en Île-de-France
          </h2>
          <p className="max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
            En petite couronne (92, 93, 94), une course démarre à {euro(gridPrice("standard", 1))} TTC en
            Normal 3 h, {euro(gridPrice("urgent", 1))} TTC en Urgent 1 h 30 et {euro(gridPrice("flash", 1))} TTC
            en Super 1 h, kilomètres compris jusqu&apos;à {PC_INCLUDED_KM} km de route, puis{" "}
            {euro(pcKmPrice("standard"))} TTC par km en plus en Normal. En grande couronne (77, 78, 91, 95), le
            prix dépend de la distance depuis Paris et s&apos;affiche avant la commande. Pour le détail des
            communes et des délais, consultez notre page{" "}
            <Link href="/zones/petite-couronne" className={linkClass}>
              coursier banlieue Paris
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Comparaison ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Comparaison
        </div>
        <h2 className="mb-6 max-w-[28ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Comparaison : course dédiée vs plateforme mutualisée
        </h2>
        <p className="max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          Avec une course dédiée, un coursier prend en charge un seul envoi à la fois et le conduit
          directement à destination : pas de regroupement, pas de détour, une remise en main propre
          horodatée, et un prix connu avant la commande. Une plateforme mutualisée optimise ses tournées en
          regroupant plusieurs envois : le tarif unitaire peut être plus bas, mais l&apos;heure d&apos;arrivée
          dépend des autres livraisons de la tournée et la chaîne de responsabilité est plus difficile à
          documenter. Pour un document sensible, un délai serré ou une pièce à produire en justice, la
          course dédiée est le choix le plus sûr. Pour un volume régulier, le{" "}
          <Link href="/services/compte-entreprise" className={linkClass}>
            compte entreprise
          </Link>{" "}
          applique une grille dégressive selon le volume mensuel.
        </p>
      </section>

      {/* ── 3. Options ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Options
        </div>
        <p className="mb-6 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Options et suppléments
        </p>
        <p className="mb-14 max-w-[60ch] text-[15.5px] leading-[1.7] text-muted">
          Le délai Urgent coûte 1,5 fois le prix Normal, le Super 2 fois. Vous
          pouvez payer à la course ou ouvrir un compte entreprise, réglé sur
          facture à 30 jours. Pour une{" "}
          <Link href="/services/coursier-urgent-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">course urgente à Paris</Link>, choisissez le délai Urgent ou Super.
        </p>
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
      </section>

      {/* ── Maillage interne (sans H2 : hors plan) ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <p className="mb-6 text-[clamp(22px,2.5vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Le tarif selon votre besoin.
        </p>
        <ul className="grid max-w-[780px] gap-3 text-[15px] leading-[1.6] text-muted sm:grid-cols-2">
          <li><Link href="/services/plis-confidentiels" className={linkClass}>Pli confidentiel</Link> : remise en main propre</li>
          <li><Link href="/services/transport-medical" className={linkClass}>Coursier médical</Link> : laboratoires et prélèvements</li>
          <li><Link href="/services/livraison-e-commerce" className={linkClass}>Livraison e-commerce</Link> : vos commandes en Île-de-France</li>
          <li><Link href="/services/coursier-express-paris" className={linkClass}>coursier express à Paris</Link> : enlèvement en moins de 45 min</li>
          <li><Link href="/services/coursier-moto-paris" className={linkClass}>Coursier moto</Link> : livraison en deux-roues</li>
        </ul>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Questions fréquentes
        </div>
        <h2 className="mb-10 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Vos questions sur nos tarifs.
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

      {/* ── 4. Devis ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Comment obtenir un devis
              </h2>
              <p className="text-[15px] text-white/60">
                Pour des courses régulières ou un volume mensuel, écrivez-nous pour{" "}
                <Link href="/contact" className="font-medium text-white underline decoration-accent underline-offset-4 hover:text-accent">
                  demander un devis
                </Link>
                . Pour un{" "}
                <Link href="/services/coursier-dimanche-paris" className="font-medium text-white underline decoration-accent underline-offset-4 hover:text-accent">
                  coursier dimanche
                </Link>
                , contactez-nous en amont.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-[4px] bg-accent px-6 py-3.5 text-center text-[14px] font-bold text-white transition-colors hover:bg-accent-dark"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
