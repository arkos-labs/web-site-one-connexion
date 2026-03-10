import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  MapPin, Bell, Truck,
  CheckCircle2, Loader2, TrendingUp, Users, Package,
  AlertTriangle, ArrowRight, Plus, Zap,
  CreditCard, BarChart3
} from "lucide-react";
import AdminCreateOrderModal from "../components/admin/AdminCreateOrderModal";
import AdminOrderModals from "../components/admin/orders/AdminOrderModals";

const SIMULATED_NOW = new Date();

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  return total * (total <= 10 ? 0.5 : 0.4);
}

const STATUS_CONFIG = {
  pending_acceptance: { label: "Nouveau", cls: "bg-rose-50 text-rose-600 border-rose-100" },
  pending: { label: "En attente", cls: "bg-rose-50 text-rose-600 border-rose-100" },
  accepted: { label: "Validé", cls: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  assigned: { label: "Assigné", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  driver_accepted: { label: "Dispatché", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  picked_up: { label: "Enlevé", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  in_progress: { label: "Enlevé", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  delivered: { label: "Livré", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  cancelled: { label: "Annulé", cls: "bg-red-50 text-red-500 border-red-100" },
};

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [ordersAll, setOrdersAll] = useState([]);
  const [invoicesAll, setInvoicesAll] = useState([]);
  const [driverPaymentsAll, setDriverPaymentsAll] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationView, setOperationView] = useState(() => localStorage.getItem("adminOperationView") || "pending_acceptance");
  const latestOrderIdRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("adminOperationView", operationView);
  }, [operationView]);

  // Dispatch modal state
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [dispatchDriver, setDispatchDriver] = useState("");
  const [dispatchNote, setDispatchNote] = useState("");

  const openDispatch = (o) => {
    setDispatchOrder(o);
    setDispatchDriver("");
    setDispatchNote("");
    setDispatchOpen(true);
  };

  const confirmDispatch = async () => {
    if (!dispatchOrder) return;
    if (!dispatchDriver) {
      alert("Veuillez sélectionner un chauffeur.");
      return;
    }
    const now = new Date().toISOString();
    const { error, data } = await supabase.from('orders').update({
      status: 'driver_accepted',
      driver_id: dispatchDriver,
      driver_accepted_at: now,
      updated_at: now,
      notes: dispatchNote ? `${dispatchOrder.notes || ''} | Note dispatch: ${dispatchNote}` : dispatchOrder.notes
    }).eq('id', dispatchOrder.id).select();

    if (error) {
      alert("Erreur lors de l'assignation: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("L'assignation a échouée silencieusement. Vérifiez vos permissions administrateur (RLS).");
      return;
    }

    setDispatchOpen(false);
    fetchOrders();
  };

  // ── Data fetching ──
  useEffect(() => {
    Promise.all([fetchOrders(), fetchInvoices(), fetchDriverPayments(), fetchProfiles()])
      .finally(() => setLoading(false));

    const profileChannel = supabase.channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        const nextRole = payload?.new?.role?.toLowerCase?.();
        const prevRole = payload?.old?.role?.toLowerCase?.();
        const relevant = ['admin', 'client', 'driver', 'courier', 'dispatcher', 'super_admin'];
        if (!nextRole && !prevRole) return;
        if (relevant.includes(nextRole) || relevant.includes(prevRole)) {
          fetchProfiles();
        }
      })
      .subscribe();

    const ordersChannel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => triggerNewOrderAlert(payload.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerNewOrderAlert = (orderData) => {
    if (latestOrderIdRef.current === orderData.id) return;
    latestOrderIdRef.current = orderData.id;
    setNewOrderAlert(orderData);
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const [oRes, pRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, details')
      ]);
      if (oRes.data && pRes.data) {
        if (oRes.data.length > 0 && !latestOrderIdRef.current) latestOrderIdRef.current = oRes.data[0].id;
        setOrdersAll(oRes.data.map(o => {
          const profile = pRes.data.find(p => p.id === o.client_id);
          const cDetails = profile?.details || {};
          return {
            ...o,
            clientName: cDetails.company || cDetails.full_name || o.pickup_name || 'Invité',
            total: o.price_ht,
            date: o.created_at,
          };
        }));
      }
    } catch (err) {
      console.error("fetchOrders error:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('*');
      if (!error && data) setInvoicesAll(data);
    } catch (err) {
      console.error("fetchInvoices error:", err);
    }
  };

  const fetchDriverPayments = async () => {
    try {
      const { data, error } = await supabase.from('driver_payments').select('*');
      if (!error && data) setDriverPaymentsAll(data);
    } catch (err) {
      console.error("fetchDriverPayments error:", err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        setDrivers(data.filter(p => p.role?.toLowerCase() === 'courier' && p.is_online).map(p => ({
          id: p.id,
          name: p.details?.full_name || p.details?.company || 'Livreur',
        })));
        setClients(data.filter(p => !p.role || p.role === 'client' || p.role === 'admin').map(p => ({
          id: p.id, name: p.details?.company || p.details?.full_name || 'Client', details: p.details
        })));
      }
    } catch (err) {
      console.error("fetchProfiles error:", err);
    }
  };

  const handleQuickAccept = async (orderId) => {
    setOrdersAll(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));
    setOperationView('accepted');
    const { error, data } = await supabase.from('orders').update({ status: 'accepted' }).eq('id', orderId).select();
    if (error || !data || data.length === 0) {
      alert("Echec de l'acceptation.");
      fetchOrders();
      return;
    }
    fetchOrders();
  };







  // ── KPIs ──
  const kpis = useMemo(() => {
    // 1. Flux Opérationnel
    const toAcceptCount = ordersAll.filter(o => ['pending_acceptance', 'pending'].includes(o.status)).length;
    const toDispatchCount = ordersAll.filter(o => ['accepted'].includes(o.status)).length;
    const activeMissionsCount = ordersAll.filter(o => ['assigned', 'driver_accepted', 'in_progress', 'picked_up'].includes(o.status)).length;

    // 2. Chiffre d'Affaires & Recouvrement
    const deliveredOrders = ordersAll.filter(o => o.status === 'delivered');
    const totalDeliveredHT = deliveredOrders.reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);

    // Identifier les commandes payées via leurs factures
    const paidInvoiceIds = new Set(invoicesAll.filter(i => i.status === 'paid').map(i => i.id));
    const paidOrders = deliveredOrders.filter(o => paidInvoiceIds.has(o.invoice_id));
    const paidRevenueHT = paidOrders.reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);

    const totalToRecoup = Math.max(0, totalDeliveredHT - paidRevenueHT);

    // 3. CA en cours (Missions actives)
    const revenueOps = ordersAll.filter(o => ['accepted', 'assigned', 'driver_accepted', 'in_progress'].includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);

    // 4. Profit Net (Uniquement sur ce qui est encaissé)
    const paidDriverCost = paidOrders.reduce((acc, o) => acc + computeDriverPay(o), 0);
    const netProfit = paidRevenueHT - paidDriverCost;

    // 5. Dû Chauffeurs (Tout ce qui est livré mais pas encore réglé aux chauffeurs)
    const totalDriverPayRequired = deliveredOrders.reduce((acc, o) => acc + computeDriverPay(o), 0);
    const driverPayPaid = driverPaymentsAll.filter(p => p.status === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const driverPayOutstanding = Math.max(0, totalDriverPayRequired - driverPayPaid);

    return {
      toAccept: toAcceptCount,
      toDispatch: toDispatchCount,
      active: activeMissionsCount,
      revenueOps,
      totalDeliveredHT,
      totalToRecoup,
      netProfit,
      deliveredCount: deliveredOrders.length,
      driverPayOutstanding
    };
  }, [ordersAll, invoicesAll, driverPaymentsAll]);

  const driverRows = useMemo(() => drivers.map(d => {
    const activeOrder = ordersAll.find(o => o.driver_id === d.id && ['in_progress', 'driver_accepted', 'assigned', 'picked_up'].includes(o.status));
    return { ...d, status: activeOrder ? (activeOrder.status === 'in_progress' || activeOrder.status === 'picked_up' ? "ENLEVÉ" : "EN MISSION") : "DISPONIBLE", cls: activeOrder ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700" };
  }), [ordersAll, drivers]);

  const clientPaymentRows = useMemo(() => clients.map(c => {
    const cInvoices = invoicesAll.filter(i => i.client_id === c.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latest = cInvoices[0];
    if (!latest) return { id: c.id, name: c.name, status: "SANS FACTURE", cls: "bg-slate-100 text-slate-500" };
    if (latest.status === 'paid') return { id: c.id, name: c.name, status: "À JOUR", cls: "bg-emerald-100 text-emerald-700" };
    return { id: c.id, name: c.name, status: "À RECOUVRER", cls: "bg-amber-100 text-amber-700" };
  }), [clients, invoicesAll]);

  const TAB_CONFIG = {
    pending_acceptance: { label: 'À Accepter', icon: Bell, statuses: ['pending_acceptance', 'pending'], count: kpis.toAccept },
    accepted: { label: 'À Dispatcher', icon: MapPin, statuses: ['accepted'], count: kpis.toDispatch },
    in_progress: { label: 'En Mission', icon: Truck, statuses: ['assigned', 'driver_accepted', 'in_progress', 'picked_up'], count: kpis.active },
    delivered: { label: 'Terminées', icon: CheckCircle2, statuses: ['delivered'], count: kpis.deliveredCount },
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-6 md:p-8 space-y-8 pt-0">
      {/* ── HEADER ── */}
      <header className="pt-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest">
                Live
              </span>
              <span className="text-xs font-bold text-slate-400 capitalize">{dateLabel}</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Opérationnel</span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl">
              Tableau de bord 👋
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              Vue temps réel de vos opérations One Connexion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} /> Nouvelle mission
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              Toutes les missions <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {loading && null}
      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Dispatch Live */}
        <div className="col-span-2 md:col-span-1 bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400"><Zap size={18} /></div>
              {kpis.toAccept > 0 && <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-rose-500" /></span>}
            </div>
            <div className="text-4xl font-black tabular-nums">{kpis.toAccept + kpis.toDispatch + kpis.active}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Flux Opérationnel</div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-1">
              <div><div className="text-[8px] font-black uppercase text-rose-400">Accepter</div><div className="text-xs font-black text-rose-300">{kpis.toAccept}</div></div>
              <div><div className="text-[8px] font-black uppercase text-amber-400">Dispatch</div><div className="text-xs font-black text-amber-300">{kpis.toDispatch}</div></div>
              <div><div className="text-[8px] font-black uppercase text-blue-400">Mission</div><div className="text-xs font-black text-blue-300">{kpis.active}</div></div>
            </div>
          </div>
        </div>

        {/* CA En cours */}
        <KpiCard icon={<TrendingUp size={18} />} iconBg="bg-indigo-100 text-indigo-600" label="CA En cours" value={`${kpis.revenueOps.toFixed(0)}€`} sub="HT sur missions actives" trend="indigo" />

        {/* À Recouvrer */}
        <KpiCard
          icon={<AlertTriangle size={18} />}
          iconBg="bg-rose-100 text-rose-600"
          label="À Recouvrer"
          value={`${kpis.totalToRecoup.toFixed(0)}€`}
          sub="Factures non encaissées"
          trend="rose"
        />

        {/* Chauffeurs */}
        <KpiCard icon={<Users size={18} />} iconBg="bg-amber-100 text-amber-600" label="Dû Chauffeurs" value={`${kpis.driverPayOutstanding.toFixed(0)}€`} sub={`${drivers.length} livreur(s) en ligne`} trend="amber" />

        {/* Profit net */}
        <KpiCard icon={<BarChart3 size={18} />} iconBg="bg-emerald-100 text-emerald-600" label="Profit Net (Encais.)" value={`${kpis.netProfit.toFixed(0)}€`} sub={`${kpis.deliveredCount} livraison(s)`} trend="emerald" />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Operations center - 3 cols */}
        <div className="xl:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="px-8 pt-6 pb-4 border-b border-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Suivi des Missions</h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">Live Dispatch Center</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                {Object.entries(TAB_CONFIG).map(([id, tab]) => (
                  <button
                    key={id}
                    onClick={() => setOperationView(id)}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 ${operationView === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <tab.icon size={13} className={operationView === id ? "text-orange-500" : ""} />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-black grid place-items-center ${operationView === id ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders grid */}
          <div className="min-h-[400px]">
            {(() => {
              const filtered = ordersAll.filter(o => TAB_CONFIG[operationView].statuses.includes(o.status));
              if (filtered.length === 0) return (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-3">
                  <Package size={40} strokeWidth={1} />
                  <span className="text-sm font-bold text-slate-400">Aucune commande dans cette catégorie</span>
                </div>
              );
              return (
                <div className="divide-y divide-slate-50">
                  {filtered.map(o => {
                    const sc = STATUS_CONFIG[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-500 border-slate-200" };
                    return (
                      <div
                        key={o.id}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="px-8 py-5 hover:bg-slate-50/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Left: order info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center text-sm font-black text-slate-500">
                              {o.vehicle_type?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BC-{o.id.slice(0, 8)}</span>
                                <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${sc.cls}`}>{sc.label}</span>
                              </div>
                              <div className="font-black text-slate-900 text-sm group-hover:text-orange-500 transition-colors truncate">{o.clientName}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold">{o.pickup_city || '—'}</span>
                                <span className="text-slate-300">→</span>
                                <span className="text-[10px] text-slate-600 font-bold">{o.delivery_city || '—'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: price + actions */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                              <div className="text-base font-black text-slate-900 tabular-nums">{o.price_ht ? `${Number(o.price_ht).toFixed(2)}€` : '—'}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">HT</div>
                            </div>
                            {['pending_acceptance', 'pending'].includes(o.status) && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleQuickAccept(o.id); }}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-orange-500 active:scale-95 transition-all"
                              >
                                ACCEPTER
                              </button>
                            )}
                            {['accepted'].includes(o.status) && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black text-white hover:bg-indigo-700 active:scale-95 transition-all"
                              >
                                DISPATCHER
                              </button>
                            )}
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors hidden sm:block" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right sidebar - 1 col */}
        <div className="flex flex-col gap-5">
          {/* Fleet Live */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Fleet Live</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{driverRows.length} livreur(s) en ligne</p>
              </div>
              <button onClick={() => navigate('/admin/drivers')} className="text-[10px] font-black text-orange-500 hover:text-orange-600">Voir tout</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
              {driverRows.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">Aucun livreur en ligne</div>
              ) : driverRows.map(d => (
                <div key={d.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-900 text-white text-[10px] font-black grid place-items-center shadow">
                      {d.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">{d.name}</span>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${d.cls}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Solvabilité */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Solvabilité</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Statut facturation clients</p>
              </div>
              <button onClick={() => navigate('/admin/invoices')} className="text-[10px] font-black text-orange-500 hover:text-orange-600">Voir tout</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
              {clientPaymentRows.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">Aucun client actif</div>
              ) : clientPaymentRows.map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-bold text-slate-700 truncate">{c.name}</span>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${c.cls}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-slate-900 rounded-[2rem] p-5 space-y-3 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Accès Rapides</h3>
              {[
                { label: "Toutes les commandes", href: "/admin/orders", icon: Package },
                { label: "Clients", href: "/admin/clients", icon: Users },
                { label: "Livreurs", href: "/admin/drivers", icon: Truck },
                { label: "Factures", href: "/admin/invoices", icon: CreditCard },
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.href)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/10 transition-all group text-left mb-1"
                >
                  <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors">
                    <link.icon size={14} />
                    <span className="text-xs font-bold">{link.label}</span>
                  </div>
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {loading ? null : (
        <>
          {/* ── NEW ORDER ALERT ── */}
          {newOrderAlert && (
            <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="bg-slate-900 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs border border-white/10">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  🔔
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm">Nouvelle commande !</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {newOrderAlert.pickup_city || '—'} → {newOrderAlert.delivery_city || '—'}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setNewOrderAlert(null); navigate(`/admin/orders/${newOrderAlert.id}`); }} className="px-3 py-1.5 bg-white text-slate-900 text-xs font-black rounded-xl hover:bg-orange-50 transition-colors">Voir</button>
                    <button onClick={() => setNewOrderAlert(null)} className="px-3 py-1.5 bg-white/10 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/20 transition-colors">Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATE ORDER MODAL ── */}
          {open && (
            <AdminCreateOrderModal
              onClose={() => setOpen(false)}
              onSuccess={() => { fetchOrders(); }}
            />
          )}

          {/* ── DISPATCH MODAL ── */}
          <AdminOrderModals
            decisionOpen={false} setDecisionOpen={() => { }} reason={""} setReason={() => { }} confirmDecision={() => { }}
            dispatchOpen={dispatchOpen} setDispatchOpen={setDispatchOpen}
            dispatchDriver={dispatchDriver} setDispatchDriver={setDispatchDriver}
            drivers={drivers} dispatchNote={dispatchNote} setDispatchNote={setDispatchNote}
            confirmDispatch={confirmDispatch}
          />
        </>
      )}
    </div>
  );
}

// ── KPI Card Component ──
function KpiCard({ icon, iconBg, label, value, sub, trend, alert }) {
  const trendColors = {
    indigo: "text-indigo-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${alert ? 'border-rose-100 ring-1 ring-rose-200' : 'border-slate-100'} relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        {alert && <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-rose-500" /></span>}
      </div>
      <div className={`text-3xl font-black tabular-nums ${trendColors[trend] || 'text-slate-900'}`}>{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] font-medium text-slate-400 mt-3 pt-3 border-t border-slate-50">{sub}</div>}
    </div>
  );
}
