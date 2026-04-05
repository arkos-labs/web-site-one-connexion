import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, Truck, Info, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { OrderFormData } from "./types";
import { FormuleNew, CalculTarifaireResult } from "@/utils/pricingEngine";

interface PackageDetailsProps {
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    isCalculating: boolean;
    error: string | null;
    setForm: (data: Partial<OrderFormData>) => void;
}

export function PackageDetails({ 
    formData, 
    onChange, 
    pricingResults, 
    isCalculating, 
    error,
    setForm
}: PackageDetailsProps) {
    const vehicles = ["Moto", "Voiture"];

    const activePricing = pricingResults && formData.formula ? pricingResults[formData.formula] : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-poppins text-left">
            <div className="grid md:grid-cols-2 gap-10">
                {/* Planification */}
                <div className="space-y-5">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-tight">Planification</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date</label>
                            <Input 
                                type="date" name="pickupDate" value={formData.pickupDate} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enlèvement</label>
                            <Input 
                                type="time" name="pickupTime" value={formData.pickupTime} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Délai Max</label>
                            <Input 
                                type="time" name="deliveryDeadline" value={formData.deliveryDeadline} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white focus:ring-2 focus:ring-[#ed5518] outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Commentaire sur l'horaire (optionnel)</label>
                        <Textarea 
                            name="notes" 
                            value={formData.notes} 
                            onChange={onChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none min-h-[80px]" 
                            placeholder="Ex: Ne pas livrer entre 12h et 14h, appeler avant d'arriver..."
                        />
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-4 border border-[#ed5518] flex items-start gap-3 mt-4 text-[#ed5518] text-[11px] font-bold leading-relaxed shadow-sm">
                        <Info size={18} className="shrink-0" />
                        <p>Le niveau de service (Normal, Super, Exclu) est calculé automatiquement selon le délai entre l'enlèvement et la livraison.</p>
                    </div>
                </div>

                {/* Nature du transport */}
                <div className="space-y-5">
                    <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-tight">Nature du transport</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            {vehicles.map(v => (
                                <button 
                                    key={v} 
                                    type="button"
                                    onClick={() => setForm({ vehicle: v.toLowerCase() })} 
                                    className={`flex-1 py-4 px-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${
                                        formData.vehicle === v.toLowerCase() 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type de colis</label>
                                <select 
                                    name="packageType" 
                                    value={formData.packageType} 
                                    onChange={onChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white"
                                >
                                    {["Pli", "Colis", "Document", "Carton", "Palette"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Poids approximatif</label>
                                <select 
                                    name="packageWeight" 
                                    value={formData.packageWeight} 
                                    onChange={onChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white"
                                >
                                    <option value="">Poids : Non spécifié</option>
                                    <option value="1">- de 1 kg</option>
                                    <option value="5">1 à 5 kg</option>
                                    <option value="10">5 à 10 kg</option>
                                    <option value="30">10 à 30 kg</option>
                                    <option value="+30">+ de 30 kg</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contenu du colis</label>
                            <Input 
                                name="packageDesc" 
                                value={formData.packageDesc} 
                                onChange={onChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-white outline-none" 
                                placeholder="Ex: Documents, Ordinateur..." 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Price display (calculated automatically) */}
            {(activePricing || isCalculating) && (
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Commande (Calculé)</h4>
                        <div className="flex items-center gap-3">
                            <div className="bg-[#ed5518]/10 text-[#ed5518] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Formule {formData.formula === 'normal' ? 'Normal' : formData.formula === 'exclu' ? 'Exclu' : 'Super'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        {isCalculating ? (
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" /> Calcul en cours...
                            </div>
                        ) : activePricing && (
                            <div className="flex items-center gap-6">
                                <div className="text-3xl font-black text-slate-900">{activePricing.totalEuros.toFixed(2)}€ <span className="text-xs font-bold text-slate-400 ml-1">HT</span></div>
                                <div className="h-14 w-14 rounded-2xl bg-[#ed5518] flex items-center justify-center text-white shadow-lg shadow-[#ed5518]/20">
                                    <ShieldCheck size={28} />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="text-[10px] font-bold text-red-500 mt-2">{error}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
