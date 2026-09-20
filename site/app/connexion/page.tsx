import AuthForm from "@/components/sections/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | ONE CONNEXION",
  description: "Connectez-vous à votre espace client ONE CONNEXION.",
};

export default function ConnexionPage() {
  return (
    <main>
      <AuthForm />
    </main>
  );
}
