import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateClientFormProps {
    onSuccess: (clientId: string) => void;
    onCancel: () => void;
}

export const CreateClientForm = ({ onSuccess, onCancel }: CreateClientFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        siret: "",
        address: "",
        zipCode: "",
        city: "",
        email: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (!formData.name || !formData.siret || !formData.address || !formData.zipCode || !formData.city || !formData.email || !formData.phone) {
            toast.error("Tous les champs sont obligatoires");
            setIsLoading(false);
            return;
        }

        try {
            // Construction de l'adresse complète
            const fullAddress = `${formData.address}, ${formData.zipCode} ${formData.city}`;

            // Insertion dans la table clients (sans user_id pour l'instant)
            // Le user_id sera lié automatiquement quand le client s'inscrira avec cet email
            const { data, error } = await supabase
                .from('clients')
                .insert({
                    company_name: formData.name,
                    siret: formData.siret,
                    email: formData.email,
                    phone: formData.phone,
                    address: fullAddress,
                    // user_id est laissé NULL intentionnellement
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Client créé avec succès !");
            toast.info("Le client pourra récupérer cet historique en s'inscrivant avec cet email.");

            if (data) {
                onSuccess(data.id);
            } else {
                onSuccess('unknown');
            }

        } catch (error: any) {
            console.error("Error creating client:", error);
            // Gestion spécifique de l'erreur de duplication (si l'email existe déjà)
            if (error.code === '23505') {
                toast.error("Un client avec cet email existe déjà.");
            } else {
                toast.error(error.message || "Erreur lors de la création du client");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise *</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Ma Société SAS"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                    id="siret"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    placeholder="14 chiffres"
                    maxLength={14}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@entreprise.com"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Le client pourra récupérer son compte en s'inscrivant avec cet email.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01 23 45 67 89"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Adresse (Rue) *</Label>
                <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Rue de la Paix"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="zipCode">Code Postal *</Label>
                    <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="75000"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Paris"
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" variant="cta" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer le client
                </Button>
            </div>
        </form>
    );
};
