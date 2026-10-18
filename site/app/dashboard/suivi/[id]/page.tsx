"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, CheckCircle2, XCircle, Truck, User, Phone, PackageCheck, Loader2, Download, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { natureLabel } from "@/lib/order-nature";
import { ClientAnomalies, useMissionAnomalies } from "@/components/admin/mission-anomalies";
import { PageShell, DetailBody, Panel, InfoRow, Fact, NoteBox, StatusPill, ErrorState, LoadingState } from "@/components/dashboard/ui";
import { normalizeOrderPriceTTC } from "@/lib/price-display";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  pending: "En attente",
  confirmee: "Confirmée",
  assigned: "Chauffeur assigné",
  driver_accepted: "Chauffeur en route",
  in_progress: "En cours de livraison",
  picked_up: "Colis enlevé",
  en_cours: "En cours de livraison",
  delivered: "Livrée",
  livree: "Livrée",
  cancelled: "Annulée",
  annulee: "Annulée",
};

const FORMAT_LABELS: Record<string, string> = {
  doc: "Pli / document (< 1 kg)",
  pli: "Pli / document (< 1 kg)",
  petit: "Petit colis (1 à 10 kg)",
  volumineux: "Volumineux (10 à 18 kg ou encombrant)",
};

const DELAI_LABELS: Record<string, string> = {
  standard: "Normal - livré sous 3 h",
  urgent: "Urgent - livré sous 1 h 30",
  flash: "Super - livré sous 1 h",
  navette: "Navette programmée",
};

/** Mode de règlement tel que le client l'a choisi (rempli par Stripe au paiement). */
function paymentLabel(o: any): string | null {
  if (o.billing_status === "a_regler") return "Facture à régler sous 30 jours";
  if (o.billing_status === "echec" && !o.payment_mode) return "Paiement non réussi";
  if (o.payment_mode === "carte") return o.billing_status === "rembourse" ? "Carte bancaire - remboursé" : "Carte bancaire - réglé";
  if (o.payment_mode === "fin_de_mois") {
    const how = o.billing_status === "virement_attendu" ? "virement" : "prélèvement";
    return o.billing_status === "paye" ? `Sur facture (${how}) - réglé` : `Sur facture à 30 jours (${how})`;
  }
  // Pro avec compte, sans paiement à la commande : facture à régler sous 30 jours.
  if (o.client_type === "entreprise" && o.user_id) return "Facture à 30 jours";
  return null;
}

const STEPS = [
  { key: "en_attente", label: "Commande reçue", icon: FileText, matches: ["en_attente", "pending", "confirmee"], at: "created_at" },
  { key: "assigned", label: "Chauffeur assigné", icon: User, matches: ["assigned"], at: "assigned_at" },
  { key: "driver_accepted", label: "En route", icon: Truck, matches: ["driver_accepted"], at: "driver_accepted_at" },
  { key: "en_cours", label: "Colis enlevé", icon: CheckCircle2, matches: ["in_progress", "picked_up", "en_cours"], at: "picked_up_at" },
  { key: "livree", label: "Livrée", icon: PackageCheck, matches: ["delivered", "livree"], at: "delivered_at" },
];

// Le client peut annuler tant qu'aucun chauffeur n'est attribué (contrôlé aussi par /api/orders/cancel)
const CANCELLABLE_STATUSES = ["en_attente", "pending", "confirmee"];

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** Détails saisis par le chauffeur pour un point (remise, réception…). */
function ProgressNote({ p }: { p: any }) {
  if (!p || (!p.pickupRecipient && !p.pickupDescription && !p.deliveryRecipient && !p.deliveryDepartment && !p.deliveryComment)) return null;
  return (
    <NoteBox>
      {p.pickupRecipient && <Fact k="Remis par">{p.pickupRecipient}</Fact>}
      {p.pickupDescription && <Fact k="Récupéré">{p.pickupDescription}</Fact>}
      {p.deliveryRecipient && <Fact k="Réceptionné par" tone="success">{p.deliveryRecipient}</Fact>}
      {p.deliveryDepartment && <Fact k="Lieu / service" tone="success">{p.deliveryDepartment}</Fact>}
      {p.deliveryComment && <p className="text-xs italic text-muted">{p.deliveryComment}</p>}
    </NoteBox>
  );
}

export default function DeliveryDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const supabase = createClient();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelInfo, setCancelInfo] = useState<string | null>(null);
  const [driver, setDriver] = useState<{ name: string | null; phone: string | null; vehicle: string | null } | null>(null);
  const anomalies = useMissionAnomalies(supabase, `client-anomalies-${id}`);
  // Facture de la course : Stripe (paiement à la commande / à 30 jours) ou facture du compte.
  const [invoice, setInvoice] = useState<{ number: string | null; status: string; url: string | null; pdf: string | null } | null>(null);
  const [monthlyInvoice, setMonthlyInvoice] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadOrder = async () => {
      try {
        const { data, error: err } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!isMounted) return;

        if (err) {
          console.error("Erreur requête course:", err);
          setError("Course non trouvée");
          setLoading(false);
          return;
        }
        if (!data) {
          setError("Course non trouvée");
          setLoading(false);
          return;
        }

        setOrder(data);
        setLoading(false);

        try {
          channel = supabase
            .channel(`order-tracking-${id}-${Date.now()}`)
            .on("postgres_changes", {
              event: "UPDATE",
              schema: "public",
              table: "orders",
              filter: `id=eq.${id}`,
            }, (payload: any) => {
              if (isMounted) {
                setOrder((prev: any) => prev ? { ...prev, ...payload.new } : prev);
              }
            })
            .subscribe();
        } catch {
          // Realtime subscription is optional
        }
      } catch (err: any) {
        console.error("Erreur chargement course:", err);
        if (isMounted) {
          setError("Erreur de chargement");
          setLoading(false);
        }
      }
    };

    if (id) {
      loadOrder();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Nom / téléphone / véhicule du chauffeur (fonction sécurisée : le client n'a pas accès à la table drivers)
  useEffect(() => {
    if (!order?.id || !order?.driver_id) {
      setDriver(null);
      return;
    }
    supabase
      .rpc("get_mission_driver", { p_type: "order", p_id: order.id })
      .then(({ data }: { data: any }) => setDriver(Array.isArray(data) && data.length ? data[0] : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.driver_id]);

  const delivered = order?.status === "livree" || order?.status === "delivered";
  useEffect(() => {
    if (!order?.id || !delivered) return;
    let cancelled = false;
    fetch("/api/orders/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.invoice) setInvoice(d.invoice); })
      .catch(() => {});
    supabase
      .from("invoice_items")
      .select("invoice_id, invoices(status)")
      .eq("order_id", order.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (!cancelled && data?.invoice_id && data.invoices?.status !== "en_cours") setMonthlyInvoice({ id: data.invoice_id, status: data.invoices?.status });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, delivered, order?.stripe_invoice_id]);

  const handleCancel = async () => {
    if (!order || !confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.cancelled) {
        setCancelError(data.error || "Erreur lors de l'annulation. Veuillez réessayer.");
      } else {
        setOrder({ ...order, status: "annulee" });
        setCancelInfo(data.refunded
          ? "Votre course a été remboursée. Le remboursement apparaîtra sur votre relevé bancaire sous 5 à 10 jours."
          : data.refundError
            ? "Votre course est annulée. Notre équipe va traiter votre remboursement et reviendra vers vous."
            : null);
      }
    } catch (err) {
      setCancelError("Une erreur inattendue est survenue.");
    } finally {
      setCancelling(false);
    }
  };

  const back = { href: "/dashboard/suivi", label: "Suivi des livraisons" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la course…" />
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState text={error || "Course non trouvée"} back={{ href: back.href, label: "Retour au suivi" }} />;
  }

  const statusLabel = STATUS_LABELS[order.status] || order.status;
  const formatLabel = FORMAT_LABELS[order.format] || order.format;
  // Tarif TTC, TVA 20 % comprise : HT = TTC / 1,20.
  const totalTTC = normalizeOrderPriceTTC(order.price_estimate, order.pickup_address, order.dropoff_address, order.delai);
  const priceHT = totalTTC !== null ? Math.round((totalTTC / 1.2) * 100) / 100 : null;
  const tva = totalTTC !== null && priceHT !== null ? totalTTC - priceHT : null;
  const canCancel = CANCELLABLE_STATUSES.includes(order.status) && !order.driver_id;
  const isDelivered = order.status === "livree" || order.status === "delivered";
  const isCancelled = order.status === "annulee" || order.status === "cancelled";
  const isMoving = ["en_cours", "in_progress", "picked_up", "driver_accepted"].includes(order.status);
  const currentStepIndex = STEPS.findIndex((s) => s.matches?.includes(order.status) ?? s.key === order.status);
  const tone = isDelivered ? "green" : isCancelled ? "red" : isMoving ? "amber" : "blue";
  const stops: any[] = Array.isArray(order.stops) ? order.stops : [];
  const anomalyItems = id ? anomalies.forMission(id) : [];
  const hasOpenAnomaly = anomalyItems.some((a) => !a.resolved);

  const created = new Date(order.created_at);

  return (
    <PageShell
      back={back}
      eyebrow="Course"
      title={
        <>
          <span className="font-mono">{order.tracking_code}</span>
          <StatusPill tone={tone}>{statusLabel}</StatusPill>
        </>
      }
      subtitle={`Créée le ${created.toLocaleDateString("fr-FR")} à ${hhmm(order.created_at)} · Format : ${formatLabel}`}
      actions={
        canCancel ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {cancelling ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            {cancelling ? "Annulation…" : "Annuler la commande"}
          </button>
        ) : undefined
      }
    >
      <DetailBody
        main={
          <>
            {cancelError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {cancelError}
              </div>
            )}
            {cancelInfo && (
              <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {cancelInfo}
              </div>
            )}

            {anomalyItems.length > 0 && (
              <Panel tone={hasOpenAnomaly ? "danger" : "default"}>
                <ClientAnomalies items={anomalyItems} />
              </Panel>
            )}

            {/* Avancement */}
            <Panel title="Avancement">
              {!isCancelled ? (
                <ol className="flex items-start gap-1 px-4 py-5">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isReached = index <= currentStepIndex;
                    return (
                      <React.Fragment key={step.key}>
                        <li className="flex w-14 shrink-0 flex-col items-center gap-1.5 text-center sm:w-[76px]">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                              isReached ? "border-accent bg-accent text-white" : "border-line bg-white text-label"
                            }`}
                          >
                            <Icon size={15} />
                          </span>
                          <span className={`text-[11px] font-bold leading-tight ${isReached ? "text-ink" : "text-label"}`}>{step.label}</span>
                          {isReached && order[step.at] && (
                            <span className="text-[11px] font-medium text-muted">{hhmm(order[step.at])}</span>
                          )}
                        </li>
                        {index < STEPS.length - 1 && (
                          <span aria-hidden className={`mt-[17px] h-0.5 min-w-2 flex-1 rounded-full ${index < currentStepIndex ? "bg-accent" : "bg-line"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </ol>
              ) : (
                <div className="flex items-center gap-3 px-5 py-4 text-sm font-semibold text-red-700">
                  <XCircle size={18} />
                  Cette commande a été annulée.
                </div>
              )}

              {driver && !isCancelled && (
                <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
                    <Truck size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="label-mono text-[10px] font-medium text-label">Votre chauffeur</div>
                    <div className="text-sm font-extrabold text-ink">{driver.name || "Chauffeur One Connexion"}</div>
                    {driver.vehicle && <div className="text-xs text-muted">{driver.vehicle}</div>}
                  </div>
                  {driver.phone && !isDelivered && (
                    <a href={`tel:${driver.phone}`} className="flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-[#25272a] hover:text-white">
                      <Phone size={14} />
                      {driver.phone}
                    </a>
                  )}
                </div>
              )}
            </Panel>

            {/* Itinéraire */}
            <Panel title="Itinéraire" aside={<span className="text-xs font-semibold text-muted">{2 + stops.length} points</span>}>
              <ol className="relative flex flex-col gap-5 px-5 py-5 pl-14">
                <span aria-hidden className="absolute bottom-8 left-[31px] top-8 border-l-2 border-dashed border-line" />

                {/* Départ */}
                <li className="relative">
                  <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-[10px] font-bold text-ink">A</span>
                  <div className="label-mono text-[10.5px] font-medium text-muted">Enlèvement</div>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{order.pickup_address}</p>
                  <ProgressNote p={order.point_progress?.["0"]} />
                </li>

                {/* Étapes */}
                {stops.map((stop: any, index: number) => {
                  const addr = typeof stop === "string" ? stop : stop.address;
                  const contactName = typeof stop === "string" ? null : (stop.contact_name || stop.contactName);
                  const contactPhone = typeof stop === "string" ? null : (stop.contact_phone || stop.contactPhone);
                  const stopNotes = typeof stop === "string" ? null : stop.notes;
                  const prog = order.point_progress?.[String(index)];
                  return (
                    <li key={index} className="relative">
                      <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-label bg-white text-[10px] font-bold text-muted">{index + 1}</span>
                      <div className="label-mono flex items-center gap-2 text-[10.5px] font-medium text-muted">
                        Étape {index + 1}
                        {prog?.deliveredAt ? (
                          <span className="rounded bg-green-100 px-1.5 py-px text-[10px] font-bold normal-case tracking-normal text-green-700">Livré</span>
                        ) : prog?.pickedUpAt ? (
                          <span className="rounded bg-blue-100 px-1.5 py-px text-[10px] font-bold normal-case tracking-normal text-blue-700">Enlevé</span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{addr}</p>
                      {(contactName || contactPhone) && (
                        <p className="mt-0.5 text-xs text-muted">{[contactName, contactPhone].filter(Boolean).join(" · ")}</p>
                      )}
                      {stopNotes && <p className="mt-0.5 text-xs italic text-muted">{stopNotes}</p>}
                      <ProgressNote p={order.point_progress?.[String(index + 1)]} />
                    </li>
                  );
                })}

                {/* Arrivée */}
                <li className="relative">
                  <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent bg-accent text-[10px] font-bold text-white">B</span>
                  <div className="label-mono text-[10.5px] font-medium text-muted">Livraison</div>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{order.dropoff_address}</p>
                  {(order.delivery_recipient || order.delivery_department || order.delivery_comment || order.delivery_photo_url) && (
                    <NoteBox tone="success">
                      {order.delivery_recipient && <Fact k="Remis à" tone="success">{order.delivery_recipient}</Fact>}
                      {order.delivery_department && <Fact k="Lieu" tone="success">{order.delivery_department}</Fact>}
                      {order.delivery_comment && <p className="text-xs italic text-muted">« {order.delivery_comment} »</p>}
                      {order.delivery_photo_url && (
                        <a href={order.delivery_photo_url} target="_blank" rel="noreferrer" className="mt-1 inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={order.delivery_photo_url} alt="Photo de livraison" className="h-24 rounded-lg border border-line object-cover" />
                        </a>
                      )}
                    </NoteBox>
                  )}
                  {order.notes && (
                    <div className="mt-2 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-xs font-medium text-accent-dark">
                      <span className="font-bold">Note :</span> {order.notes}
                    </div>
                  )}
                </li>
              </ol>
            </Panel>
          </>
        }
        side={
          <>
            {/* Tarif */}
            <section className="overflow-hidden rounded-xl bg-ink text-white">
              <div className="border-b border-white/10 px-5 py-3">
                <h2 className="label-mono text-xs font-medium text-white/60">Tarif</h2>
              </div>
              <div className="px-5 py-4">
                {priceHT !== null ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold leading-none tracking-tight tabular-nums">{eur(totalTTC ?? 0)}</span>
                      <span className="text-sm font-semibold text-white/60">TTC</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3 text-[13px]">
                      <div className="flex justify-between"><span className="text-white/60">Tarif HT</span><span className="font-semibold tabular-nums">{eur(priceHT)}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">TVA (20 %)</span><span className="font-semibold tabular-nums">{eur(tva ?? 0)}</span></div>
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-white/70">Tarif en cours d&apos;estimation par notre équipe.</p>
                )}
                {!isCancelled && paymentLabel(order) && (
                  <p className="mt-4 rounded-lg bg-white/[0.07] px-3 py-2 text-center text-xs font-semibold text-white/80">
                    {paymentLabel(order)}
                  </p>
                )}
                {isDelivered && (invoice?.url || monthlyInvoice) && (() => {
                  // Facture émise à la livraison : réglée, ou en attente de paiement.
                  const paid = invoice?.url ? invoice.status === "paid" : monthlyInvoice?.status === "payee";
                  const failed = !invoice?.url && monthlyInvoice?.status === "echec";
                  return (
                    <p className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${paid ? "bg-emerald-500/15 text-emerald-300" : failed ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {paid ? <CheckCircle2 size={14} /> : <Loader2 size={14} />}
                      {paid ? "Facture réglée" : failed ? "Paiement échoué" : "Paiement en attente"}
                    </p>
                  );
                })()}
                {isDelivered && invoice?.url && (
                  <div className="mt-3 flex flex-col gap-2">
                    <a href={invoice.url} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white hover:bg-accent-dark hover:text-white">
                      <ExternalLink size={15} /> Voir la facture{invoice.number ? ` ${invoice.number}` : ""}
                    </a>
                    {invoice.pdf && (
                      <a href={invoice.pdf} className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white">
                        <Download size={14} /> Télécharger le PDF
                      </a>
                    )}
                  </div>
                )}
                {isDelivered && !invoice?.url && monthlyInvoice && (
                  <a href={`/dashboard/factures/${monthlyInvoice.id}`} className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white hover:bg-accent-dark hover:text-white">
                    <FileText size={15} /> Voir la facture
                  </a>
                )}
                {isDelivered && !invoice?.url && !monthlyInvoice && (
                  <p className="mt-3 text-center text-xs text-white/60">La facture apparaîtra ici dès son émission.</p>
                )}
              </div>
            </section>

            <Panel title="Détails">
              <div className="flex flex-col gap-2.5 px-5 py-4">
                <InfoRow label="Référence" value={<span className="font-mono text-xs">{order.tracking_code}</span>} />
                <InfoRow label="Commandée le" value={`${created.toLocaleDateString("fr-FR")} à ${hhmm(order.created_at)}`} />
                {order.nature && <InfoRow label="Envoi" value={natureLabel(order.nature, order.nature_detail)} />}
                <InfoRow label="Format" value={formatLabel} />
                <InfoRow label="Formule" value={DELAI_LABELS[order.delai] ?? order.delai} />
                {order.scheduled_at && (
                  <InfoRow label="Créneau prévu" value={`${new Date(order.scheduled_at).toLocaleDateString("fr-FR")} à ${hhmm(order.scheduled_at)}`} />
                )}
                {paymentLabel(order) && <InfoRow label="Règlement" value={paymentLabel(order)} />}
                {order.client_type === "entreprise" && order.raison_sociale && <InfoRow label="Société" value={order.raison_sociale} />}
                {order.client_type === "entreprise" && order.siret && <InfoRow label="SIRET" value={<span className="font-mono text-xs">{order.siret}</span>} />}
                {order.client_type === "entreprise" && order.adresse_facturation && <InfoRow label="Facturation" value={order.adresse_facturation} />}
              </div>
            </Panel>

            {(order.contact_name || order.contact_phone || order.contact_email) && (
              <Panel title="Contact">
                <div className="flex flex-col gap-2.5 px-5 py-4 text-[13px] font-semibold text-ink">
                  {order.contact_name && <span className="flex items-center gap-2.5"><User size={14} className="text-label" />{order.contact_name}</span>}
                  {order.contact_phone && <span className="flex items-center gap-2.5"><Phone size={14} className="text-label" />{order.contact_phone}</span>}
                  {order.contact_email && <span className="flex items-center gap-2.5 break-all"><FileText size={14} className="text-label" />{order.contact_email}</span>}
                </div>
              </Panel>
            )}
          </>
        }
      />
    </PageShell>
  );
}
