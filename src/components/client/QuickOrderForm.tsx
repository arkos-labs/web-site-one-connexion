import { useState, useEffect } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import {
    MapPin,
    Package,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Truck,
    Zap,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { calculerToutesLesFormules, type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";

interface QuickOrderFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: OrderFormData) => void;
}

export interface OrderFormData {
    pickupAddress: string;
    pickupCity: string;
    pickupContact: string;
    pickupPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryContact: string;
    deliveryPhone: string;
    packageType: string;
    formula: FormuleNew;
    pickupDate: string;
    pickupTime: string;
    notes: string;
    pricingResult?: CalculTarifaireResult;
}

// Composant de récapitulatif
function OrderSummary({
    formData,
    pricingResults,
    orderType
}: {
    formData: any;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    orderType: 'immediate' | 'deferred';
}) {
    const selectedPrice = pricingResults ? pricingResults[formData.formula] : null;

    // Déterminer le texte du type de commande
    const getOrderTypeText = () => {
        switch (orderType) {
            case 'immediate':
                return 'Dès que possible';
            case 'deferred':
                return `${formData.pickupDate || 'jj/mm/aaaa'} à ${formData.pickupTime || '--:--'}`;
            default:
                return '—';
        }
    };

    return (
        <div className="bg-[#F2F6FA] p-6 rounded-xl border-2 border-[#0B2D55]/10">
            <h3 className="text-lg font-bold text-[#0B2D55] mb-4 font-poppins">📋 Récapitulatif</h3>

            <div className="space-y-3 text-sm">
                {/* Horaire de prise en charge */}
                <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">⏰ HORAIRE</p>
                    <p className="text-gray-700 font-semibold">{getOrderTypeText()}</p>
                </div>

                {/* Adresse de retrait */}
                <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 RETRAIT</p>
                    <p className="text-gray-700">{formData.pickupAddress || "—"}</p>
                    {formData.pickupContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.pickupContact}</p>
                    )}
                </div>

                {/* Adresse de livraison */}
                <div className="pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 LIVRAISON</p>
                    <p className="text-gray-700">{formData.deliveryAddress || "—"}</p>
                    {formData.deliveryContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.deliveryContact}</p>
                    )}
                </div>

                {/* Type de colis */}
                {formData.packageType && (
                    <div className="pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">📦 TYPE DE COLIS</p>
                        <p className="text-gray-700 capitalize">{formData.packageType}</p>
                    </div>
                )}

                {/* Formule */}
                <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">⚡ FORMULE</p>
                    <p className="font-bold text-[#0B2D55] text-lg uppercase">
                        {formData.formula || "—"}
                    </p>
                </div>

                {/* Prix */}
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

export const QuickOrderForm = ({ isOpen, onClose, onSubmit }: QuickOrderFormProps) => {
    // État pour le type de commande: immediate ou deferred
    const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');

    // État pour savoir si la formule Standard doit être grisée
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    const [formData, setFormData] = useState<OrderFormData>({
        pickupAddress: "",
        pickupCity: "",
        pickupContact: "",
        pickupPhone: "",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryContact: "",
        deliveryPhone: "",
        packageType: "standard",
        formula: "NORMAL",
        pickupDate: "",
        pickupTime: "",
        notes: "",
    });

    // États pour le calcul tarifaire
    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);

    // Calculer le prix automatiquement quand les adresses changent
    useEffect(() => {
        const calculerPrix = async () => {
            if (!formData.deliveryAddress || formData.deliveryAddress.length < 10) {
                setPricingResults(null);
                setPricingError(null);
                return;
            }

            if (!formData.pickupCity || !formData.pickupAddress) {
                return;
            }

            setIsCalculatingPrice(true);
            setPricingError(null);

            try {
                // Géocoder les deux adresses
                const pickupGeocode = await geocoderAdresse(formData.pickupAddress);
                const deliveryGeocode = await geocoderAdresse(formData.deliveryAddress);

                // Calculer la distance
                const distanceKm = calculerDistance(
                    parseFloat(pickupGeocode.latitude.toString()),
                    parseFloat(pickupGeocode.longitude.toString()),
                    parseFloat(deliveryGeocode.latitude.toString()),
                    parseFloat(deliveryGeocode.longitude.toString())
                );

                // Charger la configuration de pricing depuis la base de données
                const config = await loadPricingConfigCached();

                // Calculer les tarifs (distance en mètres)
                const results = calculerToutesLesFormules(
                    formData.pickupCity,
                    deliveryGeocode.ville,
                    distanceKm * 1000,
                    config
                );
                setPricingResults(results);
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
        };

        const timeoutId = setTimeout(calculerPrix, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.deliveryAddress, formData.deliveryCity, formData.pickupCity, formData.pickupAddress]);

    // Vérifier si la formule Standard doit être grisée
    useEffect(() => {
        if (orderType === 'immediate') {
            // Condition A: "Dès que possible" sélectionné → griser Standard
            setIsStandardDisabled(true);
        } else if (orderType === 'deferred') {
            // Condition B: Vérifier le délai du créneau choisi
            if (formData.pickupDate && formData.pickupTime) {
                const now = new Date();
                const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
                const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);

                // Si le délai est strictement inférieur à 60 minutes → griser Standard
                setIsStandardDisabled(delayInMinutes < 60);
            } else {
                // Si pas de date/heure sélectionnée, ne pas griser
                setIsStandardDisabled(false);
            }
        }
    }, [orderType, formData.pickupDate, formData.pickupTime]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ajouter le résultat de pricing à la soumission
        const dataToSubmit = {
            ...formData,
            pricingResult: pricingResults ? pricingResults[formData.formula] : undefined
        };

        onSubmit(dataToSubmit);
    };

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle commande"
            size="xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="cta" onClick={handleSubmit} className="gap-2">
                        <Package className="h-4 w-4" />
                        Créer la commande
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full overflow-hidden">
                {/* Formulaire - 2/3 de l'espace */}
                <div className="lg:col-span-2 overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section Enlèvement */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-accent-main" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary">
                                    Informations d'enlèvement
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <AddressAutocomplete
                                        value={formData.pickupAddress}
                                        onChange={(value) => {
                                            setFormData({ ...formData, pickupAddress: value });
                                        }}
                                        onAddressSelect={(suggestion) => {
                                            const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                            setFormData({
                                                ...formData,
                                                pickupAddress: fullAddress,
                                                pickupCity: suggestion.city
                                            });
                                        }}
                                        label="Adresse d'enlèvement *"
                                        placeholder="123 Rue de Paris, 75001 Paris"
                                        required
                                        name="pickupAddress"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pickupContact" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Contact
                                    </Label>
                                    <Input
                                        id="pickupContact"
                                        name="pickupContact"
                                        value={formData.pickupContact}
                                        onChange={handleChange}
                                        placeholder="Jean Dupont"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pickupPhone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Téléphone
                                    </Label>
                                    <Input
                                        id="pickupPhone"
                                        name="pickupPhone"
                                        type="tel"
                                        value={formData.pickupPhone}
                                        onChange={handleChange}
                                        placeholder="06 12 34 56 78"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Livraison */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-success" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary">
                                    Informations de livraison
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <AddressAutocomplete
                                        value={formData.deliveryAddress}
                                        onChange={(value) => {
                                            setFormData({ ...formData, deliveryAddress: value });
                                        }}
                                        onAddressSelect={(suggestion) => {
                                            const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                            setFormData({
                                                ...formData,
                                                deliveryAddress: fullAddress,
                                                deliveryCity: suggestion.city
                                            });
                                        }}
                                        label="Adresse de livraison *"
                                        placeholder="456 Avenue des Champs, 92100 Boulogne"
                                        required
                                        name="deliveryAddress"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deliveryContact" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Contact
                                    </Label>
                                    <Input
                                        id="deliveryContact"
                                        name="deliveryContact"
                                        value={formData.deliveryContact}
                                        onChange={handleChange}
                                        placeholder="Marie Martin"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deliveryPhone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Téléphone
                                    </Label>
                                    <Input
                                        id="deliveryPhone"
                                        name="deliveryPhone"
                                        type="tel"
                                        value={formData.deliveryPhone}
                                        onChange={handleChange}
                                        placeholder="06 98 76 54 32"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Détails */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary">
                                    Détails de la commande
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Type de colis */}
                                <div>
                                    <Label htmlFor="packageType" className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Type de colis
                                    </Label>
                                    <select
                                        id="packageType"
                                        name="packageType"
                                        value={formData.packageType}
                                        onChange={handleChange}
                                        className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="document">Document / Pli</option>
                                        <option value="petit_colis">Petit colis</option>
                                        <option value="materiel_sensible">Matériel sensible</option>
                                        <option value="medical">Colis médical</option>
                                        <option value="standard">Standard</option>
                                        <option value="fragile">Fragile</option>
                                        <option value="volumineux">Volumineux</option>
                                    </select>
                                </div>

                                {/* Formule de livraison */}
                                <div>
                                    {pricingError && (
                                        <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {pricingError}
                                        </div>
                                    )}
                                    <Label>Formule de livraison *</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {[
                                            { id: "NORMAL", label: "Standard", icon: Truck },
                                            { id: "EXPRESS", label: "Express", icon: Clock },
                                            { id: "URGENCE", label: "Flash", icon: Zap },
                                        ].map((f) => {
                                            const price = pricingResults ? pricingResults[f.id as FormuleNew] : null;
                                            const isDisabled = !pricingResults || !!pricingError || (f.id === "NORMAL" && isStandardDisabled);

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
                                                            setFormData({ ...formData, formula: f.id as FormuleNew });
                                                        }
                                                    }}
                                                >
                                                    <f.icon
                                                        className={`h-5 w-5 mx-auto mb-1 ${isDisabled
                                                            ? "text-gray-300"
                                                            : formData.formula === f.id
                                                                ? "text-[#0B2D55]"
                                                                : "text-gray-400"
                                                            }`}
                                                    />
                                                    <span
                                                        className={`text-xs font-bold block ${isDisabled
                                                            ? "text-gray-400"
                                                            : formData.formula === f.id
                                                                ? "text-[#0B2D55]"
                                                                : "text-gray-500"
                                                            }`}
                                                    >
                                                        {f.label}
                                                    </span>
                                                    {price && !isDisabled && (
                                                        <span className="text-xs font-bold text-[#0B2D55] mt-1 block">
                                                            {price.totalEuros.toFixed(2)}€
                                                        </span>
                                                    )}
                                                    {isCalculatingPrice && (
                                                        <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1 text-gray-400" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Date et heure */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="pickupDate" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date d'enlèvement *
                                        </Label>
                                        <Input
                                            id="pickupDate"
                                            name="pickupDate"
                                            type="date"
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pickupTime" className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Heure d'enlèvement
                                        </Label>
                                        <Input
                                            id="pickupTime"
                                            name="pickupTime"
                                            type="time"
                                            value={formData.pickupTime}
                                            onChange={handleChange}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label htmlFor="notes" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Notes complémentaires
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Instructions spéciales, code d'accès, étage..."
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Choix de l'horaire de prise en charge - EN BAS */}
                        <div className="space-y-3 pt-6 border-t">
                            <Label className="text-base font-semibold text-[#0B2D55]">
                                Horaire de prise en charge *
                            </Label>

                            <div className="flex gap-3">
                                {/* Dès que possible */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderType('immediate');
                                        setFormData({ ...formData, pickupDate: '', pickupTime: '' });
                                    }}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${orderType === 'immediate'
                                        ? 'bg-[#FFCC00] text-[#0B2D55] shadow-md'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    Dès que possible
                                </button>



                                {/* Choisir un créneau */}
                                <button
                                    type="button"
                                    onClick={() => setOrderType('deferred')}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${orderType === 'deferred'
                                        ? 'bg-[#FFCC00] text-[#0B2D55] shadow-md'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    Choisir un créneau
                                </button>
                            </div>

                            {/* Affichage conditionnel de la sélection de date/heure */}
                            {orderType === 'deferred' && (
                                <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-[#F2F6FA] rounded-lg border border-gray-200">
                                    <div>
                                        <Label htmlFor="pickupDate" className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            Date d'enlèvement *
                                        </Label>
                                        <Input
                                            id="pickupDate"
                                            name="pickupDate"
                                            type="date"
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                            required={orderType === 'deferred'}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pickupTime" className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4" />
                                            Heure d'enlèvement *
                                        </Label>
                                        <Input
                                            id="pickupTime"
                                            name="pickupTime"
                                            type="time"
                                            value={formData.pickupTime}
                                            onChange={handleChange}
                                            required={orderType === 'deferred'}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Messages informatifs */}
                            {orderType === 'immediate' && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-[#FFCC00]" />
                                    Un coursier sera assigné immédiatement
                                </p>
                            )}
                            {orderType === 'deferred' && isStandardDisabled && formData.pickupDate && formData.pickupTime && (
                                <p className="text-sm text-amber-600 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Récapitulatif - 1/3 de l'espace */}
                <div className="lg:col-span-1 overflow-y-auto pl-2 border-l border-gray-100">
                    <OrderSummary formData={formData} pricingResults={pricingResults} orderType={orderType} />
                </div>
            </div>
        </UniversalModal>
    );
};
