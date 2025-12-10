import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface ClientFormData {
  name: string;
  sector: string;
  email: string;
  phone: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  description: string;
  status: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  initialData?: ClientFormData;
}

const SECTORS = [
  "Médical",
  "Juridique",
  "Événementiel",
  "Automobile",
];

export function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || {
      name: "",
      sector: "",
      email: "",
      phone: "",
      siret: "",
      address: "",
      postalCode: "",
      city: "",
      description: "",
      status: "active",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.sector) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Infos principales */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-4 text-lg">📋 Informations principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'entreprise *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: TechCorp France"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d'activité *</Label>
            <Select value={formData.sector} onValueChange={(value) => handleSelectChange("sector", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un secteur" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@entreprise.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone professionnel *</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+33147123456"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Infos légales */}
      <div className="border-b pb-4">
        <h3 className="font-semibold mb-4 text-lg">🏢 Informations légales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <Input
              id="siret"
              name="siret"
              placeholder="12345678901234"
              value={formData.siret}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              name="postalCode"
              placeholder="75001"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Adresse complète</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Rue de l'exemple"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              name="city"
              placeholder="Paris"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Autres infos */}
      <div className="pb-4">
        <h3 className="font-semibold mb-4 text-lg">📝 Autres informations</h3>
        <div className="space-y-2">
          <Label htmlFor="description">Description/Notes</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Ajouter des notes sur le client..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="status">Statut</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Créer le client</Button>
      </div>
    </form>
  );
}

export default ClientForm;
