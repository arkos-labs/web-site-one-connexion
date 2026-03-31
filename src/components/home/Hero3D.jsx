import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Package, CreditCard, MessageSquare, ShoppingCart } from "lucide-react";
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
        className="hero-fullscreen-video"
      >
        <source src="/images/video-medecin.mp4" type="video/mp4" />
      </video>
      
      {/* Couche de gradient noir sur la gauche pour lire le texte */}
      <div className="hero-video-overlay"></div>
    </div>
  );
}

export default function Hero3D() {


  return (
    <section
      id="hero"
      className="hero3d-section"
      aria-label="Livraison express Paris et Île-de-France"
    >
      {/* ── Fullscreen Video-like Carousel Background ── */}
      <ProfessionalVideoCarousel />



      {/* ── Layout principal ── */}
      <div className="hero3d-layout">

        {/* ── Contenu texte (gauche) ── */}
        <div className="hero3d-content">


          <h1 className="hero3d-title">
            Livraison Express{" "}
            <span className="hero3d-title__accent">B2B</span>
            <br />
            <span className="hero3d-title__sub">Paris & Île‑de‑France</span>
          </h1>

          <p className="hero3d-desc">
            Messagerie professionnelle 24/7 — colis urgents, plis sensibles
            et tournées régulières avec facturation mensuelle claire.
          </p>

          {/* Statistiques 3D */}
          <div className="hero3d-stats">
            {[
              { value: "45min", label: "Prise en charge" },
              { value: "24/7", label: "Disponibilité" },
              { value: "50k€", label: "Assurance incluse" },
            ].map((s, i) => (
              <div key={i} className="hero3d-stat">
                <span className="hero3d-stat__value">{s.value}</span>
                <span className="hero3d-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="hero3d-ctas">
            <Link to="/inscription" className="hero3d-cta hero3d-cta--primary">
              <span>Créer un compte pro</span>
              <div className="hero3d-cta__icon">
                <ArrowUpRight size={16} />
              </div>
            </Link>
            <Link to="/commande-sans-compte" className="hero3d-cta hero3d-cta--ghost">
              <ShoppingCart size={16} className="text-orange-400" />
              <span>Commander sans compte</span>
            </Link>
          </div>

          {/* Badges de confiance */}
          <div className="hero3d-trust">
            {[
              { icon: Package, label: "Commandes 24/7" },
              { icon: CreditCard, label: "Facturation mensuelle" },
              { icon: MessageSquare, label: "Suivi temps réel" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="hero3d-trust__badge">
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="hero3d-scroll" aria-hidden="true">
        <div className="hero3d-scroll__line" />
        <span className="hero3d-scroll__text">Défiler</span>
      </div>

      {/* ── Ticker Tape (Bottom) ── */}
      <div className="hero3d-ticker">
        <div className="hero3d-ticker__track">
          {[
            "MISSION MÉDICALE : DÉPART NANTERRE ➔ LIVRAISON PARIS 08 // EN COURS // ",
            "COURSE AUTOMOBILE : DÉPART BOULOGNE ➔ LIVRAISON VERSAILLES // LIVRÉ // ",
            "PLI JURIDIQUE : DÉPART PARIS 17 ➔ LIVRAISON BOBIGNY // RÉCEPTIONNÉ // ",
            "TRANSPARENCE TOTALE ➔ SUIVI GPS LIVE // DISPATCH ACTIF // ",
            "LIVRAISON URGENTE : DÉPART ORLY ➔ LIVRAISON PARIS 15 // EN TRANSIT // "
          ].map((text, i) => (
            <span key={i} className="hero3d-ticker__item">{text}</span>
          ))}
          {[
            "MISSION MÉDICALE : DÉPART NANTERRE ➔ LIVRAISON PARIS 08 // EN COURS // ",
            "COURSE AUTOMOBILE : DÉPART BOULOGNE ➔ LIVRAISON VERSAILLES // LIVRÉ // ",
            "PLI JURIDIQUE : DÉPART PARIS 17 ➔ LIVRAISON BOBIGNY // RÉCEPTIONNÉ // ",
            "TRANSPARENCE TOTALE ➔ SUIVI GPS LIVE // DISPATCH ACTIF // ",
            "LIVRAISON URGENTE : DÉPART ORLY ➔ LIVRAISON PARIS 15 // EN TRANSIT // "
          ].map((text, i) => (
            <span key={i} className="hero3d-ticker__item">{text}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
