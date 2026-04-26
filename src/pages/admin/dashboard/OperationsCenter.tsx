import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

const STATUS_CONFIG = {
  pending_acceptance: { label: "À Valider", cls: "bg-[#ed5518]/10 text-[#ed5518] border-[#ed5518]/10" },
  pending: { label: "À Valider", cls: "bg-[#ed5518]/10 text-[#ed5518] border-[#ed5518]/10" },
  accepted: { label: "Prêt Dispatch", cls: "bg-noir/5 text-noir border-noir/10" },
  assigned: { label: "Assigné", cls: "bg-noir/5 text-noir border-noir/10" },
  driver_accepted: { label: "En Route", cls: "bg-[#ed5518] text-white border-[#ed5518]" },
  picked_up: { label: "Enlevé", cls: "bg-[#ed5518] text-white border-[#ed5518]" },
  delivered: { label: "Terminé", cls: "bg-noir text-white border-noir" },
  cancelled: { label: "Annulé", cls: "bg-red-50 text-red-500 border-red-100" },
};

export function OperationsCenter({
  orders,
  operationView,
  setOperationView,
  tabConfig,
  handleQuickAccept,
  openDispatch
}: {
  orders: any[],
  operationView: string,
  setOperationView: (v: string) => void,
  tabConfig: Record<string, { label: string, icon: any, count: number, statuses: string[] }>,
  handleQuickAccept: (id: string) => void,
  openDispatch: (o: any) => void
}) {
  const navigate = useNavigate();
  const filtered = orders.filter(o => tabConfig[operationView].statuses.includes(o.status));

  return (
    <div className="bg-white rounded-[2.5rem] border border-noir/5 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="px-10 py-8 border-b border-noir/5 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-display italic text-noir tracking-tight">Opérations Live.</h2>
          <p className="text-[10px] font-bold text-noir/20 uppercase tracking-[0.4em] mt-1">Centre de Dispatch</p>
        </div>

        <div className="flex bg-cream p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
          {Object.entries(tabConfig).map(([id, tab]) => (
            <button
              key={id}
              onClick={() => setOperationView(id as any)}
              className={`relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${operationView === id ? 'bg-noir text-white shadow-xl translate-y-[-1px]' : 'text-noir/40 hover:text-noir'}`}
            >
              <tab.icon size={14} strokeWidth={operationView === id ? 2.5 : 1.5} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full text-[9px] font-bold px-1.5 ${operationView === id ? 'bg-[#ed5518] text-white' : 'bg-noir/10 text-noir/40'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 divide-y divide-noir/5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-noir/10 gap-6">
            <div className="h-20 w-20 rounded-full border border-dashed border-noir/10 flex items-center justify-center">
              <Package size={40} strokeWidth={0.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Flux de données vide</span>
          </div>
        ) : (
          filtered.map(o => {
            const sc = STATUS_CONFIG[o.status] || { label: o.status, cls: "bg-noir/5 text-noir/40 border-noir/5" };
            return (
              <div
                key={o.id}
                onClick={() => navigate(`/admin/orders/${o.id}`)}
                className="px-10 py-8 hover:bg-cream/30 cursor-pointer group transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-8 min-w-0">
                    <div className="h-14 w-14 rounded-[1.25rem] bg-cream shrink-0 flex items-center justify-center text-xs font-bold text-noir/30 group-hover:bg-noir group-hover:text-white transition-all duration-500 uppercase tracking-tighter">
                      {o.vehicle_type?.slice(0, 3) || 'MOV'}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-noir/20 uppercase tracking-[0.3em]">#{o.id.slice(0, 8)}</span>
                        <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-[8px] font-bold uppercase tracking-widest ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="text-xl font-display italic text-noir group-hover:text-[#ed5518] transition-colors truncate">
                        {o.clientName}.
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-noir/40 italic">
                        <span>{o.pickup_city || '—'}</span>
                        <span className="text-[#ed5518]/30">→</span>
                        <span className="text-noir/60">{o.delivery_city || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xl font-display italic text-noir tabular-nums">{o.price_ht ? `${Number(o.price_ht).toFixed(2)}€` : '—'}</div>
                      <div className="text-[9px] font-bold text-noir/20 uppercase tracking-widest">Montant HT</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {['pending_acceptance', 'pending'].includes(o.status) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickAccept(o.id); }}
                          className="rounded-xl bg-noir px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#ed5518] transition-all shadow-lg active:scale-95"
                        >
                          Valider
                        </button>
                      )}
                      {['accepted'].includes(o.status) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                          className="rounded-xl bg-[#ed5518] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-noir transition-all shadow-lg active:scale-95"
                        >
                          Dispatcher
                        </button>
                      )}
                      <div className="h-10 w-10 rounded-full border border-noir/5 flex items-center justify-center text-noir/20 group-hover:border-[#ed5518]/20 group-hover:text-[#ed5518] transition-all">
                        <ArrowRight size={18} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
