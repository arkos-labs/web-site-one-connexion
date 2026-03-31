import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { User, Phone, MapPin } from "lucide-react";
import { OrderFormData } from "./types";

interface AddressFormProps {
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddressChange: (type: 'pickup' | 'delivery', address: string, city: string) => void;
}

export function AddressForm({ formData, onChange, onAddressChange }: AddressFormProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-accent-main" />
                    </div>
                    <h3 className="text-base font-semibold text-[#ed5518]">Informations d'enlèvement</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <AddressAutocomplete
                            value={formData.pickupAddress}
                            onChange={(value) => onAddressChange('pickup', value, formData.pickupCity)}
                            onAddressSelect={(suggestion) => onAddressChange('pickup', `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`, suggestion.city)}
                            label="Adresse d'enlèvement *"
                            placeholder="123 Rue de Paris, 75001 Paris"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="pickupContact" className="flex items-center gap-2 mb-1"><User className="h-4 w-4" />Contact</Label>
                        <Input id="pickupContact" name="pickupContact" value={formData.pickupContact} onChange={onChange} />
                    </div>
                    <div>
                        <Label htmlFor="pickupPhone" className="flex items-center gap-2 mb-1"><Phone className="h-4 w-4" />Téléphone</Label>
                        <Input id="pickupPhone" name="pickupPhone" type="tel" value={formData.pickupPhone} onChange={onChange} />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-success" />
                    </div>
                    <h3 className="text-base font-semibold text-[#ed5518]">Informations de livraison</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <AddressAutocomplete
                            value={formData.deliveryAddress}
                            onChange={(value) => onAddressChange('delivery', value, formData.deliveryCity)}
                            onAddressSelect={(suggestion) => onAddressChange('delivery', `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`, suggestion.city)}
                            label="Adresse de livraison *"
                            placeholder="456 Avenue des Champs, 92100 Boulogne"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="deliveryContact" className="flex items-center gap-2 mb-1"><User className="h-4 w-4" />Contact</Label>
                        <Input id="deliveryContact" name="deliveryContact" value={formData.deliveryContact} onChange={onChange} />
                    </div>
                    <div>
                        <Label htmlFor="deliveryPhone" className="flex items-center gap-2 mb-1"><Phone className="h-4 w-4" />Téléphone</Label>
                        <Input id="deliveryPhone" name="deliveryPhone" type="tel" value={formData.deliveryPhone} onChange={onChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}
