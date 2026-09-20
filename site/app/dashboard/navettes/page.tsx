"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, RefreshCw, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import { NavetteRequestForm } from "@/components/dashboard/NavetteRequestForm";
import { createClient } from "@/lib/supabase/client";
import { PageShell, KpiStrip, StatusPill, EmptyState, LoadingState, BTN_ACCENT, BTN_GHOST_DARK } from "@/components/dashboard/ui";

export default function NavettesPage() {
  const supabase = createClient();

  const [isCreating, setIsCreating] = useState(false);
  const [navettes, setNavettes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load navettes from Supabase
  useEffect(() => {
    const loadNavettes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("navettes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur de chargement:", error);
          setNavettes([]);
        } else {
          setNavettes(data || []);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setNavettes([]);
      } finally {
        setLoading(false);
      }
    };

    loadNavettes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating]); // Reload when leaving creation mode

  const active = navettes.filter((n) => n.status === "active").length;
  const pending = navettes.filter((n) => n.status === "en_attente").length;

  const Status = ({ status }: { status: string }) =>
    status === "active" ? (
      <StatusPill tone="green">Active</StatusPill>
    ) : status === "en_attente" ? (
      <StatusPill tone="amber">En attente</StatusPill>
    ) : (
      <StatusPill tone="gray">Inactive</StatusPill>
    );

  const DAYS = [
  { id: "mon", label: "L" }, { id: "tue", label: "M" }, { id: "wed", label: "M" }, { id: "thu", label: "J" },
  { id: "fri", label: "V" }, { id: "sat", label: "S" }, { id: "sun", label: "D" },
];

  const nameOf = (n: any) => n.name || n.nom || "Navette B2B";
    const lastDelivery = (n: any) =>
    n.delivery_recipient || n.delivery_department
      ? [
          n.delivery_recipient ? `Réceptionnée par ${n.delivery_recipient}` : null,
          n.delivered_at ? new Date(n.delivered_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <PageShell
      eyebrow="Services récurrents"
      title={isCreating ? "Programmer une navette" : "Vos navettes récurrentes"}
      subtitle={
        isCreating
          ? "Planifiez des tournées régulières. Un chauffeur dédié sera assigné à vos trajets."
          : "Gérez vos tournées régulières et programmez-en de nouvelles."
      }
      actions={
        isCreating ? (
          <button type="button" onClick={() => setIsCreating(false)} className={BTN_GHOST_DARK}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Retour aux navettes
          </button>
        ) : (
          <button type="button" onClick={() => setIsCreating(true)} className={BTN_ACCENT}>
            <Plus size={18} strokeWidth={2.5} />
            Nouvelle navette
          </button>
        )
      }
    >
      {isCreating ? (
        <div className="step-enter min-h-0 flex-1 overflow-y-auto bg-paper-card p-5 sm:p-8">
          <NavetteRequestForm onSuccess={() => setIsCreating(false)} />
        </div>
      ) : loading ? (
        <LoadingState text="Chargement de vos navettes…" />
      ) : navettes.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Aucune navette programmée"
          text="Programmez des tournées régulières avec un chauffeur dédié."
          action={
            <button type="button" onClick={() => setIsCreating(true)} className={BTN_ACCENT}>
              <Plus size={18} strokeWidth={2.5} />
              Créer ma première navette
            </button>
          }
        />
      ) : (
        <>
          <KpiStrip
            items={[
              { label: "Navettes", value: navettes.length },
              { label: "Actives", value: active, accent: active > 0 },
              { label: "En attente de confirmation", value: pending },
            ]}
          />
          <div className="min-h-0 flex-1 overflow-y-auto bg-paper-card p-4 sm:p-6">
            <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {navettes.map((n) => {
                const stops: any[] = Array.isArray(n.stops) ? n.stops : [];
                const points: { label: string; address: string; kind: "start" | "stop" | "end" }[] = [
                  { label: "Départ", address: n.pickup_address, kind: "start" },
                  ...stops.map((s, i) => ({ label: `Étape ${i + 1}`, address: s?.address || String(s), kind: "stop" as const })),
                  { label: "Arrivée", address: n.dropoff_address, kind: "end" },
                ];
                const days: string[] = Array.isArray(n.days_of_week) ? n.days_of_week : [];
                const last = lastDelivery(n);
                const hm = (t?: string) => (t ? String(t).slice(0, 5) : t);
                const start = hm(n.start_time || n.horaire_debut);
                const end = hm(n.end_time);
                return (
                  <li key={n.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                          <RefreshCw size={15} strokeWidth={2.25} />
                        </span>
                        <h2 className="text-[15px] font-extrabold leading-tight text-ink">{nameOf(n)}</h2>
                      </div>
                      <Status status={n.status} />
                    </div>

                    {/* Itinéraire complet, adresses non tronquées */}
                    <ol className="relative flex flex-col gap-3 px-5 py-4 pl-12">
                      <span aria-hidden className="absolute bottom-6 left-[27px] top-6 border-l-2 border-dashed border-line" />
                      {points.map((pt, i) => (
                        <li key={i} className="relative">
                          <span
                            aria-hidden
                            className={`absolute -left-7 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                              pt.kind === "end" ? "border-accent bg-accent" : pt.kind === "start" ? "border-ink bg-white" : "border-label bg-white"
                            }`}
                          />
                          <div className="label-mono text-[10.5px] font-medium text-muted">{pt.label}</div>
                          <div className="text-[13px] font-semibold leading-snug text-ink">{pt.address}</div>
                        </li>
                      ))}
                    </ol>

                    {/* Planning + tarif */}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line bg-paper-card px-5 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {days.length > 0 ? (
                          <div className="flex gap-1" aria-label={`Jours : ${n.days_str || ""}`}>
                            {DAYS.map((d) => (
                              <span
                                key={d.id}
                                className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                                  days.includes(d.id) ? "bg-ink text-white" : "bg-white text-label ring-1 ring-line"
                                }`}
                              >
                                {d.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-ink">{n.days_str || n.frequence || "Jours à définir"}</span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                          <Clock size={13} className="text-label" />
                          {start ? (end ? `${start} – ${end}` : `Présentation à ${start}`) : "Horaire à définir"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {n.estimated_price != null && (
                          <div className="text-right">
                            <div className="text-lg font-extrabold leading-none tabular-nums text-ink">{n.estimated_price} €</div>
                            <div className="mt-0.5 text-[11px] font-medium text-muted">HT / passage</div>
                          </div>
                        )}
                        <Link
                          href={`/dashboard/navettes/${n.id}`}
                          className="flex h-10 items-center gap-1.5 rounded-lg bg-ink px-4 text-xs font-bold text-white transition-colors hover:bg-[#25272a] hover:text-white"
                        >
                          Détails
                          <ChevronRight size={14} strokeWidth={2.5} />
                        </Link>
                      </div>
                    </div>

                    {last && <div className="border-t border-line px-5 py-2.5 text-xs text-muted">Dernière livraison : {last}</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </PageShell>
  );
}
