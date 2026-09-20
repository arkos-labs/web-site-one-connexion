"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { Calendar, ChevronDown, ChevronUp, Clock, Euro, MapPin, Search, ToggleLeft, ToggleRight } from "lucide-react";

type Navette = {
  id: string;
  user_id: string | null;
  name: string;
  pickup_address: string;
  dropoff_address: string;
  days_str: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  estimated_price: number | null;
  stops: { address: string; contact_name?: string; contact_phone?: string }[] | null;
  delivery_recipient: string | null;
  delivery_department: string | null;
  delivery_comment: string | null;
  delivered_at: string | null;
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "—";
}

export default function AdminNavettesPage() {
  return (
    <Suspense fallback={null}>
      <AdminNavettesPageInner />
    </Suspense>
  );
}

function AdminNavettesPageInner() {
  const supabase = createClient();
  const [navettes, setNavettes] = useState<Navette[]>([]);
  const [clients, setClients] = useState<Record<string, { full_name: string | null; company: string | null }>>({});
  const [filter, setFilter] = useQueryParam("filter", "all");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data }, { data: profiles }] = await Promise.all([
      supabase
        .from("navettes")
        .select("id, user_id, name, pickup_address, dropoff_address, days_str, start_time, end_time, status, estimated_price, stops, delivery_recipient, delivery_department, delivery_comment, delivered_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    setNavettes(data ?? []);
    setClients(Object.fromEntries((profiles ?? []).map((p) => [p.id, { full_name: p.full_name }])));
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (id: string, current: string) => {
    const { error } = await supabase.from("navettes").update({ status: current === "active" ? "inactive" : "active" }).eq("id", id);
    if (error) alert("Erreur : " + error.message);
    load();
  };

  const total = navettes.length;
  const active = navettes.filter((n) => n.status === "active");
  const inactive = navettes.filter((n) => n.status !== "active");
  const monthlyEstimate = active.reduce((sum, n) => sum + (n.estimated_price ?? 0), 0);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return navettes.filter((n) => {
      if (filter === "active" && n.status !== "active") return false;
      if (filter === "inactive" && n.status === "active") return false;
      if (!q) return true;
      const client = n.user_id ? clients[n.user_id] : null;
      return (
        n.name.toLowerCase().includes(q) ||
        n.pickup_address.toLowerCase().includes(q) ||
        n.dropoff_address.toLowerCase().includes(q) ||
        (client?.full_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [navettes, filter, search, clients]);

  return (
    <AdminPage
      eyebrow={<>Gestion de flotte · Contrats récurrents</>}
      title={<>Navettes récurrentes</>}
      actions={
        <>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15 hover:text-white"
        >
          <Clock size={15} />
          {lastRefresh ? `Actualisé à ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(lastRefresh)}` : "Mise à jour en temps réel"}
        </button>
        </>
      }
    >

      <div className="rounded-2xl border border-line bg-amber-50/60 p-4 text-[12.5px] font-medium text-amber-800">
        Ceci gère les modèles de navettes (jours, adresses, statut). Pour attribuer un chauffeur à une navette du jour, direction{" "}
        <Link href="/admin/courses" className="font-bold underline hover:text-amber-900">Courses &amp; dispatch</Link>.
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Total navettes" value={String(total)} sub="Tous statuts confondus" />
        <StatCard icon={ToggleRight} label="Actives" value={String(active.length)} sub={total ? `${Math.round((active.length / total) * 100)}% du parc` : undefined} accent={active.length > 0} />
        <StatCard icon={ToggleLeft} label="Inactives" value={String(inactive.length)} sub="En pause" />
        <StatCard icon={Euro} label="Estimation mensuelle" value={`${monthlyEstimate.toFixed(2)} €`} sub="Somme des navettes actives" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "Toutes", total],
            ["active", "Actives", active.length],
            ["inactive", "Inactives", inactive.length],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                filter === key ? "bg-accent text-white" : "border border-line bg-white text-muted hover:text-ink"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${filter === key ? "bg-white/20" : "bg-paper"}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher navette, client, adresse…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-label sm:w-[260px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((n) => {
          const client = n.user_id ? clients[n.user_id] : null;
          const clientName = client?.full_name || "Client particulier";
          const stops = Array.isArray(n.stops) ? n.stops : [];
          const totalPoints = 2 + stops.length;
          const isOpen = expanded === n.id;
          return (
            <div
              key={n.id}
              className={`relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 ${
                n.status === "active" ? "before:bg-green-500" : "before:bg-line"
              }`}
            >
              <div className="flex flex-col gap-3 p-4 pl-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
                    {initialsOf(clientName)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink">{n.name}</span>
                      {n.user_id ? (
                        <Link href={`/admin/clients/${n.user_id}`} className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent hover:bg-accent/20">
                          {clientName}
                        </Link>
                      ) : (
                        <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-muted">Client inconnu</span>
                      )}
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        PRO
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        Navette
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                        {totalPoints} points
                      </span>
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted">{n.pickup_address} → {n.dropoff_address}</div>
                    <div className="mt-0.5 text-[12.5px] text-muted">
                      {n.days_str || "Jours non définis"}
                      {n.start_time && ` · ${n.start_time.slice(0, 5)}${n.end_time ? `–${n.end_time.slice(0, 5)}` : ""}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-14 sm:pl-0">
                  <div className="text-right">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-label">Estimé</div>
                    <div className="text-[14px] font-bold text-ink">{(n.estimated_price ?? 0).toFixed(2)} €</div>
                  </div>
                  <button
                    onClick={() => toggleStatus(n.id, n.status)}
                    className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition-colors ${
                      n.status === "active"
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : n.status === "en_attente"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {n.status === "active" ? "Active" : n.status === "en_attente" ? "À confirmer → Activer" : "Inactive"}
                  </button>
                  {totalPoints > 2 && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : n.id)}
                      className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-ink/20 hover:text-ink"
                    >
                      <MapPin size={13} />
                      Points
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>
              </div>
              {isOpen && stops.length > 0 && (
                <div className="border-t border-line bg-slate-50/60 px-6 py-4">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-label mb-3">Itinéraire ({totalPoints} points)</div>
                  <div className="relative pl-5">
                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-line" />
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500 -ml-[3px]">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-ink">{n.pickup_address}</div>
                        <div className="text-[11px] text-muted">Départ</div>
                      </div>
                    </div>
                    {stops.map((stop, i) => (
                      <div key={i} className="flex items-start gap-3 mb-2.5">
                        <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 -ml-[3px]">
                          <span className="text-[8px] font-bold text-white">{i + 1}</span>
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-ink">{stop.address}</div>
                          {stop.contact_name && (
                            <div className="text-[11px] text-muted">
                              {stop.contact_name}{stop.contact_phone ? ` · ${stop.contact_phone}` : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 -ml-[3px]">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-ink">{n.dropoff_address}</div>
                        <div className="text-[11px] text-muted">Arrivée</div>
                      </div>
                    </div>
                  </div>

                  {/* Dernière livraison */}
                  {(n.delivery_recipient || n.delivery_department) && (
                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-700">
                      <p className="font-bold text-[11px] uppercase tracking-widest text-emerald-500 mb-1">Dernière livraison {n.delivered_at && `— ${new Date(n.delivered_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}</p>
                      {n.delivery_recipient && <p>Déposé à: <strong>{n.delivery_recipient}</strong></p>}
                      {n.delivery_department && <p>Lieu / Service: <strong>{n.delivery_department}</strong></p>}
                      {n.delivery_comment && <p className="mt-0.5 italic">{n.delivery_comment}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-[13px] font-medium text-muted">
            Aucune navette dans ce filtre.
          </div>
        )}
      </div>
    </AdminPage>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3.5 sm:p-5 ${accent ? "border-accent/30 bg-accent/[0.04]" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`min-w-0 font-mono text-[10px] leading-tight sm:text-[11px] font-semibold tracking-[0.03em] uppercase ${accent ? "text-accent" : "text-label"}`}>{label}</div>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${accent ? "bg-accent/10 text-accent" : "bg-paper text-muted"}`}>
          <Icon size={15} strokeWidth={2.25} />
        </div>
      </div>
      <div className={`mt-2 font-mono text-[22px] sm:text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </div>
      {sub && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] font-medium leading-snug text-muted sm:text-[12px]">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
          {sub}
        </div>
      )}
    </div>
  );
}
