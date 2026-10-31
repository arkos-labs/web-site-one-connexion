"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchSavedMethod, type SavedMethod } from "@/lib/saved-payment";
import { PageShell, SearchInput, KpiStrip, StatusPill, EmptyState, LoadingState, TH, TD, BTN_PRIMARY, BTN_ACCENT } from "@/components/dashboard/ui";
import { formatEur, htOf, normalizeOrderPriceTTC } from "@/lib/price-display";
import { CLIENT_VISIBLE_ORDERS } from "@/lib/admin-order-filter";

const eur = (n: number) => `${formatEur(n)} €`;

export default function FacturesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [orderRows, setOrderRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedMethod, setSavedMethod] = useState<SavedMethod | null>(null);
  useEffect(() => { fetchSavedMethod().then(setSavedMethod); }, []);

  // « Tout régler » : factures à régler relues chez Stripe, payées en une fois.
  const [payAll, setPayAll] = useState<{ count: number; totalCents: number; left: number } | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // Retour de la page de paiement Stripe (?reglement=ok).
  const justPaid = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("reglement") === "ok",
    () => false
  );
  useEffect(() => {
    fetch("/api/invoices/pay-all")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPayAll(d))
      .catch(() => {});
  }, []);
  const startPayAll = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/invoices/pay-all", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setPayError(data.error || "Paiement indisponible pour le moment.");
    } catch {
      setPayError("Paiement indisponible pour le moment.");
    }
    setPaying(false);
  };

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("invoices")
          .select("id, invoice_number, billing_period_start, status, total_amount, invoice_items(count)")
          .eq("client_id", user.id)
          .order("billing_period_start", { ascending: false });

        setRows(data || []);

        // Factures Stripe par course (payée par carte, à 30 jours, ou à régler) : visibles une fois la
        // course livrée, ou dès la commande pour un virement (la facture est partie avec l'IBAN).
        const { data: orders } = await supabase
          .from("orders")
          .select("id, tracking_code, created_at, delivered_at, status, price_estimate, amount_due, billing_status, stripe_invoice_id, payment_due_date")
          .eq("user_id", user.id)
          .or(CLIENT_VISIBLE_ORDERS)
          .not("stripe_invoice_id", "is", null)
          .order("created_at", { ascending: false });
        setOrderRows(
          (orders || []).filter((o: any) =>
            ["delivered", "livree"].includes(o.status) || (o.billing_status === "virement_attendu" && !["annulee", "cancelled"].includes(o.status))
          )
        );
      } catch (err) {
        console.error("Erreur de chargement des factures:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Une facture par course livrée : émise et envoyée par email dès la livraison, payable sous 30 jours.
  const invoices = useMemo(
    () =>
      [
        ...rows.map((r) => ({
          id: r.id as string,
          href: `/dashboard/factures/${r.id}`,
          number: r.invoice_number as string,
          sortAt: r.billing_period_start as string,
          date: new Date(r.billing_period_start).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
          amount: Number(r.total_amount),
          courses: (r.invoice_items?.[0]?.count ?? 0) as number,
          navettes: 0,
          status: r.status as string,
          dueDate: null as string | null,
        })),
        ...orderRows.map((o) => ({
          id: o.id as string,
          href: `/dashboard/suivi/${o.id}`,
          number: `Course ${o.tracking_code}`,
          sortAt: (o.delivered_at || o.created_at) as string,
          date: new Date(o.delivered_at || o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          amount: Number(o.amount_due ?? normalizeOrderPriceTTC(o.price_estimate, (o as any).pickup_address, (o as any).dropoff_address) ?? 0),
          courses: 1,
          navettes: 0,
          status: o.billing_status === "paye" ? "payee" : o.billing_status === "rembourse" ? "rembourse" : o.billing_status === "echec" ? "echec" : "emise",
          dueDate: (o.payment_due_date as string | null) ?? null,
        })),
      ].sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime()),
    [rows, orderRows]
  );

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) => i.number.toLowerCase().includes(q) || i.date.toLowerCase().includes(q));
  }, [invoices, search]);

  const pendingTotal = invoices.filter((i) => i.status === "emise" || i.status === "echec").reduce((sum, i) => sum + i.amount, 0);
  const latest = invoices[0];

  const volume = (i: { courses: number; navettes: number }) =>
    [
      i.courses > 0 ? `${i.courses} course${i.courses > 1 ? "s" : ""}` : null,
      i.navettes > 0 ? `${i.navettes} navette${i.navettes > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" + ");

  const Status = ({ status, dueDate }: { status: string; dueDate?: string | null }) =>
    status === "payee" ? (
      <StatusPill tone="green">Réglée</StatusPill>
    ) : status === "rembourse" ? (
      <StatusPill tone="blue">Remboursée</StatusPill>
    ) : status === "echec" ? (
      <StatusPill tone="red">Paiement échoué</StatusPill>
    ) : ["en_cours", "emission", "envoi", "retenue"].includes(status) ? (
      <StatusPill tone="blue">En cours d&apos;émission</StatusPill>
    ) : (
      <StatusPill tone="orange">
        {dueDate
          ? `À régler avant le ${new Date(`${dueDate}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
          : "À régler"}
      </StatusPill>
    );

  return (
    <PageShell
      eyebrow="Facturation & relevés"
      title="Vos factures"
      subtitle="Une facture par course livrée, envoyée dès la livraison. Elle indique si elle est réglée ou en attente de paiement."
      actions={<SearchInput label="Rechercher une facture" value={search} onChange={setSearch} placeholder="N° de facture, mois…" />}
    >
      <KpiStrip
        items={[
          { label: "Total à régler (TTC)", value: eur(pendingTotal), accent: pendingTotal > 0 },
          { label: "Dernière facture", value: latest ? eur(latest.amount) : "-", hint: latest?.number },
          {
            label: "Moyen de paiement",
            value: savedMethod
              ? <span className="text-sm font-bold sm:text-base">{savedMethod.label}</span>
              : <Link href="/dashboard/parametres?onglet=facturation" className="text-sm font-bold text-white/60 underline hover:text-white sm:text-base">Aucun - en ajouter un</Link>,
          },
        ]}
      />

      {justPaid && (
        <div role="status" className="flex items-start gap-3 border-b border-line bg-green-50 px-5 py-4 text-sm text-green-800 sm:px-6">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>
            <strong>Paiement reçu, merci.</strong> Vos factures passent en « Réglée » dans quelques instants. Le reçu
            détaillé, avec une ligne par course, arrive par e-mail.
          </p>
        </div>
      )}

      {!justPaid && payAll && payAll.count > 0 && (
        <div className="flex flex-col gap-3 border-b border-line bg-paper-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-ink">
              {payAll.count} facture{payAll.count > 1 ? "s" : ""} à régler · {eur(payAll.totalCents / 100)} TTC
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Réglez-les en un seul paiement par carte. Vous recevez un reçu avec le détail de chaque course.
              {payAll.left > 0 && ` ${payAll.left} facture${payAll.left > 1 ? "s" : ""} plus récente${payAll.left > 1 ? "s" : ""} ${payAll.left > 1 ? "resteront" : "restera"} à régler ensuite.`}
            </p>
            {payError && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{payError}</p>}
          </div>
          <button type="button" onClick={startPayAll} disabled={paying} className={`${BTN_ACCENT} h-11 w-full sm:w-auto`}>
            {paying && <Loader2 size={16} className="animate-spin" />}
            Tout régler · {eur(payAll.totalCents / 100)}
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState text="Chargement de vos factures…" />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices.length === 0 ? "Aucune facture pour le moment" : "Aucun résultat"}
          text={invoices.length === 0 ? "Votre première facture vous sera envoyée dès votre première course livrée." : "Essayez une autre recherche."}
          action={
            invoices.length === 0 ? (
              <Link href="/dashboard/commander" className={`${BTN_PRIMARY} text-white hover:text-white`}>
                <Plus size={16} strokeWidth={2.5} />
                Commander une course
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="hidden w-full text-sm text-ink md:table">
            <thead className="sticky top-0 z-10 border-b border-line bg-paper-card">
              <tr>
                <th scope="col" className={TH}>N° facture</th>
                <th scope="col" className={TH}>Période</th>
                <th scope="col" className={TH}>Volume</th>
                <th scope="col" className={`${TH} text-right`}>Montant</th>
                <th scope="col" className={TH}>Statut</th>
                <th scope="col" className={`${TH} w-10`}><span className="sr-only">Détails</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => router.push(invoice.href)}
                  className="group cursor-pointer transition-colors hover:bg-paper-card"
                >
                  <td className={`${TD} whitespace-nowrap`}>
                    <Link
                      href={invoice.href}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-[13px] font-bold text-ink hover:text-accent-dark"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className={`${TD} whitespace-nowrap capitalize text-muted`}>{invoice.date}</td>
                  <td className={`${TD} whitespace-nowrap text-muted`}>{volume(invoice)}</td>
                  <td className={`${TD} whitespace-nowrap text-right font-extrabold tabular-nums`}>
                    <div className="text-sm font-extrabold text-ink">{eur(invoice.amount)} TTC</div>
                    <div className="text-[11px] font-medium text-muted">{eur(htOf(invoice.amount))} HT</div>
                  </td>
                  <td className={`${TD} whitespace-nowrap`}><Status status={invoice.status} dueDate={invoice.dueDate} /></td>
                  <td className={`${TD} text-right`}>
                    <ChevronRight size={18} className="text-label transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-line md:hidden">
            {filteredInvoices.map((invoice) => (
              <li key={invoice.id}>
                <Link href={invoice.href} className="flex flex-col gap-2 px-5 py-4 text-ink hover:bg-paper-card hover:text-ink">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] font-bold">{invoice.number}</span>
                    <Status status={invoice.status} dueDate={invoice.dueDate} />
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs capitalize text-muted">{invoice.date} · {volume(invoice)}</span>
                    <div className="text-right">
                      <div className="text-base font-extrabold tabular-nums">{eur(invoice.amount)} TTC</div>
                      <div className="text-[11px] font-medium text-muted">{eur(htOf(invoice.amount))} HT</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageShell>
  );
}
