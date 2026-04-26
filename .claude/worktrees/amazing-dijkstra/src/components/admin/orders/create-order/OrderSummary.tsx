import { ShieldCheck, Truck, Package, Loader2, MapPin, Clock } from "lucide-react";
import { OrderFormData } from "./types";
import { FormuleNew, CalculTarifaireResult } from "@/utils/pricingEngine";

export function OrderSummary({
    formData,
    pricingResults,
    orderType
}: {
    formData: OrderFormData;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    orderType: 'immediate' | 'deferred';
}) {
    const selectedPrice = pricingResults ? pricingResults[formData.formula] : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto font-poppins">
            <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ed5518] text-white mb-4 shadow-xl shadow-[#ed5518]/30">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Résumé de la commande</h2>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">Vérifiez les informations avant la validation finale.</p>
            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-100 p-8 space-y-8 text-left shadow-sm">
                {/* Header overview: Service & Price */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                            <Truck size={24} />
                        </div>
                        <div>
                            <div className="font-black text-slate-900 uppercase tracking-widest text-sm">
                                {formData.vehicle} • {formData.formula === 'normal' ? 'Normal' : formData.formula === 'exclu' ? 'Exclu' : 'Super'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                {formData.pickupDate ? `Le ${new Date(formData.pickupDate).toLocaleDateString('fr-FR')}` : 'Aujourd\'hui'} • {formData.pickupTime || '--:--'} à {formData.deliveryDeadline || '--:--'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        {selectedPrice ? (
                            <div className="text-3xl font-black text-slate-900 tabular-nums">
                                {selectedPrice.totalEuros.toFixed(2)}€ 
                                <span className="text-xs font-bold text-slate-400 ml-1">HT</span>
                            </div>
                        ) : (
                            <Loader2 className="animate-spin text-slate-400 w-8 h-8 ml-auto" />
                        )}
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Enlèvement</div>
                        <div className="text-sm font-black text-slate-900 underline underline-offset-4 uppercase">
                            {formData.pickupName || 'Société —'}
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 leading-snug uppercase">
                            {formData.pickupAddress}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                            {formData.pickupContact} • {formData.pickupPhone}
                        </div>
                        {formData.pickupInstructions && (
                            <div className="text-[10px] text-slate-400 font-bold uppercase italic">
                                Digicode : {formData.pickupInstructions}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed5518]">Livraison</div>
                        <div className="text-sm font-black text-slate-900 underline underline-offset-4 uppercase">
                            {formData.deliveryName || 'Société —'}
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 leading-snug uppercase">
                            {formData.deliveryAddress}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                            {formData.deliveryContact} • {formData.deliveryPhone}
                        </div>
                        {formData.deliveryInstructions && (
                            <div className="text-[10px] text-[#ed5518] font-bold uppercase italic">
                                Digicode : {formData.deliveryInstructions}
                            </div>
                        )}
                    </div>
                </div>

                {/* Nature & Details */}
                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                    <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nature du transport</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Truck className="text-[#ed5518]" size={16} />
                                <div className="text-[11px] font-black text-slate-900 uppercase">{formData.vehicle} ({formData.packageType})</div>
                            </div>
                            {formData.packageWeight && (
                                <div className="flex items-center gap-3">
                                    <Package className="text-slate-400" size={16} />
                                    <div className="text-[11px] font-black text-slate-900 uppercase">Poids : {formData.packageWeight} kg</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Détails colis</div>
                        <div className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                            {formData.packageDesc || "Aucun descriptif fourni"}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {formData.notes && (
                    <div className="pt-6 border-t border-slate-200">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed5518] mb-3">Note sur l'horaire de livraison</div>
                        <div className="text-[11px] font-bold text-slate-900 p-4 bg-white rounded-2xl border border-orange-100 italic shadow-inner">
                            « {formData.notes} »
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
