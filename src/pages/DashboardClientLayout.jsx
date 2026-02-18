import { Link, Outlet, useLocation } from "react-router-dom";
import { Truck, FileText, MapPin, User, Settings, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardClientLayout() {
  const { pathname } = useLocation();
  const isActive = (path) => {
    if (path === "/dashboard-client") return pathname === path;
    return pathname.startsWith(path);
  };
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .in('status', ['pending', 'assigned', 'picked_up']);

        setActiveCount(count || 0);
      }
    };

    fetchActiveOrders();

    const channel = supabase
      .channel('public:orders:count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchActiveOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F2F3F7] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col justify-between bg-white px-6 py-8 shadow-xl shadow-slate-200/50 lg:flex rounded-r-[2rem] z-20">
        <div>
          {/* Logo */}
          <Link to="/" className="mb-12 flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20">OC</div>
            <span className="text-xl font-bold tracking-tight">One Connexion</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</div>
            <NavItem icon={LayoutDashboard} label="Tableau de bord" to="/dashboard-client" active={isActive("/dashboard-client")} />
            <NavItem
              icon={Truck}
              label="Commandes"
              badge={activeCount > 0 ? activeCount : null}
              to="/dashboard-client/orders"
              active={isActive("/dashboard-client/orders")}
            />
            <NavItem icon={FileText} label="Factures" to="/dashboard-client/invoices" active={isActive("/dashboard-client/invoices")} />
            <NavItem icon={MapPin} label="Carnet d'adresses" to="/dashboard-client/addresses" active={isActive("/dashboard-client/addresses")} />

            <div className="mb-4 mt-8 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Support</div>
            <NavItem icon={User} label="Mon profil" to="/dashboard-client/profile" active={isActive("/dashboard-client/profile")} />
            <NavItem icon={MessageSquare} label="Tchat Support" to="/dashboard-client/chat" active={isActive("/dashboard-client/chat")} />
            <NavItem icon={Settings} label="Paramètres" to="/dashboard-client/settings" active={isActive("/dashboard-client/settings")} />
          </nav>
        </div>

        {/* Logout */}
        <Link to="/login" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-red-500">
          <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          <span>Déconnexion</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge, to }) {
  const classes = `group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`;

  return (
    <Link to={to} className={classes}>
      <div className="flex items-center gap-4">
        <Icon size={20} className={`transition-transform ${!active && "group-hover:scale-110"}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
