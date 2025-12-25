import { OrderFormData } from "../OrderWizardModal";
import { CalculTarifaireResult, FormuleNew } from "@/utils/pricingEngine";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, ArrowLeft, Package } from "lucide-react";

interface StepConfirmationProps {
    formData: OrderFormData;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    onSubmit: () => void;
    onBack: () => void;
}

export const StepConfirmation = ({ formData, pricingResults, onSubmit, onBack }: StepConfirmationProps) => {
    const selectedPrice = pricingResults ? pricingResults[formData.formula] : null;

    const getDispatchMessage = () => {
        if (formData.scheduleType === 'immediate') {
            return "Votre commande sera transmise immédiatement aux coursiers disponibles.";
        } else {
            return "Votre commande sera transmise aux coursiers 45 minutes avant l'heure de prise en charge prévue.";
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0B1525] font-serif">Confirmation</h2>
                <p className="text-gray-500">Vérifiez les détails avant de valider la commande</p>
            </div>

            <div className="space-y-6">
                <div className="bg-[#0B1525]/5 p-6 rounded-xl border border-[#0B1525]/10 flex gap-4 items-start">
                    <div className="bg-[#D4AF37] p-2 rounded-full text-[#0B1525]">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#0B1525] text-lg mb-1">Tout est prêt !</h3>
                        <p className="text-gray-600">{getDispatchMessage()}</p>
                    </div>
                </div>

                {!selectedPrice && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 items-center text-yellow-800">
                        <AlertTriangle className="h-5 w-5" />
                        <p>Attention : Le prix n'a pas pu être calculé automatiquement.</p>
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-[#0B1525]">Résumé rapide</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block mb-1">Départ</span>
                            <span className="font-medium text-[#0B1525]">{formData.pickupCity}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Arrivée</span>
                            <span className="font-medium text-[#0B1525]">{formData.deliveryCity}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Formule</span>
                            <span className="font-medium text-[#0B1525]">{formData.formula}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Prix estimé</span>
                            <span className="font-bold text-[#D4AF37]">
                                {selectedPrice ? `${selectedPrice.totalEuros.toFixed(2)}€` : 'Non calculé'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={onBack} className="hover:bg-gray-50 text-gray-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={!formData.formula}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    <Package className="mr-2 h-5 w-5 text-white" />
                    Créer la commande
                </Button>
            </div>
        </div>
    );
};
