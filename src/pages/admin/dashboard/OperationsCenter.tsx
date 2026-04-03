import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

const STATUS_CONFIG = {
  pending_acceptance: { label: "Nouveau", cls: "bg-rose-50 text-rose-600 border-rose-100" },
  pending: { label: "En attente", cls: "bg-rose-50 text-rose-600 border-rose-100" },
  accepted: { label: "Validé", cls: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  assigned: { label: "Assigné", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  driver_accepted: { label: "Dispatché", cls: "bg-orange-50 text-orange-700 border-orange-100" },
  picked_up: { label: "Enlevé", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  delivered: { label: "Livré", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
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
    <div className="xl:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
      <div className="px-8 pt-6 pb-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900">Suivi des Missions</h2>
          <p className="text-[9px] md:text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">Live Dispatch Center</p>
        </div>
        <div className="flex bg-slate-100/80 p-1 rounded-[1.2rem] gap-0.5 overflow-x-auto no-scrollbar scroll-smooth">
          {Object.entries(tabConfig).map(([id, tab]) => (
            <button 
              key={id} 
              onClick={() => setOperationView(id as any)} 
              className={`relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black transition-all shrink-0 whitespace-nowrap ${operationView === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon size={12} className={operationView === id ? "text-[#ed5518]" : ""} /> 
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[8px] font-black px-1 ${operationView === id ? 'bg-[#ed5518] text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-slate-300 gap-3">
            <Package size={32} strokeWidth={1} />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aucune commande</span>
          </div>
        ) : filtered.map(o => {
          const sc = STATUS_CONFIG[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-500 border-slate-200" };
          return (
            <div key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)} className="px-8 py-5 hover:bg-slate-50/80 cursor-pointer group transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center text-sm font-black text-slate-500">{o.vehicle_type?.[0]?.toUpperCase() || 'M'}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BC-{o.id.slice(0, 8)}</span>
                      <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm group-hover:text-[#ed5518] truncate">{o.clientName}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                      <span className="text-slate-400">{o.pickup_city || '—'}</span> <span className="text-slate-300">→</span> <span className="text-slate-600">{o.delivery_city || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-base font-black text-slate-900 tabular-nums">{o.price_ht ? `${Number(o.price_ht).toFixed(2)}€` : '—'}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">HT</div>
                  </div>
                  {['pending_acceptance', 'pending'].includes(o.status) && <button onClick={(e) => { e.stopPropagation(); handleQuickAccept(o.id); }} className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518]">ACCEPTER</button>}
                  {['accepted'].includes(o.status) && <button onClick={(e) => { e.stopPropagation(); openDispatch(o); }} className="rounded-xl bg-[#ed5518] px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518]">DISPATCHER</button>}
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-[#ed5518] transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
