"use client";
/**
 * components/sections/OrderCta.tsx
 * Bloc « Commander une course » de l'accueil. Il remplace le formulaire affiché en pleine page :
 * le même formulaire s'ouvre en fenêtre (OrderModalProvider). Garde l'ancre #commander, visée par
 * les boutons des autres pages : arriver sur /#commander ouvre la fenêtre directement.
 */
import { useEffect } from "react";
import Image from "next/image";

const STEPS = [
  { n: "1", title: "Vos deux adresses", desc: "Le prix s'affiche tout de suite." },
  { n: "2", title: "Votre envoi et le délai", desc: "Pli, colis ou volumineux, en 1 h, 3 h ou dans la journée." },
  { n: "3", title: "Le règlement", desc: "Par carte, ou sur facture à 30 jours pour les entreprises." },
];

const openOrder = () => window.dispatchEvent(new CustomEvent("open-order-modal"));

export default function OrderCta() {
  useEffect(() => {
    const openIfTargeted = () => {
      if (window.location.hash === "#commander") openOrder();
    };
    // Laisse à la fenêtre de commande le temps de s'abonner à l'événement.
    const timer = window.setTimeout(openIfTargeted, 300);
    window.addEventListener("hashchange", openIfTargeted);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", openIfTargeted);
    };
  }, []);

  return (
    <section id="commander" className="scroll-mt-24 border-y border-line bg-ink text-white">
      <div className="mx-auto grid max-w-[1240px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="px-[clamp(20px,4vw,28px)] py-[56px] md:py-[72px] lg:pr-16">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Commande en ligne</div>
          {/* Pas de H2 : le plan de l'accueil compte exactement quatre H2. */}
          <p className="text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Commander une course.
          </p>
          <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.6] text-white/75">
            Trois étapes, sans créer de compte. Un dispatcheur confirme l&rsquo;enlèvement dans la foulée.
          </p>
          <ol className="mt-8 grid gap-5">
            {STEPS.map((s) => (
              <li key={s.n} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-white/25 font-mono text-[13px] font-semibold">
                  {s.n}
                </span>
                <div>
                  <p className="text-[16px] font-bold">{s.title}</p>
                  <p className="text-[14.5px] leading-[1.5] text-white/70">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={openOrder}
            className="mt-9 rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Commander une course
          </button>
        </div>
        <div className="relative hidden min-h-[420px] lg:block">
          <Image
            src="/images/hero/coursier-express-paris.jpg"
            alt="Coursier à moto traversant un carrefour parisien, un coffre de transport à l'arrière."
            fill
            sizes="(min-width: 1024px) 45vw, 0px"
            className="object-cover object-[center_60%]"
          />
        </div>
      </div>
    </section>
  );
}
