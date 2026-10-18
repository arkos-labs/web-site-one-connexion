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
  title: { absolute: "Prestations coursier B2B à Paris et en Île-de-France" },
  description:
    "Services coursier B2B Île-de-France: plis confidentiels, transport médical, e-commerce, tournées régulières. Tarif fixe, traçabilité complète, 20+ ans d'expérience B2B Paris.",
  alternates: { canonical: "/services" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Prestations - coursier B2B à Paris et en Île-de-France",
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

      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/services-bg-opt.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
            Nos prestations de coursier à Paris et en Île-de-France.
          </h1>

          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Plis confidentiels, prélèvements médicaux, colis e-commerce, tournées
            régulières : choisissez votre besoin pour voir comment se déroule la
            course. Le tarif, lui, ne change pas : il dépend seulement de la zone
            et du délai.
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

      {/* Secteurs d'expertise */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Expertise métier
          </div>
          <h2 className="mb-12 max-w-[32ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Nos secteurs d'expertise - 20 ans d'expérience B2B
          </h2>
          <p className="mb-12 max-w-[70ch] text-[15.5px] leading-[1.7] text-muted">
            One Connexion n'est pas un coursier générique. Nous avons développé une expertise approfondie dans 4 secteurs stratégiques avec standards opérationnels strictes, formations dédiées et partenariats établis.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Plis Confidentiels & Documents Sensibles",
                standards: ["Signature de discrétion pour chaque coursier", "Acheminement direct (pas de transit)", "Preuve de remise en main propre", "Conformité RGPD pour données personnelles", "Assurance responsabilité civile"],
                industries: "Cabinets d'avocats, études notariales, banques, assurances, RH",
                volume: "5000+ plis confidentiels par an"
              },
              {
                title: "Transport Médical & Prélèvements Biologiques",
                standards: ["Température contrôlée si requise", "Emballage stérile conforme", "Respect délai SFBC (30-60 min)", "Traçabilité chaîne du froid", "Coursiers formés protocoles médicaux"],
                industries: "Laboratoires d'analyses, cliniques privées, hôpitaux",
                volume: "15+ laboratoires partenaires, 8+ cliniques"
              },
              {
                title: "Livraison E-commerce Premium & Dernier KM",
                standards: ["Remise en main propre signée", "Créneaux horaires flexibles", "Notification client avant passage", "Photo de livraison", "Gestion colis non livrés"],
                industries: "E-commerce luxe, cosmétiques, compléments alimentaires",
                volume: "Colis volumineux jusqu'à 30 kg"
              },
              {
                title: "Tournées Régulières & Circuits Multi-sites",
                standards: ["Planning mensuel fixe garanti", "Collecte multi-sites une seule course", "Facture unique par mois", "Réduction tarifaire volume", "Engagement 6-12 mois"],
                industries: "Multisite parisien, distribution catalogues, navettes inter-sites",
                volume: "Économies réalisées : -25% vs ponctuelles"
              }
            ].map((sector) => (
              <div key={sector.title} className="rounded-xl border border-line bg-white p-8">
                <h3 className="mb-6 text-[18px] font-bold text-ink">{sector.title}</h3>
                <div className="mb-6 space-y-3">
                  <div>
                    <div className="mb-2 font-mono text-[10px] tracking-[0.1em] text-label uppercase">Standards appliqués</div>
                    <ul className="space-y-2">
                      {sector.standards.map((std) => (
                        <li key={std} className="flex gap-2 text-[13.5px] text-muted">
                          <span className="font-bold text-accent">+</span>
                          <span>{std}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-line pt-4">
                  <div className="mb-3">
                    <div className="font-mono text-[10px] tracking-[0.1em] text-label uppercase">Industries desservies</div>
                    <p className="text-[13.5px] text-muted">{sector.industries}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.1em] text-label uppercase">Volume / Partenaires</div>
                    <p className="text-[13.5px] font-medium text-accent">{sector.volume}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
