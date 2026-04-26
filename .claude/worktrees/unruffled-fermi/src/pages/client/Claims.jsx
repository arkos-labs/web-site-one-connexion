import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Loader2, AlertTriangle, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

export default function Claims() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
    
    const channel = supabase
      .channel('client-claims-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchClaims())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .neq('claim_status', 'none')
        .not('claim_status', 'is', null)
        .order('claim_opened_at', { ascending: false });

      if (error) console.error('Error fetching claims:', error);
      else setOrders(data || []);
    } catch (err) {
      console.error('Error in fetchClaims:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-sm font-bold tracking-widest uppercase">Chargement de vos dossiers…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">Mes Litiges ⚖️</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Suivez l'état de vos réclamations et échangez avec notre support.</p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-20 text-center shadow-sm border border-slate-100">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
            <AlertTriangle size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Aucun litige en cours</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">Tous vos dossiers sont en ordre. Si vous rencontrez un problème avec une mission, signalez-le depuis les détails de la commande.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => navigate(`/dashboard-client/orders/${o.id}`)}
              className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:border-[#ed5518]/30 transition-all cursor-pointer hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${o.claim_status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 shadow-lg shadow-rose-900/5'}`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission #{o.id.slice(0, 8)}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${o.claim_status === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#ed5518] transition-colors">{o.pickup_city} → {o.delivery_city}</h4>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                       <Clock size={10} /> Ouvert le {new Date(o.claim_opened_at || o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                <div className="flex items-center gap-2">
                   {o.claim_reply && (
                     <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                        <MessageSquare size={10} /> Réponse reçue
                     </div>
                   )}
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${o.claim_status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                    {getStatusLabel(o.claim_status)}
                   </div>
                </div>
                <div className="max-w-md md:text-right">
                  <p className="text-xs text-slate-500 italic truncate italic">"{o.claim_notes || "Aucun détail..."}"</p>
                </div>
              </div>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 hidden md:block">
                 <ArrowRight size={20} className="text-[#ed5518]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
