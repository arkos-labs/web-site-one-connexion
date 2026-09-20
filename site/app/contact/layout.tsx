import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — ONE CONNEXION | Coursier Paris & Île-de-France",
  description:
    "Contactez One Connexion pour vos livraisons urgentes à Paris et en Île-de-France. Devis gratuit, réponse rapide. Téléphone, email ou formulaire.",
  openGraph: {
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
  return children;
}
