import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Car, Plus, Trash2, Edit, CheckCircle2, XCircle, AlertCircle, Truck, Bike } from "lucide-react";

interface Vehicle {
    id: string;
    brand: string;
    model: string;
    license_plate: string;
    vehicle_type: string;
    color: string;
    year: number;
    status: 'active' | 'inactive' | 'maintenance';
}

interface VehicleManagerProps {
    driverId: string;
}

export function VehicleManager({ driverId }: VehicleManagerProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        license_plate: "",
        vehicle_type: "voiture",
        color: "",
        year: new Date().getFullYear(),
        status: "active"
    });

    useEffect(() => {
        fetchVehicles();
    }, [driverId]);

    const fetchVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('driver_id', driverId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            toast.error("Erreur lors du chargement des véhicules");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                // Update
                const { error } = await supabase
                    .from('vehicles')
                    .update(formData)
                    .eq('id', editingVehicle.id);

                if (error) throw error;
                toast.success("Véhicule mis à jour");
            } else {
                // Create
                const { error } = await supabase
                    .from('vehicles')
                    .insert([{ ...formData, driver_id: driverId }]);

                if (error) throw error;
                toast.success("Véhicule ajouté");
            }

            setIsDialogOpen(false);
            setEditingVehicle(null);
            resetForm();
            fetchVehicles();
        } catch (error: any) {
            console.error("Error saving vehicle:", error);
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Véhicule supprimé");
            fetchVehicles();
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const resetForm = () => {
        setFormData({
            brand: "",
            model: "",
            license_plate: "",
            vehicle_type: "voiture",
            color: "",
            year: new Date().getFullYear(),
            status: "active"
        });
    };

    const openEditDialog = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            brand: vehicle.brand,
            model: vehicle.model,
            license_plate: vehicle.license_plate,
            vehicle_type: vehicle.vehicle_type,
            color: vehicle.color,
            year: vehicle.year,
            status: vehicle.status
        });
        setIsDialogOpen(true);
    };

    const getVehicleIcon = (type: string) => {
        switch (type) {
            case 'moto': return <Bike className="h-4 w-4" />;
            case 'utilitaire': return <Truck className="h-4 w-4" />;
            default: return <Car className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
            case 'maintenance':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Maintenance</Badge>;
            default:
                return <Badge variant="secondary">Inactif</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Véhicules
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingVehicle(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter un véhicule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingVehicle ? "Modifier le véhicule" : "Ajouter un véhicule"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Marque</Label>
                                    <Input
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="Ex: Renault"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Modèle</Label>
                                    <Input
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="Ex: Kangoo"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Immatriculation</Label>
                                <Input
                                    value={formData.license_plate}
                                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                                    placeholder="AA-123-BB"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
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
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Année</Label>
                                    <Input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Couleur</Label>
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="Ex: Blanc"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Actif</SelectItem>
                                            <SelectItem value="inactive">Inactif</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Chargement...</div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun véhicule enregistré</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Véhicule</TableHead>
                                <TableHead>Immatriculation</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">
                                        {vehicle.brand} {vehicle.model}
                                        <div className="text-xs text-muted-foreground">{vehicle.color}, {vehicle.year}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {vehicle.license_plate}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getVehicleIcon(vehicle.vehicle_type)}
                                            <span className="capitalize">{vehicle.vehicle_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(vehicle)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(vehicle.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
