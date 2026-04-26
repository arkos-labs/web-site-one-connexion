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
      case 'pending': return 'Instruction';
      case 'resolved': return 'Clôturé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Accès aux dossiers</p>
      </div>
    );
  }

  return (
    <div className="font-body pb-20">
      <header className="mb-16 space-y-4 border-b border-noir/5 pb-10">
        <h1 className="text-6xl font-display italic text-noir leading-none">
          Mes <span className="text-[#ed5518]">Litiges.</span>
        </h1>
        <p className="text-noir/40 font-medium tracking-[0.1em]">Suivi de vos réclamations et assistance technique.</p>
      </header>

      {orders.length === 0 ? (
        <div className="max-w-3xl mx-auto py-20 text-center space-y-12">
          <div className="p-20 rounded-[3rem] border border-noir/5 bg-white/50 flex flex-col items-center space-y-6">
            <div className="h-20 w-20 rounded-full border border-noir/5 flex items-center justify-center text-noir/10">
              <AlertTriangle size={40} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display italic text-noir">Aucun litige en cours.</h3>
              <p className="text-sm text-noir/40 max-w-xs mx-auto leading-relaxed">
                Tous vos dossiers sont en ordre. Si vous rencontrez un problème, signalez-le depuis les détails de la commande concernée.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => navigate(`/dashboard-client/orders/${o.id}`)}
              className="group relative bg-white rounded-[2rem] border border-noir/5 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all hover:border-[#ed5518]/20 hover:shadow-xl hover:shadow-noir/5 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-6">
                <div className={`shrink-0 h-16 w-16 flex items-center justify-center rounded-2xl border ${o.claim_status === 'resolved'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-rose-50 border-rose-100 text-rose-600'
                  }`}>
                  <AlertTriangle size={24} strokeWidth={1.5} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-noir/30">Dossier #{o.id.slice(0, 8)}</span>
                    <span className={`h-1 w-1 rounded-full ${o.claim_status === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  </div>
                  <h4 className="text-2xl font-display italic text-noir group-hover:text-[#ed5518] transition-colors leading-none pb-1">
                    {o.pickup_city} → {o.delivery_city}
                  </h4>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-noir/20 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> Ouvert le {new Date(o.claim_opened_at || o.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:items-end gap-3 lg:pr-10">
                <div className="flex items-center gap-3">
                  {o.claim_reply && (
                    <span className="px-4 py-2 rounded-lg bg-noir text-white text-[9px] font-black uppercase tracking-[0.2em]">
                      Message Reçu
                    </span>
                  )}
                  <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${o.claim_status === 'resolved'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                    {getStatusLabel(o.claim_status)}
                  </span>
                </div>
                <div className="max-w-md lg:text-right">
                  <p className="text-sm text-noir/50 italic leading-relaxed truncate lg:max-w-xs">"{o.claim_notes || "Aucun détail..."}"</p>
                </div>
              </div>

              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden lg:block">
                <ArrowRight size={24} className="text-[#ed5518]" strokeWidth={1} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
