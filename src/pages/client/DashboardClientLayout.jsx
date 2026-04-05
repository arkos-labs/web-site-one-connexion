import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Truck, FileText, MapPin, User, Settings, LogOut, LayoutDashboard, MessageSquare, Menu, X, Bell, ExternalLink, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Logo } from "@/components/ui/Logo";
import { useProfile } from "@/hooks/useProfile";

export default function DashboardClientLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeCount, setActiveCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { profile } = useProfile();

  const isActive = (path) => {
    if (path === "/dashboard-client") return pathname === path;
    return pathname.startsWith(path);
  };

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (mounted) setUser(currentUser);
    };
    getUser();

    const fetchActiveOrders = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser || !mounted) return;

      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("client_id", currentUser.id)
        .in("status", ["pending", "assigned", "in_progress"]);

      if (mounted) setActiveCount(count || 0);
    };

    fetchActiveOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel('client-layout-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchActiveOrders();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden selection:bg-[#ed5518]/30 selection:text-[#ed5518]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-72 flex-col justify-between bg-white px-4 py-8 border-r border-slate-100 lg:flex z-20">
        <div>
          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">
            <Logo size="lg" />
            <span className="text-[10px] font-black tracking-[0.3em] text-[#ed5518] uppercase mt-2">Espace Client</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <div className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Logistique</div>
            <NavItem icon={LayoutDashboard} label="Tableau de Bord" to="/dashboard-client" active={isActive("/dashboard-client")} />
            <NavItem
              icon={Truck}
              label="Suivi de Mission"
              badge={activeCount > 0 ? activeCount : null}
              to="/dashboard-client/orders"
              active={isActive("/dashboard-client/orders")}
            />
            <NavItem icon={MapPin} label="Carnet d'Adresses" to="/dashboard-client/addresses" active={isActive("/dashboard-client/addresses")} />

            <div className="mb-3 mt-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Services</div>
            <NavItem icon={FileText} label="Facturation" to="/dashboard-client/invoices" active={isActive("/dashboard-client/invoices")} />
            <NavItem icon={AlertTriangle} label="Mes Litiges" to="/dashboard-client/claims" active={isActive("/dashboard-client/claims")} />
            <NavItem icon={MessageSquare} label="Support Direct" to="/dashboard-client/chat" active={isActive("/dashboard-client/chat")} />
          </nav>
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="space-y-4">
          <div className="mx-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm overflow-hidden uppercase">
                {profile?.first_name?.[0] || user?.email?.[0] || <User size={16} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                  {profile?.details?.full_name || (profile?.first_name || profile?.last_name 
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                    : user?.user_metadata?.full_name || user?.user_metadata?.contact_name || user?.email?.split('@')[0] || "Client One")}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#ed5518] uppercase tracking-wider opacity-90">
                  <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-pulse"></span>
                  {profile?.details?.company || profile?.company_name || user?.user_metadata?.company || user?.user_metadata?.company_name || "Compte Pro"}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between lg:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.2em] text-[#ed5518] uppercase leading-none">Espace</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Client</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition-all active:scale-90"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
              <div className="mb-8 flex flex-col items-center relative">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute -right-2 -top-2 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
                <Logo size="lg" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#ed5518] uppercase mt-2">Espace Client</span>
              </div>
              <nav className="space-y-1 overflow-y-auto flex-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard-client" active={isActive("/dashboard-client")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem
                  icon={Truck}
                  label="Suivi Missions"
                  badge={activeCount > 0 ? activeCount : null}
                  to="/dashboard-client/orders"
                  active={isActive("/dashboard-client/orders")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavItem icon={FileText} label="Facturation" to="/dashboard-client/invoices" active={isActive("/dashboard-client/invoices")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={AlertTriangle} label="Mes Litiges" to="/dashboard-client/claims" active={isActive("/dashboard-client/claims")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={MapPin} label="Adresses" to="/dashboard-client/addresses" active={isActive("/dashboard-client/addresses")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={MessageSquare} label="Support" to="/dashboard-client/chat" active={isActive("/dashboard-client/chat")} onClick={() => setIsMobileMenuOpen(false)} />
              </nav>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge, to, onClick }) {
  const classes = `group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${active
    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <Link to={to} className={classes} onClick={onClick}>
      <div className="flex items-center gap-3.5">
        {Icon && (
          <Icon size={18} className={`transition-all duration-300 ${active ? "text-[#ed5518] scale-110" : "group-hover:scale-110"}`} />
        )}
        <span className="tracking-tight">{label}</span>
      </div>
      {badge && (
        <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black tracking-tighter ${active ? "bg-white text-slate-900" : "bg-[#ed5518] text-white shadow-lg shadow-primary/20"
          }`}>
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#ed5518] rounded-r-full" />
      )}
    </Link>
  );
}
