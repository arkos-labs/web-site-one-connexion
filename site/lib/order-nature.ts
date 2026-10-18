/**
 * lib/order-nature.ts
 * Type d'envoi choisi par le client à la commande (colonne orders.nature).
 * Information pour le dispatch et le coursier : le prix ne dépend que de la zone et du délai.
 */
import { FileText, Lock, FlaskConical, Package, CircleHelp, type LucideIcon } from "lucide-react";

export const ORDER_NATURES: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "documents", label: "Documents", Icon: FileText },
  { id: "confidentiel", label: "Pli confidentiel", Icon: Lock },
  { id: "medical", label: "Médical / labo", Icon: FlaskConical },
  { id: "colis", label: "Colis / marchandise", Icon: Package },
  { id: "autre", label: "Autre", Icon: CircleHelp },
];

/** « Autre » affiche ce que le client a précisé : « Autre : clés de bureau ». */
export const natureLabel = (id: string | null | undefined, detail?: string | null) => {
  const label = ORDER_NATURES.find((n) => n.id === id)?.label ?? null;
  return id === "autre" && detail?.trim() ? `${label} : ${detail.trim()}` : label;
};

/** Texte libre exigé quand le client choisit « Autre ». */
export const NATURE_DETAIL_MAX = 200;
