import { ShieldCheck, Truck, Package, Loader2 } from "lucide-react";

export function Step4Resume({ form, price, calculatingPrice }) {
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
                        {calculatingPrice ? <Loader2 className="animate-spin text-slate-400" /> : <div className="text-3xl font-black text-slate-900 tabular-nums">{Number(price).toFixed(2)}€ <span className="text-xs font-bold text-slate-400">HT</span></div>}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Enlèvement</div>
                        <div className="text-xs font-bold text-slate-900">{form.pickupName || '—'}</div>
                        <div className="text-[11px] text-slate-600">{form.pickup}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Livraison</div>
                        <div className="text-xs font-bold text-slate-900">{form.deliveryName || '—'}</div>
                        <div className="text-[11px] text-slate-600">{form.delivery}</div>
                    </div>
                </div>
                <div className="border-t border-slate-200 pt-4 flex items-center gap-x-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900"><Package size={16} className="text-slate-400" />{form.packageType} {form.packageWeight ? `(${form.packageWeight} kg)` : ''}</div>
                    <div className="text-xs text-slate-500">Client : <strong>{form.guestEmail}</strong></div>
                </div>
            </div>
        </div>
    );
}
