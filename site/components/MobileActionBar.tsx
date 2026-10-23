"use client";
/**
 * components/MobileActionBar.tsx
 * Sur mobile, barre fixe en bas de l'écran sur les pages publiques : « Appeler » et « Commander ».
 * Le visiteur peut joindre un dispatcheur ou lancer une course à tout moment, sans remonter la page.
 */
import { usePathname } from "next/navigation";
import { Phone, Zap } from "lucide-react";
import { PHONE_TEL } from "@/lib/site-content";

// Espace client, admin et parcours de commande : pas de barre.
const HIDDEN = /^\/(admin|dashboard|telegram|commande|suivre|connexion|inscription|mot-de-passe-oublie|reinitialiser-mot-de-passe)(\/|$)/;

export default function MobileActionBar() {
  const pathname = usePathname();
  if (HIDDEN.test(pathname)) return null;

  return (
    <>
      {/* Réserve la place de la barre pour ne pas cacher le bas du pied de page. */}
      <div aria-hidden className="h-[76px] md:hidden" />
      <nav
        aria-label="Actions rapides"
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-ink/95 px-3 pt-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <a
          href={`tel:${PHONE_TEL}`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 text-[15px] font-bold text-white active:bg-white/10"
        >
          <Phone size={18} className="text-accent" />
          Appeler
        </a>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal"))}
          className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-bold text-white active:bg-accent-dark"
        >
          <Zap size={18} />
          Commander
        </button>
      </nav>
    </>
  );
}
