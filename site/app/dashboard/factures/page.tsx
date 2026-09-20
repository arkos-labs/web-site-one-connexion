"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShell, SearchInput, KpiStrip, StatusPill, EmptyState, LoadingState, TH, TD, BTN_PRIMARY } from "@/components/dashboard/ui";

const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function FacturesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("navettes")
            .select("id, name, estimated_price, created_at, status, delivered_at, user_id")
            .eq("user_id", user.id),
        ]);

        const ordersData = (ordersRes.data || []).map((o: any) => ({ ...o, _type: "order" as const }));
        const navettesData = (navettesRes.data || []).map((n: any) => ({
          ...n,
          _type: "navette" as const,
          price_estimate: n.estimated_price,
        }));

        setOrders([...ordersData, ...navettesData]);
      } catch (err) {
        console.error("Erreur de chargement des courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regroupe les courses (hors annulées) par mois : la facture du mois en cours
  // s'ouvre dès la première course et grossit au fil des commandes, comme un
  // compte pro classique — elle n'attend pas la livraison ni la fin du mois.
  const invoices = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const groups: Record<string, { monthLabel: string; courses: number; navettes: number; amount: number }> = {};

    orders
      .filter((o) => o.status !== "annulee")
      .forEach((o) => {
        const date = new Date(o.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

        if (!groups[key]) {
          groups[key] = { monthLabel, courses: 0, navettes: 0, amount: 0 };
        }
        if (o._type === "navette") {
          groups[key].navettes += 1;
        } else {
          groups[key].courses += 1;
        }
        groups[key].amount += o.price_estimate ? Number(o.price_estimate) * 1.2 : 0;
      });

    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([key, val]) => ({
        id: `FA-${key}`,
        date: val.monthLabel,
        amount: val.amount,
        courses: val.courses,
        navettes: val.navettes,
        status: key === currentKey ? "en_cours" : "en_attente",
      }));
  }, [orders]);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) => i.id.toLowerCase().includes(q) || i.date.toLowerCase().includes(q));
  }, [invoices, search]);

  const pendingTotal = invoices.reduce((sum, i) => sum + i.amount, 0);
  const currentMonth = invoices.find((i) => i.status === "en_cours");

  const volume = (i: { courses: number; navettes: number }) =>
    [
      i.courses > 0 ? `${i.courses} course${i.courses > 1 ? "s" : ""}` : null,
      i.navettes > 0 ? `${i.navettes} navette${i.navettes > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" + ");

  const Status = ({ status }: { status: string }) =>
    status === "payee" ? (
      <StatusPill tone="green">Réglée</StatusPill>
    ) : status === "en_cours" ? (
      <StatusPill tone="blue">En cours</StatusPill>
    ) : (
      <StatusPill tone="orange">À régler</StatusPill>
    );

  return (
    <PageShell
      eyebrow="Facturation & relevés"
      title="Vos factures"
      subtitle="L'historique de votre facturation mensuelle."
      actions={<SearchInput label="Rechercher une facture" value={search} onChange={setSearch} placeholder="N° de facture, mois…" />}
    >
      <KpiStrip
        items={[
          { label: "Total à régler (TTC)", value: eur(pendingTotal), accent: pendingTotal > 0 },
          { label: "Mois en cours", value: currentMonth ? eur(currentMonth.amount) : "—", hint: currentMonth?.date },
          {
            label: "Moyen de paiement",
            value: <span className="text-sm font-bold text-white/60 sm:text-base">Aucun enregistré</span>,
          },
        ]}
      />

      {loading ? (
        <LoadingState text="Chargement de vos factures…" />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices.length === 0 ? "Aucune facture pour le moment" : "Aucun résultat"}
          text={invoices.length === 0 ? "Votre relevé du mois s'ouvrira dès votre première commande." : "Essayez une autre recherche."}
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
                <th scope="col" className={`${TH} text-right`}>Montant TTC</th>
                <th scope="col" className={TH}>Statut</th>
                <th scope="col" className={`${TH} w-10`}><span className="sr-only">Détails</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => router.push(`/dashboard/factures/${invoice.id}`)}
                  className="group cursor-pointer transition-colors hover:bg-paper-card"
                >
                  <td className={`${TD} whitespace-nowrap`}>
                    <Link
                      href={`/dashboard/factures/${invoice.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-[13px] font-bold text-ink hover:text-accent-dark"
                    >
                      {invoice.id}
                    </Link>
                  </td>
                  <td className={`${TD} whitespace-nowrap capitalize text-muted`}>{invoice.date}</td>
                  <td className={`${TD} whitespace-nowrap text-muted`}>{volume(invoice)}</td>
                  <td className={`${TD} whitespace-nowrap text-right font-extrabold tabular-nums`}>{eur(invoice.amount)}</td>
                  <td className={`${TD} whitespace-nowrap`}><Status status={invoice.status} /></td>
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
                <Link href={`/dashboard/factures/${invoice.id}`} className="flex flex-col gap-2 px-5 py-4 text-ink hover:bg-paper-card hover:text-ink">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] font-bold">{invoice.id}</span>
                    <Status status={invoice.status} />
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs capitalize text-muted">{invoice.date} · {volume(invoice)}</span>
                    <span className="text-base font-extrabold tabular-nums">{eur(invoice.amount)}</span>
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
