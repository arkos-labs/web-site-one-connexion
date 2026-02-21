import { useState } from "react";
import { OrderFormData } from "../OrderWizardModal";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Plus, ArrowRight, Loader2, X, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StepPickupProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    onNext: () => void;
    clients: any[];
    mode: 'admin' | 'client';
    onClientCreated?: (client: any) => void;
}

const SECTORS = [
    "Médical",
    "Événementiel",
    "Automobile",
    "Juridique",
    "Autre"
];

export const StepPickup = ({ formData, updateFormData, onNext, clients, mode, onClientCreated }: StepPickupProps) => {
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({
        company_name: "",
        sector: "",
        contact_name: "",
        email: "",
        phone: "",
        siret: "",
        billing_address: "",
        zip_code: "",
        city: "",
        notes: ""
    });

    const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(false);

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            // Check suspension status
            if (client.status === 'suspended' || client.is_suspended) {
                toast.error("Ce client est suspendu", {
                    description: `Raison : ${client.suspension_reason || 'Non spécifiée'}. Impossible de créer une commande.`
                });
                return;
            }

            updateFormData({
                clientId: client.id,
                clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
                clientEmail: client.email,
                clientPhone: client.phone || "",
                clientCompany: client.company_name || "",
                pickupContact: formData.pickupContact || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
                pickupPhone: formData.pickupPhone || client.phone || ""
            });
        }
    };

    const handleSiretChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Only allow numbers and limit to 14 chars
        const cleanValue = value.replace(/\D/g, '').slice(0, 14);

        setNewClientData(prev => ({ ...prev, siret: cleanValue }));

        if (cleanValue.length === 14) {
            await fetchEnterpriseInfo(cleanValue);
            // Check if SIRET is banned/suspended
            await checkExistingClientStatus('siret', cleanValue);
        }
    };

    const checkExistingClientStatus = async (field: 'email' | 'siret', value: string) => {
        if (!value) return false;
        try {
            const { data: existingClient } = await supabase
                .from('clients')
                .select('id, status, is_suspended, suspension_reason')
                .eq(field, value)
                .single();

            if (existingClient) {
                if (existingClient.status === 'suspended' || existingClient.is_suspended) {
                    toast.error(`Client suspendu trouvé avec ce ${field === 'email' ? 'email' : 'SIRET'}`, {
                        description: `Raison : ${existingClient.suspension_reason || 'Non spécifiée'}. Impossible de créer une commande.`
                    });
                    return true; // Is suspended
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const fetchEnterpriseInfo = async (siret: string) => {
        try {
            setIsLoadingEnterprise(true);
            const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`);

            if (!response.ok) throw new Error("Erreur API");

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const company = data.results[0];
                const siege = company.siege;

                setNewClientData(prev => ({
                    ...prev,
                    company_name: company.nom_complet || prev.company_name,
                    billing_address: siege.adresse || prev.billing_address,
                    zip_code: siege.code_postal || prev.zip_code,
                    city: siege.libelle_commune || prev.city,
                }));

                toast.success("Entreprise trouvée : " + company.nom_complet);
            } else {
                toast.error("Aucune entreprise trouvée pour ce SIRET");
            }
        } catch (error) {
            console.error("Erreur recherche SIRET:", error);
        } finally {
            setIsLoadingEnterprise(false);
        }
    };

    const handleCreateClient = async () => {
        if (!newClientData.company_name || !newClientData.email || !newClientData.sector || !newClientData.phone) {
            toast.error("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        setIsCreatingClient(true);
        try {
            // Pre-check suspension for email
            const isEmailSuspended = await checkExistingClientStatus('email', newClientData.email);
            if (isEmailSuspended) {
                setIsCreatingClient(false);
                return;
            }

            // Pre-check suspension for SIRET
            const isSiretSuspended = await checkExistingClientStatus('siret', newClientData.siret);
            if (isSiretSuspended) {
                setIsCreatingClient(false);
                return;
            }

            const fullAddress = `${newClientData.billing_address}, ${newClientData.zip_code} ${newClientData.city}`;

            // Split contact name
            const contactParts = newClientData.contact_name.trim().split(' ');
            const firstName = contactParts[0] || "Contact";
            const lastName = contactParts.slice(1).join(' ') || newClientData.company_name;

            const { data, error } = await supabase
                .from('clients')
                .insert({
                    company_name: newClientData.company_name,
                    email: newClientData.email,
                    phone: newClientData.phone,
                    address: fullAddress,
                    billing_address: newClientData.billing_address || fullAddress,
                    siret: newClientData.siret,
                    first_name: firstName,
                    last_name: lastName,
                    sector: newClientData.sector,
                    notes: newClientData.notes,
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                toast.success("Client créé avec succès");
                if (onClientCreated) {
                    onClientCreated(data);
                }
                setShowNewClientForm(false);
                setNewClientData({
                    company_name: "",
                    sector: "",
                    contact_name: "",
                    email: "",
                    phone: "",
                    siret: "",
                    billing_address: "",
                    zip_code: "",
                    city: "",
                    notes: ""
                });
                // We don't check suspension here because we just created it and it defaults to active/pending
                // But if default schema set it to something else, we might need to check. Assuming default is safe.
                handleClientSelect(data.id);
            }
        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.error(error.message || "Erreur lors de la création du client");
        } finally {
            setIsCreatingClient(false);
        }
    };

    const isValid = formData.pickupAddress;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-4 shrink-0">
                <h2 className="text-lg font-semibold text-[#0B1525]">Enlèvement</h2>
                <p className="text-xs text-gray-500">Où devons-nous récupérer le colis ?</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {/* Client Selection (Admin Only) */}
                {mode === 'admin' && (
                    <div className="bg-[#0B1525]/5 p-3 rounded-lg border border-[#0B1525]/10 transition-all">
                        {!showNewClientForm ? (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-[#0B1525] font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        Client
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 h-6 text-xs px-2"
                                        onClick={() => setShowNewClientForm(true)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Nouveau
                                    </Button>
                                </div>

                                <Select onValueChange={handleClientSelect} value={formData.clientId}>
                                    <SelectTrigger className="bg-white border-[#0B1525]/10 h-8 text-xs focus:ring-[#D4AF37]">
                                        <SelectValue placeholder="Rechercher un client..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id} className="text-xs">
                                                {client.company_name ? `${client.company_name} - ` : ''}
                                                {client.first_name} {client.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between border-b border-[#0B1525]/10 pb-2 mb-2">
                                    <h3 className="text-xs font-semibold text-[#0B1525]">Nouveau Client</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                                        onClick={() => setShowNewClientForm(false)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-12 gap-2">
                                    {/* Row 1: SIRET (Auto-fill Trigger) & Sector */}
                                    <div className="col-span-6 relative">
                                        <Input
                                            value={newClientData.siret}
                                            onChange={handleSiretChange}
                                            className="h-7 bg-white text-xs font-medium border-blue-300 focus-visible:ring-[#0B1525]"
                                            placeholder="N° SIRET (14 chiffres) *"
                                            autoFocus
                                        />
                                        {isLoadingEnterprise && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <Loader2 className="h-3 w-3 animate-spin text-[#0B1525]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-6">
                                        <Select
                                            value={newClientData.sector}
                                            onValueChange={(value) => setNewClientData({ ...newClientData, sector: value })}
                                        >
                                            <SelectTrigger className="h-7 bg-white text-xs">
                                                <SelectValue placeholder="Secteur *" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SECTORS.map((s) => (
                                                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Row 2: Company Name */}
                                    <div className="col-span-12">
                                        <Input
                                            value={newClientData.company_name}
                                            onChange={e => setNewClientData({ ...newClientData, company_name: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Nom de l'entreprise *"
                                        />
                                    </div>

                                    {/* Row 3: Contact Name (UI Only for now) */}
                                    <div className="col-span-12">
                                        <Input
                                            value={newClientData.contact_name}
                                            onChange={e => setNewClientData({ ...newClientData, contact_name: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Nom complet du contact"
                                        />
                                    </div>

                                    {/* Row 4: Email & Phone */}
                                    <div className="col-span-6">
                                        <Input
                                            value={newClientData.email}
                                            onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Email pro *"
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <Input
                                            value={newClientData.phone}
                                            onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Téléphone *"
                                        />
                                    </div>

                                    {/* Row 5: Address Header */}
                                    <div className="col-span-12 pt-1">
                                        <div className="text-[10px] font-semibold text-[#0B1525] uppercase tracking-wider">Adresse</div>
                                    </div>

                                    {/* Row 6: Billing Address */}
                                    <div className="col-span-12">
                                        <Input
                                            value={newClientData.billing_address}
                                            onChange={e => setNewClientData({ ...newClientData, billing_address: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Adresse de facturation"
                                        />
                                    </div>

                                    {/* Row 7: Zip & City */}
                                    <div className="col-span-4">
                                        <Input
                                            value={newClientData.zip_code}
                                            onChange={e => setNewClientData({ ...newClientData, zip_code: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Code postal"
                                        />
                                    </div>
                                    <div className="col-span-8">
                                        <Input
                                            value={newClientData.city}
                                            onChange={e => setNewClientData({ ...newClientData, city: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Ville"
                                        />
                                    </div>

                                    {/* Notes removed from UI as it's not in DB */}
                                </div>

                                <div className="flex justify-end pt-2 mt-1 border-t border-[#0B1525]/10">
                                    <Button
                                        size="sm"
                                        onClick={handleCreateClient}
                                        disabled={isCreatingClient}
                                        className="bg-[#D4AF37] hover:bg-[#b5952f] text-white h-7 text-xs px-3 shadow-sm hover:shadow-md transition-all"
                                    >
                                        {isCreatingClient ? (
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        ) : (
                                            <Save className="h-3 w-3 mr-1" />
                                        )}
                                        Créer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Address */}
                <div className="space-y-3">
                    <AddressAutocomplete
                        value={formData.pickupAddress}
                        onChange={(value) => updateFormData({ pickupAddress: value })}
                        onAddressSelect={(suggestion) => {
                            const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                            updateFormData({
                                pickupAddress: fullAddress,
                                pickupCity: suggestion.city,
                                pickupLat: suggestion.lat ? parseFloat(suggestion.lat) : undefined,
                                pickupLng: suggestion.lon ? parseFloat(suggestion.lon) : undefined
                            });
                        }}
                        label="Adresse d'enlèvement *"
                        placeholder="123 Rue de Paris, 75001 Paris"
                        required
                        name="pickupAddress"
                    />

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <Label htmlFor="pickupName" className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-semibold">
                                Société / Enseigne
                            </Label>
                            <Input
                                id="pickupName"
                                value={formData.pickupName}
                                onChange={(e) => updateFormData({ pickupName: e.target.value })}
                                placeholder="Ex: Boutique Paris"
                                className="h-8 text-sm focus-visible:ring-[#0B1525]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="pickupContact" className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-semibold">
                                Nom du contact
                            </Label>
                            <Input
                                id="pickupContact"
                                value={formData.pickupContact}
                                onChange={(e) => updateFormData({ pickupContact: e.target.value })}
                                placeholder="Jean Dupont"
                                className="h-8 text-sm focus-visible:ring-[#0B1525]"
                            />
                        </div>
                        <div>
                            <Label htmlFor="pickupPhone" className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-semibold">
                                Téléphone
                            </Label>
                            <Input
                                id="pickupPhone"
                                value={formData.pickupPhone}
                                onChange={(e) => updateFormData({ pickupPhone: e.target.value })}
                                placeholder="06 12 34 56 78"
                                className="h-8 text-sm focus-visible:ring-[#0B1525]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="pickupEmail" className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-semibold">
                            Email contact site
                        </Label>
                        <Input
                            id="pickupEmail"
                            value={formData.pickupEmail}
                            onChange={(e) => updateFormData({ pickupEmail: e.target.value })}
                            placeholder="contact@boutique.fr"
                            className="h-8 text-sm focus-visible:ring-[#0B1525]"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="pickupInstructions" className="flex items-center gap-2 mb-1 text-xs text-gray-500 uppercase font-semibold">
                            Instructions Chauffeur (Départ)
                        </Label>
                        <Textarea
                            id="pickupInstructions"
                            value={formData.pickupInstructions}
                            onChange={(e) => updateFormData({ pickupInstructions: e.target.value })}
                            placeholder="Ex: Sonner à l'interphone 'Bureau 4'..."
                            className="text-sm focus-visible:ring-[#0B1525] min-h-[60px]"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-auto flex justify-end border-t border-gray-100 shrink-0">
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-6 h-9 shadow-md hover:shadow-lg transition-all"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
