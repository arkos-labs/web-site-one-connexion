import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, MoreHorizontal, ArrowUpRight, Truck, Clock, Check, Loader2, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { generateInvoicePdf } from "../lib/pdfGenerator";

function clientStatusLabel(order) {
  const status = typeof order === 'string' ? order : order.status;
  const driverId = typeof order === 'string' ? null : order.driver_id;

  switch (status) {
    case "pending": return "En attente";
    case "assigned": return driverId ? "Dispatchée" : "Acceptée";
    case "picked_up": return "En cours";
    case "delivered": return "Terminée";
    case "cancelled": return "Annulée";
    default: return status || "—";
  }
}

function statusColor(status) {
  switch (status) {
    case "pending": return "bg-slate-100 text-slate-600";
    case "assigned": return "bg-blue-50 text-blue-600";
    case "picked_up": return "bg-orange-50 text-orange-600";
    case "delivered": return "bg-emerald-50 text-emerald-600";
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
        const pendingValue = orders.filter(o => ['pending', 'assigned', 'picked_up'].includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const activeCount = orders.filter(o => ['pending', 'assigned', 'picked_up'].includes(o.status)).length;

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
    <div>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between stagger">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Ravi de vous revoir{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} ! 👋
              </h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Prêt à propulser votre logistique aujourd'hui ?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:scale-105 hover:bg-slate-50 hover:text-slate-900">
              <Bell size={20} />
            </button>
            <div className="h-11 w-11 overflow-hidden rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-200 bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {(profile?.full_name || profile?.company || 'ME').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
        ) : (
          <>
            {/* Widgets Grid */}
            <div className="grid gap-6 lg:grid-cols-3 stagger">
              {/* Stats Card 1 */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Courses</p>
                    <div className="mt-3 text-5xl font-bold tracking-tight text-slate-900">{stats.count}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-slate-500 transition-colors group-hover:scale-110 group-hover:rotate-3 group-hover:bg-slate-900 group-hover:text-white">
                    <Truck size={28} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Stats Card 2 */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between z-10 relative">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dépenses</p>
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight text-slate-900">{stats.totalPaid.toFixed(2)}€</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase">Facturé</span>
                      </div>
                      {stats.totalPending > 0 && (
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-slate-400">{stats.totalPending || 0}€</span>
                          <span className="text-[10px] font-bold text-orange-400 uppercase">En cours</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute bottom-0 right-0 p-4 opacity-5">
                  <FileText size={120} />
                </div>
              </div>

              {/* Active Orders Card */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-amber-50 p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-amber-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-700/70">Courses Actives</p>
                    </div>
                    <div className="text-5xl font-bold tracking-tight text-amber-900">{stats.activeCount || 0}</div>
                    <p className="mt-2 text-xs font-medium text-amber-700/60">En cours de traitement</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-amber-500 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <Clock size={28} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr] stagger">
              <div className="flex flex-col gap-6" id="orders">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold text-slate-900">Dernières courses</h2>
                  <button onClick={() => navigate('/dashboard-client/orders')} className="text-xs font-bold text-orange-500 hover:text-orange-600">VOIR TOUT</button>
                </div>

                <div className="flex flex-col gap-4">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-[2rem]">Aucune course récente.</div>
                  ) : (
                    recentOrders.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/dashboard-client/orders/${d.id}`, { state: { order: d } })}
                        className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="flex items-center gap-4">
                          <div className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${statusColor(d.status)}`}>
                            <Clock size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{d.pickup_city} → {d.delivery_city || 'Destination inconnue'}</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5">#{d.id.slice(0, 8)} • {new Date(d.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColor(d.status)}`}>
                            {clientStatusLabel(d)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadOrder(d);
                            }}
                            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Truck size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mock Invoices (Keeping static for now as requested tables didn't include real invoices yet but can be easily plugged later) */}
              <div className="rounded-[2.5rem] bg-white p-8 shadow-sm" id="invoices">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Dernières factures</h2>
                  <button className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="pb-4 pl-4">Référence</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Montant</th>
                        <th className="pb-4">Statut</th>
                        <th className="pb-4 pr-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 italic">Aucune facture disponible.</td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                            <td className="py-4 pl-4 font-bold text-slate-900">
                              {new Date(inv.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="py-4 text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td className="py-4 font-bold text-slate-900">{Number(inv.total_ttc).toFixed(2)}€</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                {inv.status === 'paid' ? 'Payée' : 'En attente'}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <button
                                onClick={() => downloadInvoice(inv)}
                                className="text-xs font-bold text-slate-900 hover:text-orange-500 transition-colors"
                              >
                                PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
