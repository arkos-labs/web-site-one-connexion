import { OrderFormData } from "../OrderWizardModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface StepPackageProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const StepPackage = ({ formData, updateFormData, onNext, onBack }: StepPackageProps) => {
    const isValid = formData.packageType;

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0B1525] font-serif">Type & Détails</h2>
                <p className="text-gray-500">Que transportons-nous ?</p>
            </div>

            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="packageType" className="mb-2 block text-[#0B1525] font-medium">Type de colis *</Label>
                            <Select
                                value={formData.packageType}
                                onValueChange={(value) => updateFormData({ packageType: value })}
                            >
                                <SelectTrigger className="focus:ring-[#0B1525]">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="document">Document / Pli</SelectItem>
                                    <SelectItem value="petit_colis">Petit colis</SelectItem>
                                    <SelectItem value="materiel_sensible">Matériel sensible</SelectItem>
                                    <SelectItem value="medical">Colis médical</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="fragile">Fragile</SelectItem>
                                    <SelectItem value="volumineux">Volumineux</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="weight" className="mb-2 block text-[#0B1525] font-medium">Poids estimé (kg)</Label>
                            <Select
                                value={String(formData.weight || "")}
                                onValueChange={(value) => updateFormData({ weight: parseFloat(value) || 0 })}
                            >
                                <SelectTrigger className="focus:ring-[#0B1525]" id="weight">
                                    <SelectValue placeholder="Sélectionner un poids" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(w => (
                                        <SelectItem key={w} value={String(w)}>{w} kg</SelectItem>
                                    ))}
                                    <SelectItem value="30.1">+ de 30 kg</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="dimensions" className="mb-2 block text-gray-600">Dimensions (L x l x h)</Label>
                            <Input
                                id="dimensions"
                                placeholder="Ex: 30x20x10 cm"
                                value={formData.dimensions}
                                onChange={(e) => updateFormData({ dimensions: e.target.value })}
                                className="focus-visible:ring-[#0B1525]"
                            />
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
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8 shadow-md hover:shadow-lg transition-all"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
