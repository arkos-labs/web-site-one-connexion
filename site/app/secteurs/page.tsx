/**
 * app/secteurs/page.tsx
 * Hub des secteurs d'activité desservis par ONE CONNEXION.
 * Requête visée : « coursier pour entreprise ». Plan : quatre H2, portés par
 * les cartes juridique, santé, e-commerce et compte entreprise.
 */
import HeroBackdrop from "@/components/HeroBackdrop";
import { HERO_IMAGES } from "@/lib/hero-images";
import type { Metadata } from "next";
import Link from "next/link";
import InlineLinks from "@/components/InlineLinks";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-content";
import { Scale, Activity, ShoppingBag, Briefcase, Stethoscope, Building2 } from "lucide-react";

const TITLE = "Coursier pour entreprise : nos secteurs d'activité";
const DESCRIPTION =
  "Coursier pour entreprise : cabinets juridiques, laboratoires et e-commerçants, découvrez comment nos courses dédiées s'adaptent à votre activité.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/secteurs" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
    url: "/secteurs",
    type: "website",
    locale: "fr_FR",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Secteurs", item: `${SITE_URL}/secteurs` },
  ],
};

const FAQ = [
  {
    q: "Quels secteurs couvrez-vous ?",
    a: "Nous intervenons pour les cabinets juridiques et notariaux, les laboratoires et établissements de santé, les e-commerçants, les entreprises et sièges sociaux, et l'événementiel, à Paris et en Île-de-France.",
  },
  {
    q: "Les envois sensibles sont-ils confidentiels ?",
    a: "Oui. Chaque envoi part en course dédiée, sans regroupement avec d'autres colis, et n'est remis qu'au destinataire désigné. Le nom de la personne qui reçoit l'envoi et l'heure de remise sont enregistrés.",
  },
  {
    q: "Comment fonctionne la facturation pour une entreprise ?",
    a: "Un compte entreprise regroupe les courses de vos collaborateurs : un compte par service ou par site avec le même SIRET, et des factures à régler sous 30 jours. Le prix de chaque course s'affiche avant de commander.",
  },
  {
    q: "Proposez-vous un tarif selon le volume ?",
    a: "Oui. Les clients avec un compte entreprise bénéficient d'une grille dégressive selon le volume mensuel. Pour des courses régulières, écrivez-nous pour demander un devis.",
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
  name: "Coursier pour entreprise",
  serviceType: "Coursier express B2B",
  url: `${SITE_URL}/secteurs`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
};

const SECTEURS: {
  icon: typeof Scale; slug: string; name: string; h2?: string; tag: string; color: string; iconBg: string;
  desc: string; detail: string[]; service: string; serviceLabel: string;
  /** Phrase ajoutée à la description, avec un lien [ancre](/chemin). */
  descLink?: string;
  /** Paragraphe de développement, avec liens [ancre](/chemin). */
  more?: string;
}[] = [
  {
    icon: Scale,
    slug: "juridique",
    name: "Juridique & Notarial",
    h2: "Coursier pour les cabinets juridiques",
    tag: "01 - Cabinets & études",
    color: "border-line bg-paper-card",
    iconBg: "bg-ink text-white",
    desc: "Cabinets d'avocats, études notariales, offices d'huissiers. Transport de plis confidentiels avec remise en main propre et preuve horodatée.",
    descLink: "Voir aussi notre [coursier avocat et notaire](/services/coursier-avocat-notaire).",
    more: "Un acte déposé après la clôture du greffe est un délai forclos : le coursier part dès la confirmation, remet le pli en main propre et le justificatif nomme le destinataire, l'heure et le lieu. Chaque pli voyage seul, sans regroupement, et la preuve est archivée pour être versée au dossier.",
    detail: [
      "Dépôt au greffe avant clôture",
      "Transmission d'actes entre études",
      "Transport de pièces réclamées en audience",
      "Significations et saisie-arrêts",
    ],
    service: "/services/plis-confidentiels",
    serviceLabel: "pli confidentiel",
  },
  {
    icon: Activity,
    slug: "medical",
    name: "Médical & Laboratoires",
    h2: "Coursier pour les laboratoires et la santé",
    tag: "02 - Santé & analyses",
    color: "border-line bg-paper-card",
    iconBg: "bg-ink text-white",
    desc: "Laboratoires d'analyses, cliniques privées, pharmacies hospitalières, CHU. Transport de prélèvements biologiques, matériel médical sensible et médicaments urgents.",
    descLink: "Voir aussi notre [coursier pour laboratoire](/services/coursier-laboratoire).",
    more: "Pour un prélèvement, le contenant isotherme est convenu à la commande et un relevé de température peut être joint lorsque le protocole du laboratoire l'exige. Pour le sang réfrigéré, voyez notre page [transport de prélèvements sanguins](/services/transport-prelevements-sang) ; pour le matériel et les consommables, notre [coursier médical moto](/services/transport-medical).",
    detail: [
      "Prélèvements biologiques et échantillons",
      "Matériel médical et instruments stériles",
      "Médicaments urgents inter-établissements",
      "Documents médicaux confidentiels",
    ],
    service: "/services/transport-medical",
    serviceLabel: "coursier médical moto",
  },
  {
    icon: ShoppingBag,
    slug: "ecommerce",
    name: "E-commerce & Retail",
    h2: "Coursier pour l'e-commerce et la logistique du dernier kilomètre",
    tag: "03 - Commerce en ligne",
    color: "border-line bg-paper-card",
    iconBg: "bg-ink text-white",
    desc: "E-commerçants, boutiques de luxe, showrooms et places de marché. Livraison même jour (J+0) avec remise en main propre et preuve de livraison horodatée.",
    more: "Une commande à livrer le jour même, un retour ou un échange urgent : la course est dédiée, la remise est horodatée et le prix s'affiche avant de commander. Voyez notre page [livraison e-commerce](/services/livraison-e-commerce) pour le détail.",
    detail: [
      "Livraison same-day en petite couronne",
      "Remise en main propre pour le luxe",
      "Retours et échanges urgents",
      "Livraison créneau garanti",
    ],
    service: "/services/livraison-e-commerce",
    serviceLabel: "livraison e-commerce",
  },
  {
    icon: Briefcase,
    slug: "corporate",
    name: "Corporate & Agences",
    h2: "Coursier pour les entreprises et sièges sociaux",
    tag: "04 - Entreprises & conseil",
    color: "border-line bg-paper-card",
    iconBg: "bg-ink text-white",
    desc: "Directions générales, agences de communication, cabinets de conseil et studios créatifs. Transport de maquettes, prototypes, contrats et cadeaux d'affaires.",
    more: "Contrats signés entre sièges, maquettes, dossiers d'appel d'offres : un seul interlocuteur connaît vos adresses et vos habitudes, et un [compte entreprise](/services/compte-entreprise) regroupe les courses de vos équipes, avec des factures à régler sous 30 jours.",
    detail: [
      "Maquettes et prototypes fragiles",
      "Contrats signés entre sièges",
      "Cadeaux d'affaires et coffrets",
      "Dossiers d'appel d'offres urgents",
    ],
    service: "/services/plis-confidentiels",
    serviceLabel: "Course dédiée",
  },
  {
    icon: Stethoscope,
    slug: "evenementiel",
    name: "Événementiel & Culture",
    h2: "Coursier pour l'événementiel",
    tag: "05 - Événements",
    color: "border-line bg-paper-card",
    iconBg: "bg-ink text-white",
    desc: "Organisateurs d'événements, salons professionnels, maisons de production. Transport de matériel de scène, objets d'exposition et supports de communication en temps contraint.",
    more: "Matériel de scène, supports de dernière minute, objets d'exposition : le coursier part pour votre seul envoi et livre directement sur le site de l'événement. Voyez notre page [transport événementiel](/services/transport-evenementiel).",
    detail: [
      "Matériel de scène et technique",
      "Objets d'art et d'exposition",
      "Supports de communication de dernière minute",
      "Livraison sur site événementiel",
    ],
    service: "/services/transport-evenementiel",
    serviceLabel: "Transport événementiel",
  },
  {
    icon: Building2,
    slug: "entreprises",
    name: "Grands comptes & PME",
    tag: "06 - Comptes entreprise",
    color: "border-line bg-paper",
    iconBg: "bg-paper text-muted",
    desc: "Entreprises multi-sites, ETI et grands comptes. Un compte par service ou par site, avec le même SIRET, et des factures à régler sous 30 jours.",
    detail: [
      "Factures à régler sous 30 jours",
      "Un compte par service ou par site",
      "Suivi de chaque course en ligne",
      "Prix affiché avant de commander",
    ],
    service: "/services/compte-entreprise",
    serviceLabel: "compte entreprise",
  },
];

export default function SecteursPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <HeroBackdrop src={HERO_IMAGES["secteurs"].src} />
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[11px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Secteurs d'activité</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Secteurs desservis
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier pour entreprise : nos secteurs d&apos;activité
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion ne fait pas de transport généraliste. Nos procédures sont
            conçues métier par métier, juridique, médical, e-commerce, pour répondre
            aux exigences de chaque flux.
          </p>
        </div>
      </section>

      {/* ── Grille secteurs ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {SECTEURS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.slug} className={`flex flex-col gap-5 rounded-[4px] border p-8 ${s.color}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] ${s.iconBg}`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{s.tag}</div>
                    {s.h2 ? (
                      <h2 className="text-[17px] font-bold text-ink">{s.h2}</h2>
                    ) : (
                      <h3 className="text-[17px] font-bold text-ink">{s.name}</h3>
                    )}
                  </div>
                </div>
                <p className="text-[14.5px] leading-[1.65] text-muted">
                  {s.desc}
                  {s.descLink && <> <InlineLinks text={s.descLink} /></>}
                </p>
                {s.more && (
                  <p className="text-[14.5px] leading-[1.65] text-muted">
                    <InlineLinks text={s.more} />
                  </p>
                )}
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {s.detail.map((d) => (
                    <li key={d} className="flex items-start gap-1.5 text-[13px] text-muted">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.service}
                  className="mt-2 self-start rounded-[4px] border border-ink bg-transparent px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  {s.serviceLabel} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pourquoi une course dédiée ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <h2 className="mb-6 max-w-[26ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Pourquoi une course dédiée par secteur
        </h2>
        <p className="max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          Chaque secteur a ses exigences : un pli juridique se joue sur l&apos;heure du greffe, un prélèvement sur
          son délai de stabilité, une commande e-commerce sur la promesse faite au client. Une course dédiée répond
          à tous ces cas de la même manière : un coursier pour un seul envoi, un trajet direct, sans regroupement,
          et une remise en main propre horodatée et nominative. La différence se fait dans la procédure : ce que
          nous demandons à la commande (heure limite, température, nom du destinataire) et la preuve qui revient.
          Quel que soit le secteur, le prix ne change pas avec la nature du colis, jusqu&apos;à 18 kg : seuls comptent
          la zone et le délai, détaillés sur la page{" "}
          <Link href="/tarifs" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">tarif coursier Paris</Link>.
          Pour comprendre le déroulé d&apos;une course, lisez{" "}
          <Link href="/methode" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">notre méthode</Link>.
        </p>
        <div className="mt-12 grid max-w-[780px] gap-6">
          <p className="text-[clamp(22px,2.5vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Questions fréquentes</p>
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="mb-2 font-bold tracking-[-0.01em] text-ink">{item.q}</h3>
              <p className="text-[15px] leading-[1.65] text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Votre métier, nos procédures.
              </p>
              <p className="text-[15px] text-white/60">
                Décrivez vos flux - nous proposons la procédure adaptée à votre métier.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/services" className="rounded-[4px] bg-accent px-6 py-3.5 text-center text-[14px] font-bold text-white hover:bg-accent-dark">
                Voir toutes les prestations
              </Link>
              <Link href="/#contact" className="rounded-[4px] border border-white/20 px-6 py-3.5 text-center text-[14px] font-semibold text-white hover:bg-white/10">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
