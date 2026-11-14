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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Guides du coursier B2B à Paris - ONE CONNEXION",
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
              Guides pratiques du coursier B2B
            </h1>
            <p className="max-w-[60ch] text-[17px] leading-[1.6] text-white/70">
              Ce qu'il faut savoir avant de confier un envoi urgent à un coursier : préparer un pli,
              anticiper le transport d'un prélèvement, comprendre ce qui fait le prix d'une course.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {GUIDES.map((guide, i) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex flex-col gap-4 border border-line bg-paper-card p-7 transition-colors hover:border-ink"
              >
                <span className="flex items-center gap-3 font-mono text-[12px] tracking-[0.14em] text-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-ink text-[12px] font-semibold tracking-normal text-white">{String(i + 1).padStart(2, "0")}</span>
                  GUIDE
                </span>
                <h2 className="text-[19px] font-bold leading-[1.25] tracking-[-0.01em] text-ink">{guide.title}</h2>
                <p className="flex-1 text-[14.5px] leading-[1.65] text-muted">{guide.summary}</p>
                <span className="flex items-center gap-1.5 border-t border-line pt-4 text-[13.5px] font-bold text-accent-dark">
                  Lire le guide
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Les guides par besoin</h2>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
                Pour un document sensible, commencez par le guide pour{" "}
                <Link href="/guides/envoyer-un-pli-confidentiel-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">envoyer un pli confidentiel</Link>.
                Côté santé, deux lectures : le{" "}
                <Link href="/guides/transport-de-prelevements-medicaux" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">transport de prélèvements médicaux</Link>
                , le guide pour{" "}
                <Link href="/guides/expedier-du-materiel-de-laboratoire" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">expédier du matériel de laboratoire</Link>
                {" "}et celui du{" "}
                <Link href="/guides/coursier-ehpad-logistique-des-soins" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">coursier pour EHPAD</Link>.
              </p>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
                Pour comparer les offres, lisez ce qui fait le{" "}
                <Link href="/guides/prix-coursier-express-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">prix d&apos;un coursier express à Paris</Link>
                , les{" "}
                <Link href="/guides/delai-formules-coursier-express" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">délais par formule</Link>
                {" "}et la différence entre une{" "}
                <Link href="/guides/course-dediee-coursier" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">course dédiée</Link>
                {" "}et une livraison groupée.
              </p>
            </div>
            <div>
              <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Les guides par zone et par usage</h2>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
                Pour un envoi qui sort de Paris, le guide du{" "}
                <Link href="/guides/coursier-paris-banlieue" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">coursier en banlieue parisienne</Link>
                {" "}décrit les trajets vers la petite et la grande couronne ; les communes couvertes sont listées sur la page{" "}
                <Link href="/zones" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">zones de livraison</Link>.
              </p>
              <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
                Pour un besoin régulier, voyez le guide de la{" "}
                <Link href="/guides/livraison-le-jour-meme-entreprise" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">livraison le jour même en entreprise</Link>
                {" "}: il aide à choisir entre une course dédiée et une tournée.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageSchema>
  );
}
