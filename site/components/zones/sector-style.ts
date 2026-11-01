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
  "Juridique & Notarial":   "border-blue-200 bg-blue-50",
  "Médical & Laboratoires": "border-green-200 bg-green-50",
  "E-commerce & Luxe":      "border-orange-200 bg-orange-50",
  "Corporate & Agences":    "border-purple-200 bg-purple-50",
  "Événementiel":           "border-pink-200 bg-pink-50",
  "Grands comptes":         "border-gray-200 bg-gray-50",
  "Médical":                "border-green-200 bg-green-50",
  "E-commerce":             "border-orange-200 bg-orange-50",
};

const SECTOR_ICON_BG: Record<string, string> = {
  "Juridique & Notarial":   "bg-blue-100 text-blue-700",
  "Médical & Laboratoires": "bg-green-100 text-green-700",
  "E-commerce & Luxe":      "bg-orange-100 text-orange-700",
  "Corporate & Agences":    "bg-purple-100 text-purple-700",
  "Événementiel":           "bg-pink-100 text-pink-700",
  "Grands comptes":         "bg-gray-100 text-gray-700",
  "Médical":                "bg-green-100 text-green-700",
  "E-commerce":             "bg-orange-100 text-orange-700",
};

export function getIcon(name: string): ElementType {
  return SECTOR_ICONS[name] ?? Briefcase;
}

export function getColor(name: string): string {
  return SECTOR_COLORS[name] ?? "border-gray-200 bg-gray-50";
}

export function getIconBg(name: string): string {
  return SECTOR_ICON_BG[name] ?? "bg-gray-100 text-gray-700";
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
