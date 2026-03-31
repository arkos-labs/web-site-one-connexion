import { useNavigate } from "react-router-dom";
import { Package, Users, Truck, CreditCard, ArrowRight } from "lucide-react";

export function QuickLinks() {
  const navigate = useNavigate();
  const LINKS = [
    { label: "Toutes les commandes", href: "/admin/orders", icon: Package },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Livreurs", href: "/admin/drivers", icon: Truck },
    { label: "Factures", href: "/admin/invoices", icon: CreditCard },
  ];
  return (
    <div className="bg-slate-900 rounded-[2rem] p-5 space-y-3 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 h-24 w-24 bg-[#ed5518]/10 rounded-full blur-2xl" />
      <div className="relative z-10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Accès Rapides</h3>
        {LINKS.map((link, i) => (
          <button key={i} onClick={() => navigate(link.href)} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/10 transition-all group text-left mb-1">
            <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
              <link.icon size={14} /> <span className="text-xs font-bold">{link.label}</span>
            </div>
            <ArrowRight size={12} className="text-slate-600 group-hover:text-[#ed5518]" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function NewOrderNotification({ order, onClose, onView }) {
  if (!order) return null;
  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-slate-900 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs border border-white/10">
        <div className="h-12 w-12 rounded-2xl bg-[#ed5518]/20 text-[#ed5518] flex items-center justify-center text-xl shrink-0">🔔</div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm">Nouvelle commande !</div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{order.pickup_city || '—'} → {order.delivery_city || '—'}</div>
          <div className="flex gap-2 mt-3">
            <button onClick={onView} className="px-3 py-1.5 bg-white text-slate-900 text-xs font-black rounded-xl">Voir</button>
            <button onClick={onClose} className="px-3 py-1.5 bg-white/10 text-slate-300 text-xs font-bold rounded-xl">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
