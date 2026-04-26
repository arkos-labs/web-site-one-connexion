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
      default: return 'En cours';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-3xl font-display italic text-noir">Missions Récentes</h2>
        <button
          onClick={() => navigate('/dashboard-client/orders')}
          className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ed5518] hover:translate-x-1 transition-all"
        >
          Tout voir <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold uppercase tracking-widest text-noir/30 bg-white rounded-xl border border-noir/5">
            Aucun historique à ce jour.
          </div>
        ) : orders.map((o) => (
          <div
            key={o.id}
            onClick={() => navigate(`/dashboard-client/orders/${o.id}`)}
            className="group relative flex cursor-pointer items-center justify-between rounded-xl bg-white p-8 shadow-sm border border-noir/5 hover:border-[#ed5518] transition-all"
          >
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-lg bg-noir/5 text-noir group-hover:bg-[#ed5518]/10 group-hover:text-[#ed5518] transition-all">
                <Truck size={22} />
              </div>
              <div>
                <div className="text-xl font-display italic text-noir leading-none mb-2">
                  {o.pickup_city || 'Paris'} <span className="text-[#ed5518]/40 mx-2 text-sm not-italic">to</span> {o.delivery_city || 'Région Capital'}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-noir/30 uppercase tracking-widest">
                  <span className="text-[#ed5518]">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="h-0.5 w-0.5 bg-noir/20 rounded-full"></span>
                  <span>{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all ${o.status === 'delivered' ? 'border-emerald-100 text-emerald-600 bg-emerald-50/30' :
                o.status === 'cancelled' ? 'border-rose-100 text-rose-600 bg-rose-50/30' :
                  'border-[#ed5518]/20 text-[#ed5518] bg-[#ed5518]/5'
                }`}>
                {getStatusLabel(o.status)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); downloadOrder(o); }}
                className="p-3 rounded-lg hover:bg-noir hover:text-white transition-all text-noir/30"
              >
                <FileText size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvoicesList({ invoices, downloadInvoice }) {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-display italic text-noir px-2">Facturation</h2>
      <div className="rounded-xl bg-white shadow-sm border border-noir/5 divide-y divide-noir/5 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold uppercase tracking-widest text-noir/30">
            Aucun document édité.
          </div>
        ) : invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-8 hover:bg-cream/50 transition-all group">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-lg bg-noir text-white flex items-center justify-center group-hover:bg-[#ed5518] transition-colors">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-lg font-display italic text-noir mb-1">
                  {new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-[10px] font-bold text-noir/30 uppercase tracking-widest">
                  {Number(inv.total_ttc).toFixed(2)}€ TTC <span className="text-[#ed5518]/50 ml-2 italic">· Payé</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadInvoice(inv)}
              className="h-12 w-12 flex items-center justify-center rounded-full border border-noir/5 text-noir/20 hover:border-[#ed5518] hover:text-[#ed5518] hover:bg-[#ed5518]/5 transition-all"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
