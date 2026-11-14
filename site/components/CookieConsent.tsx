"use client";

import { useState, useEffect } from "react";


export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

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

  if (!visible) return null;

  return (
    // Téléphone : bandeau fin posé au-dessus de la barre « Appeler / Commander », à gauche de la bulle de chat.
    <div className="fixed bottom-[84px] left-3 right-[84px] z-[9999] md:bottom-4 md:left-auto md:right-24 md:max-w-sm" role="region" aria-label="Choix des cookies">
      <div className="flex flex-col gap-2 rounded-[4px] border border-line bg-paper-card p-3 shadow-lg md:gap-3 md:p-4">
        <p className="text-[13px] leading-snug text-muted">
          Cookies de mesure d&apos;audience.{" "}
          <a href="/politique-de-confidentialite" className="font-semibold text-accent-dark underline underline-offset-2">
            En savoir plus
          </a>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleRefuse}
            className="flex-1 rounded-[2px] border border-line px-3 py-2 text-[13px] font-semibold text-muted transition hover:border-ink hover:text-ink"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-[2px] bg-ink px-3 py-2 text-[13px] font-bold text-white transition hover:bg-ink/90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
