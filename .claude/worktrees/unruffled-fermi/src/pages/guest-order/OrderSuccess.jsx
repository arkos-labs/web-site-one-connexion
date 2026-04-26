import { Link } from "react-router-dom";
import { CheckCircle2, Truck, Package } from "lucide-react";

export function OrderSuccess({ form, price }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm ring-1 ring-slate-100 text-center space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#ed5518] text-white mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Commande bien reçue !</h2>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                        Votre demande a été transmise. Un email de confirmation sera envoyé à <strong>{form.guestEmail}</strong>. Notre équipe de dispatch s'occupe de tout.
                    </p>
                </div>
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-6 md:p-8 text-left space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><Truck className="text-[#ed5518]" size={24} /></div>
                            <div>
                                <div className="font-bold text-slate-900 capitalize">{form.vehicle} • {form.service}</div>
                                <div className="text-xs text-slate-500 font-medium">Le {new Date(form.date).toLocaleDateString('fr-FR')} de {form.pickupTime} à {form.deliveryDeadline}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-slate-900">{Number(price).toFixed(2)}€ <span className="text-xs font-bold text-slate-400">HT</span></div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enlèvement</div>
                            <div className="text-sm font-bold text-slate-900">{form.pickupName || 'Individuel'}</div>
                            <div className="text-xs text-slate-600 leading-relaxed">{form.pickup}</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Livraison</div>
                            <div className="text-sm font-bold text-slate-900">{form.deliveryName || 'Individuel'}</div>
                            <div className="text-xs text-slate-600 leading-relaxed">{form.delivery}</div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Package size={14} className="text-slate-400" />
                        {form.packageType} {form.packageWeight ? `(${form.packageWeight} kg)` : ''}
                    </div>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                    <Link to="/" className="w-full rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white text-center hover:bg-[#ed5518]">Retour à l'accueil</Link>
                </div>
            </div>
        </div>
    );
}
