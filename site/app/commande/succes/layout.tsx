import type { Metadata } from "next";

// Page de confirmation post-paiement : sans valeur de recherche, exclue de l'index.
export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

export default function CommandeSuccesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
