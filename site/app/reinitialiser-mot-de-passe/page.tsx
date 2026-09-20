import ResetPasswordForm from "@/components/sections/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre espace client ONE CONNEXION.",
  robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePassePage() {
  return (
    <main>
      <ResetPasswordForm />
    </main>
  );
}
