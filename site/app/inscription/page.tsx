import RegisterForm from "@/components/sections/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | ONE CONNEXION",
  description: "Créez votre compte client ONE CONNEXION pour gérer vos livraisons.",
};

export default function InscriptionPage() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}
