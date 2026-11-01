import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import OrderForm from "@/components/sections/OrderForm";
import Contact from "@/components/sections/Contact";
import Faq from "@/components/sections/Faq";
import JsonLd from "@/components/JsonLd";
import Services from "@/components/sections/Services";
import TrustStrip from "@/components/sections/TrustStrip";
import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL, PHONE_TEL, EMAIL, SITE_URL, MAPS_URL } from "@/lib/site-content";
import { getZonesByCategory } from "@/lib/zones/data";

/* Accueil. Requête visée : « coursier Île-de-France ». Plan : quatre H2, dans l'ordre
   Services → Zones → Course dédiée (About) → Devis (Contact). */
const TITLE = "Coursier Île-de-France : courses dédiées pour entreprises";
const DESCRIPTION =
  "Coursier en Île-de-France pour vos envois professionnels : une course dédiée par envoi, un interlocuteur unique et un suivi complet de la course.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: "ONE CONNEXION",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og-image.jpg"] },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  "@id": `${SITE_URL}/#organization`,
  name: LEGAL.denomination,
  legalName: LEGAL.denomination,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-google.png`,
  image: `${SITE_URL}/og-image.jpg`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: PHONE_TEL,
    email: EMAIL,
    areaServed: "FR-IDF",
    availableLanguage: "fr",
  },
  telephone: PHONE_TEL,
  email: EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "5 Square Nungesser",
    addressLocality: "Saint-Mandé",
    postalCode: "94160",
    addressRegion: "Île-de-France",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.8386,
    longitude: 2.4181,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Île-de-France",
  },
  hasMap: MAPS_URL,
  sameAs: [
    "https://www.wikidata.org/wiki/Q141752000",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  priceRange: "€€",
  vatID: LEGAL.tva,
  taxID: LEGAL.siren,
  identifier: {
    "@type": "PropertyValue",
    name: "SIRET",
    value: LEGAL.siret,
  },
  foundingDate: LEGAL.dateCreationISO,
  description:
    "Coursier B2B spécialisé à Paris et en Île-de-France : plis confidentiels, transport médical, livraison e-commerce et tournées régulières. Flotte deux-roues, traçabilité complète, 100% Marchandise assurée.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "ONE CONNEXION",
  inLanguage: "fr-FR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <Hero />
      <TrustStrip />
      <Services />
      <OrderForm />
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[88px]">
        <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          <span className="h-px w-6 bg-accent" />
          Zones desservies
        </div>
        <h2 className="mb-4 max-w-[26ch] text-balance text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Les zones couvertes en Île-de-France
        </h2>
        <p className="mb-8 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
          Dans Paris, une course coûte 28 € TTC livrée sous 3 h. Plus pressé&nbsp;? Comptez 42 € pour 1 h 30, ou 56 € pour 1 h.
          Choisissez votre arrondissement pour voir ce qu&apos;on y livre le plus souvent, ou voyez notre page{" "}
          <Link href="/zones/paris" className="text-ink underline underline-offset-2">coursier Paris</Link> et notre{" "}
          <Link href="/tarifs" className="text-ink underline underline-offset-2">tarif coursier Paris</Link>.
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {getZonesByCategory("paris").map((z) => (
            <li key={z.slug}>
              <Link href={`/zones/${z.slug}`} className="block rounded-lg border border-gray-100 bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-accent/30 hover:text-accent-dark">
                {z.name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mb-4 mt-16 max-w-[26ch] text-balance text-[clamp(22px,2.5vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Hors de Paris aussi, on arrive vite.
        </p>
        <p className="mb-10 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
          Nanterre, Saint-Denis, Montreuil, Boulogne, Créteil… En petite couronne, le coursier est chez vous en moins de
          45 minutes, à partir de 39 € TTC. On va aussi plus loin, jusqu&apos;à Versailles, Cergy, Évry ou Meaux, au prix
          calculé selon la distance.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
          <Link href="/zones/petite-couronne" className="text-ink underline underline-offset-2">Petite couronne : 92, 93, 94</Link>
          <Link href="/zones/grande-couronne" className="text-ink underline underline-offset-2">Grande couronne : 77, 78, 91, 95</Link>
          <Link href="/zones" className="text-ink underline underline-offset-2">Voir toutes nos villes</Link>
        </div>
        <div className="mt-6 rounded-xl bg-ink px-6 py-6 text-white sm:px-8">
          <div>
            <p className="text-[19px] font-bold leading-tight">Vous ne voyez pas votre ville ? Pas de souci.</p>
            <p className="mt-2 text-[14px] leading-[1.6] text-white/70">
              On livre partout en Île-de-France, de la Seine-et-Marne aux Yvelines, de l’Essonne au Val-d’Oise.
              Tapez vos deux adresses en haut de la page : vous avez votre prix en quelques secondes, sans créer de compte.
            </p>
          </div>
        </div>
      </section>
      <About />
      <Faq />
      <Contact title="Demander un devis" devisLink />
    </>
  );
}
