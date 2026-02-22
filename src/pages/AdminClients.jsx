import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, Search, X } from "lucide-react";

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((b - a) / ms);
}

function computeClientRisk(invoices) {
  const today = new Date();
  const unpaid = invoices.filter((i) => i.status !== "paid");
  const overdue = unpaid.filter((i) => i.due_date && new Date(i.due_date) < today);

  const unpaidAmount = unpaid.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const overdueAmount = overdue.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const worstLateDays = overdue.length
    ? Math.max(...overdue.map((i) => daysBetween(new Date(i.due_date), today)))
    : 0;

  let score = 0;
  if (unpaid.length >= 1) score += 20;
  if (unpaid.length >= 2) score += 20;
  if (overdue.length >= 1) score += 25;
  if (overdue.length >= 2) score += 15;
  if (overdueAmount > 500) score += 10;
  if (worstLateDays > 15) score += 10;

  score = Math.min(100, score);
  const level = score >= 70 ? "Élevé" : score >= 40 ? "Moyen" : "Faible";
  return { score, level, unpaidCount: unpaid.length, overdueCount: overdue.length, overdueAmount, worstLateDays };
}

export default function AdminClients() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cRes, oRes, iRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('invoices').select('*')
    ]);

    if (cRes.data) {
      // Filtrage souple : client, admin ou rôle vide
      const filteredClients = cRes.data.filter(p =>
        p.role?.toLowerCase() === 'client' || !p.role
      );
      setClients(filteredClients);
    }
    if (oRes.data) setOrders(oRes.data);
    if (iRes.data) setInvoices(iRes.data);
    setLoading(false);
  };

  const rows = useMemo(() => {
    const lower = query.toLowerCase();

    return clients.filter((c) => {
      const name = c.details?.company || c.details?.full_name || '';
      const siret = c.details?.siret || '';
      return name.toLowerCase().includes(lower) || siret.includes(query);
    })
      .map((c) => {
        const clientName = c.details?.company || c.details?.full_name || 'Client';
        const clientOrders = orders.filter((o) => o.client_id === c.id);
        const spend = clientOrders.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);
        const clientInvoices = invoices.filter((i) => i.client_id === c.id);
        const risk = computeClientRisk(clientInvoices);

        return {
          ...c,
          name: clientName,
          siret: c.details?.siret || '—',
          spend,
          courses: clientOrders.length,
          last: clientOrders[0]?.id ? `#${clientOrders[0].id.slice(0, 8)}` : "—",
          risk
        };
      });
  }, [query, clients, orders, invoices]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Portefeuille Clients</h2>
          <p className="mt-2 text-base font-medium text-slate-500 max-w-2xl">
            Gérez vos relations commerciales et surveillez la solvabilité de vos partenaires.
          </p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Clients</span>
            <span className="text-xl font-black text-slate-900">{clients.length}</span>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une entreprise, un SIRET..."
              className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {rows.length} COMPTES ACTIFS
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Partenaire</th>
                <th className="px-8 py-5">Identifiant SIRET</th>
                <th className="px-8 py-5">Volume d'affaires</th>
                <th className="px-8 py-5">Missions</th>
                <th className="px-8 py-5">Indice de Risque</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/clients/${c.id}`)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg">
                        {c.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Compte Certifié</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-400 tracking-tighter">{c.siret}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">{c.spend.toFixed(2)}€</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600">
                      {c.courses}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${c.risk.level === "Élevé" ? "text-rose-600" :
                          c.risk.level === "Moyen" ? "text-amber-600" :
                            "text-emerald-600"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.risk.level === "Élevé" ? "bg-rose-600 animate-pulse" :
                            c.risk.level === "Moyen" ? "bg-amber-600" :
                              "bg-emerald-600"
                          }`}></span>
                        {c.risk.level}
                      </span>
                      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.risk.level === "Élevé" ? "bg-rose-500" :
                            c.risk.level === "Moyen" ? "bg-amber-500" :
                              "bg-emerald-500"
                          }`} style={{ width: `${c.risk.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${c.id}`); }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                    >
                      DOSSIER
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




