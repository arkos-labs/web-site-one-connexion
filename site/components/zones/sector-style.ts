/**
 * components/zones/sector-style.ts
 * Icône et couleurs des cartes « secteur » des pages de ville.
 */
import {
  Scale, Activity, ShoppingBag, Briefcase, CalendarDays, Building2,
} from "lucide-react";
import type { ElementType } from "react";

const SECTOR_ICONS: Record<string, ElementType> = {
  "Juridique & Notarial":   Scale,
  "Médical & Laboratoires": Activity,
  "E-commerce & Luxe":      ShoppingBag,
  "Corporate & Agences":    Briefcase,
  "Événementiel":           CalendarDays,
  "Grands comptes":         Building2,
  // fallbacks
  "Médical":                Activity,
  "E-commerce":             ShoppingBag,
};

const SECTOR_COLORS: Record<string, string> = {
  "Juridique & Notarial":   "border-line bg-paper-card",
  "Médical & Laboratoires": "border-line bg-paper-card",
  "E-commerce & Luxe":      "border-line bg-paper-card",
  "Corporate & Agences":    "border-line bg-paper-card",
  "Événementiel":           "border-line bg-paper-card",
  "Grands comptes":         "border-line bg-paper-card",
  "Médical":                "border-line bg-paper-card",
  "E-commerce":             "border-line bg-paper-card",
};

const SECTOR_ICON_BG: Record<string, string> = {
  "Juridique & Notarial":   "bg-ink text-white",
  "Médical & Laboratoires": "bg-ink text-white",
  "E-commerce & Luxe":      "bg-ink text-white",
  "Corporate & Agences":    "bg-ink text-white",
  "Événementiel":           "bg-ink text-white",
  "Grands comptes":         "bg-ink text-white",
  "Médical":                "bg-ink text-white",
  "E-commerce":             "bg-ink text-white",
};

export function getIcon(name: string): ElementType {
  return SECTOR_ICONS[name] ?? Briefcase;
}

export function getColor(name: string): string {
  return SECTOR_COLORS[name] ?? "border-line bg-paper-card";
}

export function getIconBg(name: string): string {
  return SECTOR_ICON_BG[name] ?? "bg-ink text-white";
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    "paris":            "Paris intramuros",
    "hauts-de-seine":   "Hauts-de-Seine (92)",
    "seine-saint-denis":"Seine-Saint-Denis (93)",
    "val-de-marne":     "Val-de-Marne (94)",
  };
  return map[cat] ?? cat;
}
