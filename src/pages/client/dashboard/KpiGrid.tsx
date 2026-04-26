import { Clock, Check, FileText } from "lucide-react";

export function KpiGrid({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-12">
      {/* Active Missions */}
      <div className="bg-white p-10 rounded-xl shadow-sm border border-noir/5 group hover:border-[#ed5518] transition-all relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#ed5518]/5 flex items-center justify-center text-[#ed5518]">
              <Clock size={20} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/40">Missions en cours</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-display italic tracking-tight">{stats.activeCount || 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#ed5518] pb-2">Actives</span>
          </div>
        </div>
      </div>

      {/* Completed Missions */}
      <div className="bg-white p-10 rounded-xl shadow-sm border border-noir/5 group hover:border-[#ed5518] transition-all relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-noir/5 flex items-center justify-center text-noir">
              <Check size={20} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/40">Total Missions</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-display italic tracking-tight">{stats.completedCount || 0}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-noir/40 pb-2">Réussies</span>
          </div>
        </div>
      </div>

      ({/* Volume HT) */}
      <div className="bg-noir p-10 rounded-xl shadow-2xl group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ed5518]/10 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Volume HT</h3>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-display italic tracking-tight text-white">{(stats.totalPaid || 0).toFixed(2)}€</span>
            {stats.totalPending > 0 && (
              <div className="mt-2 text-[9px] font-bold text-white/30 tracking-widest uppercase">
                <span className="text-[#ed5518]">Encours :</span> {stats.totalPending.toFixed(2)}€
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
