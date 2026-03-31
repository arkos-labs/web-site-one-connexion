import { useState, useEffect } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";

// Modular Components
import { OrderSummary } from "./create-order/OrderSummary";
import { ClientSelection } from "./create-order/ClientSelection";
import { AddressForm } from "./create-order/AddressForm";
import { PackageDetails } from "./create-order/PackageDetails";
import { SchedulingSection } from "./create-order/SchedulingSection";
import { OrderFormData, CreateOrderModalProps } from "./create-order/types";

export const CreateOrderModal = ({ isOpen, onClose, onSubmit }: CreateOrderModalProps) => {
    const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);
    
    const [formData, setFormData] = useState<OrderFormData>({
        clientId: "", clientName: "", clientEmail: "", clientPhone: "", clientCompany: "",
        pickupAddress: "", pickupCity: "", pickupContact: "", pickupPhone: "",
        deliveryAddress: "", deliveryCity: "", deliveryContact: "", deliveryPhone: "",
        packageType: "standard", formula: "NORMAL", pickupDate: "", pickupTime: "", notes: "",
    });

    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);

    // Calc Price Effect
    useEffect(() => {
        const calculerPrix = async () => {
            if (!formData.deliveryAddress || formData.deliveryAddress.length < 10 || !formData.pickupAddress) {
                setPricingResults(null);
                setPricingError(null);
                return;
            }
            setIsCalculatingPrice(true);
            setPricingError(null);
            try {
                const pickupGeocode = await geocoderAdresse(formData.pickupAddress);
                const deliveryGeocode = await geocoderAdresse(formData.deliveryAddress);
                const distanceKm = calculerDistance(
                    pickupGeocode.latitude, pickupGeocode.longitude,
                    deliveryGeocode.latitude, deliveryGeocode.longitude
                );
                const config = await loadPricingConfigCached();
                const results = await calculerToutesLesFormulesAsync(
                    formData.pickupCity, deliveryGeocode.ville, distanceKm * 1000, config
                );
                setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
            } catch (error: any) {
                setPricingError(error.message || "Erreur calcul prix");
                setPricingResults(null);
            } finally {
                setIsCalculatingPrice(false);
            }
        };
        const timeoutId = setTimeout(calculerPrix, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.deliveryAddress, formData.pickupAddress]);

    // Standard formula restriction logic
    useEffect(() => {
        if (orderType === 'immediate') {
            setIsStandardDisabled(true);
        } else if (formData.pickupDate && formData.pickupTime) {
            const delayInMinutes = (new Date(`${formData.pickupDate}T${formData.pickupTime}`).getTime() - Date.now()) / 60000;
            setIsStandardDisabled(delayInMinutes < 60);
        } else {
            setIsStandardDisabled(false);
        }
    }, [orderType, formData.pickupDate, formData.pickupTime]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, pricingResult: pricingResults ? pricingResults[formData.formula] : undefined });
    };

    return (
        <UniversalModal
            isOpen={isOpen} onClose={onClose} title="Créer une commande (Admin)" size="xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="cta" disabled={!formData.pickupAddress || !formData.deliveryAddress || !formData.clientId} onClick={handleSubmit}>
                        Créer la commande
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 h-full">
                <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-10">
                    <ClientSelection 
                        selectedClient={{ name: formData.clientName, email: formData.clientEmail, company: formData.clientCompany, id: formData.clientId }}
                        onClientSelect={(c) => setFormData(prev => ({ 
                            ...prev, clientId: c.id, clientName: `${c.first_name || ''} ${c.last_name || ''}`.trim(), 
                            clientEmail: c.email, clientPhone: c.phone || "", clientCompany: c.company_name || "" 
                        }))}
                        onReset={() => setFormData(prev => ({ ...prev, clientId: "", clientName: "", clientEmail: "" }))}
                    />

                    <AddressForm 
                        formData={formData} 
                        onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                        onAddressChange={(type, addr, city) => setFormData(p => ({ ...p, [`${type}Address`]: addr, [`${type}City`]: city }))}
                    />

                    <PackageDetails 
                        formData={formData} pricingResults={pricingResults} isCalculating={isCalculatingPrice} error={pricingError} isStandardDisabled={isStandardDisabled}
                        onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                        onFormulaChange={(f) => setFormData(p => ({ ...p, formula: f }))}
                    />

                    <SchedulingSection 
                        orderType={orderType} setOrderType={setOrderType} formData={formData}
                        onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                    />
                </div>

                <div className="lg:col-span-1">
                    <OrderSummary formData={formData} pricingResults={pricingResults} orderType={orderType} />
                </div>
            </div>
        </UniversalModal>
    );
};
