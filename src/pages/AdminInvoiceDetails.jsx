import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { downloadInvoicePdf, downloadOrderPdf } from "./adminPdf.js";
import { Loader2 } from "lucide-react";

export default function AdminInvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Invoice
    const { data: inv, error } = await supabase.from('invoices').select('*').eq('id', id).single();

    if (inv) {
      // 2. Fetch Client
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', inv.client_id).single();
      const clientName = profile?.details?.company || profile?.details?.full_name || 'Client';

      const invObj = {
        ...inv,
        client: clientName,
        clientData: profile?.details,
        period: new Date(inv.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        amount: inv.total_ttc,
        status: inv.status === 'paid' ? 'Payée' : (inv.status === 'pending' ? 'À payer' : inv.status)
      };
      setInvoice(invObj);
      setClient(profile?.details || {});

      // 3. Fetch Orders linked to this invoice
      const { data: ords } = await supabase
        .from('orders')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at', { ascending: false });

      if (ords) {
        setOrders(ords.map(o => ({
          id: o.id,
          route: `${o.pickup_city} > ${o.delivery_city}`,
          date: new Date(o.created_at).toLocaleDateString(),
          status: o.status === 'delivered' ? 'Terminée' : o.status,
          total: o.price_ht,
          client: clientName, // For PDF
          client_details: profile?.details, // For PDF
          pickup: o.pickup_address,
          delivery: o.delivery_address,
          vehicle: o.vehicle_type,
          service: o.service_level
        })));
      }
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (!invoice) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Facture introuvable</h1>
          <p className="text-sm text-slate-500">L’identifiant {id} n’existe pas.</p>
        </header>
        <Link to="/admin/invoices" className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Retour aux factures</Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{invoice.id.slice(0, 8)}</h1>
          <p className="text-sm text-slate-500">{invoice.client} • {invoice.period}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${invoice.status === "Payée" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {invoice.status}
          </span>
          <button onClick={() => downloadInvoicePdf(invoice, orders)} className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Télécharger</button>
        </div>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">Commandes liées</div>
          <div className="text-xs text-slate-500">{orders.length} commandes</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2">Commande</th>
                <th className="py-2">Trajet</th>
                <th className="py-2">Date</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Montant</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">{o.id.slice(0, 8)}</td>
                  <td className="py-3 text-slate-700">{o.route}</td>
                  <td className="py-3 text-slate-500">{o.date}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${o.status === "Terminée" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900">{Number(o.total || 0).toFixed(2)}€</td>
                  <td className="py-3">
                    <div className="flex justify-end">
                      <button onClick={() => downloadOrderPdf(o, client)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700">Télécharger BC</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900">
                <td colSpan="3" className="py-4"></td>
                <td className="py-4 text-right font-bold text-slate-400 uppercase text-[10px]">Total TTC</td>
                <td className="py-4 font-bold text-lg text-slate-900">
                  {(orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) * 1.2).toFixed(2)}€
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

