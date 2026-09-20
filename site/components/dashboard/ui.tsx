import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Search, Loader2, ArrowLeft } from "lucide-react";

/**
 * Kit UI du dashboard client. Toutes les pages partagent la même "console" :
 * une carte à hauteur d'écran (pas de scroll de page), un en-tête compact,
 * puis un corps dont seule la zone de contenu défile si besoin.
 */

/* ── Styles de champs ─────────────────────────────────────────────────── */

export const INPUT =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink placeholder:text-label transition-colors hover:border-[#c9c5bd] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted";
export const TEXTAREA =
  "w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-label transition-colors hover:border-[#c9c5bd] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";
export const LABEL = "label-mono mb-1.5 block text-xs font-medium text-muted";
export const BTN_PRIMARY =
  "flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#25272a] disabled:opacity-50";
export const BTN_ACCENT =
  "flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-60";
export const BTN_GHOST_DARK =
  "flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/[0.07] px-5 text-sm font-bold text-white transition-colors hover:bg-white/15";
export const BTN_GHOST =
  "flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line bg-white px-5 text-sm font-bold text-ink transition-colors hover:bg-paper";

/* ── Coque de page ────────────────────────────────────────────────────── */

export function PageShell({
  eyebrow,
  title,
  subtitle,
  actions,
  fill,
  back,
  children,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** true : la carte occupe exactement la hauteur de l'écran (ex. paramètres). Sinon elle grandit avec son contenu et la page défile. */
  fill?: boolean;
  /** Lien de retour affiché au-dessus du titre (pages de détail). */
  back?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-ink bg-white shadow-[0_12px_40px_-12px_rgba(14,15,16,0.25)] ${
        fill ? "[@media(min-height:760px)_and_(min-width:1024px)]:h-[calc(100dvh-160px)]" : ""
      }`}
    >
      <header className="relative flex flex-col gap-3 bg-ink px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-accent" />
        <div className="min-w-0">
          {back && (
            <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white">
              <ArrowLeft size={13} strokeWidth={2.5} />
              {back.label}
            </Link>
          )}
          <div className="label-mono flex items-center gap-2 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {eyebrow}
          </div>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xl font-extrabold leading-none tracking-tight text-white sm:text-[22px]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-xl text-xs leading-snug text-white/60">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/* ── Recherche ────────────────────────────────────────────────────────── */

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.07] pl-10 pr-3.5 text-sm font-medium text-white placeholder:text-white/45 transition-colors hover:border-white/30 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

/* ── Indicateurs ──────────────────────────────────────────────────────── */

export function KpiStrip({ items }: { items: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }[] }) {
  return (
    <dl
      className="grid divide-x divide-white/10 border-t border-white/10 bg-ink"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((k) => (
        <div key={k.label} className="min-w-0 px-3 py-2.5 sm:px-6">
          <dt className="label-mono truncate text-[10.5px] font-medium tracking-[0.04em] text-white/55 sm:text-[11px] sm:tracking-[0.16em]">{k.label}</dt>
          <dd className={`mt-0.5 truncate text-xl font-extrabold leading-none tracking-tight ${k.accent ? "text-accent" : "text-white"}`}>
            {k.value}
          </dd>
          {k.hint && <p className="mt-1 hidden truncate text-xs text-white/50 sm:block">{k.hint}</p>}
        </div>
      ))}
    </dl>
  );
}

/* ── Badge de statut ──────────────────────────────────────────────────── */

const TONES = {
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-800",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  gray: "bg-paper text-muted",
  orange: "bg-accent/10 text-accent-dark",
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${TONES[tone]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/* ── États vides / chargement ─────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper-card text-label">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h2 className="text-base font-extrabold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ text }: { text: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center gap-2.5 py-16 text-sm font-medium text-muted">
      <Loader2 size={18} className="animate-spin text-accent" />
      {text}
    </div>
  );
}

/* ── Classes de tableau partagées ─────────────────────────────────────── */

export const TH = "label-mono px-4 py-2.5 text-left text-[11px] font-medium text-muted first:pl-6 last:pr-6";
export const TD = "px-4 py-3 align-middle first:pl-6 last:pr-6";

/* ── Pages de détail : panneaux ───────────────────────────────────────── */

/** Corps d'une page de détail : fond papier, grille principale + latérale. */
export function DetailBody({ main, side }: { main: React.ReactNode; side?: React.ReactNode }) {
  return (
    <div className="grid gap-4 bg-paper-card p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">{main}</div>
      {side && <div className="flex min-w-0 flex-col gap-4">{side}</div>}
    </div>
  );
}

export function Panel({
  title,
  aside,
  tone = "default",
  children,
}: {
  title?: string;
  aside?: React.ReactNode;
  tone?: "default" | "danger" | "success";
  children: React.ReactNode;
}) {
  const border = tone === "danger" ? "border-red-200" : tone === "success" ? "border-green-200" : "border-line";
  return (
    <section className={`overflow-hidden rounded-xl border bg-white ${border}`}>
      {title && (
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-3 ${border}`}>
          <h2 className="label-mono text-xs font-medium text-muted">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function InfoRow({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className={`text-right ${strong ? "font-extrabold text-ink" : "font-semibold text-ink"}`}>{value}</span>
    </div>
  );
}

/** Petite mention clé/valeur (ex. « Remis par : M. Martin »). */
export function Fact({ k, children, tone = "default" }: { k: string; children: React.ReactNode; tone?: "default" | "success" }) {
  return (
    <p className="text-xs leading-snug text-muted">
      <span className={`label-mono mr-2 text-[10px] font-medium ${tone === "success" ? "text-green-700" : "text-label"}`}>{k}</span>
      <span className="font-semibold text-ink">{children}</span>
    </p>
  );
}

export function NoteBox({ tone = "default", children }: { tone?: "default" | "success"; children: React.ReactNode }) {
  return (
    <div
      className={`mt-2 flex flex-col gap-1 rounded-lg border px-3 py-2 ${
        tone === "success" ? "border-green-200 bg-green-50" : "border-line bg-paper-card"
      }`}
    >
      {children}
    </div>
  );
}

export function ErrorState({ text, back }: { text: string; back: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white px-6 py-16 text-center">
      <p className="text-base font-extrabold text-ink">{text}</p>
      <Link href={back.href} className={`${BTN_PRIMARY} text-white hover:text-white`}>
        <ArrowLeft size={15} strokeWidth={2.5} />
        {back.label}
      </Link>
    </div>
  );
}

/** Page de l'espace admin : même en-tête noir que le dashboard client, contenu sur fond papier. */
export function AdminPage({
  eyebrow,
  title,
  subtitle,
  actions,
  back,
  children,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <PageShell eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} back={back}>
      <div className="flex flex-col gap-6 bg-paper-card p-4 sm:p-6">{children}</div>
    </PageShell>
  );
}
