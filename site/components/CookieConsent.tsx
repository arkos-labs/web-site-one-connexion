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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-line bg-white px-4 py-4 shadow-2xl sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-label">
          Ce site utilise des cookies pour mesurer l&apos;audience et améliorer votre expérience.{" "}
          <a href="/mentions-legales" className="text-accent underline">En savoir plus</a>
        </p>
        <div className="flex shrink-0 gap-2">
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
