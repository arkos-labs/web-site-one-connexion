export default function AdminOrdersKanban({
    kanbanList,
    navigate,
    drivers,
    openDecision,
    openDispatch,
    derived
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
                { label: "Nouveaux", statuses: ["pending_acceptance", "pending"], color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600" },
                { label: "Dispatch", statuses: ["accepted", "driver_refused", "assigned"], color: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
                { label: "En cours", statuses: ["assigned", "driver_accepted", "in_progress", "picked_up"], color: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600" },
                { label: "Livrées", statuses: ["delivered"], color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
            ].map((col) => (
                <div key={col.label} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${col.color}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{col.label}</span>
                        </div>
                        <span className={`text-[10px] font-black ${col.light} ${col.text} px-2 py-0.5 rounded-md`}>
                            {kanbanList.filter((o) => {
                                if (col.label === "Dispatch" && o.status === "assigned") return !o.driver_id;
                                if (col.label === "En cours" && o.status === "assigned") return !!o.driver_id;
                                return col.statuses.includes(o.status);
                            }).length}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {kanbanList.filter((o) => {
                            if (col.label === "Dispatch" && o.status === "assigned") return !o.driver_id;
                            if (col.label === "En cours" && o.status === "assigned") return !!o.driver_id;
                            return col.statuses.includes(o.status);
                        }).length === 0 ? (
                            <div className="p-8 rounded-[2rem] border border-dashed border-slate-200 text-center opacity-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vide</span>
                            </div>
                        ) : kanbanList.filter((o) => {
                            if (col.label === "Dispatch" && o.status === "assigned") return !o.driver_id;
                            if (col.label === "En cours" && o.status === "assigned") return !!o.driver_id;
                            return col.statuses.includes(o.status);
                        }).map((o) => (
                            <div
                                key={o.id}
                                className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                onClick={() => navigate(`/admin/orders/${o.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BC-{o.id.slice(0, 8)}</span>
                                        <h4 className="text-base font-black text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">{o.client}</h4>
                                        <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${o.status === "assigned" ? "bg-amber-50 text-amber-700" :
                                            o.status === "driver_accepted" ? "bg-emerald-50 text-emerald-700" :
                                                o.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                                                    o.status === "delivered" ? "bg-slate-100 text-slate-600" :
                                                        o.status === "accepted" ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-500"
                                            }`}>
                                            {o.status === "assigned" ? "EN ATTENTE RÉPONSE" :
                                                o.status === "driver_accepted" ? "EN ROUTE ENLÈVEMENT ✅" :
                                                    (o.status === "in_progress" || o.status === "picked_up") ? "ENLEVÉE" :
                                                        o.status === "delivered" ? "LIVRÉE" :
                                                            o.status === "accepted" ? "À DISPATCHER" :
                                                                o.status === "driver_refused" ? "REFUSÉ CHAUFFEUR ❌" : o.status}
                                        </span>
                                    </div>
                                    {o.isGuest && (
                                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex flex-col items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                                            <div className="h-4 w-px bg-slate-100"></div>
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{o.pickup_city || 'Départ'}</span>
                                            <span className="text-[10px] text-slate-900 font-black uppercase truncate">{o.delivery_city || 'Arrivée'}</span>
                                        </div>
                                    </div>
                                </div>

                                {o.driver_id && (
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                                        <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] text-white font-black uppercase">
                                            {drivers.find(d => d.id === o.driver_id)?.name?.slice(0, 1) || '?'}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 truncate">
                                            {drivers.find(d => d.id === o.driver_id)?.name || "Chauffeur"}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex gap-2 relative z-20">
                                        {col.label === "Nouveaux" ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDecision(o, "accept"); }}
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                                            >
                                                ACCEPTER
                                            </button>
                                        ) : col.label === "Dispatch" ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                                                className="rounded-xl bg-orange-500 px-4 py-2 text-[10px] font-black text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg shadow-orange-500/10 active:scale-95"
                                            >
                                                DISPATCH
                                            </button>
                                        ) : col.label === "En cours" ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                                            >
                                                RÉASSIGNER
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">LIVRÉ ✓</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] font-black text-slate-900">{o.total}€ HT</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{o.vehicle_type}</span>
                                    </div>
                                </div>

                                {derived.isLate(o) && (
                                    <div className="absolute top-0 right-0 h-1 w-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div >
            ))
            }
        </div >
    );
}
