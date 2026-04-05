import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader2, Search, Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

function daysBetween(a, b) {
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

function computeClientRisk(invoices) {
  const today = new Date();
  const unpaid = invoices.filter(i => i.status !== "paid");
  const overdue = unpaid.filter(i => i.due_date && new Date(i.due_date) < today);
  const _unpaidAmount = unpaid.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const overdueAmount = overdue.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const worstLateDays = overdue.length ? Math.max(...overdue.map(i => daysBetween(new Date(i.due_date), today))) : 0;
  let score = 0;
  if (unpaid.length >= 1) score += 20;
  if (unpaid.length >= 2) score += 20;
  if (overdue.length >= 1) score += 25;
  if (overdue.length >= 2) score += 15;
  if (overdueAmount > 500) score += 10;
  if (worstLateDays > 15) score += 10;
  score = Math.min(100, score);
  const level = score >= 70 ? "Élevé" : score >= 40 ? "Moyen" : "Faible";
  return { score, level, unpaidCount: unpaid.length, overdueCount: overdue.length, overdueAmount, worstLateDays };
}

export default function AdminClients() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cRes, clRes, oRes, iRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('invoices').select('*')
    ]);

    const registeredClients = (cRes.data || []).filter(p => p.role?.toLowerCase() === 'client' || !p.role);
    const crmClients = (clRes.data || []).map(c => ({
      ...c,
      isCRM: true,
      details: {
        company: c.company_name,
        full_name: c.contact_name,
        email: c.email,
        phone: c.phone,
        siret: c.siret,
        address: c.address || c.billing_address,
        zip: c.postal_code,
        city: c.city,
        notes: c.notes
      }
    }));

    setClients([...registeredClients, ...crmClients]);
    if (oRes.data) setOrders(oRes.data);
    if (iRes.data) setInvoices(iRes.data);
    setLoading(false);
  };

  const rows = useMemo(() => {
    const lower = query.toLowerCase();
    return clients
      .filter(c => {
        const name = c.details?.company || c.details?.full_name || '';
        const siret = c.details?.siret || '';
        return name.toLowerCase().includes(lower) || siret.includes(query);
      })
      .map(c => {
        const clientName = c.details?.company || c.details?.full_name || 'Client';
        const clientOrders = orders.filter(o => o.client_id === c.id);
        const spend = clientOrders.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);
        const clientInvoices = invoices.filter(i => i.client_id === c.id);
        const risk = computeClientRisk(clientInvoices);
        return { ...c, name: clientName, siret: c.details?.siret || '—', spend, courses: clientOrders.length, risk };
      });
  }, [query, clients, orders, invoices]);

  // Stats
  const stats = useMemo(() => ({
    total: clients.length,
    highRisk: rows.filter(r => r.risk.level === "Élevé").length,
    totalRevenue: rows.reduce((sum, r) => sum + r.spend, 0),
    activeMonth: rows.filter(r => r.courses > 0).length,
  }), [rows, clients]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement des clients…</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Portefeuille Clients"
        subtitle="Gérez vos relations commerciales et surveillez la solvabilité."
        badge={{ label: "Comptes", count: clients.length }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Users size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Total clients", value: stats.total },
          { icon: <TrendingUp size={18} />, iconBg: "bg-emerald-50 text-emerald-600", label: "CA cumulé", value: `${stats.totalRevenue.toFixed(0)}€` },
          { icon: <AlertTriangle size={18} />, iconBg: "bg-rose-100 text-rose-600", label: "Risque élevé", value: stats.highRisk, alert: stats.highRisk > 0 },
          { icon: <CheckCircle2 size={18} />, iconBg: "bg-indigo-50 text-indigo-600", label: "Clients actifs", value: stats.activeMonth },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-[2rem] p-5 border ${kpi.alert ? 'border-rose-100 ring-1 ring-rose-200' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all`}>
            <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Rechercher une entreprise, SIRET…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rows.length} résultat(s)</span>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                <th className="px-8 py-4">Partenaire</th>
                <th className="px-8 py-4">SIRET</th>
                <th className="px-8 py-4">CA Total</th>
                <th className="px-8 py-4">Missions</th>
                <th className="px-8 py-4">Risque</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-sm font-bold text-slate-400">Aucun client trouvé.</td></tr>
              ) : rows.map(c => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  onClick={() => navigate(`/admin/clients/${c.id}`)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white text-[11px] font-black grid place-items-center shadow">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-[#ed5518] transition-colors">{c.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compte certifié</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-slate-400 tracking-tighter">{c.siret}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900 tabular-nums">{c.spend.toFixed(2)}€</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{c.courses}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${c.risk.level === "Élevé" ? "text-rose-600" : c.risk.level === "Moyen" ? "text-amber-600" : "text-[#ed5518]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.risk.level === "Élevé" ? "bg-rose-500 animate-pulse" : c.risk.level === "Moyen" ? "bg-amber-500" : "bg-[#ed5518]"}`} />
                        {c.risk.level}
                      </div>
                      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.risk.level === "Élevé" ? "bg-rose-500" : c.risk.level === "Moyen" ? "bg-amber-500" : "bg-[#ed5518]"}`}
                          style={{ width: `${c.risk.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/admin/clients/${c.id}`); }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518] transition-all active:scale-95 shadow"
                    >
                      DOSSIER <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {rows.length === 0 ? (
            <div className="py-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun client</div>
          ) : rows.map(c => (
            <div key={c.id} className="p-6 flex flex-col gap-4 active:bg-slate-50 transition-all" onClick={() => navigate(`/admin/clients/${c.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 truncate max-w-[150px]">{c.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">SIRET: {c.siret}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${c.risk.level === 'Élevé' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                   Risque {c.risk.level}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CA Total</div>
                  <div className="text-xs font-black text-slate-900 tabular-nums">{c.spend.toFixed(2)}€</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Missions</div>
                  <div className="text-xs font-black text-slate-900">{c.courses}</div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/admin/clients/${c.id}`)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10"
              >
                Accéder au dossier
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

