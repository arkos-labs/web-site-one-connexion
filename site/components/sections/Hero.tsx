/**
 * components/sections/Hero.tsx
 * Section d'ouverture sombre : promesse, barre d'adresses (prix immédiat),
 * puis les quatre engagements de service chiffrés.
 */
"use client";

import { Phone, Star } from "lucide-react";
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
        <div className="min-w-0 pt-8 [text-shadow:0_1px_12px_rgba(0,0,0,0.65)] md:pr-[310px] md:pt-12">
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

          <a
            href="https://share.google/Qdfd63CULw434rMDR"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir nos avis Google : 5,0 sur 5, 4 avis"
            className="mb-4 inline-flex items-center gap-3 rounded-full bg-white transition-transform hover:scale-[1.03] md:absolute md:right-[clamp(20px,4vw,28px)] md:top-[calc(42%-56px)] md:mb-0 md:-translate-y-1/2 py-2.5 pl-4 pr-5 font-sans text-[#202124] shadow-[0_2px_10px_rgba(0,0,0,0.35)] [text-shadow:none]">
            <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true" className="shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-medium text-[#202124]">Avis Google</span>
              <span className="flex items-center gap-2">
                <span className="text-[20px] font-medium">5,0</span>
                <span className="flex items-center gap-0.5 text-[#fbbc04]" aria-label="5 étoiles sur 5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-[15px] text-[#70757a]">(4 avis)</span>
              </span>
            </div>
          </a>
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
