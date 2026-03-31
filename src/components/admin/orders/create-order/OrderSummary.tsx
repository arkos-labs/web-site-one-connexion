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

    const getOrderTypeText = () => {
        switch (orderType) {
            case 'immediate':
                return 'Dès que possible';
            case 'deferred':
                return `${formData.pickupDate || 'jj/mm/aaaa'} à ${formData.pickupTime || '--:--'}`;
            default:
                return '—';
        }
    };

    return (
        <div className="bg-[#F2F6FA] p-4 rounded-xl border-2 border-[#0B2D55]/10">
            <h3 className="text-base font-bold text-[#0B2D55] mb-3 font-poppins">📋 Récapitulatif</h3>

            <div className="space-y-2 text-sm">
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">👤 CLIENT</p>
                    {formData.clientName ? (
                        <div>
                            <p className="text-gray-700 font-semibold">{formData.clientName}</p>
                            {formData.clientCompany && <p className="text-xs text-gray-500">{formData.clientCompany}</p>}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">Aucun client sélectionné</p>
                    )}
                </div>

                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">⏰ HORAIRE</p>
                    <p className="text-gray-700 font-semibold">{getOrderTypeText()}</p>
                </div>

                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 RETRAIT</p>
                    <p className="text-gray-700">{formData.pickupAddress || "—"}</p>
                    {formData.pickupContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.pickupContact}</p>
                    )}
                </div>

                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 LIVRAISON</p>
                    <p className="text-gray-700">{formData.deliveryAddress || "—"}</p>
                    {formData.deliveryContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.deliveryContact}</p>
                    )}
                </div>

                {formData.packageType && (
                    <div className="pb-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">📦 TYPE DE COLIS</p>
                        <p className="text-gray-700 capitalize">{formData.packageType}</p>
                    </div>
                )}

                <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-1">⚡ FORMULE</p>
                    <p className="font-bold text-[#0B2D55] text-base uppercase">
                        {formData.formula || "—"}
                    </p>
                </div>

                {selectedPrice && (
                    <div className="bg-[#FFCC00]/10 p-3 rounded-lg mt-2">
                        <p className="text-xs text-gray-600 mb-1">PRIX TOTAL</p>
                        <p className="text-2xl font-bold text-[#ed5518]">
                            {selectedPrice.totalEuros.toFixed(2)}€
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
