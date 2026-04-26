import { Truck, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ActiveOrders({ orders, downloadOrder }) {
  const navigate = useNavigate();

  const activeStatus = ['pending_acceptance', 'pending', 'accepted', 'assigned', 'driver_accepted', 'in_progress'];
  const activeOrders = orders.filter(o => activeStatus.includes(o.status));

  if (activeOrders.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-2 w-2 rounded-full bg-[#ed5518] animate-pulse"></div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-noir/40">Suivi en temps réel</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {activeOrders.map((o) => (
          <div key={o.id} className="group relative overflow-hidden rounded-xl bg-noir p-10 shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ed5518]/5 blur-3xl rounded-full"></div>

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-display italic text-white leading-tight mb-2">
                    {o.pickup_city || 'Départ'} <span className="text-[#ed5518]/40 mx-2 text-sm not-italic">to</span> {o.delivery_city || 'Arrivée'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <span className="text-[#ed5518]">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="h-0.5 w-0.5 bg-white/20 rounded-full"></span>
                    <span>{['pending_acceptance', 'pending'].includes(o.status) ? 'Validation One' : 'Transfert en cours'}</span>
                  </div>
                </div>
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white/5 text-[#ed5518]">
                  <Truck size={22} className="animate-pulse" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full ${['pending', 'pending_acceptance', 'accepted', 'assigned', 'driver_accepted', 'in_progress'].includes(o.status) ? 'bg-[#ed5518] w-1/3' : 'bg-white/10 w-1/3'}`}></div>
                  <div className={`h-full ${['in_progress'].includes(o.status) ? 'bg-[#ed5518] w-1/3' : 'bg-white/10 w-1/3'}`}></div>
                  <div className={`h-full bg-white/5 w-1/3`}></div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard-client/orders/${o.id}`)}
                  className="text-white/40 hover:text-[#ed5518] transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <button
                onClick={() => downloadOrder(o)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-[0.3em] text-white hover:bg-[#ed5518] hover:border-[#ed5518] transition-all"
              >
                <FileText size={14} />
                <span>Bon de Commande</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
