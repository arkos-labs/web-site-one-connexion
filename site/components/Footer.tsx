/**
 * components/Footer.tsx
 * Footer 4 colonnes — charte ONE CONNEXION (ink/orange/paper), moto B2B Paris.
 * Server Component pur.
 */
import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import { EMAIL, LEGAL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

const ACCENT = "#ed5518";

const NAV_LINKS = [
  { label: "Notre méthode", href: "/methode" },
  { label: "Flotte & couverture", href: "/flotte" },
  { label: "Références clients", href: "/references" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
];

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

function PayBadge({ label, bg = "#fff", children }: { label: string; bg?: string; children: React.ReactNode }) {
  return (
    <li
      title={label}
      aria-label={label}
      className="flex h-[30px] min-w-[52px] items-center justify-center px-2"
      style={{ background: bg, borderRadius: "4px" }}
    >
      {children}
    </li>
  );
}

export default function Footer() {
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
            alt="ONE CONNEXION — Coursier moto B2B Paris"
            width={400}
            height={150}
            className="w-[140px] h-auto object-contain"
          />
          <p className="text-[13px] leading-[1.7] max-w-[480px]" style={{ color: "rgba(244,242,238,0.40)" }}>
            Livraisons urgentes pour cabinets juridiques, laboratoires et entreprises d&apos;Île-de-France.
            Flotte deux-roues, traçabilité complète, interlocuteur unique.
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
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "rgba(244,242,238,0.3)" }}>
            Paiement sécurisé
          </span>
          <ul className="flex flex-wrap items-center justify-end gap-2" aria-label="Moyens de paiement acceptés">
            <PayBadge label="Stripe" bg="#635BFF">
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>stripe</span>
            </PayBadge>
            <PayBadge label="Visa">
              <span style={{ color: "#1A1F71", fontWeight: 800, fontStyle: "italic", fontSize: 15, letterSpacing: "-0.02em" }}>VISA</span>
            </PayBadge>
            <PayBadge label="Mastercard">
              <svg width="30" height="19" viewBox="0 0 30 19" aria-hidden="true">
                <circle cx="10" cy="9.5" r="9" fill="#EB001B" />
                <circle cx="20" cy="9.5" r="9" fill="#F79E1B" fillOpacity="0.9" />
              </svg>
            </PayBadge>
            <PayBadge label="Carte Bancaire (CB)">
              <span style={{ color: "#fff", background: "#0B5DA7", fontWeight: 700, fontSize: 11, padding: "1px 6px", borderRadius: 2 }}>CB</span>
            </PayBadge>
            <PayBadge label="American Express" bg="#2E77BC">
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 10, letterSpacing: "0.04em" }}>AMEX</span>
            </PayBadge>
            <PayBadge label="Virement SEPA">
              <span style={{ color: "#10298E", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em" }}>
                SEPA<span style={{ color: "#F5B400" }}> ★</span>
              </span>
            </PayBadge>
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
          <span
            className="font-mono text-[10px] tracking-[0.12em] uppercase"
            style={{ color: "rgba(244,242,238,0.16)" }}
          >
            SIREN {LEGAL.siren} · TVA {LEGAL.tva} · Assurance 3,5 M€ · RC Pro
          </span>
        </div>
      </div>
    </footer>
  );
}
