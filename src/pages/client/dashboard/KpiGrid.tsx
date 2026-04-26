import { Clock, Check, FileText } from "lucide-react";

export function KpiGrid({ stats }) {
  return (
    <div className="grid gap-8 md:grid-cols-3 mb-12">
      {/* Active Missions */}
      <div className="bg-white p-10 rounded-[2rem] border border-noir/5 group hover:border-[#ed5518]/20 transition-all relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-noir/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#ed5518]/5 flex items-center justify-center text-[#ed5518]">
              <Clock size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/30 pb-0.5">Missions en cours</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-display italic tracking-tight text-noir">{stats.activeCount || 0}</span>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#ed5518] pb-3 opacity-60">Actives</span>
          </div>
        </div>
      </div>

      {/* Total Missions */}
      <div className="bg-white p-10 rounded-[2rem] border border-noir/5 group hover:border-[#ed5518]/20 transition-all relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-noir/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-noir/5 flex items-center justify-center text-noir/40">
              <Check size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/30 pb-0.5">Total Missions</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-display italic tracking-tight text-noir">{stats.completedCount || 0}</span>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-noir/20 pb-3">Réussies</span>
          </div>
        </div>
      </div>

      {/* Volume HT */}
      <div className="bg-noir p-10 rounded-[2rem] shadow-2xl group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ed5518]/10 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pb-0.5">Volume HT</h3>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl font-display italic tracking-tight text-white">{(stats.totalPaid || 0).toFixed(2)}€</span>
            {stats.totalPending > 0 && (
              <div className="mt-4 text-[9px] font-bold text-white/20 tracking-[0.25em] uppercase flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-pulse"></span>
                <span>Encours : {stats.totalPending.toFixed(2)}€</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
