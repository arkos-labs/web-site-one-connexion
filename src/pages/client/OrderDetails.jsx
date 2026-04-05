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
      return "⌛ En attente";
    case "accepted":
      return "✅ Mission Validée";
    case "assigned":
      return "📍 Recherche chauffeur";
    case "driver_accepted":
      return "🚚 Chauffeur en route";
    case "in_progress":
      return "📦 Livraison en cours";
    case "delivered":
      return "🏁 Terminée";
    case "cancelled":
      return "🚫 Annulée";
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
    // If we have an order ID but the object lacks full details (like pickup_address)
    // we must fetch the complete order data. This happens when coming from Dashboard stats.
    if ((!order || !order.pickup_address) && (id || order?.id)) {
      fetchFullOrder();
    } else if (order?.client_id) {
      fetchClient(order.client_id);
    }

    // Subscribe to realtime updates for THIS order
    const orderId = id || order?.id;
    if (orderId) {
      const channel = supabase
        .channel(`order-details-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            console.log('Real-time update received:', payload.new);
            setOrder(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, order?.id, order?.pickup_address, order?.client_id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!order || notFound) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-3 text-lg font-bold text-slate-900">Commande introuvable</div>
        <p className="text-sm text-slate-500">Reviens à la liste des commandes.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          Retour
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

    // ======================
    // Parse order.notes for precise data rendering
    // ======================
    const notesStr = order.notes || "";
    const nEntreprisePick = notesStr.match(/Entreprise Pick: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactPick = notesStr.match(/Contact Pick: (.*?)(\.|$|Phone|Email)/)?.[1]?.trim();
    const nPhonePick = notesStr.match(/Phone Pick: (.*?)(\.|$|Email|Code)/)?.[1]?.trim();
    const nEmailEnlev = notesStr.match(/Email Enlev: (.*?)(\.|$|Entreprise|Contact|Instructions)/)?.[1]?.trim();
    const pCode = order.pickup_access_code || notesStr.match(/(?:Code Enlev:|Code :|Code:)\s?([^.]+)/)?.[1]?.trim();

    const nEntrepriseDeliv = notesStr.match(/Entreprise Deliv: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactDeliv = notesStr.match(/Contact Deliv: (.*?)(\.|$|Phone|Instructions)/)?.[1]?.trim();
    const nPhoneDeliv = notesStr.match(/Phone Deliv: (.*?)(\.|$|Code|Instructions)/)?.[1]?.trim();
    const dCode = order.delivery_access_code || notesStr.match(/(?:Code Dest:|Code Deliv:)\s?([^.]+)/)?.[1]?.trim();

    const nInstructions = notesStr.match(/Instructions:\s*(.*?)(?:\.|$)/)?.[1]?.trim();
    const nPNote = notesStr.match(/Instructions:\s*(.*?)\s*\//)?.[1]?.trim() || (nInstructions && !String(nInstructions).includes('/') ? nInstructions : null);
    const nDNote = notesStr.match(/Instructions:\s*(.*?)\s*\/\s*(.*)(?:\.|$)/)?.[2]?.trim();

    // Guest order parsing
    const gBillingMatch = notesStr.match(/Billing: (.*?) \| (.*?) \| (.*?)$/);
    const gBillingName = gBillingMatch?.[1]?.trim();
    const gBillingCompany = gBillingMatch?.[2]?.trim();
    const gEmail = notesStr.match(/Email: ([^\s]+)/)?.[1]?.trim();
    const gPhone = notesStr.match(/Phone: ([\d\s]+)/)?.[1]?.trim();
    const gContact = notesStr.match(/Contact: ([^(]+)/)?.[1]?.trim();

    const pickupName = order.pickup_name || nEntreprisePick || nContactPick || "—";
    const pickupPhone = order.pickup_phone || nPhonePick || gPhone || order.notes?.match(/Contact: ([\d\s]+)/)?.[1] || "—";
    const deliveryName = order.delivery_name || nEntrepriseDeliv || nContactDeliv || "—";
    const deliveryPhone = order.delivery_phone || nPhoneDeliv || "—";

    // Client/Expediteur
    const displayCompany = client?.details?.company || order.expediteur?.nom || gBillingCompany || nEntreprisePick || "";
    const displayContactName = client?.details?.contact || client?.details?.full_name || order.nom_client || gBillingName || gContact || nContactPick || pickupName || "—";
    const displayEmail = client?.details?.email || order.email_client || order.expediteur?.email || gEmail || nEmailEnlev || "—";
    const displayPhone = client?.details?.phone || order.telephone_client || order.expediteur?.telephone || gPhone || pickupPhone || "—";
    const displayTopName = String(displayCompany || displayContactName);

    // Package
    const packageNature = order.package_type || order.delivery_type || order.notes?.split(' - ')?.[0] || "—";

    const gWeight = notesStr.match(/Poids: ([\d\w\s,.<>]+)/)?.[1];
    const packageWeight = order.weight ? String(`${order.weight} kg`) : String(gWeight && gWeight !== "undefined" ? gWeight : "—");

    const gDims = notesStr.match(/Dims: ([\d\w\sxX]+)/)?.[1] || notesStr.match(/Dimensions: ([^.]+)/)?.[1];
    const packageDims = order.package_description || String(gDims && gDims !== "undefined" ? gDims : "");

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
          firstName: d.first_name || latestClient?.first_name || (d.full_name || d.contact_name || "").split(' ')[0] || "",
          lastName: d.last_name || latestClient?.last_name || (d.full_name || d.contact_name || "").split(' ').slice(1).join(' ') || "",
          email: latestClient?.email || d.email || order?.sender_email || "",
          phone: d.phone || d.phone_number || d.telephone || latestClient?.telephone || (order?.notes || "").match(/Phone: ([^|]+)/)?.[1]?.trim() || "",
          company: d.company || latestClient?.company_name || order?.billing_company || "",
          billingAddress: latestClient?.address || d.address || d.billing_address || order?.billing_address || "",
          billingCity: latestClient?.city || d.city || d.billing_city || d.ville || order?.billing_city || "",
          billingZip: latestClient?.postal_code || d.zip || d.postal_code || d.billing_zip || d.postcode || order?.billing_zip || ""
        };
        await generateOrderPdf(order, clientInfo);
      } catch (err) {
        console.error("PDF Fail Client:", err);
        alert("Erreur lors de la génération du PDF.");
      }
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
      } else {
        alert("Erreur lors de l'envoi de la réclamation.");
      }
      setSubmittingClaim(false);
    };

    return (
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Commande</div>
            <h1 className="text-2xl font-bold text-slate-900">#{String(order.id || "").slice(0, 8)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
              order.status === 'driver_accepted' || order.status === 'in_progress' ? 'bg-orange-50 text-[#ed5518] border border-orange-100' :
              order.status === 'accepted' ? 'bg-blue-50 text-blue-600 border border-blue-100 animate-pulse' :
              order.status === 'assigned' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
              'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
              {clientStatusLabel(order) || "—"}
            </div>
            <button
              onClick={downloadPdf}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105 shadow-lg active:scale-95"
            >
              <FileText size={14} />
              <span>Télécharger le BC (PDF)</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Retour
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Itinéraire</div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Enlèvement</div>
                <div className="mt-2 text-sm font-bold text-slate-900 leading-none mb-1">{pickupName}</div>
                <div className="text-xs text-slate-500 leading-snug mb-2">{order.pickup_address || "—"}</div>
                <div className="text-xs font-semibold text-slate-900">
                  {pCode && <span className="font-bold mr-2 text-[#ed5518]">Code: {pCode}</span>}
                  {nPNote && nPNote !== "—" ? nPNote : "—"}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Livraison</div>
                <div className="mt-2 text-sm font-bold text-slate-900 leading-none mb-1">{deliveryName}</div>
                <div className="text-xs text-slate-500 leading-snug mb-2">{order.delivery_address || "—"}</div>
                <div className="text-xs font-semibold text-slate-900">
                  {dCode && <span className="font-bold mr-2 text-[#ed5518]">Code: {dCode}</span>}
                  {nDNote && nDNote !== "—" ? nDNote : "—"}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Formule</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 uppercase">{order.vehicle_type} {order.service_level}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Programmation</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {order.scheduled_at ? new Date(order.scheduled_at).toLocaleString() : "Immédiat"}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tél. Enlèvement</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {pickupPhone}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tél. Livraison</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {deliveryPhone}
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Détails du Colis</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Nature</div>
                      <div className="text-sm font-bold text-slate-900">
                        {packageNature}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Poids</div>
                      <div className="text-sm font-bold text-slate-900">
                        {packageWeight}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Contenu</div>
                      <div className="text-sm font-bold text-slate-900">
                        {packageDims || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Client / Expéditeur</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{displayTopName}</div>
                <div className="text-xs text-slate-500">{displayEmail}</div>
                <div className="text-xs text-slate-500">{displayPhone}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix TTC</div>
            <div className="mt-3 text-4xl font-bold text-slate-900">{(Number(order.price_ht || 0) * 1.2).toFixed(2)}€</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">{Number(order.price_ht || 0).toFixed(2)}€ HT</div>
            {/* Détails de livraison effective */}
            {order.status === 'delivered' && (order.delivery_comment || order.delivery_recipient) && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Détails de réception</span>
                </div>
                <div className="space-y-2">
                  {order.delivery_recipient && (
                    <div>
                      <div className="text-[8px] font-bold text-emerald-400 uppercase">Réceptionné par</div>
                      <div className="text-sm font-bold text-slate-800">{order.delivery_recipient}</div>
                    </div>
                  )}
                  {order.delivery_comment && (
                    <div>
                      <div className="text-[8px] font-bold text-emerald-400 uppercase">Déposé à / Précisions</div>
                      <div className="text-sm font-bold text-slate-700 italic">"{order.delivery_comment}"</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Statut</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{clientStatusLabel(order)}</div>
            </div>

            {/* Reclamation / Claim Section */}
            <div className="mt-4">
              {!order.claim_status || order.claim_status === 'none' ? (
                <>
                  {!showClaimForm ? (
                    <button
                      onClick={() => setShowClaimForm(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                    >
                      <AlertTriangle size={14} />
                      Signaler un problème
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="text-xs font-black text-rose-600 uppercase tracking-widest">Nouvelle Réclamation</div>
                      <textarea
                        rows={3}
                        placeholder="Décrivez votre problème (retard, colis dégradé...)"
                        className="w-full rounded-xl border border-rose-100 bg-white p-3 text-xs focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-300 transition-all"
                        value={claimNotes}
                        onChange={(e) => setClaimNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={submitClaim}
                          disabled={submittingClaim}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/10 active:scale-95 disabled:opacity-50"
                        >
                          {submittingClaim ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Envoyer
                        </button>
                        <button
                          onClick={() => setShowClaimForm(false)}
                          className="px-4 rounded-xl bg-white border border-rose-100 text-xs font-bold text-rose-400"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`p-4 rounded-2xl border ${order.claim_status === 'resolved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} animate-in zoom-in-95 duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {order.claim_status === 'resolved' ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-rose-600" />}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${order.claim_status === 'resolved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Réclamation {order.claim_status === 'resolved' ? 'résolue' : 'en cours'}
                      </span>
                    </div>
                    {order.claim_status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />}
                  </div>
                  <p className={`text-[11px] font-medium leading-relaxed ${order.claim_status === 'resolved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {order.claim_notes || "Aucun détail fourni."}
                  </p>
                    {order.claim_reply && (
                      <div className="mt-4 p-3 bg-white/60 rounded-xl border border-white/80 shadow-sm animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-800">Réponse de One Connexion</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">
                          "{order.claim_reply}"
                        </p>
                      </div>
                    )}
                    {order.claim_proof_url && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-white/80 shadow-sm bg-white/40 group cursor-pointer" onClick={() => window.open(order.claim_proof_url, '_blank')}>
                         <img src={order.claim_proof_url} alt="Preuve" className="w-full h-auto object-cover max-h-[300px] hover:scale-105 transition-transform duration-500" />
                         <div className="p-2 bg-white/80 flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Photo de preuve jointe</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                               <LucideImage size={10} /> Agrandir
                            </span>
                         </div>
                      </div>
                    )}
                    {order.claim_status === 'pending' && !order.claim_reply && (
                      <div className="mt-3 text-[9px] font-bold text-rose-400 bg-white/50 rounded-lg p-2 border border-rose-100 italic">
                        Notre équipe examine votre demande. Vous recevrez une réponse sous peu.
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Historique de la commande</div>
          </div>
          <div className="relative grid gap-6">
            <div className="absolute left-3 top-1 h-full w-px bg-slate-200" />
            {timeline.map((t, idx) => (
              <div key={t.label} className="relative flex items-start gap-4">
                <div className={`mt-1 h-3 w-3 rounded-full transition-all duration-500 ${t.done ? "bg-[#ed5518] scale-110 shadow-[0_0_10px_rgba(237,85,24,0.5)]" : "bg-slate-200"}`} />
                {idx < timeline.length - 1 && (
                  <div className={`absolute left-[5px] top-4 h-full w-px transition-colors duration-500 ${t.done && timeline[idx+1].done ? "bg-[#ed5518]" : "bg-slate-200"}`} />
                )}
                <div className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition-all ${t.done ? "bg-slate-50 border border-slate-100 shadow-sm" : "bg-white border border-transparent opacity-60"}`}>
                  <div className={`text-sm font-bold ${t.done ? "text-slate-900" : "text-slate-400"}`}>{t.label}</div>
                  <div className={`text-[10px] font-black uppercase tracking-tight ${t.done ? "text-[#ed5518]" : "text-slate-400"}`}>{t.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="p-8 m-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
        <h2 className="text-xl font-bold mb-4">Une erreur technique est survenue !</h2>
        <p className="mb-2">Message: {err.message}</p>
        <pre className="text-xs whitespace-pre-wrap opacity-75">{err.stack}</pre>
      </div>
    );
  }
}



