import { FileText, Search } from "lucide-react";
import { downloadOrderPdf } from "@/pages/adminPdf.js";

export default function AdminOrdersHistory({
    query,
    setQuery,
    statusFilter,
    setSearchParams,
    historyFiltered,
    clients,
    navigate
}) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une mission, un client..."
                        className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {[{ label: "Toutes", status: "Tous" }, { label: "Terminées", status: "delivered" }, { label: "Refusées", status: "cancelled" }].map(({ label, status }) => (
                        <button
                            key={status}
                            onClick={() => setSearchParams({ status })}
                            className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                : "bg-slate-100 text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{historyFiltered.length} Résultats</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-5">Référence</th>
                            <th className="px-8 py-5">Client</th>
                            <th className="px-8 py-5">Trajet</th>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Statut</th>
                            <th className="px-8 py-5">Montant</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {historyFiltered.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black text-slate-400">#{o.id.slice(0, 8)}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900">{o.client}</span>
                                        {o.isGuest && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-0.5">Invité</span>}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 line-clamp-1">
                                        {o.pickup_city} <span className="text-slate-300">→</span> {o.delivery_city}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black text-slate-500">{o.date}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${o.status === "delivered" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        {o.status === "delivered" ? "Livrée" : "Annulée"}
                                    </span>
                                </td>
                                <td className="px-8 py-6 font-black text-slate-900">{o.total}€</td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const fullClient = clients.find(c => c.id === o.client_id);
                                                downloadOrderPdf(o, fullClient || {});
                                            }}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                        >
                                            <FileText size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`); }}
                                            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                                        >
                                            Détails
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
