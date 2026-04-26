import { useEffect, useState } from "react";
// jsPDF loaded via pdfGenerator
import { supabase } from "../../lib/supabase";
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
  const [orders, setOrders] = useState([]);
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

        const { data: prof } = await supabase
          .from('profiles')
          .select('details, address, city, postal_code, email, company_name')
          .eq('id', user.id)
          .single();
        if (prof) {
          setProfile({
            ...(prof.details || {}),
            address: prof.address,
            city: prof.city,
            postal_code: prof.postal_code,
            email: prof.email,
            company_name: prof.company_name
          });
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selected) {
      setOrders([]);
      return;
    }

    const fetchInvoiceOrders = async () => {
      setLoadingOrders(true);
      const { data: { user } } = await supabase.auth.getUser();

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
    const { generateInvoicePdf } = await import("../../lib/pdf-generator");

    const info = {
      name: profile?.full_name || profile?.contact_name || "",
      firstName: (profile?.full_name || "").split(' ')[0] || "",
      lastName: (profile?.full_name || "").split(' ').slice(1).join(' ') || "",
      email: profile?.email || "",
      company: profile?.company || "",
      billingAddress: profile?.address || "",
      billingCity: profile?.city || "",
      billingZip: profile?.zip || profile?.postal_code || ""
    };

    generateInvoicePdf({ ...selected, period: periodStr }, orders, info);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Accès aux archives</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-6xl font-display italic text-noir">Mes Factures.</h1>
          <p className="text-noir/40 font-medium tracking-wide">Documents comptables et paiements.</p>
        </header>

        <div className="p-20 rounded-[3rem] border border-noir/5 bg-white/50 flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full border border-noir/5 flex items-center justify-center text-noir/10">
            <FileText size={40} strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display italic text-noir">Tout est en ordre.</h3>
            <p className="text-sm text-noir/40 max-w-xs mx-auto">
              Vos factures apparaîtront ici automatiquement à la fin de chaque période d'activité.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body pb-20">
      <header className="mb-16 space-y-4 border-b border-noir/5 pb-10">
        <h1 className="text-6xl font-display italic text-noir leading-none">
          Mes <span className="text-[#ed5518]">Factures.</span>
        </h1>
        <p className="text-noir/40 font-medium tracking-[0.1em]">Gérez vos documents financiers et votre comptabilité.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Sidebar Historique */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30 flex items-center gap-3 px-2">
            Archives <span className="h-px flex-1 bg-noir/5"></span>
          </h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelected(inv)}
                className={`w-full group relative flex items-center justify-between rounded-2xl p-6 transition-all border ${selected?.id === inv.id
                  ? "bg-noir text-white border-noir shadow-xl shadow-noir/20"
                  : "bg-white text-noir border-noir/5 hover:border-noir/10"
                  }`}
              >
                <div className="text-left space-y-1">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selected?.id === inv.id ? "text-white/40" : "text-noir/30"}`}>
                    {new Date(inv.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-lg font-display italic">#{inv.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border ${inv.status === "paid"
                    ? (selected?.id === inv.id ? "bg-white/10 border-white/10 text-white" : "bg-emerald-50 border-emerald-100 text-emerald-600")
                    : (selected?.id === inv.id ? "bg-[#ed5518] border-[#ed5518] text-white" : "bg-amber-50 border-amber-100 text-amber-600")
                    }`}>
                    {inv.status === 'paid' ? 'Payée' : 'En attente'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Content */}
        {selected && (
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-noir/5 overflow-hidden flex flex-col shadow-sm">
              {/* Facture Header */}
              <div className="p-10 border-b border-noir/5 bg-noir/[0.01] flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/20">Facture de services</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ed5518]"></span>
                  </div>
                  <h2 className="text-4xl font-display italic text-noir leading-none">#{selected.id.slice(0, 8)}</h2>
                  <p className="text-xs text-noir/40 font-medium font-body tracking-wider">
                    {new Date(selected.period_start).toLocaleDateString('fr-FR')} — {new Date(selected.period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <button
                  onClick={downloadInvoice}
                  className="flex items-center gap-4 rounded-xl bg-noir px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#ed5518] transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  <Download size={16} />
                  <span>Exporter (PDF)</span>
                </button>
              </div>

              {/* Table Table */}
              <div className="p-10">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20 border-b border-noir/5">
                      <th className="pb-6 text-left font-bold">Mission</th>
                      <th className="pb-6 text-left font-bold">Date</th>
                      <th className="pb-6 text-left font-bold">Détails</th>
                      <th className="pb-6 text-right font-bold">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-noir/[0.03]">
                    {loadingOrders ? (
                      <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-noir/10" /></td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan="4" className="py-12 text-center text-noir/30 italic text-sm">Aucune activité enregistrée.</td></tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="group hover:bg-noir/[0.01] transition-colors">
                          <td className="py-6 font-display italic text-lg text-noir group-hover:text-[#ed5518] transition-colors">#{o.id.slice(0, 8)}</td>
                          <td className="py-6 text-[11px] font-medium text-noir/50 uppercase tracking-wider">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="py-6 text-[13px] text-noir/60">{o.pickup_city || "Course Locale"}</td>
                          <td className="py-6 text-right font-display italic text-lg text-noir">{Number(o.price_ht).toFixed(2)}€</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Card */}
              <div className="mt-auto p-10 bg-noir text-white flex flex-col md:flex-row md:items-end md:justify-between gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Total Honoraires TTC</p>
                  <p className="text-7xl font-display italic leading-none">
                    {(orders.reduce((sum, o) => sum + (Number(o.price_ht) || 0), 0) * 1.2).toFixed(2)}€
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <p className="text-xs font-bold text-white/20 tracking-widest">Comprenant {(orders.reduce((sum, o) => sum + (Number(o.price_ht) || 0), 0) * 0.2).toFixed(2)}€ de TVA (20%)</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Facturation Terminée</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium tracking-widest italic leading-relaxed text-right md:max-w-xs">
                    Le règlement a été traité sur votre compte client One Connexion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
