import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import "./Hero3D.css";

/* ─── Arrière-plan Vidéo Unique ─────────────────────────────────────────── */
function ProfessionalVideoCarousel() {
  return (
    <div className="hero-video-carousel">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hero-fullscreen-video object-cover"
      >
        <source src="/images/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Restored Dark Editorial Overlay */}
      <div className="hero-video-overlay bg-black/60"></div>
    </div>
  );
}

export default function Hero3D() {
  return (
    <section
      id="hero"
      className="hero3d-section min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-12 md:pt-20"
      aria-label="Livraison sur-mesure pour marques exigeantes"
    >
      {/* ── Background Video ── */}
      <ProfessionalVideoCarousel />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">

          <h1 className="text-5xl md:text-7xl lg:text-[7.5rem] font-display leading-[0.95] text-white mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom duration-1000 delay-100">
            La livraison <br />
            <span className="italic text-[#ed5518]">sur-mesure</span> <br />
            pour les marques exigeantes.
          </h1>

          <p className="text-base md:text-xl text-white/80 leading-relaxed font-light mb-8 md:mb-10 max-w-2xl animate-in fade-in duration-1000 delay-300">
            One Connexion redéfinit la logistique urbaine en conciliant excellence opérationnelle et image de marque. Le partenaire de confiance de vos missions les plus critiques.
          </p>

          <div className="flex flex-col items-center justify-center animate-in fade-in duration-1000 delay-500">
            <Link to="/commande-sans-compte" className="btn-premium flex items-center gap-4 shadow-2xl shadow-orange-500/30 px-12 py-5 text-lg group">
              <span>Commander sans compte</span>
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white to-white/0 animate-pulse"></div>
      </div>
    </section>
  );
}
