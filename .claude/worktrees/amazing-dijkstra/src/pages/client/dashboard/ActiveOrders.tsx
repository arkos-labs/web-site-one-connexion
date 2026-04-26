import { Truck, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ActiveOrders({ orders, downloadOrder }) {
  const navigate = useNavigate();
  
  const activeStatus = ['pending_acceptance', 'pending', 'accepted', 'assigned', 'driver_accepted', 'in_progress'];
  const activeOrders = orders.filter(o => activeStatus.includes(o.status));

  if (activeOrders.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2">
        {activeOrders.map((o) => (
          <div key={o.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#ed5518] group-hover:bg-[#ed5518] group-hover:text-white transition-all">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{o.pickup_city || 'Départ'} → {o.delivery_city || 'Arrivée'}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#ed5518]">
                    #{o.id.slice(0, 8)} • {['pending_acceptance', 'pending'].includes(o.status) ? 'En attente validation' : 'Mission en cours'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => downloadOrder(o)}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold text-white shadow-lg hover:bg-[#ed5518] transition-all active:scale-95"
              >
                <FileText size={14} />
                <span>BON DE COMMANDE</span>
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="h-1.5 flex-1 bg-slate-50 rounded-full overflow-hidden flex gap-0.5">
                <div className={`h-full ${['pending', 'pending_acceptance', 'accepted', 'assigned', 'driver_accepted', 'in_progress'].includes(o.status) ? 'bg-[#ed5518] w-1/3' : 'bg-slate-200 w-1/3'}`}></div>
                <div className={`h-full ${['in_progress'].includes(o.status) ? 'bg-[#ed5518] w-1/3' : 'bg-slate-200 w-1/3'}`}></div>
                <div className={`h-full bg-slate-200 w-1/3 opacity-30`}></div>
              </div>
              <button onClick={() => navigate(`/dashboard-client/orders/${o.id}`)} className="ml-4 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
