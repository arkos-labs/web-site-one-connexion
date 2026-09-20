import AuthForm from "@/components/sections/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace client ONE CONNEXION.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <main>
      <AuthForm />
    </main>
  );
}
