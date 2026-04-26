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
      return "bg-noir/[0.02] text-noir/30 border-noir/5";
    case "accepted":
      return "bg-noir text-white border-noir shadow-lg shadow-noir/20";
    case "assigned":
      return "bg-[#ed5518]/5 text-[#ed5518] border-[#ed5518]/10 tracking-[0.2em]";
    case "driver_accepted":
    case "in_progress":
      return "bg-[#ed5518] text-white border-[#ed5518] shadow-lg shadow-orange-500/20";
    case "delivered":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "cancelled":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-noir/[0.02] text-noir/20 border-noir/5";
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
    <div className="min-h-screen pt-4 space-y-16 font-body pb-20">
      <header className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between border-b border-noir/5 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-noir/20">
            <div className="h-px w-10 bg-[#ed5518]/40"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ed5518]/60">Suivi Logistique</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-display italic text-noir leading-tight">
            Toutes vos <br />
            <span className="text-[#ed5518]">Expéditions.</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/dashboard-client/nouvelle-course')}
          className="group relative overflow-hidden rounded-[1.25rem] bg-noir px-10 py-6 text-[11px] font-bold uppercase tracking-[0.4em] text-white shadow-2xl shadow-noir/20 hover:shadow-orange-500/20 active:scale-95 transition-all"
        >
          <span className="relative z-10">Créer une Mission</span>
          <div className="absolute inset-0 bg-[#ed5518] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </header>

      <div className="space-y-8">
        {loadingOrders ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <Loader2 className="animate-spin text-[#ed5518]" size={48} strokeWidth={1} />
              <div className="absolute inset-0 blur-xl bg-[#ed5518]/20 animate-pulse"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-noir/20">Accès sécurisé à vos données</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2.5rem] border border-noir/5 shadow-sm space-y-4">
            <div className="h-16 w-16 border border-noir/5 rounded-full flex items-center justify-center mx-auto text-noir/5">
              <Truck size={32} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-noir/20">Votre carnet de route est vide</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard-client/orders/${order.id}`, { state: { order } })}
                className="group relative flex w-full cursor-pointer flex-col md:flex-row md:items-center justify-between gap-8 rounded-[2.5rem] bg-white p-10 border border-noir/5 hover:border-[#ed5518]/20 hover:shadow-2xl hover:shadow-noir/[0.03] transition-all duration-700"
              >
                <div className="flex items-center gap-10">
                  <div className={`
                    h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-sm
                    ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-noir/[0.02] text-noir/10 border border-noir/5 group-hover:bg-[#ed5518]/5 group-hover:text-[#ed5518] group-hover:border-[#ed5518]/10'}
                  `}>
                    {order.status === 'delivered' ? <Truck size={28} strokeWidth={1} /> : <Clock size={28} strokeWidth={1} />}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-bold text-[#ed5518]/40 uppercase tracking-[0.3em]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <span className="h-1 w-1 bg-noir/10 rounded-full"></span>
                      <div className="text-[10px] font-bold text-noir/20 uppercase tracking-[0.3em]">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-3xl font-display italic text-noir leading-none group-hover:text-[#ed5518] transition-colors pr-4">
                      {order.pickup_city || 'Départ'} <span className="mx-2 text-noir/5 not-italic font-sans text-xl">→</span> {order.delivery_city || 'Arrivée'}
                    </div>
                    {order.claim_status && order.claim_status !== 'none' && (
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${order.claim_status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                        <AlertTriangle size={12} strokeWidth={2.5} />
                        {order.claim_status === 'resolved' ? 'Litige résolu' : 'Anomalie signalée'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden xl:block flex-1 max-w-sm border-l border-noir/5 px-12">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-noir/20 uppercase tracking-[0.3em]">Détails du trajet</p>
                    <div className="text-xs text-noir/40 leading-relaxed italic truncate font-display">
                      {order.pickup_address?.split(',')[0]} ... {order.delivery_address?.split(',')[0]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-12 pt-8 md:pt-0 border-t md:border-t-0 border-noir/[0.03]">
                  <div className="text-left md:text-right">
                    <div className="text-3xl font-display italic text-noir">
                      {(Number(order.price_ht) * 1.2).toFixed(2)}€
                    </div>
                    <div className="text-[9px] font-bold text-noir/20 uppercase tracking-[0.4em]">Valeur TTC</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] border transition-all duration-500 whitespace-nowrap ${statusStyle(order.status)}`}>
                      {clientStatusLabel(order)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // ... pdf generation logic remains identical
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
                      className="group/pdf flex items-center justify-center h-14 w-14 rounded-full border border-noir/5 bg-white text-noir/20 hover:border-[#ed5518] hover:text-[#ed5518] hover:bg-[#ed5518]/5 transition-all shadow-sm active:scale-90"
                      title="Télécharger Bon de Commande"
                    >
                      <FileText size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Footer Branding */}
      <div className="flex items-center justify-center py-20 border-t border-noir/[0.02]">
        <div className="flex flex-col items-center gap-6 group">
          <div className="h-px w-20 bg-[#ed5518]/20 transition-all group-hover:w-40"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-noir/20 italic hover:text-[#ed5518] transition-colors cursor-default text-center leading-loose">
            One Connexion Prestige <br />
            <span className="text-[8px] tracking-[0.8em] not-italic opacity-40">24/7 Global Support</span>
          </p>
        </div>
      </div>
    </div>
  );
}



