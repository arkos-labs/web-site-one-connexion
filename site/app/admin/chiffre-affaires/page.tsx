"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { Calendar, Download } from "lucide-react";

type Period = "jour" | "semaine" | "mois" | "annee";

type OrderRow = {
  price_estimate: number | null;
  status: string;
  created_at: string;
  tracking_code: string | null;
  pickup_address: string;
  dropoff_address: string;
  user_id: string | null;
};

type NavetteRow = {
  name: string;
  estimated_price: number | null;
  status: string;
  created_at: string;
  last_dispatch_date: string | null;
  pickup_address: string;
  dropoff_address: string;
  user_id: string | null;
};

type Billable = {
  key: string;
  type: "commande" | "navette";
  date: string;
  label: string;
  client: string;
  route: string;
  status: string;
  amount: number;
};

function periodStart(period: Period, ref = new Date()): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  if (period === "semaine") d.setDate(d.getDate() - d.getDay());
  if (period === "mois") d.setDate(1);
  if (period === "annee") { d.setMonth(0); d.setDate(1); }
  return d;
}

function previousPeriodRange(period: Period): [Date, Date] {
  const end = periodStart(period);
  const start = new Date(end);
  if (period === "jour") start.setDate(start.getDate() - 1);
  if (period === "semaine") start.setDate(start.getDate() - 7);
  if (period === "mois") start.setMonth(start.getMonth() - 1);
  if (period === "annee") start.setFullYear(start.getFullYear() - 1);
  return [start, end];
}

const PERIOD_LABEL: Record<Period, string> = {
  jour: "Aujourd'hui",
  semaine: "Cette semaine",
  mois: "Ce mois",
  annee: "Cette année",
};

function toCsvValue(v: string | number | null) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const VALID_PERIODS: Period[] = ["jour", "semaine", "mois", "annee"];

export default function AdminChiffreAffairesPage() {
  return (
    <Suspense fallback={null}>
      <AdminChiffreAffairesPageInner />
    </Suspense>
  );
}

function AdminChiffreAffairesPageInner() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPeriod = searchParams.get("periode");
  const period: Period = VALID_PERIODS.includes(rawPeriod as Period) ? (rawPeriod as Period) : "mois";
  const setPeriod = (next: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "mois") params.delete("periode");
    else params.set("periode", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const [billables, setBillables] = useState<Billable[]>([]);
  const [navettesEstimate, setNavettesEstimate] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const [{ data: orderRows }, { data: navetteRows }, { data: profileRows }, { data: clientRows }] = await Promise.all([
      supabase
        .from("orders")
        .select("price_estimate, status, created_at, tracking_code, pickup_address, dropoff_address, user_id")
        .neq("status", "annulee")
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("name, estimated_price, status, created_at, last_dispatch_date, pickup_address, dropoff_address, user_id")
        .eq("status", "active"),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("clients").select("id, company_name"),
    ]);

    const companyById = new Map((clientRows ?? []).map((c) => [c.id, c.company_name]));
    const profileById: Record<string, { full_name: string | null; company: string | null }> = Object.fromEntries(
      (profileRows ?? []).map((p) => [p.id, { full_name: p.full_name, company: companyById.get(p.id) || null }])
    );
    const clientOf = (userId: string | null) => {
      const p = userId ? profileById[userId] : null;
      return p?.company || p?.full_name || "Client particulier";
    };

    const orderBillables: Billable[] = ((orderRows ?? []) as OrderRow[]).map((o, i) => ({
      key: `order-${i}`,
      type: "commande",
      date: o.created_at,
      label: o.tracking_code ?? "—",
      client: clientOf(o.user_id),
      route: `${o.pickup_address} → ${o.dropoff_address}`,
      status: o.status,
      amount: o.price_estimate ?? 0,
    }));

    // Une navette récurrente n'a qu'un seul enregistrement (pas d'historique
    // par occurrence facturée) : on la représente comme une seule ligne
    // facturable, datée de sa dernière confirmation de dispatch (ou de sa
    // création si elle n'a encore jamais été dispatchée).
    const navetteBillables: Billable[] = ((navetteRows ?? []) as NavetteRow[]).map((n, i) => ({
      key: `navette-${i}`,
      type: "navette",
      date: n.last_dispatch_date ?? n.created_at,
      label: n.name,
      client: clientOf(n.user_id),
      route: `${n.pickup_address} → ${n.dropoff_address}`,
      status: "active",
      amount: n.estimated_price ?? 0,
    }));

    setBillables(
      [...orderBillables, ...navetteBillables].sort((a, b) => (a.date < b.date ? 1 : -1))
    );
    setNavettesEstimate(navetteBillables.reduce((sum, n) => sum + n.amount, 0));
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const revenueSince = useCallback(
    (start: Date, end?: Date) =>
      billables
        .filter((b) => {
          const d = new Date(b.date);
          return d >= start && (!end || d < end);
        })
        .reduce((sum, b) => sum + b.amount, 0),
    [billables]
  );

  const countSince = useCallback(
    (start: Date, end?: Date) =>
      billables.filter((b) => {
        const d = new Date(b.date);
        return d >= start && (!end || d < end);
      }).length,
    [billables]
  );

  const current = revenueSince(periodStart(period));
  const [prevStart, prevEnd] = previousPeriodRange(period);
  const previous = revenueSince(prevStart, prevEnd);
  const variation = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  const ordersTotal = billables.filter((b) => b.type === "commande").reduce((sum, b) => sum + b.amount, 0);
  const totalWithNavettes = ordersTotal + navettesEstimate;
  const navettesShare = totalWithNavettes ? Math.round((navettesEstimate / totalWithNavettes) * 100) : 0;
  const ordersShare = 100 - navettesShare;

  // 6 derniers mois glissants : chaque ligne facturable (course ou navette)
  // est comptée sur le mois de sa date réelle.
  const monthlySeries = useMemo(() => {
    const months: { key: string; label: string; commandes: number; navettes: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      months.push({ key, label, commandes: 0, navettes: 0 });
    }
    billables.forEach((b) => {
      const d = new Date(b.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((mo) => mo.key === key);
      if (!m) return;
      if (b.type === "navette") m.navettes += b.amount;
      else m.commandes += b.amount;
    });
    return months;
  }, [billables]);

  const maxMonthly = Math.max(1, ...monthlySeries.map((m) => m.commandes + m.navettes));

  const exportCsv = () => {
    const start = periodStart(period);
    const rows = billables.filter((b) => new Date(b.date) >= start);
    const header = ["Date", "Type", "Référence", "Client", "Trajet", "Statut", "Montant TTC"];
    const lines = rows.map((b) =>
      [
        new Date(b.date).toLocaleString("fr-FR"),
        b.type === "navette" ? "Navette" : "Course",
        b.label,
        b.client,
        b.route.replace(" → ", " -> "),
        b.status,
        b.amount.toFixed(2),
      ]
        .map(toCsvValue)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chiffre-affaires-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPage
      eyebrow={<>Finances &amp; facturation · Suivi du revenu</>}
      title={<>Chiffre d&apos;affaires</>}
      actions={
        <>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15 hover:text-white"
          >
            <Calendar size={15} />
            {lastRefresh ? `Actualisé à ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(lastRefresh)}` : "Mise à jour en temps réel"}
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark hover:text-white"
          >
            <Download size={15} />
            Exporter ({PERIOD_LABEL[period].toLowerCase()})
          </button>
        </>
      }
    >

      <div className="flex flex-wrap gap-2">
        {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              period === p ? "bg-accent text-white" : "border border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1">
        <StatCard
          label={PERIOD_LABEL[period]}
          value={`${current.toFixed(2)} €`}
          sub={`${countSince(periodStart(period))} ligne${countSince(periodStart(period)) > 1 ? "s" : ""} facturable${countSince(periodStart(period)) > 1 ? "s" : ""}`}
          accent
        />
        <StatCard
          label="Période précédente"
          value={`${previous.toFixed(2)} €`}
          sub={variation !== null ? `${variation >= 0 ? "+" : ""}${variation}% vs actuelle` : "Pas de données comparables"}
        />
        <StatCard label="Cumul historique" value={`${totalWithNavettes.toFixed(2)} €`} sub="Courses + navettes actives" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-[15px] font-bold text-ink">Évolution du chiffre d&apos;affaires</h2>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted">Comparatif navettes récurrentes vs courses ponctuelles, 6 derniers mois.</p>
          <div className="mt-3 flex items-center gap-4 text-[11.5px] font-semibold text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Courses ponctuelles</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Navettes récurrentes</span>
          </div>
          <div className="mt-4 flex h-[220px] items-end gap-3">
            {monthlySeries.map((m) => {
              const total = m.commandes + m.navettes;
              return (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-ink">{total > 0 ? `${total.toFixed(0)} €` : ""}</span>
                  <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-md" style={{ height: "170px" }}>
                    {m.navettes > 0 && <div className="w-full bg-blue-500" style={{ height: `${(m.navettes / maxMonthly) * 170}px` }} />}
                    {m.commandes > 0 && <div className="w-full bg-accent" style={{ height: `${(m.commandes / maxMonthly) * 170}px` }} />}
                    {total === 0 && <div className="w-full bg-paper" style={{ height: "4px" }} />}
                  </div>
                  <span className="text-[11px] font-semibold capitalize text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-ink">Répartition du chiffre d&apos;affaires</h3>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">{totalWithNavettes.toFixed(0)} €</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {(
                [
                  ["Navettes récurrentes", navettesShare, navettesEstimate, "bg-blue-500"],
                  ["Courses ponctuelles", ordersShare, ordersTotal, "bg-accent"],
                ] as const
              ).map(([label, pct, amount, dot]) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[12.5px] font-semibold text-muted">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      {label}
                    </span>
                    <span className="text-ink">{amount.toFixed(0)} € ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
                    <div className={`h-full rounded-full ${dot}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-ink">Repères financiers</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] font-medium text-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Les montants excluent systématiquement les courses annulées.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Chaque navette active compte pour une ligne, datée de sa dernière confirmation de dispatch.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Le suivi des règlements n&apos;est pas encore connecté à un moyen de paiement.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="border-b border-line p-5">
          <h2 className="text-[15px] font-bold text-ink">Dernières opérations facturables</h2>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted">Courses et navettes actives, montants non annulés.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wide text-label">
                <th className="p-4">Date / Réf.</th>
                <th className="p-4">Client</th>
                <th className="p-4">Trajet</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {billables.slice(0, 10).map((b) => (
                <tr key={b.key} className="border-b border-line last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${b.type === "navette" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {b.type === "navette" ? "Navette" : "Course"}
                      </span>
                      <span className="font-mono font-bold text-ink">{b.label}</span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-muted">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(b.date))}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-ink">{b.client}</td>
                  <td className="p-4 text-muted">{b.route}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-muted">{b.status}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-ink">{b.amount.toFixed(2)} €</td>
                </tr>
              ))}
              {billables.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-[13px] font-medium text-muted">Aucune opération facturable pour l&apos;instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {billables.length > 10 && (
          <div className="border-t border-line p-4 text-center text-[12.5px] font-medium text-muted">
            Affichage de 10 sur {billables.length} opérations — affinez avec l&apos;export CSV pour le détail complet.
          </div>
        )}
      </div>
    </AdminPage>
  );
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3.5 sm:p-5 ${accent ? "border-accent/30 bg-accent/[0.04]" : "border-line bg-white"}`}>
      <div className={`font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.03em] uppercase ${accent ? "text-accent" : "text-label"}`}>{label}</div>
      <div className={`mt-2 font-mono text-[22px] sm:text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums ${accent ? "text-accent" : "text-ink"}`}>{value}</div>
      {sub && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] font-medium leading-snug text-muted sm:text-[12px]">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
          {sub}
        </div>
      )}
    </div>
  );
}
