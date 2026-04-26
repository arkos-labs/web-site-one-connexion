import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Truck, Users, FileText, MessageSquare, LogOut, Bell, ExternalLink, X, Shield, Activity, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Logo } from "@/components/ui/Logo";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        audio.play().catch(e => console.debug("Sound blocked by browser policy"));
      } catch (e) { console.debug("Audio initialization failed", e); }

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
    <div className="flex h-screen bg-cream font-body text-noir overflow-hidden selection:bg-[#ed5518]/30 selection:text-[#ed5518]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-72 flex-col justify-between bg-noir px-6 py-10 border-r border-noir/5 lg:flex z-20">
        <div>
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center">
            <Logo size="lg" variant="light" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#ed5518] uppercase mt-3">Administration</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mt-12">
            <div className="mb-4 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Fleet Management</div>
            <NavItem icon={LayoutDashboard} label="Tableau de Bord" to="/admin" active={isActive("/admin")} />
            <NavItem
              icon={Truck}
              label="Suivi Missions"
              badge={activeCount > 0 ? activeCount : null}
              to="/admin/orders"
              active={isActive("/admin/orders")}
            />
            <NavItem icon={Users} label="Livreurs" to="/admin/drivers" active={isActive("/admin/drivers")} />

            <div className="mb-4 mt-10 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Finance & CRM</div>
            <NavItem icon={FileText} label="Comptabilité" to="/admin/invoices" active={isActive("/admin/invoices")} />
            <NavItem icon={Users} label="Comptes Clients" to="/admin/clients" active={isActive("/admin/clients")} />

            <div className="mb-4 mt-10 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Communication</div>
            <NavItem icon={MessageSquare} label="Support Direct" to="/admin/chat" active={isActive("/admin/chat")} />
          </nav>
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="space-y-6">
          <div className="mx-2 rounded-2xl bg-white/5 p-4 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center text-noir text-xs font-bold ring-2 ring-white/10 shadow-sm overflow-hidden uppercase">
                {user?.email?.[0] || "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate italic font-display tracking-tight">
                  {user?.email?.split('@')[0] || "Administrateur"}
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#ed5518] uppercase tracking-wider opacity-90">
                  <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-pulse"></span>
                  Super Admin
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white/30 transition-all hover:bg-[#ed5518]/10 hover:text-[#ed5518] active:scale-95"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-noir px-6 py-4 flex items-center justify-between lg:hidden shadow-lg">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#ed5518] uppercase leading-none">Administration</span>
              <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest mt-1">One Connexion</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-noir shadow-xl transition-all active:scale-90"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-noir/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-noir shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300 border-r border-white/5">
              <div className="mb-10 flex flex-col items-center relative">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute -right-2 -top-2 p-2 text-white/30 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <Logo size="lg" variant="light" />
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#ed5518] uppercase mt-3">Gestion Admin</span>
              </div>
              <nav className="space-y-2 overflow-y-auto flex-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" to="/admin" active={isActive("/admin")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Truck} label="Missions" badge={activeCount > 0 ? activeCount : null} to="/admin/orders" active={isActive("/admin/orders")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Users} label="Livreurs" to="/admin/drivers" active={isActive("/admin/drivers")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={FileText} label="Comptabilité" to="/admin/invoices" active={isActive("/admin/invoices")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={Users} label="Clients" to="/admin/clients" active={isActive("/admin/clients")} onClick={() => setIsMobileMenuOpen(false)} />
                <NavItem icon={MessageSquare} label="Support" to="/admin/chat" active={isActive("/admin/chat")} onClick={() => setIsMobileMenuOpen(false)} />
              </nav>
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#ed5518] bg-[#ed5518]/10 hover:bg-[#ed5518]/20 transition-all font-display italic"
                >
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* New Order Notification Popup - Editorial Noir */}
      {newOrderPopup && (
        <div className="fixed bottom-10 right-10 z-[100] w-full max-w-md animate-in fade-in slide-in-from-right duration-700">
          <div className="relative overflow-hidden rounded-[2rem] bg-noir text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-white/10 p-1">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ed5518]/20 text-[#ed5518] shadow-[0_0_20px_rgba(237,85,24,0.3)]">
                    <Bell size={18} className="animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">Nouvelle Mission</span>
                </div>
                <button
                  onClick={() => setNewOrderPopup(null)}
                  className="rounded-full p-2 text-white/20 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-3xl font-display italic leading-tight mb-2 tracking-tight">
                Commande de <span className="text-[#ed5518]">{newOrderPopup.client}</span>.
              </h3>

              <div className="mt-8 rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/10 transition-colors cursor-default">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Trajectoire</span>
                    <span className="text-sm font-semibold tracking-wide italic font-display">{newOrderPopup.route}</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Net HT</span>
                    <span className="text-lg font-black text-[#ed5518] tracking-wider">{newOrderPopup.price}€</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-2 flex gap-4">
                <button
                  onClick={() => {
                    navigate(`/admin/orders/${newOrderPopup.id}`);
                    setNewOrderPopup(null);
                  }}
                  className="flex-1 flex gap-3 items-center justify-center rounded-xl bg-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-noir shadow-xl transition-all hover:bg-cream hover:-translate-y-1 active:scale-95"
                >
                  Détails Mission <ArrowUpRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, badge, to, onClick }) {
  const classes = `group relative flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${active
    ? "bg-[#ed5518] text-white shadow-lg shadow-orange-500/20"
    : "text-white/40 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <Link to={to} className={classes} onClick={onClick}>
      <div className="flex items-center gap-3.5">
        {Icon && (
          <Icon size={16} className={`transition-all duration-300 ${active ? "text-white scale-110" : "group-hover:text-[#ed5518] group-hover:scale-110"}`} />
        )}
        <span className={`${active ? 'font-display italic tracking-normal' : ''}`}>{label}</span>
      </div>
      {badge && (
        <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[9px] font-bold ${active ? "bg-white text-[#ed5518]" : "bg-[#ed5518] text-white shadow-md shadow-orange-500/30"
          }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}





