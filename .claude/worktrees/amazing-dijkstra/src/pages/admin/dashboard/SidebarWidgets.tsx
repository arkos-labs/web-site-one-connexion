import { useNavigate } from "react-router-dom";

export function FleetStatus({ drivers, driversCount }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Fleet Live</h3>
          <p className="text-[9px] font-bold text-slate-400 mt-0.5">{driversCount} livreur(s) en ligne</p>
        </div>
        <button onClick={() => navigate('/admin/drivers')} className="text-[10px] font-black text-[#ed5518]">Voir tout</button>
      </div>
      <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
        {drivers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">Aucun livreur en ligne</div>
        ) : drivers.map(d => (
          <div key={d.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white text-[10px] font-black grid place-items-center shadow">{d.name?.[0]?.toUpperCase()}</div>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">{d.name}</span>
            </div>
            <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${d.cls}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientSolvability({ clients, invoicesCount }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Solvabilité</h3>
          <p className="text-[9px] font-bold text-slate-400 mt-0.5">Statut facturation clients</p>
        </div>
        <button onClick={() => navigate('/admin/invoices')} className="text-[10px] font-black text-[#ed5518]">Voir tout</button>
      </div>
      <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
        {clients.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">Aucun client actif</div>
        ) : clients.map(c => (
          <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold text-slate-700 truncate">{c.name}</span>
            <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${c.cls}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
