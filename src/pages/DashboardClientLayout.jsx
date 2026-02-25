import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Truck, FileText, MapPin, User, Settings, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardClientLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (path) => {
    if (path === "/dashboard-client") return pathname === path;
    return pathname.startsWith(path);
  };
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let channelRef = null;

    const fetchActiveOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && mounted) {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("client_id", user.id)
          .in("status", ["pending", "assigned", "in_progress"]);

        if (mounted) setActiveCount(count || 0);

        if (!channelRef) {
          channelRef = supabase
            .channel(`public:orders:count:${user.id}`)
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "orders", filter: `client_id=eq.${user.id}` },
              () => {
                fetchActiveOrders();
              }
            )
            .subscribe();
        }
      }
    };

    fetchActiveOrders();

    return () => {
      mounted = false;
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden selection:bg-orange-500/30 selection:text-orange-900">
      <aside className="hidden w-[280px] flex-col justify-between border-r border-slate-200/60 bg-white/80 px-6 py-8 backdrop-blur-3xl lg:flex z-20">
        <div>
          <Link to="/" className="group mb-12 flex items-center gap-3 px-2">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              OC
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900">One Connexion</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entreprise</span>
            </div>
          </Link>

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

        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl shadow-slate-900/10">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Support Premium</span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-400 mb-4">Un expert logistique dédié à votre écoute 24/7.</p>
            <button className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white hover:text-slate-900">
              Contacter
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Déconnexion</span>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge, to }) {
  const classes = `group relative flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
    active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  }`;

  return (
    <Link to={to} className={classes}>
      {active && <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500" />}
      <div className="flex items-center gap-3">
        <Icon size={20} className={`transition-transform duration-300 ${!active && "group-hover:scale-110 group-hover:text-orange-500"}`} strokeWidth={active ? 2.5 : 2} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
