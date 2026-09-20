/**
 * app/zones/petite-couronne/page.tsx
 * Page locale "Coursier petite couronne Paris (92/93/94)".
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Coursier petite couronne Paris (92, 93, 94) | ONE CONNEXION",
  description:
    "Livraison express en petite couronne parisienne : Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94). Coursier moto dédié, enlèvement < 45 min.",
  alternates: { canonical: "/zones/petite-couronne" },
  openGraph: {
    title: "Coursier petite couronne — Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne | ONE CONNEXION",
    description: "Livraison urgente B2B dans les 3 départements de petite couronne parisienne. Course dédiée, traçabilité complète.",
    url: "/zones/petite-couronne",
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
    { "@type": "ListItem", position: 3, name: "Petite couronne", item: `${SITE_URL}/zones/petite-couronne` },
  ],
};

const DEPTS = [
  {
    dept: "92",
    name: "Hauts-de-Seine",
    color: "border-blue-200 bg-blue-50",
    dotColor: "bg-blue-500",
    villes: ["Boulogne-Billancourt", "Neuilly-sur-Seine", "Levallois-Perret", "Issy-les-Moulineaux", "Nanterre", "La Défense", "Antony", "Clamart", "Montrouge"],
  },
  {
    dept: "93",
    name: "Seine-Saint-Denis",
    color: "border-green-200 bg-green-50",
    dotColor: "bg-green-500",
    villes: ["Saint-Denis", "Montreuil", "Pantin", "Aubervilliers", "Bobigny", "Noisy-le-Grand", "Vincennes (limite)", "Bondy", "Aulnay-sous-Bois"],
  },
  {
    dept: "94",
    name: "Val-de-Marne",
    color: "border-orange-200 bg-orange-50",
    dotColor: "bg-orange-500",
    villes: ["Créteil", "Vincennes", "Saint-Maur-des-Fossés", "Ivry-sur-Seine", "Vitry-sur-Seine", "Alfortville", "Champigny", "Charenton-le-Pont", "Saint-Mandé"],
  },
];

export default function ZonePetiteCouronne() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="px-2 text-white/25">›</span>
            <Link href="/zones" className="hover:text-white">Zones</Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Petite couronne</span>
          </nav>
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Zone couverte · 92 / 93 / 94
          </div>
          <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier express dans toute la petite couronne parisienne.
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion dessert les trois départements de petite couronne —
            Hauts-de-Seine (92), Seine-Saint-Denis (93) et Val-de-Marne (94) —
            aux mêmes conditions tarifaires et avec la même exigence opérationnelle.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`tel:${PHONE_TEL}`} className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark">
              Commander une course
            </a>
            <Link href="/tarifs" className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white">
              Voir les tarifs
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-[1240px] grid-cols-3 divide-x divide-white/10 px-[clamp(20px,4vw,28px)]">
            {[
              { value: "92", label: "Hauts-de-Seine" },
              { value: "93", label: "Seine-Saint-Denis" },
              { value: "94", label: "Val-de-Marne" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-[clamp(28px,3vw,40px)] font-bold text-accent">{s.value}</span>
                <span className="mt-1 text-[12px] font-medium text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Départements ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Couverture détaillée</div>
        <h2 className="mb-12 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Trois départements, une couverture sans rupture.
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {DEPTS.map((d) => (
            <div key={d.dept} className={`rounded-2xl border p-6 ${d.color}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.dotColor} text-[13px] font-bold text-white`}>
                  {d.dept}
                </div>
                <div>
                  <div className="font-bold text-ink">{d.name}</div>
                  <div className="text-[12px] text-muted">Tarif standard · devis immédiat</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {d.villes.map((v) => {
                  const slug = v.replace(" (limite)", "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
                  return (
                    <Link key={v} href={`/zones/${slug}`} className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink">
                      <MapPin size={10} className="shrink-0 text-accent" />
                      {v}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-muted">
          Toutes les villes de petite couronne non listées sont couvertes. Contactez notre dispatch pour confirmer l'adresse.
        </p>
      </section>

      {/* ── Pourquoi ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Avantages</div>
          <h2 className="mb-8 max-w-[24ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Un seul prestataire pour Paris et la banlieue.
          </h2>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <p>
              De nombreuses entreprises parisiennes ont des clients, des partenaires ou des sites
              en petite couronne. Confier ces livraisons à un prestataire différent crée une
              rupture dans la traçabilité et les conditions contractuelles. One Connexion couvre
              l'intégralité de ce territoire avec le même dispatch, le même niveau de service et
              une facturation centralisée.
            </p>
            <p>
              Notre siège est implanté à Saint-Mandé (94160), ce qui nous place au cœur de la
              petite couronne Est. Cette position géographique nous permet d'intervenir rapidement
              dans le Val-de-Marne et d'accéder à Paris intramuros comme aux autres départements
              de petite couronne en moins de 30 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-paper border-t border-gray-100">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase text-center">Processus simple</div>
          <h2 className="mb-12 text-center text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Votre livraison express en 3 étapes.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Demande immédiate", desc: "Un simple appel ou un formulaire en ligne suffit pour obtenir un devis immédiat pour n'importe quelle ville du 92, 93 ou 94." },
              { num: "02", title: "Prise en charge < 45 min", desc: "Peu importe votre emplacement en petite couronne, notre maillage garantit l'arrivée d'un coursier en moins de 45 minutes." },
              { num: "03", title: "Livraison & Suivi", desc: "Chaque course est tracée en temps réel. Une preuve de livraison électronique vous est envoyée dès la remise." }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-line shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-[16px] font-bold text-white shadow-md">
                  {step.num}
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-ink">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prestations ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations</div>
        <h2 className="mb-10 text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Toutes les missions en petite couronne.
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
              Vos questions sur la livraison en banlieue parisienne
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { q: "Couvrez-vous vraiment toute la petite couronne ?", a: "Oui, notre flotte est répartie de manière optimale pour couvrir l'intégralité des Hauts-de-Seine (92), de la Seine-Saint-Denis (93) et du Val-de-Marne (94)." },
              { q: "Le tarif est-il plus élevé pour la banlieue ?", a: "Nos tarifs sont basés sur des grilles kilométriques transparentes. Les liaisons Paris ↔ Banlieue ou Banlieue ↔ Banlieue sont très compétitives grâce à notre maillage local." },
              { q: "Pouvez-vous transporter des colis lourds ou volumineux ?", a: "Bien sûr. En plus de nos motos pour l'extrême urgence, nous disposons d'une flotte de fourgons et camions de 20m³ pour répondre aux besoins industriels ou logistiques." }
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-5 hover:border-accent/30 transition-colors">
                <h3 className="mb-2 text-[15.5px] font-bold text-ink">{faq.q}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Autres zones ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <div className="border-t border-line pt-12">
          <div className="mb-6 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Autres zones</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/zones/paris" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Paris intramuros (75)
            </Link>
            <Link href="/zones/la-defense" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              La Défense & Hauts-de-Seine (92)
            </Link>
            <Link href="/flotte" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Grande couronne (77, 78, 91, 95) →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course en petite couronne maintenant ?
              </h2>
              <p className="text-[15px] text-white/60">Dispatch en moins de 2 minutes, 7j/7 de 7h à 23h.</p>
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
