import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { User, MapPin, FileText, CheckCircle, Building2, Phone, Mail, Lock } from "lucide-react";

interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (client: any) => void;
}

interface ClientFormData {
    company_name: string;
    sector: string;
    email: string;
    phone: string;
    siret: string;
    billing_address: string;
    postal_code: string;
    city: string;
    note: string;
}

type ClientStepId = 'info' | 'address' | 'notes' | 'confirmation';

const SECTORS = [
    "Médical",
    "Événementiel",
    "Automobile",
    "Juridique",
    "Autre"
];

export const CreateClientModal = ({ isOpen, onClose, onSuccess }: CreateClientModalProps) => {
    const [currentStep, setCurrentStep] = useState<ClientStepId>('info');
    const [completedSteps, setCompletedSteps] = useState<ClientStepId[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<ClientFormData>({
        company_name: "",
        sector: "",
        email: "",
        phone: "",
        siret: "",
        billing_address: "",
        postal_code: "",
        city: "",
        note: "",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

    const steps = [
        { id: 'info' as ClientStepId, label: 'Informations', icon: Building2 },
        { id: 'address' as ClientStepId, label: 'Adresse', icon: MapPin },
        { id: 'notes' as ClientStepId, label: 'Notes', icon: FileText },
        { id: 'confirmation' as ClientStepId, label: 'Confirmation', icon: CheckCircle }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof ClientFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof ClientFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateStep = (stepId: ClientStepId): boolean => {
        const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
        let isValid = true;

        if (stepId === 'info') {
            if (!formData.company_name) newErrors.company_name = "Requis";
            if (!formData.sector) newErrors.sector = "Requis";
            if (!formData.email) newErrors.email = "Requis";
            if (!formData.phone) newErrors.phone = "Requis";
            if (!formData.siret) newErrors.siret = "Requis";
        } else if (stepId === 'address') {
            if (!formData.billing_address) newErrors.billing_address = "Requis";
            if (!formData.postal_code) newErrors.postal_code = "Requis";
            if (!formData.city) newErrors.city = "Requis";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleStepComplete = (stepId: ClientStepId) => {
        if (!validateStep(stepId)) return;

        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }

        const currentIndex = steps.findIndex(s => s.id === stepId);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handleStepClick = (stepId: ClientStepId) => {
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
            const fullAddress = `${formData.billing_address}, ${formData.postal_code} ${formData.city}`;

            const insertData = {
                company_name: formData.company_name,
                sector: formData.sector,
                email: formData.email,
                phone: formData.phone,
                siret: formData.siret,
                billing_address: formData.billing_address,
                address: fullAddress,
                zip_code: formData.postal_code,
                city: formData.city,
                notes: formData.note,
                first_name: "Contact",
                last_name: formData.company_name,
            };

            const { data: profile, error: profileError } = await supabase
                .from('clients')
                .insert(insertData)
                .select()
                .single();

            if (profileError) throw profileError;

            toast.success("Client créé avec succès");
            onSuccess(profile);
            onClose();

            // Reset form
            setFormData({
                company_name: "",
                sector: "",
                email: "",
                phone: "",
                siret: "",
                billing_address: "",
                postal_code: "",
                city: "",
                note: "",
            });
            setCurrentStep('info');
            setCompletedSteps([]);
        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.error(error.message || "Erreur lors de la création du client");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSiretChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Only allow numbers and limit to 14 chars
        const cleanValue = value.replace(/\D/g, '').slice(0, 14);

        setFormData(prev => ({ ...prev, siret: cleanValue }));

        if (cleanValue.length === 14) {
            await fetchEnterpriseInfo(cleanValue);
        }
    };

    const fetchEnterpriseInfo = async (siret: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`);

            if (!response.ok) throw new Error("Erreur API");

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const company = data.results[0];
                const siege = company.siege;

                setFormData(prev => ({
                    ...prev,
                    company_name: company.nom_complet || prev.company_name,
                    billing_address: siege.adresse || prev.billing_address,
                    postal_code: siege.code_postal || prev.postal_code,
                    city: siege.libelle_commune || prev.city,
                    // Try to map generic sector or leave empty (NAF codes are too specific usually)
                }));

                toast.success("Entreprise trouvée : " + company.nom_complet);
            } else {
                toast.error("Aucune entreprise trouvée pour ce SIRET");
            }
        } catch (error) {
            console.error("Erreur recherche SIRET:", error);
            // Don't block user, just log
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'info':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Informations client</h3>
                            <p className="text-sm text-gray-500">Renseignez les informations principales de l'entreprise.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="siret">SIRET *</Label>
                                <div className="relative">
                                    <Input
                                        id="siret"
                                        name="siret"
                                        value={formData.siret}
                                        onChange={handleSiretChange}
                                        placeholder="14 chiffres"
                                        className={errors.siret ? "border-red-500" : ""}
                                    />
                                    {isLoading && formData.siret.length === 14 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                                {errors.siret && <p className="text-xs text-red-500">{errors.siret}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className={errors.company_name ? "border-red-500" : ""}
                                />
                                {errors.company_name && <p className="text-xs text-red-500">{errors.company_name}</p>}
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="sector">Secteur *</Label>
                                <Select value={formData.sector} onValueChange={(value) => handleSelectChange("sector", value)}>
                                    <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SECTORS.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email professionnel *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={errors.phone ? "border-red-500" : ""}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => handleStepComplete('info')} className="bg-primary text-white">
                                Suivant
                            </Button>
                        </div>
                    </div>
                );
            case 'address':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Adresse de facturation</h3>
                            <p className="text-sm text-gray-500">Adresse utilisée pour la facturation.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="billing_address">Adresse *</Label>
                                <Input
                                    id="billing_address"
                                    name="billing_address"
                                    value={formData.billing_address}
                                    onChange={handleChange}
                                    className={errors.billing_address ? "border-red-500" : ""}
                                />
                                {errors.billing_address && <p className="text-xs text-red-500">{errors.billing_address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Code postal *</Label>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        className={errors.postal_code ? "border-red-500" : ""}
                                    />
                                    {errors.postal_code && <p className="text-xs text-red-500">{errors.postal_code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville *</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={errors.city ? "border-red-500" : ""}
                                    />
                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('info')}>
                                Retour
                            </Button>
                            <Button onClick={() => handleStepComplete('address')} className="bg-primary text-white">
                                Suivant
                            </Button>
                        </div>
                    </div>
                );
            case 'notes':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Notes</h3>
                            <p className="text-sm text-gray-500">Informations complémentaires (optionnel).</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Note interne</Label>
                            <Textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Informations spécifiques sur le client..."
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('address')}>
                                Retour
                            </Button>
                            <Button onClick={() => handleStepComplete('notes')} className="bg-primary text-white">
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
                            <p className="text-sm text-gray-500">Vérifiez les informations avant de créer le client.</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Entreprise</span>
                                    <p className="font-medium text-gray-900">{formData.company_name}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Secteur</span>
                                    <p className="font-medium text-gray-900">{formData.sector}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                                    <p className="font-medium text-gray-900">{formData.email}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Téléphone</span>
                                    <p className="font-medium text-gray-900">{formData.phone}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Adresse</span>
                                    <p className="font-medium text-gray-900">
                                        {formData.billing_address}, {formData.postal_code} {formData.city}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setCurrentStep('notes')}>
                                Retour
                            </Button>
                            <Button onClick={handleSubmit} disabled={isLoading} className="bg-cta text-cta-foreground hover:bg-cta/90">
                                {isLoading ? "Création..." : "Créer le client"}
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouveau Client"
            size="xl"
            className="max-w-6xl"
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
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {formData.company_name || "—"}
                            </p>
                            {formData.sector && (
                                <p className="text-xs text-gray-500 mt-1">{formData.sector}</p>
                            )}
                        </div>

                        {/* Adresse */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-green-500 bg-white" />
                            <div className="mb-1">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {formData.city ? `${formData.city} (${formData.postal_code})` : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    {(formData.email || formData.phone) && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                            {formData.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700 truncate">{formData.email}</span>
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{formData.phone}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </UniversalModal>
    );
};
