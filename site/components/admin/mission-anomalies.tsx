"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Anomaly = {
  id: string;
  mission_id: string;
  step: "enlevement" | "livraison" | "general";
  type: string;
  comment: string | null;
  resolved: boolean;
  created_at: string;
};

const STEP_LABEL: Record<Anomaly["step"], string> = {
  enlevement: "Enlèvement",
  livraison: "Livraison",
  general: "Général",
};

const time = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export function useMissionAnomalies(supabase: SupabaseClient, channelName: string) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("mission_anomalies")
      .select("id, mission_id, step, type, comment, resolved, created_at")
      .order("created_at", { ascending: false });
    setAnomalies((data ?? []) as Anomaly[]);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "mission_anomalies" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase, channelName]);

  const resolve = async (id: string) => {
    const { error } = await supabase.from("mission_anomalies").update({ resolved: true }).eq("id", id);
    if (error) alert("Erreur : " + error.message);
    load();
  };

  const forMission = (missionId: string) => anomalies.filter((a) => a.mission_id === missionId);

  return { forMission, resolve };
}

export function ClientAnomalies({ items }: { items: Anomaly[] }) {
  if (!items.length) return null;
  return (
    <div className="border-b border-line bg-red-50/60 px-6 py-4">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700">
        <AlertTriangle className="h-3.5 w-3.5" />
        Incident{items.length > 1 ? "s" : ""} signalé{items.length > 1 ? "s" : ""} par le chauffeur
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 text-[13px]">
            <div className="min-w-0">
              <p className="font-semibold text-ink">
                {STEP_LABEL[a.step]} · {a.type}
                <span className="ml-1.5 font-normal text-muted">{time(a.created_at)}</span>
              </p>
              {a.comment && <p className="text-muted">{a.comment}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.resolved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {a.resolved ? "Résolu" : "En cours de traitement"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnomalyBadge({ items }: { items: Anomaly[] }) {
  const open = items.filter((a) => !a.resolved).length;
  if (!open) return null;
  return (
    <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
      <AlertTriangle className="h-3 w-3" />
      {open} anomalie{open > 1 ? "s" : ""}
    </span>
  );
}

export function AnomalyList({ items, onResolve }: { items: Anomaly[]; onResolve: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {items.map((a) => (
        <div
          key={a.id}
          className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${a.resolved ? "border-line bg-paper opacity-60" : "border-red-100 bg-red-50"}`}
        >
          <div className="min-w-0 text-[12.5px]">
            <p className="font-bold text-red-800">
              {STEP_LABEL[a.step]} · {a.type}
              <span className="ml-1.5 font-medium text-red-400">{time(a.created_at)}</span>
            </p>
            {a.comment && <p className="text-red-700/80">{a.comment}</p>}
          </div>
          {a.resolved ? (
            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Traitée</span>
          ) : (
            <button
              type="button"
              onClick={() => onResolve(a.id)}
              className="shrink-0 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
            >
              Marquer traitée
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
