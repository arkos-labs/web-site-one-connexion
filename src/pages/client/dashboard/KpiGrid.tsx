import { Clock, Check, FileText } from "lucide-react";

export function KpiGrid({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
      <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:ring-[#ed5518]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-50 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Missions en cours</h3>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-black text-slate-900">{stats.activeCount || 0}</span>
              <span className="mb-1 text-sm font-bold text-[#ed5518]">actives</span>
            </div>
          </div>
          <div className="rounded-3xl bg-orange-50 p-4 text-[#ed5518] group-hover:rotate-12 transition-transform shadow-inner"><Clock size={32} /></div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:ring-blue-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Historique</h3>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-black text-slate-900">{stats.count || 0}</span>
              <span className="mb-1 text-sm font-bold text-blue-500">réussies</span>
            </div>
          </div>
          <div className="rounded-3xl bg-blue-50 p-4 text-blue-500 group-hover:-rotate-12 transition-transform shadow-inner"><Check size={32} /></div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:ring-emerald-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-50 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Volume HT</h3>
            <div className="mt-4 flex items-end gap-2 text-slate-900 text-4xl font-black tracking-tight">{(stats.totalPaid || 0).toFixed(2)}€</div>
            {stats.totalPending > 0 && <div className="mt-2 text-xs font-bold text-slate-400"><span className="text-amber-500">Encours :</span> {stats.totalPending.toFixed(2)}€</div>}
          </div>
          <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-500 group-hover:rotate-12 transition-transform shadow-inner"><FileText size={32} /></div>
        </div>
      </div>
    </div>
  );
}
