import { downloadInvoicePdf } from "./adminPdf.js";

export default function AdminClientInvoicesPanel({ invoices = [], ordersAll = [] }) {
  const sorted = [...invoices].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-slate-900">Factures ({sorted.length})</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-2">Facture</th>
              <th className="py-2">Période</th>
              <th className="py-2">Émise</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Montant</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((i) => {
              const amount = i.total_ttc || i.amount || 0;
              const periodLabel = i.period_start ? new Date(i.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : (i.period || '—');
              const issuedAt = i.created_on || i.created_at ? new Date(i.created_at || i.created_on).toLocaleDateString() : (i.issuedAt || '—');
              const statusLabel = i.status === 'paid' ? 'Payée' : (i.status === 'pending' ? 'À payer' : i.status);

              return (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">#{i.id.slice(0, 8)}</td>
                  <td className="py-3 text-slate-700 capitalize">{periodLabel}</td>
                  <td className="py-3 text-slate-500">{issuedAt}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusLabel === "Payée" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900">{Number(amount).toFixed(2)}€</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        const relatedOrders = ordersAll.filter((o) => i.id === o.invoice_id);
                        downloadInvoicePdf(i, relatedOrders);
                      }}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">Aucune facture trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

