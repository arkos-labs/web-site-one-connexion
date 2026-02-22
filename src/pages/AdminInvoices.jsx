import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FileText as FileIcon, Download as DownloadIcon, Users as UsersIcon, Briefcase as BriefcaseIcon, Calendar as CalendarIcon, Loader2 as LoaderIcon, Search as SearchIcon, X as XIcon, Send as SendIcon, CheckCircle as CheckIcon } from "lucide-react";
// pdfGenerator loaded dynamically

function isoToMs(iso) {
  if (!iso) return null;
  const d = new Date(String(iso));
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  const share = total <= 10 ? 0.5 : 0.4;
  return total * share;
}

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clients"); // clients | drivers
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Client Invoices State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateMode, setDateMode] = useState("issued");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // Driver Invoices State
  const [drivers, setDrivers] = useState([]);
  const [allDriverOrders, setAllDriverOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [driverPayments, setDriverPayments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendLogs, setSendLogs] = useState({}); // { driverId: 'success' | 'error' | 'sending' }

  useEffect(() => {
    fetchInvoices();
    fetchDriverData();
    fetchDriverPayments();
  }, [selectedMonth]);

  const fetchDriverPayments = async () => {
    const { data } = await supabase
      .from('driver_payments')
      .select('*')
      .eq('period', selectedMonth);
    if (data) setDriverPayments(data);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: invData, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch related profiles and orders to resolve names
    const { data: profData } = await supabase.from('profiles').select('id, details');
    const { data: orderData } = await supabase.from('orders').select('invoice_id, pickup_name').not('invoice_id', 'is', null);

    if (!invError && invData) {
      const mapped = invData.map(inv => {
        const profile = profData?.find(p => p.id === inv.client_id);
        let clientName = profile?.details?.company || profile?.details?.full_name;
        let isGuest = false;

        if (!clientName) {
          // Fallback to order info if no profile (Guest)
          const linkedOrder = orderData?.find(o => o.invoice_id === inv.id);
          clientName = linkedOrder?.pickup_name || 'Client Inconnu';
          if (linkedOrder) isGuest = true;
        }

        const d = new Date(inv.created_at);
        d.setDate(d.getDate() + 30);
        return {
          id: inv.id,
          client: clientName,
          isGuest,
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
    setLoading(true);
    const [dRes, oRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'courier'),
      supabase.from('orders').select('*').eq('status', 'delivered')
    ]);

    if (dRes.data) setDrivers(dRes.data);
    if (oRes.data) setAllDriverOrders(oRes.data);
    setLoading(false);
  };

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const fromMs = from ? isoToMs(`${from}T00:00:00`) : null;
    const toMs = to ? isoToMs(`${to}T23:59:59`) : null;
    const today = new Date();

    return invoices.filter((i) => {
      if (!i || !i.id) return false;
      const idStr = String(i.id);
      const refCode = `FAC-${idStr.slice(0, 8)}`.toLowerCase();
      const matchesQuery = !q ? true :
        refCode.includes(q) ||
        String(i.client || "").toLowerCase().includes(q) ||
        String(i.period || "").toLowerCase().includes(q);

      if (searchQuery) return matchesQuery;

      const isOverdue = i.status !== "Payée" && i.dueDate && new Date(i.dueDate) < today;
      const matchesStatus = statusFilter === "Tous" ? true : statusFilter === "En retard" ? isOverdue : i.status === statusFilter;
      const refIso = dateMode === "due" ? i.dueDate : i.issuedAt;
      const refMs = refIso ? isoToMs(`${refIso}T00:00:00`) : null;
      const matchesDate = fromMs == null && toMs == null ? true : refMs != null && (fromMs == null || refMs >= fromMs) && (toMs == null || refMs <= toMs);
      return matchesQuery && matchesDate && matchesStatus;
    });
  }, [invoices, searchQuery, from, to, dateMode, statusFilter]);

  const handleMarkPaid = async (id) => {
    const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    if (!error) fetchInvoices();
  };

  const handleMarkDriverPaid = async (driverId, amount) => {
    const { error } = await supabase
      .from('driver_payments')
      .upsert({
        driver_id: driverId,
        period: selectedMonth,
        status: 'paid',
        amount: amount
      });
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
      const isPaid = payment?.status === 'paid';
      const totalGain = dOrders.reduce((sum, o) => sum + computeDriverPay(o), 0);

      const idStr = String(d.id || "");
      const refFP = `FP-${idStr.slice(0, 4)}`.toLowerCase();
      const refRL = `RL-${idStr.slice(0, 4)}`.toLowerCase();

      const matchesQuery = !q ? true :
        refFP.includes(q) ||
        refRL.includes(q) ||
        (d.details?.full_name || "").toLowerCase().includes(q) ||
        (d.details?.company || "").toLowerCase().includes(q) ||
        (d.email || "").toLowerCase().includes(q);

      return { ...d, orders: dOrders, totalGain, isPaid, matchesQuery };
    }).filter(d => searchQuery ? d.matchesQuery : true);
  }, [drivers, allDriverOrders, selectedMonth, driverPayments, searchQuery]);

  const handleGenerateClients = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('generate_monthly_invoices', { p_month: '2026-02-01' });
    if (error) alert("Erreur : " + error.message); else { alert("Factures générées !"); fetchInvoices(); }
    setLoading(false);
  };

  const getMonthLabel = (val) => {
    const [y, m] = val.split('-');
    return new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handleSendAll = async () => {
    setIsSending(true);
    const label = getMonthLabel(selectedMonth);

    for (const d of driverStats) {
      if (d.orders.length === 0) continue;

      setSendLogs(prev => ({ ...prev, [d.id]: 'sending' }));

      try {
        // En conditions réelles, on générerait le PDF en blob/base64 ici
        // et on l'enverrait à une API (ex: via une Edge Function Supabase)

        // Simulation de l'appel API
        await new Promise(resolve => setTimeout(resolve, 800));

        setSendLogs(prev => ({ ...prev, [d.id]: 'success' }));
      } catch (err) {
        setSendLogs(prev => ({ ...prev, [d.id]: 'error' }));
      }
    }
    setIsSending(false);
    alert("Processus d'envoi terminé.");
  };

  const handleSendOne = async (d) => {
    setSendLogs(prev => ({ ...prev, [d.id]: 'sending' }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSendLogs(prev => ({ ...prev, [d.id]: 'success' }));
    } catch (err) {
      setSendLogs(prev => ({ ...prev, [d.id]: 'error' }));
    }
  };

  // const isSearching = searchQuery.length > 0; // Removed manual check

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Finance & Facturation</h2>
          <p className="mt-2 text-base font-medium text-slate-500 max-w-2xl">
            Centralisez la gestion de vos revenus clients et des reversements chauffeurs.
          </p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "clients" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
            >
              CLIENTS
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "drivers" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
            >
              CHAUFFEURS
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une référence, un nom..."
              className="w-full bg-white border border-slate-200/60 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "clients" ? (
              <button
                onClick={handleGenerateClients}
                className="bg-slate-900 text-white rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
              >
                GÉNÉRER MENSUEL
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  onClick={handleSendAll}
                  disabled={isSending}
                  className="bg-orange-500 text-white rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/10 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  TOTAL ENVOI MAIL
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === "clients" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Facture</th>
                  <th className="px-8 py-5">Partenaire</th>
                  <th className="px-8 py-5">Période</th>
                  <th className="px-8 py-5">TTC</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/invoices/${i.id}`)}>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center rounded-lg bg-slate-900 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10">
                        FAC-{i.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{i.client}</span>
                        {i.isGuest && <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Usage Ponctuel</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-500 uppercase">{i.period}</span>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">{Number(i.amount).toFixed(2)}€</td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${i.rawStatus === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {i.rawStatus !== "paid" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkPaid(i.id); }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <CheckIcon size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/invoices/${i.id}`); }}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                        >
                          DÉTAILS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Livreur</th>
                  <th className="px-8 py-5">Référence relevé</th>
                  <th className="px-8 py-5">Missions</th>
                  <th className="px-8 py-5">Gain Total</th>
                  <th className="px-8 py-5">Statut Paiement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {driverStats.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                          {d.details?.full_name?.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{d.details?.full_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 lowercase">{d.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-400">RL-{String(d.id).slice(0, 4)}</span>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">{d.orders.length} courses</td>
                    <td className="px-8 py-6 font-black text-slate-900">{d.totalGain.toFixed(2)}€</td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${d.isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {d.isPaid ? "PAGÉ" : "À RÉGLER"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendOne(d); }}
                          className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${sendLogs[d.id] === 'success' ? 'bg-emerald-50 text-emerald-600' :
                            sendLogs[d.id] === 'error' ? 'bg-rose-50 text-rose-600' :
                              'bg-slate-100 text-slate-400 hover:bg-orange-500 hover:text-white'
                            }`}
                        >
                          {sendLogs[d.id] === 'sending' ? <LoaderIcon size={14} className="animate-spin" /> : <SendIcon size={14} />}
                        </button>
                        {!d.isPaid && d.totalGain > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkDriverPaid(d.id, d.totalGain); }}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
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
        )}
      </div>
    </div>
  );
}



