"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Clock, MapPin, Search, Send, Truck, Users, X, Zap } from "lucide-react";

type Course = {
  key: string;
  id: string;
  type: "commande" | "navette";
  label: string;
  clientId: string | null;
  clientName: string;
  pickup: string;
  dropoff: string;
  status: string;
  price: number | null;
  createdAt: string;
  driverId: string | null;
  stops: { address: string; contact_name?: string; contact_phone?: string }[] | null;
  delai?: string | null;
  format?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  driverAcceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  deliveryRecipient?: string | null;
  deliveryDepartment?: string | null;
  deliveryComment?: string | null;
  deliveryPhotoUrl?: string | null;
  point_progress?: Record<string, any> | null;
  clientType?: string | null;
  source?: string | null;
  updateDriver: (driverId: string | null) => Promise<void>;
  updateStatus?: (status: string) => Promise<void>;
  updateTime?: (field: string, timeStr: string) => Promise<void>;
};

type Anomaly = {
  id: string;
  mission_id: string;
  step: "enlevement" | "livraison" | "general";
  type: string;
  comment: string | null;
  resolved: boolean;
  created_at: string;
};

const ANOMALY_STEP: Record<Anomaly["step"], string> = {
  enlevement: "Enlèvement",
  livraison: "Livraison",
  general: "Général",
};

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  status: "disponible" | "en_course" | "hors_service";
  auth_id: string | null;
};

const ORDER_STATUSES = [
  "en_attente", "assigned", "driver_accepted", "confirmee",
  "en_cours", "picked_up", "livree", "annulee",
];

const formatTime = (iso: string | null | undefined) => {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
};

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
  active: "Active",
};

// Correspond aux ids stockés dans navettes.days_of_week (cf. app/dashboard/navettes/page.tsx).
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const todayId = () => WEEKDAY_IDS[new Date().getDay()];
const todayDateStr = () => new Date().toISOString().slice(0, 10);

const STATUS_LABEL: Record<Driver["status"], string> = {
  disponible: "Disponible",
  en_course: "En course",
  hors_service: "Hors service",
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={null}>
      <AdminCoursesPageInner />
    </Suspense>
  );
}

function AdminCoursesPageInner() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const clientFilter = searchParams.get("client");
  const clientFilterName = searchParams.get("name");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useQueryParam("filter", "to_dispatch");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const loadAnomalies = useCallback(async () => {
    const { data } = await supabase
      .from("mission_anomalies")
      .select("id, mission_id, step, type, comment, resolved, created_at, point_index")
      .order("created_at", { ascending: false });
    setAnomalies((data ?? []) as Anomaly[]);
  }, [supabase]);

  const resolveAnomaly = async (id: string) => {
    const { error } = await supabase.from("mission_anomalies").update({ resolved: true }).eq("id", id);
    if (error) alert("Erreur : " + error.message);
    loadAnomalies();
  };

  const load = useCallback(async () => {
    const [{ data: driversData }, { data: orders }, { data: navettes }] = await Promise.all([
      supabase.from("drivers").select("id, name, phone, vehicle, status, auth_id").order("name"),
      supabase
        .from("orders")
        .select("id, pickup_address, dropoff_address, status, driver_id, tracking_code, price_estimate, created_at, user_id, stops, point_progress, delai, format, contact_name, contact_phone, driver_accepted_at, picked_up_at, delivered_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url, client_type, source")
        .neq("status", "annulee")
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, status, driver_id, last_dispatch_date, days_of_week, created_at, user_id, stops, point_progress, driver_accepted_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url, picked_up_at, delivered_at")
        .eq("status", "active")
        .contains("days_of_week", [todayId()]),
    ]);

    setDrivers((driversData ?? []) as Driver[]);

    const orderRows = orders ?? [];
    const navetteRows = navettes ?? [];
    const userIds = [...new Set([
      ...orderRows.map((o) => o.user_id),
      ...navetteRows.map((n) => n.user_id)
    ].filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
      : { data: [] as { id: string; full_name: string | null }[] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    const driverById = new Map((driversData ?? []).map((d: Driver) => [d.id, d]));
    const driverByAuthId = new Map((driversData ?? []).filter((d: Driver) => d.auth_id).map((d: Driver) => [d.auth_id!, d]));

    const orderCourses: Course[] = orderRows.map((o: any) => ({
      key: `order-${o.id}`,
      id: o.id,
      type: "commande",
      label: o.tracking_code ?? o.id.slice(0, 8),
      clientId: o.user_id,
      clientName: (o.user_id && profileById.get(o.user_id)?.full_name) || o.contact_name || "Client particulier",
      pickup: o.pickup_address,
      dropoff: o.dropoff_address,
      status: o.status,
      price: o.price_estimate,
      createdAt: o.created_at,
      driverId: o.driver_id,
      stops: Array.isArray(o.stops) ? o.stops : null,
      delai: o.delai,
      format: o.format,
      contactName: o.contact_name,
      contactPhone: o.contact_phone,
      driverAcceptedAt: o.driver_accepted_at,
      pickedUpAt: o.picked_up_at,
      deliveredAt: o.delivered_at,
      deliveryRecipient: o.delivery_recipient,
      deliveryDepartment: o.delivery_department,
      deliveryComment: o.delivery_comment,
      deliveryPhotoUrl: o.delivery_photo_url,
      point_progress: o.point_progress,
      clientType: o.client_type,
      source: o.source,
      updateDriver: async (driverId: string | null) => {
        const driver = driverId ? driverById.get(driverId) : null;
        const authId = driver?.auth_id ?? driverId;
        if (driver && !(driver as Driver).auth_id) {
          alert(`${(driver as Driver).name} n'a pas de compte dans l'app chauffeur : il ne verrait jamais cette course.`);
          return;
        }
        const { error } = await supabase
          .from("orders")
          .update({ driver_id: authId, status: driverId ? "assigned" : "en_attente", assigned_at: driverId ? new Date().toISOString() : null })
          .eq("id", o.id);
        if (error) alert("Erreur lors de l'attribution : " + error.message);
        load();
      },
      updateStatus: async (status: string) => {
        const patch: any = { status };
        if (status === "delivered" || status === "livree") {
          patch.delivered_at = new Date().toISOString();
        } else if (status === "picked_up") {
          patch.picked_up_at = new Date().toISOString();
        }
        const { error } = await supabase.from("orders").update(patch).eq("id", o.id);
        if (error) alert("Erreur lors du changement de statut : " + error.message);
        load();
      },
      updateTime: async (field: string, timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date(o.created_at); // use order creation date as base
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        const { error } = await supabase.from("orders").update({ [field]: date.toISOString() }).eq("id", o.id);
        if (error) alert("Erreur lors de la mise à jour de l'heure : " + error.message);
        load();
      },
    }));

    // Une navette récurrente n'est considérée "dispatchée" que pour le jour où
    // son chauffeur a été confirmé (last_dispatch_date) : à la prochaine
    // occurrence programmée, elle redevient "à dispatcher" même si driver_id
    // est resté renseigné depuis la dernière fois.
    const today = todayDateStr();
    const todayStr = new Date().toDateString();
    const navetteCourses: Course[] = (navettes ?? []).map((n: any) => {
      const confirmedToday = n.driver_id && n.last_dispatch_date === today;
      const lastCompletedAt = n.point_progress?.last_completed_at;
      const completedToday = lastCompletedAt && new Date(lastCompletedAt).toDateString() === todayStr;

      return {
        key: `navette-${n.id}`,
        id: n.id,
        type: "navette",
        label: n.name,
        clientId: n.user_id,
        clientName: (n.user_id && profileById.get(n.user_id)?.full_name) || "Navette récurrente",
        pickup: n.pickup_address,
        dropoff: n.dropoff_address,
        status: confirmedToday 
          ? (completedToday ? "livree" : "assigned") 
          : "en_attente",
        price: null,
        createdAt: n.created_at,
        driverAcceptedAt: n.driver_accepted_at,
        driverId: confirmedToday ? n.driver_id : null,
        stops: Array.isArray(n.stops) ? n.stops : null,
        point_progress: n.point_progress,
        pickedUpAt: n.point_progress?.['0']?.pickedUpAt,
        deliveredAt: n.point_progress?.last_completed_at || n.delivered_at,
        deliveryRecipient: n.delivery_recipient,
        deliveryDepartment: n.delivery_department,
        deliveryComment: n.delivery_comment,
        deliveryPhotoUrl: n.delivery_photo_url,
        clientType: 'entreprise',
        updateDriver: async (driverId: string | null) => {
          const driver = driverId ? driverById.get(driverId) : null;
          const authId = driver?.auth_id ?? driverId;
          if (driver && !(driver as Driver).auth_id) {
            alert(`${(driver as Driver).name} n'a pas de compte dans l'app chauffeur : il ne verrait jamais cette navette.`);
            return;
          }
          const patch: any = { driver_id: authId, last_dispatch_date: driverId ? today : null };
          if (driverId && n.point_progress?.last_completed_at) {
            Object.assign(patch, {
              point_progress: {},
              picked_up_at: null,
              delivered_at: null,
              delivery_recipient: null,
              delivery_department: null,
              delivery_comment: null,
              delivery_photo_url: null,
            });
          }
          if (driverId) {
            const dateCode = today.replace(/-/g, "");
            const { count } = await supabase
              .from("navettes")
              .select("id", { count: "exact", head: true })
              .eq("last_dispatch_date", today);
            patch.tracking_code = `NAV-${dateCode}-${String((count ?? 0) + 1).padStart(3, "0")}`;
          }
          const { error } = await supabase.from("navettes").update(patch).eq("id", n.id);
          if (error) alert("Erreur lors de l'attribution de la navette : " + error.message);
          load();
        },
      };
    });

    setCourses([...orderCourses, ...navetteCourses]);
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();
    loadAnomalies();

    const anomalyChannel = supabase
      .channel("admin-anomalies")
      .on("postgres_changes", { event: "*", schema: "public", table: "mission_anomalies" }, () => loadAnomalies())
      .subscribe();

    // Subscribe to real-time driver status changes
    const channel = supabase
      .channel("admin-driver-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers" },
        (payload) => {
          setDrivers((prev) =>
            prev.map((d) =>
              d.id === (payload.new as any).id ? { ...d, status: (payload.new as any).status } : d
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(anomalyChannel);
    };
  }, [load, loadAnomalies, supabase]);

  const openAnomalies = (missionId: string) => anomalies.filter((a) => a.mission_id === missionId && !a.resolved);

  const pendingCount = courses.filter((c) => c.status === "en_attente" || c.status === "pending").length;
  const toDispatchCount = courses.filter((c) => c.status !== "en_attente" && c.status !== "pending" && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled" && !c.driverId).length;
  const inProgressCount = courses.filter((c) => c.status !== "en_attente" && c.status !== "pending" && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled" && c.driverId).length;
  const finishedCount = courses.filter((c) => c.status === "livree" || c.status === "delivered" || c.status === "annulee" || c.status === "cancelled").length;
  const dispatchedCount = inProgressCount;
  const dispatchRate = courses.length ? Math.round((dispatchedCount / (toDispatchCount + dispatchedCount || 1)) * 100) : 0;
  const driversDispo = drivers.filter((d) => d.status === "disponible");
  const driversOnDuty = drivers.filter((d) => d.status !== "hors_service");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (clientFilter && c.clientId !== clientFilter) return false;
      
      const isPending = c.status === "en_attente" || c.status === "pending";
      const isFinished = c.status === "livree" || c.status === "delivered" || c.status === "annulee" || c.status === "cancelled";
      const isOperational = !isPending && !isFinished;
      const needsDriver = isOperational && !c.driverId;
      const onDriverApp = isOperational && !!c.driverId;

      if (filter === "to_accept" && !isPending) return false;
      if (filter === "to_dispatch" && !needsDriver) return false;
      if (filter === "in_progress" && !onDriverApp) return false;
      if (filter === "finished" && !isFinished) return false;
      
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.pickup.toLowerCase().includes(q) ||
        c.dropoff.toLowerCase().includes(q)
      );
    });
  }, [courses, filter, search, clientFilter]);

  const firstPending = courses.find((c) => !c.driverId && c.status !== "livree" && c.status !== "annulee" && c.status !== "en_attente" && c.status !== "pending") ?? null;

  const quickAssign = (driverId: string) => {
    if (!firstPending) return;
    firstPending.updateDriver(driverId);
  };

  const sendToDriver = async (c: Course) => {
    const driverId = selection[c.key];
    if (!driverId) return;
    setSending(c.key);
    await c.updateDriver(driverId);
    setSelection((prev) => {
      const next = { ...prev };
      delete next[c.key];
      return next;
    });
    setSending(null);
  };

  const removeFromDriver = async (c: Course) => {
    setSending(c.key);
    await c.updateDriver(null);
    setSending(null);
  };

  return (
    <AdminPage
      eyebrow={<>Courses</>}
      title={<>Courses</>}
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



      {clientFilter && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <span className="text-[13px] font-semibold text-ink">
            Filtré sur le client <span className="text-accent">{clientFilterName || clientFilter}</span> — {visible.length} course{visible.length > 1 ? "s" : ""}
          </span>
          <Link href="/admin/courses" className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-muted transition-colors hover:text-ink">
            Voir toutes les courses
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1 lg:[&>:last-child:nth-child(odd)]:col-span-1">
        <StatCard icon={Clock} label="À accepter" value={String(pendingCount)} sub="En attente" accent={pendingCount > 0} />
        <StatCard icon={Zap} label="Terminées" value={String(finishedCount)} sub="Courses livrées ou annulées" />
        <StatCard icon={Truck} label="Total" value={String(courses.length)} sub="Toutes les courses" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
            {([
              ["to_accept", "À accepter", pendingCount],
              ["finished", "Terminées", finishedCount],
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
            placeholder="Rechercher code, adresse, client…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-label sm:w-[260px]"
          />
        </div>
      </div>

        <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col divide-y divide-line">
            {visible.length === 0 && (
              <div className="p-8 text-center text-[13px] font-medium text-muted">Aucune course dans ce filtre.</div>
            )}
            {visible.map((c, i) => (
              <div key={c.key} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-[11px] font-bold text-muted">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink">{c.clientName}</span>
                      {c.clientType && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.clientType === 'entreprise' ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                          {c.clientType === 'entreprise' ? 'PRO' : 'Particulier'}
                        </span>
                      )}
                      {c.source && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {c.source === 'page_publique' ? 'Page publique' : c.source === 'admin' ? 'Admin' : c.source === 'dashboard' ? 'Espace Pro' : c.source}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.type === "navette" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {c.type === "navette" ? "Navette" : c.label}
                      </span>
                      {c.delai && c.type !== "navette" && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.delai === 'flash' ? 'bg-red-50 text-red-700' : c.delai === 'urgent' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                          {c.delai === 'flash' ? 'Super Urgent 1h' : c.delai === 'urgent' ? 'Urgent 1h30' : c.delai === 'standard' ? 'Normal 3h' : c.delai}
                        </span>
                      )}
                      {c.type === "commande" && c.status !== "en_attente" && c.status !== "pending" ? (
                        <select
                          value={c.status}
                          onChange={(e) => c.updateStatus?.(e.target.value)}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase border-none outline-none focus:ring-2 focus:ring-ink ${c.status === "en_attente" || c.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}
                        >
                          {['assigned', 'picked_up', 'livree'].map((status) => (
                            <option key={status} value={status}>
                              {STATUS_DISPLAY[status] ?? status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.status === "en_attente" || c.status === "pending" ? "bg-amber-50 text-amber-700" : (c.status === "assigned" || c.status === "en_cours" || c.status === "picked_up") ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                          {c.status === "en_attente" || c.status === "pending" ? (c.type === "navette" ? "À dispatcher" : "À accepter") : STATUS_DISPLAY[c.status] ?? c.status}
                        </span>
                      )}
                      {openAnomalies(c.id).length > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                          <AlertTriangle className="h-3 w-3" />
                          {openAnomalies(c.id).length} anomalie{openAnomalies(c.id).length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {anomalies.some((a) => a.mission_id === c.id) && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {anomalies.filter((a) => a.mission_id === c.id).map((a) => (
                          <div key={a.id} className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${a.resolved ? "border-line bg-paper opacity-60" : "border-red-100 bg-red-50"}`}>
                            <div className="min-w-0 text-[12.5px]">
                              <p className="font-bold text-red-800">
                                {a.point_index != null && <span className="mr-1.5 bg-red-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-red-700">Point N°{a.point_index + 1}</span>}
                                {ANOMALY_STEP[a.step]} · {a.type}
                                <span className="ml-1.5 font-medium text-red-400">{formatTime(a.created_at)}</span>
                              </p>
                              {a.comment && <p className="text-red-700/80">{a.comment}</p>}
                            </div>
                            {a.resolved ? (
                              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Traitée</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => resolveAnomaly(a.id)}
                                className="shrink-0 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                              >
                                Marquer traitée
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                      {c.pickedUpAt || c.status === "livree" || c.status === "delivered" ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500 text-[11px] text-white font-bold">✓</span>
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      )}
                      <span>
                        {c.pickup}
                        {c.pickedUpAt && (
                          <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700 uppercase">
                            Enlevé le {new Intl.DateTimeFormat("fr-FR", { day: '2-digit', month: '2-digit' }).format(new Date(c.pickedUpAt))} à
                            <input
                              type="time"
                              className="bg-transparent font-bold text-green-700 outline-none w-[55px]"
                              value={new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(c.pickedUpAt))}
                              onChange={(e) => c.updateTime?.('picked_up_at', e.target.value)}
                            />
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Détails d'enlèvement (Navettes) */}
                    {(c.point_progress?.['0']?.pickupRecipient || c.point_progress?.['0']?.pickupDescription || c.point_progress?.['0']?.photoUrl) && (
                      <div className="ml-5 mt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {c.point_progress['0'].pickupRecipient && <p>Remis par: <strong className="text-slate-700">{c.point_progress['0'].pickupRecipient}</strong></p>}
                        {c.point_progress['0'].pickupDescription && <p>Récupéré: <strong className="text-slate-700">{c.point_progress['0'].pickupDescription}</strong></p>}
                        {c.point_progress['0'].photoUrl && (
                          <a href={c.point_progress['0'].photoUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-blue-600 font-bold underline text-[11px]">📷 Photo</a>
                        )}
                      </div>
                    )}
                    
                    {c.stops && c.stops.length > 0 && (
                      <div className="flex flex-col gap-0.5 ml-3.5 my-1">
                        {c.stops.map((stop, idx) => {
                          const address = typeof stop === 'string' ? stop : stop.address;
                          const isPickedUp = c.point_progress && c.point_progress[String(idx + 1)] && c.point_progress[String(idx + 1)].pickedUpAt;
                          const isDelivered = c.point_progress && c.point_progress[String(idx + 1)] && c.point_progress[String(idx + 1)].deliveredAt;
                          const isDone = isPickedUp || isDelivered;
                          
                          return (
                            <div key={idx} className="flex flex-col gap-0.5 text-[12px] text-muted">
                              <div className="flex items-center gap-1.5">
                                {isDone ? (
                                  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[7px] text-white font-bold">✓</span>
                                ) : (
                                  <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[7px] font-bold text-white">{idx + 1}</span>
                                )}
                                <span className={isDelivered ? "line-through opacity-60" : ""}>
                                  {address}
                                </span>
                                {isPickedUp && (
                                  <span className="rounded bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700 uppercase">Enlevé {typeof isPickedUp === "string" ? `le ${new Intl.DateTimeFormat("fr-FR", { day: '2-digit', month: '2-digit' }).format(new Date(isPickedUp))} à ${new Intl.DateTimeFormat("fr-FR", { hour: '2-digit', minute: '2-digit' }).format(new Date(isPickedUp))}` : ""}</span>
                                )}
                                {isDelivered && (
                                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase">Livré {typeof isDelivered === "string" ? `le ${new Intl.DateTimeFormat("fr-FR", { day: '2-digit', month: '2-digit' }).format(new Date(isDelivered))} à ${new Intl.DateTimeFormat("fr-FR", { hour: '2-digit', minute: '2-digit' }).format(new Date(isDelivered))}` : ""}</span>
                                )}
                              </div>
                              {/* Détails d'enlèvement (Navettes - Etapes intermédiaires) */}
                              {(c.point_progress?.[String(idx + 1)]?.pickupRecipient || c.point_progress?.[String(idx + 1)]?.pickupDescription) && (
                                <div className="ml-5 mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  {c.point_progress[String(idx + 1)].pickupRecipient && <p>Remis par: <strong className="text-slate-700">{c.point_progress[String(idx + 1)].pickupRecipient}</strong></p>}
                                  {c.point_progress[String(idx + 1)].pickupDescription && <p>Récupéré: <strong className="text-slate-700">{c.point_progress[String(idx + 1)].pickupDescription}</strong></p>}
                                  {c.point_progress[String(idx + 1)].photoUrl && (
                                    <a href={c.point_progress[String(idx + 1)].photoUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-blue-600 font-bold underline text-[11px]">📷 Photo</a>
                                  )}
                                </div>
                              )}
                              {/* Détails de livraison par étape */}
                              {(c.point_progress?.[String(idx + 1)]?.deliveryRecipient || c.point_progress?.[String(idx + 1)]?.deliveryDepartment || c.point_progress?.[String(idx + 1)]?.photoUrl) && (
                                <div className="ml-5 mt-1 text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                                  {c.point_progress[String(idx + 1)].deliveryRecipient && <p>Déposé à: <strong>{c.point_progress[String(idx + 1)].deliveryRecipient}</strong></p>}
                                  {c.point_progress[String(idx + 1)].deliveryDepartment && <p>Lieu / Service: <strong>{c.point_progress[String(idx + 1)].deliveryDepartment}</strong></p>}
                                  {c.point_progress[String(idx + 1)].deliveryComment && <p className="italic">{c.point_progress[String(idx + 1)].deliveryComment}</p>}
                                  {c.point_progress[String(idx + 1)].photoUrl && !c.point_progress[String(idx + 1)].pickupRecipient && (
                                    <a href={c.point_progress[String(idx + 1)].photoUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-blue-600 font-bold underline text-[11px]">📷 Photo</a>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                      {c.deliveredAt || c.status === "livree" || c.status === "delivered" ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] text-white font-bold">✓</span>
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      )}
                      <span className={c.deliveredAt || c.status === "livree" || c.status === "delivered" ? "line-through opacity-60" : ""}>
                        {c.dropoff}
                      </span>
                      {c.deliveredAt && (
                        <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 uppercase">
                          Livré le {new Intl.DateTimeFormat("fr-FR", { day: '2-digit', month: '2-digit' }).format(new Date(c.deliveredAt))} à
                          <input
                            type="time"
                            className="bg-transparent font-bold text-slate-500 outline-none w-[55px]"
                            value={new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(c.deliveredAt))}
                            onChange={(e) => c.updateTime?.('delivered_at', e.target.value)}
                          />
                        </span>
                      )}
                    </div>
                    {/* Détails de livraison (Courses standards) */}
                    {(c.deliveryRecipient || c.deliveryDepartment || c.deliveryComment || c.deliveryPhotoUrl) && (
                      <div className="ml-5 mt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {(c.deliveryRecipient || c.deliveryDepartment) && (
                          <p>Remis à: <strong className="text-slate-700">{c.deliveryRecipient}</strong> {c.deliveryDepartment && <span> — Lieu: <strong className="text-slate-700">{c.deliveryDepartment}</strong></span>}</p>
                        )}
                        {c.deliveryComment && <p className="mt-0.5">Commentaire: <span className="italic">{c.deliveryComment}</span></p>}
                        {c.deliveryPhotoUrl && (
                          <a href={c.deliveryPhotoUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-blue-600 font-bold underline">
                            📷 Photo de livraison
                          </a>
                        )}
                      </div>
                    )}

                    {/* Informations supplémentaires compactes si existantes */}
                    {(c.format || c.price || c.contactName) && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted">
                        {c.format && <div><span className="font-bold text-label uppercase">Format:</span> {c.format}</div>}
                        {c.price !== null && <div><span className="font-bold text-label uppercase">Prix:</span> {c.price.toFixed(2)} €</div>}
                        {c.contactName && <div><span className="font-bold text-label uppercase">Contact:</span> {c.contactName} {c.contactPhone}</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pl-11 sm:pl-0">
                  <span className="text-[12.5px] font-semibold text-muted">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(c.createdAt))}
                  </span>
                  
                  {(c.status === "en_attente" || c.status === "pending") && c.type === "commande" && c.updateStatus && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Voulez-vous vraiment refuser et annuler cette course ?")) {
                            c.updateStatus?.("annulee");
                          }
                        }}
                        className="flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-[12.5px] font-bold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          c.updateStatus?.("confirmee");
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-ink/85"
                      >
                        Accepter
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
