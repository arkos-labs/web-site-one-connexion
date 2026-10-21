"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatEur, htOf, normalizeOrderPriceTTC } from "@/lib/price-display";
import { AdminPage, ErrorState, LoadingState } from "@/components/dashboard/ui";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Euro,
  FileText,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
  siret: string | null;
  vat_number: string | null;
  billing_address: string | null;
  email: string | null;
  guest: boolean;
};

type OrderRow = {
  id: string;
  tracking_code: string | null;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price_estimate: number | null;
  created_at: string;
  driver_id: string | null;
  client_type?: string | null;
  billing_status: string | null;
  amount_due: number | null;
  payment_due_date: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  stripe_invoice_id: string | null;
};

/** Paiement d'une course, lu sur orders.billing_status (facture Stripe par course). */
type PaymentTone = "green" | "blue" | "orange" | "red" | "amber";
const PAYMENT_TONE: Record<PaymentTone, string> = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
};
const shortDate = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));

function paymentOf(o: OrderRow): { label: string; tone: PaymentTone; paid: boolean; due: boolean } | null {
  switch (o.billing_status) {
    case "paye":
      return { label: o.paid_at ? `Payée le ${shortDate(o.paid_at)}` : "Payée", tone: "green", paid: true, due: false };
    case "rembourse":
      return { label: "Remboursée", tone: "blue", paid: false, due: false };
    case "a_regler":
    case "virement_attendu":
      return { label: o.payment_due_date ? `À régler avant le ${shortDate(o.payment_due_date)}` : "À régler", tone: "orange", paid: false, due: true };
    case "a_debiter":
      return { label: o.payment_due_date ? `Prélèvement le ${shortDate(o.payment_due_date)}` : "Prélèvement prévu", tone: "blue", paid: false, due: true };
    case "prelevement_en_cours":
      return { label: "Prélèvement en cours", tone: "blue", paid: false, due: true };
    case "en_retard":
      return { label: "En retard", tone: "red", paid: false, due: true };
    case "echec":
      return { label: "Paiement échoué", tone: "red", paid: false, due: true };
    case "annule":
      return null;
    default:
      // Course livrée sans facture : rien n'a été demandé au client.
      return DELIVERED.includes(o.status) ? { label: "Non facturée", tone: "amber", paid: false, due: false } : null;
  }
}

type NavetteRow = {
  id: string;
  name: string;
  pickup_address: string;
  dropoff_address: string;
  days_str: string | null;
  status: string;
  estimated_price: number | null;
};

type AddressRow = {
  id: string;
  label: string;
  address: string;
  is_default: boolean | null;
  contact_name: string | null;
  contact_phone: string | null;
};

type Invoice = {
  id: string;
  number: string;
  monthLabel: string;
  courses: number;
  orderIds: string[];
  amount: number;
  status: string;
  url: string | null;
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "-";
}

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

export default function AdminClientDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const clientId = decodeURIComponent(params.id as string);
  const guestEmail = clientId.startsWith("guest:") ? clientId.slice("guest:".length) : null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [navettes, setNavettes] = useState<NavetteRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    // Client de la page publique : pas de compte, on reconstitue la fiche depuis ses commandes.
    if (guestEmail) {
      const { data: rows } = await supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at, driver_id, client_type, contact_name, contact_phone, billing_status, amount_due, payment_due_date, paid_at, delivered_at, stripe_invoice_id")
        .is("user_id", null)
        .ilike("contact_email", guestEmail.replace(/[\\%_]/g, "\\$&"))
        .order("created_at", { ascending: false });

      if (!rows || rows.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const pro = rows.some((r) => r.client_type === "entreprise");
      const name = rows[0].contact_name || null;
      setProfile({
        id: clientId,
        full_name: pro ? null : name,
        company: pro ? name : null,
        phone: rows[0].contact_phone || null,
        created_at: rows[rows.length - 1].created_at,
        siret: null,
        vat_number: null,
        billing_address: null,
        email: guestEmail,
        guest: true,
      });
      setOrders(rows);
      setNavettes([]);
      setAddresses([]);
      setLoading(false);
      return;
    }

    const [{ data: p }, { data: c }, { data: o }, { data: n }, { data: a }, { data: inv }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").eq("id", clientId).eq("role", "client").maybeSingle(),
      supabase.from("clients").select("company_name, siret, tax_id, billing_address, billing_postal_code, billing_city, contact_email").eq("id", clientId).maybeSingle(),
      supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at, driver_id, client_type, billing_status, amount_due, payment_due_date, paid_at, delivered_at, stripe_invoice_id")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, days_str, status, estimated_price")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false }),
      supabase.from("addresses").select("id, label, address, is_default, contact_name, contact_phone").eq("user_id", clientId),
      supabase
        .from("invoices")
        .select("id, invoice_number, billing_period_start, status, total_amount, hosted_invoice_url, invoice_items(order_id)")
        .eq("client_id", clientId)
        .order("billing_period_start", { ascending: false }),
    ]);

    if (!p) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const billing = [c?.billing_address, [c?.billing_postal_code, c?.billing_city].filter(Boolean).join(" ")]
      .filter((part) => part && part !== "À remplir")
      .join(", ");

    setProfile({
      ...p,
      company: c?.company_name || null,
      siret: c?.siret || null,
      vat_number: c?.tax_id || null,
      billing_address: billing || null,
      email: c?.contact_email || null,
      guest: false,
    });
    setOrders(o ?? []);
    setNavettes(n ?? []);
    setAddresses(a ?? []);
    setInvoices(
      (inv ?? []).map((r: any) => ({
        id: r.id,
        number: r.invoice_number,
        monthLabel: new Date(r.billing_period_start).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
        courses: r.invoice_items?.length ?? 0,
        orderIds: (r.invoice_items ?? []).map((it: any) => it.order_id),
        amount: Number(r.total_amount),
        status: r.status,
        url: r.hosted_invoice_url,
      }))
    );
    setLoading(false);
  }, [supabase, clientId, guestEmail]);

  useEffect(() => {
    load();
  }, [load]);

  // Factures Stripe des courses : lien vers la page de la facture et son PDF (même route que le client).
  const [stripeInvoices, setStripeInvoices] = useState<Record<string, { number: string | null; url: string | null; pdf: string | null }>>({});
  useEffect(() => {
    const withInvoice = orders.filter((o) => o.stripe_invoice_id && !CANCELLED.includes(o.status));
    if (!withInvoice.length) return;
    let cancelled = false;
    Promise.all(
      withInvoice.map((o) =>
        fetch("/api/orders/invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: o.id }) })
          .then((r) => r.json())
          .then((d) => [o.id, d?.invoice ?? null] as const)
          .catch(() => [o.id, null] as const)
      )
    ).then((entries) => {
      if (!cancelled) setStripeInvoices(Object.fromEntries(entries.filter(([, inv]) => inv)));
    });
    return () => { cancelled = true; };
  }, [orders]);

  const revenue = orders.filter((o) => !CANCELLED.includes(o.status)).reduce((sum, o) => sum + (normalizeOrderPriceTTC(o.price_estimate, o.pickup_address, o.dropoff_address) ?? 0), 0);
  const activeOrders = orders.filter((o) => ![...DELIVERED, ...CANCELLED].includes(o.status));
  // À régler : factures déjà émises. À facturer : factures du mois encore ouvertes (émises le 1er du mois suivant).
  // Factures par course (Stripe), avec leur paiement.
  // Une course comprise dans une facture mensuelle est déjà facturée : elle apparaît dans cette facture.
  const inMonthlyInvoice = new Set(invoices.flatMap((i) => i.orderIds));
  const orderBills = orders
    .filter((o) => o.billing_status || !inMonthlyInvoice.has(o.id))
    .map((o) => ({ order: o, payment: paymentOf(o), amount: Number(o.amount_due ?? normalizeOrderPriceTTC(o.price_estimate, o.pickup_address, o.dropoff_address) ?? 0) }))
    .filter((b): b is { order: OrderRow; payment: NonNullable<ReturnType<typeof paymentOf>>; amount: number } => b.payment !== null);
  const orderDueTotal = orderBills.filter((b) => b.payment.due).reduce((sum, b) => sum + b.amount, 0);
  const paidTotal =
    orderBills.filter((b) => b.payment.paid).reduce((sum, b) => sum + b.amount, 0) +
    invoices.filter((i) => i.status === "payee").reduce((sum, i) => sum + i.amount, 0);
  const unpaidTotal = orderDueTotal + invoices.filter((i) => i.status === "emise" || i.status === "echec").reduce((sum, i) => sum + i.amount, 0);
  const toBillTotal = invoices.filter((i) => i.status === "en_cours" || i.status === "emission" || i.status === "retenue").reduce((sum, i) => sum + i.amount, 0);
  const pendingTotal = unpaidTotal + toBillTotal;
  // Courses livrées sans prix : elles n'entrent dans aucune facture.
  const unpricedDelivered = orders.filter((o) => DELIVERED.includes(o.status) && o.price_estimate == null);
  // Un client est pro s'il a une société OU a commandé en tant qu'entreprise (la fiche société peut être vide).
  const isPro = !!profile?.company || orders.some((o) => o.client_type === "entreprise");

  const back = { href: "/admin/clients", label: "Retour aux clients" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement du profil client…" />
      </div>
    );
  }

  if (notFound || !profile) {
    return <ErrorState text="Client introuvable." back={back} />;
  }

  return (
    <AdminPage
      back={back}
      eyebrow="Fiche client"
      title={
        <>
          <span>{profile.full_name || "Client sans nom"}</span>
          {isPro ? (
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
              <Briefcase size={11} /> Entreprise
            </span>
          ) : (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Particulier</span>
          )}
        </>
      }
      subtitle={[
        profile.company,
        profile.phone || "Téléphone non renseigné",
        profile.email,
        profile.guest ? "Commande sans compte" : null,
        `Client depuis le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.created_at))}`,
      ]
        .filter(Boolean)
        .join(" · ")}
      actions={
        profile.guest ? undefined : (
          <Link
            href={`/admin/courses?client=${profile.id}&name=${encodeURIComponent(profile.company || profile.full_name || "")}`}
            className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-accent px-4 text-[13px] font-bold text-white transition-colors hover:bg-accent-dark hover:text-white"
          >
            Voir dans Courses &amp; dispatch
          </Link>
        )
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Euro} label="CA généré" value={`${revenue.toFixed(2)} € TTC`} sub={`${htOf(revenue).toFixed(2)} € HT · Hors annulations`} />
        <StatCard
          icon={FileText}
          label="Facturation en attente"
          value={`${pendingTotal.toFixed(2)} € TTC`}
          sub={
            unpaidTotal > 0 && toBillTotal > 0
              ? `${unpaidTotal.toFixed(2)} € à régler · ${toBillTotal.toFixed(2)} € en cours d'émission`
              : unpaidTotal > 0
                ? "Factures émises à régler"
                : toBillTotal > 0
                  ? "Facture en cours d'émission"
                  : unpricedDelivered.length > 0
                    ? `${unpricedDelivered.length} course${unpricedDelivered.length > 1 ? "s" : ""} livrée${unpricedDelivered.length > 1 ? "s" : ""} sans prix`
                    : "À jour"
          }
          accent={pendingTotal > 0 || unpricedDelivered.length > 0}
        />
        <StatCard icon={CheckCircle2} label="Déjà payé" value={`${paidTotal.toFixed(2)} € TTC`} sub={`${htOf(paidTotal).toFixed(2)} € HT`} />
        <StatCard icon={Building2} label="Navettes récurrentes" value={String(navettes.length)} sub={navettes.filter((n) => n.status === "active").length > 0 ? `${navettes.filter((n) => n.status === "active").length} active(s)` : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="flex flex-col gap-4">
          {/* Facturation */}
          <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="border-b border-line p-5">
              <h2 className="text-[15px] font-bold text-ink">Facturation</h2>
              <p className="mt-0.5 text-[12.5px] font-medium text-muted">
                Une facture par course livrée, envoyée par Stripe dès la livraison, payable sous 30 jours (carte ou virement). Le statut indique si le client a payé.
              </p>
            </div>
            {unpricedDelivered.length > 0 && (
              <div className="border-b border-line bg-amber-50 px-5 py-3 text-[12.5px] font-semibold text-amber-800">
                {unpricedDelivered.length} course{unpricedDelivered.length > 1 ? "s" : ""} livrée{unpricedDelivered.length > 1 ? "s" : ""} sans prix enregistré
                ({unpricedDelivered.map((o) => o.tracking_code ?? o.id.slice(0, 8)).join(", ")}) : elle{unpricedDelivered.length > 1 ? "s" : ""} n&apos;apparaî{unpricedDelivered.length > 1 ? "ssent" : "t"} dans aucune facture tant que le prix n&apos;est pas renseigné.
              </div>
            )}
            <div className="flex flex-col divide-y divide-line">
              {invoices.length === 0 && orderBills.length === 0 && (
                <div className="p-6 text-center text-[13px] font-medium text-muted">
                  {profile.guest ? "Client sans compte : chaque course est payée en ligne à la commande." : "Aucune course livrée facturable pour l'instant."}
                </div>
              )}
              {orderBills.map(({ order: o, payment, amount }) => (
                <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[12.5px] font-bold text-ink">Course {o.tracking_code ?? o.id.slice(0, 8)}</div>
                    <div className="text-[12.5px] text-muted">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(o.delivered_at || o.created_at))}
                      {stripeInvoices[o.id]?.url && (
                        <> · <a href={stripeInvoices[o.id].url!} target="_blank" rel="noreferrer" className="font-bold text-accent-dark underline">Voir la facture{stripeInvoices[o.id].number ? ` ${stripeInvoices[o.id].number}` : ""}</a></>
                      )}
                      {stripeInvoices[o.id]?.pdf && (
                        <> · <a href={stripeInvoices[o.id].pdf!} className="font-bold text-accent-dark underline">PDF</a></>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-ink">{amount.toFixed(2)} € TTC</div>
                      <div className="text-[11px] font-medium text-muted">{htOf(amount).toFixed(2)} € HT</div>
                    </div>
                    <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${PAYMENT_TONE[payment.tone]}`}>
                      {payment.paid ? <CheckCircle2 size={12} /> : <Clock size={12} />} {payment.label}
                    </span>
                  </div>
                </div>
              ))}
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-bold capitalize text-ink">{inv.monthLabel}</div>
                    <div className="text-[12.5px] text-muted">
                      {inv.number} · {inv.courses} course{inv.courses > 1 ? "s" : ""}
                      {" · "}<Link href={`/admin/factures/${inv.id}`} className="font-bold text-accent-dark underline">Voir la facture</Link>
                      {inv.url && (
                        <> · <a href={inv.url} target="_blank" rel="noreferrer" className="font-bold text-accent-dark underline">Page de paiement</a></>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-ink">{inv.amount.toFixed(2)} € TTC</div>
                      <div className="text-[11px] font-medium text-muted">{htOf(inv.amount).toFixed(2)} € HT</div>
                    </div>
                    {inv.status === "payee" ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                        <CheckCircle2 size={12} /> Réglée
                      </span>
                    ) : inv.status === "echec" ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                        <Clock size={12} /> Paiement échoué
                      </span>
                    ) : inv.status === "retenue" ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        <Clock size={12} /> Retenue
                      </span>
                    ) : inv.status === "en_cours" || inv.status === "emission" ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        <RefreshCw size={12} /> En cours
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                        <Clock size={12} /> À régler
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commandes */}
          <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="border-b border-line p-5">
              <h2 className="text-[15px] font-bold text-ink">Historique des commandes</h2>
              <p className="mt-0.5 text-[12.5px] font-medium text-muted">{orders.length} commande{orders.length > 1 ? "s" : ""} au total.</p>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {orders.length === 0 && (
                <div className="p-6 text-center text-[13px] font-medium text-muted">Aucune commande pour l&apos;instant.</div>
              )}
              {orders.map((o) => (
                <div key={o.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12.5px] font-bold text-ink">{o.tracking_code ?? o.id.slice(0, 8)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${o.status === "annulee" ? "bg-red-50 text-red-600" : o.status === "livree" ? "bg-green-50 text-green-700" : o.driver_id ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </span>
                      {(() => {
                        const payment = !o.billing_status && inMonthlyInvoice.has(o.id) ? null : paymentOf(o);
                        return payment && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${PAYMENT_TONE[payment.tone]}`}>{payment.label}</span>
                        );
                      })()}
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted">{o.pickup_address} → {o.dropoff_address}</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[12.5px] font-semibold text-muted">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(o.created_at))}
                    </span>
                    {(() => {
                      const pTtc = normalizeOrderPriceTTC(o.price_estimate, o.pickup_address, o.dropoff_address);
                      return (
                        <div className="text-right">
                          <div className="text-[14px] font-bold text-ink">{pTtc ? `${pTtc.toFixed(2)} € TTC` : "-"}</div>
                          {pTtc && <div className="text-[11px] font-medium text-muted">{htOf(pTtc).toFixed(2)} € HT</div>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navettes */}
          <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="border-b border-line p-5">
              <h2 className="text-[15px] font-bold text-ink">Navettes récurrentes</h2>
              <p className="mt-0.5 text-[12.5px] font-medium text-muted">{navettes.length} navette{navettes.length > 1 ? "s" : ""} configurée{navettes.length > 1 ? "s" : ""}.</p>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {navettes.length === 0 && (
                <div className="p-6 text-center text-[13px] font-medium text-muted">Aucune navette récurrente pour l&apos;instant.</div>
              )}
              {navettes.map((n) => (
                <div key={n.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink">{n.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${n.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {n.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted">{n.pickup_address} → {n.dropoff_address}</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[12.5px] font-semibold text-muted">{n.days_str || "Jours non définis"}</span>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-ink">{n.estimated_price != null ? `${n.estimated_price.toFixed(2)} € TTC` : "Sur devis"}</div>
                      {n.estimated_price && <div className="text-[11px] font-medium text-muted">{htOf(n.estimated_price).toFixed(2)} € HT</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-ink">{isPro ? "Informations société" : "Coordonnées"}</h3>
            <div className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Téléphone" value={profile.phone} />
              {isPro && !profile.guest && (
                <>
                  <InfoRow label="SIRET" value={profile.siret} />
                  <InfoRow label="N° TVA" value={profile.vat_number} />
                  <InfoRow label="Adresse de facturation" value={profile.billing_address} />
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-ink">Adresses favorites</h3>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">{addresses.length}</span>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {addresses.length === 0 && <p className="text-[12.5px] font-medium text-muted">Aucune adresse enregistrée.</p>}
              {addresses.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-[12.5px]">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-label" />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-ink">
                      {a.label}
                      {a.is_default && <CheckCircle2 size={12} className="text-green-600" />}
                    </div>
                    <div className="text-muted">{a.address}</div>
                    {a.contact_name && <div className="text-muted">{a.contact_name} · {a.contact_phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold uppercase tracking-wide text-label">{label}</span>
      <span className="text-right text-ink">{value || "-"}</span>
    </div>
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
      <div className={`mt-2 font-mono text-[20px] sm:text-[24px] font-bold leading-none tracking-[-0.02em] tabular-nums ${accent ? "text-accent" : "text-ink"}`}>
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
