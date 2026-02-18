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
        p.role?.toLowerCase() === 'client' || !p.role || p.role === 'admin'
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
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Vos Clients Partenaires 🤝</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Développez vos relations et suivez l'activité de vos comptes clés.</p>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-900">Liste des clients ({clients.length})</div>
          <div className="flex items-center gap-2">
            {query || isSearching ? (
              <div className="relative animate-fadeIn">
                <input
                  autoFocus
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-slate-100"
                  placeholder="Rechercher..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setIsSearching(false)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="rounded-full bg-slate-50 border border-slate-100 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Search size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2">Client</th>
                <th className="py-2">SIRET</th>
                <th className="py-2">Dépenses</th>
                <th className="py-2">Courses</th>
                <th className="py-2">Score</th>
                <th className="py-2">Dernière course</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 text-slate-500">{c.siret}</td>
                  <td className="py-3 font-semibold text-slate-900">{c.spend.toFixed(2)}€</td>
                  <td className="py-3 text-slate-700">{c.courses}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${c.risk.level === "Élevé" ? "bg-rose-50 text-rose-600" : c.risk.level === "Moyen" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                      Risque {c.risk.level} • {c.risk.score}/100
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{c.last}</td>
                  <td className="py-3">
                    <div className="flex justify-end">
                      <button onClick={() => navigate(`/dashboard-admin/clients/${c.id}`)} className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">Détails</button>
                    </div>
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

