/**
 * app/secteurs/page.tsx
 * Hub des secteurs d'activité desservis par ONE CONNEXION.
 * Capte les requêtes "coursier pour cabinet avocat Paris",
 * "coursier laboratoire Paris", etc.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-content";
import { Scale, Activity, ShoppingBag, Briefcase, Stethoscope, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Secteurs d'activité — Coursier B2B spécialisé Paris | ONE CONNEXION",
  description:
    "One Connexion opère pour les cabinets juridiques, laboratoires, e-commerçants, agences et entreprises d'Île-de-France. Découvrez nos solutions par secteur.",
  alternates: { canonical: "/secteurs" },
  openGraph: {
    title: "Secteurs desservis — Coursier B2B Paris | ONE CONNEXION",
    description: "Solutions de transport express par secteur : juridique, médical, e-commerce, corporate. Paris & IDF.",
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

const SECTEURS = [
  {
    icon: Scale,
    slug: "juridique",
    name: "Juridique & Notarial",
    tag: "01 — Cabinets & études",
    color: "border-blue-200 bg-blue-50",
    iconBg: "bg-blue-100 text-blue-700",
    desc: "Cabinets d'avocats, études notariales, offices d'huissiers. Transport de plis confidentiels avec remise contre signature et preuve horodatée.",
    detail: [
      "Dépôt au greffe avant clôture",
      "Transmission d'actes entre études",
      "Transport de pièces réclamées en audience",
      "Significations et saisie-arrêts",
    ],
    service: "/services/plis-confidentiels",
    serviceLabel: "Plis confidentiels",
  },
  {
    icon: Activity,
    slug: "medical",
    name: "Médical & Laboratoires",
    tag: "02 — Santé & analyses",
    color: "border-green-200 bg-green-50",
    iconBg: "bg-green-100 text-green-700",
    desc: "Laboratoires d'analyses, cliniques privées, pharmacies hospitalières, CHU. Transport de prélèvements biologiques, matériel médical sensible et médicaments urgents.",
    detail: [
      "Prélèvements biologiques et échantillons",
      "Matériel médical et instruments stériles",
      "Médicaments urgents inter-établissements",
      "Documents médicaux confidentiels",
    ],
    service: "/services/transport-medical",
    serviceLabel: "Transport médical",
  },
  {
    icon: ShoppingBag,
    slug: "ecommerce",
    name: "E-commerce & Retail",
    tag: "03 — Commerce en ligne",
    color: "border-orange-200 bg-orange-50",
    iconBg: "bg-orange-100 text-orange-700",
    desc: "E-commerçants, boutiques de luxe, showrooms et places de marché. Livraison même jour (J+0) avec remise en main propre et signature électronique.",
    detail: [
      "Livraison same-day en petite couronne",
      "Remise en main propre pour le luxe",
      "Retours et échanges urgents",
      "Livraison créneau garanti",
    ],
    service: "/services/livraison-e-commerce",
    serviceLabel: "Livraison e-commerce",
  },
  {
    icon: Briefcase,
    slug: "corporate",
    name: "Corporate & Agences",
    tag: "04 — Entreprises & conseil",
    color: "border-purple-200 bg-purple-50",
    iconBg: "bg-purple-100 text-purple-700",
    desc: "Directions générales, agences de communication, cabinets de conseil et studios créatifs. Transport de maquettes, prototypes, contrats et cadeaux d'affaires.",
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
    tag: "05 — Événements",
    color: "border-pink-200 bg-pink-50",
    iconBg: "bg-pink-100 text-pink-700",
    desc: "Organisateurs d'événements, salons professionnels, maisons de production. Transport de matériel de scène, objets d'exposition et supports de communication en temps contraint.",
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
    tag: "06 — Comptes entreprise",
    color: "border-gray-200 bg-gray-50",
    iconBg: "bg-gray-100 text-gray-700",
    desc: "Entreprises multi-sites, ETI et grands comptes. Compte entreprise avec facturation mensuelle, imputation par service ou dossier, interlocuteur dispatch dédié.",
    detail: [
      "Facturation centralisée 30 jours",
      "Imputation par dossier ou département",
      "Rapport mensuel des courses",
      "Interlocuteur dispatch dédié",
    ],
    service: "/services/compte-entreprise",
    serviceLabel: "Compte entreprise",
  },
];

export default function SecteursPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      {/* ── Hero ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Secteurs d'activité</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Secteurs desservis
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Chaque secteur a ses contraintes. Nous les connaissons.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion ne fait pas de transport généraliste. Nos procédures sont
            conçues secteur par secteur — juridique, médical, e-commerce, corporate —
            pour répondre aux exigences spécifiques de chaque flux.
          </p>
        </div>
      </section>

      {/* ── Grille secteurs ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {SECTEURS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.slug} className={`flex flex-col gap-5 rounded-2xl border p-8 ${s.color}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{s.tag}</div>
                    <h2 className="text-[17px] font-bold text-ink">{s.name}</h2>
                  </div>
                </div>
                <p className="text-[14.5px] leading-[1.65] text-muted">{s.desc}</p>
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

      {/* ── CTA ── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Votre secteur, nos procédures.
              </h2>
              <p className="text-[15px] text-white/60">
                Décrivez vos flux — nous proposons la procédure adaptée à votre métier.
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
