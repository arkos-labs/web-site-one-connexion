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
                <h2 className="text-2xl font-bold text-gray-900">Type & Détails</h2>
                <p className="text-gray-500">Que transportons-nous ?</p>
            </div>

            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="packageType" className="mb-2 block">Type de colis *</Label>
                            <Select
                                value={formData.packageType}
                                onValueChange={(value) => updateFormData({ packageType: value })}
                            >
                                <SelectTrigger>
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
                            <Label htmlFor="weight" className="mb-2 block">Poids estimé (kg)</Label>
                            <Input
                                id="weight"
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.weight}
                                onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="dimensions" className="mb-2 block">Dimensions (L x l x h)</Label>
                            <Input
                                id="dimensions"
                                placeholder="Ex: 30x20x10 cm"
                                value={formData.dimensions}
                                onChange={(e) => updateFormData({ dimensions: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes" className="mb-2 block">Notes de livraison</Label>
                        <Textarea
                            id="notes"
                            placeholder="Instructions spéciales, code d'accès, étage..."
                            className="h-[200px] resize-none"
                            value={formData.notes}
                            onChange={(e) => updateFormData({ notes: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
