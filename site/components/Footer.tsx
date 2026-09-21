/**
 * components/Footer.tsx
 * Footer 4 colonnes — charte ONE CONNEXION (ink/orange/paper), moto B2B Paris.
 * Server Component pur. Tagline diversifiée selon la page.
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SERVICES } from "@/lib/services";
import { EMAIL, LEGAL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

const ACCENT = "#ed5518";

const NAV_LINKS = [
  { label: "Notre méthode", href: "/methode" },
  { label: "Flotte & couverture", href: "/flotte" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "Confidentialité", href: "/politique-de-confidentialite" },
];

// Taglines par page pour éviter la répétition identique
const TAGLINES: Record<string, string> = {
  "/": "Livraisons urgentes pour cabinets juridiques, laboratoires et entreprises d'Île-de-France.",
  "/tarifs": "Des tarifs clairs et adaptés à vos volumes. Devis en moins de 2 heures.",
  "/zones": "Couverture intégrale de Paris et Île-de-France. Enlèvement express en moins de 45 min.",
  "/zones/paris": "Paris intramuros livré en moins de 45 minutes. Disponible 7j/7, 7h–23h.",
  "/zones/petite-couronne": "Petite couronne couverte 24/7. Clients réguliers : compte mensuel sans surprise.",
  "/zones/la-defense": "La Défense et Hauts-de-Seine : enlèvement rapide, preuve de remise horodatée.",
  "/services": "Plis confidentiels, transport médical, livraison e-commerce, tournées régulières.",
  "/services/plis-confidentiels": "Plis strictement confidentiels en course dédiée. Horaires flexibles, 7j/7.",
  "/services/transport-medical": "Transport de prélèvements et matériel médical aux normes de sécurité.",
  "/methode": "Notre approche : transparence, flexibilité et engagement de service mesuré.",
  "/flotte": "Flotte deux-roues dédiée. Traçabilité GPS en temps réel, photos de remise.",
  "/references": "Nos clients nous font confiance : cabinets juridiques, laboratoires, e-commerçants.",
  "/secteurs": "Solutions sur mesure pour chaque secteur d'activité francilien.",
  "/contact": "Contactez-nous pour un devis ou une question : réponse en moins de 2 heures.",
};

function getTagline(pathname: string): string {
  // Correspondance exacte d'abord
  if (TAGLINES[pathname]) return TAGLINES[pathname];

  // Sinon, correspondance par préfixe
  for (const [pattern, tagline] of Object.entries(TAGLINES)) {
    if (pathname.startsWith(pattern) && pattern !== "/") {
      return tagline;
    }
  }

  // Par défaut (accueil)
  return TAGLINES["/"];
}

const SECTEUR_LINKS = [
  { label: "Cabinets juridiques", href: "/secteurs#juridique" },
  { label: "Laboratoires & médical", href: "/secteurs#medical" },
  { label: "E-commerce & retail", href: "/secteurs#ecommerce" },
  { label: "Corporate & agences", href: "/secteurs#corporate" },
  { label: "Événementiel", href: "/secteurs#evenementiel" },
  { label: "Grands comptes", href: "/services/compte-entreprise" },
];

const ZONE_LINKS = [
  { label: "Paris intramuros (75)", href: "/zones/paris" },
  { label: "La Défense & 92", href: "/zones/la-defense" },
  { label: "Petite couronne (92/93/94)", href: "/zones/petite-couronne" },
  { label: "Île-de-France complète", href: "/flotte" },
];

function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono text-[9px] tracking-[0.22em] uppercase mb-[14px] pb-[10px]"
      style={{ color: ACCENT, borderBottom: "1px solid rgba(237,85,24,0.2)" }}
    >
      {children}
    </div>
  );
}

const PAYMENT_METHODS = [
  { name: "Stripe", src: "/payments/stripe.svg", width: 48, height: 32 },
  { name: "Visa", src: "/payments/visa.svg", width: 48, height: 32 },
  { name: "Mastercard", src: "/payments/mastercard.svg", width: 48, height: 32 },
  { name: "American Express", src: "/payments/amex.svg", width: 48, height: 32 },
  { name: "Apple Pay", src: "/payments/apple-pay.svg", width: 48, height: 32 },
  { name: "Google Pay", src: "/payments/google-pay.svg", width: 48, height: 32 },
  { name: "Prélèvement SEPA", src: "/payments/sepa.svg", width: 48, height: 32 },
];

export default function Footer() {
  const pathname = usePathname();
  const tagline = getTagline(pathname);

  return (
    <footer className="bg-ink text-paper">
      {/* Liseré orange */}
      <div style={{ height: "3px", background: ACCENT }} />

      {/* Grille principale — Marque + 5 colonnes de liens */}
      <div className="mx-auto px-[clamp(20px,4vw,32px)] pt-10 pb-8" style={{ maxWidth: "1240px" }}>

        {/* Ligne 1 : Logo + baseline */}
        <div className="mb-8 flex flex-col gap-2 border-b pb-8" style={{ borderColor: "rgba(244,242,238,0.08)" }}>
          <Image
            src="/logo-white.png"
            alt="Logo ONE CONNEXION, coursier moto B2B à Paris et en Île-de-France"
            width={400}
            height={150}
            className="w-[140px] h-auto object-contain"
          />
          <p className="text-[13px] leading-[1.7] max-w-[480px]" style={{ color: "rgba(244,242,238,0.40)" }}>
            {tagline}
          </p>
        </div>

        {/* Ligne 2 : 5 colonnes de liens */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">

          {/* ── COL 1 : Prestations ── */}
          <div>
            <ColLabel>Prestations</ColLabel>
            <nav className="flex flex-col gap-[9px]">
              {SERVICES.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="text-[13px] transition-colors" style={{ color: "rgba(244,242,238,0.5)" }}>
                  {s.card.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── COL 2 : Secteurs ── */}
          <div>
            <ColLabel>
              <Link href="/secteurs" style={{ color: "inherit", textDecoration: "none" }}>Secteurs</Link>
            </ColLabel>
            <nav className="flex flex-col gap-[9px]">
              {SECTEUR_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className="text-[13px] transition-colors" style={{ color: "rgba(244,242,238,0.5)" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── COL 3 : Zones ── */}
          <div>
            <ColLabel>
              <Link href="/zones" style={{ color: "inherit", textDecoration: "none" }}>Zones</Link>
            </ColLabel>
            <nav className="flex flex-col gap-[9px]">
              {ZONE_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className="text-[13px] transition-colors" style={{ color: "rgba(244,242,238,0.5)" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── COL 4 : Navigation ── */}
          <div>
            <ColLabel>Navigation</ColLabel>
            <nav className="flex flex-col gap-[9px]">
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className="text-[13px] transition-colors" style={{ color: "rgba(244,242,238,0.5)" }}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── COL 5 : Contact ── */}
          <div>
            <ColLabel>Nous joindre</ColLabel>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase mb-1" style={{ color: "rgba(244,242,238,0.25)" }}>Téléphone</div>
            <a href={`tel:${PHONE_TEL}`} className="block text-[20px] font-bold leading-none mb-4 transition-colors" style={{ letterSpacing: "-0.02em", color: "#F4F2EE", textDecoration: "none" }}>
              {PHONE_DISPLAY}
            </a>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase mb-1" style={{ color: "rgba(244,242,238,0.25)" }}>Email</div>
            <a href={`mailto:${EMAIL}`} className="block text-[13px] mb-6 transition-colors" style={{ color: "rgba(244,242,238,0.45)", textDecoration: "none" }}>
              {EMAIL}
            </a>
            <Link
              href="/#contact"
              className="inline-block font-mono text-[10px] tracking-[0.14em] uppercase transition-opacity hover:opacity-80"
              style={{ color: "#0E0F10", background: ACCENT, padding: "9px 16px", borderRadius: "1px", textDecoration: "none", fontWeight: 500 }}
            >
              Commander une course
            </Link>
          </div>

        </div>
      </div>

      {/* Moyens de paiement */}
      <div style={{ borderTop: "1px solid rgba(244,242,238,0.06)" }}>
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[clamp(20px,4vw,32px)] py-4"
          style={{ maxWidth: "1240px" }}
        >
          <div>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "rgba(244,242,238,0.3)" }}>
              Paiements sécurisés
            </div>
            <div className="text-[11px] font-semibold mt-1" style={{ color: "rgba(244,242,238,0.6)" }}>
              Vos transactions en toute confiance
            </div>
          </div>
          <ul className="flex flex-wrap items-center justify-end gap-3" aria-label="Moyens de paiement acceptés">
            {PAYMENT_METHODS.map((method) => (
              <li key={method.name} title={method.name} aria-label={method.name}>
                <Image
                  src={method.src}
                  alt={method.name}
                  width={method.width}
                  height={method.height}
                  className="h-8 w-auto"
                  priority={false}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barre légale */}
      <div style={{ borderTop: "1px solid rgba(244,242,238,0.06)" }}>
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-2 px-[clamp(20px,4vw,32px)] py-3"
          style={{ maxWidth: "1240px" }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.12em] uppercase"
            style={{ color: "rgba(244,242,238,0.16)" }}
          >
            © 2026 One Connexion · Tous droits réservés
          </span>
        </div>
      </div>
    </footer>
  );
}
