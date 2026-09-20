import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — ONE CONNEXION",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">
        Erreur 404
      </p>
      <h1 className="mt-2 text-4xl font-black text-ink sm:text-5xl">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-md text-label">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-ink/90"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
