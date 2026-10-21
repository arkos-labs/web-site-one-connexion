"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { CreditCard, Download, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShell, KpiStrip, StatusPill, ErrorState, LoadingState, TH, TD, BTN_ACCENT } from "@/components/dashboard/ui";
import { htOf, normalizeOrderPriceTTC } from "@/lib/price-display";

const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

type InvoiceInfo = {
  number: string;
  monthLabel: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  payUrl: string | null;
  pdfUrl: string | null;
};

export default function FactureDetailsPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  // La même page sert à l'admin (/admin/factures/[id]) : le retour mène alors à la fiche client.
  const adminView = usePathname()?.startsWith("/admin") ?? false;

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Non authentifié");
          return;
        }

        const { data: inv } = await supabase
          .from("invoices")
          .select(
            "id, client_id, invoice_number, billing_period_start, status, subtotal, tax_amount, total_amount, hosted_invoice_url, pdf_url, " +
              "invoice_items(total_price, orders(id, tracking_code, created_at, pickup_address, dropoff_address, stops, delivered_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url))"
          )
          .eq("id", invoiceId)
          .maybeSingle(); // RLS : le client ne lit que ses factures, l'admin lit toutes

        if (!inv) {
          setError("Facture introuvable");
          return;
        }

        const lines = ((inv as any).invoice_items || [])
          .filter((it: any) => it.orders)
          .map((it: any) => ({ ...it.orders, price_estimate: it.total_price, _type: "order" as const }))
          .sort((a: any, b: any) => new Date(b.delivered_at || b.created_at).getTime() - new Date(a.delivered_at || a.created_at).getTime());

        setOrders(lines);
        setInvoice({
          number: (inv as any).invoice_number,
          monthLabel: new Date((inv as any).billing_period_start).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
          status: (inv as any).status,
          subtotal: Number((inv as any).subtotal),
          tax: Number((inv as any).tax_amount),
          total: Number((inv as any).total_amount),
          payUrl: (inv as any).hosted_invoice_url,
          pdfUrl: (inv as any).pdf_url,
        });

        setClientId((inv as any).client_id);
      } catch (err) {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const back = adminView
    ? { href: clientId ? `/admin/clients/${clientId}` : "/admin/clients", label: "Fiche client" }
    : { href: "/dashboard/factures", label: "Vos factures" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la facture…" />
      </div>
    );
  }

  if (error || !invoice) {
    return <ErrorState text={error || "Facture introuvable"} back={{ href: back.href, label: "Retour aux factures" }} />;
  }

  const unpaid = invoice.status === "emise" || invoice.status === "echec";

  const Route = ({ o }: { o: any }) => {
    const stops: string[] = (Array.isArray(o.stops) ? o.stops : []).map((st: any) => st?.address || String(st));
    const pts = [
      { c: "border-ink bg-white", a: o.pickup_address },
      ...stops.map((a) => ({ c: "border-label bg-white", a })),
      { c: "border-accent bg-accent", a: o.dropoff_address },
    ];
    return (
      <ol className="flex flex-col gap-0.5">
        {pts.map((pt, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] font-semibold leading-snug text-ink">
            <span aria-hidden className={`mt-[4px] box-content h-1.5 w-1.5 shrink-0 rounded-full border-2 ${pt.c}`} />
            <span>{pt.a}</span>
          </li>
        ))}
      </ol>
    );
  };

  const Delivery = ({ o }: { o: any }) =>
    o.delivered_at ? (
      <div className="flex flex-col gap-0.5 text-xs text-muted">
        <span className="font-bold text-green-700">{shortDate(o.delivered_at)} à {hhmm(o.delivered_at)}</span>
        {o.delivery_recipient && <span>Remis à : <strong className="text-ink">{o.delivery_recipient}</strong></span>}
        {o.delivery_department && <span>Lieu : <strong className="text-ink">{o.delivery_department}</strong></span>}
        {o.delivery_comment && <span className="italic">{o.delivery_comment}</span>}
        {o.delivery_photo_url && <a href={o.delivery_photo_url} target="_blank" rel="noreferrer" className="font-bold text-accent-dark underline">Photo</a>}
      </div>
    ) : (
      <span className="text-xs text-label">-</span>
    );

  return (
    <PageShell
      back={back}
      eyebrow="Facture"
      title={<span className="capitalize">{invoice.monthLabel}</span>}
      subtitle={`${orders.length} course${orders.length > 1 ? "s" : ""} livrée${orders.length > 1 ? "s" : ""} · ${invoice.number}`}
      actions={
        <>
          <StatusPill tone={invoice.status === "payee" ? "green" : invoice.status === "echec" ? "red" : invoice.status === "emise" ? "orange" : "blue"}>
            {invoice.status === "payee" ? "Réglée" : invoice.status === "echec" ? "Paiement échoué" : invoice.status === "emise" ? "À régler" : "En cours"}
          </StatusPill>
          {unpaid && invoice.payUrl && (
            <a href={invoice.payUrl} target="_blank" rel="noreferrer" className={BTN_ACCENT}>
              <CreditCard size={16} strokeWidth={2.5} />
              Payer la facture
            </a>
          )}
          {/* La facture est celle de Stripe : on ouvre et télécharge exactement ce document. */}
          {!unpaid && invoice.payUrl && (
            <a href={invoice.payUrl} target="_blank" rel="noreferrer" className={BTN_ACCENT}>
              <ExternalLink size={16} strokeWidth={2.5} />
              Voir la facture
            </a>
          )}
          {invoice.pdfUrl ? (
            <a href={invoice.pdfUrl} className={BTN_ACCENT}>
              <Download size={16} strokeWidth={2.5} />
              Télécharger le PDF
            </a>
          ) : (
            <span className="text-[13px] font-semibold text-muted">Facture pas encore émise</span>
          )}
        </>
      }
    >
      <KpiStrip
        items={[
          { label: "Total HT", value: eur(invoice.subtotal) },
          { label: "TVA (20 %)", value: eur(invoice.tax) },
          { label: "Total TTC", value: eur(invoice.total), accent: true },
        ]}
      />

      {/* Tableau (≥ md) */}
      <table className="hidden w-full text-sm text-ink md:table">
        <thead className="border-b border-line bg-paper-card">
          <tr>
            <th scope="col" className={TH}>Course</th>
            <th scope="col" className={TH}>Itinéraire</th>
            <th scope="col" className={TH}>Livraison</th>
            <th scope="col" className={`${TH} text-right`}>Montant</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="transition-colors hover:bg-paper-card">
              <td className={`${TD} whitespace-nowrap align-top`}>
                <div className="font-mono text-xs font-bold text-ink">{o.tracking_code}</div>
                <div className="mt-1 text-xs text-muted">{shortDate(o.created_at)}</div>
              </td>
              <td className={`${TD} w-full min-w-[280px] align-top`}><Route o={o} /></td>
              <td className={`${TD} min-w-[170px] align-top`}><Delivery o={o} /></td>
              <td className={`${TD} whitespace-nowrap text-right align-top`}>
                {(() => {
                  const pTtc = normalizeOrderPriceTTC(Number(o.price_estimate), o.pickup_address, o.dropoff_address) ?? Number(o.price_estimate);
                  return (
                    <>
                      <div className="text-sm font-extrabold text-ink tabular-nums">{eur(pTtc)} TTC</div>
                      <div className="text-[11px] font-medium text-muted tabular-nums">{eur(htOf(pTtc))} HT</div>
                    </>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cartes (< md) */}
      <ul className="divide-y divide-line md:hidden">
        {orders.map((o) => (
          <li key={o.id} className="flex flex-col gap-2.5 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold">{o.tracking_code}</span>
              {(() => {
                const pTtc = normalizeOrderPriceTTC(Number(o.price_estimate), o.pickup_address, o.dropoff_address) ?? Number(o.price_estimate);
                return (
                  <div className="text-right">
                    <div className="text-sm font-extrabold tabular-nums">{eur(pTtc)} TTC</div>
                    <div className="text-[11px] font-medium text-muted tabular-nums">{eur(htOf(pTtc))} HT</div>
                  </div>
                );
              })()}
            </div>
            <div className="text-xs text-muted">{shortDate(o.created_at)}</div>
            <Route o={o} />
            <Delivery o={o} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
