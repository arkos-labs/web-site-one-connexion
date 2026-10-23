import { Metadata } from "next";
import FollowOrder from "@/components/sections/FollowOrder";

export const metadata: Metadata = {
  title: "Suivre ma commande",
  description: "Suivez votre course ONE CONNEXION depuis votre espace client.",
  robots: { index: false, follow: false },
};

// Bouton « Suivre ma commande » de l'e-mail de confirmation : /suivre/OC-XXXXXXXX?t=<jeton>.
export default async function SuivrePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await params;
  const { t } = await searchParams;
  return (
    <main>
      <FollowOrder trackingCode={decodeURIComponent(code).toUpperCase()} token={typeof t === "string" ? t : ""} />
    </main>
  );
}
