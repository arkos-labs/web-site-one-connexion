"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { AnomalyBadge, AnomalyList, useMissionAnomalies } from "@/components/admin/mission-anomalies";
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
  // Navette active dont le planning (days_of_week) ne couvre pas aujourd'hui
  offPlan?: boolean;
  stops: { address: string; contact_name?: string; contact_phone?: string }[] | null;
  point_progress?: Record<string, any> | null;
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
  updateDriver: (driverId: string | null) => Promise<void>;
  updateStatus?: (status: string) => Promise<void>;
  updateTime?: (field: 'picked_up_at' | 'delivered_at', timeStr: string) => Promise<void>;
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
  const [unplanned, setUnplanned] = useState<Course[]>([]);
  const [filter, setFilter] = useQueryParam("filter", "to_dispatch");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const anomalies = useMissionAnomalies(supabase, "dispatch-anomalies");

  const load = useCallback(async () => {
    const [{ data: driversData }, { data: orders }, { data: navettes }] = await Promise.all([
      supabase.from("drivers").select("id, name, phone, vehicle, status, auth_id").order("name"),
      supabase
        .from("orders")
        .select("id, pickup_address, dropoff_address, status, driver_id, tracking_code, price_estimate, created_at, user_id, stops, point_progress, delai, format, contact_name, contact_phone, driver_accepted_at, picked_up_at, delivered_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url")
        .neq("status", "annulee")
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, status, driver_id, last_dispatch_date, days_of_week, created_at, user_id, stops, point_progress, picked_up_at, delivered_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url")
        .eq("status", "active"),
    ]);

    setDrivers((driversData ?? []) as Driver[]);

    const orderRows = orders ?? [];
    const userIds = [...new Set(orderRows.map((o) => o.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, company").in("id", userIds)
      : { data: [] as { id: string; full_name: string | null; company: string | null }[] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    const driverById = new Map((driversData ?? []).map((d: Driver) => [d.id, d]));
    const driverByAuthId = new Map((driversData ?? []).filter((d: Driver) => d.auth_id).map((d: Driver) => [d.auth_id!, d]));

    const orderCourses: Course[] = orderRows.map((o) => ({
      key: `order-${o.id}`,
      id: o.id,
      type: "commande",
      label: o.tracking_code ?? o.id.slice(0, 8),
      clientId: o.user_id,
      clientName: (o.user_id && (profileById.get(o.user_id)?.company || profileById.get(o.user_id)?.full_name)) || "Client particulier",
      pickup: o.pickup_address,
      dropoff: o.dropoff_address,
      status: o.status,
      price: o.price_estimate,
      createdAt: o.created_at,
      driverId: o.driver_id,
      stops: Array.isArray(o.stops) ? o.stops : null,
      point_progress: o.point_progress,
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
      updateDriver: async (driverId) => {
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
      updateStatus: async (status) => {
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
      updateTime: async (field, timeStr) => {
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
    const navetteCourses: Course[] = (navettes ?? []).map((n) => {
      const confirmedToday = n.driver_id && n.last_dispatch_date === today;
      const lastCompletedAt = n.point_progress?.last_completed_at;
      const completedToday = lastCompletedAt && new Date(lastCompletedAt).toDateString() === todayStr;
      const scheduledToday = Array.isArray(n.days_of_week) && n.days_of_week.includes(todayId());

      return {
        key: `navette-${n.id}`,
        offPlan: !scheduledToday,
        id: n.id,
        type: "navette",
        label: n.name,
        clientId: n.user_id,
        clientName: "Navette récurrente",
        pickup: n.pickup_address,
        dropoff: n.dropoff_address,
        status: completedToday ? "livree" : n.status,
        price: null,
        createdAt: n.created_at,
        driverAcceptedAt: null,
        driverId: confirmedToday ? n.driver_id : null,
        stops: Array.isArray(n.stops) ? n.stops : null,
        point_progress: n.point_progress,
        pickedUpAt: n.picked_up_at ?? n.point_progress?.['0']?.pickedUpAt,
        deliveredAt: n.delivered_at ?? n.point_progress?.last_completed_at,
        deliveryRecipient: n.delivery_recipient,
        deliveryDepartment: n.delivery_department,
        deliveryComment: n.delivery_comment,
        deliveryPhotoUrl: n.delivery_photo_url,
        updateDriver: async (driverId) => {
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

    // Une navette hors planning n'entre dans les listes/compteurs habituels qu'une fois
    // dispatchée aujourd'hui ; sinon elle reste dans le filtre dédié "Hors planning".
    const isUnplanned = (c: Course) => c.offPlan && !c.driverId;
    setCourses([...orderCourses, ...navetteCourses.filter((c) => !isUnplanned(c))]);
    setUnplanned(navetteCourses.filter(isUnplanned));
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();

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
    };
  }, [load, supabase]);

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
    return (filter === "unplanned" ? unplanned : courses).filter((c) => {
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
  }, [courses, unplanned, filter, search, clientFilter]);

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
      eyebrow={<>Courses &amp; dispatch · Attribution en direct</>}
      title={<>Courses &amp; dispatch</>}
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

      {pendingCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle size={17} className="text-amber-700" strokeWidth={2.25} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-amber-900">
                {pendingCount} course{pendingCount > 1 ? "s" : ""} requi{pendingCount > 1 ? "èrent" : "ert"} une affectation
              </div>
              <div className="text-[12.5px] font-medium text-amber-700">Aucun chauffeur confirmé sur ces missions pour l&apos;instant.</div>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="En attente" value={String(pendingCount)} sub={pendingCount > 0 ? "Priorité haute requise" : "Tout est dispatché"} accent={pendingCount > 0} />
        <StatCard icon={Users} label="Chauffeurs dispo" value={String(driversDispo.length)} sub={driversDispo[0]?.name} />
        <StatCard icon={Zap} label="Taux d'attribution" value={`${dispatchRate}%`} sub={`${dispatchedCount}/${courses.length || 0} dispatchées`} />
        <StatCard icon={Truck} label="Courses & navettes" value={String(courses.length)} sub="Créneau en cours" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
            {([
              ["to_dispatch", "À dispatcher", toDispatchCount],
              ["in_progress", "En cours", inProgressCount],
              ["finished", "Terminées", finishedCount],
              ["unplanned", "Hors planning", unplanned.length],
            ] as const).filter(([key, , count]) => key !== "unplanned" || count > 0 || filter === key).map(([key, label, count]) => (
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
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
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.type === "navette" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {c.type === "navette" ? "Navette" : c.label}
                      </span>
                      {(c.delai === 'urgent' || c.delai === 'flash') && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Flash</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.driverId ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {c.driverId ? `Dispatchée${c.driverAcceptedAt ? ` à ${formatTime(c.driverAcceptedAt)}` : ""}` : "À dispatcher"}
                      </span>
                      {c.offPlan && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600" title="Le planning de cette navette ne couvre pas aujourd'hui">
                          Hors planning
                        </span>
                      )}
                      <AnomalyBadge items={anomalies.forMission(c.id)} />
                    </div>

                    <AnomalyList items={anomalies.forMission(c.id)} onResolve={anomalies.resolve} />

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
                    {(c.format || c.price || c.contactName || c.driverId) && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted">
                        {c.driverId && (
                          <div className="flex items-center gap-1.5 rounded bg-green-50/50 px-1.5 py-0.5 font-bold text-green-700">
                            <Truck size={10} />
                            {(drivers.find((d) => d.id === c.driverId) ?? drivers.find((d) => d.auth_id === c.driverId))?.name ?? "chauffeur"}
                          </div>
                        )}
                        {c.format && <div><span className="font-bold text-label uppercase">Format:</span> {c.format}</div>}
                        {c.price !== null && <div><span className="font-bold text-label uppercase">Prix:</span> {c.price.toFixed(2)} €</div>}
                        {c.contactName && <div><span className="font-bold text-label uppercase">Contact:</span> {c.contactName} {c.contactPhone}</div>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 pl-11 sm:pl-0">
                  <span className="text-[12.5px] font-semibold text-muted">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(c.createdAt))}
                  </span>

                  {c.type === "commande" && (
                    <select
                      value={c.status}
                      onChange={(e) => c.updateStatus?.(e.target.value)}
                      className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 border-none outline-none focus:ring-2 focus:ring-ink"
                    >
                      {['assigned', 'picked_up', 'livree'].map((status) => (
                        <option key={status} value={status}>
                          {STATUS_DISPLAY[status] ?? status}
                        </option>
                      ))}
                    </select>
                  )}

                  {c.driverId ? (
                    <div className="mt-1 flex items-center">
                      {c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled" && (
                        <button
                          onClick={() => removeFromDriver(c)}
                          disabled={sending === c.key}
                          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          <X size={12} />
                          Retirer
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <select
                        value={selection[c.key] ?? ""}
                        onChange={(e) => setSelection((prev) => ({ ...prev, [c.key]: e.target.value }))}
                        className="max-w-[150px] rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[12px] font-medium text-amber-800"
                      >
                        <option value="">Chauffeur…</option>
                        {drivers.map((d) => {
                          const activeCount = courses.filter((course) =>
                            (course.driverId === d.id || course.driverId === d.auth_id) &&
                            course.status !== "livree" && course.status !== "delivered" &&
                            course.status !== "annulee" && course.status !== "cancelled"
                          ).length;
                          const busyText = activeCount > 0
                            ? ` - Occupé (${activeCount})`
                            : d.status === "hors_service" ? " - Hors ligne" : " - Dispo";
                          return (
                            <option key={d.id} value={d.id}>
                              {d.name}{busyText}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        onClick={() => sendToDriver(c)}
                        disabled={!selection[c.key] || sending === c.key}
                        className="flex items-center justify-center rounded-lg bg-ink p-1.5 text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Envoyer au chauffeur"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-3 border-b border-line p-5">
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-bold text-ink">Chauffeurs en service</h2>
                <p className="mt-0.5 truncate text-[12.5px] font-medium text-muted">Disponibilité du personnel.</p>
              </div>
              {(() => {
                const occupiedCount = driversOnDuty.filter(d => courses.some(c => (c.driverId === d.id || c.driverId === d.auth_id) && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled")).length;
                const dispoCount = driversOnDuty.length - occupiedCount;
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">{dispoCount} dispo</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">{occupiedCount} occupé{occupiedCount > 1 ? 's' : ''}</span>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col divide-y divide-line">
              {driversOnDuty.length === 0 && (
                <div className="p-6 text-center text-[13px] font-medium text-muted">Aucun chauffeur en service.</div>
              )}
              {driversOnDuty.slice(0, 4).map((d) => (
                <div key={d.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
                      {initialsOf(d.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate font-bold text-ink flex-1 min-w-0" title={d.name}>{d.name}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            courses.filter((c) => (c.driverId === d.id || c.driverId === d.auth_id) && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled").length > 0
                              ? "bg-amber-100 text-amber-800"
                              : d.status === "disponible" ? "bg-green-50 text-green-700" : d.status === "en_course" ? "bg-accent/10 text-accent" : "bg-paper text-muted"
                          }`}
                        >
                          {courses.filter((c) => (c.driverId === d.id || c.driverId === d.auth_id) && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled").length > 0
                            ? "Occupé"
                            : STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      <div className="truncate text-[12px] text-muted">{d.vehicle || "Véhicule non renseigné"}</div>
                      {(() => {
                        const activeCoursesCount = courses.filter((c) => (c.driverId === d.id || c.driverId === d.auth_id) && c.status !== "livree" && c.status !== "delivered" && c.status !== "annulee" && c.status !== "cancelled").length;
                        if (activeCoursesCount > 0) {
                          return (
                            <div className="truncate text-[11.5px] font-semibold text-blue-700">
                              {activeCoursesCount} course{activeCoursesCount > 1 ? "s" : ""} sur son app
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  {d.status !== "hors_service" && firstPending && (
                    <button
                      onClick={() => quickAssign(d.id)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-ink/85"
                    >
                      Assigner direct à {firstPending.label}
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4">
              <a href="/admin/chauffeurs" className="flex w-full items-center justify-center rounded-xl bg-paper px-4 py-3 text-[13px] font-bold text-ink transition-colors hover:bg-line/60">
                Gérer l&apos;annuaire chauffeurs
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-ink">Repères de dispatch</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] font-medium text-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Priorisez le chauffeur le plus proche du point de prise en charge.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Vérifiez le véhicule renseigné avant de valider une affectation.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Passez la course en &quot;confirmée&quot; dès qu&apos;un chauffeur est assigné.
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
