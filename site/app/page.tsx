import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import OrderForm from "@/components/sections/OrderForm";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/JsonLd";
import { LEGAL, PHONE_TEL, EMAIL, SITE_URL } from "@/lib/site-content";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "MovingCompany"],
  "@id": `${SITE_URL}/#organization`,
  name: LEGAL.denomination,
  legalName: LEGAL.denomination,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
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
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Île-de-France",
  },
  openingHours: "Mo-Su 07:00-23:00",
  priceRange: "€€",
  vatID: LEGAL.tva,
  taxID: LEGAL.siren,
  foundingDate: LEGAL.dateCreation,
  description:
    "Coursier B2B spécialisé à Paris et en Île-de-France : plis confidentiels, transport médical, livraison e-commerce et tournées régulières. Flotte deux-roues, traçabilité complète, interlocuteur unique.",
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <Hero />
      <About />
      <OrderForm />
      <Contact />
    </>
  );
}
