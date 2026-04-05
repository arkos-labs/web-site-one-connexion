import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { OrderFormData } from "./types";

interface AddressFormProps {
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddressChange: (type: 'pickup' | 'delivery', address: string, city: string, postcode: string) => void;
}

export function AddressForm({ formData, onChange, onAddressChange }: AddressFormProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Form Section 1 - Pickup */}
                <div className="space-y-5 relative">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                        <h2 className="text-xl font-bold text-slate-900">Enlèvement</h2>
                    </div>
                    
                    <div className="space-y-4 font-poppins">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse de départ *</label>
                            <AddressAutocomplete
                                value={formData.pickupAddress}
                                onChange={(value) => onAddressChange('pickup', value, formData.pickupCity, formData.pickupPostcode)}
                                onAddressSelect={(suggestion) => onAddressChange('pickup', suggestion.full, suggestion.city, suggestion.postcode)}
                                placeholder="Saisissez l'adresse complète"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none font-medium"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                id="pickupName" name="pickupName" value={formData.pickupName} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Société"
                            />
                            <Input 
                                id="pickupContact" name="pickupContact" value={formData.pickupContact} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Contact"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                id="pickupPhone" name="pickupPhone" type="tel" value={formData.pickupPhone} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Téléphone"
                            />
                            <Input 
                                id="pickupInstructions" name="pickupInstructions" value={formData.pickupInstructions} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Digicode / Étage"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Section 2 - Delivery */}
                <div className="space-y-5 relative">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="h-8 w-8 rounded-full bg-[#ed5518] text-white flex items-center justify-center font-bold text-sm">2</div>
                        <h2 className="text-xl font-bold text-slate-900">Livraison</h2>
                    </div>
                    
                    <div className="space-y-4 font-poppins">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse d'arrivée *</label>
                            <AddressAutocomplete
                                value={formData.deliveryAddress}
                                onChange={(value) => onAddressChange('delivery', value, formData.deliveryCity, formData.deliveryPostcode)}
                                onAddressSelect={(suggestion) => onAddressChange('delivery', suggestion.full, suggestion.city, suggestion.postcode)}
                                placeholder="Saisissez l'adresse complète"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none font-medium"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                id="deliveryName" name="deliveryName" value={formData.deliveryName} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Société"
                            />
                            <Input 
                                id="deliveryContact" name="deliveryContact" value={formData.deliveryContact} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Contact"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                id="deliveryPhone" name="deliveryPhone" type="tel" value={formData.deliveryPhone} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Téléphone"
                            />
                            <Input 
                                id="deliveryInstructions" name="deliveryInstructions" value={formData.deliveryInstructions} onChange={onChange} 
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none bg-white font-medium"
                                placeholder="Digicode / Étage"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
