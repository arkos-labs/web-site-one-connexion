import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import OrderForm from "@/components/sections/OrderForm";
import Contact from "@/components/sections/Contact";
import Faq from "@/components/sections/Faq";
import JsonLd from "@/components/JsonLd";
import { LEGAL, PHONE_TEL, EMAIL, SITE_URL, MAPS_URL } from "@/lib/site-content";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  "@id": `${SITE_URL}/#organization`,
  name: LEGAL.denomination,
  legalName: LEGAL.denomination,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
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
      <About />
      <OrderForm />
      <Faq />
      <Contact />
    </>
  );
}
