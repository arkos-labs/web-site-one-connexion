import { Truck } from "lucide-react";

export function DriverHeader({ tasksCount, isOnline, onToggleOnline }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-black text-slate-900 lg:text-4xl">Mes Missions 🚀</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          {tasksCount === 0 ? "Prêt pour de nouvelles courses ?" : `${tasksCount} mission(s) active(s)`}
        </p>
      </div>
      <button 
        onClick={onToggleOnline}
        className={`flex items-center gap-3 rounded-[1.25rem] px-5 py-3.5 transition-all outline-none border ${isOnline ? 'bg-[#ed5518] text-white border-transparent shadow-lg shadow-[#ed5518]/20' : 'bg-white text-slate-400 border-slate-100'}`}
      >
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
        <span className="text-[11px] font-black uppercase tracking-widest">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
      </button>
    </header>
  );
}

export function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-12 text-center shadow-sm border border-slate-100 min-h-[400px]">
      <div className="mb-6 rounded-3xl bg-slate-50 p-7 text-slate-200">
        <Truck size={64} strokeWidth={1} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Aucune mission pour le moment</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
        Restez en ligne pour recevoir les notifications de l'administrateur dès qu'une mission est disponible.
      </p>
    </div>
  );
}
