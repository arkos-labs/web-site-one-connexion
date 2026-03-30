import { useState, useEffect, useRef } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { CreateClientModal } from "@/components/admin/clients/CreateClientModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    Plus,
    Search,
    X
} from "lucide-react";
import { geocoderAdresse, calculerDistance } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import { supabase } from "@/lib/supabase";

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

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

// Composant de récapitulatif (Adapté pour Admin)
function OrderSummary({
    formData,
    pricingResults,
    orderType
}: {
    formData: OrderFormData;
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
        <div className="bg-[#F2F6FA] p-4 rounded-xl border-2 border-[#0B2D55]/10">
            <h3 className="text-base font-bold text-[#0B2D55] mb-3 font-poppins">📋 Récapitulatif</h3>

            <div className="space-y-2 text-sm">
                {/* Client (Admin specific) */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">👤 CLIENT</p>
                    {formData.clientName ? (
                        <div>
                            <p className="text-gray-700 font-semibold">{formData.clientName}</p>
                            {formData.clientCompany && <p className="text-xs text-gray-500">{formData.clientCompany}</p>}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">Aucun client sélectionné</p>
                    )}
                </div>

                {/* Horaire de prise en charge */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">⏰ HORAIRE</p>
                    <p className="text-gray-700 font-semibold">{getOrderTypeText()}</p>
                </div>

                {/* Adresse de retrait */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 RETRAIT</p>
                    <p className="text-gray-700">{formData.pickupAddress || "—"}</p>
                    {formData.pickupContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.pickupContact}</p>
                    )}
                </div>

                {/* Adresse de livraison */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">📍 LIVRAISON</p>
                    <p className="text-gray-700">{formData.deliveryAddress || "—"}</p>
                    {formData.deliveryContact && (
                        <p className="text-xs text-gray-600 mt-1">{formData.deliveryContact}</p>
                    )}
                </div>

                {/* Type de colis */}
                {formData.packageType && (
                    <div className="pb-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">📦 TYPE DE COLIS</p>
                        <p className="text-gray-700 capitalize">{formData.packageType}</p>
                    </div>
                )}

                {/* Formule */}
                <div className="pt-1">
                    <p className="text-xs text-gray-500 mb-1">⚡ FORMULE</p>
                    <p className="font-bold text-[#0B2D55] text-base uppercase">
                        {formData.formula || "—"}
                    </p>
                </div>

                {/* Prix */}
                {selectedPrice && (
                    <div className="bg-[#FFCC00]/10 p-3 rounded-lg mt-2">
                        <p className="text-xs text-gray-600 mb-1">PRIX TOTAL</p>
                        <p className="text-2xl font-bold text-[#0B2D55]">
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

const CreateOrderModal = ({ isOpen, onClose, onSubmit }: CreateOrderModalProps) => {
    // État pour le type de commande: immediate ou deferred
    const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');

    // État pour savoir si la formule Standard doit être grisée
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    // États pour la recherche client
    const [clients, setClients] = useState<any[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Charger les clients au montage
    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    // Fermer le dropdown au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false);
            }
        };

        if (showClientDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showClientDropdown]);

    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('id, first_name, last_name, email, phone, company_name')
                .order('last_name');

            if (error) {
                console.error("Erreur chargement clients:", error);
            } else if (data) {
                setClients(data);
            }
        } catch (error) {
            console.error("Erreur chargement clients:", error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId: client.id,
                clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
                clientEmail: client.email,
                clientPhone: client.phone || "",
                clientCompany: client.company_name || "",
                // Pré-remplir le contact pickup si vide
                pickupContact: prev.pickupContact || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
                pickupPhone: prev.pickupPhone || client.phone || ""
            }));
        }
    };

    const handleClientCreated = (newClient: any) => {
        // Ajouter le nouveau client à la liste
        setClients(prev => [...prev, newClient]);
        // Sélectionner automatiquement le nouveau client
        handleClientSelect(newClient.id);
        setClientSearchTerm(`${newClient.first_name || ''} ${newClient.last_name || ''}`.trim() || newClient.email);
    };

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
                const results = await calculerToutesLesFormulesAsync(
                    formData.pickupCity,
                    deliveryGeocode.ville,
                    distanceKm * 1000,
                    config
                );
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
            title="Créer une commande (Admin)"
            size="xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="cta"
                        disabled={!formData.pickupAddress || !formData.deliveryAddress || !formData.clientId}
                        onClick={handleSubmit}
                    >
                        Créer la commande
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full overflow-hidden">
                {/* Formulaire - 2/3 de l'espace */}
                <div className="lg:col-span-2 overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* SÉLECTION CLIENT (ADMIN ONLY) */}
                        <div className="bg-[#ed5518] p-4 rounded-lg border border-blue-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[#ed5518] font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Sélectionner un client
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#ed5518] hover:text-[#ed5518] h-8"
                                    onClick={() => setShowCreateClientModal(true)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Nouveau client
                                </Button>
                            </div>

                            {/* Champ de recherche client */}
                            <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Rechercher un client par nom, email ou société..."
                                        value={clientSearchTerm}
                                        onChange={(e) => {
                                            setClientSearchTerm(e.target.value);
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        className="pl-10 bg-white"
                                    />
                                </div>

                                {/* Dropdown des clients */}
                                {showClientDropdown && !formData.clientId && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {isLoadingClients ? (
                                            <div className="p-3 text-center text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                            </div>
                                        ) : (
                                            <>
                                                {clients
                                                    .filter(client => {
                                                        const searchLower = clientSearchTerm.toLowerCase();
                                                        const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
                                                        const email = (client.email || '').toLowerCase();
                                                        const company = (client.company_name || '').toLowerCase();
                                                        return fullName.includes(searchLower) ||
                                                            email.includes(searchLower) ||
                                                            company.includes(searchLower);
                                                    })
                                                    .map(client => (
                                                        <div
                                                            key={client.id}
                                                            onClick={() => {
                                                                handleClientSelect(client.id);
                                                                setClientSearchTerm(`${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email);
                                                                setShowClientDropdown(false);
                                                            }}
                                                            className="p-3 hover:bg-[#ed5518] cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-900">
                                                                {client.first_name} {client.last_name}
                                                            </div>
                                                            {client.company_name && (
                                                                <div className="text-xs text-gray-600">{client.company_name}</div>
                                                            )}
                                                            <div className="text-xs text-gray-500">{client.email}</div>
                                                        </div>
                                                    ))}
                                                {clients.filter(client => {
                                                    const searchLower = clientSearchTerm.toLowerCase();
                                                    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
                                                    const email = (client.email || '').toLowerCase();
                                                    const company = (client.company_name || '').toLowerCase();
                                                    return fullName.includes(searchLower) ||
                                                        email.includes(searchLower) ||
                                                        company.includes(searchLower);
                                                }).length === 0 && (
                                                        <div className="p-3 text-center text-gray-500 text-sm">
                                                            Aucun client trouvé
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Client sélectionné */}
                            {formData.clientName && (
                                <div className="bg-white p-3 rounded border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{formData.clientName}</div>
                                            {formData.clientCompany && (
                                                <div className="text-xs text-gray-600">{formData.clientCompany}</div>
                                            )}
                                            <div className="text-xs text-gray-500">{formData.clientEmail}</div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    clientId: "",
                                                    clientName: "",
                                                    clientEmail: "",
                                                    clientPhone: "",
                                                    clientCompany: "",
                                                }));
                                                setClientSearchTerm("");
                                            }}
                                            className="text-red-500 hover:text-red-700 h-8"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Enlèvement */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-accent-main" />
                                </div>
                                <h3 className="text-base font-semibold text-[#ed5518]">
                                    Informations d'enlèvement
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
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
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-success" />
                                </div>
                                <h3 className="text-base font-semibold text-[#ed5518]">
                                    Informations de livraison
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
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
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#ed5518]/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-[#ed5518]" />
                                </div>
                                <h3 className="text-base font-semibold text-[#ed5518]">
                                    Détails de la commande
                                </h3>
                            </div>

                            <div className="space-y-3">
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
                                        <div className="p-2 mb-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                                            <AlertCircle className="h-3 w-3" />
                                            {pricingError}
                                        </div>
                                    )}
                                    <Label className="text-sm">Formule de livraison *</Label>
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
                                                    className={`rounded-lg border-2 p-2 text-center transition-all ${isDisabled
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
                                                        className={`h-4 w-4 mx-auto mb-1 ${isDisabled
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
                        <div className="space-y-2 pt-3 border-t">
                            <Label className="text-sm font-semibold text-[#0B2D55]">
                                Horaire de prise en charge *
                            </Label>

                            <div className="flex gap-2">
                                {/* Dès que possible */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderType('immediate');
                                        setFormData({ ...formData, pickupDate: '', pickupTime: '' });
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${orderType === 'immediate'
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
                                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${orderType === 'deferred'
                                        ? 'bg-[#FFCC00] text-[#0B2D55] shadow-md'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    Choisir un créneau
                                </button>
                            </div>

                            {/* Affichage conditionnel de la sélection de date/heure */}
                            {orderType === 'deferred' && (
                                <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-[#F2F6FA] rounded-lg border border-gray-200">
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

                            {/* Message d'alerte si Standard est grisé pour créneau < 60 min */}
                            {orderType === 'deferred' && isStandardDisabled && formData.pickupDate && formData.pickupTime && (
                                <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Récapitulatif - 1/3 de l'espace */}
                <div className="lg:col-span-1 overflow-y-auto pl-2 border-l border-gray-100">
                    <OrderSummary
                        formData={formData}
                        pricingResults={pricingResults}
                        orderType={orderType}
                    />
                </div>
            </div>

            {/* Modal de création de client */}
            <CreateClientModal
                isOpen={showCreateClientModal}
                onClose={() => setShowCreateClientModal(false)}
                onSuccess={handleClientCreated}
            />
        </UniversalModal>
    );
};

export default CreateOrderModal;


