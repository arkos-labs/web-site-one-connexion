import { Bell, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ClientHeader({ profile, activeCount }) {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl md:p-14 mb-10">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ed5518] opacity-20 blur-3xl mix-blend-screen animate-pulse" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#ed5518] opacity-20 blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ed5518] backdrop-blur-md border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[#ed5518] opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-[#ed5518]" />
            </span>
            Espace Client Premium
          </div>
          <h1 className="text-4xl font-black md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Bonjour, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Partenaire'}.
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-400 max-w-xl leading-relaxed">
            Votre tableau de bord logistique intelligent. Suivez vos expéditions en temps réel.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm ring-1 ring-white/20 backdrop-blur-md hover:bg-white hover:text-slate-900 transition-all">
            <Bell size={24} />
            {activeCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ed5518] text-[9px] font-black">{activeCount}</span>}
          </button>
          <button onClick={() => navigate('/dashboard-client/nouvelle-course')} className="flex h-14 items-center gap-3 rounded-2xl bg-[#ed5518] px-6 font-black text-white shadow-xl shadow-[#ed5518]/20 hover:scale-105 transition-all">
            Commander <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
