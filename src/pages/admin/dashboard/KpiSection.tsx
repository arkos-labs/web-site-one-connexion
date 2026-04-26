import { TrendingUp, AlertTriangle, Users, BarChart3, Zap } from "lucide-react";

export function KpiSection({ kpis, driversCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
      {/* Flux Opérationnel (Premium Noir Card) */}
      <div
        onClick={() => (window as any).routerNavigate?.('/admin/orders')}
        className="xl:col-span-1 bg-noir text-white rounded-[2rem] p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all active:scale-95"
      >
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#ed5518]/5 blur-3xl group-hover:bg-[#ed5518]/15 transition-all duration-700" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-[#ed5518]/20 flex items-center justify-center text-[#ed5518] shadow-[0_0_15px_rgba(237,85,24,0.2)]">
                <Zap size={18} fill="currentColor" />
              </div>
              {kpis.toAccept > 0 && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[#ed5518] opacity-75"></span>
                  <span className="relative h-2 w-2 rounded-full bg-[#ed5518]"></span>
                </span>
              )}
            </div>
            <div className="text-5xl font-display italic tracking-tight tabular-nums">
              {kpis.toAccept + kpis.toDispatch + kpis.active}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mt-2">
              Flux Actif
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="text-[8px] font-bold uppercase tracking-widest text-[#ed5518]">Vérif</div>
              <div className="text-sm font-display italic">{kpis.toAccept}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[8px] font-bold uppercase tracking-widest text-white/30">Disp</div>
              <div className="text-sm font-display italic">{kpis.toDispatch}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[8px] font-bold uppercase tracking-widest text-white/30">Cours</div>
              <div className="text-sm font-display italic">{kpis.active}</div>
            </div>
          </div>
        </div>
      </div>

      <KpiCard
        icon={<TrendingUp size={18} strokeWidth={1.5} />}
        label="CA Opérationnel"
        value={`${kpis.revenueOps.toFixed(0)}€`}
        sub="Projeté sur missions en cours"
        type="default"
      />
      <KpiCard
        icon={<AlertTriangle size={18} strokeWidth={1.5} />}
        label="En Attente"
        value={`${kpis.totalToRecoup.toFixed(0)}€`}
        sub="Facturation non finalisée"
        type="accent"
      />
      <KpiCard
        icon={<Users size={18} strokeWidth={1.5} />}
        label="Dû Dispatch"
        value={`${kpis.driverPayOutstanding.toFixed(0)}€`}
        sub={`${driversCount} livreur(s) actifs`}
        type="default"
      />
      <KpiCard
        icon={<BarChart3 size={18} strokeWidth={1.5} />}
        label="Profit Net"
        value={`${kpis.netProfit.toFixed(0)}€`}
        sub={`${kpis.deliveredCount} missions closes`}
        type="default"
      />
    </div>
  );
}

function KpiCard({ icon, label, value, sub, type = 'default' }: {
  icon: any,
  label: string,
  value: string,
  sub?: string,
  type?: 'default' | 'accent'
}) {
  return (
    <div className={`bg-white rounded-[2rem] p-8 border border-noir/5 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center border border-noir/5 text-noir/40 group-hover:bg-noir group-hover:text-white transition-all duration-500`}>
          {icon}
        </div>
      </div>
      <div className={`text-4xl font-display italic tabular-nums tracking-tight ${type === 'accent' ? 'text-[#ed5518]' : 'text-noir'}`}>
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20 mt-2">
        {label}
      </div>
      {sub && (
        <div className="mt-8 pt-6 border-t border-noir/5">
          <p className="text-[10px] font-medium text-noir/40 italic leading-none">{sub}</p>
        </div>
      )}
    </div>
  );
}
