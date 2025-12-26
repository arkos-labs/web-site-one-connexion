import { useState, useEffect, useMemo } from "react";
import { Package, Truck, Clock, AlertCircle, Zap, CheckCircle2, MapPin, Phone, Mail, Building2, FileText, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import type { AddressSuggestion } from "@/lib/autocomplete";
import SEO from "@/components/SEO";

// --- Types & Interfaces ---

interface GuestOrderFormData {
    senderName: string;
    senderPhone: string;
    senderEmail: string; // Used as billing email mostly
    recipientName: string;
    recipientPhone: string;
    billingName: string;
    billingEmail: string;
    billingAddress: string;
    billingZip: string;
    billingCity: string;
    companyName: string;
    siret: string;
    pickupAddress: string;
    pickupZip: string;
    pickupCity: string;
    pickupInstructions: string;
    deliveryAddress: string;
    deliveryZip: string;
    deliveryCity: string;
    deliveryInstructions: string;
    packageType: string;
    otherPackageType: string;
    formula: string;
    schedule: "asap" | "slot";
    scheduleTime: string;
    cgvAccepted: boolean;
}

const INITIAL_STATE: GuestOrderFormData = {
    senderName: "", senderPhone: "", senderEmail: "",
    recipientName: "", recipientPhone: "",
    billingName: "", billingEmail: "", billingAddress: "", billingZip: "", billingCity: "", companyName: "", siret: "",
    pickupAddress: "", pickupZip: "", pickupCity: "", pickupInstructions: "",
    deliveryAddress: "", deliveryZip: "", deliveryCity: "", deliveryInstructions: "",
    packageType: "", otherPackageType: "", formula: "", schedule: "asap", scheduleTime: "", cgvAccepted: false,
};

// --- Composants UI Helper ---

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
            <Icon className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <h2 className="text-xl font-bold text-[#0B1525] font-serif tracking-wide">{title}</h2>
    </div>
);

const FormError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-xs text-red-400 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><AlertCircle className="w-3 h-3" /> {message}</p>;
};

// --- Composant Recapitulatif (Extrait pour propreté) ---

function RecapCommande({ formData, pricingResults, loading, onCgvChange }: {
    formData: GuestOrderFormData;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    loading: boolean;
    onCgvChange: (checked: boolean) => void;
}) {
    // Calcul du prix sélectionné
    const selectedPrice = useMemo(() => {
        if (!pricingResults || !formData.formula) return null;
        const mapping: Record<string, FormuleNew> = { 'express': 'EXPRESS', 'flash': 'URGENCE', 'standard': 'NORMAL' };
        return pricingResults[mapping[formData.formula]];
    }, [pricingResults, formData.formula]);

    const RecapItem = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
        <div className="pb-3 border-b border-gray-100 last:border-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</p>
            <p className="font-medium text-[#0B1525] text-sm truncate">{value || "—"}</p>
            {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
        </div>
    );

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 shadow-xl rounded-2xl border border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0B1525] font-serif">📋 Récapitulatif</h2>
                {formData.formula && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#C5A028] to-[#E5C558] text-[#0B1525] text-xs font-bold uppercase shadow-sm">
                        {formData.formula}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <RecapItem label="Expéditeur" value={formData.senderName} sub={formData.senderPhone} />
                <RecapItem label="Destinataire" value={formData.recipientName} sub={formData.recipientPhone} />
                <RecapItem label="Retrait" value={formData.pickupAddress} sub={`${formData.pickupZip} ${formData.pickupCity}`} />
                <RecapItem label="Livraison" value={formData.deliveryAddress} sub={`${formData.deliveryZip} ${formData.deliveryCity}`} />

                {selectedPrice ? (
                    <div className="bg-gradient-to-r from-[#F8F9FA] to-white p-4 rounded-lg mt-6 border border-slate-100 shadow-inner">
                        <p className="text-xs text-[#0B1525]/70 mb-1 font-semibold uppercase">Total Estimé HT</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-[#D4AF37]">
                                {selectedPrice.totalEuros.toFixed(2)}<span className="text-lg text-[#0B1525]">€</span>
                            </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-right">
                            {selectedPrice.totalBons.toFixed(2)} bons × 5.00€
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <p className="text-xs text-slate-500">Remplissez les adresses et choisissez une formule pour voir le tarif.</p>
                    </div>
                )}



                <div className="flex items-start gap-2 mt-6">
                    <input
                        type="checkbox"
                        id="cgv"
                        checked={formData.cgvAccepted}
                        onChange={(e) => onCgvChange(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <label htmlFor="cgv" className="text-xs text-slate-500 cursor-pointer select-none">
                        En cliquant, vous acceptez nos <a href="#" className="underline text-[#0B1525]">conditions générales d'utilisation</a>. Une facture sera envoyée par email.
                    </label>
                </div>

                <Button
                    type="submit"
                    className={`w-full mt-4 font-bold py-6 text-lg rounded-full shadow-lg transition-transform active:scale-[0.98]
                        ${formData.cgvAccepted ? "bg-gradient-to-r from-[#C5A028] to-[#E5C558] hover:from-[#B08D1F] hover:to-[#D4B346] text-[#0B1525]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}
                    `}
                    disabled={loading || !formData.cgvAccepted}
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#0B1525] border-t-transparent rounded-full animate-spin" /> Traitement...</span>
                    ) : (
                        "Commander maintenant"
                    )}
                </Button>
            </div>
        </div>
    );
}

// --- Main Component ---

const CommandeSansCompte = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<GuestOrderFormData>(INITIAL_STATE);
    const [errors, setErrors] = useState<Partial<Record<keyof GuestOrderFormData, string>>>({});

    // États Pricing
    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);
    const [villeArrivee, setVilleArrivee] = useState<string>("");
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    // --- Gestionnaires d'état ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof GuestOrderFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (name: keyof GuestOrderFormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleAddressSelect = (type: 'pickup' | 'delivery', suggestion: AddressSuggestion) => {
        const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
        const updates = type === 'pickup'
            ? { pickupAddress: fullAddress, pickupZip: suggestion.postcode, pickupCity: suggestion.city }
            : { deliveryAddress: fullAddress, deliveryZip: suggestion.postcode, deliveryCity: suggestion.city };

        setFormData(prev => ({ ...prev, ...updates }));

        // Clear errors relative to address
        const newErrors = { ...errors };
        if (type === 'pickup') { delete newErrors.pickupAddress; delete newErrors.pickupCity; delete newErrors.pickupZip; }
        else { delete newErrors.deliveryAddress; delete newErrors.deliveryCity; delete newErrors.deliveryZip; }
        setErrors(newErrors);
    };

    // --- Logique Pricing & Validations ---

    useEffect(() => {
        const calculatePrice = async () => {
            if (!formData.deliveryAddress || !formData.pickupCity || formData.deliveryAddress.length < 5) {
                setPricingResults(null);
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

                setVilleArrivee(deliveryGeocode.ville);
                const config = await loadPricingConfigCached();
                const results = await calculerToutesLesFormulesAsync(formData.pickupCity, deliveryGeocode.ville, distanceKm * 1000, config);

                setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
            } catch (err: any) {
                setPricingError(err.message || "Erreur calcul itinéraire");
                setPricingResults(null);
            } finally {
                setIsCalculatingPrice(false);
            }
        };

        const timer = setTimeout(calculatePrice, 800);
        return () => clearTimeout(timer);
    }, [formData.deliveryAddress, formData.pickupCity, formData.pickupAddress]); // Added dependencies for stability

    // Désactivation formule Standard selon horaire
    useEffect(() => {
        let disabled = false;

        if (formData.schedule === 'asap') {
            disabled = true;
        } else if (formData.schedule === 'slot' && formData.scheduleTime) {
            const scheduledTime = new Date(formData.scheduleTime);
            // Si la date est invalide, ne rien faire pour l'instant
            if (!isNaN(scheduledTime.getTime())) {
                const now = new Date();
                const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
                // Moins de 60 minutes = Standard désactivé
                if (diffMinutes < 60) {
                    disabled = true;
                }
            }
        }

        setIsStandardDisabled(disabled);

        // Si la formule actuelle est standard et qu'elle devient désactivée, on change
        if (disabled && formData.formula === 'standard') {
            setFormData(prev => ({ ...prev, formula: 'express' })); // Basculer sur Express par défaut
            toast({
                title: "Formule Standard Indisponible",
                description: "Le délai étant inférieur à 1h, nous avons basculé sur la formule Express.",
                variant: "default",
                className: "bg-slate-900 text-white border-[#D4AF37]"
            });
        }
    }, [formData.schedule, formData.scheduleTime, formData.formula]);

    // --- Validation & Submit ---

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof GuestOrderFormData, string>> = {};

        if (!formData.senderName) newErrors.senderName = "Nom requis";
        if (!formData.senderPhone) newErrors.senderPhone = "Téléphone requis";
        if (!formData.recipientName) newErrors.recipientName = "Nom requis";
        if (!formData.recipientPhone) newErrors.recipientPhone = "Téléphone requis";

        if (!formData.billingName) newErrors.billingName = "Nom requis";
        if (!formData.billingEmail) newErrors.billingEmail = "Email requis";
        else if (!/\S+@\S+\.\S+/.test(formData.billingEmail)) newErrors.billingEmail = "Email invalide";

        if (!formData.companyName) newErrors.companyName = "Société requise";
        if (!formData.siret || formData.siret.length !== 14) newErrors.siret = "SIRET 14 chiffres";

        if (!formData.pickupAddress) newErrors.pickupAddress = "Adresse requise";
        if (!formData.deliveryAddress) newErrors.deliveryAddress = "Adresse requise";

        if (!formData.packageType) newErrors.packageType = "Type requis";
        if (!formData.formula) newErrors.formula = "Formule requise";
        if (formData.schedule === 'slot' && !formData.scheduleTime) newErrors.scheduleTime = "Horaire requis";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast({ variant: "destructive", title: "Formulaire incomplet", description: "Veuillez corriger les erreurs indiquées." });
            // Scroll to top or first error could be implemented here
            return;
        }

        if (!pricingResults) {
            toast({ variant: "destructive", title: "Erreur technique", description: "Impossible de calculer le prix. Vérifiez les adresses." });
            return;
        }

        setLoading(true);
        try {
            const mapping: Record<string, FormuleNew> = { 'express': 'EXPRESS', 'flash': 'URGENCE', 'standard': 'NORMAL' };
            const pricingKey = mapping[formData.formula];

            // Dynamic import to keep bundle small
            const { createGuestOrder } = await import('@/services/guestOrderService');

            const response = await createGuestOrder({
                senderName: formData.senderName,
                senderEmail: formData.billingEmail,
                senderPhone: formData.senderPhone,
                pickupAddress: formData.pickupAddress,
                pickupDetails: formData.pickupInstructions,
                recipientName: formData.recipientName,
                recipientPhone: formData.recipientPhone,
                deliveryAddress: formData.deliveryAddress,
                deliveryDetails: formData.deliveryInstructions,
                packageDescription: formData.packageType === 'autre' ? formData.otherPackageType : formData.packageType,
                formula: pricingKey,
                pricingResult: pricingResults[pricingKey],
                villeArrivee,
                scheduleTime: formData.schedule === 'slot' ? formData.scheduleTime : undefined,
                billingInfo: {
                    name: formData.billingName,
                    address: formData.billingAddress,
                    zip: formData.billingZip,
                    city: formData.billingCity,
                    companyName: formData.companyName,
                    siret: formData.siret
                }
            });

            if (response.success) {
                toast({
                    title: "Commande validée !",
                    description: `Réf: ${response.reference}. Confirmation envoyée par email.`,
                    className: "bg-[#0B2D55] text-white border-[#D4AF37]"
                });
                // Redirection logic here...
            } else {
                throw new Error(response.message || "Erreur inconnue");
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Echec de la commande", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <SEO
                title="Commander Coursier Immédiat - One Connexion"
                description="Réserver coursier immédiat en ligne. Devis transport express instantané sans ouverture de compte. Livraison express paiement CB."
                keywords="Réserver coursier immédiat en ligne, Devis transport express instantané, Prix course taxi colis, Commander transport sans ouverture de compte, Livraison express paiement CB, Comment commander un coursier sans contrat ?, Trouver un chauffeur livreur disponible tout de suite, Estimer prix course livraison immédiate"
            />
            <Header />

            {/* Hero Minimaliste */}
            <section className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0B1525] to-[#0B1525]" />
                <div className="container relative z-10 px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
                        Commande <span className="text-[#D4AF37] italic">Express</span>
                    </h1>
                    <p className="text-slate-400 font-light max-w-xl mx-auto">Sans compte. Rapide. Sécurisé. Facturation pro immédiate.</p>
                </div>
            </section>

            <div className="container mx-auto px-4 pb-20">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">

                    {/* Colonne Formulaire (gauche) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Expéditeur & Destinataire (Groupés pour compacité) */}
                        <Card className="p-6 md:p-8 bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                            <SectionHeader icon={Package} title="Expédition & Réception" />
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Expéditeur */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">Expéditeur</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="senderName">Nom complet <span className="text-red-500">*</span></Label>
                                            <Input id="senderName" name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Jean Dupont" className={errors.senderName ? "border-red-500" : ""} />
                                            <FormError message={errors.senderName} />
                                        </div>
                                        <div>
                                            <Label htmlFor="senderPhone">Téléphone <span className="text-red-500">*</span></Label>
                                            <Input id="senderPhone" name="senderPhone" value={formData.senderPhone} onChange={handleChange} placeholder="06..." className={errors.senderPhone ? "border-red-500" : ""} />
                                            <FormError message={errors.senderPhone} />
                                        </div>
                                    </div>
                                </div>
                                {/* Destinataire */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">Destinataire</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="recipientName">Nom complet <span className="text-red-500">*</span></Label>
                                            <Input id="recipientName" name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="Marie Martin" className={errors.recipientName ? "border-red-500" : ""} />
                                            <FormError message={errors.recipientName} />
                                        </div>
                                        <div>
                                            <Label htmlFor="recipientPhone">Téléphone <span className="text-red-500">*</span></Label>
                                            <Input id="recipientPhone" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} placeholder="06..." className={errors.recipientPhone ? "border-red-500" : ""} />
                                            <FormError message={errors.recipientPhone} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Trajet */}
                        <Card className="p-6 md:p-8 bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                            <SectionHeader icon={MapPin} title="Itinéraire de la course" />
                            <div className="space-y-6 relative">
                                {/* Ligne pointillée connectant A et B */}
                                <div className="absolute left-[1.35rem] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-slate-700 hidden md:block"></div>

                                {/* Pickup */}
                                <div className="grid md:grid-cols-[auto_1fr] gap-4">
                                    <div className="hidden md:flex flex-col items-center pt-2">
                                        <div className="w-4 h-4 rounded-full bg-[#D4AF37] ring-4 ring-white z-10 shadow-md"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[#D4AF37]">Adresse de retrait (Point A)</Label>
                                        <AddressAutocomplete
                                            value={formData.pickupAddress}
                                            onChange={(val) => handleSelectChange('pickupAddress', val)}
                                            onAddressSelect={(s) => handleAddressSelect('pickup', s)}
                                            placeholder="Rechercher une adresse..."
                                            name="pickupAddress"
                                            className={errors.pickupAddress ? "border-red-500" : ""}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input name="pickupZip" value={formData.pickupZip} onChange={handleChange} placeholder="Code postal" />
                                            <Input name="pickupCity" value={formData.pickupCity} onChange={handleChange} placeholder="Ville" />
                                        </div>
                                        <Input name="pickupInstructions" value={formData.pickupInstructions} onChange={handleChange} placeholder="Instructions (Code, étage, contact sur place...)" className="text-sm" />
                                    </div>
                                </div>

                                {/* Delivery */}
                                <div className="grid md:grid-cols-[auto_1fr] gap-4">
                                    <div className="hidden md:flex flex-col items-center pt-2">
                                        <div className="w-4 h-4 rounded-full bg-slate-400 ring-4 ring-white z-10 shadow-md"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-600">Adresse de livraison (Point B)</Label>
                                        <AddressAutocomplete
                                            value={formData.deliveryAddress}
                                            onChange={(val) => handleSelectChange('deliveryAddress', val)}
                                            onAddressSelect={(s) => handleAddressSelect('delivery', s)}
                                            placeholder="Rechercher une adresse..."
                                            name="deliveryAddress"
                                            className={errors.deliveryAddress ? "border-red-500" : ""}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input name="deliveryZip" value={formData.deliveryZip} onChange={handleChange} placeholder="Code postal" />
                                            <Input name="deliveryCity" value={formData.deliveryCity} onChange={handleChange} placeholder="Ville" />
                                        </div>
                                        <Input name="deliveryInstructions" value={formData.deliveryInstructions} onChange={handleChange} placeholder="Instructions (Interphone, accueil...)" className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 3. Détails & Formule */}
                        <Card className="p-6 md:p-8 bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                            <SectionHeader icon={SettingsIcon} title="Détails de la mission" />

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <Label>Type de colis</Label>
                                    <Select value={formData.packageType} onValueChange={(v) => handleSelectChange('packageType', v)}>
                                        <SelectTrigger className={`mt-2 ${errors.packageType ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Sélectionner..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-lg">
                                            <SelectItem value="document">Pli / Document</SelectItem>
                                            <SelectItem value="petit_colis">Petit colis (-10kg)</SelectItem>
                                            <SelectItem value="materiel_sensible">Matériel sensible</SelectItem>
                                            <SelectItem value="autre">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {formData.packageType === "autre" && (
                                        <Input name="otherPackageType" value={formData.otherPackageType} onChange={handleChange} placeholder="Précisez..." className="mt-2" />
                                    )}
                                </div>

                                <div>
                                    <Label>Horaire</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            type="button"
                                            variant={formData.schedule === "asap" ? "cta" : "outline"}
                                            onClick={() => handleSelectChange("schedule", "asap")}
                                            className={`flex-1 rounded-full ${formData.schedule === "asap" ? "bg-gradient-to-r from-[#C5A028] to-[#E5C558] text-[#0B1525]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            Immédiat
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.schedule === "slot" ? "cta" : "outline"}
                                            onClick={() => handleSelectChange("schedule", "slot")}
                                            className={`flex-1 rounded-full ${formData.schedule === "slot" ? "bg-gradient-to-r from-[#C5A028] to-[#E5C558] text-[#0B1525]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            Programmé
                                        </Button>
                                    </div>
                                    {formData.schedule === "slot" && (
                                        <Input type="datetime-local" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} className="mt-2" />
                                    )}
                                </div>
                            </div>

                            {/* Sélecteur de Formule */}
                            <div className="space-y-4">
                                <Label>Choisissez votre formule {isCalculatingPrice && <span className="text-xs text-[#D4AF37] animate-pulse ml-2">Calcul en cours...</span>}</Label>
                                {pricingError && <p className="text-red-400 text-sm">{pricingError}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: "standard", label: "Standard", icon: Truck, key: "NORMAL", desc: "Eco & Fiable" },
                                        { id: "express", label: "Express", icon: Clock, key: "EXPRESS", desc: "Prioritaire" },
                                        { id: "flash", label: "Flash", icon: Zap, key: "URGENCE", desc: "Immédiat" },
                                    ].map((f) => {
                                        const price = pricingResults ? pricingResults[f.key as FormuleNew] : null;
                                        const disabled = !pricingResults || (f.id === "standard" && isStandardDisabled);
                                        const selected = formData.formula === f.id;

                                        return (
                                            <div
                                                key={f.id}
                                                onClick={() => !disabled && handleSelectChange("formula", f.id)}
                                                className={`
                                                    relative border rounded-xl p-4 cursor-pointer transition-all duration-200
                                                    ${disabled ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50" : "hover:border-[#D4AF37]/50 hover:shadow-md"}
                                                    ${selected ? "border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]" : "border-slate-200 bg-white"}
                                                `}
                                            >
                                                {selected && <div className="absolute top-2 right-2 text-[#D4AF37]"><CheckCircle2 className="w-5 h-5" /></div>}
                                                <f.icon className={`w-6 h-6 mb-3 ${selected ? "text-[#D4AF37]" : "text-slate-400"}`} />
                                                <p className="font-bold text-[#0B1525]">{f.label}</p>
                                                <p className="text-xs text-slate-500 mb-2">{f.desc}</p>
                                                {price ? (
                                                    <>
                                                        <p className={`text-xl font-bold ${selected ? "text-[#D4AF37]" : "text-[#0B1525]"}`}>{price.totalEuros.toFixed(2)}€</p>
                                                        <p className={`text-xs ${selected ? "text-[#D4AF37]/80" : "text-slate-400"}`}>({price.totalBons.toFixed(2)} bons)</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-300">-- €</p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                {isStandardDisabled && formData.schedule === 'slot' && (
                                    <p className="text-xs text-amber-500 flex items-center gap-1 mt-2">
                                        <AlertCircle className="w-3 h-3" /> Standard indisponible pour départ imminent (-1h)
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* 4. Facturation */}
                        <Card className="p-6 md:p-8 bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                            <SectionHeader icon={Building2} title="Facturation" />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="companyName">Raison Sociale <span className="text-red-500">*</span></Label>
                                        <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ma Société SAS" className={errors.companyName ? "border-red-500" : ""} />
                                        <FormError message={errors.companyName} />
                                    </div>
                                    <div>
                                        <Label htmlFor="siret">SIRET <span className="text-red-500">*</span></Label>
                                        <Input id="siret" name="siret" value={formData.siret} onChange={handleChange} maxLength={14} placeholder="14 chiffres" className={errors.siret ? "border-red-500" : ""} />
                                        <FormError message={errors.siret} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="billingEmail">Email Facturation <span className="text-red-500">*</span></Label>
                                        <Input type="email" id="billingEmail" name="billingEmail" value={formData.billingEmail} onChange={handleChange} placeholder="compta@societe.com" className={errors.billingEmail ? "border-red-500" : ""} />
                                        <FormError message={errors.billingEmail} />
                                    </div>
                                    <div>
                                        <Label htmlFor="billingName">Nom contact <span className="text-red-500">*</span></Label>
                                        <Input id="billingName" name="billingName" value={formData.billingName} onChange={handleChange} placeholder="Service Compta" className={errors.billingName ? "border-red-500" : ""} />
                                        <FormError message={errors.billingName} />
                                    </div>
                                </div>
                                <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <Label>Adresse de facturation <span className="text-red-500">*</span></Label>
                                        <Input name="billingAddress" value={formData.billingAddress} onChange={handleChange} placeholder="10 rue de la Paix" />
                                    </div>
                                    <div>
                                        <Label>Code Postal <span className="text-red-500">*</span></Label>
                                        <Input name="billingZip" value={formData.billingZip} onChange={handleChange} placeholder="75000" />
                                    </div>
                                    <div className="hidden">
                                        {/* Hidden city input maintained for state logic consistency if needed */}
                                        <Input name="billingCity" value={formData.billingCity} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Submit Button (Mobile) */}

                    </div>

                    {/* Colonne Récap (Droite - Sticky Desktop) */}
                    <div className="lg:col-span-4 sticky top-28 z-20 h-fit">
                        <div className="lg:col-span-4">
                            <RecapCommande
                                formData={formData}
                                pricingResults={pricingResults}
                                loading={loading}
                                onCgvChange={(checked) => setFormData(prev => ({ ...prev, cgvAccepted: checked }))}
                            />
                        </div>
                    </div>

                </form>
            </div>
            <Footer />
        </div>
    );
};

// Helper Icon for section 3
const SettingsIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
)

export default CommandeSansCompte;
