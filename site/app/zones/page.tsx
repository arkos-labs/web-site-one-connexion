/**
 * app/zones/page.tsx
 * Hub des zones géographiques couvertes par ONE CONNEXION.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-content";
import DeptCards from "@/components/sections/DeptCards";

export const metadata: Metadata = {
  title: { absolute: "Zones île-de-france : couverture complète de Paris et Île-de-France" },
  description:
    "Zones de couverture One Connexion : Paris, petite couronne, La Défense, grande couronne. Livraison express Île-de-France dès 28 euros. Tarifs fixes, traçabilité GPS, 6j/7 9h-19h.",
  alternates: { canonical: "/zones" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Zones", item: `${SITE_URL}/zones` },
  ],
};

const ZONES = [
  {
    dept: "75",
    name: "Paris intramuros",
    desc: "Les 20 arrondissements, scooters dédiés, délai < 30 min en moyenne.",
    href: "/zones/paris",
    tag: "Standard",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    dept: "92",
    name: "La Défense & Hauts-de-Seine",
    desc: "Nanterre, Neuilly, Boulogne, Levallois et tout le 92 au tarif standard.",
    href: "/zones/la-defense",
    tag: "Standard",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    dept: "93",
    name: "Seine-Saint-Denis",
    desc: "Saint-Denis, Montreuil, Pantin, Aubervilliers et tout le 93.",
    href: "/zones/petite-couronne",
    tag: "Standard",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    dept: "94",
    name: "Val-de-Marne",
    desc: "Vincennes, Créteil, Ivry, Saint-Mandé et tout le 94. Siège One Connexion.",
    href: "/zones/petite-couronne",
    tag: "Standard",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    dept: "77",
    name: "Seine-et-Marne",
    desc: "Melun, Marne-la-Vallée, Meaux - dès 59 € TTC selon la distance.",
    href: "/zones/grande-couronne",
    tag: "Dès 59 € TTC",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    dept: "78",
    name: "Yvelines",
    desc: "Versailles, Saint-Quentin-en-Yvelines - dès 62 € TTC selon la distance.",
    href: "/zones/grande-couronne",
    tag: "Dès 62 € TTC",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    dept: "91",
    name: "Essonne",
    desc: "Évry-Courcouronnes, Massy, Palaiseau - dès 62 € TTC selon la distance.",
    href: "/zones/grande-couronne",
    tag: "Dès 62 € TTC",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    dept: "95",
    name: "Val-d'Oise",
    desc: "Cergy-Pontoise, Argenteuil, Roissy-CDG - dès 60 € TTC selon la distance.",
    href: "/zones/grande-couronne",
    tag: "Dès 60 € TTC",
    tagColor: "bg-amber-100 text-amber-700",
  },
];

export default function ZonesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Zones de livraison</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Couverture géographique
          </div>
          <h1 className="mb-6 max-w-[20ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Zones île-de-france
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Paris intramuros, petite couronne et grande couronne sont couverts
            sans rupture de charge. Un seul dispatch, une seule facturation,
            le même niveau d'exigence partout.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z) => (
            <Link
              key={z.dept}
              href={z.href}
              className="flex flex-col gap-3 rounded-xl border border-line bg-paper-card p-6 hover:border-ink"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-white">
                  {z.dept}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${z.tagColor}`}>{z.tag}</span>
              </div>
              <h2 className="font-bold tracking-[-0.01em] text-ink">{z.name}</h2>
              <p className="text-[13px] leading-[1.55] text-muted">{z.desc}</p>
              <div className="mt-auto font-mono text-[10px] tracking-[0.1em] text-accent-dark uppercase">Voir la zone →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Guide par besoin */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Quel service selon votre zone
          </div>
          <h2 className="mb-12 max-w-[28ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Guide des zones par besoin
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                zone: "Paris Intramuros",
                dept: "75",
                budget: "A partir de 28 euros TTC",
                delai: "moins de 45 min enlèvement",
                ideal: "Plis urgents, documents sensibles, e-commerce premium",
                exemple: "Livrer contrat signé avant 18h en 2h"
              },
              {
                zone: "Petite Couronne",
                dept: "92, 93, 94",
                budget: "39 € TTC, puis 2 €/km au-delà de 8 km",
                delai: "moins de 45 min enlèvement",
                ideal: "Transport médical, logistique B2B, multisite parisiens",
                exemple: "Enlever prélèvements biologiques Vitry et livrer Créteil en moins de 1h"
              },
              {
                zone: "La Défense & Hauts-de-Seine",
                dept: "92",
                budget: "39 € TTC, puis 2 €/km au-delà de 8 km",
                delai: "moins de 30 min enlèvement intra-Défense",
                ideal: "Livraisons inter-tours, documents confidentiels, démarches RH",
                exemple: "Distribuer dossier candidature entre tours de La Défense"
              },
              {
                zone: "Grande Couronne",
                dept: "77, 78, 91, 95",
                budget: "A partir de 60 euros TTC",
                delai: "60-90 min enlèvement",
                ideal: "Livraisons moins urgentes, zones éloignées",
                exemple: "Enlever échantillons Évry et livrer Versailles en 2h"
              }
            ].map((item) => (
              <div key={item.zone} className="rounded-xl border border-line bg-white p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-bold text-ink">{item.zone}</h3>
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-bold text-accent">
                    {item.dept}
                  </span>
                </div>
                <div className="space-y-3 text-[13.5px]">
                  <div>
                    <div className="font-medium text-label">Budget :</div>
                    <div className="text-muted">{item.budget}</div>
                  </div>
                  <div>
                    <div className="font-medium text-label">Délai :</div>
                    <div className="text-muted">{item.delai}</div>
                  </div>
                  <div>
                    <div className="font-medium text-label">Idéal pour :</div>
                    <div className="text-muted">{item.ideal}</div>
                  </div>
                  <div>
                    <div className="font-medium text-label">Exemple :</div>
                    <div className="text-muted">{item.exemple}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toutes les communes desservies, avec lien vers leur page dédiée */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[88px]">
        <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          <span className="h-px w-6 bg-accent" />
          Villes desservies
        </div>
        <h2 className="mb-10 max-w-[24ch] text-balance text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Une page pour chaque ville, petite et grande couronne.
        </h2>
        <DeptCards depts={["92", "93", "94", "77", "78", "91", "95"]} />
      </section>
    </>
  );
}
