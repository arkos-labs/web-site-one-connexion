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
            <h3 className="text-lg font-bold text-gray-900 font-poppins">Récapitulatif</h3>

            {/* Client (if present) */}
            {formData.clientName && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Client</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formData.clientName}</p>
                    {formData.clientCompany && (
                        <p className="text-sm text-gray-500">{formData.clientCompany}</p>
                    )}
                </div>
            )}

            {/* Trajet */}
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                {/* Pickup */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
                    <div className="mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Retrait</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {formData.pickupAddress || "—"}
                    </p>
                    {formData.pickupContact && (
                        <p className="text-xs text-gray-500 mt-1">{formData.pickupContact}</p>
                    )}
                </div>

                {/* Delivery */}
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-green-500 bg-white" />
                    <div className="mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {formData.deliveryAddress || "—"}
                    </p>
                    {formData.deliveryContact && (
                        <p className="text-xs text-gray-500 mt-1">{formData.deliveryContact}</p>
                    )}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Horaire</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 truncate">
                        {getScheduleText()}
                    </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Colis</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 truncate capitalize">
                        {formData.packageType}
                    </p>
                </div>
            </div>

            {/* Formula & Price */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 uppercase">
                            {formData.formula}
                        </span>
                    </div>
                </div>

                {selectedPrice ? (
                    <div className="pt-3 border-t border-blue-100">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-blue-700">Total estimé</span>
                            <span className="text-2xl font-bold text-blue-900">
                                {selectedPrice.totalEuros.toFixed(2)}€
                            </span>
                        </div>
                        <p className="text-xs text-blue-400 text-right mt-1">
                            {selectedPrice.totalBons.toFixed(2)} bons
                        </p>
                    </div>
                ) : (
                    <div className="pt-3 border-t border-blue-100 text-center">
                        <p className="text-xs text-blue-400 italic">
                            Prix calculé à l'étape formule
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
