import { OrderFormData } from "../OrderWizardModal";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Phone, ArrowRight, ArrowLeft } from "lucide-react";

interface StepDeliveryProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const StepDelivery = ({ formData, updateFormData, onNext, onBack }: StepDeliveryProps) => {
    const isValid = formData.deliveryAddress;

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#0B1525]">Livraison</h2>
                <p className="text-sm text-gray-500">Où devons-nous livrer le colis ?</p>
            </div>

            <div className="flex-1 space-y-4">
                <AddressAutocomplete
                    value={formData.deliveryAddress}
                    onChange={(value) => updateFormData({ deliveryAddress: value })}
                    onAddressSelect={(suggestion) => {
                        const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                        updateFormData({
                            deliveryAddress: fullAddress,
                            deliveryCity: suggestion.city,
                            deliveryLat: suggestion.lat ? parseFloat(suggestion.lat) : undefined,
                            deliveryLng: suggestion.lon ? parseFloat(suggestion.lon) : undefined
                        });
                    }}
                    label="Adresse de livraison *"
                    placeholder="456 Avenue des Champs, 92100 Boulogne"
                    required
                    name="deliveryAddress"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="deliveryContact" className="flex items-center gap-2 mb-1.5 text-xs text-gray-500 uppercase font-semibold">
                            Nom du contact
                        </Label>
                        <Input
                            id="deliveryContact"
                            value={formData.deliveryContact}
                            onChange={(e) => updateFormData({ deliveryContact: e.target.value })}
                            placeholder="Marie Martin"
                            className="h-9 focus-visible:ring-[#0B1525]"
                        />
                    </div>
                    <div>
                        <Label htmlFor="deliveryPhone" className="flex items-center gap-2 mb-1.5 text-xs text-gray-500 uppercase font-semibold">
                            Téléphone
                        </Label>
                        <Input
                            id="deliveryPhone"
                            value={formData.deliveryPhone}
                            onChange={(e) => updateFormData({ deliveryPhone: e.target.value })}
                            placeholder="06 98 76 54 32"
                            className="h-9 focus-visible:ring-[#0B1525]"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-auto flex justify-between border-t border-gray-100">
                <Button variant="outline" onClick={onBack} size="sm" className="hover:bg-gray-50 text-gray-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-6 shadow-md hover:shadow-lg transition-all"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
