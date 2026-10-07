/**
 * lib/dashboard-nav.ts
 * Source unique des entrées de navigation du dashboard, partagée entre
 * app/dashboard/layout.tsx (sidebar desktop) et components/Header.tsx
 * (menu mobile, intégré au burger).
 */
import { PackagePlus, Truck, FileText, MapPin, Settings, Calendar, type LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  hasDot?: boolean;
  badge?: string;
  /** Réservé aux comptes professionnels (les particuliers ne le voient pas). */
  proOnly?: boolean;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { name: "Commander une course", href: "/dashboard/commander", icon: PackagePlus, hasDot: true },
  { name: "Navettes récurrentes", href: "/dashboard/navettes", icon: Calendar, badge: "Nouveau", proOnly: true },
  { name: "Suivi des livraisons", href: "/dashboard/suivi", icon: Truck },
  { name: "Factures & Relevés", href: "/dashboard/factures", icon: FileText },
  { name: "Adresses favorites", href: "/dashboard/adresses", icon: MapPin },
  { name: "Paramètres du compte", href: "/dashboard/parametres", icon: Settings },
];

/** Un compte pro est créé avec un SIRET ; un particulier n'en a pas. */
export function isProAccount(user: { user_metadata?: Record<string, any> } | null | undefined): boolean {
  return !!user?.user_metadata?.siret;
}
