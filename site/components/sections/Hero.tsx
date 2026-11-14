/**
 * components/sections/Hero.tsx
 * Section d'ouverture sombre : promesse, barre d'adresses (prix immédiat),
 * puis les quatre engagements de service chiffrés.
 */
"use client";

import { Phone } from "lucide-react";
import QuickOrderBar from "@/components/QuickOrderBar";
import { ZONES } from "@/lib/pricing";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

const COMMITMENTS = [
  { value: "< 45", unit: "min", title: "Enlèvement du colis" },
  { value: "Dédiée", unit: "", title: "Course sans regroupement" },
  { value: "7j/7", unit: "", title: "Tous les jours, 7h–23h" },
  { value: "1", unit: "h", title: "Livraison en formule Super" },
];

export default function Hero() {
  return (
    <section id="top" className="relative border-b border-white/10 bg-ink text-white">
      {/* Téléphone : une photo fixe, sans vidéo. */}
      <img
        src="/hero-phone.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-[42%_center] z-0 md:hidden"
      />
      <video
        // Lecture accélérée (x3) : fait ressentir la vitesse de la course. Réappliqué au chargement et au départ, la vitesse étant remise à 1 sinon.
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = 3;
        }}
        onPlay={(e) => {
          e.currentTarget.playbackRate = 3;
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/hero-203401-poster.jpg"
        fetchPriority="high"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 hidden md:block"
      >
        <source src="/videos/hero-203401-aller-retour.mp4" type="video/mp4" />
      </video>
      {/* Fondu sombre sur l'image : vertical partout, plus un voile à gauche sur ordinateur, là où se lit le texte. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-ink/75 via-ink/55 to-ink/70 md:from-ink/85 md:via-ink/55 md:to-ink/85"></div>
      <div className="pointer-events-none absolute inset-0 z-10 hidden bg-gradient-to-r from-ink/90 via-ink/55 to-transparent md:block"></div>

      <div className="relative z-30 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        <div className="min-w-0 pt-8 [text-shadow:0_1px_12px_rgba(0,0,0,0.65)] md:pt-12">
          <h1 className="mb-3 text-balance text-[clamp(32px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier Île-de-France : une course dédiée par envoi
          </h1>
          <p className="mb-4 border-l-2 border-accent pl-3 text-[clamp(17px,2.2vw,24px)] font-semibold text-white">
            Votre pli part dans l&rsquo;heure, pas demain.
          </p>
          {/* Sur téléphone, ce texte laisse la place à la barre d'adresses : le prix d'abord. */}
          <p className="mb-6 hidden max-w-[56ch] text-pretty text-[16px] leading-[1.6] text-white/85 md:block">
            Un dossier à faire signer, un pli à déposer, un colis à livrer d&rsquo;urgence&nbsp;?
            Un de nos coursiers passe le chercher en moins de 45&nbsp;minutes et le porte directement
            à destination, sans autre arrêt en route. Vous voyez le prix avant de commander, et vous
            suivez la course en direct.
          </p>

          <p className="mb-4 inline-flex items-baseline gap-2 rounded-[2px] bg-white/12 px-3 py-1.5 text-[15px] font-semibold text-white">
            <span className="text-white/80">Course dans Paris</span>
            <span>à partir de <strong className="text-[18px] font-bold">{ZONES.paris.from}&nbsp;€ TTC</strong></span>
          </p>
        </div>

        {/* Barre de commande rapide : l'action principale de la page. */}
        <QuickOrderBar />

        <p className="mt-5 text-pretty text-[15px] leading-[1.6] text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] md:hidden">
          Un coursier passe chercher votre pli en moins de 45&nbsp;minutes et le porte directement
          à destination, sans autre arrêt en route.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-8 pt-5 md:pb-10">
          <a
            href={`tel:${PHONE_TEL}`}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/85 hover:text-white"
          >
            <Phone size={15} className="shrink-0 text-accent" />
            <span>
              Une course urgente ? <span className="whitespace-nowrap text-white">{PHONE_DISPLAY}</span>
            </span>
          </a>
          <a
            href="/inscription"
            className="text-[14px] font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            Ouvrir un compte entreprise
          </a>
        </div>
      </div>

      {/* Engagements de service : quatre chiffres fixes, lisibles d'un coup d'œil. */}
      <ul className="relative z-20 grid grid-cols-2 border-b border-line bg-paper-card text-ink md:grid-cols-4">
        {COMMITMENTS.map((c, i) => (
          <li
            key={c.title}
            className={`flex flex-col items-center justify-center border-line px-3 py-6 text-center md:border-l md:py-8 md:first:border-l-0 ${i % 2 === 1 ? "border-l" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}
          >
            <span className="text-[clamp(24px,3vw,36px)] font-bold leading-none text-ink">
              {c.value}
              {c.unit && <span className="ml-1 text-[0.55em] font-bold text-muted">{c.unit}</span>}
            </span>
            <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted md:text-[12px]">{c.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
