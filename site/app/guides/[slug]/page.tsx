/**
 * app/guides/[slug]/page.tsx
 * Gabarit des guides pratiques, pré-rendu pour chaque slug de lib/guides.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { GUIDE_SLUGS, getGuide } from "@/lib/guides";
import { SITE_URL } from "@/lib/site-content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const url = `/guides/${guide.slug}`;
  return {
    title: guide.seoTitle,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION — Coursier B2B Paris & Île-de-France" }],
      title: `${guide.seoTitle} — ONE CONNEXION`,
      description: guide.description,
      url,
      type: "article",
      locale: "fr_FR",
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const pageUrl = `${SITE_URL}/guides/${guide.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          inLanguage: "fr-FR",
          datePublished: guide.published,
          dateModified: guide.published,
          mainEntityOfPage: pageUrl,
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
            { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-[860px] px-[clamp(20px,4vw,28px)] pt-16 pb-14">
            <Link href="/guides" className="mb-6 inline-block text-[13px] text-white/60 hover:text-white">
              ← Tous les guides
            </Link>
            <h1 className="mb-6 text-[clamp(30px,4.5vw,48px)] font-bold leading-[1.1] tracking-[-0.03em]">
              {guide.title}
            </h1>
            <p className="text-[17px] leading-[1.6] text-white/70">{guide.intro}</p>
          </div>
        </section>

        <article className="mx-auto max-w-[860px] px-[clamp(20px,4vw,28px)] py-14">
          {guide.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="mb-4 text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.02em] text-ink">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="mb-4 text-[16.5px] leading-[1.7] text-muted">
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="ml-5 list-disc space-y-2 text-[16.5px] leading-[1.7] text-muted">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mb-12">
            <h2 className="mb-5 text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.02em] text-ink">
              Questions fréquentes
            </h2>
            <div className="flex flex-col gap-4">
              {guide.faq.map((item) => (
                <div key={item.question} className="rounded-xl border border-line bg-white p-5">
                  <h3 className="mb-2 text-[16px] font-bold text-ink">{item.question}</h3>
                  <p className="text-[15px] leading-[1.65] text-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[16px] font-semibold">Un envoi à organiser ? Devis gratuit sous 2 h.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={guide.service.href}
                className="flex items-center justify-center gap-2 rounded-[6px] border border-white/25 px-6 py-3 text-[14px] font-semibold hover:bg-white/10"
              >
                {guide.service.label}
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-[6px] bg-accent px-6 py-3 text-[14px] font-bold text-white hover:bg-accent-dark"
              >
                Nous contacter <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
