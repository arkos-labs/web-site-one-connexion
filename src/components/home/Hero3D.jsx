import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
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
            Paris & Île‑de‑France
          </h1>

          <p className="hero3d-desc">
            Messagerie professionnelle 24/7 — colis urgents, plis sensibles
            et tournées régulières avec facturation mensuelle claire.
          </p>

          {/* CTAs */}
          <div className="hero3d-ctas">
            <Link to="/commande-rapide" className="hero3d-cta hero3d-cta--primary">
              <span className="hero3d-cta__text">Commander sans compte</span>
              <div className="hero3d-cta__icon">
                <ShoppingCart size={18} />
              </div>
            </Link>
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
