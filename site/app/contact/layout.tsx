import type { Metadata } from "next";
import PageSchema from "@/components/PageSchema";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez One Connexion pour vos livraisons urgentes à Paris et en Île-de-France. Devis gratuit, réponse rapide. Téléphone, email ou formulaire.",
  alternates: { canonical: "/contact" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION — Coursier B2B Paris & Île-de-France" }],
    url: "/contact",
    title: "Contact — ONE CONNEXION",
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
