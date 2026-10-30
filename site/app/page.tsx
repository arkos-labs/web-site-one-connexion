import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import OrderForm from "@/components/sections/OrderForm";
import Contact from "@/components/sections/Contact";
import Faq from "@/components/sections/Faq";
import JsonLd from "@/components/JsonLd";
import Services from "@/components/sections/Services";
import TrustStrip from "@/components/sections/TrustStrip";
import Link from "next/link";
import { LEGAL, PHONE_TEL, EMAIL, SITE_URL, MAPS_URL } from "@/lib/site-content";

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
      <About />
      <Services />
      <OrderForm />
      <Faq />
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[88px]">
        <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          <span className="h-px w-6 bg-accent" />
          Villes desservies
        </div>
        <h2 className="mb-4 max-w-[26ch] text-balance text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Livraison dans toute la petite couronne.
        </h2>
        <p className="mb-10 max-w-[62ch] text-[15px] leading-[1.6] text-muted">
          En plus des 20 arrondissements de <Link href="/zones/paris" className="text-ink underline underline-offset-2">Paris</Link>,
          chaque ville a sa page avec ses délais et ses particularités. La{" "}
          <Link href="/zones/grande-couronne" className="text-ink underline underline-offset-2">grande couronne</Link> est aussi desservie.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
          <Link href="/zones/petite-couronne" className="text-ink underline underline-offset-2">Petite couronne (92, 93, 94)</Link>
          <Link href="/zones/grande-couronne" className="text-ink underline underline-offset-2">Grande couronne (77, 78, 91, 95)</Link>
          <Link href="/zones" className="text-ink underline underline-offset-2">Toutes les villes desservies</Link>
        </div>
        <div className="mt-6 rounded-xl bg-ink px-6 py-6 text-white sm:px-8">
          <div>
            <p className="text-[19px] font-bold leading-tight">Votre ville n’est pas dans la liste ? On y livre aussi.</p>
            <p className="mt-2 text-[14px] leading-[1.6] text-white/70">
              Toute l’Île-de-France est desservie : Seine-et-Marne (77), Yvelines (78), Essonne (91) et Val-d’Oise (95).
              Entrez vos adresses en haut de la page : votre prix s’affiche en quelques secondes.
            </p>
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}
