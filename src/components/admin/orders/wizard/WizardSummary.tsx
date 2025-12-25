import { OrderFormData } from "./OrderWizardModal";
import { CalculTarifaireResult, FormuleNew } from "@/utils/pricingEngine";
import { MapPin, Clock, Package, Truck, User } from "lucide-react";

interface WizardSummaryProps {
    formData: OrderFormData;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
}

export const WizardSummary = ({ formData, pricingResults }: WizardSummaryProps) => {
    const selectedPrice = pricingResults ? pricingResults[formData.formula] : null;

    const getScheduleText = () => {
        switch (formData.scheduleType) {
            case 'immediate': return 'Dès que possible';
            case 'deferred': return `${formData.pickupDate || 'jj/mm'} à ${formData.pickupTime || '--:--'}`;
            default: return '—';
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#0B1525] font-serif">Récapitulatif</h3>

            {/* Client (if present) */}
            {formData.clientName && (
                <div className="bg-[#0B1525]/5 p-4 rounded-xl border border-[#0B1525]/10">
                    <div className="flex items-center gap-2 text-[#0B1525]/60 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Client</span>
                    </div>
                    <p className="font-semibold text-[#0B1525]">{formData.clientName}</p>
                    {formData.clientCompany && (
                        <p className="text-sm text-gray-500">{formData.clientCompany}</p>
                    )}
                </div>
            )}

            {/* Trajet */}
            <div className="relative pl-4 border-l-2 border-[#D4AF37]/20 space-y-6">
                {/* Pickup */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-[#D4AF37] bg-white shadow-sm" />
                    <div className="mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Retrait</span>
                    </div>
                    <p className="text-sm font-medium text-[#0B1525] line-clamp-2">
                        {formData.pickupAddress || "—"}
                    </p>
                    {formData.pickupContact && (
                        <p className="text-xs text-gray-500 mt-1">{formData.pickupContact}</p>
                    )}
                </div>

                {/* Delivery */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-[#0B1525] bg-white shadow-sm" />
                    <div className="mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</span>
                    </div>
                    <p className="text-sm font-medium text-[#0B1525] line-clamp-2">
                        {formData.deliveryAddress || "—"}
                    </p>
                    {formData.deliveryContact && (
                        <p className="text-xs text-gray-500 mt-1">{formData.deliveryContact}</p>
                    )}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Horaire</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0B1525] truncate">
                        {getScheduleText()}
                    </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Colis</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0B1525] truncate capitalize">
                        {formData.packageType}
                    </p>
                </div>
            </div>

            {/* Formula & Price */}
            <div className="bg-[#0B1525] p-5 rounded-xl text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm font-medium text-[#D4AF37] uppercase tracking-wider">
                            {formData.formula}
                        </span>
                    </div>
                </div>

                {selectedPrice ? (
                    <div className="pt-3 border-t border-white/10">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-gray-300">Total estimé</span>
                            <span className="text-2xl font-bold text-white">
                                {selectedPrice.totalEuros.toFixed(2)}€
                            </span>
                        </div>
                        <p className="text-xs text-[#D4AF37] text-right mt-1 font-medium">
                            {selectedPrice.totalBons.toFixed(2)} bons
                        </p>
                    </div>
                ) : (
                    <div className="pt-3 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-400 italic">
                            Prix calculé à l'étape formule
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
