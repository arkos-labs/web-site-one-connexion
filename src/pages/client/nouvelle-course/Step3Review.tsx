import { ShieldCheck, Truck, Package, Loader2 } from "lucide-react";

export function Step3Review({ form, price, calculatingPrice }) {
  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ed5518] text-white mb-4"><ShieldCheck size={32} /></div>
        <h2 className="text-2xl font-black text-slate-900">Résumé de la commande</h2>
        <p className="text-sm font-medium text-slate-500">Vérifiez vos informations avant de valider.</p>
      </div>
      <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Truck className="text-slate-400" size={24} />
            <div>
              <div className="font-bold text-slate-900 capitalize">{form.vehicle} • {form.service}</div>
              <div className="text-xs text-slate-500">Le {new Date(form.date).toLocaleDateString('fr-FR')} de {form.pickupTime} à {form.deliveryDeadline}</div>
            </div>
          </div>
          <div className="text-right">
            {calculatingPrice ? <Loader2 className="animate-spin text-slate-400 ml-auto w-8 h-8" /> : (price ? <div className="text-3xl font-black text-slate-900 tabular-nums">{Number(price).toFixed(2)}€ <span className="text-xs font-bold text-slate-400">HT</span></div> : <div className="text-sm font-bold text-red-500">Erreur prix</div>)}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enlèvement</div>
            <div className="text-sm font-bold text-slate-900 underline block">{form.pickupName || 'Société —'}</div>
            <div className="text-xs text-slate-600 leading-snug">{form.pickup}</div>
            <div className="text-[10px] text-slate-500 font-bold">{form.pickupContact} • {form.pickupPhone}</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Livraison</div>
            <div className="text-sm font-bold text-slate-900 underline block">{form.deliveryName || 'Société —'}</div>
            <div className="text-xs text-slate-600 leading-snug">{form.delivery}</div>
            <div className="text-[10px] text-slate-500 font-bold">{form.deliveryContact} • {form.deliveryPhone}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <Package className="text-slate-400" size={18} />
          <div className="text-xs font-bold text-slate-900">{form.packageType} {form.packageWeight ? `(Jusqu'à ${form.packageWeight} kg)` : ''}</div>
          {form.packageDesc && <div className="text-xs text-slate-500 italic ml-auto max-w-[200px] truncate">{form.packageDesc}</div>}
        </div>
      </div>
    </div>
  );
}
