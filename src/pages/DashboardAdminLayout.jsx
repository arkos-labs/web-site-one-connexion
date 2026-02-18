import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Truck, Users, FileText, MessageSquare, LogOut, Bell, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardAdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (path) => {
    if (path === "/dashboard-admin") return pathname === path;
    return pathname.startsWith(path);
  };
  const [activeCount, setActiveCount] = useState(0);
  const [newOrderPopup, setNewOrderPopup] = useState(null);

  // Audio notification
  const [audio] = useState(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  useEffect(() => {
    const unlock = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, [audio]);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'assigned', 'picked_up']);

      setActiveCount(count || 0);
    };

    fetchActiveOrders();

    let lastSeen = null;

    const initLastSeen = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      lastSeen = data?.[0]?.created_at || null;
    };

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

      audio.play().catch(() => {});
      setTimeout(() => setNewOrderPopup(null), 15000);
    };

    const poll = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, created_at, pickup_city, delivery_city, price_ht, client_id')
        .order('created_at', { ascending: false })
        .limit(1);

      const latest = data?.[0];
      if (!latest) return;

      if (lastSeen && new Date(latest.created_at) > new Date(lastSeen)) {
        await showPopup(latest);
      }
      lastSeen = latest.created_at;
    };

    initLastSeen();
    const pollId = setInterval(poll, 8000);

    const channel = supabase
      .channel('admin:orders:updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        fetchActiveOrders();
        if (payload.eventType === 'INSERT') {
          await showPopup(payload.new);
          lastSeen = payload.new?.created_at || lastSeen;
        }
      })
      .subscribe();

    return () => {
      clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F2F3F7] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col justify-between bg-white px-6 py-8 shadow-xl shadow-slate-200/50 lg:flex rounded-r-[2rem] z-20">
        <div>
          {/* Logo */}
          <Link to="/dashboard-admin" className="mb-12 flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20">OC</div>
            <span className="text-xl font-bold tracking-tight">One Connexion</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</div>
            <NavItem icon={LayoutDashboard} label="Tableau de bord" to="/dashboard-admin" active={isActive("/dashboard-admin")} />
            <NavItem
              icon={Truck}
              label="Commandes"
              badge={activeCount > 0 ? activeCount : null}
              to="/dashboard-admin/orders"
              active={isActive("/dashboard-admin/orders")}
            />
            <NavItem icon={Users} label="Chauffeurs" to="/dashboard-admin/drivers" active={isActive("/dashboard-admin/drivers")} />
            <NavItem icon={FileText} label="Factures" to="/dashboard-admin/invoices" active={isActive("/dashboard-admin/invoices")} />
            <NavItem icon={Users} label="Clients" to="/dashboard-admin/clients" active={isActive("/dashboard-admin/clients")} />

            <div className="mb-4 mt-8 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Support</div>
            <NavItem icon={MessageSquare} label="Tchat" to="/dashboard-admin/chat" active={isActive("/dashboard-admin/chat")} />
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

      {/* New Order Notification Popup */}
      {newOrderPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[3rem] bg-white shadow-2xl ring-1 ring-slate-200 animate-slideUp">
            {/* Header / Accent */}
            <div className="h-2 w-full bg-orange-500" />

            <div className="p-8">
              <button
                onClick={() => setNewOrderPopup(null)}
                className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 shadow-lg shadow-orange-500/10">
                  <Bell size={40} className="animate-bounce" />
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  NOUVELLE COMMANDE !
                </h2>
                <p className="mt-2 text-base font-medium text-slate-500">
                  Une nouvelle mission vient d'être enregistrée sur la plateforme.
                </p>

                <div className="mt-8 w-full rounded-[2rem] bg-slate-50 p-6 border border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Client</div>
                      <div className="text-lg font-bold text-slate-900">{newOrderPopup.client}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Référence</div>
                      <div className="font-mono text-sm font-bold text-orange-600">BC-{newOrderPopup.id.slice(0, 8)}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 rounded-xl bg-white p-4 shadow-sm border border-slate-50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Itinéraire</div>
                      <div className="text-sm font-bold text-slate-700">{newOrderPopup.route}</div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Prix HT</div>
                      <div className="text-sm font-black text-slate-900">{newOrderPopup.price}€</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex w-full gap-3">
                  <button
                    onClick={() => setNewOrderPopup(null)}
                    className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/dashboard-admin/orders/${newOrderPopup.id}`);
                      setNewOrderPopup(null);
                    }}
                    className="flex-[2] flex gap-2 items-center justify-center rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95"
                  >
                    <ExternalLink size={18} />
                    Voir la commande
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
