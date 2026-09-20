"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
};

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
  monthLabel: string;
  courses: number;
  amount: number;
  status: "en_cours" | "en_attente";
};

function initialsOf(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "—";
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_cours: "En cours",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function AdminClientDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const clientId = decodeURIComponent(params.id as string);
  const guestEmail = clientId.startsWith("guest:") ? clientId.slice("guest:".length) : null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [navettes, setNavettes] = useState<NavetteRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    // Client de la page publique : pas de compte, on reconstitue la fiche depuis ses commandes.
    if (guestEmail) {
      const { data: rows } = await supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at, driver_id, client_type, contact_name, contact_phone")
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

    const [{ data: p }, { data: c }, { data: o }, { data: n }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").eq("id", clientId).eq("role", "client").maybeSingle(),
      supabase.from("clients").select("company_name, siret, tax_id, billing_address, billing_postal_code, billing_city, contact_email").eq("id", clientId).maybeSingle(),
      supabase
        .from("orders")
        .select("id, tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at, driver_id")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("navettes")
        .select("id, name, pickup_address, dropoff_address, days_str, status, estimated_price")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false }),
      supabase.from("addresses").select("id, label, address, is_default, contact_name, contact_phone").eq("user_id", clientId),
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
    setLoading(false);
  }, [supabase, clientId, guestEmail]);

  useEffect(() => {
    load();
  }, [load]);

  // Regroupe les courses par mois pour simuler la facturation, à l'identique
  // de app/dashboard/factures/page.tsx : il n'existe pas de table "invoices",
  // le statut de règlement n'est donc pas suivi — seul "en cours" (mois en
  // cours) vs "en attente" (mois passés) peut être déduit honnêtement.
  const invoices: Invoice[] = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const groups: Record<string, { monthLabel: string; courses: number; amount: number }> = {};

    orders
      .filter((o) => o.status !== "annulee")
      .forEach((o) => {
        const date = new Date(o.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        if (!groups[key]) groups[key] = { monthLabel, courses: 0, amount: 0 };
        groups[key].courses += 1;
        groups[key].amount += o.price_estimate ? Number(o.price_estimate) : 0;
      });

    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([key, val]) => ({
        id: `FA-${key}`,
        monthLabel: val.monthLabel,
        courses: val.courses,
        amount: val.amount,
        status: key === currentKey ? "en_cours" : "en_attente",
      }));
  }, [orders]);

  const revenue = orders.filter((o) => o.status !== "annulee").reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);
  const activeOrders = orders.filter((o) => !["livree", "annulee"].includes(o.status));
  const unpaidTotal = invoices.filter((i) => i.status === "en_attente").reduce((sum, i) => sum + i.amount, 0);

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
          {profile.company ? (
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
        <StatCard icon={ShoppingBag} label="Commandes" value={String(orders.length)} sub={activeOrders.length > 0 ? `${activeOrders.length} en cours` : "Aucune en cours"} />
        <StatCard icon={Euro} label="CA généré" value={`${revenue.toFixed(2)} €`} sub="Hors courses annulées" />
        <StatCard icon={FileText} label="Facturation en attente" value={`${unpaidTotal.toFixed(2)} €`} sub={unpaidTotal > 0 ? "Mois précédents à régler" : "À jour"} accent={unpaidTotal > 0} />
        <StatCard icon={Building2} label="Navettes récurrentes" value={String(navettes.length)} sub={navettes.filter((n) => n.status === "active").length > 0 ? `${navettes.filter((n) => n.status === "active").length} active(s)` : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* Facturation */}
          <div className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="border-b border-line p-5">
              <h2 className="text-[15px] font-bold text-ink">Facturation</h2>
              <p className="mt-0.5 text-[12.5px] font-medium text-muted">
                Regroupement mensuel des commandes — aucun suivi de paiement n&apos;existe encore dans l&apos;outil, seul le statut &quot;en cours / à régler&quot; est déduit du mois.
              </p>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {invoices.length === 0 && (
                <div className="p-6 text-center text-[13px] font-medium text-muted">Aucune commande facturable pour l&apos;instant.</div>
              )}
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-bold capitalize text-ink">{inv.monthLabel}</div>
                    <div className="text-[12.5px] text-muted">{inv.courses} course{inv.courses > 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-ink">{inv.amount.toFixed(2)} €</span>
                    {inv.status === "en_cours" ? (
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
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted">{o.pickup_address} → {o.dropoff_address}</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[12.5px] font-semibold text-muted">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(o.created_at))}
                    </span>
                    <span className="text-[14px] font-bold text-ink">{o.price_estimate ? `${o.price_estimate.toFixed(2)} €` : "—"}</span>
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
                    <span className="text-[14px] font-bold text-ink">{(n.estimated_price ?? 0).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-ink">{profile.company ? "Informations société" : "Coordonnées"}</h3>
            <div className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Téléphone" value={profile.phone} />
              {profile.company && !profile.guest && (
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
      <span className="text-right text-ink">{value || "—"}</span>
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
