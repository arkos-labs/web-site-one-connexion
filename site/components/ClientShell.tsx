"use client";
/**
 * components/ClientShell.tsx
 * Wrapper client pour Lenis smooth scroll (nécessite le navigateur,
 * ne peut pas vivre dans un Server Component).
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Appareil de l'équipe (cookie posé à l'ouverture de l'admin) : exclu des mesures d'audience. */
const isTeamDevice = () => document.cookie.split("; ").includes("oc_interne=1");

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Disable Lenis on touch devices (mobile) to improve INP/TBT
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis pilote le défilement : la restauration de position de Next ne
  // s'applique pas. Sans cette remise à zéro, un changement de route laisse
  // le visiteur au milieu de la page suivante. Les ancres (/#flotte) sont
  // exclues : elles doivent conserver leur cible.
  useEffect(() => {
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  // Compteur de visites du site public (sans cookie) pour le tableau de bord Telegram.
  useEffect(() => {
    if (/^\/(admin|dashboard|telegram)(\/|$)/.test(pathname) || isTeamDevice()) return;
    fetch("/api/visit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  // Temps passé sur la page, onglet visible seulement, envoyé à la sortie de page (sans identifiant).
  useEffect(() => {
    if (/^\/(admin|dashboard|telegram)(\/|$)/.test(pathname) || isTeamDevice()) return;
    let activeMs = 0;
    let activeSince: number | null = document.visibilityState === "visible" ? performance.now() : null;
    const pause = () => {
      if (activeSince !== null) {
        activeMs += performance.now() - activeSince;
        activeSince = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") activeSince ??= performance.now();
      else pause();
    };
    const send = () => {
      pause();
      const seconds = Math.round(activeMs / 1000);
      activeMs = 0;
      if (document.visibilityState === "visible") activeSince = performance.now();
      if (seconds < 1) return;
      navigator.sendBeacon("/api/time", new Blob([JSON.stringify({ path: pathname, seconds })], { type: "application/json" }));
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", send);
    return () => {
      send();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", send);
    };
  }, [pathname]);

  return <main>{children}</main>;
}
