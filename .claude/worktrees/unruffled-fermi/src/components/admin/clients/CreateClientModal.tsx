import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { User, MapPin, FileText, CheckCircle, Building2, Phone, Mail, Lock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { CourseStepper } from "@/pages/client/nouvelle-course/CourseStepper";

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

const SECTORS = [
    "Médical",
    "Événementiel",
    "Automobile",
    "Juridique",
    "Autre"
];

export const CreateClientModal = ({ isOpen, onClose, onSuccess }: CreateClientModalProps) => {
    const [step, setStep] = useState(1);
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
        { title: 'Entreprise', icon: Building2 },
        { title: 'Facturation', icon: MapPin },
        { title: 'Détails', icon: FileText },
        { title: 'Validation', icon: CheckCircle }
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

    const validateStep = (stepNumber: number): boolean => {
        const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
        let isValid = true;

        if (stepNumber === 1) {
            if (!formData.company_name) newErrors.company_name = "Requis";
            if (!formData.sector) newErrors.sector = "Requis";
            if (!formData.email) newErrors.email = "Requis";
            if (!formData.phone) newErrors.phone = "Requis";
            if (!formData.siret) newErrors.siret = "Requis";
        } else if (stepNumber === 2) {
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

    const nextStep = () => {
        if (!validateStep(step)) return;
        setStep(s => Math.min(s + 1, steps.length));
    };

    const prevStep = () => {
        setStep(s => Math.max(s - 1, 1));
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
                .from('profiles')
                .insert([{
                    ...insertData,
                    role: 'client'
                }])
                .select()
                .single();

            if (profileError) throw profileError;

            toast.success("Client créé avec succès");
            onSuccess(profile);
            onClose();

            // Reset form
            setFormData({
                company_name: "", sector: "", email: "", phone: "", siret: "",
                billing_address: "", postal_code: "", city: "", note: "",
            });
            setStep(1);
        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.error(error.message || "Erreur lors de la création du client");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSiretChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
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
                }));
                toast.success("Entreprise trouvée : " + company.nom_complet);
            }
        } catch (error) {
            console.error("Erreur recherche SIRET:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">SIRET *</Label>
                                <div className="relative">
                                    <Input
                                        value={formData.siret}
                                        onChange={handleSiretChange}
                                        placeholder="14 chiffres"
                                        className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.siret ? "border-red-500" : ""}`}
                                    />
                                    {isLoading && formData.siret.length === 14 && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={20} className="animate-spin text-[#ed5518]" />
                                        </div>
                                    )}
                                </div>
                                {errors.siret && <p className="text-xs text-red-500 font-bold ml-1">{errors.siret}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Nom de l'entreprise *</Label>
                                <Input
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.company_name ? "border-red-500" : ""}`}
                                />
                                {errors.company_name && <p className="text-xs text-red-500 font-bold ml-1">{errors.company_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Secteur *</Label>
                                <Select value={formData.sector} onValueChange={(value) => handleSelectChange("sector", value)}>
                                    <SelectTrigger className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.sector ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SECTORS.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.sector && <p className="text-xs text-red-500 font-bold ml-1">{errors.sector}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Email professionnel *</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.email ? "border-red-500" : ""}`}
                                />
                                {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Téléphone *</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.phone ? "border-red-500" : ""}`}
                                />
                                {errors.phone && <p className="text-xs text-red-500 font-bold ml-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Adresse de facturation *</Label>
                                <Input
                                    name="billing_address"
                                    value={formData.billing_address}
                                    onChange={handleChange}
                                    className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.billing_address ? "border-red-500" : ""}`}
                                />
                                {errors.billing_address && <p className="text-xs text-red-500 font-bold ml-1">{errors.billing_address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Code postal *</Label>
                                    <Input
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.postal_code ? "border-red-500" : ""}`}
                                    />
                                    {errors.postal_code && <p className="text-xs text-red-500 font-bold ml-1">{errors.postal_code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Ville *</Label>
                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 ${errors.city ? "border-red-500" : ""}`}
                                    />
                                    {errors.city && <p className="text-xs text-red-500 font-bold ml-1">{errors.city}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Note interne (optionnel)</Label>
                            <Textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Informations spécifiques sur le client..."
                                className="rounded-[2rem] border-slate-100 bg-slate-50/50 p-6 font-bold transition-all focus:bg-white focus:ring-[#ed5518]/20 h-40 resize-none"
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                            
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed5518]">Entreprise</span>
                                <p className="text-xl font-black text-slate-900 uppercase">{formData.company_name}</p>
                                <p className="text-sm font-bold text-slate-500">{formData.sector}</p>
                                <p className="text-xs font-medium text-slate-400 mt-1">SIRET: {formData.siret}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed5518]">Localisation</span>
                                <p className="text-sm font-black text-slate-900 uppercase">{formData.billing_address}</p>
                                <p className="text-sm font-bold text-slate-500">{formData.postal_code} {formData.city}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed5518]">Contact</span>
                                <p className="text-sm font-black text-slate-900">{formData.email}</p>
                                <p className="text-sm font-bold text-slate-500">{formData.phone}</p>
                            </div>

                            {formData.note && (
                                <div className="col-span-1 md:col-span-2 space-y-1 pt-4 border-t border-slate-200/60">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ed5518]">Notes internes</span>
                                    <p className="text-sm font-medium text-slate-500 italic">"{formData.note}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <UniversalModal
            isOpen={isOpen} onClose={onClose} title="Gestion Client" size="xl"
            className="p-0 border-none bg-transparent shadow-none"
        >
            <div className="h-full bg-[#f8fafc] md:p-8 flex flex-col space-y-8 overflow-y-auto">
                <CourseStepper step={step} steps={steps} title="Nouveau Client" />
                
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 relative min-h-[400px] flex flex-col">
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
                                    disabled={isLoading} 
                                    className="px-12 py-5 rounded-[1.5rem] bg-[#ed5518] text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#ed5518]/30 min-w-[200px] flex items-center justify-center"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Enregistrer Client'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalModal>
    );
};


