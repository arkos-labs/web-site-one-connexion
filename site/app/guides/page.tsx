import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageSchema from "@/components/PageSchema";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides du coursier B2B à Paris",
  description:
    "Guides pratiques pour vos envois urgents à Paris : plis confidentiels, transport de prélèvements médicaux et calcul du prix d'un coursier express.",
  alternates: { canonical: "/guides" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION — Coursier B2B Paris & Île-de-France" }],
    title: "Guides du coursier B2B à Paris — ONE CONNEXION",
    description: "Plis confidentiels, prélèvements médicaux, prix d'un coursier : nos guides pratiques.",
    url: "/guides",
    type: "website",
    locale: "fr_FR",
  },
};

export default function GuidesPage() {
  return (
    <PageSchema path="/guides" name="Guides">
      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-20 pb-16">
            <h1 className="mb-6 text-[clamp(36px,5vw,60px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Guides pratiques
            </h1>
            <p className="max-w-[60ch] text-[17px] leading-[1.6] text-white/70">
              Ce qu'il faut savoir avant de confier un envoi urgent à un coursier : préparer un pli,
              anticiper le transport d'un prélèvement, comprendre ce qui fait le prix d'une course.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-7 shadow-sm transition-all hover:border-accent/40 hover:shadow-md"
              >
                <h2 className="text-[19px] font-bold leading-[1.25] tracking-[-0.01em] text-ink">{guide.title}</h2>
                <p className="flex-1 text-[14.5px] leading-[1.65] text-muted">{guide.description}</p>
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-accent">
                  Lire le guide
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PageSchema>
  );
}
