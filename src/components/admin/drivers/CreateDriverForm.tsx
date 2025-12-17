import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateDriverFormProps {
  onSubmit: (data: DriverFormData) => void;
  onCancel: () => void;
}

export interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
}

export function CreateDriverForm({ onSubmit, onCancel }: CreateDriverFormProps) {
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    phone: "",
    status: "offline",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Jean Dupont"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ex: jean@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="Ex: +33612345678"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Statut initial</Label>
        <Select value={formData.status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">En ligne</SelectItem>
            <SelectItem value="offline">Hors ligne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Créer chauffeur</Button>
      </div>
    </form>
  );
}

export default CreateDriverForm;
