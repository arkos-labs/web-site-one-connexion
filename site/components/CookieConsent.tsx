"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Pages légales : lisibles avant de choisir (le bandeau y renvoie).
const LEGAL_PATHS = ["/politique-de-confidentialite", "/mentions-legales", "/cgv"];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const consent = localStorage.getItem("oc_cookie_consent");
      if (!consent) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem("oc_cookie_consent", "all"); } catch {}
    window.dispatchEvent(new Event("oc_consent_update"));
    setVisible(false);
  };

  const handleRefuse = () => {
    try { localStorage.setItem("oc_cookie_consent", "essential"); } catch {}
    window.dispatchEvent(new Event("oc_consent_update"));
    setVisible(false);
  };

  // Tant que le choix n'est pas fait, le site est inaccessible (hors pages légales)
  const blocking = visible && !LEGAL_PATHS.includes(pathname);

  useEffect(() => {
    if (!blocking) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [blocking]);

  if (!blocking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Choix des cookies">
      <div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-sm text-label">
          Ce site utilise des cookies pour mesurer l&apos;audience et améliorer votre expérience.{" "}
          <a href="/politique-de-confidentialite" className="text-accent underline">En savoir plus</a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleRefuse}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-label transition hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-ink/90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
