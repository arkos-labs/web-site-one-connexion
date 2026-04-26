import { ShieldCheck, Truck, Package, Loader2, ArrowRight } from "lucide-react";

export function Step3Review({ form, price, calculatingPrice }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#ed5518]/10 text-[#ed5518] mb-4">
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-display italic text-noir">Vérification Finale.</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/40">Confirmez les détails de votre expédition</p>
      </div>

      <div className="rounded-[2rem] bg-noir/[0.02] border border-noir/5 p-8 md:p-12 space-y-10 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-noir/5 pb-10">
          <div className="flex items-start gap-5">
            <div className="h-12 w-12 rounded-xl bg-white border border-noir/5 flex items-center justify-center shadow-sm">
              <Truck className="text-noir/40" size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-noir uppercase tracking-[0.2em]">{form.vehicle} • {form.service}</div>
              <div className="text-xs font-medium text-noir/40">Le {new Date(form.date).toLocaleDateString('fr-FR')} entre {form.pickupTime} et {form.deliveryDeadline}</div>
            </div>
          </div>

          <div className="text-left md:text-right">
            {calculatingPrice ? (
              <Loader2 className="animate-spin text-noir/20 w-10 h-10 md:ml-auto" />
            ) : (
              price ? (
                <div className="space-y-1">
                  <div className="text-5xl font-display italic text-noir tabular-nums">{Number(price).toFixed(2)}€</div>
                  <div className="text-[9px] font-bold text-noir/40 uppercase tracking-[0.4em]">Montant Total HT</div>
                </div>
              ) : (
                <div className="text-xs font-bold text-red-500 uppercase tracking-widest">Calcul impossible</div>
              )
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-4 bg-noir/10"></div>
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40">Enlèvement</div>
            </div>
            <div className="pl-7 space-y-2">
              <div className="text-sm font-bold text-noir">{form.pickupName || 'Société —'}</div>
              <div className="text-xs font-medium text-noir/60 leading-relaxed max-w-[200px]">{form.pickup}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-noir/30 italic">{form.pickupContact}</span>
                <span className="h-1 w-1 rounded-full bg-noir/10"></span>
                <span className="text-[10px] font-bold text-noir/30">{form.pickupPhone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-4 bg-[#ed5518]/20"></div>
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ed5518]/60">Livraison</div>
            </div>
            <div className="pl-7 space-y-2">
              <div className="text-sm font-bold text-noir">{form.deliveryName || 'Société —'}</div>
              <div className="text-xs font-medium text-noir/60 leading-relaxed max-w-[200px]">{form.delivery}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-noir/30 italic">{form.deliveryContact}</span>
                <span className="h-1 w-1 rounded-full bg-noir/10"></span>
                <span className="text-[10px] font-bold text-noir/30">{form.deliveryPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-noir/5">
          <div className="space-y-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40">Expédition</div>
            <div className="flex items-center gap-4 pl-1">
              <div className="text-xs font-bold text-noir uppercase tracking-tight">{form.packageType} {form.packageWeight ? `(${form.packageWeight}kg)` : ''}</div>
              <ArrowRight size={12} className="text-noir/20" />
              <div className="text-xs font-medium text-noir/40 italic">{form.packageDesc || "Aucun descriptif"}</div>
            </div>
          </div>

          {form.deliveryScheduleNotes && (
            <div className="space-y-4">
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ed5518]/60">Note Spécifique</div>
              <div className="text-[11px] font-medium text-noir/60 bg-white p-4 rounded-xl border border-noir/5 italic">
                « {form.deliveryScheduleNotes} »
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
