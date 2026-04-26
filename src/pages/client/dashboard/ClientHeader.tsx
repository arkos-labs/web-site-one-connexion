import { Bell, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ClientHeader({ profile, activeCount }) {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden rounded-[2rem] bg-noir p-10 text-white shadow-2xl md:p-16 mb-12">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#ed5518]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-[#ed5518]"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">
              One Connexion · Partenaire
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display leading-none mb-6">
            bonjour, <br />
            <span className="italic text-[#ed5518]">{profile?.full_name ? profile.full_name.split(' ')[0] : 'Cher Partenaire'}</span>.
          </h1>
          <p className="text-xl text-white/50 max-w-xl font-light font-display italic">
            Votre excellence logistique au quotidien.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <button className="group relative flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-white border border-white/10 hover:border-[#ed5518] transition-all">
            <Bell size={24} className="group-hover:text-[#ed5518] transition-colors" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ed5518] text-[9px] font-bold text-white ring-4 ring-noir">
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/dashboard-client/nouvelle-course')}
            className="flex h-16 items-center gap-4 rounded-xl bg-[#ed5518] px-10 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
          >
            Commander <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
