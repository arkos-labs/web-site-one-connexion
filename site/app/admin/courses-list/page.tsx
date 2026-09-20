"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { Check, Clock, Search, Truck, X, Zap, Plus } from "lucide-react";
import { CreateOrderModal } from "@/components/admin/CreateOrderModal";

const STATUS_DISPLAY: Record<string, string> = {
  en_attente: "En attente",
  assigned: "Assignée",
  driver_accepted: "Acceptée chauffeur",
  confirmee: "Confirmée",
  in_progress: "En cours",
  en_cours: "En cours",
  picked_up: "Enlevée",
  delivered: "Livrée",
  livree: "Livrée",
  cancelled: "Annulée",
  annulee: "Annulée",
  pending: "En attente",
};

const ORDER_STATUSES = [
  "en_attente", "assigned", "driver_accepted", "confirmee",
  "in_progress", "en_cours", "picked_up", "delivered", "livree",
  "cancelled", "annulee",
];

const TERMINAL_STATUSES = ["delivered", "livree", "cancelled", "annulee"];

type Order = {
  id: string;
  tracking_code: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price_estimate: number | null;
  created_at: string;
  user_id: string | null;
  driver_id: string | null;
  format: string | null;
  delai: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  stops: { address: string; contact_name?: string; contact_phone?: string }[] | null;
  point_progress: Record<string, { pickedUpAt?: string; deliveredAt?: string }> | null;
};

export default function CoursesListPage() {
  return (
    <Suspense fallback={null}>
      <CoursesListInner />
    </Suspense>
  );
}

function CoursesListInner() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { full_name: string | null; company: string | null }>>(new Map());
  const [drivers, setDrivers] = useState<Map<string, string>>(new Map());
  const [filter, setFilter] = useQueryParam("filter", "a_accepter");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const load = useCallback(async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at, user_id, driver_id, format, delai, contact_name, contact_phone, stops, point_progress")
      .order("created_at", { ascending: false });

    const rows = (ordersData ?? []) as Order[];
    setOrders(rows);

    const userIds = [...new Set(rows.map((o) => o.user_id).filter(Boolean))];
    if (userIds.length) {
      const { data } = await supabase.from("profiles").select("id, full_name, company").in("id", userIds);
      setProfiles(new Map((data ?? []).map((p) => [p.id, p])));
    }

    const { data: driversData } = await supabase.from("drivers").select("id, name, auth_id");
    const map = new Map<string, string>();
    (driversData ?? []).forEach((d: { id: string; name: string; auth_id: string | null }) => {
      map.set(d.id, d.name);
      if (d.auth_id) map.set(d.auth_id, d.name);
    });
    setDrivers(map);

    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const acceptOrder = async (id: string) => {
    await supabase.from("orders").update({ status: "confirmee" }).eq("id", id);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const aAccepterCount = orders.filter((o) => o.status === "en_attente").length;
  const termineesCount = orders.filter((o) => TERMINAL_STATUSES.includes(o.status)).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "a_accepter" && o.status !== "en_attente") return false;
      if (filter === "terminees" && !TERMINAL_STATUSES.includes(o.status)) return false;
      if (!q) return true;
      return (
        (o.tracking_code ?? "").toLowerCase().includes(q) ||
        o.pickup_address.toLowerCase().includes(q) ||
        o.dropoff_address.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const clientName = (userId: string | null) => {
    if (!userId) return "Client particulier";
    const p = profiles.get(userId);
    return p?.company || p?.full_name || "Client particulier";
  };

  return (
    <AdminPage
      eyebrow={<>Courses · Gestion des commandes</>}
      title={<>Courses</>}
      actions={
        <>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark">
          <Plus size={16} /> Nouvelle commande
        </button>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15 hover:text-white">
          <Clock size={15} />
          {lastRefresh ? `Actualisé à ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(lastRefresh)}` : "Actualiser"}
        </button>
        </>
      }
    >
      <CreateOrderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={load}
        profiles={Array.from(profiles.values()) as any[]}
        drivers={Array.from(drivers.entries()).map(([id, name]) => ({ id, name }))}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            ["a_accepter", "À accepter", aAccepterCount],
            ["terminees", "Terminées", termineesCount],
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
            placeholder="Rechercher code, adresse…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-label sm:w-[260px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visible.length === 0 && (
          <div className="rounded-2xl border border-line bg-white p-8 text-center text-[14px] text-muted">
            Aucune course dans ce filtre.
          </div>
        )}
        {visible.map((o) => {
          const isOpen = selectedOrder === o.id;
          const driverName = o.driver_id ? drivers.get(o.driver_id) : null;
          return (
            <div
              key={o.id}
              className="overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-sm cursor-pointer"
              onClick={() => setSelectedOrder(isOpen ? null : o.id)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${o.delai === "flash" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>
                  <Zap size={14} strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[13px] font-bold text-ink">{o.tracking_code ?? o.id.slice(0, 8)}</span>
                    <span className={`rounded-full px-1.5 py-px text-[11px] font-bold ${TERMINAL_STATUSES.includes(o.status) ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {STATUS_DISPLAY[o.status] ?? o.status}
                    </span>
                    {o.delai === "flash" && <span className="rounded-full bg-red-50 px-1.5 py-px text-[11px] font-bold text-red-600">Flash</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                    <span>{clientName(o.user_id)}</span>
                    <span className="text-line">•</span>
                    <span>{new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(o.created_at))}</span>
                    {driverName && (
                      <>
                        <span className="text-line">•</span>
                        <span className="font-semibold text-green-700">{driverName}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex flex-col gap-px text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      <span className="text-ink">{o.pickup_address}</span>
                    </div>
                    {o.stops && o.stops.map((stop, i) => {
                      const prog = o.point_progress?.[String(i)];
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          <span className="text-ink">{stop.address}</span>
                          {prog?.deliveredAt ? <span className="rounded bg-green-100 px-1 text-[11px] font-bold text-green-700">Livré</span> : prog?.pickedUpAt ? <span className="rounded bg-blue-100 px-1 text-[11px] font-bold text-blue-700">Enlevé</span> : null}
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span className="text-ink">{o.dropoff_address}</span>
                      {["delivered", "livree"].includes(o.status) && <span className="rounded bg-green-100 px-1 text-[11px] font-bold text-green-700">Livré</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {o.price_estimate !== null && <span className="text-[15px] font-bold text-ink">{o.price_estimate.toFixed(2)} €</span>}
                  {o.status === "en_attente" && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => acceptOrder(o.id)} className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-green-700">
                        <Check size={12} /> Accepter
                      </button>
                      <button onClick={() => updateStatus(o.id, "annulee")} className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50">
                        <X size={12} /> Refuser
                      </button>
                    </div>
                  )}
                  {TERMINAL_STATUSES.includes(o.status) && (
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-lg border border-line px-2 py-1 text-[11px] font-medium text-ink">
                      {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{STATUS_DISPLAY[s] ?? s}</option>))}
                    </select>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-line px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                    {o.format && <DetailRow label="Format" value={o.format} />}
                    {o.delai && <DetailRow label="Délai" value={o.delai} />}
                    {o.price_estimate !== null && <DetailRow label="Prix" value={`${o.price_estimate.toFixed(2)} €`} />}
                    <DetailRow label="Créée" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(o.created_at))} />
                    {o.contact_name && <DetailRow label="Contact" value={o.contact_name} />}
                    {o.contact_phone && <DetailRow label="Tél." value={o.contact_phone} />}
                    {driverName && <DetailRow label="Chauffeur" value={driverName} />}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminPage>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-label">{label}</div>
      <div className="text-[12px] font-semibold text-ink">{value}</div>
    </div>
  );
}
