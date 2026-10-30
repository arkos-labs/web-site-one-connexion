/**
 * app/zones/grande-couronne/page.tsx
 * Page locale "Coursier grande couronne (77/78/91/95)".
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import DeptCards from "@/components/sections/DeptCards";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { priceFromParis } from "@/lib/pricing";

/** Exemples de prix, du plus proche au plus loin de Paris (calculés par la grille). */
const EXAMPLES = ["Argenteuil 95", "Versailles 78", "Évry-Courcouronnes 91", "Cergy 95", "Meaux 77", "Coulommiers 77"];

const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

export const metadata: Metadata = {
  title: "Coursier grande couronne 77, 78, 91, 95",
  description:
    "Coursier en grande couronne : Seine-et-Marne (77), Yvelines (78), Essonne (91), Val-d'Oise (95). Course directe vers Paris ou la banlieue, dès 60 € TTC selon la distance, du lundi au samedi.",
  alternates: { canonical: "/zones/grande-couronne" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Coursier grande couronne - Seine-et-Marne, Yvelines, Essonne, Val-d'Oise | ONE CONNEXION",
    description: "Courses directes entre la grande couronne, la banlieue et Paris. Prix affiché avant de commander.",
    url: "/zones/grande-couronne",
    type: "website",
    locale: "fr_FR",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Zones", item: `${SITE_URL}/zones` },
    { "@type": "ListItem", position: 3, name: "Grande couronne", item: `${SITE_URL}/zones/grande-couronne` },
  ],
};

const FAQ = [
  { q: "Quel est le prix d’une course en grande couronne ?", a: "En grande couronne, le prix suit la distance entre Paris et l’adresse la plus éloignée du trajet, retour du coursier compris. En délai Normal (3 h) : 70 € TTC pour Versailles, 91 € pour Évry, 113 € pour Cergy, 139 € pour Meaux. L’Urgent (1 h 30) coûte 1,5 fois ce prix, le Super (1 h) 2 fois." },
  { q: "Faites-vous les trajets entre la grande couronne et Paris ?", a: "Oui, dans les deux sens, et aussi vers la petite couronne ou une autre commune de grande couronne. Le coursier va directement de l’enlèvement à la remise." },
  { q: "Quel poids peut-on vous confier ?", a: "Jusqu’à 18 kg, dans le top-case d’un deux-roues. Au-delà de 10 kg, ou pour un colis encombrant, appelez-nous avant de commander." },
  { q: "Quels sont vos horaires en grande couronne ?", a: "Du lundi au samedi, de 9h à 19h, comme à Paris. Nous sommes fermés le dimanche et les jours fériés." },
  { q: "Ma commune n’a pas de page, est-elle desservie ?", a: "Les quatre départements de grande couronne sont desservis. Saisissez l’adresse dans le formulaire de commande : le prix s’affiche tout de suite, ou appelez-nous en cas de doute." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function ZoneGrandeCouronne() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <Link href="/zones" className="hover:text-white">Zones</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Grande couronne</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Zone couverte · 77 / 78 / 91 / 95
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier express en grande couronne.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Seine-et-Marne, Yvelines, Essonne et Val-d’Oise : un coursier vient chercher votre pli
            ou votre colis et le livre directement, vers Paris, la petite couronne ou une autre
            commune de la grande couronne.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/#commander" className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark">
              Commander une course
            </a>
            <Link href="/tarifs" className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Départements ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Couverture détaillée</div>
        <h2 className="mb-12 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Quatre départements, une page par ville.
        </h2>
        <DeptCards depts={["77", "78", "91", "95"]} />
        <p className="mt-6 text-[13px] text-muted">
          Votre commune n’est pas dans la liste ? Elle est desservie aussi : saisissez l’adresse pour voir le prix, ou appelez-nous.
        </p>
      </section>

      {/* ── Tarifs ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Tarifs</div>
          <h2 className="mb-8 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Un prix selon la distance, connu avant de commander.
          </h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-4 text-left font-mono text-[10px] tracking-[0.14em] text-label uppercase">Course Paris ↔</th>
                  <th className="p-4 text-right font-mono text-[10px] tracking-[0.14em] text-label uppercase">Normal · 3 h</th>
                  <th className="p-4 text-right font-mono text-[10px] tracking-[0.14em] text-label uppercase">Urgent · 1 h 30</th>
                  <th className="p-4 text-right font-mono text-[10px] tracking-[0.14em] text-label uppercase">Super · 1 h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {EXAMPLES.map((place) => (
                  <tr key={place}>
                    <td className="p-4 font-medium text-ink">{place.replace(/ \d+$/, "")} <span className="font-mono text-[12px] text-muted">{place.slice(-2)}</span></td>
                    {(["standard", "urgent", "flash"] as const).map((s) => (
                      <td key={s} className="p-4 text-right font-semibold text-ink tabular-nums">{euro(priceFromParis(place, s))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-[70ch] text-[14.5px] leading-[1.65] text-muted">
            Prix TTC. Le coursier part de Paris : le prix suit la distance entre Paris et l’adresse la plus éloignée
            du trajet, retour compris, que l’autre adresse soit à Paris, en petite couronne ou en grande couronne.
            Le prix exact de votre course s’affiche dès que vous saisissez les adresses.
            Avec un compte entreprise, les factures se règlent sous 30 jours.
          </p>
        </div>
      </section>

      {/* ── Prestations ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations</div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Toutes les missions en grande couronne.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-line bg-paper-card p-6 hover:border-ink transition-colors"
            >
              <div className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">{s.card.tag}</div>
              <h3 className="font-bold tracking-[-0.01em]">{s.card.title}</h3>
              <p className="text-[13.5px] leading-[1.55] text-muted flex-1">{s.card.body}</p>
              <div className="mt-4 font-mono text-[10px] tracking-[0.1em] text-accent-dark uppercase">Voir →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Foire Aux Questions</div>
            <h2 className="text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Vos questions sur la grande couronne
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-line bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Autres zones ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="border-t border-line pt-12">
          <div className="mb-6 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Autres zones</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/zones/paris" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Paris intramuros (75)
            </Link>
            <Link href="/zones/petite-couronne" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Petite couronne (92, 93, 94)
            </Link>
            <Link href="/zones/la-defense" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              La Défense
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course en grande couronne maintenant ?
              </h2>
              <p className="text-[15px] text-white/60">Du lundi au samedi, de 9h à 19h.</p>
            </div>
            <a href={`tel:${PHONE_TEL}`} className="rounded-[4px] bg-accent px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-accent-dark">
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
