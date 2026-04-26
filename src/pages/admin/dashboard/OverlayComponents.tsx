import { useNavigate } from "react-router-dom";
import { Package, Users, Truck, CreditCard, ArrowRight } from "lucide-react";

export function QuickLinks() {
  const navigate = useNavigate();
  const LINKS = [
    { label: "Gestion des Missions", href: "/admin/orders", icon: Package },
    { label: "Base Clients", href: "/admin/clients", icon: Users },
    { label: "Réseau Livreurs", href: "/admin/drivers", icon: Truck },
    { label: "Comptabilité", href: "/admin/invoices", icon: CreditCard },
  ];
  return (
    <div className="bg-noir rounded-[2rem] p-8 space-y-6 relative overflow-hidden shadow-2xl">
      <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#ed5518]/10 rounded-full blur-3xl group-hover:bg-[#ed5518]/20 transition-all duration-700" />
      <div className="relative z-10">
        <h3 className="text-xl font-display italic text-white mb-8 tracking-tight">Accès Directs.</h3>
        <div className="space-y-1">
          {LINKS.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.href)}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group text-left"
            >
              <div className="flex items-center gap-4 text-white/60 group-hover:text-white transition-colors">
                <link.icon size={16} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{link.label}</span>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-[#ed5518] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NewOrderNotification({ order, onClose, onView }) {
  if (!order) return null;
  return (
    <div className="fixed bottom-12 right-12 z-[100] animate-in slide-in-from-right-10 fade-in duration-700">
      <div className="bg-noir text-white p-8 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-6 max-w-sm border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#ed5518]/20 text-[#ed5518] flex items-center justify-center shadow-[0_0_20px_rgba(237,85,24,0.3)]">
              <Package size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ed5518]">Alerte Flux</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors uppercase text-[10px] font-bold">X</button>
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-display italic leading-tight">Nouvelle mission détectée.</div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic truncate">
            {order.pickup_city || '—'} → {order.delivery_city || '—'}
          </p>
        </div>

        <button
          onClick={onView}
          className="w-full bg-white text-noir py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cream transition-all active:scale-95 shadow-lg"
        >
          Ouvrir le Dispatch
        </button>
      </div>
    </div>
  );
}
