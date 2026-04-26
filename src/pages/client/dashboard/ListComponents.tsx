import { ArrowUpRight, Truck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivity({ orders, downloadOrder }) {
  const navigate = useNavigate();

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      case 'pending':
      case 'pending_acceptance': return 'Programmé';
      default: return 'Transit';
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-4xl font-display italic text-noir">Activité <span className="text-[#ed5518]">Récente.</span></h2>
        <button
          onClick={() => navigate('/dashboard-client/orders')}
          className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ed5518] hover:translate-x-1 transition-all"
        >
          Historique Complet <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white/50 rounded-[2.5rem] border border-noir/5">
            <div className="h-12 w-12 rounded-full border border-noir/5 mx-auto flex items-center justify-center text-noir/10">
              <Truck size={24} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Aucune mission archivée</p>
          </div>
        ) : orders.map((o) => (
          <div
            key={o.id}
            onClick={() => navigate(`/dashboard-client/orders/${o.id}`)}
            className="group relative flex cursor-pointer items-center justify-between rounded-[2.5rem] bg-white p-8 shadow-sm border border-noir/5 hover:border-[#ed5518]/20 hover:shadow-2xl hover:shadow-noir/[0.03] transition-all"
          >
            <div className="flex items-center gap-8">
              <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-2xl bg-noir/[0.02] border border-noir/5 text-noir/10 group-hover:bg-[#ed5518]/5 group-hover:text-[#ed5518] group-hover:border-[#ed5518]/10 transition-all">
                <Truck size={24} strokeWidth={1} />
              </div>
              <div>
                <div className="text-2xl font-display italic text-noir leading-none mb-3 group-hover:text-[#ed5518] transition-colors">
                  {o.pickup_city || 'Paris'} <span className="text-noir/10 mx-2 text-sm not-italic font-sans">→</span> {o.delivery_city || 'Région Capital'}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-noir/20 uppercase tracking-[0.2em]">
                  <span className="text-[#ed5518]/50 opacity-60">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="h-1 w-1 bg-noir/10 rounded-full"></span>
                  <span>{new Date(o.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-lg border transition-all ${o.status === 'delivered'
                ? 'border-emerald-100 text-emerald-600 bg-emerald-50/50' :
                o.status === 'cancelled'
                  ? 'border-rose-100 text-rose-600 bg-rose-50/50' :
                  'border-noir/5 text-noir/40 bg-noir/[0.02]'
                }`}>
                {getStatusLabel(o.status)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); downloadOrder(o); }}
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-noir/[0.02] border border-transparent hover:border-noir/10 hover:bg-white text-noir/10 hover:text-noir transition-all"
              >
                <FileText size={20} strokeWidth={1.5} />
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
    <div className="flex flex-col gap-10">
      <h2 className="text-4xl font-display italic text-noir px-2">Facturation.</h2>
      <div className="rounded-[2.5rem] bg-white border border-noir/5 divide-y divide-noir/[0.03] overflow-hidden shadow-sm">
        {invoices.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-12 w-12 rounded-full border border-noir/5 mx-auto flex items-center justify-center text-noir/10">
              <FileText size={24} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Aucun document comptable</p>
          </div>
        ) : invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-8 hover:bg-cream/30 transition-all group">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-noir flex items-center justify-center text-white/40 group-hover:bg-[#ed5518] group-hover:text-white transition-all shadow-xl shadow-noir/10">
                <FileText size={20} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-display italic text-noir group-hover:text-[#ed5518] transition-colors leading-none">
                  {new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-noir/20 uppercase tracking-[0.2em]">
                  <span>{Number(inv.total_ttc).toFixed(2)}€ TTC</span>
                  <span className="h-1 w-1 bg-noir/5 rounded-full"></span>
                  <span className="text-emerald-600/50 italic not-uppercase tracking-normal">Règlement complété</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadInvoice(inv)}
              className="h-14 w-14 flex items-center justify-center rounded-full border border-noir/5 text-noir/10 hover:border-[#ed5518]/20 hover:text-[#ed5518] hover:bg-[#ed5518]/5 transition-all shadow-sm"
            >
              <ArrowUpRight size={22} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
