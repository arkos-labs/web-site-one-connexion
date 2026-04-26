import { Clock, Navigation, Phone, Package, Navigation2 } from "lucide-react";

export function TaskCard({ task, onUpdateStatus }) {
  const isUrgent = task.service_level === 'super' || task.service_level === 'exclu';
  
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200/60 group">
      <div className="bg-slate-900 px-8 py-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black bg-white/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">#{task.id.slice(0, 8)}</span>
           {isUrgent && <span className="text-[10px] font-black bg-orange-500 px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">Urgent 🔥</span>}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-70">
           <Clock size={14} /> {new Date(task.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100 group-hover:bg-slate-200 transition-colors" />
          
          <div className="relative">
            <div className="absolute -left-8 top-1.5 h-6 w-6 rounded-full border-4 border-slate-900 bg-white z-10" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ed5518] mb-1">Enlèvement</div>
            <div className="font-black text-slate-900 text-xl leading-none">{task.pickup_city || "Chargement"}</div>
            <div className="text-sm font-semibold text-slate-500 mt-2 leading-snug">{task.pickup_address}</div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-1.5 h-6 w-6 rounded-full border-4 border-[#ed5518] bg-white z-10" />
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ed5518] mb-1">Livraison</div>
            <div className="font-black text-slate-900 text-xl leading-none">{task.delivery_city || "Déchargement"}</div>
            <div className="text-sm font-semibold text-slate-500 mt-2 leading-snug">{task.delivery_address}</div>
          </div>
        </div>

        {task.notes && (
          <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100 flex gap-4 items-start">
             <Package size={20} className="text-slate-400 mt-1 shrink-0" />
             <div className="text-sm font-semibold text-slate-600 whitespace-pre-line leading-relaxed">{task.notes}</div>
          </div>
        )}

        <div className="pt-2 flex gap-4">
          {task.status === 'assigned' || task.status === 'accepted' ? (
            <>
              <button 
                onClick={() => onUpdateStatus(task.id, 'driver_accepted')}
                className="flex-1 rounded-[1.25rem] bg-[#ed5518] py-4.5 text-center text-sm font-black text-white shadow-xl shadow-[#ed5518]/20 active:scale-95 transition-all"
              >
                ACCEPTER LA MISSION
              </button>
              <button 
                onClick={() => confirm("Refuser ?") && onUpdateStatus(task.id, 'accepted')}
                className="px-5 rounded-[1.25rem] bg-slate-100 text-slate-400 font-black hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                ✕
              </button>
            </>
          ) : task.status === 'driver_accepted' ? (
            <button 
              onClick={() => onUpdateStatus(task.id, 'in_progress')}
              className="flex-1 rounded-[1.25rem] bg-slate-900 py-4.5 text-sm font-black text-white shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              CONFIRMER LA RAMASSE <Navigation2 size={16} />
            </button>
          ) : (
            <button 
              onClick={() => onUpdateStatus(task.id, 'delivered')}
              className="flex-1 rounded-[1.25rem] bg-[#ed5518] py-4.5 text-sm font-black text-white shadow-xl shadow-[#ed5518]/30 active:scale-95 transition-all"
            >
              VALIDER LA LIVRAISON ✅
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
