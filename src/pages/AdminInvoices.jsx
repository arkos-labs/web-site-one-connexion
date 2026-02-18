import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FileText as FileIcon, Download as DownloadIcon, Users as UsersIcon, Briefcase as BriefcaseIcon, Calendar as CalendarIcon, Loader2 as LoaderIcon, Search as SearchIcon, X as XIcon, Send as SendIcon, CheckCircle as CheckIcon } from "lucide-react";
import { generateDriverInvoicePdf, generateDriverStatementPdf } from "../lib/pdfGenerator";

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
    <div className="p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Espace Facturation 💳</h1>
          <p className="mt-2 text-slate-500 font-medium">Gestion unifiée des factures et règlements.</p>
        </div>

        <div className="flex items-center gap-3">
          {isSearching ? (
            <div className="relative animate-fadeIn">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-64 rounded-xl border-2 border-indigo-100 bg-white pl-4 pr-10 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button onClick={() => { setSearchQuery(""); setIsSearching(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <XIcon size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="rounded-full bg-white border border-slate-200 p-3 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <SearchIcon size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 max-w-fit">
        <button
          onClick={() => setActiveTab("clients")}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === "clients" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <BriefcaseIcon size={16} /> Factures Clients {isSearching && `(${filteredInvoices.length})`}
        </button>
        <button
          onClick={() => setActiveTab("drivers")}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === "drivers" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <UsersIcon size={16} /> Paies Chauffeurs {isSearching && `(${driverStats.length})`}
        </button>
      </div>

      {activeTab === "clients" ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {isSearching ? "Résultats - Factures Clients" : "Historique des Factures Clients"}
            </h2>
          </div>

          {!isSearching && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Date d'émission</span>
                  <input
                    type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <button
                  onClick={handleGenerateClients}
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 flex items-center gap-2"
                >
                  {loading ? <LoaderIcon className="animate-spin" size={14} /> : <CalendarIcon size={14} />}
                  Générer Invoices
                </button>
              </div>
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white flex items-center gap-2">
                <DownloadIcon size={14} /> Exporter
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="pb-3 pl-2">Référence</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Période</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map(i => (
                  <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-900">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-600 border border-emerald-100 uppercase tracking-tight shadow-sm">
                        FAC-{i.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-700 text-sm">
                      <div className="flex items-center gap-2">
                        {i.client}
                        {i.isGuest && <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase">Invité</span>}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 text-sm capitalize">{i.period}</td>
                    <td className="py-4 font-bold text-slate-900 text-sm">{Number(i.amount).toFixed(2)}€</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${i.status === "Payée" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end gap-2 text-right">
                        {i.status !== "Payée" && (
                          <button
                            onClick={() => handleMarkPaid(i.id)}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Valider
                          </button>
                        )}
                        <button onClick={() => navigate(`/dashboard-admin/invoices/${i.id}`)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all">
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-900">
                Listing & Règlements Chauffeurs 🚚
              </h2>
              <p className="text-sm text-slate-500 font-medium">Générez les relevés et envoyez-les directement aux chauffeurs.</p>
            </div>
            {!isSearching && (
              <div className="flex gap-3">
                <button
                  onClick={handleSendAll}
                  disabled={isSending || driverStats.every(d => d.orders.length === 0)}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                  {isSending ? <LoaderIcon size={18} className="animate-spin" /> : <SendIcon size={18} />}
                  Tout envoyer par mail
                </button>
              </div>
            )}
          </div>

          {!isSearching && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Période d'Activité</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="w-px h-10 bg-slate-200 hidden sm:block" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-indigo-500">Total net à verser</div>
                  <div className="text-2xl font-black text-slate-900">
                    {driverStats.reduce((sum, s) => sum + s.totalGain, 0).toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="pb-3 pl-2">Chauffeur</th>
                  <th className="pb-3 text-center">Missions</th>
                  <th className="pb-3">Gain Estimé</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {driverStats.map(d => (
                  <tr key={d.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 pl-2">
                      <div className="font-bold text-slate-900 text-sm">{d.details?.full_name || d.email}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[12px] font-black text-indigo-600 border border-indigo-100 uppercase tracking-tight shadow-sm">
                          REF: FP-{d.id.slice(0, 4)}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                        {d.orders.length}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl inline-block">
                        {d.totalGain.toFixed(2)}€
                      </div>
                    </td>
                    <td className="py-5">
                      {d.isPaid ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          Payé
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="py-5 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        {!d.isPaid && d.orders.length > 0 && (
                          <button
                            onClick={() => handleMarkDriverPaid(d.id, d.totalGain)}
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Payer
                          </button>
                        )}
                        <button
                          onClick={() => generateDriverStatementPdf(d, d.orders, getMonthLabel(selectedMonth), computeDriverPay)}
                          disabled={d.orders.length === 0}
                          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300"
                          title="Générer le relevé (Listing)"
                        >
                          <FileIcon size={14} className="text-slate-400" />
                          <span>Relevé</span>
                        </button>
                        <button
                          onClick={() => generateDriverInvoicePdf(d, d.orders, getMonthLabel(selectedMonth), computeDriverPay)}
                          disabled={d.orders.length === 0}
                          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300"
                          title="Générer la facture"
                        >
                          <DownloadIcon size={14} className="text-slate-400" />
                          <span>Facture</span>
                        </button>
                        <button
                          onClick={() => handleSendOne(d)}
                          disabled={isSending || d.orders.length === 0 || sendLogs[d.id] === 'success'}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${sendLogs[d.id] === 'success'
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            }`}
                        >
                          {sendLogs[d.id] === 'sending' ? <LoaderIcon size={14} className="animate-spin" /> : sendLogs[d.id] === 'success' ? <CheckIcon size={14} /> : <SendIcon size={14} />}
                          {sendLogs[d.id] === 'success' ? 'Envoyé' : 'Envoyer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
