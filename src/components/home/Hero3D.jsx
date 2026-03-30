import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Package, CreditCard, MessageSquare, ShoppingCart } from "lucide-react";
import DeliveryScene3D from "./DeliveryScene3D";
import "./Hero3D.css";

/* ─── Mini composant : colis 3D CSS ─────────────────────────────────── */
function Box3D({ size = 60, color = "#ed5518", delay = 0, top, left, right, bottom, rotateX = 20, rotateY = 35 }) {
  const h = size;
  const w = size;
  const d = size * 0.7;

  const style = {
    position: "absolute",
    top, left, right, bottom,
    width: w,
    height: h,
    perspective: 800,
    animationDelay: `${delay}s`,
  };

  const faceBase = {
    position: "absolute",
    width: w,
    height: h,
    border: `1.5px solid ${color}55`,
    backfaceVisibility: "hidden",
  };

  return (
    <div className="box3d-wrapper" style={style}>
      <div
        className="box3d"
        style={{
          width: w,
          height: h,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          position: "relative",
        }}
      >
        {/* Front */}
        <div style={{ ...faceBase, background: `${color}18`, transform: `translateZ(${d / 2}px)` }} />
        {/* Back */}
        <div style={{ ...faceBase, background: `${color}10`, transform: `rotateY(180deg) translateZ(${d / 2}px)` }} />
        {/* Left */}
        <div style={{ ...faceBase, width: d, background: `${color}12`, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }} />
        {/* Right */}
        <div style={{ ...faceBase, width: d, background: `${color}22`, transform: `rotateY(90deg) translateZ(${w - d / 2}px)` }} />
        {/* Top */}
        <div style={{ ...faceBase, height: d, background: `${color}30`, transform: `rotateX(90deg) translateZ(${h / 2}px)` }} />
        {/* Bottom */}
        <div style={{ ...faceBase, height: d, background: `${color}08`, transform: `rotateX(-90deg) translateZ(${h - d / 2}px)` }} />
      </div>
    </div>
  );
}

/* ─── Particule flottante ────────────────────────────────────────────── */
function Particle({ x, y, size, delay, duration, color }) {
  return (
    <div
      className="hero-particle"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

/* ─── Globe 3D SVG rotatif ───────────────────────────────────────────── */
function Globe3D() {
  return (
    <div className="globe-container">
      <svg viewBox="0 0 200 200" className="globe-svg" aria-hidden="true">
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ed5518" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ed5518" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow halo */}
        <circle cx="100" cy="100" r="98" fill="url(#glowGrad)" />

        {/* Globe body */}
        <circle cx="100" cy="100" r="88" fill="url(#globeGrad)" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* Latitude lines */}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((y, i) => {
          const angle = ((y - 100) / 88) * 90;
          const rx = Math.cos((angle * Math.PI) / 180) * 88;
          const ry = 18;
          return rx > 5 ? (
            <ellipse key={i} cx="100" cy={y} rx={rx} ry={ry} fill="none"
              stroke="#ed5518" strokeWidth="0.5" strokeOpacity="0.25" />
          ) : null;
        })}

        {/* Longitude arcs */}
        {[0, 30, 60, 90, 120, 150].map((deg, i) => (
          <ellipse key={i} cx="100" cy="100" rx={Math.abs(Math.cos((deg * Math.PI) / 180)) * 88 + 5}
            ry="88" fill="none" stroke="#ed5518" strokeWidth="0.5" strokeOpacity="0.2"
            transform={`rotate(${deg}, 100, 100)`} />
        ))}

        {/* Route nodes */}
        {[
          { cx: 85, cy: 75 }, { cx: 125, cy: 90 }, { cx: 100, cy: 115 },
          { cx: 70, cy: 105 }, { cx: 115, cy: 65 }
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="3.5" fill="#ed5518" fillOpacity="0.9" />
            <circle cx={n.cx} cy={n.cy} r="3.5" fill="none" stroke="#ed5518"
              strokeWidth="1" strokeOpacity="0.5" className="pulse-ring" />
          </g>
        ))}

        {/* Connecting lines */}
        <line x1="85" y1="75" x2="125" y2="90" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />
        <line x1="125" y1="90" x2="100" y2="115" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />
        <line x1="100" y1="115" x2="70" y2="105" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />
        <line x1="70" y1="105" x2="85" y2="75" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />
        <line x1="85" y1="75" x2="115" y2="65" stroke="#ed5518" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />

        {/* Moving dot along route */}
        <circle r="3" fill="#fed7aa" className="route-dot">
          <animateMotion dur="8s" repeatCount="indefinite"
            path="M85,75 L125,90 L100,115 L70,105 L85,75 L115,65 L85,75" />
        </circle>

        {/* Shimmer highlight */}
        <ellipse cx="75" cy="68" rx="20" ry="12" fill="white" fillOpacity="0.06"
          transform="rotate(-20, 75, 68)" />
      </svg>
    </div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────── */
export default function Hero3D() {
  const particles = [
    { x: 10, y: 20, size: 3, delay: 0, duration: 6, color: "#ed5518aa" },
    { x: 25, y: 70, size: 4, delay: 1, duration: 8, color: "#ed551866" },
    { x: 75, y: 15, size: 2, delay: 2, duration: 5, color: "#94a3b8aa" },
    { x: 88, y: 60, size: 5, delay: 0.5, duration: 7, color: "#ed5518aa" },
    { x: 55, y: 85, size: 3, delay: 3, duration: 9, color: "#f97316aa" },
    { x: 40, y: 5, size: 3, delay: 1.5, duration: 6, color: "#94a3b8aa" },
    { x: 92, y: 30, size: 2, delay: 2.5, duration: 8, color: "#ed551866" },
    { x: 5, y: 55, size: 4, delay: 0.8, duration: 7, color: "#f97316aa" },
    { x: 65, y: 92, size: 2, delay: 3.5, duration: 5, color: "#ed5518aa" },
    { x: 18, y: 42, size: 3, delay: 2, duration: 8, color: "#94a3b8aa" },
  ];

  return (
    <section
      id="hero"
      className="hero3d-section"
      aria-label="Livraison express Paris et Île-de-France"
    >
      {/* ── Fond gradient & mesh ── */}
      <div className="hero3d-bg" aria-hidden="true">
        <div className="hero3d-gradient" />
        <div className="hero3d-grid" />
        <div className="hero3d-glow hero3d-glow--orange" />
        <div className="hero3d-glow hero3d-glow--blue" />
      </div>

      {/* ── Particules flottantes ── */}
      <div className="hero3d-particles" aria-hidden="true">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* ── Cubes 3D flottants ── */}
      <div className="hero3d-cubes" aria-hidden="true">
        <Box3D size={55} color="#ed5518" delay={0} top="12%" left="5%" rotateX={25} rotateY={40} />
        <Box3D size={35} color="#f97316" delay={1.2} top="60%" left="8%" rotateX={15} rotateY={-20} />
        <Box3D size={70} color="#ed5518" delay={0.5} top="8%" right="6%" rotateX={30} rotateY={-45} />
        <Box3D size={42} color="#94a3b8" delay={2} top="70%" right="5%" rotateX={-15} rotateY={25} />
        <Box3D size={28} color="#f97316" delay={3} top="40%" left="3%" rotateX={10} rotateY={60} />
        <Box3D size={50} color="#ed5518" delay={1.8} bottom="10%" right="12%" rotateX={20} rotateY={-30} />
      </div>

      {/* ── Layout principal ── */}
      <div className="hero3d-layout">

        {/* ── Contenu texte (gauche) ── */}
        <div className="hero3d-content">
          {/* Badge live */}
          <div className="hero3d-badge">
            <span className="hero3d-badge__dot" />
            <span>Dispatch actif · Paris & IDF</span>
          </div>

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

        {/* ── Globe 3D (droite) ── */}
        <div className="hero3d-visual" aria-hidden="true" style={{ position: 'relative', zIndex: 10 }}>
          <React.Suspense fallback={<div className="text-white text-center mt-20">Chargement 3D...</div>}>
            <DeliveryScene3D />
          </React.Suspense>

          {/* Cards flottantes autour de la scene */}
          <div className="hero3d-float-card hero3d-float-card--tl">
            <Package size={14} className="text-orange-400" />
            <span>Livraison confirmée</span>
          </div>
          <div className="hero3d-float-card hero3d-float-card--br">
            <span className="hero3d-float-card__dot" />
            <span>+2 340 courses ce mois</span>
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
          {Array(4).fill("PARIS · LYON · MARSEILLE // LIVRAISON MÉDICALE CONFIRMÉE — 08:42 // MISSION JUR").map((text, i) => (
            <span key={i} className="hero3d-ticker__item">{text}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
