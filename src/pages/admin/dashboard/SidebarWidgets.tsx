import { useNavigate } from "react-router-dom";

export function FleetStatus({ drivers, driversCount }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] border border-noir/5 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-noir/5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display italic text-noir leading-none tracking-tight">Fleet Live.</h3>
          <p className="text-[10px] font-bold text-noir/20 uppercase tracking-widest mt-1.5">{driversCount} en ligne</p>
        </div>
        <button
          onClick={() => navigate('/admin/drivers')}
          className="text-[10px] font-bold uppercase tracking-widest text-[#ed5518] hover:text-noir transition-colors"
        >
          Exploration
        </button>
      </div>
      <div className="divide-y divide-noir/5 max-h-[320px] overflow-y-auto">
        {drivers.length === 0 ? (
          <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-noir/10 italic">
            Désert digital
          </div>
        ) : drivers.map(d => (
          <div key={d.id} className="px-8 py-4 flex items-center justify-between hover:bg-cream/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-noir text-white text-[10px] font-bold grid place-items-center group-hover:bg-[#ed5518] transition-colors shadow-lg">
                {d.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-bold text-noir/80 truncate max-w-[120px] italic font-display">{d.name}</span>
            </div>
            <span className={`text-[8px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all ${d.cls} group-hover:scale-105`}>
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientSolvability({ clients }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[2rem] border border-noir/5 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-noir/5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display italic text-noir leading-none tracking-tight">Solvabilité.</h3>
          <p className="text-[10px] font-bold text-noir/20 uppercase tracking-widest mt-1.5">Récupération flux</p>
        </div>
        <button
          onClick={() => navigate('/admin/invoices')}
          className="text-[10px] font-bold uppercase tracking-widest text-[#ed5518] hover:text-noir transition-colors"
        >
          Comptabilité
        </button>
      </div>
      <div className="divide-y divide-noir/5 max-h-[320px] overflow-y-auto">
        {clients.length === 0 ? (
          <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-noir/10 italic">
            Aucun flux actif
          </div>
        ) : clients.map(c => (
          <div key={c.id} className="px-8 py-4 flex items-center justify-between hover:bg-cream/30 transition-all group">
            <span className="text-sm font-bold text-noir/80 truncate italic font-display">{c.name}</span>
            <span className={`text-[8px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest border transition-all ${c.cls} group-hover:scale-105`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
