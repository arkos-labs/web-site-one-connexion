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
  title: { absolute: "Coursier Paris : prix dès 28 € TTC | ONE CONNEXION" },
  description:
    "Coursier à Paris : 28 € TTC en 3 h, 42 € en 1 h 30, 56 € en 1 h. Même prix dans les 20 arrondissements, enlèvement en moins de 45 min, remise horodatée.",
  alternates: { canonical: "/zones/paris" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Coursier Paris : prix dès 28 € TTC | ONE CONNEXION",
    description: "Coursier à Paris : 28 € TTC en 3 h, 42 € en 1 h 30, 56 € en 1 h. Même prix dans les 20 arrondissements, enlèvement en moins de 45 min, remise horodatée.",
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

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/zones/paris#service`,
  name: "Coursier express - Paris intramuros",
  serviceType: "Coursier B2B",
  url: `${SITE_URL}/zones/paris`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "City", name: "Paris" },
};

const FAQ_PARIS = [
  {
    q: "Quel est le prix d'un coursier à Paris ?",
    a: "Une course dans Paris intramuros coûte 28 € TTC en normal (livraison sous 3 h), 42 € TTC en urgent (sous 1 h 30) et 56 € TTC en formule Super (sous 1 h). Le prix s'affiche avant de valider la commande.",
  },
  {
    q: "Quel est le tarif d'un coursier moto ou scooter à Paris ?",
    a: "Les courses sont effectuées en moto ou scooter. Le tarif est le même dans les 20 arrondissements : de 28 € TTC à 56 € TTC selon le délai choisi.",
  },
  {
    q: "Comment gérez-vous la circulation parisienne (ZFE, embouteillages) ?",
    a: "Nos coursiers circulent en deux-roues, ce qui leur permet de passer entre les files et d'éviter les axes bloqués. Ils connaissent Paris et adaptent leur trajet en fonction de la circulation du moment.",
  },
  {
    q: "Quels sont les horaires d'enlèvement à Paris intramuros ?",
    a: "Nous opérons du lundi au samedi, de 9h à 19h. En journée, nous garantissons un enlèvement en moins de 45 minutes quel que soit l'arrondissement.",
  },
  {
    q: "Livrez-vous aussi bien les particuliers que les entreprises ?",
    a: "Nous travaillons surtout pour les entreprises (plis confidentiels, laboratoires, événementiel), mais un particulier peut aussi commander une course, avec un paiement par carte.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_PARIS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const ARRONDISSEMENTS = [
  "1er - Louvre, Châtelet", "2e - Bourse", "3e - Le Marais", "4e - Île de la Cité",
  "5e - Quartier Latin", "6e - Saint-Germain", "7e - Tour Eiffel", "8e - Champs-Élysées",
  "9e - Opéra", "10e - Gare du Nord / Est", "11e - Bastille", "12e - Gare de Lyon",
  "13e - Italie", "14e - Montparnasse", "15e - Vaugirard", "16e - Trocadéro",
  "17e - Batignolles", "18e - Montmartre", "19e - Buttes-Chaumont", "20e - Belleville",
];

const STATS = [
  { value: "Dès 28 €", label: "TTC, course Normale (3 h)" },
  { value: "< 45 min", label: "Enlèvement" },
  { value: "6j/7", label: "Lun–sam, 9h – 19h" },
  { value: "20/20", label: "Arrondissements couverts" },
];

export default function ZoneParis() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

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
            Coursier à Paris : dès 28 € TTC la course.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Coursier en moto et scooter, dès 28 € TTC la course
            (voir notre{" "}
            <Link href="/services/coursier-moto-paris" className="text-white underline decoration-accent underline-offset-4 hover:text-accent">
              coursier moto Paris
            </Link>
            ). One
            Connexion couvre les 20 arrondissements avec sa flotte de deux-roues, au même prix partout. Enlèvement en moins de
            45 minutes, suivi de chaque course en ligne, preuve de remise horodatée.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/#commander"
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

      {/* ── Tarif ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Tarif par délai
        </div>
        <h2 className="mb-4 max-w-[28ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Prix d&apos;une course intramuros : dès 28 € TTC.
        </h2>
        <p className="mb-10 max-w-[60ch] text-[15.5px] leading-[1.7] text-muted">
          Le tarif est le même dans les 20 arrondissements. Seul le délai change
          le prix, et il s&apos;affiche avant de valider votre commande.
        </p>
        <div className="grid max-w-[780px] gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {[
            { name: "Normal", delay: "livré sous 3 h", price: "28 €" },
            { name: "Urgent", delay: "livré sous 1 h 30", price: "42 €" },
            { name: "Super", delay: "livré sous 1 h", price: "56 €" },
          ].map((t) => (
            <div key={t.name} className="bg-white p-6">
              <div className="text-[15px] font-bold">{t.name}</div>
              <div className="mb-4 font-mono text-[10.5px] tracking-[0.1em] text-label uppercase">{t.delay}</div>
              <div className="text-[34px] font-bold tracking-[-0.04em]">
                {t.price}
                <span className="ml-1 font-mono text-[11px] font-normal tracking-[0.1em] text-label">TTC</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-[70ch] text-[14.5px] leading-[1.7] text-muted">
          Banlieue, grande couronne ou besoin précis : consultez le{" "}
          <Link href="/tarifs" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">
            tarif coursier par zone
          </Link>
          {" "}ou notre guide sur le{" "}
          <Link href="/guides/prix-coursier-express-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">
            prix d&apos;un coursier express à Paris
          </Link>
          . Pour la proche banlieue, voir{" "}
          <Link href="/zones/petite-couronne" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">
            coursier en petite couronne
          </Link>
          .
        </p>
      </section>

      {/* ── Avantages intramuros ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Pourquoi choisir One Connexion en intramuros
          </div>
          <h2 className="mb-14 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Conçu pour la densité parisienne.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Deux-roues, pas de camionnette", desc: "Nos coursiers circulent en moto et en scooter : ils passent là où une camionnette reste coincée, en plein centre comme dans les petites rues." },
              { icon: Clock, title: "Enlèvement < 45 min", desc: "Le coursier le plus proche part dès la confirmation de la course, du lundi au samedi de 9 h à 19 h." },
              { icon: Shield, title: "Accès compliqués", desc: "Digicode, accueil, bâtiment sur cour : nos coursiers ont l'habitude des adresses parisiennes, du Marais au quartier Latin." },
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
            Votre course dans Paris en 3 étapes.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Demande immédiate", desc: "Le prix s’affiche sur-le-champ pour n’importe quel arrondissement." },
              { num: "02", title: "Enlèvement express", desc: "Un coursier expérimenté se faufile dans le trafic parisien pour récupérer votre pli en moins de 45 minutes." },
              { num: "03", title: "Preuve de remise", desc: "Vous suivez la course en ligne. Une fois le pli remis en main propre, vous recevez l'heure exacte et le nom du destinataire." }
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

      {/* ── Défis de Paris ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Défis & Solutions
        </div>
        <h2 className="mb-8 max-w-[30ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Une course dans Paris : ce qui complique, et comment on fait
        </h2>
        <div className="grid gap-6 md:grid-cols-2 text-[15px] leading-[1.7]">
          <div>
            <h3 className="mb-4 font-bold text-ink">Ce qui complique une course à Paris</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Circulation :</strong> bouchons, travaux et voies fermées changent d'un jour à l'autre</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Adresses difficiles :</strong> immeubles sans numéro visible, entrée sur cour, digicode</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Accès contrôlés :</strong> tribunaux, ministères, sièges sociaux avec accueil ou contrôle d'identité</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-ink">Comment on fait</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Deux-roues :</strong> moto et scooter, plus rapides qu'une voiture en plein centre</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Consignes notées :</strong> digicode, étage, nom à demander : vous les indiquez à la commande</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Suivi en ligne :</strong> vous voyez où en est la course, et l'heure de remise est enregistrée</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Secteurs parisiens ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Secteurs & industries
          </div>
          <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Secteurs parisiens avec couverture prioritaire
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                sector: "Finance & Administration",
                zones: "8e, 1er, 4e",
                desc: "Plis confidentiels pour banques, assurances, cabinets juridiques. Documents sensibles (contrats, testaments, brevets) livraison certifiée."
              },
              {
                sector: "Fashion & Luxe",
                zones: "8e, 1er, 6e",
                desc: "Livraison de collections pour boutiques Champs-Élysées. Documents VIP confidentiels. Échantillons de haute couture."
              },
              {
                sector: "Santé & Médical",
                zones: "5e, 11e, 14e",
                desc: "Transport de prélèvements biologiques (tube sec, EDTA). Acheminement d'ordonnances urgentes. Matériel médical stérile."
              },
              {
                sector: "E-Commerce Premium",
                zones: "15e, 8e",
                desc: "Commandes à remettre le jour même ou sur rendez-vous. Colis jusqu'à 18 kg, transportés par un seul coursier."
              },
              {
                sector: "Secteur Public",
                zones: "4e, 1er",
                desc: "Courriers administratifs, dossiers de candidature à déposer avant une échéance, documents officiels."
              },
              {
                sector: "Événementiel",
                zones: "Tous les arrondissements",
                desc: "Livraison de documents événementiels (invitations, programmes). Acheminement de matériel urgents pour salons & congrès."
              }
            ].map((item) => (
              <div key={item.sector} className="rounded-xl border border-line bg-white p-6">
                <div className="mb-2 font-mono text-[10px] tracking-[0.1em] text-label uppercase">{item.zones}</div>
                <h3 className="mb-3 font-bold text-ink">{item.sector}</h3>
                <p className="text-[14px] leading-[1.6] text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Foire Aux Questions</div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Vos questions sur un coursier à Paris
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ_PARIS.map((faq, i) => (
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
                Une course maintenant ?
              </h2>
              <p className="text-[15px] text-white/60">Dispatch en moins de 2 minutes, du lundi au samedi de 9h à 19h.</p>
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
