import type { Metadata } from "next";
import PageSchema from "@/components/PageSchema";

export const metadata: Metadata = {
  title: { absolute: "Contacter ONE CONNEXION : coursier express en Île-de-France" },
  description:
    "Un envoi à organiser ? Contactez notre équipe coursier : réponse rapide, devis immédiat, prise en charge en moins de 45 minutes en Île-de-France.",
  alternates: { canonical: "/contact" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    url: "/contact",
    siteName: "ONE CONNEXION",
    locale: "fr_FR",
    title: "Contact - ONE CONNEXION",
    description:
      "Contactez-nous pour vos livraisons urgentes à Paris et en Île-de-France.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageSchema path="/contact" name="Contact" pageType="ContactPage">
      {children}
    </PageSchema>
  );
}
