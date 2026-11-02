/**
 * app/zones/petite-couronne/page.tsx
 * Page locale petite couronne (92/93/94). Requête visée : « coursier banlieue Paris ».
 * Le guide /guides/coursier-paris-banlieue explique la méthode ; les prix vivent sur /tarifs.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import TrustBlock from "@/components/TrustBlock";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";
import { SERVICES } from "@/lib/services";
import { getZone, getIndexedZonesByDept } from "@/lib/zones/data";
import { gridPrice, pcKmPrice, PC_INCLUDED_KM } from "@/lib/pricing";

const slugOf = (v: string) =>
  v.replace(" (limite)", "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
import { MapPin } from "lucide-react";

const TITLE = "Coursier banlieue Paris : courses en petite couronne";
const DESCRIPTION =
  "Coursier en banlieue parisienne : courses dédiées vers et depuis la petite couronne, pour les entreprises qui ont besoin d'un envoi suivi.";
const H2 = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]";
const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/zones/petite-couronne" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
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

// 31,5 → « 31,50 € », 42 → « 42 € »
const euro = (n: number) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;

const PRIX = {
  normal: euro(gridPrice("standard", 1)),
  urgent: euro(gridPrice("urgent", 1)),
  super: euro(gridPrice("flash", 1)),
  km: euro(pcKmPrice("standard")),
};

const FAQ = [
  {
    q: "Quels sont les délais pour une course en banlieue ?",
    a: "Un coursier prend le colis en charge en moins de 45 minutes après la confirmation de la course, puis le livre directement, sans détour ni regroupement. Le délai de livraison dépend de la formule : Normal 3 h, Urgent 1 h 30, Super 1 h.",
  },
  {
    q: "Quel est le tarif d'une course en banlieue parisienne ?",
    a: `En petite couronne, une course démarre à ${PRIX.normal} TTC en Normal, ${PRIX.urgent} TTC en Urgent et ${PRIX.super} TTC en Super, kilomètres compris jusqu'à ${PC_INCLUDED_KM} km de route, puis ${PRIX.km} TTC par km en plus en Normal. Le prix exact s'affiche avant de commander.`,
  },
  {
    q: "Quels sont vos horaires en petite couronne ?",
    a: "Nous prenons en charge vos courses 7j/7, de 8h à 19h, dans les trois départements (92, 93 et 94).",
  },
  {
    q: "Pouvez-vous transporter un pli confidentiel en banlieue ?",
    a: "Oui. Un pli confidentiel part en course dédiée, sans regroupement, et est remis en main propre au destinataire, dont le nom et l'heure de remise sont enregistrés. Il se facture au tarif de la zone, comme toute course.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const COMMUNES = Array.from(
  new Set([...DEPTS.flatMap((d) => d.villes.map((v) => v.replace(" (limite)", ""))), "Villejuif"]),
);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Coursier en banlieue parisienne (petite couronne)",
  serviceType: "Coursier express B2B",
  url: `${SITE_URL}/zones/petite-couronne`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: COMMUNES.map((name) => ({ "@type": "City", name })),
};

export default function ZonePetiteCouronne() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

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
            Coursier banlieue Paris : la petite couronne couverte
          </h1>
          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            One Connexion dessert les trois départements de petite couronne -
            Hauts-de-Seine (92), Seine-Saint-Denis (93) et Val-de-Marne (94) -
            avec le même coordination et une course dédiée pour chaque envoi.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/#commander" className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark">
              Commander une course
            </a>
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
        <h2 className={`mb-12 ${H2}`}>Coursier banlieue Paris : les communes couvertes (92, 93, 94)</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {DEPTS.map((d) => (
            <div key={d.dept} className={`rounded-2xl border p-6 ${d.color}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.dotColor} text-[13px] font-bold text-white`}>
                  {d.dept}
                </div>
                <div>
                  <div className="font-bold text-ink">{d.name}</div>
                  <div className="text-[12px] text-muted">Course dédiée · suivi en ligne</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {d.villes.map((v) => {
                  const slug = v.replace(" (limite)", "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
                  // Lien uniquement si la ville a une page dédiée (sinon 404).
                  return slug === "la-defense" || getZone(slug) ? (
                    <Link key={v} href={`/zones/${slug}`} className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink">
                      <MapPin size={10} className="shrink-0 text-accent" />
                      {v}
                    </Link>
                  ) : (
                    <span key={v} className="flex items-center gap-1.5 text-[12.5px] text-muted">
                      <MapPin size={10} className="shrink-0 text-accent" />
                      {v}
                    </span>
                  );
                })}
                {/* Autres communes du département qui ont leur page dédiée */}
                {getIndexedZonesByDept(d.dept)
                  .filter((z) => !d.villes.some((v) => slugOf(v) === z.slug))
                  .map((z) => (
                    <Link key={z.slug} href={`/zones/${z.slug}`} className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink">
                      <MapPin size={10} className="shrink-0 text-accent" />
                      {z.name}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-muted">
          Toutes les villes de petite couronne non listées sont couvertes. Contactez notre coordination pour confirmer l'adresse.
        </p>
      </section>

      {/* ── Délais et tarifs ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Délais et prix</div>
        <h2 className={`mb-8 max-w-[28ch] ${H2}`}>Délais et tarifs depuis et vers la banlieue</h2>
        <div className="grid max-w-[72ch] gap-5 text-[15.5px] leading-[1.7] text-muted">
          <p>
            Depuis et vers la petite couronne, la prise en charge se fait en moins de 45 minutes, 7j/7 de 8h à
            19h. Le tarif dépend de la zone la plus éloignée entre l&apos;enlèvement et la livraison, et du délai
            choisi : en banlieue, une course démarre à {PRIX.normal} TTC en Normal (3 h), {PRIX.urgent} TTC en
            Urgent (1 h 30) et {PRIX.super} TTC en Super (1 h), kilomètres compris jusqu&apos;à {PC_INCLUDED_KM} km
            de route.
          </p>
          <p>
            Au-delà, chaque kilomètre en plus coûte {PRIX.km} TTC en Normal : un trajet de 15 km par la route
            revient ainsi à {euro(gridPrice("standard", 1) + (15 - PC_INCLUDED_KM) * pcKmPrice("standard"))} TTC.
            Le délai module le prix : l&apos;Urgent coûte 1,5 fois le Normal, le Super 2 fois. La nature de
            l&apos;envoi ne change rien, sans supplément de confidentialité ni de poids jusqu&apos;à 18 kg.
          </p>
          <p>
            Le prix exact s&apos;affiche avant de valider la commande. Retrouvez toute la grille sur la page{" "}
            <Link href="/tarifs" className={LINK}>tarif coursier Paris</Link>, découvrez notre{" "}
            <Link href="/services/coursier-express-paris" className={LINK}>coursier express Paris</Link> pour une
            urgence, ou consultez notre page{" "}
            <Link href="/" className={LINK}>coursier Île-de-France</Link> pour les autres départements.
          </p>
        </div>
      </section>

      {/* ── Pourquoi (sans H2 : hors plan) ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Avantages</div>
          <p className={`mb-8 max-w-[24ch] ${H2}`}>Courses depuis et vers Paris</p>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <p>
              De nombreuses entreprises parisiennes ont des clients, des partenaires ou des sites
              en petite couronne. Confier ces livraisons à un prestataire différent crée une
              rupture dans la traçabilité et les conditions contractuelles. One Connexion couvre
              l'intégralité de ce territoire avec le même coordination, le même niveau de service et
              une facturation centralisée.
            </p>
            <p>
              Notre siège est implanté à Saint-Mandé (94160), ce qui nous place au cœur de la
              petite couronne Est. Cette position géographique nous permet d'intervenir rapidement
              dans le Val-de-Marne et d'accéder à Paris intramuros comme aux autres départements
              de petite couronne en moins de 30 minutes. Dans Paris même, voyez notre page{" "}
              <Link href="/zones/paris" className={LINK}>coursier Paris</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Prestations ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos prestations</div>
        <h2 className={`mb-10 ${H2}`}>Ce que nous transportons en petite couronne</h2>
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

      {/* ── Industries petite couronne (sans H2 : hors plan) ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <p className={`mb-10 ${H2}`}>Industries principales en petite couronne</p>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                industry: "Industrie pharmaceutique & logistique",
                desc: "Créteil, Vitry. Transport de médicaments, emballages stériles, documents de conformité."
              },
              {
                industry: "Services administratifs & RH",
                desc: "La Défense. Livraison de dossiers, avis administratifs, documents confidentiels entre sièges."
              },
              {
                industry: "E-commerce & logistique",
                desc: "Zones d'activité Île-de-France. Enlèvement et distribution de colis, fulfillment express."
              },
              {
                industry: "Cliniques privées & hôpitaux",
                desc: "Créteil, Saint-Maur. Transport de prélèvements, dossiers patients, matériel médical."
              }
            ].map((item) => (
              <div key={item.industry} className="rounded-xl border border-line bg-white p-6">
                <h3 className="mb-3 font-bold text-ink">{item.industry}</h3>
                <p className="text-[14px] leading-[1.6] text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organiser une course ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase text-center">Processus simple</div>
        <h2 className={`mb-12 text-center ${H2}`}>Organiser une course en banlieue parisienne</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { num: "01", title: "Demande immédiate", desc: "Un simple appel ou un formulaire en ligne suffit : le prix s’affiche immédiatement pour n’importe quelle ville du 92, 93 ou 94." },
            { num: "02", title: "Prise en charge < 45 min", desc: "Peu importe votre emplacement en petite couronne, un coursier arrive en moins de 45 minutes." },
            { num: "03", title: "Livraison & Suivi", desc: "L'avancement de chaque course est visible en ligne. Une preuve de remise horodatée est disponible dès la livraison." }
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
        <p className="mx-auto mt-10 max-w-[66ch] text-center text-[15px] leading-[1.7] text-muted">
          Le prix de chaque course suit notre{" "}
          <Link href="/tarifs" className={LINK}>grille tarifaire</Link>. Plus loin
          de Paris, voyez notre page{" "}
          <Link href="/zones/grande-couronne" className={LINK}>coursier grand Paris</Link>.
        </p>
      </section>

      {/* ── FAQ (sans H2 : hors plan) ── */}
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-[800px] px-[clamp(20px,4vw,28px)] py-[72px]">
          <div className="mb-10 text-center">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Foire Aux Questions</div>
            <p className={H2}>Vos questions sur la livraison en banlieue parisienne</p>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ.map((faq, i) => (
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
          <h2 className="mb-6 font-mono text-[11px] font-normal tracking-[0.16em] text-accent-dark uppercase">Zones proches</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/zones/paris" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Paris intramuros (75)
            </Link>
            <Link href="/zones/la-defense" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              La Défense & Hauts-de-Seine (92)
            </Link>
            <Link href="/zones/grande-couronne" className="rounded-lg border border-line bg-paper-card px-4 py-2.5 text-[13.5px] font-medium hover:border-ink">
              Grande couronne (77, 78, 91, 95) →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-[clamp(24px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em]">
                Une course en petite couronne maintenant ?
              </p>
              <p className="text-[15px] text-white/60">Prise en charge en moins de 2 minutes, 7j/7 de 8h à 19h.</p>
            </div>
            <a href={`tel:${PHONE_TEL}`} className="rounded-[4px] bg-accent px-8 py-4 text-center text-[15px] font-bold text-white hover:bg-accent-dark">
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
      <TrustBlock />
    </>
  );
}
