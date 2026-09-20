/**
 * components/sections/Hero.tsx
 * Section d'ouverture sombre : promesse, engagements de service chiffrés,
 * bandeau logos clients (placeholders en attente des vrais logos).
 */
"use client";

import { useState } from "react";
import { FOUNDED_YEAR } from "@/lib/site-content";
import { MapPin, Flag } from "lucide-react";

const COMMITMENTS = [
  { label: "Prise en charge", value: "< 45 min", sub: "dès validation commande", fill: 70 },
  { label: "Ponctualité", value: "99,4 %", sub: "sur 12 mois glissants", fill: 99 },
  { label: "Amplitude", value: "7j/7", sub: "7h – 23h, jours fériés inclus", fill: null },
  { label: "Devis entreprise", value: "< 2 h", sub: "réponse garantie", fill: 85 },
];

// PLACEHOLDER : logos clients à déposer avant mise en ligne.
const CLIENT_LOGO_SLOTS = 5;

export default function Hero() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const orderUrl = `/?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}#commander`;

  return (
    <section id="top" className="relative border-b border-white/10 bg-ink text-white overflow-hidden">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover object-[center_60%] z-0"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ink/40 z-10 pointer-events-none"></div>
      <div className="relative z-20 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        <div className="grid items-end gap-8 pt-8 sm:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            <div className="mb-4 inline-block rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-accent uppercase border border-white/10 shadow-lg">
              Transport urgent · Depuis {FOUNDED_YEAR}
            </div>
            <h1 className="mb-4 text-balance text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
              Le dernier kilomètre, tenu à l&rsquo;heure depuis {FOUNDED_YEAR}.
            </h1>
            <p className="mb-6 max-w-[56ch] text-pretty text-[16px] leading-[1.6] text-white/66">
              One Connexion opère les livraisons urgentes des cabinets juridiques,
              laboratoires et e-commerçants d&rsquo;Île-de-France. Une flotte deux-roues,
              une traçabilité complète, un interlocuteur unique.
            </p>
            
            <div className="mb-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-[2px] bg-accent px-[22px] py-[12px] text-[14px] font-semibold text-white hover:bg-accent-dark"
              >
                Ouvrir un compte entreprise
              </a>
              <a
                href="/services"
                className="rounded-[2px] border border-white/22 px-[22px] py-[12px] text-[14px] font-semibold text-white hover:border-white"
              >
                Voir les prestations
              </a>
            </div>
          </div>

          <div className="min-w-0 pb-8">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-5 bg-accent flex-shrink-0" />
              <span className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
                Engagements de service
              </span>
            </div>
            {/* Stats grid 2×2 */}
            <div className="grid grid-cols-2 gap-[1px] bg-white/8 border border-white/10 overflow-hidden">
              {COMMITMENTS.map((item) => (
                <div
                  key={item.label}
                  className="relative flex flex-col justify-between bg-white/[0.035] px-[18px] py-[16px] gap-3 group hover:bg-white/[0.06] transition-colors"
                >
                  {/* Valeur principale */}
                  <div className="font-mono text-[26px] font-bold leading-none tracking-[-0.03em] tabular-nums text-white">
                    {item.value}
                  </div>
                  {/* Label + sous-texte */}
                  <div>
                    <div className="text-[11px] font-semibold text-white/70 leading-tight mb-[3px]">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-white/32 leading-tight">
                      {item.sub}
                    </div>
                  </div>
                  {/* Barre de fill pour les métriques quantifiables */}
                  {item.fill !== null && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8">
                      <div
                        className="h-full bg-accent/60"
                        style={{ width: `${item.fill}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Barre de commande rapide pleine largeur */}
        <div className="mb-6 mt-2 bg-[#11111E]/90 backdrop-blur-md p-3 rounded-2xl flex flex-col md:flex-row gap-3 border border-white/10 shadow-2xl relative z-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-[#E60000]" />
            </div>
            <input 
              type="text" 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="59 Rivoli, Rue de Rivoli, Paris" 
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E60000]" 
            />
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flag className="h-5 w-5 text-[#E60000]" />
            </div>
            <input 
              type="text" 
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="51 Avenue d'Iéna, Paris" 
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E60000]" 
            />
          </div>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-order-modal", { detail: { pickup, dropoff } }));
            }}
            className="flex items-center justify-center bg-accent text-white rounded-xl px-8 py-3 text-[14px] font-bold hover:bg-accent-dark transition-colors whitespace-nowrap shadow-lg shadow-accent/20"
          >
            JE COMMANDE MA COURSE
          </button>
        </div>
      </div>


    </section>
  );
}
