"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { useQueryParam } from "@/lib/use-query-state";
import { CheckCircle2, Clock, Plus, Search, ShieldCheck, UserRound, Users, Zap } from "lucide-react";

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  status: "disponible" | "en_course" | "hors_service";
  notes: string | null;
};

type AssignedCourse = {
  key: string;
  type: "commande" | "navette";
  label: string;
  route: string;
};

const todayDateStr = () => new Date().toISOString().slice(0, 10);

const STATUS_LABEL: Record<Driver["status"], string> = {
  disponible: "Disponible",
  en_course: "En course",
  hors_service: "Hors service",
};

const STATUS_BADGE: Record<Driver["status"], string> = {
  disponible: "bg-green-50 text-green-700",
  en_course: "bg-accent/10 text-accent",
  hors_service: "bg-slate-100 text-slate-500",
};

const STATUS_BAR: Record<Driver["status"], string> = {
  disponible: "before:bg-green-500",
  en_course: "before:bg-blue-500",
  hors_service: "before:bg-line",
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminChauffeursPage() {
  return (
    <Suspense fallback={null}>
      <AdminChauffeursPageInner />
    </Suspense>
  );
}

function AdminChauffeursPageInner() {
  const supabase = createClient();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [coursesByDriver, setCoursesByDriver] = useState<Record<string, AssignedCourse[]>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useQueryParam("filter", "all");
  const [search, setSearch] = useQueryParam("q", "");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const [{ data }, { data: orders }, { data: navettes }] = await Promise.all([
      supabase.from("drivers").select("*").order("name"),
      supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, driver_id, status")
        .not("driver_id", "is", null)
        .neq("status", "livree")
        .neq("status", "delivered")
        .neq("status", "annulee")
        .neq("status", "cancelled"),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, driver_id, last_dispatch_date")
        .not("driver_id", "is", null)
        .eq("status", "active")
        .eq("last_dispatch_date", todayDateStr()),
    ]);

    const driverRows = (data ?? []) as (Driver & { auth_id?: string | null })[];
    setDrivers(driverRows);

    const authIdToDriverId = new Map(
      driverRows.filter((d) => d.auth_id).map((d) => [d.auth_id!, d.id])
    );

    const resolveDriverId = (rawId: string) => authIdToDriverId.get(rawId) ?? rawId;

    const byDriver: Record<string, AssignedCourse[]> = {};
    (orders ?? []).forEach((o) => {
      if (!o.driver_id) return;
      const dId = resolveDriverId(o.driver_id);
      (byDriver[dId] ??= []).push({
        key: `order-${o.id}`,
        type: "commande",
        label: o.tracking_code ?? o.id.slice(0, 8),
        route: `${o.pickup_address} → ${o.dropoff_address}`,
      });
    });
    (navettes ?? []).forEach((n) => {
      if (!n.driver_id) return;
      const dId = resolveDriverId(n.driver_id);
      (byDriver[dId] ??= []).push({
        key: `navette-${n.id}`,
        type: "navette",
        label: n.name,
        route: `${n.pickup_address} → ${n.dropoff_address}`,
      });
    });
    setCoursesByDriver(byDriver);
    setLastRefresh(new Date());
  }, [supabase]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-driver-status-chauffeurs")
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    const { error } = await supabase.from("drivers").insert({ name, phone, vehicle });
    if (error) {
      setError("Impossible d'ajouter le chauffeur.");
      return;
    }
    setName("");
    setPhone("");
    setVehicle("");
    load();
  };

  const updateStatus = async (id: string, status: Driver["status"]) => {
    await supabase.from("drivers").update({ status }).eq("id", id);
    load();
  };

  const total = drivers.length;
  const disponibles = drivers.filter((d) => d.status === "disponible" && (coursesByDriver[d.id] ?? []).length === 0);
  const enCourse = drivers.filter((d) => d.status === "en_course" || (coursesByDriver[d.id] ?? []).length > 0);
  const disponibilite = total ? Math.round(((disponibles.length + enCourse.length) / total) * 100) : 0;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      const isEnCourse = d.status === "en_course" || (coursesByDriver[d.id] ?? []).length > 0;
      const isDisponible = d.status === "disponible" && !isEnCourse;
      const isHorsService = d.status === "hors_service";
      
      let matchFilter = true;
      if (filter === "disponible") matchFilter = isDisponible;
      if (filter === "en_course") matchFilter = isEnCourse;
      if (filter === "hors_service") matchFilter = isHorsService;

      if (filter !== "all" && !matchFilter) return false;

      if (!q) return true;
      return d.name.toLowerCase().includes(q) || (d.vehicle ?? "").toLowerCase().includes(q) || (d.phone ?? "").includes(q);
    });
  }, [drivers, filter, search, coursesByDriver]);

  return (
    <AdminPage
      eyebrow={<>Gestion de flotte · Annuaire &amp; disponibilité</>}
      title={<>Chauffeurs</>}
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
        <StatCard icon={Users} label="Total chauffeurs" value={String(total)} sub={`${total} enregistré${total > 1 ? "s" : ""} dans l'annuaire`} />
        <StatCard icon={CheckCircle2} label="Disponibles immédiats" value={String(disponibles.length)} sub={disponibles[0]?.name} accent={disponibles.length > 0} />
        <StatCard icon={Zap} label="En course / transit" value={String(enCourse.length)} sub={enCourse.map((d) => d.name.split(" ")[0]).join(" + ") || undefined} />
        <StatCard icon={ShieldCheck} label="Disponibilité flotte" value={`${disponibilite}%`} sub="Disponible + en course" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink">Ajout rapide d&apos;un chauffeur</h2>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-label">Nom &amp; prénom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Karim Benali"
              className="rounded-xl border border-line px-3.5 py-2.5 text-[13px] font-medium text-ink placeholder:text-label"
              required
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-label">Téléphone mobile</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              placeholder="06 12 34 56 78"
              className="rounded-xl border border-line px-3.5 py-2.5 text-[13px] font-medium text-ink placeholder:text-label"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-label">Véhicule &amp; immatriculation</label>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Mercedes E (AB-482-CD)"
              className="rounded-xl border border-line px-3.5 py-2.5 text-[13px] font-medium text-ink placeholder:text-label"
            />
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark">
            <Plus size={16} /> Ajouter
          </button>
        </form>
        {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1"></div>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher chauffeur…"
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-label sm:w-[220px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {visible.map((d) => {
              const assigned = coursesByDriver[d.id] ?? [];
              const isOccupied = assigned.length > 0;
              const displayStatus = isOccupied ? "en_course" : d.status;

              return (
                <div
                  key={d.id}
                  className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-white p-4 pl-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 ${STATUS_BAR[displayStatus]}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
                        {initialsOf(d.name)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-ink">{d.name}</span>
                          {assigned.length > 0 && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                              {assigned.length} course{assigned.length > 1 ? "s" : ""} sur son app
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-muted">{d.vehicle || "Véhicule non renseigné"}</div>
                        <div className="text-[12.5px] text-muted">{d.phone || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-14 sm:pl-0">
                      <select
                        value={displayStatus}
                        disabled
                        className={`appearance-none rounded-lg border border-transparent px-4 py-2 text-[13px] font-bold ${isOccupied ? "bg-amber-100 text-amber-800" : STATUS_BADGE[displayStatus]}`}
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {d.status !== "hors_service" && (
                        <Link
                          href="/admin/courses"
                          className="flex items-center justify-center whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark"
                        >
                          {assigned.length > 0 ? "Envoyer une autre course" : "Assigner course"}
                        </Link>
                      )}
                    </div>
                  </div>

                  {assigned.length > 0 && (
                    <div className="ml-14 flex flex-col gap-1.5 border-t border-line pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-label">Sur son application</span>
                      {assigned.map((c) => (
                        <div key={c.key} className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${c.type === "navette" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                            {c.type === "navette" ? "Navette" : "Course"}
                          </span>
                          <span className="font-semibold text-ink">{c.label}</span>
                          <span className="text-label">·</span>
                          <span className="truncate">{c.route}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-[13px] font-medium text-muted">
                Aucun chauffeur dans ce filtre.
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-ink">Répartition par statut</h3>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">{total} chauffeur{total > 1 ? "s" : ""}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {(
                [
                  ["disponible", "Disponibles", "bg-green-500"],
                  ["en_course", "En course", "bg-blue-500"],
                  ["hors_service", "Hors service", "bg-line"],
                ] as const
              ).map(([status, label, dot]) => {
                const count = drivers.filter((d) => d.status === status).length;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status} className="flex flex-col gap-1.5">
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
            <div className="flex items-center gap-2">
              <UserRound size={15} className="text-label" />
              <h3 className="text-[13px] font-bold text-ink">Repères d&apos;affectation</h3>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] font-medium text-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Privilégiez un chauffeur disponible proche de la prise en charge.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Repassez un chauffeur en &quot;hors service&quot; dès qu&apos;il termine sa journée.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Tenez le véhicule à jour pour fiabiliser le dispatch.
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
