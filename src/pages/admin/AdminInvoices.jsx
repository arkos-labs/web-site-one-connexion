import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Loader2, Search, CreditCard, CheckCircle2, AlertTriangle,
  Send, TrendingUp, Users, ChevronRight
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

function isoToMs(iso) {
  if (!iso) return null;
  const d = new Date(String(iso));
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  return total * (total <= 10 ? 0.5 : 0.4);
}

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, _setFrom] = useState("");
  const [to, _setTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [drivers, setDrivers] = useState([]);
  const [allDriverOrders, setAllDriverOrders] = useState([]);
  const [driverPayments, setDriverPayments] = useState([]);
  const [_isSending, _setIsSending] = useState(false);
  const [sendLogs, setSendLogs] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchInvoices();
    fetchDriverData();
    fetchDriverPayments();
  }, [selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDriverPayments = async () => {
    const { data } = await supabase.from('driver_payments').select('*').eq('period', selectedMonth);
    if (data) setDriverPayments(data);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: invData, error: invError } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    const { data: profData } = await supabase.from('profiles').select('id, details');
    const { data: orderData } = await supabase.from('orders').select('invoice_id, pickup_name').not('invoice_id', 'is', null);

    if (!invError && invData) {
      const mapped = invData.map(inv => {
        const profile = profData?.find(p => p.id === inv.client_id);
        let clientName = profile?.details?.company || profile?.details?.full_name;
        let isGuest = false;
        if (!clientName) {
          const linked = orderData?.find(o => o.invoice_id === inv.id);
          clientName = linked?.pickup_name || 'Client Inconnu';
          if (linked) isGuest = true;
        }
        const d = new Date(inv.created_at);
        d.setDate(d.getDate() + 30);
        return {
          id: inv.id,
          client: clientName, isGuest,
          period: new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          issuedAt: new Date(inv.created_at).toISOString().slice(0, 10),
          dueDate: d.toISOString().slice(0, 10),
          amount: inv.total_ttc,
          status: inv.status === 'paid' ? 'Payée' : (inv.status === 'pending' ? 'À payer' : inv.status),
          rawStatus: inv.status
        };
      });
      setInvoices(mapped);
    }
    setLoading(false);
  };

  const fetchDriverData = async () => {
    const [dRes, oRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'courier'),
      supabase.from('orders').select('*').eq('status', 'delivered')
    ]);
    if (dRes.data) setDrivers(dRes.data);
    if (oRes.data) setAllDriverOrders(oRes.data);
  };

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const fromMs = from ? isoToMs(`${from}T00:00:00`) : null;
    const toMs = to ? isoToMs(`${to}T23:59:59`) : null;
    const today = new Date();
    return invoices.filter(i => {
      if (!i?.id) return false;
      if (q) return `FAC-${String(i.id).slice(0, 8)}`.toLowerCase().includes(q) || String(i.client || '').toLowerCase().includes(q);
      const isOverdue = i.status !== "Payée" && i.dueDate && new Date(i.dueDate) < today;
      const matchesStatus = statusFilter === "Tous" ? true : statusFilter === "En retard" ? isOverdue : i.status === statusFilter;
      const refMs = isoToMs(`${i.issuedAt}T00:00:00`);
      const matchesDate = !fromMs && !toMs ? true : refMs != null && (fromMs == null || refMs >= fromMs) && (toMs == null || refMs <= toMs);
      return matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, from, to, statusFilter]);

  const handleMarkPaid = async (id) => {
    const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    if (!error) fetchInvoices();
  };

  const handleMarkDriverPaid = async (driverId, amount) => {
    const { error } = await supabase.from('driver_payments').upsert({ driver_id: driverId, period: selectedMonth, status: 'paid', amount });
    if (!error) fetchDriverPayments();
  };

  const driverStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 0, 23, 59, 59).getTime();
    const q = searchQuery.trim().toLowerCase();
    return drivers.map(d => {
      const dOrders = allDriverOrders.filter(o => {
        if (o.driver_id !== d.id) return false;
        const date = new Date(o.updated_at || o.created_at).getTime();
        return date >= start && date <= end;
      });
      const payment = driverPayments.find(p => p.driver_id === d.id);
      const totalGain = dOrders.reduce((sum, o) => sum + computeDriverPay(o), 0);
      const matchesQuery = !q ? true : (d.details?.full_name || '').toLowerCase().includes(q);
      return { ...d, orders: dOrders, totalGain, isPaid: payment?.status === 'paid', matchesQuery };
    }).filter(d => searchQuery ? d.matchesQuery : true);
  }, [drivers, allDriverOrders, selectedMonth, driverPayments, searchQuery]);

  const handleGenerateClients = async () => {
    setLoading(true);
    // Use the first day of the selected month
    const targetDate = `${selectedMonth}-01`;
    const { error } = await supabase.rpc('generate_monthly_invoices', { p_month: targetDate });
    if (error) alert("Erreur : " + error.message);
    else { alert(`Factures générées pour ${getMonthLabel(selectedMonth)} !`); fetchInvoices(); }
    setLoading(false);
  };

  const handleSendOne = async (d) => {
    setSendLogs(prev => ({ ...prev, [d.id]: 'sending' }));
    await new Promise(r => setTimeout(r, 1000));
    setSendLogs(prev => ({ ...prev, [d.id]: 'success' }));
  };

  const getMonthLabel = (val) => {
    const [y, m] = val.split('-');
    return new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Stats
  const invoiceStats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter(i => i.rawStatus === 'paid').length,
    pending: invoices.filter(i => i.rawStatus === 'pending').length,
    revenue: invoices.filter(i => i.rawStatus === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0),
  }), [invoices]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement…</span>
    </div>
  );

  const TABS = [
    { id: "clients", label: "Clients" },
    { id: "drivers", label: "Chauffeurs" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Finance & Facturation"
        subtitle="Centralisez la gestion des revenus clients et des reversements chauffeurs."
        actions={
          <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI row */}
      {activeTab === "clients" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <CreditCard size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Total factures", value: invoiceStats.total },
            { icon: <TrendingUp size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "CA encaissé", value: `${invoiceStats.revenue.toFixed(0)}€` },
            { icon: <CheckCircle2 size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Payées", value: invoiceStats.paid },
            { icon: <AlertTriangle size={18} />, iconBg: "bg-amber-100 text-amber-600", label: "En attente", value: invoiceStats.pending, alert: invoiceStats.pending > 0 },
          ].map((kpi, i) => (
            <div key={i} className={`bg-white rounded-[2rem] p-5 border ${kpi.alert ? 'border-amber-100 ring-1 ring-amber-200' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all`}>
              <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Rechercher référence, nom…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "clients" ? (
              <>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                  {["Tous", "Payée", "À payer", "En retard"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-[10px] font-bold transition-all ${statusFilter === s ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                  ))}
                </div>
                <button onClick={handleGenerateClients} className="rounded-xl bg-[#ed5518] px-4 py-2 text-[10px] font-bold text-white hover:bg-[#ed5518] transition-all">
                  Générer
                </button>
              </>
            ) : (
              <>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{getMonthLabel(selectedMonth)}</span>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {activeTab === "clients" ? (
            <div className="flex flex-col">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                      <th className="px-8 py-4">Référence</th>
                      <th className="px-8 py-4">Client</th>
                      <th className="px-8 py-4">Période</th>
                      <th className="px-8 py-4">TTC</th>
                      <th className="px-8 py-4">Statut</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredInvoices.length === 0 ? (
                      <tr><td colSpan={6} className="py-20 text-center text-sm font-bold text-slate-400">Aucune facture trouvée.</td></tr>
                    ) : filteredInvoices.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/invoices/${i.id}`)}>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center rounded-xl bg-slate-900 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow">
                            FAC-{i.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <div className="text-sm font-black text-slate-900 group-hover:text-[#ed5518] transition-colors">{i.client}</div>
                            {i.isGuest && <div className="text-[9px] font-bold text-[#ed5518] uppercase">Usage ponctuel</div>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-500 uppercase">{i.period}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-slate-900 tabular-nums">{Number(i.amount).toFixed(2)}€</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`${i.rawStatus === "paid" ? "text-emerald-600" : "text-amber-600"} text-[9px] font-black uppercase tracking-widest`}>
                            {i.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-right">
                            {i.rawStatus !== "paid" && (
                              <button
                                onClick={e => { e.stopPropagation(); handleMarkPaid(i.id); }}
                                className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#ed5518] hover:text-white flex items-center justify-center transition-all"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/admin/invoices/${i.id}`); }}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518] transition-all shadow"
                            >
                              VOIR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-50">
                {filteredInvoices.length === 0 ? (
                  <div className="py-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune facture</div>
                ) : filteredInvoices.map(i => (
                  <div key={i.id} className="p-6 flex flex-col gap-4 active:bg-slate-50 transition-all" onClick={() => navigate(`/admin/invoices/${i.id}`)}>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-[#ed5518] uppercase tracking-widest leading-none">FAC-{i.id.slice(0, 8)}</span>
                        <h4 className="text-sm font-black text-slate-900 truncate max-w-[200px]">{i.client}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{i.period}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${i.rawStatus === 'paid' ? 'bg-[#ed5518] text-white' : 'bg-amber-100 text-amber-700'}`}>
                        {i.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="text-lg font-black text-slate-900 tabular-nums">{Number(i.amount).toFixed(2)}€ <span className="text-[10px] text-slate-400 uppercase">TTC</span></div>
                      <div className="flex gap-2">
                        {i.rawStatus !== "paid" && (
                          <button
                            onClick={e => { e.stopPropagation(); handleMarkPaid(i.id); }}
                            className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center transition-all"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Détails</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                      <th className="px-8 py-4">Livreur</th>
                      <th className="px-8 py-4">Référence relevé</th>
                      <th className="px-8 py-4">Missions</th>
                      <th className="px-8 py-4">Gain Total</th>
                      <th className="px-8 py-4">Statut</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {driverStats.length === 0 ? (
                      <tr><td colSpan={6} className="py-20 text-center text-sm font-bold text-slate-400">Aucun reversement ce mois.</td></tr>
                    ) : driverStats.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-black grid place-items-center">
                              {d.details?.full_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 group-hover:text-[#ed5518] transition-colors">{d.details?.full_name}</div>
                              <div className="text-[9px] font-bold text-slate-400">{d.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-black text-slate-400">RL-{String(d.id).slice(0, 4)}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{d.orders.length}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-slate-900 tabular-nums">{d.totalGain.toFixed(2)}€</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`${d.isPaid ? "text-emerald-600" : "text-amber-600"} text-[9px] font-black uppercase tracking-widest`}>
                            {d.isPaid ? "PAYÉ" : "À RÉGLER"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-right">
                            <button
                              onClick={e => { e.stopPropagation(); handleSendOne(d); }}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${sendLogs[d.id] === 'success' ? 'bg-[#ed5518] text-[#ed5518]' : sendLogs[d.id] === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400 hover:bg-[#ed5518] hover:text-white'}`}
                            >
                              {sendLogs[d.id] === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                            {!d.isPaid && d.totalGain > 0 && (
                              <button
                                onClick={e => { e.stopPropagation(); handleMarkDriverPaid(d.id, d.totalGain); }}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-[#ed5518] transition-all shadow"
                              >
                                RÉGLER
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-50">
                {driverStats.length === 0 ? (
                  <div className="py-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun reversement</div>
                ) : driverStats.map(d => (
                  <div key={d.id} className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-900 text-[10px] font-black flex items-center justify-center">
                          {d.details?.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-black text-slate-900 truncate max-w-[150px]">{d.details?.full_name}</h4>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RL-{String(d.id).slice(0, 4)}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${d.isPaid ? 'bg-[#ed5518] text-white' : 'bg-amber-100 text-amber-700'}`}>
                        {d.isPaid ? "PAYÉ" : "À RÉGLER"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Missions</div>
                         <div className="text-xs font-black text-slate-900">{d.orders.length}</div>
                       </div>
                       <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gain</div>
                         <div className="text-xs font-black text-slate-900 tabular-nums">{d.totalGain.toFixed(2)}€</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => handleSendOne(d)}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
                      >
                        {sendLogs[d.id] === 'sending' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                      {!d.isPaid && d.totalGain > 0 && (
                        <button 
                          onClick={() => handleMarkDriverPaid(d.id, d.totalGain)}
                          className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
                        >
                          Régler le montant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

