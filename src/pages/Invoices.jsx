import { useEffect, useState } from "react";
// jsPDF loaded via pdfGenerator
import { supabase } from "../lib/supabase";
import { Loader2, FileText, Download } from "lucide-react";
// pdfGenerator loaded dynamically

const COMPANY = {
  name: "One Connexion",
  siret: "000 000 000 00000",
  tva: "FR00 000000000",
  iban: "FR76 3000 4000 5000 6000 7000 890",
  address: "10 Rue de Paris, 75008 Paris",
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]); // Orders for the selected invoice
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInvoices(data);
        if (data.length > 0) setSelected(data[0]);

        const { data: prof } = await supabase.from('profiles').select('details').eq('id', user.id).single();
        if (prof) setProfile(prof.details);
      }
    }
    setLoading(false);
  };

  // Fetch orders when an invoice is selected
  useEffect(() => {
    if (!selected) {
      setOrders([]);
      return;
    }

    const fetchInvoiceOrders = async () => {
      setLoadingOrders(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Logique simplifiée: on récupère les commandes dans la période de la facture
      // Idéalement, il faudrait une table de liaison invoice_items ou une colonne invoice_id dans orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .gte('created_at', selected.period_start)
        .lte('created_at', selected.period_end)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (!error) setOrders(data || []);
      setLoadingOrders(false);
    };

    if (selected.period_start && selected.period_end) {
      fetchInvoiceOrders();
    } else {
      setOrders([]);
    }
  }, [selected]);


  const downloadInvoice = async () => {
    if (!selected) return;
    const periodStr = new Date(selected.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const { generateInvoicePdf } = await import("../lib/pdfGenerator");
    generateInvoicePdf({ ...selected, period: periodStr }, orders, profile || {});
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (invoices.length === 0) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Factures</h1>
          <p className="text-sm text-slate-500">Aucune facture disponible pour le moment.</p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <FileText className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Tout est en ordre</h3>
          <p className="mt-2 text-sm text-slate-500">Vos factures apparaîtront ici une fois générées chaque fin de mois.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Mes Factures 📄</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Consultez et téléchargez vos documents comptables simplement.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Historique</div>
          <div className="mt-4 grid gap-3">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelected(inv)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${selected?.id === inv.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900 hover:bg-slate-100"}`}
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {new Date(inv.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-sm font-bold">#{inv.id.slice(0, 8)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${inv.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {inv.status === 'paid' ? 'Payée' : inv.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Facture</div>
                <div className="text-2xl font-bold text-slate-900">#{selected.id.slice(0, 8)}</div>
                <div className="text-sm text-slate-500">
                  {new Date(selected.period_start).toLocaleDateString()} - {new Date(selected.period_end).toLocaleDateString()}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${selected.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {selected.status}
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="pb-3">Commande</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Départ</th>
                    <th className="pb-3 text-right">Prix HT</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loadingOrders ? (
                    <tr><td colSpan="4" className="py-4 text-center text-slate-400">Chargement...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 text-center text-slate-400 italic">Aucune commande associée.</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 font-semibold text-slate-900">#{o.id.slice(0, 8)}</td>
                        <td className="py-3 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-slate-500">{o.pickup_city}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">{Number(o.price_ht).toFixed(2)}€</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total TTC</div>
                <div className="text-3xl font-bold text-slate-900">
                  {(orders.reduce((sum, o) => sum + (Number(o.price_ht) || 0), 0) * 1.2).toFixed(2)}€
                </div>
              </div>
              <button onClick={downloadInvoice} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors">
                <Download size={16} />
                Télécharger PDF
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
