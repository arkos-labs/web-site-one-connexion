/**
 * app/zones/paris/page.tsx
 * Page locale Paris intramuros. Requête visée : « coursier Paris ».
 * Prix → /tarifs, banlieue → /zones/petite-couronne, express →
 * /services/coursier-express-paris : la page y renvoie sans les traiter.
 */
import type { Metadata } from "next";
import Link from "next/link";
import InlineLinks from "@/components/InlineLinks";
import JsonLd from "@/components/JsonLd";
import TrustBlock from "@/components/TrustBlock";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { Clock, MapPin, Zap, Shield } from "lucide-react";

const TITLE = "Coursier à Paris : course dédiée 7j/7, 8h-19h";
const DESCRIPTION =
  "Un coursier dédié par envoi, partout dans Paris, en moins de 45 minutes. Plis, médical, e-commerce. Tarifs clairs, interlocuteur unique.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/zones/paris" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
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
  name: "Coursier - Paris intramuros",
  serviceType: "Coursier B2B",
  url: `${SITE_URL}/zones/paris`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "City", name: "Paris" },
};

const FAQ_PARIS = [
  {
    q: "Combien de temps pour un pli urgent dans le 8e ?",
    a: "L’enlèvement se fait en moins de 45 minutes, sous réserve de disponibilité au moment de la commande. Le délai de livraison dépend de la formule : Normal 3 h, Urgent 1 h 30, Super 1 h.",
  },
  {
    q: "Intervenez-vous le samedi ?",
    a: "Oui, nous intervenons 7j/7 dans Paris.",
  },
  {
    q: "Que se passe-t-il si le destinataire est absent ?",
    a: "Le coursier vous appelle avant toute décision. Selon votre consigne, il patiente, remet le pli à une personne que vous désignez, ou le rapporte. Un pli confidentiel n’est jamais déposé en boîte aux lettres.",
  },
  {
    q: "Peut-on suivre la course ?",
    a: "Oui. L’avancement de chaque course est visible en ligne, et la remise est horodatée avec le nom du destinataire.",
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
  { value: "< 45 min", label: "Enlèvement" },
  { value: "1 course", label: "Un envoi, sans regroupement" },
  { value: "7j/7", label: "De 8h à 19h" },
  { value: "20/20", label: "Arrondissements couverts" },
];

const H2 = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]";
const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

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
            Coursier Paris : une course dédiée par envoi
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion couvre les 20 arrondissements avec sa flotte de
            deux-roues. Un coursier prend votre pli, votre document ou votre colis
            et le porte directement à destination. Enlèvement en moins de 45
            minutes, suivi de chaque course en ligne, preuve de remise horodatée.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/#commander"
              className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark"
            >
              Commander une course
            </a>
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

      {/* ── 1. Arrondissements ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Couverture complète
        </div>
        <h2 className={`mb-10 ${H2}`}>Coursier Paris : les arrondissements couverts</h2>
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

      {/* ── Avantages intramuros (sans H2 : hors plan) ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Pourquoi choisir One Connexion en intramuros
          </div>
          <p className={`mb-14 max-w-[24ch] ${H2}`}>Conçu pour la densité parisienne.</p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Deux-roues, pas de camionnette", desc: "Nos coursiers circulent en moto et en scooter : ils passent là où une camionnette reste coincée, en plein centre comme dans les petites rues." },
              { icon: Clock, title: "Enlèvement < 45 min", desc: "Le coursier le plus proche part dès la confirmation de la course, 7j/7 de 8 h à 19 h." },
              { icon: Shield, title: "Accès compliqués", desc: "Digicode, accueil, bâtiment sur cour : nos coursiers ont l'habitude des adresses parisiennes, du Marais au quartier Latin." },
              { icon: MapPin, title: "Tous les sites judiciaires", desc: "Palais de Justice, Tribunal de Commerce, Conseil d'État, Cour de Cassation : tous couverts aux mêmes conditions." },
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

      {/* ── 2. Ce que nous transportons ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations parisiennes</div>
        <h2 className={`mb-4 ${H2}`}>Ce que nous transportons à Paris</h2>
        {/* Les cartes des prestations sont retirées de cette page : elles reprenaient
            express, banlieue et un second lien vers les plis confidentiels. */}
        <p className="max-w-[62ch] text-[15.5px] leading-[1.7] text-muted">
          Actes et contrats pour les cabinets, prélèvements pour les
          laboratoires, commandes pour les boutiques : chaque envoi part seul,
          avec son coursier. Pour les documents sensibles, voyez notre{" "}
          <Link href="/services/plis-confidentiels" className={LINK}>transport de plis confidentiels</Link>.
          {" "}Pour un <Link href="/services/coursier-urgent-paris" className={LINK}>envoi urgent à Paris</Link> ou une{" "}
          <Link href="/services/coursier-particulier-paris" className={LINK}>course pour un particulier</Link>, la course reste dédiée.
        </p>
      </section>

      {/* ── Secteurs parisiens (sans H2 : hors plan) ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Secteurs & industries
          </div>
          <p className={`mb-10 ${H2}`}>Secteurs parisiens avec couverture prioritaire</p>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                sector: "Finance & Administration",
                zones: "8e, 1er, 4e",
                desc: "Plis confidentiels pour banques, assurances, cabinets juridiques. Documents sensibles (contrats, testaments, brevets) remis en main propre."
              },
              {
                sector: "Fashion & Luxe",
                zones: "8e, 1er, 6e",
                desc: "Livraison de collections pour boutiques des Champs-Élysées. Échantillons et pièces de collection."
              },
              {
                sector: "Santé & Médical",
                zones: "5e, 11e, 14e",
                desc: "Transport de prélèvements biologiques, en colis fermé préparé par l'expéditeur. Matériel médical."
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
                desc: "Livraison de documents événementiels (invitations, programmes). Acheminement de matériel urgent pour salons & congrès."
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

      {/* ── 3. Déroulé d'une course ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase text-center">Processus simple</div>
        <h2 className={`mb-12 text-center ${H2}`}>Organiser une course à Paris</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { num: "01", title: "Demande immédiate", desc: "Vous commandez en ligne ou par téléphone, pour n’importe quel arrondissement. Une [course le dimanche](/services/coursier-dimanche-paris) se commande de la même façon." },
            { num: "02", title: "Enlèvement", desc: "Un coursier se faufile dans le trafic parisien pour récupérer votre pli en moins de 45 minutes." },
            { num: "03", title: "Preuve de remise", desc: "Vous suivez la course en ligne. Une fois le pli remis en main propre, vous recevez l'heure exacte et le nom du destinataire." }
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-line shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-[16px] font-bold text-white shadow-md">
                {step.num}
              </div>
              <h3 className="mb-3 text-[18px] font-bold text-ink">{step.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-muted"><InlineLinks text={step.desc} /></p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 text-[15px] leading-[1.7]">
          <div>
            <h3 className="mb-4 font-bold text-ink">Ce qui complique une course à Paris</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Circulation :</strong> bouchons, travaux et voies fermées changent d&apos;un jour à l&apos;autre</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Adresses difficiles :</strong> immeubles sans numéro visible, entrée sur cour, digicode</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">-</span>
                <span><strong>Accès contrôlés :</strong> tribunaux, ministères, sièges sociaux avec accueil ou contrôle d&apos;identité</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-ink">Comment on fait</h3>
            <ul className="space-y-3 text-muted">
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Deux-roues :</strong> moto et scooter, plus rapides qu&apos;une voiture en plein centre</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Consignes notées :</strong> digicode, étage, nom à demander : vous les indiquez à la commande</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">✓</span>
                <span><strong>Suivi en ligne :</strong> vous voyez où en est la course, et l&apos;heure de remise est enregistrée</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. Paris et la petite couronne ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <h2 className={`mb-6 max-w-[28ch] ${H2}`}>Paris et la petite couronne : une seule flotte</h2>
          <div className="grid max-w-[68ch] gap-5 text-[15.5px] leading-[1.7] text-muted">
            <p>
              Nos coursiers ne s&apos;arrêtent pas au périphérique. La même flotte de deux-roues dessert les 20
              arrondissements et les trois départements voisins (92, 93, 94), avec le même dispatcheur, la même
              prise en charge en moins de 45 minutes et la même preuve de remise horodatée. Pour un envoi entre
              Paris et la petite couronne, vous n&apos;avez donc qu&apos;une seule course à commander et un seul
              interlocuteur à joindre. Que le colis parte de la rue de Rivoli pour Boulogne-Billancourt ou de
              Montreuil pour le 8e, le trajet reste direct, sans regroupement ni relais.
            </p>
            <p>
              Le détail des communes, des délais et des tarifs figure sur notre page{" "}
              <Link href="/zones/petite-couronne" className={LINK}>coursier banlieue Paris</Link>. Pour un envoi
              qui ne peut pas attendre, notre{" "}
              <Link href="/services/coursier-urgent-paris" className={LINK}>coursier urgent Paris</Link> ou notre{" "}
              <Link href="/services/coursier-express-paris" className={LINK}>coursier express Paris</Link> part dès
              la confirmation. Le prix de chaque course s&apos;affiche avant la commande ; voyez le{" "}
              <Link href="/tarifs" className={LINK}>tarif coursier Paris</Link>. Pour un envoi en deux-roues, voyez aussi notre <Link href="/services/coursier-moto-paris" className={LINK}>coursier moto à Paris</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Zones proches ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <h2 className={`mb-6 ${H2}`}>Zones proches</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
          <Link href="/zones/petite-couronne" className="text-ink underline underline-offset-2">Petite couronne : 92, 93, 94</Link>
          <Link href="/zones/la-defense" className="text-ink underline underline-offset-2">La Défense</Link>
          <Link href="/zones/grande-couronne" className="text-ink underline underline-offset-2">Grande couronne : 77, 78, 91, 95</Link>
        </div>
      </section>

      {/* ── FAQ (sans H2 : hors plan) ── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Foire Aux Questions</div>
            <p className={H2}>Vos questions sur un coursier à Paris</p>
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

      {/* ── CTA (sans H2 : hors plan) ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course maintenant ?
              </p>
              <p className="text-[15px] text-white/60">Prise en charge en moins de 2 minutes, 7j/7 de 8h à 19h.</p>
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
      <TrustBlock />
    </>
  );
}
