import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader2, RefreshCw, Plus, Truck, Zap, CheckCircle2, Users, X } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  return total * (total <= 10 ? 0.5 : 0.4);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AdminDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [rtStatus, setRtStatus] = useState("connecting");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchData();
    const fleetChannel = supabase
      .channel('fleet_realtime_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { setLastUpdate(new Date()); fetchData(true); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { setLastUpdate(new Date()); fetchData(true); })
      .subscribe((status) => setRtStatus(status));
    return () => supabase.removeChannel(fleetChannel);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [dRes, oRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'courier').order('created_at', { ascending: false }),
      supabase.from('orders').select('*')
    ]);
    if (dRes.data) setDrivers(dRes.data);
    if (oRes.data) setOrders(oRes.data);
    setLoading(false);
  };

  const rows = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return drivers.map(d => {
      const mine = orders.filter(o => o.driver_id === d.id);
      const onMeter = mine.filter(o => !['delivered', 'cancelled'].includes(o.status));
      const completed = mine.filter(o => o.status === 'delivered');
      const completedToday = completed.filter(o => { const dt = o.updated_at ? new Date(o.updated_at) : null; return dt && isSameDay(dt, now); });
      const completedMonth = completed.filter(o => { const dt = o.updated_at ? new Date(o.updated_at) : null; return dt && dt >= startOfMonth; });
      return {
        driver: { ...d, name: d.details?.full_name || 'Livreur' },
        status: onMeter.length > 0 ? "En mission" : "À vide",
        onMeterCount: onMeter.length,
        completedTodayCount: completedToday.length,
        earningsToday: completedToday.reduce((sum, o) => sum + computeDriverPay(o), 0),
        earningsMonth: completedMonth.reduce((sum, o) => sum + computeDriverPay(o), 0),
      };
    }).sort((a, b) => a.driver.name.localeCompare(b.driver.name));
  }, [orders, drivers]);

  const stats = useMemo(() => ({
    total: drivers.length,
    online: drivers.filter(d => d.is_online).length,
    onMission: rows.filter(r => r.status === "En mission").length,
    revenueMonth: rows.reduce((sum, r) => sum + r.earningsMonth, 0),
  }), [drivers, rows]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement de la flotte…</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Flotte Opérationnelle"
        subtitle="Pilotez votre équipe sur le terrain et suivez les performances."
        badge={{ label: rtStatus === "SUBSCRIBED" ? "Live Sync" : "Connecting", count: drivers.length }}
        actions={
          <>
            <span className="text-[10px] font-bold text-slate-400">MàJ {lastUpdate.toLocaleTimeString()}</span>
            <button onClick={() => fetchData()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all shadow-sm">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#ed5518] px-5 py-3 text-xs font-black text-white shadow-lg shadow-primary/20 hover:bg-[#ed5518] transition-all hover:-translate-y-0.5"
            >
              <Plus size={16} /> Nouveau livreur
            </button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Users size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Total livreurs", value: stats.total },
          { icon: <Zap size={18} />, iconBg: "bg-emerald-50 text-emerald-600", label: "En ligne", value: stats.online },
          { icon: <Truck size={18} />, iconBg: "bg-amber-100 text-amber-700", label: "En mission", value: stats.onMission },
          { icon: <CheckCircle2 size={18} />, iconBg: "bg-indigo-50 text-indigo-600", label: "Gains du mois", value: `${stats.revenueMonth.toFixed(0)}€` },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rows.length} livreur(s) enregistré(s)</span>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                <th className="px-8 py-4">Livreur</th>
                <th className="px-8 py-4">Depuis le</th>
                <th className="px-8 py-4">État</th>
                <th className="px-8 py-4">Courses (auj.)</th>
                <th className="px-8 py-4">Gains Jour</th>
                <th className="px-8 py-4">Gains Mois</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Truck size={40} strokeWidth={1} />
                      <span className="text-sm font-black text-slate-600">Aucun livreur enregistré</span>
                    </div>
                  </td>
                </tr>
              ) : rows.map(r => (
                <tr
                  key={r.driver.id}
                  className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  onClick={() => navigate(`/admin/drivers/${r.driver.id}`)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                    <div className={`h-20 w-20 rounded-[2rem] overflow-hidden text-white text-[24px] font-black grid place-items-center shadow-xl transition-all group-hover:scale-105 ${r.driver.is_online ? 'bg-[#ed5518] shadow-[#ed5518]/20' : 'bg-slate-400'}`}>
                      {r.driver.details?.avatar_url ? (
                        <img src={r.driver.details.avatar_url} alt={r.driver.name} className="h-full w-full object-cover" />
                      ) : (
                        r.driver.name[0]?.toUpperCase()
                      )}
                    </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-[#ed5518] transition-colors">{r.driver.name}</div>
                        <div className="text-[9px] font-bold text-slate-400">{r.driver.details?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-slate-400 capitalize">
                      {r.driver.created_at ? new Date(r.driver.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${r.status === "En mission" ? "text-amber-600" : "text-[#ed5518]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.status === "En mission" ? "bg-amber-500 animate-pulse" : "bg-[#ed5518]"}`} />
                        {r.status}
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-tighter ${r.driver.is_online ? "text-[#ed5518]" : "text-slate-300"}`}>
                        {r.driver.is_online ? "Connecté" : "Déconnecté"}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{r.completedTodayCount} courses</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900 tabular-nums">{r.earningsToday.toFixed(2)}€</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900 tabular-nums">{r.earningsMonth.toFixed(2)}€</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button
                         onClick={async (e) => {
                           e.stopPropagation();
                           if (confirm("Déconnecter ce livreur ?")) {
                             await supabase.from('profiles').update({ is_online: false }).eq('id', r.driver.id);
                             fetchData(true);
                           }
                         }}
                         className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#ed5518] hover:text-white flex items-center justify-center transition-all"
                         title="Forcer déconnexion"
                       >
                         <Zap size={14} />
                       </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/drivers/${r.driver.id}`); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518] transition-all active:scale-95 shadow"
                      >
                        GÉRER
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-50">
          {rows.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <Truck size={40} className="mx-auto mb-3" strokeWidth={1} />
              <span className="text-sm font-black text-slate-600">Aucun livreur enregistré</span>
            </div>
          ) : rows.map(r => (
            <div 
              key={r.driver.id} 
              className="p-6 flex flex-col gap-4 active:bg-slate-50 transition-colors"
              onClick={() => navigate(`/admin/drivers/${r.driver.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-24 w-24 rounded-[2.5rem] overflow-hidden text-white text-[32px] font-black grid place-items-center shadow-2xl ${r.driver.is_online ? 'bg-[#ed5518]' : 'bg-slate-400'}`}>
                    {r.driver.details?.avatar_url ? (
                      <img src={r.driver.details.avatar_url} alt={r.driver.name} className="h-full w-full object-cover" />
                    ) : (
                      r.driver.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{r.driver.name}</div>
                    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${r.status === "En mission" ? "text-amber-600" : "text-[#ed5518] opacity-60"}`}>
                      {r.status} • {r.driver.is_online ? "Connecté" : "OFFLINE"}
                    </div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                       Depuis le : {r.driver.created_at ? new Date(r.driver.created_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 tabular-nums">{r.earningsMonth.toFixed(2)}€</div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ce mois</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Aujourd'hui</div>
                  <div className="text-xs font-black text-slate-900">{r.completedTodayCount} courses</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gains Jour</div>
                  <div className="text-xs font-black text-slate-900">{r.earningsToday.toFixed(2)}€</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/admin/drivers/${r.driver.id}`); }}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                >
                  Gérer le profil
                </button>
                {r.driver.is_online && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Déconnecter ce livreur ?")) {
                        await supabase.from('profiles').update({ is_online: false }).eq('id', r.driver.id);
                        fetchData(true);
                      }
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 active:bg-rose-500 active:text-white transition-all shadow-sm"
                  >
                    <Zap size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal info */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative">
            <button onClick={() => setCreateOpen(false)} className="absolute top-5 right-5 h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
              <X size={16} />
            </button>
            <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white text-2xl grid place-items-center mb-6 shadow-xl">🚚</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Ajouter un livreur</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              La gestion des comptes est centralisée. Les livreurs s'inscrivent via le portail dédié <strong className="text-slate-700">/inscription-driver</strong>.
            </p>
            <div className="rounded-2xl bg-orange-50 border border-[#ed5518] p-4 text-sm text-[#ed5518] mb-6">
              <strong>Note :</strong> Une fois inscrit, le chauffeur apparaîtra automatiquement dans cette liste.
            </div>
            <button onClick={() => setCreateOpen(false)} className="w-full rounded-full bg-slate-900 py-4 text-sm font-black text-white hover:bg-[#ed5518] transition-all">
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

