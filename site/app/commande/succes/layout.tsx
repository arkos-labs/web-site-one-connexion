import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commande confirmée",
  description: "Confirmation de votre commande ONE CONNEXION.",
  robots: { index: false, follow: false },
};

export default function CommandeSuccesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
