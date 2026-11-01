"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";

type Row = { event_date: string; path: string; visits: number; seconds: number };
type Range = 7 | 30;

/** Durée lisible : « 2 min 40 » ou « 35 s ». */
function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m} min ${String(s).padStart(2, "0")}` : `${s} s`;
}

export default function AdminTraficPage() {
  const supabase = createClient();
  const [range, setRange] = useState<Range>(7);
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - range + 1);
    const { data } = await supabase
      .from("site_time_daily")
      .select("event_date, path, visits, seconds")
      .gte("event_date", since.toISOString().slice(0, 10))
      .order("event_date", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoaded(true);
  }, [supabase, range]);

  useEffect(() => {
    load();
  }, [load]);

  // Agrégat par page sur la période : passages et temps moyen. Aucune ligne par personne.
  const byPage = useMemo(() => {
    const map = new Map<string, { path: string; visits: number; seconds: number }>();
    for (const r of rows) {
      const cur = map.get(r.path) ?? { path: r.path, visits: 0, seconds: 0 };
      cur.visits += r.visits;
      cur.seconds += r.seconds;
      map.set(r.path, cur);
    }
    return [...map.values()].sort((a, b) => b.visits - a.visits);
  }, [rows]);

  const totalVisits = byPage.reduce((sum, p) => sum + p.visits, 0);
  const totalSeconds = byPage.reduce((sum, p) => sum + p.seconds, 0);
  const avgSeconds = totalVisits ? totalSeconds / totalVisits : 0;

  return (
    <AdminPage
      eyebrow={<>Audience · Vue globale</>}
      title={<>Trafic du site</>}
      actions={
        <div className="flex gap-2">
          {([7, 30] as Range[]).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                range === d ? "bg-accent text-white" : "border border-white/20 bg-white/[0.07] text-white hover:bg-white/15"
              }`}
            >
              {d} jours
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card label="Pages consultées" value={totalVisits.toLocaleString("fr-FR")} />
        <Card label="Temps moyen par page" value={formatDuration(avgSeconds)} />
        <Card label="Temps total passé" value={formatDuration(totalSeconds)} />
      </div>

      <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="border-b border-line p-5">
          <h2 className="text-[15px] font-bold text-ink">Pages les plus vues · {range} derniers jours</h2>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted">Mesure agrégée par page et par jour : aucun identifiant de visiteur n&apos;est enregistré.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wide text-label">
                <th className="p-4">Page</th>
                <th className="p-4 text-right">Vues</th>
                <th className="p-4 text-right">Temps moyen</th>
              </tr>
            </thead>
            <tbody>
              {byPage.map((p) => (
                <tr key={p.path} className="border-b border-line last:border-0">
                  <td className="p-4 font-mono text-ink">{p.path}</td>
                  <td className="p-4 text-right font-semibold tabular-nums text-ink">{p.visits}</td>
                  <td className="p-4 text-right tabular-nums text-muted">{formatDuration(p.visits ? p.seconds / p.visits : 0)}</td>
                </tr>
              ))}
              {loaded && byPage.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-[13px] font-medium text-muted">Aucune donnée sur cette période.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 sm:p-5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.03em] text-label sm:text-[11px]">{label}</div>
      <div className="mt-2 font-mono text-[22px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums sm:text-[28px]">{value}</div>
    </div>
  );
}
