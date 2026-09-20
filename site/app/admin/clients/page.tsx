"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { Briefcase, Building2, Calendar, Clock, Euro, Search, ShoppingBag, Users } from "lucide-react";

type ClientRow = {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  revenue: number;
  activeNavettes: number;
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "—";
}

export default function AdminClientsPage() {
  return (
    <Suspense fallback={null}>
      <AdminClientsPageInner />
    </Suspense>
  );
}

function AdminClientsPageInner() {
  const supabase = createClient();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [filter, setFilter] = useQueryParam("filter", "all");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ data: profiles }, { data: orders }, { data: navettes }, monthOrders] = await Promise.all([
      supabase.from("profiles").select("id, full_name, company, phone, created_at").eq("role", "client").order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, price_estimate, status"),
      supabase.from("navettes").select("user_id").eq("status", "active"),
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()).neq("status", "annulee"),
    ]);

    const rows: ClientRow[] = (profiles ?? []).map((p) => {
      const own = (orders ?? []).filter((o) => o.user_id === p.id);
      const revenue = own.filter((o) => o.status !== "annulee").reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);
      const activeNavettes = (navettes ?? []).filter((n) => n.user_id === p.id).length;
      return { id: p.id, full_name: p.full_name, company: p.company, phone: p.phone, createdAt: p.created_at, ordersCount: own.length, revenue, activeNavettes };
    });

    setClients(rows);
    setOrdersThisMonth(monthOrders.count ?? 0);
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const total = clients.length;
  const withCompany = clients.filter((c) => c.company);
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const newThisMonth = clients.filter((c) => {
    const created = new Date(c.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "company" && !c.company) return false;
      if (filter === "particulier" && c.company) return false;
      if (!q) return true;
      return (c.full_name ?? "").toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(q);
    });
  }, [clients, filter, search]);

  return (
    <AdminPage
      eyebrow={<>Gestion commerciale · Portefeuille &amp; facturation</>}
      title={<>Clients</>}
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total clients" value={String(total)} sub={newThisMonth > 0 ? `+${newThisMonth} ce mois-ci` : "Portefeuille actif"} />
        <StatCard icon={ShoppingBag} label="Commandes ce mois" value={String(ordersThisMonth)} sub="Toutes commandes non annulées" />
        <StatCard icon={Euro} label="CA clients généré" value={`${totalRevenue.toFixed(2)} €`} sub="Cumul historique" accent />
        <StatCard icon={Building2} label="Comptes entreprise" value={String(withCompany.length)} sub={total ? `${Math.round((withCompany.length / total) * 100)}% du portefeuille` : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["all", "Tous", total],
                ["company", "Entreprises", withCompany.length],
                ["particulier", "Particuliers", total - withCompany.length],
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
                placeholder="Rechercher client, société…"
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-label sm:w-[240px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visible.map((c) => (
              <div
                key={c.id}
                className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-white p-4 pl-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 sm:flex-row sm:items-center sm:justify-between ${
                  c.company ? "before:bg-accent" : "before:bg-blue-500"
                }`}
              >
                <Link href={`/admin/clients/${c.id}`} className="group flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
                    {initialsOf(c.full_name ?? "")}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink group-hover:underline">{c.full_name || "Client sans nom"}</span>
                      {c.company ? (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <Briefcase size={10} /> {c.company}
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">Particulier</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-muted">{c.phone || "Téléphone non renseigné"}</div>
                  </div>
                </Link>
                <div className="flex items-center gap-5 pl-14 sm:pl-0">
                  <div className="text-right">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-label">Commandes</div>
                    <div className="text-[14px] font-bold text-ink">{c.ordersCount}</div>
                    {c.activeNavettes > 0 && (
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-bold text-green-700">
                        <Calendar size={10} /> {c.activeNavettes} navette{c.activeNavettes > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-label">CA généré</div>
                    <div className="text-[14px] font-bold text-ink">{c.revenue.toFixed(2)} €</div>
                  </div>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="flex items-center justify-center whitespace-nowrap rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-ink/85"
                  >
                    Voir la fiche
                  </Link>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-[13px] font-medium text-muted">
                Aucun client dans ce filtre.
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-ink">Répartition du portefeuille</h3>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">{total} compte{total > 1 ? "s" : ""}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {(
                [
                  ["Entreprises & corporate", withCompany.length, "bg-accent"],
                  ["Particuliers", total - withCompany.length, "bg-blue-500"],
                ] as const
              ).map(([label, count, dot]) => {
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[12.5px] font-semibold text-muted">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                        {label}
                      </span>
                      <span className="text-ink">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
                      <div className={`h-full rounded-full ${dot}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-ink">Repères commerciaux</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] font-medium text-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Les nouveaux comptes entreprise s&apos;inscrivent depuis la page publique.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Vérifiez le téléphone renseigné avant toute course urgente.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Le CA généré exclut les courses annulées.
              </li>
            </ul>
          </div>
        </div>
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
