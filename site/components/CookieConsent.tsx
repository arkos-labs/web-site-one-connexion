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
    <div className="fixed inset-x-3 bottom-3 z-[9999] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm" role="region" aria-label="Choix des cookies">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-xl">
        <p className="text-[13px] leading-snug text-label">
          Nous utilisons des cookies pour mesurer l&apos;audience.{" "}
          <a href="/politique-de-confidentialite" className="text-accent underline">En savoir plus</a>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleRefuse}
            className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-label transition hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-ink px-3 py-2 text-[13px] font-bold text-white transition hover:bg-ink/90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
