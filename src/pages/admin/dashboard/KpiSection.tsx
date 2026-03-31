import { TrendingUp, AlertTriangle, Users, BarChart3, Zap } from "lucide-react";

export function KpiSection({ kpis, driversCount }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Dispatch Live */}
      <div 
        onClick={() => (window as any).routerNavigate?.('/admin/orders')}
        className="col-span-2 md:col-span-1 bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all active:scale-95"
      >
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-[#ed5518]/10 blur-2xl group-hover:bg-[#ed5518]/20 transition-all" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-[#ed5518]/20 flex items-center justify-center text-[#ed5518]"><Zap size={18} /></div>
            {kpis.toAccept > 0 && <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-rose-500" /></span>}
          </div>
          <div className="text-4xl font-black tabular-nums">{kpis.toAccept + kpis.toDispatch + kpis.active}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Flux Opérationnel</div>
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-1">
            <div><div className="text-[8px] font-black uppercase text-rose-400">Accepter</div><div className="text-xs font-black text-rose-300">{kpis.toAccept}</div></div>
            <div><div className="text-[8px] font-black uppercase text-amber-400">Dispatch</div><div className="text-xs font-black text-amber-300">{kpis.toDispatch}</div></div>
            <div><div className="text-[8px] font-black uppercase text-[#ed5518]">Mission</div><div className="text-xs font-black text-[#ed5518]">{kpis.active}</div></div>
          </div>
        </div>
      </div>

      <KpiCard icon={<TrendingUp size={18} />} iconBg="bg-indigo-50 text-indigo-600" label="CA En cours" value={`${kpis.revenueOps.toFixed(0)}€`} sub="HT sur missions actives" trend="indigo" />
      <KpiCard icon={<AlertTriangle size={18} />} iconBg="bg-rose-100 text-rose-600" label="À Recouvrer" value={`${kpis.totalToRecoup.toFixed(0)}€`} sub="Factures non encaissées" trend="rose" />
      <KpiCard icon={<Users size={18} />} iconBg="bg-amber-100 text-amber-600" label="Dû Chauffeurs" value={`${kpis.driverPayOutstanding.toFixed(0)}€`} sub={`${driversCount} livreur(s) en ligne`} trend="amber" />
      <KpiCard icon={<BarChart3 size={18} />} iconBg="bg-emerald-50 text-emerald-600" label="Profit Net (Encais.)" value={`${kpis.netProfit.toFixed(0)}€`} sub={`${kpis.deliveredCount} livraison(s)`} trend="emerald" />
    </div>
  );
}

function KpiCard({ icon, iconBg, label, value, sub, trend, alert = false }: { 
  icon: any, 
  iconBg: string, 
  label: string, 
  value: string, 
  sub?: string, 
  trend: string, 
  alert?: boolean 
}) {
  const trendColors = { indigo: "text-[#ed5518]", amber: "text-amber-600", rose: "text-rose-600", emerald: "text-[#ed5518]" };
  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${alert ? 'border-rose-100 ring-1 ring-rose-200' : 'border-slate-100'} relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110 duration-300`}>{icon}</div>
        {alert && <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-rose-500" /></span>}
      </div>
      <div className={`text-3xl font-black tabular-nums ${trendColors[trend] || 'text-slate-900'}`}>{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] font-medium text-slate-400 mt-3 pt-3 border-t border-slate-50">{sub}</div>}
    </div>
  );
}
