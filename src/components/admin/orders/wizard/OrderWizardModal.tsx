import { useState, useEffect } from "react";
import {
    MapPin,
    Package,
    Clock,
    Truck,
    CheckCircle,
} from "lucide-react";
import { WizardSidebar } from "./WizardSidebar";
import { WizardSummary } from "./WizardSummary";
import { StepPickup } from "./steps/StepPickup";
import { StepDelivery } from "./steps/StepDelivery";
import { StepSchedule } from "./steps/StepSchedule";
import { StepPackage } from "./steps/StepPackage";
import { StepFormula } from "./steps/StepFormula";
import { StepConfirmation } from "./steps/StepConfirmation";
import { supabase } from "@/lib/supabase";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { UniversalModal } from "@/components/ui/UniversalModal";

// Types
export type WizardStepId = 'pickup' | 'delivery' | 'schedule' | 'package' | 'formula' | 'confirmation';

export interface OrderFormData {
    // Admin specific
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientCompany: string;

    // Standard order data
    pickupAddress: string;
    pickupCity: string;
    pickupContact: string;
    pickupPhone: string;
    pickupLat?: number;
    pickupLng?: number;

    deliveryAddress: string;
    deliveryCity: string;
    deliveryContact: string;
    deliveryPhone: string;
    deliveryLat?: number;
    deliveryLng?: number;

    packageType: string;
    weight: number;
    dimensions: string;
    formula: FormuleNew | null;
    pickupDate: string;
    pickupTime: string;
    notes: string;
    scheduleType: 'immediate' | 'in1h' | 'deferred';
}

interface OrderWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    mode?: 'admin' | 'client';
}

export const OrderWizardModal = ({ isOpen, onClose, onSubmit, mode = 'admin' }: OrderWizardModalProps) => {
    const [currentStep, setCurrentStep] = useState<WizardStepId>('pickup');
    const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>([]);

    const [formData, setFormData] = useState<OrderFormData>({
        clientId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientCompany: "",
        pickupAddress: "",
        pickupCity: "",
        pickupContact: "",
        pickupPhone: "",
        pickupLat: undefined,
        pickupLng: undefined,
        deliveryAddress: "",
        deliveryCity: "",
        deliveryContact: "",
        deliveryPhone: "",
        deliveryLat: undefined,
        deliveryLng: undefined,
        packageType: "standard",
        weight: 1,
        dimensions: "",
        formula: null,
        pickupDate: "",
        pickupTime: "",
        notes: "",
        scheduleType: 'immediate'
    });

    // Pricing state
    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);

    // État pour savoir si la formule Standard doit être grisée
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    // Clients state (for admin)
    const [clients, setClients] = useState<any[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);

    // Suspension state (for client mode)
    const [isClientSuspended, setIsClientSuspended] = useState(false);
    const [clientSuspensionReason, setClientSuspensionReason] = useState<string | null>(null);

    // Load clients if admin
    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setCurrentStep('pickup');
            setCompletedSteps([]);
            setPricingResults(null);
            setPricingError(null);
            setIsStandardDisabled(false);
            setIsClientSuspended(false);
            setClientSuspensionReason(null);

            setFormData(prev => ({
                ...prev,
                // Reset to default values
                pickupAddress: "",
                pickupCity: "",
                deliveryAddress: "",
                deliveryCity: "",
                deliveryContact: "",
                deliveryPhone: "",
                packageType: "standard",
                weight: 1,
                dimensions: "",
                formula: null,
                pickupDate: "",
                pickupTime: "",
                notes: "",
                scheduleType: 'immediate',
                // Keep client info if needed, or let fetchCurrentClient populate it
                // For admin mode, we might want to clear client info too if we want a fresh start
                // But let's keep it safe and let the specific fetchers handle client data
            }));

            if (mode === 'admin') {
                fetchClients();
                // Also reset client selection for admin
                setFormData(prev => ({
                    ...prev,
                    clientId: "",
                    clientName: "",
                    clientEmail: "",
                    clientPhone: "",
                    clientCompany: "",
                    pickupContact: "",
                    pickupPhone: ""
                }));
            } else if (mode === 'client') {
                fetchCurrentClient();
            }
        }
    }, [isOpen, mode]);

    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const { data } = await supabase
                .from('clients')
                .select('id, first_name, last_name, email, phone, company_name, status, is_suspended, suspended_at, suspension_reason')
                .order('last_name');
            if (data) setClients(data);
        } catch (error) {
            console.error("Error loading clients:", error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    const fetchCurrentClient = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // First try to find client by auth_user_id if that column exists, or id if they are same
            // Based on previous context, we might need to query by id if auth.uid() matches client.id
            // Or if there is a mapping. Let's assume id matches for now or check 'clients' table structure if possible.
            // Actually, usually there is a link. Let's try to fetch by ID first.
            let { data: client, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !client) {
                // Fallback: try to find by email if ID doesn't match (though ID should match in many setups)
                const { data: clientByEmail } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('email', user.email)
                    .single();
                client = clientByEmail;
            }

            if (client) {
                // Check for suspension
                if (client.status === 'suspended' || client.is_suspended) {
                    setIsClientSuspended(true);
                    setClientSuspensionReason(client.suspension_reason);

                    // Show immediate error toast
                    // toast.error("Votre compte est suspendu. Impossible de créer une commande.");
                    // We don't return here to allow form data to be populated just in case, 
                    // but the UI will be blocked by the 'isClientSuspended' check in render
                }

                updateFormData({
                    clientId: client.id,
                    clientName: client.company_name || `${client.first_name} ${client.last_name}`,
                    clientEmail: client.email,
                    clientPhone: client.phone,
                    clientCompany: client.company_name,
                    pickupContact: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
                    pickupPhone: client.phone || ""
                });
            }
        } catch (error) {
            console.error("Error fetching current client:", error);
        }
    };

    // Calculate price effect
    useEffect(() => {
        const calculatePrice = async () => {
            if (!formData.deliveryAddress || !formData.pickupAddress || !formData.pickupCity) {
                setPricingResults(null);
                return;
            }

            setIsCalculatingPrice(true);
            setPricingError(null);

            try {
                let pickupLat = formData.pickupLat;
                let pickupLng = formData.pickupLng;
                let deliveryLat = formData.deliveryLat;
                let deliveryLng = formData.deliveryLng;

                // Fallback: Geocode if we don't have coords (e.g. manual entry or legacy)
                if (!pickupLat || !pickupLng) {
                    const pickupGeocode = await geocoderAdresse(formData.pickupAddress);
                    pickupLat = parseFloat(pickupGeocode.latitude.toString());
                    pickupLng = parseFloat(pickupGeocode.longitude.toString());
                    // Optimistically update formData ? No, dangerous in useEffect loop
                }

                if (!deliveryLat || !deliveryLng) {
                    const deliveryGeocode = await geocoderAdresse(formData.deliveryAddress);
                    deliveryLat = parseFloat(deliveryGeocode.latitude.toString());
                    deliveryLng = parseFloat(deliveryGeocode.longitude.toString());
                }

                const distanceKm = calculerDistance(
                    pickupLat!,
                    pickupLng!,
                    deliveryLat!,
                    deliveryLng!
                );

                // Use the city from formData, or fallback to geocode result if we had to geocode
                const deliveryCity = formData.deliveryCity;

                const results = await calculerToutesLesFormulesAsync(
                    formData.pickupCity,
                    deliveryCity,
                    distanceKm * 1000
                );
                setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
            } catch (error) {
                console.error(error);
                setPricingError("Impossible de calculer le tarif");
                setPricingResults(null);
            } finally {
                setIsCalculatingPrice(false);
            }
        };

        const timeoutId = setTimeout(calculatePrice, 1000);
        return () => clearTimeout(timeoutId);
    }, [
        formData.deliveryAddress,
        formData.deliveryCity,
        formData.pickupCity,
        formData.pickupAddress,
        formData.pickupLat,
        formData.pickupLng,
        formData.deliveryLat,
        formData.deliveryLng
    ]);

    // Vérifier si la formule Standard doit être grisée
    useEffect(() => {
        let shouldDisableStandard = false;

        if (formData.scheduleType === 'immediate' || formData.scheduleType === 'in1h') {
            // Condition A: "Dès que possible" ou "Dans 1h" sélectionné → griser Standard
            shouldDisableStandard = true;
        } else if (formData.scheduleType === 'deferred') {
            // Condition B: Vérifier le délai du créneau choisi
            if (formData.pickupDate && formData.pickupTime) {
                const now = new Date();
                const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
                const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);

                // Si le délai est strictement inférieur à 60 minutes → griser Standard
                shouldDisableStandard = delayInMinutes < 60;
            }
        }

        setIsStandardDisabled(shouldDisableStandard);

        // Si Standard est désactivé mais qu'il est sélectionné, on le désélectionne
        if (shouldDisableStandard && formData.formula === 'NORMAL') {
            updateFormData({ formula: null });
        }
    }, [formData.scheduleType, formData.pickupDate, formData.pickupTime, formData.formula]);

    // Navigation logic
    const steps: { id: WizardStepId; label: string; icon: any }[] = [
        { id: 'pickup', label: 'Enlèvement', icon: MapPin },
        { id: 'delivery', label: 'Livraison', icon: MapPin },
        { id: 'schedule', label: 'Horaires', icon: Clock },
        { id: 'package', label: 'Type & Détails', icon: Package },
        { id: 'formula', label: 'Formule', icon: Truck },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle }
    ];

    const handleStepComplete = (stepId: WizardStepId) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }

        const currentIndex = steps.findIndex(s => s.id === stepId);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handleStepClick = (stepId: WizardStepId) => {
        // Allow clicking if step is completed or is the current step
        // Or if previous step is completed
        const stepIndex = steps.findIndex(s => s.id === stepId);
        const previousStepId = stepIndex > 0 ? steps[stepIndex - 1].id : null;

        if (
            completedSteps.includes(stepId) ||
            stepId === currentStep ||
            (previousStepId && completedSteps.includes(previousStepId)) ||
            stepIndex === 0
        ) {
            setCurrentStep(stepId);
        }
    };

    const updateFormData = (data: Partial<OrderFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleClientCreated = (newClient: any) => {
        setClients(prev => [...prev, newClient]);
        updateFormData({
            clientId: newClient.id,
            clientName: newClient.company_name || `${newClient.first_name} ${newClient.last_name}`,
            clientEmail: newClient.email,
            clientPhone: newClient.phone,
            clientCompany: newClient.company_name,
            pickupContact: `${newClient.first_name || ''} ${newClient.last_name || ''}`.trim(),
            pickupPhone: newClient.phone || ""
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'pickup':
                return <StepPickup
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => handleStepComplete('pickup')}
                    clients={clients}
                    mode={mode}
                    onClientCreated={handleClientCreated}
                />;
            case 'delivery':
                return <StepDelivery
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => handleStepComplete('delivery')}
                    onBack={() => setCurrentStep('pickup')}
                />;
            case 'schedule':
                return <StepSchedule
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => handleStepComplete('schedule')}
                    onBack={() => setCurrentStep('delivery')}
                />;
            case 'package':
                return <StepPackage
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={() => handleStepComplete('package')}
                    onBack={() => setCurrentStep('schedule')}
                />;
            case 'formula':
                return <StepFormula
                    formData={formData}
                    updateFormData={updateFormData}
                    pricingResults={pricingResults}
                    isCalculating={isCalculatingPrice}
                    error={pricingError}
                    isStandardDisabled={isStandardDisabled}
                    onNext={() => handleStepComplete('formula')}
                    onBack={() => setCurrentStep('package')}
                    onPricesCalculated={setPricingResults}
                    onCalculatingStateChange={setIsCalculatingPrice}
                    onError={setPricingError}
                />;
            case 'confirmation':
                return <StepConfirmation
                    formData={formData}
                    pricingResults={pricingResults}
                    onSubmit={async () => {
                        // FORCE GEOCODING BEFORE SUBMISSION
                        setIsCalculatingPrice(true);
                        try {
                            let finalData = { ...formData };

                            // Check Pickup
                            if (!finalData.pickupLat || !finalData.pickupLng) {
                                console.log("Geocoding Pickup Address before submit...");
                                try {
                                    const geo = await geocoderAdresse(finalData.pickupAddress);
                                    finalData.pickupLat = geo.latitude;
                                    finalData.pickupLng = geo.longitude;
                                    // Also update city/zip if possible/needed, but lat/lng is priority
                                } catch (e) {
                                    console.error("Failed to geocode pickup:", e);
                                    // Should we block? Maybe not, allow manual dispatch but warn?
                                    // For now, let's proceed, as admin can edit later, or it might be OK.
                                }
                            }

                            // Check Delivery
                            if (!finalData.deliveryLat || !finalData.deliveryLng) {
                                console.log("Geocoding Delivery Address before submit...");
                                try {
                                    const geo = await geocoderAdresse(finalData.deliveryAddress);
                                    finalData.deliveryLat = geo.latitude;
                                    finalData.deliveryLng = geo.longitude;
                                } catch (e) {
                                    console.error("Failed to geocode delivery:", e);
                                }
                            }

                            onSubmit({
                                ...finalData,
                                pricingResult: pricingResults ? pricingResults[formData.formula] : undefined
                            });
                        } catch (err) {
                            console.error("Final submit error:", err);
                        } finally {
                            setIsCalculatingPrice(false);
                        }
                    }}
                    onBack={() => setCurrentStep('formula')}
                />;
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    if (isClientSuspended && mode === 'client') {
        return (
            <UniversalModal
                isOpen={isOpen}
                onClose={onClose}
                title="Compte Suspendu"
                size="md"
            >
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        {/* We need to import AlertTriangle if not already imported, currently Clock etc are imported from lucide-react */}
                        {/* Looking at imports, I need to add AlertTriangle or use existing icon. Imports are: MapPin, Package, Clock, Truck, CheckCircle */}
                        <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Action Impossible</h2>
                    <p className="text-gray-600">
                        Votre compte a été suspendu par l'administrateur. Vous ne pouvez plus passer de commandes pour le moment.
                    </p>
                    {clientSuspensionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-md p-3 w-full text-sm text-red-800">
                            <strong>Raison :</strong> {clientSuspensionReason}
                        </div>
                    )}
                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </UniversalModal>
        );
    }

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle Commande"
            size="xl"
            className="max-w-7xl"
            disableScroll={true}
        >
            {/* Left Sidebar - Steps */}
            <div className="w-64 bg-white border-r border-gray-100 overflow-y-auto hide-scrollbar hidden md:block shrink-0">
                <WizardSidebar
                    steps={steps}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={handleStepClick}
                />
            </div>

            {/* Center - Content */}
            <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col p-6">
                        {renderStepContent()}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Summary */}
            <div className="w-80 bg-white border-l border-gray-100 overflow-y-auto hide-scrollbar hidden lg:block p-6 shrink-0">
                <WizardSummary
                    formData={formData}
                    pricingResults={pricingResults}
                />
            </div>
        </UniversalModal>
    );
};

