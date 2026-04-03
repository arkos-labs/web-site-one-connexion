import { ArrowUpRight, Truck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivity({ orders, downloadOrder }) {
  const navigate = useNavigate();

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      case 'pending':
      case 'pending_acceptance': return 'Attente';
      case 'accepted':
      case 'assigned':
      case 'driver_accepted':
      case 'in_progress': return 'En cours';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-900">Activité Récente</h2>
        <button onClick={() => navigate('/dashboard-client/orders')} className="group flex items-center gap-2 text-sm font-bold text-[#ed5518] hover:translate-x-1 transition-all">Gérer <ArrowUpRight size={16} /></button>
      </div>
      <div className="space-y-4">
        {orders.length === 0 ? <div className="py-20 text-center font-bold text-slate-400 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">Aucune commande récente.</div> : orders.map((o) => (
          <div key={o.id} onClick={() => navigate(`/dashboard-client/orders/${o.id}`)} className="group relative flex cursor-pointer items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-6">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-slate-50 group-hover:bg-[#ed5518]/10 group-hover:text-[#ed5518] group-hover:rotate-6 transition-all"><Truck size={24} /></div>
              <div>
                <div className="font-bold text-slate-900 md:text-lg">{o.pickup_city || 'Départ'} → {o.delivery_city || 'Arrivée'}</div>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-400"><span>#{o.id.slice(0, 8).toUpperCase()}</span> • <span>{new Date(o.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`rounded-xl px-3 py-1 text-[11px] font-black uppercase tracking-wide transition-all ${
                o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500' : 
                o.status === 'cancelled' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-500' :
                'bg-amber-50 text-amber-600 group-hover:bg-amber-500'
              } group-hover:text-white`}>
                {getStatusLabel(o.status)}
              </span>
              <button onClick={(e) => { e.stopPropagation(); downloadOrder(o); }} className="text-xs font-bold text-slate-400 hover:text-slate-900"><FileText size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvoicesList({ invoices, downloadInvoice }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-black text-slate-900 px-2">Factures</h2>
      <div className="rounded-[2.5rem] bg-white shadow-sm border border-slate-100 p-2 divide-y divide-slate-50">
        {invoices.length === 0 ? <div className="py-20 text-center font-bold text-slate-400">Aucune facture.</div> : invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all rounded-3xl group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#ed5518] text-white flex items-center justify-center shadow-lg shadow-[#ed5518]/10 group-hover:scale-110 transition-transform"><FileText size={20} /></div>
              <div>
                <div className="font-bold text-slate-900">{new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{Number(inv.total_ttc).toFixed(2)}€ TTC</div>
              </div>
            </div>
            <button onClick={() => downloadInvoice(inv)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"><ArrowUpRight size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
