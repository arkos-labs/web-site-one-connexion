import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function AdminClientInvoicesPanel({ invoices = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facturation & Factures</div>
        <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {invoices.length} docs
        </div>
      </div>

      <div className="grid gap-3">
        {invoices.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs font-bold text-slate-300 italic">Aucune facture émise</p>
          </div>
        ) : (
          invoices.slice(0, 8).map(inv => (
            <button
              key={inv.id}
              onClick={() => navigate(`/admin/invoices/${inv.id}`)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-[#ed5518] hover:bg-white hover:shadow-sm transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#ed5518]">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">REF: FAC-{inv.id.slice(0, 8)}</div>
                  <div className="text-xs font-black text-slate-900 tabular-nums">
                    {Number(inv.total_ttc || 0).toFixed(2)}€
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {inv.status === 'paid' ? 'Payée' : 'À payer'}
                </span>
                <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))
        )}
        
        {invoices.length > 8 && (
          <button 
            onClick={() => navigate('/admin/invoices')}
            className="text-[9px] font-black text-[#ed5518] uppercase text-center mt-2 hover:underline"
          >
            Voir tout l'historique (+{invoices.length - 8})
          </button>
        )}
      </div>
    </div>
  );
}
