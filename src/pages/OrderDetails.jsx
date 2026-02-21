import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const order = state?.order;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order?.client_id) {
      fetchClient();
    }
  }, [order]);

  const fetchClient = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', order.client_id).single();
    if (data) setClient(data.details || {});
    setLoading(false);
  };

  if (!order) {
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

  const timeline = [
    { label: "Commande passée", value: order.created_at ? new Date(order.created_at).toLocaleString() : "—" },
    { label: " en cours", value: order.status === 'delivered' ? "Effectuée" : "En cours" },
  ];

  const downloadPdf = async () => {
    const { generateOrderPdf } = await import("../lib/pdfGenerator");
    generateOrderPdf(order, client || order.client || {});
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Commande</div>
          <h1 className="text-2xl font-bold text-slate-900">#{order.id.slice(0, 8)}</h1>
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
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Enlèvement</div>
              <div className="mt-2 text-sm font-semibold text-slate-900 leading-snug">{order.pickup_address || "—"}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Livraison</div>
              <div className="mt-2 text-sm font-semibold text-slate-900 leading-snug">{order.delivery_address || "—"}</div>
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
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Contact / Accès</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {order.notes?.match(/Contact: ([\d\s]+)/)?.[1] || "—"}
                </div>
                <div className="text-xs text-slate-500">Code: {order.notes?.match(/Code: (\w+)/)?.[1] || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Type de Colis</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{order.notes?.split(' - ')?.[0] || "—"}</div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Client</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{client?.company || order.client?.name || "—"}</div>
                <div className="text-xs text-slate-500">{client?.email || order.client?.email || "—"}</div>
                <div className="text-xs text-slate-500">{client?.phone || order.client?.phone || "—"}</div>
                <div className="text-xs text-slate-500">SIRET: {client?.siret || order.client?.siret || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Détails Colis</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {order.notes?.match(/Poids: ([\d\w\s]+)/)?.[0] || "—"}
                </div>
                <div className="text-xs text-slate-500">{order.notes?.match(/Dims: ([\d\w\sx]+)/)?.[0] || ""}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix TTC</div>
          <div className="mt-3 text-4xl font-bold text-slate-900">{(Number(order.price_ht) * 1.2).toFixed(2)}€</div>
          <div className="text-xs text-slate-400 mt-1 font-semibold">{Number(order.price_ht).toFixed(2)}€ HT</div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Statut</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{clientStatusLabel(order)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400"> de la commande</div>
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
}
