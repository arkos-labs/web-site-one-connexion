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
        email: "",
        phone: "",
        siret: "",
        billing_address: "",
        zip_code: "",
        city: "",
        notes: ""
    });

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
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

    const handleCreateClient = async () => {
        if (!newClientData.company_name || !newClientData.email || !newClientData.sector || !newClientData.phone) {
            toast.error("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }

        setIsCreatingClient(true);
        try {
            const fullAddress = `${newClientData.billing_address}, ${newClientData.zip_code} ${newClientData.city}`;

            const { data, error } = await supabase
                .from('clients')
                .insert({
                    company_name: newClientData.company_name,
                    email: newClientData.email,
                    phone: newClientData.phone,
                    address: fullAddress,
                    billing_address: fullAddress,
                    siret: newClientData.siret,
                    first_name: "Contact",
                    last_name: newClientData.company_name,
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
                    email: "",
                    phone: "",
                    siret: "",
                    billing_address: "",
                    zip_code: "",
                    city: "",
                    notes: ""
                });
                handleClientSelect(data.id);
            }
        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.error(error.message || "Erreur lors de la création du client");
        } finally {
            setIsCreatingClient(false);
        }
    };

    const isValid = formData.pickupAddress && formData.pickupCity;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-4 shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Enlèvement</h2>
                <p className="text-xs text-gray-500">Où devons-nous récupérer le colis ?</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {/* Client Selection (Admin Only) */}
                {mode === 'admin' && (
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 transition-all">
                        {!showNewClientForm ? (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-blue-900 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        Client
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 h-6 text-xs px-2"
                                        onClick={() => setShowNewClientForm(true)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Nouveau
                                    </Button>
                                </div>

                                <Select onValueChange={handleClientSelect} value={formData.clientId}>
                                    <SelectTrigger className="bg-white border-blue-200 h-8 text-xs">
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
                                <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                                    <h3 className="text-xs font-semibold text-blue-900">Nouveau Client</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-blue-400 hover:text-blue-600"
                                        onClick={() => setShowNewClientForm(false)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-12 gap-2">
                                    {/* Row 1: Company & Sector */}
                                    <div className="col-span-6">
                                        <Input
                                            value={newClientData.company_name}
                                            onChange={e => setNewClientData({ ...newClientData, company_name: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Nom de l'entreprise *"
                                        />
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

                                    {/* Row 2: Email & Phone */}
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

                                    {/* Row 3: Legal Info Header */}
                                    <div className="col-span-12 pt-1">
                                        <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">Informations légales</div>
                                    </div>

                                    {/* Row 4: SIRET & Billing Address */}
                                    <div className="col-span-4">
                                        <Input
                                            value={newClientData.siret}
                                            onChange={e => setNewClientData({ ...newClientData, siret: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="SIRET"
                                        />
                                    </div>
                                    <div className="col-span-8">
                                        <Input
                                            value={newClientData.billing_address}
                                            onChange={e => setNewClientData({ ...newClientData, billing_address: e.target.value })}
                                            className="h-7 bg-white text-xs"
                                            placeholder="Adresse de facturation"
                                        />
                                    </div>

                                    {/* Row 5: Zip & City */}
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

                                    {/* Row 6: Notes */}
                                    <div className="col-span-12">
                                        <Textarea
                                            value={newClientData.notes}
                                            onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                                            className="bg-white min-h-[40px] h-[40px] text-xs resize-none"
                                            placeholder="Notes..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2 mt-1 border-t border-blue-100">
                                    <Button
                                        size="sm"
                                        onClick={handleCreateClient}
                                        disabled={isCreatingClient}
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3"
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
                                pickupCity: suggestion.city
                            });
                        }}
                        label="Adresse d'enlèvement *"
                        placeholder="123 Rue de Paris, 75001 Paris"
                        required
                        name="pickupAddress"
                    />

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
                                className="h-8 text-sm"
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
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-auto flex justify-end border-t border-gray-100 shrink-0">
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
