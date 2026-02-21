import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Client } from "@/lib/supabase";
import { updateClient } from "@/services/adminSupabaseQueries";

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSuccess: () => void;
}

const EditClientModal = ({ isOpen, onClose, client, onSuccess }: EditClientModalProps) => {
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                company_name: client.company_name,
                email: client.email,
                phone: client.phone || "",
                address: client.address || "",
                siret: client.siret || "",
                internal_code: client.internal_code || "",
                first_name: client.first_name || "",
                last_name: client.last_name || "",
                billing_address: client.billing_address || "",
                tva_number: client.tva_number || "",
                iban: client.iban || "",
            });
        }
    }, [client, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateClient(client.id, formData);
            toast.success("Informations client mises à jour");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating client:", error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Modifier les informations client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                            <Input
                                id="company_name"
                                name="company_name"
                                value={formData.company_name || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="internal_code">Code interne</Label>
                            <Input
                                id="internal_code"
                                name="internal_code"
                                value={formData.internal_code || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Prénom contact</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                value={formData.first_name || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Nom contact</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                value={formData.last_name || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Adresse principale</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="billing_address">Adresse de facturation</Label>
                        <Input
                            id="billing_address"
                            name="billing_address"
                            value={formData.billing_address || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="siret">Numéro SIRET</Label>
                        <Input
                            id="siret"
                            name="siret"
                            value={formData.siret || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tva_number">N° TVA</Label>
                            <Input
                                id="tva_number"
                                name="tva_number"
                                value={formData.tva_number || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">IBAN</Label>
                            <Input
                                id="iban"
                                name="iban"
                                value={formData.iban || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditClientModal;
