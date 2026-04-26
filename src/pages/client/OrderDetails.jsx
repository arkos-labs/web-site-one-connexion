import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { generateOrderPdf } from "../../lib/pdf-generator";
import { Loader2, FileText, AlertTriangle, Send, CheckCircle2, Image as LucideImage, Camera } from "lucide-react";

function clientStatusLabel(order) {
  const status = typeof order === 'string' ? order : order.status;

  switch (status) {
    case "pending_acceptance":
    case "pending":
      return "En attente";
    case "accepted":
      return "Mission Validée";
    case "assigned":
      return "Recherche chauffeur";
    case "driver_accepted":
      return "Chauffeur en route";
    case "in_progress":
      return "Livraison en cours";
    case "delivered":
      return "Terminée";
    case "cancelled":
      return "Annulée";
    default:
      return status || "—";
  }
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [order, setOrder] = useState(state?.order || null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimNotes, setClaimNotes] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    if ((!order || !order.pickup_address) && (id || order?.id)) {
      fetchFullOrder();
    } else if (order?.client_id) {
      fetchClient(order.client_id);
    }

    const orderId = id || order?.id;
    if (orderId) {
      const channel = supabase
        .channel(`order-details-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            setOrder(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, order?.id, order?.pickup_address, order?.client_id]);

  const fetchFullOrder = async () => {
    setLoading(true);
    const orderId = id || order?.id;
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (data) setOrder(data);
    else setNotFound(true);
    setLoading(false);
  };

  const fetchClient = async (clientId) => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', clientId).single();
    if (data) setClient(data);
    setLoading(false);
  };

  if (loading && !order?.pickup_address) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Récupération des détails</p>
      </div>
    );
  }

  if (!order || notFound) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <h1 className="text-4xl font-display italic text-noir">Mission Introuvable.</h1>
        <p className="text-noir/40 font-medium">Cette expédition n'existe pas ou a été archivée.</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-noir px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#ed5518] transition-all"
        >
          Retourner à la liste
        </button>
      </div>
    );
  }

  try {
    const timeline = [
      {
        label: "Commande passée",
        value: order.created_at ? new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : "—",
        done: true
      },
      {
        label: "Validation Admin",
        value: ['accepted', 'assigned', 'driver_accepted', 'in_progress', 'delivered'].includes(order.status) ? "Mission validée" : "En attente",
        done: ['accepted', 'assigned', 'driver_accepted', 'in_progress', 'delivered'].includes(order.status)
      },
      {
        label: "Prise en charge",
        value: ['driver_accepted', 'in_progress', 'delivered'].includes(order.status) ? "Chauffeur assigné" : "Recherche chauffeur",
        done: ['driver_accepted', 'in_progress', 'delivered'].includes(order.status)
      },
      {
        label: "Livraison",
        value: order.status === 'delivered' ? (order.delivered_at ? new Date(order.delivered_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : "Livrée") : "En cours",
        done: order.status === 'delivered'
      }
    ];

    const notesStr = order.notes || "";
    const nEntreprisePick = notesStr.match(/Entreprise Pick: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactPick = notesStr.match(/Contact Pick: (.*?)(\.|$|Phone|Email)/)?.[1]?.trim();
    const nPhonePick = notesStr.match(/Phone Pick: (.*?)(\.|$|Email|Code)/)?.[1]?.trim();
    const pCode = order.pickup_access_code || notesStr.match(/(?:Code Enlev:|Code :|Code:)\s?([^.]+)/)?.[1]?.trim();

    const nEntrepriseDeliv = notesStr.match(/Entreprise Deliv: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactDeliv = notesStr.match(/Contact Deliv: (.*?)(\.|$|Phone|Instructions)/)?.[1]?.trim();
    const nPhoneDeliv = notesStr.match(/Phone Deliv: (.*?)(\.|$|Code|Instructions)/)?.[1]?.trim();
    const dCode = order.delivery_access_code || notesStr.match(/(?:Code Dest:|Code Deliv:)\s?([^.]+)/)?.[1]?.trim();

    const nInstructions = notesStr.match(/Instructions:\s*(.*?)(?:\.|$)/)?.[1]?.trim();
    const nPNote = notesStr.match(/Instructions:\s*(.*?)\s*\//)?.[1]?.trim() || (nInstructions && !String(nInstructions).includes('/') ? nInstructions : null);
    const nDNote = notesStr.match(/Instructions:\s*(.*?)\s*\/\s*(.*)(?:\.|$)/)?.[2]?.trim();

    const pickupName = order.pickup_name || nEntreprisePick || nContactPick || "—";
    const pickupPhone = order.pickup_phone || nPhonePick || order.notes?.match(/Contact: ([\d\s]+)/)?.[1] || "—";
    const deliveryName = order.delivery_name || nEntrepriseDeliv || nContactDeliv || "—";
    const deliveryPhone = order.delivery_phone || nPhoneDeliv || "—";

    const downloadPdf = async () => {
      try {
        let latestClient = client;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data) latestClient = data;
        }

        const d = latestClient?.details || {};
        const clientInfo = {
          name: d.full_name || d.contact_name || (latestClient?.first_name ? `${latestClient.first_name} ${latestClient.last_name || ""}` : (latestClient?.email?.split('@')[0] || "")),
          email: latestClient?.email || d.email || "",
          phone: d.phone || d.phone_number || "",
          company: d.company || latestClient?.company_name || "",
          billingAddress: latestClient?.address || d.address || "",
          billingCity: latestClient?.city || d.city || "",
          billingZip: latestClient?.postal_code || d.zip || ""
        };
        await generateOrderPdf(order, clientInfo);
      } catch (err) {
        console.error("PDF Fail:", err);
      }
    };

    const cancelOrder = async () => {
      if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;
      setLoading(true);
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      if (!error) setOrder({ ...order, status: 'cancelled' });
      setLoading(false);
    };

    const submitClaim = async () => {
      if (!claimNotes.trim()) return;
      setSubmittingClaim(true);
      const { error } = await supabase.from('orders').update({
        claim_status: 'pending',
        claim_notes: claimNotes,
        claim_opened_at: new Date().toISOString()
      }).eq('id', order.id);

      if (!error) {
        setOrder({ ...order, claim_status: 'pending', claim_notes: claimNotes });
        setShowClaimForm(false);
      }
      setSubmittingClaim(false);
    };

    return (
      <div className="grid gap-12 font-body pb-20">
        {/* Header Section */}
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-noir/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-noir/30 hover:text-noir transition-colors"
              >
                <span>← Retour</span>
              </button>
            </div>
            <h1 className="text-6xl font-display italic text-noir leading-none">
              Mission <span className="text-[#ed5518]">#{String(order.id || "").slice(0, 8)}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border ${order.status === 'delivered' ? 'bg-emerald-500 text-white border-emerald-500' :
              order.status === 'driver_accepted' || order.status === 'in_progress' ? 'bg-[#ed5518] text-white border-[#ed5518]' :
                'bg-noir text-white border-noir'
              }`}>
              {clientStatusLabel(order)}
            </span>

            <button
              onClick={downloadPdf}
              className="flex items-center gap-3 rounded-xl bg-white border border-noir/10 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-noir hover:bg-noir hover:text-white hover:border-noir transition-all active:scale-95 shadow-sm"
            >
              <FileText size={16} strokeWidth={1.5} />
              <span>Bon de Commande</span>
            </button>

            {['pending', 'accepted', 'assigned'].includes(order.status) && (
              <button
                onClick={cancelOrder}
                className="rounded-xl border border-red-100 bg-red-50 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                Annuler
              </button>
            )}
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-10">
            {/* Courier Proof (High impact) */}
            {(order.delivery_comment || order.delivery_recipient) && (
              <div className="rounded-3xl bg-emerald-500 p-8 text-white space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} />
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.4em]">Preuve de Livraison</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {order.delivery_recipient && (
                    <div className="space-y-1">
                      <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Signataire</p>
                      <p className="text-2xl font-display italic">{order.delivery_recipient}</p>
                    </div>
                  )}
                  {order.delivery_comment && (
                    <div className="space-y-1">
                      <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Commentaire chauffeur</p>
                      <p className="text-lg font-medium italic opacity-90">"{order.delivery_comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Itinerary */}
            <section className="bg-white rounded-3xl border border-noir/5 overflow-hidden">
              <div className="p-10 space-y-12">
                <div className="grid md:grid-cols-2 gap-16 relative">
                  {/* Decorative line */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-noir/5 -translate-x-1/2"></div>

                  {/* Pickup */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full border-2 border-[#ed5518]"></div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30">Départ / Enlèvement</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-display italic text-noir leading-tight">{pickupName}</p>
                      <p className="text-noir/50 leading-relaxed">{order.pickup_address}</p>
                      <div className="pt-4 flex flex-wrap gap-4">
                        {pCode && (
                          <div className="px-3 py-1.5 rounded-lg bg-noir/5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-noir/20 uppercase tracking-widest">Code Access</span>
                            <span className="text-[11px] font-black text-[#ed5518]">{pCode}</span>
                          </div>
                        )}
                        <div className="px-3 py-1.5 rounded-lg bg-noir/5 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-noir/20 uppercase tracking-widest">Tél</span>
                          <span className="text-[11px] font-bold text-noir">{pickupPhone}</span>
                        </div>
                      </div>
                      {nPNote && nPNote !== "—" && (
                        <p className="mt-4 p-4 rounded-xl bg-noir/[0.02] border border-noir/5 text-xs italic text-noir/60 leading-relaxed">
                          "{nPNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-[#ed5518]"></div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30">Arrivée / Livraison</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-display italic text-noir leading-tight">{deliveryName}</p>
                      <p className="text-noir/50 leading-relaxed">{order.delivery_address}</p>
                      <div className="pt-4 flex flex-wrap gap-4">
                        {dCode && (
                          <div className="px-3 py-1.5 rounded-lg bg-noir/5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-noir/20 uppercase tracking-widest">Code Access</span>
                            <span className="text-[11px] font-black text-[#ed5518]">{dCode}</span>
                          </div>
                        )}
                        <div className="px-3 py-1.5 rounded-lg bg-noir/5 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-noir/20 uppercase tracking-widest">Tél</span>
                          <span className="text-[11px] font-bold text-noir">{deliveryPhone}</span>
                        </div>
                      </div>
                      {nDNote && nDNote !== "—" && (
                        <p className="mt-4 p-4 rounded-xl bg-noir/[0.02] border border-noir/5 text-xs italic text-noir/60 leading-relaxed">
                          "{nDNote}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="pt-12 border-t border-noir/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-noir/20 uppercase tracking-widest">Véhicule</p>
                    <p className="text-sm font-bold text-noir uppercase tracking-wider">{order.vehicle_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-noir/20 uppercase tracking-widest">Service</p>
                    <p className="text-sm font-bold text-[#ed5518] uppercase tracking-wider">{order.service_level}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-noir/20 uppercase tracking-widest">Poids</p>
                    <p className="text-sm font-bold text-noir">{order.weight ? `${order.weight} kg` : "N/C"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-noir/20 uppercase tracking-widest">Dimensions</p>
                    <p className="text-sm font-bold text-noir">{order.package_description || "Standard"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Financial Card */}
            <section className="bg-noir rounded-3xl p-10 text-white shadow-2xl shadow-noir/20">
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Total TTC</p>
                  <p className="text-6xl font-display italic leading-none">{(Number(order.price_ht || 0) * 1.2).toFixed(2)}€</p>
                  <p className="text-xs font-bold text-white/40 pt-2 tracking-widest">{Number(order.price_ht || 0).toFixed(2)}€ HT</p>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Statut Financier</span>
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Réglé / Compte</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="bg-white rounded-3xl border border-noir/5 p-10 space-y-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30">Suivi Logistique</h3>
              <div className="space-y-8">
                {timeline.map((t, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {idx < timeline.length - 1 && (
                      <div className={`absolute left-[5px] top-4 bottom-[-24px] w-px ${t.done && timeline[idx + 1].done ? 'bg-[#ed5518]' : 'bg-noir/5'}`}></div>
                    )}
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full transition-all ${t.done ? 'bg-[#ed5518] shadow-[0_0_12px_rgba(237,85,24,0.6)]' : 'bg-noir/10'}`}></div>
                    <div className="space-y-1">
                      <p className={`text-[11px] font-bold uppercase tracking-widest ${t.done ? 'text-noir' : 'text-noir/20'}`}>{t.label}</p>
                      <p className={`text-sm font-display italic ${t.done ? 'text-[#ed5518]' : 'text-noir/20'}`}>{t.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Claim Section */}
            <section className="bg-[#ed5518]/5 rounded-3xl p-8 border border-[#ed5518]/10">
              {!order.claim_status || order.claim_status === 'none' ? (
                <>
                  {!showClaimForm ? (
                    <button
                      onClick={() => setShowClaimForm(true)}
                      className="w-full group flex items-center justify-between text-left"
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-noir/60 group-hover:text-[#ed5518] transition-colors">Signaler un litige</p>
                        <p className="text-xs text-noir/30 font-medium">Retard, dégradation ou perte.</p>
                      </div>
                      <AlertTriangle size={18} className="text-noir/20 group-hover:text-[#ed5518] transition-colors" strokeWidth={1.5} />
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <textarea
                        rows={4}
                        placeholder="Détails de la réclamation..."
                        className="w-full rounded-2xl bg-white border border-noir/5 p-5 text-sm focus:border-[#ed5518]/30 focus:shadow-xl transition-all outline-none"
                        value={claimNotes}
                        onChange={(e) => setClaimNotes(e.target.value)}
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={submitClaim}
                          disabled={submittingClaim}
                          className="flex-1 rounded-xl bg-noir py-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#ed5518] transition-all disabled:opacity-50"
                        >
                          {submittingClaim ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Envoyer'}
                        </button>
                        <button
                          onClick={() => setShowClaimForm(false)}
                          className="px-6 rounded-xl border border-noir/5 text-[10px] font-bold uppercase tracking-widest text-noir/40"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#ed5518]" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ed5518]">Litige {order.claim_status === 'resolved' ? 'Résolu' : 'En examen'}</span>
                  </div>
                  <p className="text-sm font-medium text-noir/70 italic leading-relaxed">"{order.claim_notes}"</p>
                  {order.claim_reply && (
                    <div className="pt-6 border-t border-noir/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-noir/30 mb-2">Réponse Concierge</p>
                      <p className="text-sm font-display italic text-[#ed5518]">"{order.claim_reply}"</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-red-50 rounded-3xl border border-red-100 p-10">
        <h2 className="text-2xl font-display italic text-red-600 mb-4">Une erreur technique est survenue.</h2>
        <p className="text-sm text-red-400 font-medium leading-relaxed opacity-80">{err.message}</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Réessayer</button>
      </div>
    );
  }
}
