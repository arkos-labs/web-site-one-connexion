import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, MoreHorizontal, ArrowUpRight, Truck, Clock, Check, Loader2, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
// pdfGenerator loaded dynamically

function clientStatusLabel(order) {
  const status = typeof order === 'string' ? order : order.status;
  const driverId = typeof order === 'string' ? null : order.driver_id;

  switch (status) {
    case "pending_acceptance":
    case "pending": return "En attente";
    case "accepted": return "Acceptée";
    case "assigned": return "En attente acceptation";
    case "driver_accepted": return "Accepté";
    case "in_progress": return "En cours";
    case "delivered": return "Terminée";
    case "cancelled": return "Annulée";
    default: return status || "—";
  }
}

function statusColor(status) {
  switch (status) {
    case "pending_acceptance":
    case "pending": return "bg-slate-100 text-slate-600";
    case "accepted": return "bg-indigo-50 text-indigo-600";
    case "assigned": return "bg-amber-50 text-amber-600";
    case "driver_accepted": return "bg-emerald-50 text-emerald-600";
    case "in_progress": return "bg-blue-50 text-blue-600";
    case "delivered": return "bg-slate-100 text-slate-600";
    case "cancelled": return "bg-red-50 text-red-600";
    default: return "bg-slate-100";
  }
}

export default function DashboardClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, totalPaid: 0, totalPending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Realtime subscription for orders
    const channel = supabase
      .channel('client-dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. Stats (Orders count & total)
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, price_ht, status, created_at, delivery_city, pickup_city')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && orders) {
        const completed = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const activeStatuses = ['pending_acceptance', 'pending', 'accepted', 'assigned', 'driver_accepted', 'in_progress'];
        const pendingValue = orders.filter(o => activeStatuses.includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const activeCount = orders.filter(o => activeStatuses.includes(o.status)).length;

        setStats({
          count: orders.length,
          totalPaid: completed,
          totalPending: pendingValue,
          activeCount: activeCount
        });
        setRecentOrders(orders.slice(0, 3));
      }

      // 2. Invoices
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (inv) setInvoices(inv);

      // 3. Profile details
      const { data: prof } = await supabase.from('profiles').select('details').eq('id', user.id).single();
      if (prof) setProfile(prof.details);
    }
    setLoading(false);
  };

  const downloadInvoice = async (inv) => {
    // ... logic remains
  };

  const downloadOrder = (order) => {
    import("../lib/pdfGenerator").then(m => m.generateOrderPdf(order, profile || {}));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] md:p-4">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Header - Premium Animated Introduction */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl md:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500 opacity-20 blur-3xl mix-blend-screen animate-pulse"></div>
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="animate-fade-in-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md border border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Espace Client Premium
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Bonjour, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Partenaire'}.
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-400 max-w-xl leading-relaxed">
                Votre tableau de bord logistique intelligent. Suivez vos expéditions en temps réel et gérez votre facturation en un clic.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <button className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm ring-1 ring-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/30">
                <Bell size={24} className="transition-transform group-hover:rotate-12" strokeWidth={2} />
                {stats.activeCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold ring-2 ring-slate-900">
                    {stats.activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard-client/nouvelle-course')}
                className="group flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 font-bold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/40"
              >
                Commander
                <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-[2.5rem] bg-white shadow-sm"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : (
          <>
            {/* KPI Widgets Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Widget 1: Courses Actives */}
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 hover:ring-orange-100">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-50 transition-transform duration-500 group-hover:scale-150"></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Missions en cours</h3>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-5xl font-black tracking-tight text-slate-900">{stats.activeCount}</span>
                      <span className="mb-1 text-sm font-bold text-orange-500">actives</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-orange-100/50 p-4 text-orange-600 shadow-inner transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Clock size={32} strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Widget 2: Total Courses */}
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:ring-blue-100">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150"></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Historique</h3>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-5xl font-black tracking-tight text-slate-900">{stats.count}</span>
                      <span className="mb-1 text-sm font-bold text-blue-500">réussies</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-blue-100/50 p-4 text-blue-600 shadow-inner transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                    <Check size={32} strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* Widget 3: Facturation */}
              <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 hover:ring-emerald-100">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150"></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Volume Facturé HT</h3>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-4xl font-black tracking-tight text-slate-900">{stats.totalPaid.toFixed(2)}</span>
                      <span className="mb-1 text-lg font-bold text-slate-400">€</span>
                    </div>
                    {stats.totalPending > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500">
                        <span className="text-amber-500">En attente :</span> {stats.totalPending.toFixed(2)}€
                      </div>
                    )}
                  </div>
                  <div className="rounded-3xl bg-emerald-100/50 p-4 text-emerald-600 shadow-inner transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <FileText size={32} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Lists Section */}
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* Recent Orders List */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-slate-900">Activité Récente</h2>
                  <button onClick={() => navigate('/dashboard-client/orders')} className="group flex items-center gap-2 text-sm font-bold text-orange-500 transition-colors hover:text-orange-600">
                    Gérer
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white py-16 text-center shadow-sm border border-slate-100 min-h-[300px]">
                      <div className="mb-6 rounded-full bg-slate-50 p-6 ring-4 ring-slate-50">
                        <Truck size={40} className="text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Aucune commande</h3>
                      <p className="mt-2 text-sm text-slate-500 max-w-xs">Votre historique est vide. Lancez votre première expédition dès maintenant.</p>
                      <button onClick={() => navigate('/dashboard-client/nouvelle-course')} className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20">
                        Créer une course
                      </button>
                    </div>
                  ) : (
                    recentOrders.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/dashboard-client/orders/${d.id}`, { state: { order: d } })}
                        className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
                      >
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="flex items-center gap-6">
                          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${statusColor(d.status).replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')}`}>
                            <Truck size={24} className={statusColor(d.status).split(' ')[1]} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 md:text-lg">{d.pickup_city || 'Départ'}</span>
                              <span className="text-slate-300">→</span>
                              <span className="font-bold text-slate-900 md:text-lg">{d.delivery_city || 'Arrivée'}</span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5">#{d.id.slice(0, 8).toUpperCase()}</span>
                              <span>•</span>
                              <span>{new Date(d.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span className={`rounded-xl px-3 py-1 text-[11px] font-bold uppercase tracking-wide border ${statusColor(d.status).replace('bg-', 'border-').replace('50', '200')}`}>
                            {clientStatusLabel(d)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadOrder(d);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 opacity-0 transition-all duration-300 hover:text-slate-900 group-hover:opacity-100"
                          >
                            <FileText size={14} /> PDF
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Invoices List */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-slate-900">Factures</h2>
                  <button className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 p-2">
                  {invoices.length === 0 ? (
                    <div className="py-16 text-center text-sm font-bold text-slate-400">Aucune facture émise.</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{new Date(inv.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
                              <div className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{Number(inv.total_ttc).toFixed(2)}€ TTC</div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadInvoice(inv)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge, to = "#" }) {
  const classes = `group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`;

  return (
    <a href={to} className={classes}>
      <div className="flex items-center gap-4">
        <Icon size={20} className={`transition-transform ${!active && "group-hover:scale-110"}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
          {badge}
        </span>
      )}
    </a>
  );
}


