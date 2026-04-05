import { useState, useEffect } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { CourseStepper } from "@/pages/client/nouvelle-course/CourseStepper";
import { MapPin, Package, ShieldCheck, User, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Modular Components
import { OrderSummary } from "./create-order/OrderSummary";
import { ClientSelection } from "./create-order/ClientSelection";
import { AddressForm } from "./create-order/AddressForm";
import { PackageDetails } from "./create-order/PackageDetails";
import { OrderFormData, CreateOrderModalProps } from "./create-order/types";

export const CreateOrderModal = ({ isOpen, onClose, onSubmit }: CreateOrderModalProps) => {
    const [step, setStep] = useState(1);
    const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);
    
    const [formData, setFormData] = useState<OrderFormData>({
        clientId: "", clientName: "", clientEmail: "", clientPhone: "", clientCompany: "",
        billingAddress: "", billingCity: "", billingZip: "",
        pickupAddress: "", pickupCity: "", pickupPostcode: "", pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "",
        deliveryAddress: "", deliveryCity: "", deliveryPostcode: "", deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "",
        packageType: "Colis", packageWeight: "", packageDesc: "", vehicle: "voiture",
        formula: "normal", 
        pickupDate: new Date().toISOString().split('T')[0], 
        pickupTime: "09:00", 
        deliveryDeadline: "12:00", 
        notes: "",
    });

    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);

    // Calc Price Effect (RPC 1:1 Client Parity)
    useEffect(() => {
        const calculerPrix = async () => {
            if (!formData.pickupPostcode || !formData.deliveryPostcode) {
                setPricingResults(null);
                setPricingError(null);
                return;
            }
            setIsCalculatingPrice(true);
            setPricingError(null);
            try {
                // Direct mapping to RPC service levels (Parité 1:1 Client)
                const formulaMap: Record<FormuleNew, string> = {
                    'normal': 'normal',
                    'exclu': 'exclu',
                    'super': 'super',
                    'vl_normal': 'normal',
                    'vl_exclu': 'exclu'
                };

                const formulas: FormuleNew[] = ['normal', 'exclu', 'super'];
                const results = await Promise.all(formulas.map(f => 
                    supabase.rpc('calculate_shipping_cost', {
                        p_pickup_postal_code: formData.pickupPostcode,
                        p_delivery_postal_code: formData.deliveryPostcode,
                        p_vehicle_type: formData.vehicle.toLowerCase(),
                        p_service_level: formulaMap[f]
                    })
                ));

                const newResults: Record<FormuleNew, CalculTarifaireResult> = {} as any;
                formulas.forEach((f, idx) => {
                    const price = results[idx].data || 0;
                    newResults[f] = {
                        villeDepart: formData.pickupCity,
                        villeArrivee: formData.deliveryCity,
                        formule: f,
                        distanceKm: 0, // RPC doesn't return distance, set to 0
                        priseEnCharge: 0,
                        supplement: 0,
                        totalBons: 0,
                        totalEuros: price,
                        isParisDansTrajet: false,
                        supplementApplique: false
                    };
                });
                
                setPricingResults(newResults);
            } catch (error: any) {
                setPricingError(error.message || "Erreur calcul prix");
                setPricingResults(null);
            } finally {
                setIsCalculatingPrice(false);
            }
        };
        const timeoutId = setTimeout(calculerPrix, 600);
        return () => clearTimeout(timeoutId);
    }, [formData.deliveryPostcode, formData.pickupPostcode, formData.vehicle]);

    // Automatic formula selection (1:1 Client Parity)
    useEffect(() => {
        if (!formData.pickupTime || !formData.deliveryDeadline) return;
        
        const [ph, pm] = formData.pickupTime.split(':').map(Number);
        const [dh, dm] = formData.deliveryDeadline.split(':').map(Number);
        
        let start = new Date(); start.setHours(ph, pm, 0, 0);
        let end = new Date(); end.setHours(dh, dm, 0, 0);
        if (end < start) end.setDate(end.getDate() + 1);
        
        const diffMinutes = (end.getTime() - start.getTime()) / 60000;
        
        let autoFormula: FormuleNew = "normal";
        if (diffMinutes <= 90) autoFormula = "super";
        else if (diffMinutes <= 180) autoFormula = "exclu";
        
        if (formData.formula !== autoFormula) {
            setFormData(prev => ({ ...prev, formula: autoFormula }));
        }
    }, [formData.pickupTime, formData.deliveryDeadline]);

    const handleSubmit = () => {
        onSubmit({ ...formData, pricingResult: pricingResults ? pricingResults[formData.formula] : undefined });
    };

    const steps = [
        { title: "Client", icon: User },
        { title: "Trajet", icon: MapPin },
        { title: "Détails", icon: Package },
        { title: "Validation", icon: ShieldCheck }
    ];

    const nextStep = () => {
        if (step === 1 && !formData.clientId) return;
        if (step === 2 && (!formData.pickupAddress || !formData.deliveryAddress)) return;
        setStep(s => Math.min(s + 1, steps.length));
    };

    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ClientSelection 
                            selectedClient={{ name: formData.clientName, email: formData.clientEmail, company: formData.clientCompany, id: formData.clientId }}
                            onClientSelect={(c) => {
                                const details = c.details || {};
                                setFormData(prev => ({ 
                                    ...prev, 
                                    clientId: c.id, 
                                    clientName: details.full_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.name || c.email?.split('@')[0], 
                                    clientEmail: c.email || details.email || "", 
                                    clientPhone: c.phone || details.phone || details.phone_number || "", 
                                    clientCompany: details.company || c.company_name || "",
                                    billingAddress: details.address || details.billing_address || c.address || "",
                                    billingCity: details.city || details.billing_city || c.city || "",
                                    billingZip: details.zip || details.postal_code || details.billing_zip || c.postal_code || ""
                                }));
                            }}
                            onReset={() => setFormData(prev => ({ ...prev, clientId: "", clientName: "", clientEmail: "", clientCompany: "", billingAddress: "", billingCity: "", billingZip: "" }))}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AddressForm 
                            formData={formData} 
                            onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                            onAddressChange={(type, addr, city, postcode) => setFormData(p => ({ 
                                ...p, 
                                [`${type}Address`]: addr, 
                                [`${type}City`]: city,
                                [`${type}Postcode`]: postcode 
                            }))}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PackageDetails 
                            formData={formData} pricingResults={pricingResults} isCalculating={isCalculatingPrice} error={pricingError}
                            onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))}
                            setForm={(data) => setFormData(p => ({ ...p, ...data }))}
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <OrderSummary formData={formData} pricingResults={pricingResults} orderType={orderType} />
                    </div>
                );
        }
    };

    return (
        <UniversalModal
            isOpen={isOpen} onClose={onClose} title="Créer une commande" size="xl"
            className="p-0 border-none bg-transparent shadow-none"
        >
            <div className="h-full bg-[#f8fafc] md:p-8 flex flex-col space-y-8 overflow-y-auto">
                <CourseStepper step={step} steps={steps} title="Nouvelle Commande" />
                
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 relative min-h-[500px] flex flex-col">
                    <div className="flex-1">
                        {renderStepContent()}
                    </div>

                    <div className="flex items-center justify-between pt-12 border-t border-slate-50 mt-12">
                        <button 
                            onClick={prevStep} 
                            className={`flex items-center gap-2 px-6 py-3 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-xs ${step === 1 ? 'invisible' : ''}`}
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>

                        <div className="flex items-center gap-4">
                            {step < 4 ? (
                                <button 
                                    onClick={nextStep} 
                                    className="flex items-center gap-3 px-10 py-5 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                                >
                                    Continuer <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit} 
                                    className="px-12 py-5 rounded-[1.5rem] bg-[#ed5518] text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#ed5518]/30 min-w-[200px] flex items-center justify-center"
                                >
                                    Valider la commande
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalModal>
    );
};
