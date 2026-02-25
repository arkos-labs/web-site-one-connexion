import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Car, Plus, Save, Trash2 } from "lucide-react";

interface VehicleManagerProps {
  driverId: string;
}

const VEHICLE_TYPES = [
  { value: "moto", label: "Moto / Scooter" },
  { value: "voiture", label: "Voiture" },
  { value: "utilitaire", label: "Utilitaire / Camionnette" },
  { value: "velo", label: "Vélo" },
];

type DriverVehicleRow = {
  id: string;
  driver_id: string;
  vehicle_type: string;
  registration: string | null;
  brand: string | null;
  model: string | null;
  capacity: string | null;
  is_primary: boolean | null;
};

const emptyForm = {
  id: "",
  vehicle_type: "voiture",
  registration: "",
  brand: "",
  model: "",
  capacity: "",
  is_primary: true,
};

export function VehicleManager({ driverId }: VehicleManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState<DriverVehicleRow[]>([]);
  const [editing, setEditing] = useState<DriverVehicleRow | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetchVehicles();
  }, [driverId]);

  const hasPrimary = useMemo(() => vehicles.some((v) => v.is_primary), [vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("driver_vehicles")
        .select("id, driver_id, vehicle_type, registration, brand, model, capacity, is_primary")
        .eq("driver_id", driverId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ ...emptyForm, is_primary: !hasPrimary });
  };

  const startEdit = (vehicle: DriverVehicleRow) => {
    setEditing(vehicle);
    setFormData({
      id: vehicle.id,
      vehicle_type: vehicle.vehicle_type || "voiture",
      registration: vehicle.registration || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      capacity: vehicle.capacity || "",
      is_primary: !!vehicle.is_primary,
    });
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Supprimer ce véhicule ?")) return;
    try {
      const { error } = await supabase
        .from("driver_vehicles")
        .delete()
        .eq("id", vehicleId);
      if (error) throw error;
      toast.success("Véhicule supprimé");
      await fetchVehicles();
      resetForm();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const validate = () => {
    if (!formData.vehicle_type) return "Type de véhicule requis";
    if (!VEHICLE_TYPES.find((v) => v.value === formData.vehicle_type)) {
      return "Type de véhicule invalide";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setSaving(true);
    try {
      if (formData.is_primary) {
        await supabase
          .from("driver_vehicles")
          .update({ is_primary: false })
          .eq("driver_id", driverId);
      }

      if (editing) {
        const { error } = await supabase
          .from("driver_vehicles")
          .update({
            vehicle_type: formData.vehicle_type,
            registration: formData.registration || null,
            brand: formData.brand || null,
            model: formData.model || null,
            capacity: formData.capacity || null,
            is_primary: formData.is_primary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Véhicule mis à jour");
      } else {
        const { error } = await supabase.from("driver_vehicles").insert({
          driver_id: driverId,
          vehicle_type: formData.vehicle_type,
          registration: formData.registration || null,
          brand: formData.brand || null,
          model: formData.model || null,
          capacity: formData.capacity || null,
          is_primary: formData.is_primary,
        });
        if (error) throw error;
        toast.success("Véhicule ajouté");
      }

      await fetchVehicles();
      resetForm();
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast.error(error?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicules du chauffeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicles.length === 0 && (
            <div className="text-sm text-slate-500">Aucun véhicule enregistré.</div>
          )}

          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <div className="font-semibold capitalize">
                  {v.vehicle_type} {v.brand || ""} {v.model || ""}
                  {v.is_primary ? " • Principal" : ""}
                </div>
                <div className="text-xs text-slate-500">
                  {v.registration || "Immatriculation non renseignée"}
                  {v.capacity ? ` • Capacité: ${v.capacity}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(v)}>
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editing ? "Modifier le véhicule" : "Ajouter un véhicule"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label>Type de véhicule *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(val) => setFormData({ ...formData, vehicle_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Immatriculation</Label>
              <Input
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value.toUpperCase() })}
                placeholder="AA-123-BB"
              />
            </div>

            <div className="space-y-2">
              <Label>Marque</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Renault"
              />
            </div>

            <div className="space-y-2">
              <Label>Modèle</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Kangoo"
              />
            </div>

            <div className="space-y-2">
              <Label>Capacité</Label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="3 colis / 50kg"
              />
            </div>

            <div className="space-y-2">
              <Label>Principal</Label>
              <Select
                value={formData.is_primary ? "yes" : "no"}
                onValueChange={(val) => setFormData({ ...formData, is_primary: val === "yes" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Oui</SelectItem>
                  <SelectItem value="no">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Ajouter"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
