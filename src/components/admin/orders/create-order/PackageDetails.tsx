import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Truck, Clock, Zap, AlertCircle, Loader2 } from "lucide-react";
import { FormuleNew, CalculTarifaireResult } from "@/utils/pricingEngine";
import { OrderFormData } from "./types";

interface PackageDetailsProps {
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => void;
    onFormulaChange: (formula: FormuleNew) => void;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    isCalculating: boolean;
    error: string | null;
    isStandardDisabled: boolean;
}

export function PackageDetails({ 
    formData, 
    onChange, 
    onFormulaChange, 
    pricingResults, 
    isCalculating, 
    error,
    isStandardDisabled
}: PackageDetailsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-[#ed5518]" />
                <h3 className="text-base font-semibold text-[#ed5518]">Détails de la commande</h3>
            </div>

            <div>
                <Label htmlFor="packageType" className="flex items-center gap-2 mb-1"><Package className="h-4 w-4" />Type de colis</Label>
                <select
                    id="packageType"
                    name="packageType"
                    value={formData.packageType}
                    onChange={onChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                    <option value="document">Document / Pli</option>
                    <option value="petit_colis">Petit colis</option>
                    <option value="standard">Standard</option>
                    <option value="fragile">Fragile</option>
                    <option value="volumineux">Volumineux</option>
                </select>
            </div>

            <div>
                {error && <div className="p-2 mb-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2"><AlertCircle className="h-3 w-3" />{error}</div>}
                <Label className="text-sm">Formule de livraison *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                        { id: "NORMAL", label: "Standard", icon: Truck },
                        { id: "EXPRESS", label: "Express", icon: Clock },
                        { id: "URGENCE", label: "Flash", icon: Zap },
                    ].map((f) => {
                        const price = pricingResults ? pricingResults[f.id as FormuleNew] : null;
                        const isDisabled = !pricingResults || !!error || (f.id === "NORMAL" && isStandardDisabled);

                        return (
                            <div
                                key={f.id}
                                className={`rounded-lg border-2 p-2 text-center transition-all ${isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50 bg-gray-50 border-gray-200" : formData.formula === f.id ? "border-[#FFCC00] bg-[#FFCC00]/10 cursor-pointer" : "border-gray-100 hover:border-gray-200 cursor-pointer"}`}
                                onClick={() => !isDisabled && onFormulaChange(f.id as FormuleNew)}
                            >
                                <f.icon className={`h-4 w-4 mx-auto mb-1 ${isDisabled ? "text-gray-300" : formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-400"}`} />
                                <span className={`text-xs font-bold block ${isDisabled ? "text-gray-400" : formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-500"}`}>{f.label}</span>
                                {price && !isDisabled && <span className="text-xs font-bold text-[#0B2D55] mt-1 block">{price.totalEuros.toFixed(2)}€</span>}
                                {isCalculating && <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1 text-gray-400" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <Label htmlFor="notes" className="flex items-center gap-2 mb-1">Notes complémentaires</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={onChange} rows={3} placeholder="Instructions spéciales..." />
            </div>
        </div>
    );
}
