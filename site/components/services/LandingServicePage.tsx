/**
 * components/services/LandingServicePage.tsx
 * Gabarit des pages de lib/services/landing.ts : un H1, quatre H2 du plan (cinq avec une FAQ),
 * aucun lien interne dans le corps sauf [ancre](/chemin) dans une page au plan étendu.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import InlineLinks, { stripLinks } from "@/components/InlineLinks";
import type { LandingService } from "@/lib/services/landing";
import { PHONE_DISPLAY, PHONE_TEL, SITE_URL } from "@/lib/site-content";

const H2_CLASS = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]";

export function landingMetadata(page: LandingService): Metadata {
  const url = `/services/${page.slug}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
      title: page.title,
      description: page.description,
      url,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default function LandingServicePage({ page }: { page: LandingService }) {
  const pageUrl = `${SITE_URL}/services/${page.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.name,
    description: page.description,
    areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
    provider: { "@id": `${SITE_URL}/#organization` },
    url: pageUrl,
    ...(page.offers && {
      offers: page.offers.map((o) => ({
        "@type": "Offer",
        name: o.name,
        price: String(o.price),
        priceCurrency: "EUR",
        url: pageUrl,
        priceSpecification: {
          "@type": "PriceSpecification",
          price: String(o.price),
          priceCurrency: "EUR",
          valueAddedTaxIncluded: true,
        },
      })),
    }),
  };

  const faqSchema = page.faq && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: stripLinks(item.answer) },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Prestations", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: page.name, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
          <nav aria-label="Fil d’Ariane" className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="text-white/40 hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <Link href="/services" className="text-white/40 hover:text-white">Prestations</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">{page.name}</span>
          </nav>

          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
            {page.h1}
          </h1>

          <p className="mb-9 max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">{page.intro}</p>

          <div className="flex flex-wrap gap-3">
            <a href="/#commander" className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark">
              Commander une course
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white"
            >
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        {page.sections.map((s) => (
          <section key={s.title} className="border-b border-line py-[72px] last:border-b-0">
            <h2 className={`mb-7 max-w-[26ch] ${H2_CLASS}`}>{s.title}</h2>
            <div className="grid max-w-[68ch] gap-5">
              {s.paragraphs.map((p) => (
                <p key={p} className="text-[16.5px] leading-[1.65] text-muted"><InlineLinks text={p} /></p>
              ))}
            </div>
          </section>
        ))}

        {page.faq && (
          <section className="py-[72px]">
            <h2 className={`mb-7 max-w-[26ch] ${H2_CLASS}`}>Questions fréquentes</h2>
            <div className="grid max-w-[68ch] gap-6">
              {page.faq.map((item) => (
                <div key={item.question}>
                  <h3 className="mb-2 font-bold tracking-[-0.01em]">{item.question}</h3>
                  <p className="text-[15.5px] leading-[1.65] text-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
