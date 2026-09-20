"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";
import { PageShell, KpiStrip, StatusPill, ErrorState, LoadingState, TH, TD, BTN_ACCENT } from "@/components/dashboard/ui";

const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function FactureDetailsPage() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  // rawId ressemble à "FA-2026-09" -> on récupère l'année et le mois
  const periodKey = rawId?.replace(/^FA-/, "") || "";
  const [year, month] = periodKey.split("-").map(Number);

  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    const loadOrders = async () => {
      if (!year || !month) {
        setError("Période invalide");
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Non authentifié");
          setLoading(false);
          return;
        }

        const startOfMonth = new Date(year, month - 1, 1);
        const startOfNextMonth = new Date(year, month, 1);

        const [ordersRes, navettesRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .neq("status", "annulee")
            .gte("created_at", startOfMonth.toISOString())
            .lt("created_at", startOfNextMonth.toISOString())
            .order("created_at", { ascending: false }),
          supabase
            .from("navettes")
            .select("id, name, pickup_address, dropoff_address, stops, estimated_price, created_at, status, delivered_at, delivery_recipient, delivery_department, delivery_comment, delivery_photo_url")
            .eq("user_id", user.id)
            .gte("created_at", startOfMonth.toISOString())
            .lt("created_at", startOfNextMonth.toISOString()),
        ]);

        const ordersData = (ordersRes.data || []).map((o: any) => ({ ...o, _type: "order" as const }));
        const navettesData = (navettesRes.data || []).map((n: any) => ({
          ...n,
          _type: "navette" as const,
          tracking_code: n.name,
          price_estimate: n.estimated_price,
        }));

        const combined = [...ordersData, ...navettesData].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (combined.length === 0) {
          setError("Aucune course sur cette période");
        } else {
          setOrders(combined);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setUserInfo({ name: profile?.full_name || "", email: user.email || "" });
      } catch (err) {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodKey]);

  const back = { href: "/dashboard/factures", label: "Vos factures" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la facture…" />
      </div>
    );
  }

  if (error) {
    return <ErrorState text={error} back={{ href: back.href, label: "Retour aux factures" }} />;
  }

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const totalHT = orders.reduce((sum, o) => sum + (o.price_estimate ? Number(o.price_estimate) : 0), 0);
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;

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
      <span className="text-xs text-label">—</span>
    );

  const Kind = ({ o }: { o: any }) => (
    <span className="label-mono rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-muted">
      {o._type === "navette" ? "Navette" : "Course"}
    </span>
  );

  return (
    <PageShell
      back={back}
      eyebrow="Relevé mensuel"
      title={<span className="capitalize">{monthLabel}</span>}
      subtitle={`${orders.length} course${orders.length > 1 ? "s" : ""} sur cette période · ${rawId}`}
      actions={
        <>
          <StatusPill tone={isCurrentMonth ? "blue" : "orange"}>{isCurrentMonth ? "En cours" : "À régler"}</StatusPill>
          <button
            type="button"
            onClick={() =>
              generateInvoicePDF({
                invoiceId: rawId || "",
                monthLabel,
                clientName: userInfo.name,
                clientEmail: userInfo.email,
                orders,
              })
            }
            className={BTN_ACCENT}
          >
            <Download size={16} strokeWidth={2.5} />
            Télécharger le PDF
          </button>
        </>
      }
    >
      <KpiStrip
        items={[
          { label: "Total HT", value: eur(totalHT) },
          { label: "TVA (20 %)", value: eur(totalTVA) },
          { label: "Total TTC", value: eur(totalTTC), accent: true },
        ]}
      />

      {/* Tableau (≥ md) */}
      <table className="hidden w-full text-sm text-ink md:table">
        <thead className="border-b border-line bg-paper-card">
          <tr>
            <th scope="col" className={TH}>Course</th>
            <th scope="col" className={TH}>Itinéraire</th>
            <th scope="col" className={TH}>Livraison</th>
            <th scope="col" className={`${TH} text-right`}>Montant HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={`${o._type}-${o.id}`} className="transition-colors hover:bg-paper-card">
              <td className={`${TD} whitespace-nowrap align-top`}>
                <div className="font-mono text-xs font-bold text-ink">{o.tracking_code}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <Kind o={o} />
                  {shortDate(o.created_at)}
                </div>
              </td>
              <td className={`${TD} w-full min-w-[280px] align-top`}><Route o={o} /></td>
              <td className={`${TD} min-w-[170px] align-top`}><Delivery o={o} /></td>
              <td className={`${TD} whitespace-nowrap text-right align-top text-sm font-extrabold tabular-nums`}>
                {o.price_estimate ? eur(Number(o.price_estimate)) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cartes (< md) */}
      <ul className="divide-y divide-line md:hidden">
        {orders.map((o) => (
          <li key={`${o._type}-${o.id}`} className="flex flex-col gap-2.5 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold">{o.tracking_code}</span>
              <span className="text-sm font-extrabold tabular-nums">{o.price_estimate ? eur(Number(o.price_estimate)) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted"><Kind o={o} />{shortDate(o.created_at)}</div>
            <Route o={o} />
            <Delivery o={o} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
