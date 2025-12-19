import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import { Package, Truck, Clock, AlertCircle, Zap, Loader2 } from "lucide-react";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import type { AddressSuggestion } from "@/lib/autocomplete";
import { supabase } from "@/lib/supabase";

/*
Important :
- Téléphone expéditeur et destinataire = OBLIGATOIRE (coursier doit appeler)
- Pas de GPS pour commande sans compte
- Facture envoyée par email après livraison
- Historique récupéré automatiquement si le client crée un compte plus tard
*/

// Composant de récapitulatif dynamique
function RecapCommande({ data, pricingResults, formData }: {
    data: any;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    formData: any;
}) {
    // Déterminer le prix selon la formule sélectionnée
    let selectedPrice = null;
    if (pricingResults && formData.formula) {
        if (formData.formula === 'express') selectedPrice = pricingResults.EXPRESS;
        else if (formData.formula === 'flash') selectedPrice = pricingResults.URGENCE;
        else if (formData.formula === 'standard') selectedPrice = pricingResults.NORMAL;
    }

    return (
        <div className="bg-white p-6 shadow-lg rounded-xl border-2 border-[#0B2D55]/10">
            <h2 className="text-xl font-bold text-[#0B2D55] mb-4 font-poppins">📋 Récapitulatif</h2>

            <div className="space-y-3 text-sm">
                {/* Expéditeur */}
                <div className="pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">EXPÉDITEUR</p>
                    <p className="font-semibold text-[#0B2D55]">{data.expediteur_nom || "—"}</p>
                    <p className="text-gray-600">{data.expediteur_telephone || "—"}</p>
                    <p className="text-gray-600 text-xs">{data.expediteur_email || "—"}</p>
                </div>

                {/* Destinataire */}
                <div className="pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">DESTINATAIRE</p>
                    <p className="font-semibold text-[#0B2D55]">{data.destinataire_nom || "—"}</p>
                    <p className="text-gray-600">{data.destinataire_telephone || "—"}</p>
                </div>

                {/* Adresses */}
                <div className="pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">📍 RETRAIT</p>
                    <p className="text-gray-700">{data.adresse_retrait || "—"}</p>
                </div>

                <div className="pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">📍 LIVRAISON</p>
                    <p className="text-gray-700">{data.adresse_livraison || "—"}</p>
                </div>

                {/* Facturation */}
                {data.facturation_societe && (
                    <div className="pb-3 border-b">
                        <p className="text-xs text-gray-500 mb-1">🏢 FACTURATION</p>
                        <p className="font-semibold text-[#0B2D55]">{data.facturation_societe}</p>
                        {data.facturation_siret && (
                            <p className="text-xs text-gray-600">SIRET: {data.facturation_siret}</p>
                        )}
                    </div>
                )}

                {/* Type de colis */}
                {data.type_colis && (
                    <div className="pb-3 border-b">
                        <p className="text-xs text-gray-500 mb-1">📦 TYPE DE COLIS</p>
                        <p className="text-gray-700">{data.type_colis}</p>
                    </div>
                )}

                {/* Formule et Prix */}
                <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">⚡ FORMULE</p>
                    <p className="font-bold text-[#0B2D55] text-lg">
                        {data.formule ? data.formule.toUpperCase() : "—"}
                    </p>
                </div>

                {selectedPrice && (
                    <div className="bg-[#FFCC00]/10 p-4 rounded-lg mt-4">
                        <p className="text-xs text-gray-600 mb-1">PRIX TOTAL</p>
                        <p className="text-3xl font-bold text-[#0B2D55]">
                            {selectedPrice.totalEuros.toFixed(2)}€
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedPrice.totalBons.toFixed(2)} bons × 5.50€
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const CommandeSansCompte = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // États pour le calcul tarifaire
    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);
    const [villeArrivee, setVilleArrivee] = useState<string>("");

    // ✅ State global pour le récapitulatif dynamique
    const [orderData, setOrderData] = useState({
        expediteur_nom: "",
        expediteur_telephone: "",
        expediteur_email: "",
        destinataire_nom: "",
        destinataire_telephone: "",
        adresse_retrait: "",
        adresse_livraison: "",
        facturation_societe: "",
        facturation_siret: "",
        type_colis: "",
        formule: "",
        prix: 0,
    });

    const [formData, setFormData] = useState({
        // Expéditeur
        senderName: "",
        senderPhone: "",
        senderEmail: "",

        // Destinataire
        recipientName: "",
        recipientPhone: "",

        // Facturation
        billingName: "",
        billingAddress: "",
        billingZip: "",
        billingCity: "",
        companyName: "",
        siret: "",

        // Retrait
        pickupAddress: "",
        pickupZip: "",
        pickupCity: "",
        pickupInstructions: "",

        // Livraison
        deliveryAddress: "",
        deliveryZip: "",
        deliveryCity: "",
        deliveryInstructions: "",

        // Détails
        packageType: "",
        otherPackageType: "",
        formula: "",
        schedule: "asap",
        scheduleTime: "",
    });

    // État pour savoir si la formule Standard doit être grisée
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    // Calculer le prix automatiquement quand l'adresse de livraison change
    useEffect(() => {
        const calculerPrix = async () => {
            if (!formData.deliveryAddress || formData.deliveryAddress.length < 10) {
                setPricingResults(null);
                setPricingError(null);
                setVilleArrivee("");
                return;
            }

            // Vérifier si on a une ville de départ
            if (!formData.pickupCity) {
                // On ne peut pas calculer sans ville de départ
                return;
            }

            setIsCalculatingPrice(true);
            setPricingError(null);

            try {
                // Géocoder les deux adresses pour obtenir les coordonnées et calculer la distance
                const pickupGeocode = await geocoderAdresse(formData.pickupAddress);
                const deliveryGeocode = await geocoderAdresse(formData.deliveryAddress);

                // Calculer la distance entre les deux points (en km)
                const distanceKm = calculerDistance(
                    parseFloat(pickupGeocode.latitude.toString()),
                    parseFloat(pickupGeocode.longitude.toString()),
                    parseFloat(deliveryGeocode.latitude.toString()),
                    parseFloat(deliveryGeocode.longitude.toString())
                );

                setVilleArrivee(deliveryGeocode.ville);

                // Charger la configuration de pricing depuis la base de données
                const config = await loadPricingConfigCached();

                // Calculer les tarifs avec la distance en MÈTRES (nouveau moteur)
                const results = await calculerToutesLesFormulesAsync(formData.pickupCity, deliveryGeocode.ville, distanceKm * 1000, config);
                setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
            } catch (error) {
                if (error instanceof Error) {
                    setPricingError(error.message);
                } else {
                    setPricingError("Erreur lors du calcul du prix");
                }
                setPricingResults(null);
                setVilleArrivee("");
            } finally {
                setIsCalculatingPrice(false);
            }
        };

        const timeoutId = setTimeout(calculerPrix, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.deliveryAddress, formData.deliveryCity, formData.pickupCity, formData.pickupAddress]);

    // Vérifier si la formule Standard doit être grisée
    useEffect(() => {
        if (formData.schedule === 'asap') {
            // Condition A: "Dès que possible" sélectionné → griser Standard
            setIsStandardDisabled(true);
        } else if (formData.schedule === 'slot') {
            // Condition B: Vérifier le délai du créneau choisi
            if (formData.scheduleTime) {
                const now = new Date();
                const selectedDateTime = new Date(formData.scheduleTime);
                const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);

                // Si le délai est strictement inférieur à 60 minutes → griser Standard
                setIsStandardDisabled(delayInMinutes < 60);
            } else {
                // Si pas de date/heure sélectionnée, ne pas griser
                setIsStandardDisabled(false);
            }
        } else {
            // Pour tout autre cas, ne pas griser
            setIsStandardDisabled(false);
        }
    }, [formData.schedule, formData.scheduleTime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // ✅ Mise à jour du récapitulatif en temps réel
        if (name === 'senderName') setOrderData(prev => ({ ...prev, expediteur_nom: value }));
        if (name === 'senderPhone') setOrderData(prev => ({ ...prev, expediteur_telephone: value }));
        if (name === 'senderEmail') setOrderData(prev => ({ ...prev, expediteur_email: value }));
        if (name === 'recipientName') setOrderData(prev => ({ ...prev, destinataire_nom: value }));
        if (name === 'recipientPhone') setOrderData(prev => ({ ...prev, destinataire_telephone: value }));
        if (name === 'pickupAddress') setOrderData(prev => ({ ...prev, adresse_retrait: value }));
        if (name === 'deliveryAddress') setOrderData(prev => ({ ...prev, adresse_livraison: value }));
        if (name === 'companyName') setOrderData(prev => ({ ...prev, facturation_societe: value }));
        if (name === 'siret') setOrderData(prev => ({ ...prev, facturation_siret: value }));
        if (name === 'packageType' || name === 'otherPackageType') {
            setOrderData(prev => ({ ...prev, type_colis: value }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // ✅ Mise à jour du récapitulatif pour les selects
        if (name === 'formula') setOrderData(prev => ({ ...prev, formule: value }));
        if (name === 'packageType') setOrderData(prev => ({ ...prev, type_colis: value }));
    };

    const validateForm = () => {
        const errors = [];

        // Expéditeur
        if (!formData.senderName) errors.push("Nom expéditeur requis");
        if (!formData.senderPhone) errors.push("Téléphone expéditeur requis");
        if (!formData.senderEmail) errors.push("Email expéditeur requis");

        // Destinataire
        if (!formData.recipientName) errors.push("Nom destinataire requis");
        if (!formData.recipientPhone) errors.push("Téléphone destinataire requis");

        // Facturation
        if (!formData.billingName) errors.push("Nom de facturation requis");
        if (!formData.billingAddress) errors.push("Adresse de facturation requise");
        if (!formData.billingZip) errors.push("Code postal facturation requis");
        if (!formData.billingCity) errors.push("Ville facturation requise");

        if (!formData.companyName) errors.push("Nom de l'entreprise requis");
        if (!formData.siret || formData.siret.length !== 14) errors.push("SIRET valide (14 chiffres) requis");

        // Adresses
        if (!formData.pickupAddress) errors.push("Adresse de retrait requise");
        if (!formData.pickupZip) errors.push("Code postal retrait requis");
        if (!formData.pickupCity) errors.push("Ville retrait requise");

        if (!formData.deliveryAddress) errors.push("Adresse de livraison requise");
        if (!formData.deliveryZip) errors.push("Code postal livraison requis");
        if (!formData.deliveryCity) errors.push("Ville livraison requise");

        // Colis
        if (!formData.packageType) errors.push("Type de colis requis");
        if (formData.packageType === "autre" && !formData.otherPackageType) errors.push("Précisez le type de colis");

        // Formule
        if (!formData.formula) errors.push("Veuillez sélectionner une formule de livraison");

        // Horaire
        if (formData.schedule === 'slot' && !formData.scheduleTime) {
            errors.push("Veuillez choisir un créneau horaire");
        }

        return errors;
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm();

        if (errors.length > 0) {
            toast({
                variant: "destructive",
                title: "Erreur de validation",
                description: errors[0], // Affiche la première erreur
            });
            return;
        }

        if (!pricingResults) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de calculer le prix. Veuillez vérifier les adresses.",
            });
            return;
        }

        setLoading(true);

        try {
            // Déterminer la clé de formule correcte pour récupérer le prix
            let pricingKey: FormuleNew | null = null;
            if (formData.formula === 'express') pricingKey = 'EXPRESS';
            else if (formData.formula === 'flash') pricingKey = 'URGENCE';
            else if (formData.formula === 'standard') pricingKey = 'NORMAL';

            if (!pricingKey) {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Veuillez sélectionner une formule valide.",
                });
                return;
            }

            const selectedPrice = pricingResults[pricingKey];

            // DEBUG: Voir ce qui est envoyé
            console.log('📋 Données formulaire:', {
                schedule: formData.schedule,
                scheduleTime: formData.scheduleTime,
                willSendScheduleTime: formData.schedule === 'custom' ? formData.scheduleTime : undefined
            });

            // Importer dynamiquement le service
            const { createGuestOrder } = await import('@/services/guestOrderService');

            // Appel au service pour créer la commande
            const response = await createGuestOrder({
                senderName: formData.senderName,
                senderEmail: formData.senderEmail,
                senderPhone: formData.senderPhone,

                pickupAddress: formData.pickupAddress,
                pickupDetails: formData.pickupInstructions,

                recipientName: formData.recipientName,
                recipientPhone: formData.recipientPhone,

                deliveryAddress: formData.deliveryAddress,
                deliveryDetails: formData.deliveryInstructions,

                packageDescription: formData.packageType === 'autre' ? formData.otherPackageType : formData.packageType,
                formula: pricingKey,
                pricingResult: selectedPrice,
                villeArrivee: villeArrivee,

                // Horaire planifié (si "Choisir un créneau" sélectionné)
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

            if (response.success && response.reference) {
                toast({
                    title: "Commande enregistrée avec succès !",
                    description: `Votre commande ${response.reference} a bien été transmise. Vous recevrez un email de confirmation.`,
                    className: "bg-[#0B2D55] text-white border-none",
                });

                // Optionnel : rediriger vers une page de succès
                // navigate('/order-success', { state: { reference: response.reference } });
            } else {
                throw new Error(response.error || response.message || "Erreur lors de la création de la commande");
            }

        } catch (error: any) {
            console.error("Erreur lors de la commande:", error);
            toast({
                variant: "destructive",
                title: "Erreur d'enregistrement",
                description: error.message || "Une erreur est survenue lors de l'envoi de la commande. Veuillez réessayer ou nous contacter.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F6FA] font-sans">
            <Header />

            {/* Hero Section */}
            <section className="bg-[#0B2D55] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">
                        Commander une course sans compte
                    </h1>
                    <p className="text-lg text-white/80 font-poppins">
                        Rapide, sécurisé, sans inscription.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                {/* ✅ Structure à deux colonnes : formulaire à gauche, récap à droite */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                    {/* Zone formulaire (2/3 de l'espace) */}
                    <div id="form-zone" className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* A. Expéditeur */}
                            <Card className="p-6 md:p-8 bg-white border-none shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-[#F2F6FA] flex items-center justify-center">
                                        <Package className="h-5 w-5 text-[#0B2D55]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[#0B2D55] font-poppins">Expéditeur</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="senderName">Nom complet *</Label>
                                        <Input
                                            id="senderName"
                                            name="senderName"
                                            value={formData.senderName}
                                            onChange={handleChange}
                                            placeholder="Jean Dupont"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="senderPhone">Téléphone *</Label>
                                        <Input
                                            id="senderPhone"
                                            name="senderPhone"
                                            value={formData.senderPhone}
                                            onChange={handleChange}
                                            placeholder="06 12 34 56 78"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Obligatoire pour le coursier
                                        </p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="senderEmail">Email *</Label>
                                        <Input
                                            id="senderEmail"
                                            name="senderEmail"
                                            type="email"
                                            value={formData.senderEmail}
                                            onChange={handleChange}
                                            placeholder="jean.dupont@email.com"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Pour la confirmation et la facture
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* B. Destinataire */}
                            <Card className="p-6 md:p-8 bg-white border-none shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-[#F2F6FA] flex items-center justify-center">
                                        <Package className="h-5 w-5 text-[#0B2D55]" />
                                    </div>
                                    <h2 className="text-xl font-bold text-[#0B2D55] font-poppins">Destinataire</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="recipientName">Nom complet *</Label>
                                        <Input
                                            id="recipientName"
                                            name="recipientName"
                                            value={formData.recipientName}
                                            onChange={handleChange}
                                            placeholder="Marie Martin"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="recipientPhone">Téléphone *</Label>
                                        <Input
                                            id="recipientPhone"
                                            name="recipientPhone"
                                            value={formData.recipientPhone}
                                            onChange={handleChange}
                                            placeholder="06 98 76 54 32"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Obligatoire pour la remise
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* C. Facturation */}
                            <Card className="p-6 md:p-8 bg-white border-none shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#0B2D55] font-poppins">Facturation</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Ma Société SAS"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="siret">SIRET (14 chiffres) *</Label>
                                        <Input
                                            id="siret"
                                            name="siret"
                                            value={formData.siret}
                                            onChange={handleChange}
                                            placeholder="12345678900012"
                                            maxLength={14}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="billingName">Nom à facturer *</Label>
                                        <Input
                                            id="billingName"
                                            name="billingName"
                                            value={formData.billingName}
                                            onChange={handleChange}
                                            placeholder="Service Comptabilité"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="billingAddress">Adresse *</Label>
                                        <Input
                                            id="billingAddress"
                                            name="billingAddress"
                                            value={formData.billingAddress}
                                            onChange={handleChange}
                                            placeholder="10 rue de la Paix"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billingZip">Code postal *</Label>
                                        <Input
                                            id="billingZip"
                                            name="billingZip"
                                            value={formData.billingZip}
                                            onChange={handleChange}
                                            placeholder="75000"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="billingCity">Ville *</Label>
                                        <Input
                                            id="billingCity"
                                            name="billingCity"
                                            value={formData.billingCity}
                                            onChange={handleChange}
                                            placeholder="Paris"
                                            required
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* D & E. Adresses Retrait / Livraison */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Retrait */}
                                <Card className="p-6 bg-white border-none shadow-sm">
                                    <h2 className="text-xl font-bold text-[#0B2D55] font-poppins mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#0B2D55] text-white text-sm flex items-center justify-center">1</span>
                                        Adresse de retrait
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <AddressAutocomplete
                                                value={formData.pickupAddress}
                                                onChange={(value) => {
                                                    setFormData({ ...formData, pickupAddress: value });
                                                    setOrderData(prev => ({ ...prev, adresse_retrait: value }));
                                                }}
                                                onAddressSelect={(suggestion) => {
                                                    const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                                    setFormData({
                                                        ...formData,
                                                        pickupAddress: fullAddress,
                                                        pickupZip: suggestion.postcode,
                                                        pickupCity: suggestion.city
                                                    });
                                                    setOrderData(prev => ({ ...prev, adresse_retrait: fullAddress }));
                                                }}
                                                label="Adresse complète"
                                                placeholder="123 Avenue des Champs-Élysées"
                                                required
                                                name="pickupAddress"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="pickupZip">Code postal *</Label>
                                                <Input
                                                    id="pickupZip"
                                                    name="pickupZip"
                                                    value={formData.pickupZip}
                                                    onChange={handleChange}
                                                    placeholder="75008"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pickupCity">Ville *</Label>
                                                <Input
                                                    id="pickupCity"
                                                    name="pickupCity"
                                                    value={formData.pickupCity}
                                                    onChange={handleChange}
                                                    placeholder="Paris"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pickupInstructions">Instructions (digicode, étage...)</Label>
                                            <Textarea
                                                id="pickupInstructions"
                                                name="pickupInstructions"
                                                value={formData.pickupInstructions}
                                                onChange={handleChange}
                                                placeholder="Code A123, 2ème étage..."
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                {/* Livraison */}
                                <Card className="p-6 bg-white border-none shadow-sm">
                                    <h2 className="text-xl font-bold text-[#0B2D55] font-poppins mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#FFCC00] text-[#0B2D55] text-sm flex items-center justify-center">2</span>
                                        Adresse de livraison
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <AddressAutocomplete
                                                value={formData.deliveryAddress}
                                                onChange={(value) => {
                                                    setFormData({ ...formData, deliveryAddress: value });
                                                    setOrderData(prev => ({ ...prev, adresse_livraison: value }));
                                                }}
                                                onAddressSelect={async (suggestion) => {
                                                    const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                                    setFormData({
                                                        ...formData,
                                                        deliveryAddress: fullAddress,
                                                        deliveryZip: suggestion.postcode,
                                                        deliveryCity: suggestion.city
                                                    });
                                                    setOrderData(prev => ({ ...prev, adresse_livraison: fullAddress }));

                                                    // Calculer automatiquement le prix avec la ville sélectionnée
                                                    if (suggestion.city && formData.pickupCity) {
                                                        setIsCalculatingPrice(true);
                                                        setPricingError(null);
                                                        try {
                                                            setVilleArrivee(suggestion.city);
                                                            // Charger la configuration de pricing
                                                            const config = await loadPricingConfigCached();
                                                            // Distance par défaut de 0 si pas encore calculée
                                                            const results = await calculerToutesLesFormulesAsync(formData.pickupCity, suggestion.city, 0, config);
                                                            setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
                                                        } catch (error) {
                                                            if (error instanceof Error) {
                                                                setPricingError(error.message);
                                                            } else {
                                                                setPricingError("Erreur lors du calcul du prix");
                                                            }
                                                            setPricingResults(null);
                                                        } finally {
                                                            setIsCalculatingPrice(false);
                                                        }
                                                    }
                                                }}
                                                label="Adresse complète"
                                                placeholder="456 Rue de Rivoli"
                                                required
                                                name="deliveryAddress"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="deliveryZip">Code postal *</Label>
                                                <Input
                                                    id="deliveryZip"
                                                    name="deliveryZip"
                                                    value={formData.deliveryZip}
                                                    onChange={handleChange}
                                                    placeholder="75001"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="deliveryCity">Ville *</Label>
                                                <Input
                                                    id="deliveryCity"
                                                    name="deliveryCity"
                                                    value={formData.deliveryCity}
                                                    onChange={handleChange}
                                                    placeholder="Paris"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryInstructions">Instructions (digicode, étage...)</Label>
                                            <Textarea
                                                id="deliveryInstructions"
                                                name="deliveryInstructions"
                                                value={formData.deliveryInstructions}
                                                onChange={handleChange}
                                                placeholder="Interphone B, laisser à l'accueil..."
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* F, G, H. Détails de la course */}
                            <Card className="p-6 md:p-8 bg-white border-none shadow-sm">
                                <h2 className="text-xl font-bold text-[#0B2D55] font-poppins mb-6">Détails de la course</h2>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <Label>Type de colis *</Label>
                                        <Select
                                            value={formData.packageType}
                                            onValueChange={(val) => handleSelectChange("packageType", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="document">Document / Pli</SelectItem>
                                                <SelectItem value="petit_colis">Petit colis</SelectItem>
                                                <SelectItem value="materiel_sensible">Matériel sensible</SelectItem>
                                                <SelectItem value="medical">Colis médical</SelectItem>
                                                <SelectItem value="autre">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formData.packageType === "autre" && (
                                            <Input
                                                name="otherPackageType"
                                                value={formData.otherPackageType}
                                                onChange={handleChange}
                                                placeholder="Précisez la nature du colis"
                                                className="mt-2"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {pricingError && (
                                            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                {pricingError}
                                            </div>
                                        )}
                                        <Label>Formule *</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "standard", label: "Standard", icon: Truck, pricingKey: "NORMAL" },
                                                { id: "express", label: "Express", icon: Clock, pricingKey: "EXPRESS" },
                                                { id: "flash", label: "Flash", icon: Zap, pricingKey: "URGENCE" },
                                            ].map((f) => {
                                                const price = pricingResults ? pricingResults[f.pricingKey as FormuleNew] : null;
                                                const isDisabled = !pricingResults || !!pricingError || (f.id === "standard" && isStandardDisabled);

                                                return (
                                                    <div
                                                        key={f.id}
                                                        className={`rounded-lg border-2 p-3 text-center transition-all ${isDisabled
                                                            ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                                                            : formData.formula === f.id
                                                                ? "border-[#FFCC00] bg-[#FFCC00]/10 cursor-pointer"
                                                                : "border-gray-100 hover:border-gray-200 cursor-pointer"
                                                            }`}
                                                        onClick={() => {
                                                            if (!isDisabled) {
                                                                handleSelectChange("formula", f.id);
                                                            }
                                                        }}
                                                    >
                                                        <f.icon className={`h-5 w-5 mx-auto mb-1 ${isDisabled
                                                            ? "text-gray-300"
                                                            : formData.formula === f.id
                                                                ? "text-[#0B2D55]"
                                                                : "text-gray-400"
                                                            }`} />
                                                        <span className={`text-xs font-bold block ${isDisabled
                                                            ? "text-gray-400"
                                                            : formData.formula === f.id
                                                                ? "text-[#0B2D55]"
                                                                : "text-gray-500"
                                                            }`}>
                                                            {f.label}
                                                        </span>
                                                        {price && !isDisabled && (
                                                            <span className="text-xs font-bold text-[#0B2D55] mt-1 block">
                                                                {price.totalEuros.toFixed(2)}€
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Horaire de prise en charge *</Label>
                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            type="button"
                                            variant={formData.schedule === "asap" ? "cta" : "outline"}
                                            onClick={() => handleSelectChange("schedule", "asap")}
                                            className={formData.schedule === "asap" ? "text-white" : ""}
                                        >
                                            Dès que possible
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.schedule === "slot" ? "cta" : "outline"}
                                            onClick={() => handleSelectChange("schedule", "slot")}
                                            className={formData.schedule === "slot" ? "text-white" : ""}
                                        >
                                            Choisir un créneau
                                        </Button>
                                    </div>
                                    {formData.schedule === "slot" && (
                                        <Input
                                            type="datetime-local"
                                            name="scheduleTime"
                                            value={formData.scheduleTime}
                                            onChange={handleChange}
                                            className="mt-2 max-w-xs"
                                        />
                                    )}
                                    {formData.schedule === "slot" && isStandardDisabled && formData.scheduleTime && (
                                        <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Récapitulatif de la commande (mobile uniquement) */}
                            {pricingResults && (
                                <div className="lg:hidden animate-fade-in-up">
                                    <OrderSummary
                                        pickupAddress={formData.pickupAddress}
                                        deliveryAddress={formData.deliveryAddress}
                                        senderName={formData.senderName}
                                        senderPhone={formData.senderPhone}
                                        recipientName={formData.recipientName}
                                        recipientPhone={formData.recipientPhone}
                                        packageDescription={formData.packageType === 'autre' ? formData.otherPackageType : formData.packageType}
                                        pricingResult={pricingResults[formData.formula === 'express' ? 'EXPRESS' : formData.formula === 'flash' ? 'URGENCE' : 'NORMAL']}
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#FFCC00] hover:bg-[#E6B800] text-[#0B2D55] font-bold py-6 text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
                                disabled={loading}
                            >
                                {loading ? "Enregistrement..." : "Commander maintenant"}
                            </Button>

                        </form>
                    </div>

                    {/* ✅ Zone récapitulatif (1/3 de l'espace, sticky à droite) */}
                    <div id="recap-zone" className="hidden lg:block">
                        <div className="sticky top-4">
                            <RecapCommande
                                data={orderData}
                                pricingResults={pricingResults}
                                formData={formData}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CommandeSansCompte;

