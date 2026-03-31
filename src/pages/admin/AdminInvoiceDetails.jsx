import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { generateInvoicePDF, generateOrderPDF } from "@/lib/pdf-generator";
import {
  Loader2, Download, CheckCircle2, ChevronRight,
  FileText, User, Calendar, TrendingUp
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

export default function AdminInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (inv) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', inv.client_id).single();
      const clientName = profile?.details?.company || profile?.details?.full_name || 'Client';
      setInvoice({
        ...inv,
        client: clientName,
        clientData: profile?.details,
        period: new Date(inv.period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        amount: inv.total_ttc,
        status: inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'À payer' : inv.status,
        isPaid: inv.status === 'paid',
      });
      setClient(profile?.details || {});

      const { data: ords } = await supabase.from('orders').select('*').eq('invoice_id', id).order('created_at', { ascending: false });
      if (ords) {
        setOrders(ords.map(o => ({
          id: o.id, route: `${o.pickup_city} → ${o.delivery_city}`,
          date: new Date(o.created_at).toLocaleDateString('fr-FR'),
          status: o.status === 'delivered' ? 'Terminée' : o.status,
          total: o.price_ht,
          client: clientName, client_details: profile?.details,
          pickup: o.pickup_address, delivery: o.delivery_address,
          vehicle: o.vehicle_type, service: o.service_level,
          pickup_name: o.pickup_name
        })));
      }
    }
    setLoading(false);
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    if (!error) fetchData();
    else alert("Erreur: " + error.message);
    setMarkingPaid(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement…</span>
    </div>
  );

  if (!invoice) return (
    <div className="py-20 text-center">
      <div className="text-2xl font-black text-slate-300 mb-3">Facture introuvable</div>
      <button onClick={() => navigate('/admin/invoices')} className="text-sm font-bold text-[#ed5518] hover:underline">← Retour aux factures</button>
    </div>
  );

  const totalHT = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalTTC = totalHT * 1.2;

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={`FAC-${invoice.id.slice(0, 8)}`}
        subtitle={`${invoice.client} · ${invoice.period}`}
        backTo="/admin/invoices"
        actions={
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${invoice.isPaid ? "bg-[#ed5518] text-[#ed5518] border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {invoice.status}
            </span>
            {!invoice.isPaid && (
              <button
                onClick={handleMarkPaid}
                disabled={markingPaid}
                className="flex items-center gap-2 rounded-xl bg-[#ed5518] px-5 py-2.5 text-xs font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                {markingPaid ? "En cours…" : "Marquer payée"}
              </button>
            )}
            <button
              onClick={() => downloadInvoicePdf(invoice, orders)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={14} /> Télécharger PDF
            </button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FileText size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Référence", value: `FAC-${invoice.id.slice(0, 8)}` },
          { icon: <User size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Client", value: invoice.client },
          { icon: <Calendar size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Période", value: invoice.period },
          { icon: <TrendingUp size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Total TTC", value: `${totalTTC.toFixed(2)}€` },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
            <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
            <div className="text-sm font-black text-slate-900 truncate">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commandes liées · {orders.length} ligne(s)</div>
          <div className="text-xs font-black text-slate-900 tabular-nums">Total HT : {totalHT.toFixed(2)}€</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                <th className="px-8 py-4">Ref.</th>
                <th className="px-8 py-4">Trajet</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Statut</th>
                <th className="px-8 py-4">Montant HT</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm font-bold text-slate-300">Aucune commande liée à cette facture.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 font-mono">
                      #{o.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-700">{o.route}</td>
                  <td className="px-8 py-5 text-xs text-slate-500">{o.date}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${o.status === "Terminée" ? "bg-[#ed5518] text-[#ed5518]" : "bg-slate-100 text-slate-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 tabular-nums">{Number(o.total || 0).toFixed(2)}€</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => downloadOrderPdf(o, client)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-200 transition-all"
                      >
                        <Download size={12} /> BC
                      </button>
                      <button
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white hover:bg-[#ed5518] transition-all"
                      >
                        Détails <ChevronRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {orders.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td colSpan={4} />
                  <td className="px-8 py-5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total HT</div>
                    <div className="text-lg font-black text-slate-900 tabular-nums">{totalHT.toFixed(2)}€</div>
                    <div className="text-xs text-slate-500 mt-0.5 tabular-nums">+TVA 20% = <strong className="text-slate-900">{totalTTC.toFixed(2)}€</strong></div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Client details card */}
      {Object.keys(client).length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Informations client</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Entreprise", value: client.company },
              { label: "Contact", value: client.contact_name || client.full_name },
              { label: "Email", value: client.email },
              { label: "Téléphone", value: client.phone },
              { label: "Adresse", value: client.address },
              { label: "Ville", value: client.city },
              { label: "SIRET", value: client.siret },
              { label: "TVA", value: client.tva },
            ].map((item, i) => item.value ? (
              <div key={i} className="rounded-xl bg-slate-50 p-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</div>
                <div className="text-xs font-bold text-slate-900 truncate">{item.value}</div>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

