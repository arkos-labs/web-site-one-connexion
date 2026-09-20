"use client";
/**
 * components/ClientShell.tsx
 * Wrapper client pour Lenis smooth scroll (nécessite le navigateur,
 * ne peut pas vivre dans un Server Component).
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
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

  return <main>{children}</main>;
}
