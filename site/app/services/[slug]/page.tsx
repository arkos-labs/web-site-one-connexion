/**
 * app/services/[slug]/page.tsx
 * Gabarit unique des pages de prestation. Pré-rendu statiquement pour chaque
 * slug déclaré dans lib/services. Un slug inconnu produit un vrai 404.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ServiceCta from "@/components/services/ServiceCta";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceRelated from "@/components/services/ServiceRelated";
import ServiceSteps from "@/components/services/ServiceSteps";
import ServiceUseCases from "@/components/services/ServiceUseCases";
import { SERVICE_SLUGS, getService } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) return {};

  const url = `/services/${service.slug}`;

  return {
    title: service.seo.title,
    description: service.seo.description,
    keywords: service.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: service.seo.title,
      description: service.seo.description,
      url,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const pageUrl = `${SITE_URL}/services/${service.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.card.title,
    description: service.seo.description,
    serviceType: service.card.tag,
    areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
    provider: {
      "@type": "Organization",
      name: "ONE CONNEXION",
      url: SITE_URL,
    },
    url: pageUrl,
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: service.card.title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <ServiceHero service={service} />

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        <section className="border-b border-line py-[72px]">
          <h2 className="mb-7 max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            {service.context.title}
          </h2>
          <div className="grid max-w-[68ch] gap-5">
            {service.context.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-[16.5px] leading-[1.65] text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Procédure
            </div>
            <h2 className="max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              De la commande à la preuve de remise.
            </h2>
          </div>
          <ServiceSteps steps={service.steps} />
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Prestations incluses
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-10 gap-y-px">
            {service.included.map((item) => (
              <li
                key={item}
                className="border-b border-line py-[15px] text-[15.5px] leading-[1.5] text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Cas d’usage
            </div>
            <h2 className="max-w-[22ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Trois situations que nous traitons chaque semaine.
            </h2>
          </div>
          <ServiceUseCases useCases={service.useCases} />
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Zone couverte
          </div>
          <p className="max-w-[68ch] text-[16.5px] leading-[1.65] text-muted">
            {service.coverage}
          </p>
          <Link
            href="/#flotte"
            className="mt-6 inline-block font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase hover:text-ink"
          >
            Voir la flotte et la couverture →
          </Link>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Questions fréquentes
            </div>
            <h2 className="max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Ce que les cabinets nous demandent.
            </h2>
          </div>
          <ServiceFaq faq={service.faq} />
        </section>

        <section className="py-[72px]">
          <div className="mb-9 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Autres prestations
          </div>
          <ServiceRelated currentSlug={service.slug} />
        </section>
      </div>

      <ServiceCta serviceTitle={service.card.title} />
    </>
  );
}
