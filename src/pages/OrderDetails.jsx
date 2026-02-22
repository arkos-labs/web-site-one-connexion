import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
// pdfGenerator loaded dynamically
import { Loader2 } from "lucide-react";

function clientStatusLabel(order) {
  const status = typeof order === 'string' ? order : order.status;
  const driverId = typeof order === 'string' ? null : order.driver_id;

  switch (status) {
    case "pending_acceptance":
    case "pending":
      return "En attente";
    case "accepted":
    case "assigned":
      return driverId ? "Dispatchée" : "Acceptée";
    case "dispatched":
    case "driver_accepted":
    case "in_progress":
    case "picked_up":
      return "En cours";
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

  useEffect(() => {
    // If we have an order ID but the object lacks full details (like pickup_address)
    // we must fetch the complete order data. This happens when coming from Dashboard stats.
    if ((!order || !order.pickup_address) && (id || order?.id)) {
      fetchFullOrder();
    } else if (order?.client_id) {
      fetchClient(order.client_id);
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
      { label: "Commande passée", value: order.created_at ? new Date(order.created_at).toLocaleString() : "—" },
      { label: " en cours", value: order.status === 'delivered' ? "Effectuée" : "En cours" },
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
      const { generateOrderPdf } = await import("../lib/pdfGenerator");
      generateOrderPdf(order, client || order.client || {});
    };

    return (
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Commande</div>
            <h1 className="text-2xl font-bold text-slate-900">#{String(order.id || "").slice(0, 8)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white'}`}>
              {clientStatusLabel(order) || "—"}
            </div>
            <button
              onClick={downloadPdf}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
            >
              Télécharger le bon (PDF)
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
                  {pCode && <span className="font-bold mr-2 text-orange-600">Code: {pCode}</span>}
                  {nPNote && nPNote !== "—" ? nPNote : "—"}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Livraison</div>
                <div className="mt-2 text-sm font-bold text-slate-900 leading-none mb-1">{deliveryName}</div>
                <div className="text-xs text-slate-500 leading-snug mb-2">{order.delivery_address || "—"}</div>
                <div className="text-xs font-semibold text-slate-900">
                  {dCode && <span className="font-bold mr-2 text-orange-600">Code: {dCode}</span>}
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
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Statut</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{clientStatusLabel(order)}</div>
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
                <div className={`mt-1 h-3 w-3 rounded-full ${t.value !== "—" ? "bg-slate-900" : "bg-slate-200"}`} />
                {idx < timeline.length - 1 && (
                  <div className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />
                )}
                <div className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                  <div className="text-xs font-bold text-slate-500">{t.value}</div>
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
