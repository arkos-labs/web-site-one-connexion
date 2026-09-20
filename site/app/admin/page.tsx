"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { AlertTriangle, ArrowRight, Clock, Euro, Package, Plus, Truck, Users } from "lucide-react";

type PendingItem = {
  key: string;
  id: string;
  type: "commande" | "navette";
  label: string;
  clientName: string;
  pickup: string;
  dropoff: string;
  createdAt: string;
};

type DriverRow = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  status: "disponible" | "en_course" | "hors_service";
};

type Stats = {
  caJour: number;
  ordersFactureesJour: number;
  coursesEnCours: number;
  chauffeursDispo: number;
  chauffeursEnCourse: number;
  navettesNonDispatchees: number;
  awaitingAcceptance: number;
};

const TODAY_LABEL = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

// Correspond aux ids stockés dans navettes.days_of_week (cf. app/dashboard/navettes/page.tsx).
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const todayId = () => WEEKDAY_IDS[new Date().getDay()];
const todayDateStr = () => new Date().toISOString().slice(0, 10);

const STATUS_LABEL: Record<DriverRow["status"], string> = {
  disponible: "Disponible",
  en_course: "En course",
  hors_service: "Hors service",
};

const STATUS_DOT: Record<DriverRow["status"], string> = {
  disponible: "bg-green-500",
  en_course: "bg-accent",
  hors_service: "bg-line",
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function timeOf(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function AdminOverviewPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [ordersToday, ordersEnCours, navettesPendingCount, ordersAwaitingCount, ordersAwaiting, navettesPending, driversData] = await Promise.all([
      supabase.from("orders").select("price_estimate, status").gte("created_at", startOfDay.toISOString()).neq("status", "annulee"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_cours"),
      supabase
        .from("navettes")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .contains("days_of_week", [todayId()])
        .or(`driver_id.is.null,last_dispatch_date.is.null,last_dispatch_date.neq.${todayDateStr()}`),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
      supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, created_at, user_id")
        .eq("status", "en_attente")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, created_at")
        .eq("status", "active")
        .contains("days_of_week", [todayId()])
        .or(`driver_id.is.null,last_dispatch_date.is.null,last_dispatch_date.neq.${todayDateStr()}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("drivers").select("id, name, phone, vehicle, status").order("name"),
    ]);

    const todayRows = ordersToday.data ?? [];
    const caJour = todayRows.reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);

    const orderRows = ordersAwaiting.data ?? [];
    const userIds = [...new Set(orderRows.map((o) => o.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, company").in("id", userIds)
      : { data: [] as { id: string; full_name: string | null; company: string | null }[] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    const pendingOrders: PendingItem[] = orderRows.map((o) => {
      const profile = o.user_id ? profileById.get(o.user_id) : null;
      return {
        key: `order-${o.id}`,
        id: o.id,
        type: "commande",
        label: o.tracking_code ?? o.id.slice(0, 8),
        clientName: profile?.company || profile?.full_name || "Client particulier",
        pickup: o.pickup_address,
        dropoff: o.dropoff_address,
        createdAt: o.created_at,
      };
    });

    const pendingNavettes: PendingItem[] = (navettesPending.data ?? []).map((n) => ({
      key: `navette-${n.id}`,
      id: n.id,
      type: "navette",
      label: n.name,
      clientName: "Navette récurrente",
      pickup: n.pickup_address,
      dropoff: n.dropoff_address,
      createdAt: n.created_at,
    }));

    const driverRows = driversData.data ?? [];

    setStats({
      caJour,
      ordersFactureesJour: todayRows.length,
      coursesEnCours: ordersEnCours.count ?? 0,
      chauffeursDispo: driverRows.filter((d) => d.status === "disponible").length,
      chauffeursEnCourse: driverRows.filter((d) => d.status === "en_course").length,
      navettesNonDispatchees: navettesPendingCount.count ?? pendingNavettes.length,
      awaitingAcceptance: ordersAwaitingCount.count ?? orderRows.length,
    });
    setPending(pendingOrders);
    setDrivers(driverRows as DriverRow[]);
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-driver-status-dashboard")
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

  const totalADispatcher = (stats?.awaitingAcceptance ?? 0) + (stats?.navettesNonDispatchees ?? 0);
  const driversOnDuty = drivers.filter((d) => d.status !== "hors_service");

  const acceptOrder = async (id: string) => {
    await supabase.from("orders").update({ status: "confirmee" }).eq("id", id);
    load();
  };

  return (
    <AdminPage
      eyebrow={<>Tableau de bord · {TODAY_LABEL}</>}
      title={<>Vue d&apos;ensemble</>}
      actions={
        <>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15 hover:text-white"
          >
            <Clock size={15} />
            {lastRefresh ? `Actualisé à ${timeOf(lastRefresh.toISOString())}` : "Mise à jour en temps réel"}
          </button>
          <Link
            href="/admin/courses"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark hover:text-white"
          >
            <Plus size={15} />
            Nouvelle course
          </Link>
        </>
      }
    >

      {totalADispatcher > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle size={17} className="text-amber-700" strokeWidth={2.25} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-amber-900">
                {totalADispatcher} élément{totalADispatcher > 1 ? "s" : ""} nécessite{totalADispatcher > 1 ? "nt" : ""} une action
              </div>
              <div className="text-[12.5px] font-medium text-amber-700">
                {stats?.awaitingAcceptance ? `${stats.awaitingAcceptance} course${stats.awaitingAcceptance > 1 ? "s" : ""} à accepter ci-dessous` : ""}
                {stats?.awaitingAcceptance && stats?.navettesNonDispatchees ? " · " : ""}
                {stats?.navettesNonDispatchees ? `${stats.navettesNonDispatchees} navette${stats.navettesNonDispatchees > 1 ? "s" : ""} à dispatcher` : ""}
              </div>
            </div>
          </div>
          {(stats?.navettesNonDispatchees ?? 0) > 0 && (
            <Link
              href="/admin/courses"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark"
            >
              Ouvrir le dispatch
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Euro}
          label="CA du jour"
          value={stats ? `${stats.caJour.toFixed(2)} €` : "…"}
          sub={stats ? `${stats.ordersFactureesJour} commande${stats.ordersFactureesJour > 1 ? "s" : ""} facturée${stats.ordersFactureesJour > 1 ? "s" : ""}` : undefined}
        />
        <StatCard
          icon={Truck}
          label="Courses en cours"
          value={stats ? String(stats.coursesEnCours) : "…"}
          sub={stats && stats.coursesEnCours === 0 ? "Flotte inactive actuellement" : "En circulation"}
        />
        <StatCard
          icon={Users}
          label="Chauffeurs disponibles"
          value={stats ? String(stats.chauffeursDispo) : "…"}
          sub={stats ? `${stats.chauffeursDispo + stats.chauffeursEnCourse} chauffeur${stats.chauffeursDispo + stats.chauffeursEnCourse > 1 ? "s" : ""} en ligne` : undefined}
        />
        <StatCard
          icon={Package}
          label="À traiter"
          value={stats ? String(totalADispatcher) : "…"}
          sub={totalADispatcher > 0 ? "Acceptation + dispatch navettes" : "Rien à traiter"}
          accent={totalADispatcher > 0}
        />
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
          {accent ? <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> : <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-line" />}
          {sub}
        </div>
      )}
    </div>
  );
}
