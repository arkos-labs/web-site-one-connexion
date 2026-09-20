import RegisterForm from "@/components/sections/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte client ONE CONNEXION pour gérer vos livraisons.",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}
