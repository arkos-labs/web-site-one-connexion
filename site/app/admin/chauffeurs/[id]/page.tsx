"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { htOf, normalizeOrderPriceTTC } from "@/lib/price-display";
import { AdminPage, ErrorState, LoadingState } from "@/components/dashboard/ui";
import { AlertTriangle, CheckCircle2, Euro, Eye, EyeOff, Pencil, Phone, Truck, Wallet } from "lucide-react";
import { DRIVER_MIN_PAY, DRIVER_SHARE, driverPayOf } from "@/lib/driver-pay";

/**
 * Fiche chauffeur (admin) : profil, courses en cours, historique des courses, navettes, incidents signalés.
 * Les courses portent l'identifiant du compte du chauffeur (drivers.auth_id) ; les plus anciennes, celui
 * de la fiche (drivers.id) : on lit les deux.
 */

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  status: "disponible" | "en_course" | "hors_service";
  notes: string | null;
  created_at: string;
  auth_id: string | null;
  iban: string | null;
  bic: string | null;
};

type OrderRow = {
  id: string;
  tracking_code: string | null;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price_estimate: number | null;
  amount_due: number | null;
  driver_pay: number | null;
  delai: string | null;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_recipient: string | null;
  delivery_photo_url: string | null;
  delivery_signature_url: string | null;
  user_id: string | null;
  contact_name: string | null;
  raison_sociale: string | null;
};

type NavetteRow = { id: string; name: string; pickup_address: string; dropoff_address: string; days_str: string | null; status: string };

type AnomalyRow = { id: string; mission_type: string | null; mission_id: string; step: string; type: string; comment: string | null; resolved: boolean; created_at: string };

const STATUS_LABEL: Record<Driver["status"], string> = { disponible: "Disponible", en_course: "En course", hors_service: "Hors service" };
const STATUS_BADGE: Record<Driver["status"], string> = {
  disponible: "bg-green-50 text-green-700",
  en_course: "bg-blue-50 text-blue-700",
  hors_service: "bg-slate-100 text-slate-500",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  pending: "En attente",
  confirmee: "Confirmée",
  assigned: "Assignée",
  driver_accepted: "Acceptée",
  en_cours: "En cours",
  in_progress: "En cours",
  picked_up: "Colis enlevé",
  livree: "Livrée",
  delivered: "Livrée",
  annulee: "Annulée",
  cancelled: "Annulée",
};
const DELIVERED = ["livree", "delivered"];
const CANCELLED = ["annulee", "cancelled"];
const STEP_LABEL: Record<string, string> = { enlevement: "Enlèvement", livraison: "Livraison", general: "Général" };
const DELAI_LABEL: Record<string, string> = { standard: "Normal", urgent: "Urgent", flash: "Super", navette: "Programmée" };

const dateLong = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
const dateTime = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
const hourOf = (d: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(d));
const eur = (n: number) => `${n.toFixed(2)} €`;

function durationLabel(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

function DriverPhoto({ url, name, size }: { url: string | null; name: string; size: "sm" | "lg" }) {
  const box = size === "lg" ? "h-28 w-28 text-[28px]" : "h-9 w-9 text-[12px]";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Photo de ${name}`} className={`${box} shrink-0 rounded-full object-cover ring-2 ring-white`} />
  ) : (
    <span className={`${box} flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-white ring-2 ring-white/20`}>{initialsOf(name)}</span>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "-";
}

const priceOf = (o: OrderRow) => Number(o.amount_due ?? normalizeOrderPriceTTC(o.price_estimate, o.pickup_address, o.dropoff_address) ?? 0);
/** Part du chauffeur sur une course (0 si annulée). */
const payOf = (o: OrderRow) => (CANCELLED.includes(o.status) ? { amount: 0, manual: false } : driverPayOf(priceOf(o), o.driver_pay));

export default function AdminDriverDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const driverId = decodeURIComponent(params.id as string);

  const [driver, setDriver] = useState<Driver | null>(null);
  const [account, setAccount] = useState<{ email: string | null; lastSignInAt: string | null; avatarUrl: string | null } | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [navettes, setNavettes] = useState<NavetteRow[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyRow[]>([]);
  const [clientNames, setClientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "month">("all");

  const load = useCallback(async () => {
    const { data: d } = await supabase.from("drivers").select("id, name, phone, vehicle, status, notes, created_at, auth_id, iban, bic").eq("id", driverId).maybeSingle();
    if (!d) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setDriver(d as Driver);
    const ids = [d.id, d.auth_id].filter(Boolean) as string[];

    const [{ data: o }, { data: n }, { data: a }] = await Promise.all([
      supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, amount_due, driver_pay, delai, created_at, assigned_at, picked_up_at, delivered_at, delivery_recipient, delivery_photo_url, delivery_signature_url, user_id, contact_name, raison_sociale")
        .in("driver_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, days_str, status")
        .or(ids.map((id) => `driver_id.eq.${id},last_dispatch_driver_id.eq.${id}`).join(",")),
      supabase
        .from("mission_anomalies")
        .select("id, mission_type, mission_id, step, type, comment, resolved, created_at")
        .in("driver_id", ids)
        .order("created_at", { ascending: false }),
    ]);
    const rows = (o ?? []) as OrderRow[];
    setOrders(rows);
    setNavettes((n ?? []) as NavetteRow[]);
    setAnomalies((a ?? []) as AnomalyRow[]);

    // Nom du client de chaque course : société, sinon nom du compte, sinon contact saisi.
    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
    if (userIds.length) {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", userIds),
        supabase.from("clients").select("id, company_name").in("id", userIds),
      ]);
      const names = new Map<string, string>();
      (p ?? []).forEach((r: { id: string; full_name: string | null }) => r.full_name && names.set(r.id, r.full_name));
      (c ?? []).forEach((r: { id: string; company_name: string | null }) => r.company_name && names.set(r.id, r.company_name));
      setClientNames(names);
    }
    setLoading(false);
  }, [supabase, driverId]);

  useEffect(() => {
    load();
    fetch(`/api/admin/drivers/${encodeURIComponent(driverId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setAccount({ email: data.email, lastSignInAt: data.lastSignInAt, avatarUrl: data.avatarUrl }))
      .catch(() => {});
  }, [load, driverId]);

  const delivered = useMemo(() => orders.filter((o) => DELIVERED.includes(o.status)), [orders]);
  const active = useMemo(() => orders.filter((o) => ![...DELIVERED, ...CANCELLED].includes(o.status)), [orders]);
  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, []);
  const deliveredThisMonth = delivered.filter((o) => new Date(o.delivered_at || o.created_at).getTime() >= monthStart);
  const revenue = delivered.reduce((s, o) => s + priceOf(o), 0);
  const revenueMonth = deliveredThisMonth.reduce((s, o) => s + priceOf(o), 0);
  const payTotal = delivered.reduce((s, o) => s + payOf(o).amount, 0);
  const payMonth = deliveredThisMonth.reduce((s, o) => s + payOf(o).amount, 0);
  // Ce qui reste à la société sur les courses livrées : prix HT moins la part du chauffeur.
  const marginMonth = deliveredThisMonth.reduce((s, o) => s + htOf(priceOf(o)) - payOf(o).amount, 0);

  // Montant du chauffeur fixé à la main sur une course (vide = règle 35 %, minimum 10 €).
  const saveDriverPay = async (orderId: string, value: number | null) => {
    const { error } = await supabase.from("orders").update({ driver_pay: value }).eq("id", orderId);
    if (error) {
      alert("Montant non enregistré : " + error.message);
      return false;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, driver_pay: value } : o)));
    return true;
  };
  const durations = delivered
    .filter((o) => o.picked_up_at && o.delivered_at)
    .map((o) => (new Date(o.delivered_at!).getTime() - new Date(o.picked_up_at!).getTime()) / 60000)
    .filter((m) => m > 0 && m < 24 * 60);
  const avgDuration = durations.length ? durations.reduce((s, m) => s + m, 0) / durations.length : null;
  const lastDelivery = delivered.map((o) => o.delivered_at).filter(Boolean).sort().at(-1) ?? null;
  const openAnomalies = anomalies.filter((a) => !a.resolved).length;

  const history = historyFilter === "month"
    ? orders.filter((o) => new Date(o.delivered_at || o.created_at).getTime() >= monthStart)
    : orders;

  const clientOf = (o: OrderRow) => o.raison_sociale || (o.user_id && clientNames.get(o.user_id)) || o.contact_name || "Client";
  const courseHref = (o: OrderRow) => `/admin/courses-list?filter=toutes&q=${encodeURIComponent(o.tracking_code ?? "")}`;

  const back = { href: "/admin/chauffeurs", label: "Retour aux chauffeurs" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la fiche chauffeur…" />
      </div>
    );
  }
  if (notFound || !driver) return <ErrorState text="Chauffeur introuvable." back={back} />;

  const displayStatus: Driver["status"] = active.length > 0 ? "en_course" : driver.status;
  const ibanMasked = driver.iban ? `${driver.iban.replace(/\s/g, "").slice(0, 4)} •••• •••• ${driver.iban.replace(/\s/g, "").slice(-4)}` : null;

  return (
    <AdminPage
      back={back}
      eyebrow="Fiche chauffeur"
      title={
        <>
          <DriverPhoto url={account?.avatarUrl ?? null} name={driver.name} size="sm" />
          <span>{driver.name}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[displayStatus]}`}>{STATUS_LABEL[displayStatus]}</span>
        </>
      }
      subtitle={[driver.vehicle || "Véhicule non renseigné", driver.phone, `Chauffeur depuis le ${dateLong(driver.created_at)}`].filter(Boolean).join(" · ")}
      actions={
        driver.phone ? (
          <a
            href={`tel:${driver.phone.replace(/\s/g, "")}`}
            className="flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-4 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark hover:text-white"
          >
            <Phone size={15} /> Appeler
          </a>
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Courses livrées" value={String(delivered.length)} sub={`${deliveredThisMonth.length} ce mois-ci${avgDuration != null ? ` · ${durationLabel(avgDuration)} en moyenne` : ""}`} />
        <StatCard icon={Euro} label="CA des courses" value={`${eur(revenue)} TTC`} sub={`${eur(revenueMonth)} TTC ce mois-ci`} />
        <StatCard icon={Truck} label="En cours" value={String(active.length)} sub={lastDelivery ? `Dernière livraison le ${dateTime(lastDelivery)}` : "Aucune livraison"} accent={active.length > 0} />
        <StatCard icon={Wallet} label="À payer au chauffeur" value={`${eur(payMonth)}`} sub={`Ce mois-ci · ${eur(payTotal)} en tout · reste ${eur(marginMonth)} HT à la société ce mois-ci`} accent />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="flex flex-col gap-4">
          {active.length > 0 && (
            <Card title="Sur son application maintenant" sub={`${active.length} course${active.length > 1 ? "s" : ""} en cours.`}>
              {active.map((o) => (
                <CourseRow key={o.id} o={o} client={clientOf(o)} href={courseHref(o)} onSavePay={saveDriverPay} />
              ))}
            </Card>
          )}

          <Card
            title="Historique des courses"
            sub={`${orders.length} course${orders.length > 1 ? "s" : ""} au total.`}
            aside={
              <div className="flex gap-1.5">
                {([
                  ["all", "Toutes"],
                  ["month", "Ce mois-ci"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setHistoryFilter(key)}
                    className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${historyFilter === key ? "bg-ink text-white" : "border border-line bg-white text-muted hover:text-ink"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            {history.length === 0 && <div className="p-6 text-center text-[13px] font-medium text-muted">Aucune course sur cette période.</div>}
            {history.map((o) => (
              <CourseRow key={o.id} o={o} client={clientOf(o)} href={courseHref(o)} onSavePay={saveDriverPay} />
            ))}
          </Card>

          <Card title="Navettes" sub={navettes.length ? `${navettes.length} navette${navettes.length > 1 ? "s" : ""} confiée${navettes.length > 1 ? "s" : ""}.` : "Aucune navette confiée."}>
            {navettes.map((n) => (
              <div key={n.id} className="flex flex-col gap-1 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{n.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${n.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {n.status === "active" ? "Active" : "Inactive"}
                  </span>
                  {n.days_str && <span className="text-[12px] font-semibold text-muted">{n.days_str}</span>}
                </div>
                <div className="text-[12.5px] text-muted">{n.pickup_address} → {n.dropoff_address}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col items-center gap-3 text-center">
              <DriverPhoto url={account?.avatarUrl ?? null} name={driver.name} size="lg" />
              <div className="min-w-0">
                <div className="truncate text-[16px] font-bold text-ink">{driver.name}</div>
                <div className="text-[12.5px] text-muted">{driver.vehicle || "Véhicule non renseigné"}</div>
                {account && !account.avatarUrl && (
                  <div className="mt-1 text-[12px] text-muted">Pas encore de photo : il l&apos;ajoute depuis son appli (Profil).</div>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 text-[12.5px]">
              <InfoRow label="Téléphone" value={driver.phone ? <a href={`tel:${driver.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">{driver.phone}</a> : null} />
              <InfoRow label="E-mail" value={account?.email ? <a href={`mailto:${account.email}`} className="break-all underline underline-offset-2">{account.email}</a> : account ? null : "…"} />
              <InfoRow label="Statut" value={STATUS_LABEL[displayStatus]} />
              <InfoRow label="Inscrit le" value={dateLong(driver.created_at)} />
              <InfoRow label="Dernière connexion" value={account?.lastSignInAt ? dateTime(account.lastSignInAt) : account ? "Jamais" : "…"} />
              <InfoRow label="Compte appli" value={driver.auth_id ? "Oui" : "Non, il ne peut pas se connecter"} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-ink">Paiement du chauffeur</h3>
              {driver.iban && (
                <button onClick={() => setShowIban((v) => !v)} className="flex items-center gap-1 text-[12px] font-bold text-muted hover:text-ink">
                  {showIban ? <EyeOff size={13} /> : <Eye size={13} />} {showIban ? "Masquer" : "Afficher"}
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
              <InfoRow label="IBAN" value={driver.iban ? <span className="font-mono">{showIban ? driver.iban : ibanMasked}</span> : null} />
              <InfoRow label="BIC" value={driver.bic ? <span className="font-mono">{driver.bic}</span> : null} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
                <AlertTriangle size={14} className={openAnomalies ? "text-red-600" : "text-label"} /> Incidents signalés
              </h3>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">{anomalies.length}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {anomalies.length === 0 && <p className="text-[12.5px] text-muted">Aucun incident signalé.</p>}
              {anomalies.map((a) => (
                <div key={a.id} className={`rounded-lg border px-3 py-2 text-[12.5px] ${a.resolved ? "border-line bg-paper" : "border-red-100 bg-red-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-ink">{STEP_LABEL[a.step] ?? a.step} · {a.type}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.resolved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {a.resolved ? "Traité" : "À traiter"}
                    </span>
                  </div>
                  <div className="text-muted">{dateTime(a.created_at)}{a.comment ? ` · ${a.comment}` : ""}</div>
                </div>
              ))}
            </div>
          </div>

          {driver.notes && (
            <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[13px] font-bold text-ink">Notes</h3>
              <p className="mt-2 whitespace-pre-line text-[12.5px] text-muted">{driver.notes}</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

function CourseRow({ o, client, href, onSavePay }: { o: OrderRow; client: string; href: string; onSavePay: (id: string, value: number | null) => Promise<boolean> }) {
  const price = priceOf(o);
  const pay = payOf(o);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async (value: number | null) => {
    setSaving(true);
    const ok = await onSavePay(o.id, value);
    setSaving(false);
    if (ok) setEditing(false);
  };
  const isDelivered = DELIVERED.includes(o.status);
  const isCancelled = CANCELLED.includes(o.status);
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href} className="font-mono text-[12.5px] font-bold text-ink underline-offset-2 hover:underline">
            {o.tracking_code ?? o.id.slice(0, 8)}
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isCancelled ? "bg-red-50 text-red-600" : isDelivered ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
            {ORDER_STATUS_LABEL[o.status] ?? o.status}
          </span>
          {o.delai && <span className="text-[11.5px] font-semibold text-label">{DELAI_LABEL[o.delai] ?? o.delai}</span>}
        </div>
        <div className="mt-1 text-[12.5px] font-semibold text-ink">{client}</div>
        <div className="text-[12.5px] text-muted">{o.pickup_address} → {o.dropoff_address}</div>
        {(o.picked_up_at || o.delivered_at || o.delivery_recipient) && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-muted">
            {o.picked_up_at && <span>Enlevé à {hourOf(o.picked_up_at)}</span>}
            {o.delivered_at && <span>Livré le {dateTime(o.delivered_at)}</span>}
            {o.delivery_recipient && <span>Remis à {o.delivery_recipient}</span>}
            {o.delivery_photo_url && <a href={o.delivery_photo_url} target="_blank" rel="noreferrer" className="font-bold text-accent-dark underline">Photo</a>}
            {o.delivery_signature_url && <a href={o.delivery_signature_url} target="_blank" rel="noreferrer" className="font-bold text-accent-dark underline">Signature</a>}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-0.5">
        <span className="text-[12px] font-semibold text-muted">{dateTime(o.created_at)}</span>
        {price > 0 && !isCancelled && (
          <span className="text-[14px] font-bold text-ink">
            {eur(price)} TTC <span className="text-[11px] font-medium text-muted">· {eur(htOf(price))} HT</span>
          </span>
        )}
        {price > 0 && !isCancelled && !editing && (
          <div className="flex flex-col items-end gap-0.5 sm:mt-1">
            <button
              onClick={() => {
                setDraft(pay.amount.toFixed(2).replace(".", ","));
                setEditing(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1 text-[12.5px] font-bold text-accent-dark hover:bg-accent/15"
              title="Changer le montant du chauffeur"
            >
              Chauffeur : {eur(pay.amount)} <Pencil size={12} />
            </button>
            <span className="text-[11px] font-medium text-muted">
              {pay.manual ? "Montant fixé à la main" : `${Math.round(DRIVER_SHARE * 100)} % du HT, min. ${DRIVER_MIN_PAY} €`} · reste {eur(htOf(price) - pay.amount)} HT à la société
            </span>
          </div>
        )}
        {editing && (
          <form
            className="flex flex-wrap items-center justify-end gap-1.5 sm:mt-1"
            onSubmit={(e) => {
              e.preventDefault();
              const v = Number(draft.replace(",", ".").replace(/[^\d.]/g, ""));
              if (!Number.isFinite(v) || v < 0 || draft.trim() === "") return;
              save(Math.round(v * 100) / 100);
            }}
          >
            <input
              autoFocus
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-20 rounded-lg border border-line px-2 py-1 text-right text-[13px] font-bold text-ink"
              aria-label="Montant du chauffeur en euros"
            />
            <span className="text-[13px] font-bold text-ink">€</span>
            <button type="submit" disabled={saving} className="rounded-lg bg-accent px-2.5 py-1 text-[12px] font-bold text-white disabled:opacity-60">OK</button>
            {pay.manual && (
              <button type="button" disabled={saving} onClick={() => save(null)} className="rounded-lg border border-line px-2.5 py-1 text-[12px] font-bold text-muted">
                Remettre {Math.round(DRIVER_SHARE * 100)} %
              </button>
            )}
            <button type="button" onClick={() => setEditing(false)} className="px-1 text-[12px] font-bold text-muted">Annuler</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Card({ title, sub, aside, children }: { title: string; sub?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[12.5px] font-medium text-muted">{sub}</p>}
        </div>
        {aside}
      </div>
      <div className="flex flex-col divide-y divide-line">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 font-bold uppercase tracking-wide text-label">{label}</span>
      <span className="min-w-0 text-right text-ink">{value ?? "-"}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent = false }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3.5 sm:p-5 ${accent ? "border-accent/30 bg-accent/[0.04]" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`min-w-0 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.03em] sm:text-[11px] ${accent ? "text-accent" : "text-label"}`}>{label}</div>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${accent ? "bg-accent/10 text-accent" : "bg-paper text-muted"}`}>
          <Icon size={15} strokeWidth={2.25} />
        </div>
      </div>
      <div className={`mt-2 font-mono text-[20px] font-bold leading-none tracking-[-0.02em] tabular-nums sm:text-[26px] ${accent ? "text-accent" : "text-ink"}`}>{value}</div>
      {sub && <div className="mt-2 text-[11px] font-medium leading-snug text-muted sm:text-[12px]">{sub}</div>}
    </div>
  );
}
