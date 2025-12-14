import { OrderFormData } from "../OrderWizardModal";
import { CalculTarifaireResult, FormuleNew } from "@/utils/pricingEngine";
import { Button } from "@/components/ui/button";
import { Truck, Clock, Zap, Loader2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface StepFormulaProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    isCalculating: boolean;
    error: string | null;
    isStandardDisabled: boolean;
    onNext: () => void;
    onBack: () => void;
}

export const StepFormula = ({
    formData,
    updateFormData,
    pricingResults,
    isCalculating,
    error,
    isStandardDisabled,
    onNext,
    onBack
}: StepFormulaProps) => {

    const formulas = [
        { id: "NORMAL", label: "Standard", icon: Truck, desc: "Économique" },
        { id: "EXPRESS", label: "Express", icon: Clock, desc: "Prioritaire" },
        { id: "URGENCE", label: "Flash", icon: Zap, desc: "Immédiat" },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Formule</h2>
                <p className="text-sm text-gray-500">Choisissez la rapidité</p>
            </div>

            <div className="flex-1 space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formulas.map((f) => {
                        const price = pricingResults ? pricingResults[f.id as FormuleNew] : null;
                        const isSelected = formData.formula === f.id;
                        const isDisabled = f.id === "NORMAL" && isStandardDisabled;

                        return (
                            <div
                                key={f.id}
                                onClick={() => {
                                    if (!isDisabled) {
                                        updateFormData({ formula: f.id as FormuleNew });
                                    }
                                }}
                                className={`relative rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 group
                                    ${isDisabled
                                        ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 grayscale"
                                        : isSelected
                                            ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 cursor-pointer"
                                            : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 cursor-pointer"
                                    }
                                `}
                            >
                                {isDisabled && (
                                    <div className="absolute top-2 right-2">
                                        <AlertCircle className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                    ${isDisabled
                                        ? "bg-gray-200 text-gray-400"
                                        : isSelected
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-white"
                                    }
                                `}>
                                    <f.icon className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className={`font-bold text-sm ${isDisabled
                                        ? "text-gray-500"
                                        : isSelected
                                            ? "text-blue-900"
                                            : "text-gray-900"
                                        }`}>
                                        {f.label}
                                    </h3>
                                    <p className="text-xs text-gray-500">{f.desc}</p>
                                </div>

                                <div className="mt-1">
                                    {isCalculating ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    ) : price && !isDisabled ? (
                                        <div>
                                            <p className={`text-lg font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                                {price.totalEuros.toFixed(2)}€
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">
                                            {isDisabled ? "Non disponible" : "--"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isStandardDisabled && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <p>La formule Standard n'est pas disponible pour les courses immédiates ou urgentes (moins de 1h).</p>
                    </div>
                )}
            </div>

            <div className="pt-6 mt-auto flex justify-between border-t border-gray-100">
                <Button variant="outline" onClick={onBack} size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!formData.formula}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
