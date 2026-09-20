/**
 * app/services/page.tsx
 * Index des prestations. Capte les requêtes génériques ("coursier B2B Paris")
 * et distribue vers les quatre pages métier.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ServiceCta from "@/components/services/ServiceCta";
import { SERVICES } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Prestations — coursier B2B à Paris et en Île-de-France",
  description:
    "Quatre prestations de coursier B2B en Île-de-France : plis confidentiels, transport médical, livraison e-commerce le jour même et compte entreprise. Course dédiée, traçabilité, interlocuteur unique.",
  keywords: [
    "coursier B2B Paris",
    "prestations coursier Île-de-France",
    "transport urgent entreprise Paris",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Prestations — coursier B2B à Paris et en Île-de-France",
    description:
      "Quatre prestations de coursier B2B en Île-de-France, chacune avec sa procédure écrite.",
    url: "/services",
    type: "website",
    locale: "fr_FR",
  },
};

export default function ServicesIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prestations",
        item: `${SITE_URL}/services`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/services-bg-new.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
          <nav
            aria-label="Fil d’Ariane"
            className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase"
          >
            <Link href="/" className="text-white/40 hover:text-white">
              Accueil
            </Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Prestations</span>
          </nav>

          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Prestations
          </div>

          <h1 className="mb-6 max-w-[20ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier B2B à Paris : des solutions expertes, une même exigence.
          </h1>

          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Chaque secteur impose ses contraintes : signature manuscrite,
            maintien en température, créneau de réception. Nos procédures sont
            écrites par type de flux, pas improvisées à la course.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="flex flex-col gap-3.5 border border-line bg-paper-card px-[30px] pb-[30px] pt-[34px] text-ink hover:border-ink hover:text-ink"
            >
              <div className="font-mono text-[10px] tracking-[0.16em] text-label uppercase">
                {service.card.tag}
              </div>
              <h2 className="text-xl font-bold tracking-[-0.02em]">
                {service.card.title}
              </h2>
              <p className="text-[15px] leading-[1.6] text-muted">
                {service.card.body}
              </p>
              <div className="mt-auto pt-5 font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase">
                Voir la prestation →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-10">
        <div className="border-t border-line pt-20">
          <h2 className="mb-8 text-[clamp(24px,2.5vw,32px)] font-bold leading-[1.2] tracking-[-0.02em]">
            Une gamme de prestations calibrée pour les exigences franciliennes
          </h2>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <div>
              <p className="mb-4">
                La complexité du tissu économique parisien nécessite une approche logistique segmentée et hautement spécialisée. L'offre de <strong>One Connexion</strong> ne se limite pas à un simple déplacement d'un point A à un point B. Nous déployons de véritables solutions de <strong>transport sur-mesure</strong> pour répondre aux cahiers des charges spécifiques de l'<strong>acheminement juridique</strong>, du <strong>transport d'échantillons médicaux</strong> ou de la <strong>livraison e-commerce premium</strong>.
              </p>
              <p>
                Chaque <strong>prestation de coursier B2B</strong> que nous opérons en <strong>Île-de-France</strong> s'appuie sur des procédures opérationnelles strictes. Nos processus garantissent une chaîne de responsabilité ininterrompue, de la prise de commande centralisée jusqu'à la sécurisation de la preuve de livraison électronique, horodatée et géolocalisée.
              </p>
            </div>
            <div>
              <p className="mb-4">
                L'externalisation de vos urgences logistiques auprès de notre <strong>société de coursiers spécialisée à Paris</strong> vous octroie une flexibilité absolue. Qu'il s'agisse d'une demande ponctuelle nécessitant un enlèvement immédiat, ou de l'intégration continue de vos flux réguliers (tournées programmées), nos dispatcheurs s'engagent sur la meilleure allocation de nos ressources motorisées.
              </p>
              <p>
                Faites le choix d'une organisation robuste pour soutenir vos opérations. En confiant vos <strong>livraisons express parisiennes</strong> à One Connexion, vous sécurisez vos délais, valorisez votre image de marque auprès de vos destinataires finaux et optimisez la gestion logistique de votre cœur de métier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceCta serviceTitle="toutes prestations" />
    </>
  );
}
