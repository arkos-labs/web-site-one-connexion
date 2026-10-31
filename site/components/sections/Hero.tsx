/**
 * components/sections/Hero.tsx
 * Section d'ouverture sombre : promesse, engagements de service chiffrés,
 * bandeau logos clients (placeholders en attente des vrais logos).
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Flag, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { useRoutePrice } from "@/lib/use-route-price";
import { trackEvent } from "@/lib/track-event";
import { formatEur } from "@/lib/price-display";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

const AddressAutocomplete = dynamic(
  () => import("@/components/AddressAutocomplete").then((mod) => ({ default: mod.AddressAutocomplete })),
  { ssr: false, loading: () => <input placeholder="Adresse..." className="w-full bg-white rounded-xl px-4 py-3 text-[14px] text-gray-900" /> }
);

const COMMITMENTS = [
  { tag: "Enlèvement express", value: "< 45", unit: "min", title: "Enlèvement du colis", desc: "Après confirmation de la course, un coursier part immédiatement." },
  { tag: "Service exclusif", value: "Dédiée", unit: "", title: "Course sans regroupement", desc: "Un coursier pour votre course, sans regroupement ni détour." },
  { tag: "Disponibilité", value: "6j/7", unit: "", title: "Du lundi au samedi, 9h–19h", desc: "Du lundi au samedi, de 9h à 19h." },
  { tag: "Livraison rapide", value: "1", unit: "h", title: "Livraison en formule Super", desc: "Livraison porte à porte en 1 h dans Paris." },
];


const openOrder = (detail?: { pickup: string; dropoff: string }) =>
  window.dispatchEvent(new CustomEvent("open-order-modal", detail ? { detail } : undefined));

export default function Hero() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  // Première saisie de chaque adresse dans la barre du haut (une fois par visiteur) : cf. lib/track-event.
  const addressTracked = useRef({ pickup: false, dropoff: false });
  useEffect(() => {
    if (pickup.trim() && !addressTracked.current.pickup) {
      addressTracked.current.pickup = true;
      trackEvent("order_address_pickup");
    }
  }, [pickup]);
  useEffect(() => {
    if (dropoff.trim() && !addressTracked.current.dropoff) {
      addressTracked.current.dropoff = true;
      trackEvent("order_address_dropoff");
    }
  }, [dropoff]);

  // Prix tout de suite, avant tout formulaire : le visiteur sait combien ça coûte. Formule la moins chère, avec la même grille que le formulaire de commande ; les autres délais s'y affichent.
  // Petite couronne : prix au km, calculé avec la distance par la route.
  const price = useRoutePrice(pickup, dropoff, "standard");

  return (
    <section id="top" className="relative border-b border-white/10 bg-ink text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        fetchPriority="high"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-[center_60%] z-0"
      >
        <source src="/videos/hero-video-opt.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ink/40 z-10 pointer-events-none"></div>
      <div className="relative z-30 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        <div className="pt-8">
          <div className="min-w-0">
            <h1 className="mb-3 text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
              Coursier B2B à Paris et en Île-de-France
            </h1>
            <p className="mb-4 border-l-2 border-accent pl-3 text-[clamp(18px,2.2vw,24px)] font-semibold text-white">
              Le dernier kilomètre, tenu à l&rsquo;heure.
            </p>
            <p className="mb-6 max-w-[56ch] text-pretty text-[16px] leading-[1.6] text-white/66">
              Plis, dossiers, colis&nbsp;: un coursier moto
              les enlève en moins de 45&nbsp;minutes
              et les livre sans détour, partout en Île-de-France. Prix affiché avant de commander,
              suivi de chaque étape en ligne.
            </p>
            
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openOrder()}
                className="rounded-[2px] bg-accent px-[22px] py-[12px] text-[14px] font-semibold text-white hover:bg-accent-dark"
              >
                Commander une course
              </button>
              <a
                href="/inscription"
                className="rounded-[2px] border border-white/22 px-[22px] py-[12px] text-[14px] font-semibold text-white hover:border-white"
              >
                Ouvrir un compte entreprise
              </a>
            </div>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-white/80 hover:text-white"
            >
              <Phone size={15} className="shrink-0 text-accent" />
              <span>
                Une course urgente ? <span className="whitespace-nowrap font-mono text-white">{PHONE_DISPLAY}</span>
              </span>
            </a>
          </div>
        </div>
        
        {/* Barre de commande rapide pleine largeur */}
        <div className="mb-6 mt-2 bg-[#11111E]/90 backdrop-blur-md p-3 rounded-2xl flex flex-col md:flex-row gap-3 border border-white/10 shadow-2xl relative z-10">
          <div className="relative flex-1 z-20">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <MapPin className="h-5 w-5 text-[#E60000]" />
            </div>
            <AddressAutocomplete 
              value={pickup}
              onChange={setPickup}
              placeholder="59 Rivoli, Rue de Rivoli, Paris" 
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E60000]" 
            />
          </div>
          <div className="relative flex-1 z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Flag className="h-5 w-5 text-[#E60000]" />
            </div>
            <AddressAutocomplete 
              value={dropoff}
              onChange={setDropoff}
              placeholder="51 Avenue d'Iéna, Paris" 
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E60000]" 
            />
          </div>
          <button
            type="button"
            onClick={() => openOrder({ pickup, dropoff })}
            className="flex items-center justify-center bg-accent text-white rounded-xl px-8 py-3 text-[14px] font-bold hover:bg-accent-dark transition-colors whitespace-nowrap shadow-lg shadow-accent/20"
          >
            JE COMMANDE MA COURSE
          </button>
        </div>
        <p aria-live="polite" className="mb-6 -mt-3 px-1 text-[14px] text-white/80">
          {price != null ? (
            <>
              Votre course : <strong className="text-[16px] font-bold text-white">dès {formatEur(price)} € TTC</strong>
            </>
          ) : (
            <>Entrez vos deux adresses : le prix s&rsquo;affiche tout de suite, sans inscription.</>
          )}
        </p>
      </div>


      {/* Engagements de service : bandeau blanc défilant, comme sur la page Références */}
      <div className="relative z-20 overflow-hidden border-b border-gray-100 bg-white py-8 text-ink">
        <style>{`
          @keyframes hero-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .hero-marquee { display: flex; width: max-content; animation: hero-marquee 24s linear infinite; }
          @media (max-width: 768px) { .hero-marquee { animation-duration: 16s; } }
          @media (prefers-reduced-motion: reduce) { .hero-marquee { animation: none; } }
        `}</style>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent md:w-32" />
        <div className="hero-marquee hover:[animation-play-state:paused]">
          {[...COMMITMENTS, ...COMMITMENTS, ...COMMITMENTS, ...COMMITMENTS].map((c, i) => (
            <div key={i} aria-hidden={i >= COMMITMENTS.length} className="flex shrink-0 flex-col items-center justify-center px-10 text-center md:px-20">
              <span className="text-[clamp(24px,3vw,36px)] font-bold text-ink">
                {c.value}
                {c.unit && <span className="ml-1 text-[0.55em] font-bold text-muted">{c.unit}</span>}
              </span>
              <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted md:text-[12px]">{c.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
