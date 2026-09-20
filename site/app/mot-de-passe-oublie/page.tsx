import ForgotPasswordForm from "@/components/sections/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre espace client ONE CONNEXION.",
  robots: { index: false, follow: false },
};

export default function MotDePasseOubliePage() {
  return (
    <main>
      <ForgotPasswordForm />
    </main>
  );
}
