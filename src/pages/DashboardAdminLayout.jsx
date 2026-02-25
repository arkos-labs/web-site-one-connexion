import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Truck, Users, FileText, MessageSquare, LogOut, Bell, ExternalLink, X, Shield, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardAdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (path) => {
    if (path === "/admin") return pathname === path;
    return pathname.startsWith(path);
  };
  const [activeCount, setActiveCount] = useState(0);
  const [newOrderPopup, setNewOrderPopup] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const fetchActiveOrders = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'assigned', 'in_progress']);

      setActiveCount(count || 0);
    };

    fetchActiveOrders();

    const showPopup = async (order) => {
      const { data: clientData } = await supabase
        .from('profiles')
        .select('details')
        .eq('id', order.client_id)
        .single();

      setNewOrderPopup({
        id: order.id,
        client: clientData?.details?.company || clientData?.details?.full_name || "Nouveau Client",
        route: `${order.pickup_city || '—'} → ${order.delivery_city || '—'}`,
        price: order.price_ht
      });

      // Sound notification (optional, but premium)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.2;
        audio.play();
      } catch { console.log("Sound blocked"); }

      setTimeout(() => setNewOrderPopup(null), 15000);
    };

    const ACTIVE_STATUSES = new Set(['pending', 'assigned', 'in_progress']);
    const shouldRefreshActiveCount = (payload) => {
      const nextStatus = payload?.new?.status;
      const prevStatus = payload?.old?.status;
      return ACTIVE_STATUSES.has(nextStatus) || ACTIVE_STATUSES.has(prevStatus);
    };

    const channel = supabase
      .channel('admin:orders:updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        fetchActiveOrders();
        if (payload?.new) {
          await showPopup(payload.new);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (shouldRefreshActiveCount(payload)) {
          fetchActiveOrders();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        if (shouldRefreshActiveCount(payload)) {
          fetchActiveOrders();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col justify-between bg-white px-4 py-8 border-r border-slate-100 lg:flex z-20">
        <div>
          {/* Logo */}
          <Link to="/admin" className="mb-10 flex items-center gap-3 px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/20 ring-1 ring-white/20">
              <Activity size={20} className="text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-slate-900">ONE CONNEXION</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase mt-1">Plateforme Admin</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            <div className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Main Fleet</div>
            <NavItem icon={LayoutDashboard} label="Dashboard" to="/admin" active={isActive("/admin")} />
            <NavItem
              icon={Truck}
              label="Missions"
              badge={activeCount > 0 ? activeCount : null}
              to="/admin/orders"
              active={isActive("/admin/orders")}
            />
            <NavItem icon={Users} label="Livreurs" to="/admin/drivers" active={isActive("/admin/drivers")} />

            <div className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Finance & CRM</div>
            <NavItem icon={FileText} label="Facturation" to="/admin/invoices" active={isActive("/admin/invoices")} />
            <NavItem icon={Users} label="Comptes Clients" to="/admin/clients" active={isActive("/admin/clients")} />

            <div className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication</div>
            <NavItem icon={MessageSquare} label="Support Client" to="/admin/chat" active={isActive("/admin/chat")} />
          </nav>
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="space-y-4">
          <div className="mx-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm overflow-hidden">
                {user?.email?.[0].toUpperCase() || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">{user?.email || "Administrateur"}</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  Super Admin
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* New Order Notification Popup - Even more Premium */}
      {newOrderPopup && (
        <div className="fixed bottom-8 right-8 z-[100] w-full max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10 p-1">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-400 via-rose-500 to-indigo-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                    <Bell size={16} className="animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Alerte Dispatch</span>
                </div>
                <button
                  onClick={() => setNewOrderPopup(null)}
                  className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-xl font-bold leading-tight">Nouvelle commande entrante</h3>
              <p className="mt-1 text-xs font-medium text-slate-400 line-clamp-1">{newOrderPopup.client}</p>

              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Itinéraire</span>
                    <span className="text-sm font-bold">{newOrderPopup.route}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Montant</span>
                    <span className="text-sm font-black text-emerald-400">{newOrderPopup.price}€</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    navigate(`/admin/orders/${newOrderPopup.id}`);
                    setNewOrderPopup(null);
                  }}
                  className="flex-1 flex gap-2 items-center justify-center rounded-xl bg-white py-2.5 text-xs font-bold text-slate-900 shadow-xl transition-all hover:bg-slate-100 hover:-translate-y-0.5"
                >
                  Ouvrir <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: IconComponent, label, active, badge, to }) {
  const classes = `group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${active
      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const Icon = IconComponent;

  return (
    <Link to={to} className={classes}>
      <div className="flex items-center gap-3.5">
        {Icon ? (
          <Icon size={18} className={`transition-all duration-300 ${active ? "text-orange-500 scale-110" : "group-hover:scale-110"}`} />
        ) : null}
        <span className="tracking-tight">{label}</span>
      </div>
      {badge && (
        <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black tracking-tighter ${active ? "bg-white text-slate-900" : "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
          }`}>
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-orange-500 rounded-r-full" />
      )}
    </Link>
  );
}




