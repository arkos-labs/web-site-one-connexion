import { useState } from 'react';
import { UniversalModal } from '@/components/ui/UniversalModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Driver } from '@/services/adminSupabaseQueries';
import { User, Truck, CheckCircle, Mail, Phone, MapPin, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CreateDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => void;
}

type DriverStepId = 'personal' | 'vehicle' | 'confirmation';

interface DriverFormData {
    first_name: string;
    last_name: string;
    email: string; // Devient obligatoire pour la pré-inscription
    phone: string;
    address: string;
    siret: string;
    vehicle_type: string;
    vehicle_registration: string;
    vehicle_capacity: string;
    license_number: string;
    insurance_document: string;
}

const CreateDriverModal = ({ isOpen, onClose, onSubmit }: CreateDriverModalProps) => {
    const [currentStep, setCurrentStep] = useState<DriverStepId>('personal');
    const [completedSteps, setCompletedSteps] = useState<DriverStepId[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<DriverFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        siret: '',
        vehicle_type: '',
        vehicle_registration: '',
        vehicle_capacity: '',
        license_number: '',
        insurance_document: '',
    });

    const steps = [
        { id: 'personal' as DriverStepId, label: 'Informations', icon: User },
        { id: 'vehicle' as DriverStepId, label: 'Véhicule', icon: Truck },
        { id: 'confirmation' as DriverStepId, label: 'Confirmation', icon: CheckCircle }
    ];

    const validateStep = (stepId: DriverStepId): boolean => {
        if (stepId === 'personal') {
            if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email) {
                toast.error("Veuillez remplir les champs obligatoires (Nom, Prénom, Email, Téléphone)");
                return false;
            }
            // Validation email simple
            if (!formData.email.includes('@')) {
                toast.error("Veuillez entrer une adresse email valide");
                return false;
            }
        }
        if (stepId === 'vehicle') {
            if (!formData.vehicle_type || !formData.vehicle_registration) {
                toast.error("Veuillez remplir les informations du véhicule (Type, Plaque)");
                return false;
            }
        }
        return true;
    };

    const handleStepComplete = (stepId: DriverStepId) => {
        if (!validateStep(stepId)) return;

        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }

        const currentIndex = steps.findIndex(s => s.id === stepId);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handleStepClick = (stepId: DriverStepId) => {
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

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Appel de la fonction RPC 'create_driver_user' en mode pré-inscription (sans password)
            const { data, error } = await supabase.rpc('create_driver_user', {
                username: formData.email, // On utilise l'email comme identifiant technique
                password: null, // Pas de mot de passe = pré-inscription
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                address: formData.address,
                siret: formData.siret,
                vehicle_type: formData.vehicle_type,
                vehicle_registration: formData.vehicle_registration,
                vehicle_capacity: formData.vehicle_capacity
            });

            if (error) throw error;

            toast.success("Dossier chauffeur créé ! Le chauffeur pourra finaliser son inscription via l'application.");

            // Notifier le parent pour rafraîchir la liste
            if (onSubmit) {
                onSubmit({
                    username: formData.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    status: 'offline',
                    // @ts-ignore
                    vehicle_type: formData.vehicle_type,
                    vehicle_registration: formData.vehicle_registration
                } as any);
            }

            onClose();

        } catch (error: any) {
            console.error("Erreur création chauffeur:", error);
            toast.error(error.message || "Erreur lors de la création du chauffeur");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'personal':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Informations personnelles</h3>
                            <p className="text-sm text-gray-500">Ces informations serviront à pré-inscrire le chauffeur.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Prénom *</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="Jean"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Nom *</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="06 12 34 56 78"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jean@gmail.com"
                                />
                                <p className="text-xs text-muted-foreground">Sera utilisé pour lier le compte lors de l'inscription.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Rue de Paris"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="siret">Numéro SIRET</Label>
                            <Input
                                id="siret"
                                value={formData.siret}
                                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                placeholder="123 456 789 00012"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => handleStepComplete('personal')} className="bg-primary text-white">
                                Suivant
                            </Button>
                        </div>
                    </div>
                );
            case 'vehicle':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Véhicule</h3>
                            <p className="text-sm text-gray-500">Détails du véhicule utilisé pour les livraisons.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_type">Type de véhicule *</Label>
                                <Input
                                    id="vehicle_type"
                                    value={formData.vehicle_type}
                                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                    placeholder="Ex: Scooter, Voiture"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicle_registration">Plaque (Immatriculation) *</Label>
                                <Input
                                    id="vehicle_registration"
                                    value={formData.vehicle_registration}
                                    onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
                                    placeholder="AB-123-CD"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicle_capacity">Max de quantité (Capacité)</Label>
                            <Input
                                id="vehicle_capacity"
                                value={formData.vehicle_capacity}
                                onChange={(e) => setFormData({ ...formData, vehicle_capacity: e.target.value })}
                                placeholder="Ex: 10 colis, 500kg, 3m3"
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('personal')}>
                                Retour
                            </Button>
                            <Button onClick={() => handleStepComplete('vehicle')} className="bg-primary text-white">
                                Suivant
                            </Button>
                        </div>
                    </div>
                );
            case 'confirmation':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirmation</h3>
                            <p className="text-sm text-gray-500">Vérifiez les informations avant de pré-inscrire le chauffeur.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Informations Personnelles Card */}
                            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-700" />
                                        <h4 className="text-base font-semibold text-gray-900">Informations Personnelles</h4>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentStep('personal')}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        Modifier
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Prénom</Label>
                                        <Input value={formData.first_name} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Nom</Label>
                                        <Input value={formData.last_name} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Email</Label>
                                        <Input value={formData.email} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Téléphone</Label>
                                        <Input value={formData.phone} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-gray-500">Adresse</Label>
                                    <Input value={formData.address} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                </div>
                            </div>

                            {/* Véhicule Card */}
                            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-gray-700" />
                                        <h4 className="text-base font-semibold text-gray-900">Véhicule</h4>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentStep('vehicle')}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        Modifier
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Type</Label>
                                        <Input value={formData.vehicle_type} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-500">Plaque</Label>
                                        <Input value={formData.vehicle_registration} disabled className="bg-gray-50 border-gray-200 text-gray-700" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('vehicle')}>
                                Retour
                            </Button>
                            <Button onClick={handleSubmit} className="bg-cta text-cta-foreground hover:bg-cta/90">
                                Créer le dossier chauffeur
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouveau Chauffeur (Pré-inscription)"
            size="xl"
            className="max-w-7xl"
            disableScroll={true}
        >
            {/* Left Sidebar - Steps */}
            <div className="w-64 bg-white border-r border-gray-100 overflow-y-auto hide-scrollbar hidden md:block shrink-0">
                <div className="py-6 px-4 space-y-2">
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = currentStep === step.id;
                        const isLocked = !isCompleted && !isCurrent && index > 0 && !completedSteps.includes(steps[index - 1].id);

                        return (
                            <button
                                key={step.id}
                                onClick={() => !isLocked && handleStepClick(step.id)}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                                    ${isCurrent
                                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                        : isCompleted
                                            ? "text-gray-700 hover:bg-gray-50"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                    ${isCurrent
                                        ? "bg-blue-100 text-blue-600"
                                        : isCompleted
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-100 text-gray-400"
                                    }
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <step.icon className="w-4 h-4" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <span className={`text-sm font-medium ${isCurrent ? "font-semibold" : ""}`}>
                                        {step.label}
                                    </span>
                                </div>

                                {isLocked && <Lock className="w-3 h-3 text-gray-300" />}
                            </button>
                        );
                    })}
                </div>
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
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 font-poppins">Récapitulatif</h3>

                    {/* Identité */}
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
                            <div className="mb-1">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Identité</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {formData.first_name || formData.last_name ? `${formData.first_name} ${formData.last_name}` : "—"}
                            </p>
                            {formData.email && (
                                <p className="text-xs text-gray-500 mt-1">{formData.email}</p>
                            )}
                        </div>

                        {/* Véhicule */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-green-500 bg-white" />
                            <div className="mb-1">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {formData.vehicle_type || "—"}
                            </p>
                            {formData.vehicle_registration && (
                                <p className="text-xs text-gray-500 mt-1">Plaque: {formData.vehicle_registration}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalModal>
    );
};

export default CreateDriverModal;
