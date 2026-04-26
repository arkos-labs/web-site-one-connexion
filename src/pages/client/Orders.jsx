import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Truck, Loader2, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { autocompleteAddress } from "../../lib/autocomplete";
import { generateOrderPdf } from "../../lib/pdf-generator";

const VEHICLES = ["Moto", "Voiture"];
const SERVICES = ["Normal", "Exclu", "Super"];
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

const FAVORITES = [
  { label: "Siège One Connexion", address: "10 Rue de Paris, 75008 Paris", contact: "Accueil • 01 00 00 00 00" },
  { label: "Entrepôt Nord", address: "12 Rue des Entreprises, 93200 Saint-Denis", contact: "Karim • 06 00 00 00 00" },
];

const getPostcode = (str = "") => {
  const match = String(str).match(/\b\d{5}\b/);
  return match ? match[0] : "";
};

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

function statusStyle(status) {
  switch (status) {
    case "pending_acceptance":
    case "pending":
      return "bg-noir/5 text-noir/40 border-noir/5";
    case "accepted":
      return "bg-noir text-white border-noir animate-pulse";
    case "assigned":
      return "bg-[#ed5518]/10 text-[#ed5518] border-[#ed5518]/20";
    case "driver_accepted":
    case "in_progress":
      return "bg-[#ed5518] text-white border-[#ed5518]";
    case "delivered":
      return "bg-emerald-500 text-white border-emerald-500";
    case "cancelled":
      return "bg-red-500 text-white border-red-500";
    default:
      return "bg-noir/5 text-noir/20 border-noir/5";
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load orders
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('client-orders-list-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (pData) setProfile(pData);

      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching orders:', error);
      else setOrders(data || []);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="min-h-screen pt-4 space-y-12 font-body">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-noir/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-noir/20">
            <div className="h-px w-8 bg-noir/10"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Gestion Logistique</span>
          </div>
          <h1 className="text-6xl font-display italic text-noir leading-none">
            Expéditions <span className="text-[#ed5518]">Récentes.</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/dashboard-client/nouvelle-course')}
          className="group relative overflow-hidden rounded-xl bg-noir px-8 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl shadow-noir/20 hover:bg-[#ed5518] transition-all"
        >
          <span className="relative z-10">Nouvelle Demande</span>
          <div className="absolute inset-0 bg-[#ed5518] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </header>

      <div className="space-y-6">
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-noir/10" size={40} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/20">Synchronisation des données</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-noir/5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Historique des courses vide</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard-client/orders/${order.id}`, { state: { order } })}
                className="group relative flex w-full cursor-pointer flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl bg-white p-6 border border-noir/5 hover:border-[#ed5518]/30 hover:shadow-2xl hover:shadow-[#ed5518]/5 transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  <div className={`
                    h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-500
                    ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-500' : 'bg-noir/5 text-noir/40 group-hover:bg-[#ed5518]/10 group-hover:text-[#ed5518]'}
                  `}>
                    {order.status === 'delivered' ? <Truck size={24} strokeWidth={1.5} /> : <Clock size={24} strokeWidth={1.5} />}
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-noir/20 uppercase tracking-[0.3em]">
                      #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-lg font-display italic text-noir leading-none group-hover:text-[#ed5518] transition-colors">
                      {order.pickup_city || 'Départ'} <span className="mx-2 text-noir/20 non-italic text-sm">→</span> {order.delivery_city || 'Arrivée'}
                    </div>
                    {order.claim_status && order.claim_status !== 'none' && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${order.claim_status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                        <AlertTriangle size={10} />
                        {order.claim_status === 'resolved' ? 'Litige résolu' : 'Litige en cours'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block flex-1 max-w-sm">
                  <div className="text-[10px] text-noir/30 font-medium truncate italic px-10">
                    {order.pickup_address.split(',')[0]} ... {order.delivery_address.split(',')[0]}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-10 pt-4 md:pt-0 border-t md:border-t-0 border-noir/5">
                  <div className="text-left md:text-right">
                    <div className="text-2xl font-display italic text-noir">
                      {(Number(order.price_ht) * 1.2).toFixed(2)}€
                    </div>
                    <div className="text-[9px] font-bold text-noir/20 uppercase tracking-[0.4em]">Montant TTC</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border transition-colors ${statusStyle(order.status)}`}>
                      {clientStatusLabel(order)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const clientInfo = {
                          name: profile?.details?.full_name || profile?.details?.contact || profile?.email?.split('@')[0] || "Client",
                          email: profile?.email || profile?.details?.email || "",
                          phone: profile?.details?.phone || "",
                          company: profile?.details?.company || profile?.details?.company_name || "",
                          billingAddress: order.billing_address || profile?.address || profile?.details?.address || "",
                          billingCity: order.billing_city || profile?.city || profile?.details?.city || "",
                          billingZip: order.billing_zip || profile?.postal_code || profile?.details?.zip || profile?.details?.postal_code || ""
                        };
                        generateOrderPdf(order, clientInfo);
                      }}
                      className="group/pdf flex items-center justify-center h-10 w-10 rounded-full border border-noir/5 bg-white text-noir hover:bg-noir hover:text-white transition-all shadow-sm"
                      title="Télécharger Bon de Commande"
                    >
                      <FileText size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative support note */}
      <div className="flex items-center justify-center pt-10 opacity-30 group hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-noir/20"></div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-noir/60 italic">
            Besoin d'aide ? Contactez notre concierge logistique 24/7
          </p>
          <div className="h-px w-10 bg-noir/20"></div>
        </div>
      </div>
    </div>
  );
}



