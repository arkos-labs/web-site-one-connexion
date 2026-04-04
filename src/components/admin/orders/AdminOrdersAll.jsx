import { useState, useMemo } from "react";
import { FileText, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { generateOrderPdf } from "@/lib/pdf-generator";

export default function AdminOrdersAll({
    allMissions,
    clients,
    navigate
}) {
    const [query, setQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("all"); // today, week, month, year, all
    const [statusFilter, setStatusFilter] = useState("all");
    const [claimFilter, setClaimFilter] = useState("all"); // pending, resolved, none, all

    const filtered = useMemo(() => {
        return allMissions.filter(o => {
            const lower = query.toLowerCase();
            const matchesQuery = String(o.id).toLowerCase().includes(lower) || 
                               (o.client || "").toLowerCase().includes(lower) ||
                               (o.pickup_city || "").toLowerCase().includes(lower);
            
            if (!matchesQuery) return false;

            // Status filter
            if (statusFilter !== "all" && o.status !== statusFilter) return false;

            // Claim filter
            if (claimFilter === "pending" && o.claim_status !== "pending") return false;
            if (claimFilter === "resolved" && o.claim_status !== "resolved") return false;
            if (claimFilter === "any" && (!o.claim_status || o.claim_status === "none")) return false;

            // Date filter
            if (dateFilter === "all") return true;

            const d = new Date(o.created_at);
            const now = new Date();
            
            if (dateFilter === "today") {
                return d.toLocaleDateString() === now.toLocaleDateString();
            }
            if (dateFilter === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return d >= weekAgo;
            }
            if (dateFilter === "month") {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (dateFilter === "year") {
                return d.getFullYear() === now.getFullYear();
            }

            return true;
        });
    }, [allMissions, query, dateFilter, statusFilter, claimFilter]);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Extended Toolbar */}
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une mission, un client, un ID..."
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-200/50 p-1 rounded-xl">
                            {[
                                { id: "today", label: "Jour" },
                                { id: "week", label: "Semaine" },
                                { id: "month", label: "Mois" },
                                { id: "year", label: "Année" },
                                { id: "all", label: "Tout" }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setDateFilter(f.id)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut:</span>
                        <select 
                            className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-slate-900/10 shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous les états</option>
                            <option value="pending">Nouveaux / En attente</option>
                            <option value="accepted">Validés</option>
                            <option value="assigned">Assignés</option>
                            <option value="driver_accepted">En route</option>
                            <option value="in_progress">Enlevés</option>
                            <option value="delivered">Livrées</option>
                            <option value="cancelled">Annulées</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Litiges:</span>
                        <select 
                            className={`rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all border-none ${claimFilter !== 'all' ? 'bg-rose-50 text-rose-600' : 'bg-white text-slate-600'}`}
                            value={claimFilter}
                            onChange={(e) => setClaimFilter(e.target.value)}
                        >
                            <option value="all">Tous les dossiers</option>
                            <option value="any">Dossiers avec litige</option>
                            <option value="pending">Litiges en cours ⚠️</option>
                            <option value="resolved">Litiges résolus ✓</option>
                        </select>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{filtered.length} Missions affichées</div>
                    </div>
                </div>
            </div>

            {/* Missions List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                            <th className="px-8 py-5">Mission</th>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Client</th>
                            <th className="px-8 py-5">Trajet</th>
                            <th className="px-8 py-5">Statut</th>
                            <th className="px-8 py-5">SAV / Litige</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="py-20 text-center text-slate-400 italic">Aucune mission trouvée avec ces critères.</td></tr>
                        ) : filtered.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-900 font-mono">#{o.id.slice(0, 8)}</span>
                                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{o.service_level?.toUpperCase() || 'NORMAL'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{new Date(o.created_at).toLocaleDateString()}</span>
                                        <span className="text-[9px] text-slate-400">{new Date(o.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 leading-none">{o.client}</span>
                                        {o.isGuest && <span className="text-[9px] font-black text-rose-500 uppercase mt-1">Invité</span>}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        {o.pickup_city || '—'} <span className="text-slate-300">→</span> {o.delivery_city || '—'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        o.status === "delivered" ? "bg-emerald-50 text-emerald-600" : 
                                        o.status === "cancelled" ? "bg-rose-50 text-rose-600" :
                                        "bg-slate-900 text-white"
                                    }`}>
                                        {o.status === "delivered" ? "Livrée" : o.status === "cancelled" ? "Annulée" : "En cours"}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    {o.claim_status && o.claim_status !== 'none' ? (
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${o.claim_status === 'resolved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'}`}>
                                            {o.claim_status === 'resolved' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {o.claim_status === 'resolved' ? 'Litige clos' : 'RÉCLAMATION'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">R.A.S</span>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const fullClient = clients.find(c => c.id === o.client_id);
                                                const d = fullClient?.details || {};
                                                const info = {
                                                    name: d.full_name || d.contact_name || o.client || "",
                                                    firstName: d.first_name || (d.full_name || "").split(' ')[0] || "",
                                                    lastName: d.last_name || (d.full_name || "").split(' ').slice(1).join(' ') || "",
                                                    email: d.email || fullClient?.email || o.sender_email || "",
                                                    phone: d.phone || d.phone_number || o.pickup_phone || "",
                                                    company: d.company || o.billing_company || "",
                                                    billingAddress: d.address || o.billing_address || "",
                                                    billingCity: d.city || o.billing_city || "",
                                                    billingZip: d.zip || d.postal_code || o.billing_zip || ""
                                                };
                                                generateOrderPdf(o, info);
                                            }}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            title="Télércharger le BC"
                                        >
                                            <FileText size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`); }}
                                            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ed5518] transition-all shadow-sm"
                                        >
                                            Gérer
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
