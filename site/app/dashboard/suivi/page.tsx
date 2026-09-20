"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, ChevronRight, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMissionAnomalies, type Anomaly } from "@/components/admin/mission-anomalies";
import { PageShell, SearchInput, KpiStrip, StatusPill, EmptyState, LoadingState, TH, TD, BTN_PRIMARY } from "@/components/dashboard/ui";

type Tone = "blue" | "amber" | "green" | "red" | "gray";

const ACTIVE = ["assigned", "driver_accepted", "in_progress", "picked_up", "en_cours"];
const DONE = ["delivered", "livree"];
const CANCELLED = ["cancelled", "annulee"];

const statusMeta = (status: string): { tone: Tone; label: string } => {
  if (status === "assigned" || status === "driver_accepted") return { tone: "blue", label: "Assignée" };
  if (status === "in_progress" || status === "picked_up" || status === "en_cours") return { tone: "amber", label: "En cours" };
  if (DONE.includes(status)) return { tone: "green", label: "Livrée" };
  if (CANCELLED.includes(status)) return { tone: "red", label: "Annulée" };
  if (status === "confirmee") return { tone: "blue", label: "Confirmée" };
  return { tone: "gray", label: "En attente" };
};

const ANOMALY_STEP: Record<Anomaly["step"], string> = { enlevement: "Enlèvement", livraison: "Livraison", general: "Général" };
const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });
const fmtHour = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const stamp = (iso: string) => `${fmtDay.format(new Date(iso))} à ${fmtHour.format(new Date(iso))}`;

export default function SuiviPage() {
  const router = useRouter();
  const supabase = createClient();

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const anomalies = useMissionAnomalies(supabase, "suivi-anomalies");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const [ordersRes, navettesRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("navettes")
            .select("*")
            .eq("user_id", user.id)
        ]);

        if (ordersRes.error) console.error("Erreur de chargement des courses:", ordersRes.error);
        if (navettesRes.error) console.error("Erreur de chargement des navettes:", navettesRes.error);

        const ordersData = (ordersRes.data || []).map((o: any) => ({ ...o, type: 'order' }));
        const now = new Date();
        const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const navettesData = (navettesRes.data || []).map((n: any) => {
          const pp = n.point_progress || {};
          const completedToday = pp.last_completed_at && new Date(pp.last_completed_at).toDateString() === now.toDateString();
          const dispatchedToday = n.driver_id && n.last_dispatch_date === todayIso;
          const anyPickedUp = Object.values(pp).some((p: any) => p && typeof p === "object" && p.pickedUpAt);
          let status = "en_attente";
          if (completedToday) status = "delivered";
          else if (dispatchedToday && anyPickedUp) status = "in_progress";
          else if (dispatchedToday) status = "assigned";
          return {
            ...n,
            type: 'navette',
            status,
            tracking_code: n.tracking_code || n.id.substring(0, 8).toUpperCase(),
          };
        });

        const combined = [...ordersData, ...navettesData].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setDeliveries(combined);
      } catch (err) {
        console.error("Erreur:", err);
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    const channel = supabase
      .channel("suivi-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "navettes" }, () => {
        loadOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDeliveries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deliveries;
    return deliveries.filter((d) =>
      d.tracking_code?.toLowerCase().includes(q) ||
      d.pickup_address?.toLowerCase().includes(q) ||
      d.dropoff_address?.toLowerCase().includes(q)
    );
  }, [deliveries, search]);

  const openAnomalies = (id: string) => anomalies.forMission(id).filter((x) => !x.resolved);
  const counts = {
    total: deliveries.length,
    active: deliveries.filter((d) => ACTIVE.includes(d.status)).length,
    done: deliveries.filter((d) => DONE.includes(d.status)).length,
    anomalies: deliveries.reduce((sum, d) => sum + openAnomalies(d.id).length, 0),
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const time = fmtHour.format(date);
    if (date.toDateString() === today.toDateString()) return `Aujourd'hui, ${time}`;
    if (date.toDateString() === yesterday.toDateString()) return `Hier, ${time}`;
    return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}, ${time}`;
  };

  const hrefOf = (d: any) => (d.type === "navette" ? `/dashboard/navettes/${d.id}` : `/dashboard/suivi/${d.id}`);

  /** Dernier événement connu de la livraison, en une ligne. */
  const eventLine = (d: any): string | null => {
    const deliveredAt = d.delivered_at || (d.type === "navette" && d.point_progress?.last_completed_at);
    const pickedUpAt = d.picked_up_at || (d.type === "navette" && d.point_progress?.["0"]?.pickedUpAt);
    const parts: string[] = [];
    if (deliveredAt) parts.push(`Livrée le ${stamp(deliveredAt)}`);
    else if (pickedUpAt) parts.push(`Enlevée le ${stamp(pickedUpAt)}`);
    if (d.delivery_recipient) parts.push(`remise à ${d.delivery_recipient}`);
    return parts.length ? parts.join(" · ") : null;
  };

  /** Prix HT de la course (estimation) ; null si inconnu. */
  const priceOf = (d: any): number | null => {
    const v = d.type === "navette" ? d.estimated_price : d.price_estimate;
    return v != null && v !== "" ? Number(v) : null;
  };

  const Route = ({ d }: { d: any }) => {
    const stops: string[] = (Array.isArray(d.stops) ? d.stops : []).map((st: any) => st?.address || String(st));
    const points = [
      { kind: "start" as const, address: d.pickup_address },
      ...stops.map((address) => ({ kind: "stop" as const, address })),
      { kind: "end" as const, address: d.dropoff_address },
    ];
    const ev = eventLine(d);
    return (
      <div className="min-w-0">
        <ol className="flex flex-col gap-0.5">
          {points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.5px] font-semibold leading-snug text-ink">
              <span
                aria-hidden
                className={`mt-[4px] box-content h-1.5 w-1.5 shrink-0 rounded-full border-2 ${
                  pt.kind === "end" ? "border-accent bg-accent" : pt.kind === "start" ? "border-ink bg-white" : "border-label bg-white"
                }`}
              />
              <span>{pt.address}</span>
            </li>
          ))}
        </ol>
        {ev && <p className="mt-1.5 pl-[18px] text-xs text-muted">{ev}</p>}
      </div>
    );
  };

  const Anomalies = ({ id }: { id: string }) => {
    const items = anomalies.forMission(id);
    if (!items.length) return null;
    return (
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((a) => (
          <li
            key={a.id}
            className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
              a.resolved ? "border-line bg-paper-card text-muted" : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <AlertTriangle size={14} className={`mt-px shrink-0 ${a.resolved ? "text-label" : "text-red-600"}`} />
            <div className="min-w-0">
              <p className="font-bold">
                {ANOMALY_STEP[a.step]} · {a.type}
                <span className="ml-2 font-semibold opacity-70">{a.resolved ? "Résolue" : "En cours de traitement"}</span>
              </p>
              {a.comment && <p className="mt-0.5 opacity-80">{a.comment}</p>}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const Price = ({ d }: { d: any }) => {
    const ht = priceOf(d);
    if (ht === null) return <span className="text-xs text-label">—</span>;
    return (
      <div className="whitespace-nowrap text-right">
        <div className="text-sm font-extrabold tabular-nums text-ink">{eur(ht)}</div>
        <div className="text-[11px] font-medium text-muted">HT · {eur(ht * 1.2)} TTC{d.type === "navette" ? " / passage" : ""}</div>
      </div>
    );
  };

  const NavetteTag = () => (
    <span className="label-mono ml-2 rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-muted">Navette</span>
  );

  return (
    <PageShell
      eyebrow="Suivi en temps réel"
      title="Suivi des livraisons"
      subtitle="L'historique et le statut de toutes vos courses et navettes."
      actions={<SearchInput label="Rechercher une course" value={search} onChange={setSearch} placeholder="N° de course, adresse…" />}
    >
      <KpiStrip
        items={[
          { label: "Total", value: counts.total },
          { label: "En cours", value: counts.active, accent: counts.active > 0 },
          { label: "Livrées", value: counts.done },
          { label: "Anomalies", value: counts.anomalies, accent: counts.anomalies > 0 },
        ]}
      />

      {loading ? (
        <LoadingState text="Chargement de vos courses…" />
      ) : filteredDeliveries.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={deliveries.length === 0 ? "Aucune course pour le moment" : "Aucun résultat"}
          text={deliveries.length === 0 ? "Vos courses apparaîtront ici une fois commandées." : "Essayez une autre recherche."}
          action={
            deliveries.length === 0 ? (
              <Link href="/dashboard/commander" className={`${BTN_PRIMARY} text-white hover:text-white`}>
                Commander une course
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div>
          {/* Tableau (≥ md) */}
          <table className="hidden w-full text-sm text-ink md:table">
            <thead className="border-b border-line bg-paper-card">
              <tr>
                <th scope="col" className={TH}>Course</th>
                <th scope="col" className={TH}>Itinéraire</th>
                <th scope="col" className={`${TH} text-right`}>Prix</th>
                <th scope="col" className={TH}>Statut</th>
                <th scope="col" className={`${TH} w-10`}><span className="sr-only">Détails</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredDeliveries.map((d) => {
                const s = statusMeta(d.status);
                const hasOpen = openAnomalies(d.id).length > 0;
                return (
                  <tr
                    key={`${d.type}-${d.id}`}
                    onClick={() => router.push(hrefOf(d))}
                    className={`group cursor-pointer transition-colors hover:bg-paper-card ${hasOpen ? "bg-red-50/40" : ""}`}
                  >
                    <td className={`${TD} whitespace-nowrap align-top`}>
                      <Link href={hrefOf(d)} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-bold text-ink hover:text-accent-dark">
                        {d.tracking_code}
                      </Link>
                      {d.type === "navette" && <NavetteTag />}
                      <div className="mt-1 text-xs text-muted">{formatDate(d.created_at)}</div>
                    </td>
                    <td className={`${TD} w-full min-w-[300px] align-top`}>
                      <Route d={d} />
                      <Anomalies id={d.id} />
                    </td>
                    <td className={`${TD} align-top`}><Price d={d} /></td>
                    <td className={`${TD} whitespace-nowrap align-top`}><StatusPill tone={s.tone}>{s.label}</StatusPill></td>
                    <td className={`${TD} align-top text-right`}>
                      <ChevronRight size={18} className="text-label transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Cartes (< md) */}
          <ul className="divide-y divide-line md:hidden">
            {filteredDeliveries.map((d) => {
              const s = statusMeta(d.status);
              return (
                <li key={`${d.type}-${d.id}`} className="px-5 py-4">
                  <Link href={hrefOf(d)} className="flex flex-col gap-2.5 text-ink hover:text-ink">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[13px] font-bold">
                        {d.tracking_code}
                        {d.type === "navette" && <NavetteTag />}
                      </span>
                      <StatusPill tone={s.tone}>{s.label}</StatusPill>
                    </div>
                    <Route d={d} />
                    <div className="flex items-end justify-between gap-3">
                      <span className="text-xs text-muted">{formatDate(d.created_at)}</span>
                      <Price d={d} />
                    </div>
                  </Link>
                  <Anomalies id={d.id} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </PageShell>
  );
}
