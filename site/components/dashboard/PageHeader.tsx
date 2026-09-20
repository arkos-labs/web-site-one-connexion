import React from "react";
import type { LucideIcon } from "lucide-react";

/**
 * En-tête de page standard du dashboard : badge "eyebrow" + titre + sous-titre,
 * avec un slot optionnel à droite pour une action (bouton, recherche...).
 * Reprend le pattern déjà utilisé sur Commander / Navettes pour que toutes
 * les pages du dashboard client partagent la même identité visuelle.
 */
export function PageHeader({
  icon: Icon,
  eyebrow,
  eyebrowColor = "#E85D1F",
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  eyebrow: string;
  eyebrowColor?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start gap-4">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase"
          style={{
            backgroundColor: `${eyebrowColor}1A`,
            borderColor: `${eyebrowColor}33`,
            color: eyebrowColor,
          }}
        >
          <Icon size={12} strokeWidth={3} />
          {eyebrow}
        </div>
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-[15px] font-medium text-muted">{subtitle}</p>
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
