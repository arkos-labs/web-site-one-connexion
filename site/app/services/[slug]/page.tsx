/**
 * app/services/[slug]/page.tsx
 * Gabarit unique des pages de prestation. Pré-rendu statiquement pour chaque
 * slug déclaré dans lib/services. Un slug inconnu produit un vrai 404.
 *
 * Avec un plan SEO (service.outline), la page compte exactement quatre H2 :
 * les trois blocs du plan, dans l'ordre, puis l'appel à l'action. Les autres
 * blocs suivent, titrés sans balise H2. Sans plan, le gabarit d'origine.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import JsonLd from "@/components/JsonLd";
import TrustBlock from "@/components/TrustBlock";
import InlineLinks from "@/components/InlineLinks";
import ServiceCta from "@/components/services/ServiceCta";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceRelated from "@/components/services/ServiceRelated";
import ServiceSteps from "@/components/services/ServiceSteps";
import ServiceUseCases from "@/components/services/ServiceUseCases";
import ServicePricing from "@/components/services/ServicePricing";
import ServicePhoto from "@/components/services/ServicePhoto";
import { SERVICE_SLUGS, getService } from "@/lib/services";
import type { ServiceSectionKey } from "@/lib/services/types";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site-content";

type Params = { slug: string };

/** Pages hors du périmètre des corrections SEO : laissées telles quelles. */
const UNTOUCHED_SERVICES = new Set(["tournees-regulieres", "transport-evenementiel"]);

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
    title: { absolute: service.seo.title },
    description: service.seo.description,
    alternates: { canonical: url },
    openGraph: {
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
      title: service.seo.title,
      description: service.seo.description,
      url,
      type: "website",
      locale: "fr_FR",
    },
  };
}

const H2_CLASS = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]";

/** Titre de bloc : H2 s'il fait partie du plan (ou sans plan, s'il l'était déjà), sinon texte. */
function Heading({ h2, className, children }: { h2: boolean; className: string; children: ReactNode }) {
  return h2 ? <h2 className={className}>{children}</h2> : <p className={className}>{children}</p>;
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
  const outline = service.outline;
  const planned = (key: ServiceSectionKey) => outline?.sections.find((s) => s.key === key);
  /** Sans plan : la balise d'origine. Avec plan : H2 seulement pour les blocs du plan. */
  const isH2 = (key: ServiceSectionKey, legacyH2: boolean) => (outline ? Boolean(planned(key)) : legacyH2);
  const titleOf = (key: ServiceSectionKey, legacy: string) => planned(key)?.title ?? legacy;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.card.title,
    description: service.seo.description,
    serviceType: service.serviceType ?? service.card.tag,
    areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
    provider: { "@id": `${SITE_URL}/#organization` },
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

  const blocks: Record<ServiceSectionKey, ReactNode> = {
    context: (
      <section key="context" className="border-b border-line py-[72px]">
        <div
          className={
            service.photos?.context
              ? "grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16"
              : ""
          }
        >
          <div>
            <Heading h2={isH2("context", true)} className={`mb-7 max-w-[20ch] ${H2_CLASS}`}>
              {titleOf("context", service.context.title)}
            </Heading>
            <div className="grid max-w-[68ch] gap-5">
              {service.context.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[16.5px] leading-[1.65] text-muted">
                  <InlineLinks text={paragraph} />
                </p>
              ))}
            </div>
          </div>
          {service.photos?.context && (
            <ServicePhoto photo={service.photos.context} className="lg:mt-2" />
          )}
        </div>
      </section>
    ),

    steps: (
      <section key="steps" className="border-b border-line py-[72px]">
        <div
          className={
            service.photos?.steps
              ? "mb-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16"
              : "mb-9"
          }
        >
          <div>
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Procédure
            </div>
            <Heading h2={isH2("steps", true)} className={`max-w-[20ch] ${H2_CLASS}`}>
              {titleOf("steps", "De la commande à la preuve de remise.")}
            </Heading>
          </div>
          {service.photos?.steps && <ServicePhoto photo={service.photos.steps} />}
        </div>
        <ServiceSteps steps={service.steps} />
      </section>
    ),

    included: (
      <section key="included" className="border-b border-line py-[72px]">
        <div className="mb-9">
          <div className={`font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase ${planned("included") ? "mb-4" : ""}`}>
            Prestations incluses
          </div>
          {planned("included") && (
            <h2 className={`max-w-[24ch] ${H2_CLASS}`}>{planned("included")?.title}</h2>
          )}
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
    ),

    useCases: (
      <section key="useCases" className="border-b border-line py-[72px]">
        <div className="mb-9">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Cas d’usage
          </div>
          <Heading h2={isH2("useCases", true)} className={`max-w-[22ch] ${H2_CLASS}`}>
            {titleOf("useCases", "Trois situations que nous traitons chaque semaine.")}
          </Heading>
        </div>
        <ServiceUseCases useCases={service.useCases} />
      </section>
    ),
  };

  const legacyOrder: ServiceSectionKey[] = ["context", "steps", "included", "useCases"];
  const order: ServiceSectionKey[] = outline
    ? [...outline.sections.map((s) => s.key), ...legacyOrder.filter((k) => !planned(k))]
    : legacyOrder;
  const showPricing = !outline?.hidePricing;
  const otherH2 = !outline; // pricing, FAQ, villes : H2 seulement sans plan

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <ServiceHero service={service} />

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        {order.map((key) => blocks[key])}

        {showPricing && (
          <section className="border-b border-line py-[72px]">
            <div className="mb-9">
              <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
                Tarifs
              </div>
              <Heading h2={otherH2} className={`max-w-[24ch] ${H2_CLASS}`}>
                {service.pricing.title}
              </Heading>
            </div>
            <ServicePricing pricing={service.pricing} />
          </section>
        )}

        <section className="border-b border-line py-[72px]">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Zone couverte
          </div>
          <p className="max-w-[68ch] text-[16.5px] leading-[1.65] text-muted">
            <InlineLinks text={service.coverage} />
          </p>
          <Link
            href="/flotte"
            className="mt-6 inline-block font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase hover:text-ink"
          >
            Voir la flotte et la couverture →
          </Link>
          {service.slug !== "coursier-moto-paris" && (
            <Link
              href="/services/coursier-moto-paris"
              className="mt-3 block font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase hover:text-ink"
            >
              Coursier moto Paris : livraison en deux-roues →
            </Link>
          )}
          {GUIDES.filter((g) => g.service.href === `/services/${service.slug}`).map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="mt-3 block font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase hover:text-ink"
            >
              Guide pratique : {g.title} →
            </Link>
          ))}
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Questions fréquentes
            </div>
            <Heading h2={otherH2} className={`max-w-[20ch] ${H2_CLASS}`}>
              {service.faqTitle}
            </Heading>
          </div>
          <ServiceFaq faq={service.faq} />
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Villes desservies
          </div>
          <Heading h2={otherH2} className={`mb-4 max-w-[28ch] ${H2_CLASS}`}>
            Nos coursiers en intramuros et en petite couronne
          </Heading>
          <p className="mb-9 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
            Nous intervenons dans les 20 arrondissements de{" "}
            <Link href="/zones/paris" className="text-ink underline underline-offset-2">Paris</Link>, dans la{" "}
            <Link href="/zones/petite-couronne" className="text-ink underline underline-offset-2">petite couronne</Link>{" "}
            et en grande couronne. Chaque page de ville détaille les délais et les particularités d’accès.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
            <Link href="/zones/petite-couronne" className="text-ink underline underline-offset-2">Petite couronne (92, 93, 94)</Link>
            <Link href="/zones/grande-couronne" className="text-ink underline underline-offset-2">Grande couronne (77, 78, 91, 95)</Link>
            <Link href="/zones" className="text-ink underline underline-offset-2">Toutes les villes desservies</Link>
          </div>
        </section>

        <section className="py-[72px]">
          <div className="mb-9 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Autres prestations
          </div>
          <ServiceRelated currentSlug={service.slug} />
        </section>
      </div>

      <ServiceCta serviceTitle={service.card.title} outline={outline?.cta} />
      {!UNTOUCHED_SERVICES.has(service.slug) && <TrustBlock />}
    </>
  );
}
