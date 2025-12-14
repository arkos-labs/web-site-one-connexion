import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Car, Save } from "lucide-react";

interface VehicleManagerProps {
    driverId: string;
}

export function VehicleManager({ driverId }: VehicleManagerProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        vehicle_type: "voiture",
        vehicle_registration: "",
    });

    useEffect(() => {
        fetchDriverVehicle();
    }, [driverId]);

    const fetchDriverVehicle = async () => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('vehicle_type, vehicle_registration')
                .eq('id', driverId)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    vehicle_type: data.vehicle_type || "voiture",
                    vehicle_registration: data.vehicle_registration || "",
                });
            }
        } catch (error) {
            console.error("Error fetching vehicle info:", error);
            toast.error("Erreur lors du chargement des informations véhicule");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('drivers')
                .update({
                    vehicle_type: formData.vehicle_type,
                    vehicle_registration: formData.vehicle_registration
                })
                .eq('id', driverId);

            if (error) throw error;
            toast.success("Informations véhicule mises à jour");
        } catch (error: any) {
            console.error("Error saving vehicle:", error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Chargement...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Véhicule Principal
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label>Type de véhicule</Label>
                        <Select
                            value={formData.vehicle_type}
                            onValueChange={(val) => setFormData({ ...formData, vehicle_type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="moto">Moto / Scooter</SelectItem>
                                <SelectItem value="voiture">Voiture</SelectItem>
                                <SelectItem value="utilitaire">Utilitaire / Camionnette</SelectItem>
                                <SelectItem value="velo">Vélo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Immatriculation</Label>
                        <Input
                            value={formData.vehicle_registration}
                            onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value.toUpperCase() })}
                            placeholder="AA-123-BB"
                        />
                    </div>

                    <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
