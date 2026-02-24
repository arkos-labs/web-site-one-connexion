import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, RefreshCw, Plus, Truck, Zap, CheckCircle2, Users, X } from "lucide-react";
import AdminPageHeader from "../components/admin/AdminPageHeader";

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
      supabase.from('profiles').select('*').eq('role', 'courier'),
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
    });
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
              className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5"
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
          { icon: <Zap size={18} />, iconBg: "bg-emerald-100 text-emerald-600", label: "En ligne", value: stats.online },
          { icon: <Truck size={18} />, iconBg: "bg-amber-100 text-amber-700", label: "En mission", value: stats.onMission },
          { icon: <CheckCircle2 size={18} />, iconBg: "bg-indigo-100 text-indigo-600", label: "Gains du mois", value: `${stats.revenueMonth.toFixed(0)}€` },
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                <th className="px-8 py-4">Livreur</th>
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
                      <div className={`h-10 w-10 rounded-xl text-white text-[11px] font-black grid place-items-center shadow transition-all group-hover:scale-105 ${r.driver.is_online ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-400'}`}>
                        {r.driver.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors">{r.driver.name}</div>
                        <div className="text-[9px] font-bold text-slate-400">{r.driver.details?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${r.status === "En mission" ? "text-amber-600" : "text-emerald-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.status === "En mission" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        {r.status}
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-tighter ${r.driver.is_online ? "text-emerald-500" : "text-slate-300"}`}>
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
                      {r.driver.is_online && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Déconnecter ce livreur ?")) {
                              await supabase.from('profiles').update({ is_online: false }).eq('id', r.driver.id);
                              fetchData(true);
                            }
                          }}
                          className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all"
                          title="Forcer déconnexion"
                        >
                          <Zap size={14} />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/drivers/${r.driver.id}`); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-orange-500 transition-all active:scale-95 shadow"
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
            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-800 mb-6">
              <strong>Note :</strong> Une fois inscrit, le chauffeur apparaîtra automatiquement dans cette liste.
            </div>
            <button onClick={() => setCreateOpen(false)} className="w-full rounded-full bg-slate-900 py-4 text-sm font-black text-white hover:bg-orange-500 transition-all">
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
