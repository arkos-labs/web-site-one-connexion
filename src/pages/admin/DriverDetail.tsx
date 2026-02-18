import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    User,
    Truck,
    FileText,
    Save,
    X,
    MapPin,
    Phone,
    Mail
} from "lucide-react";
import { toast } from "sonner";
import {
    getDriverDetails,
    updateDriverPersonalInfo,
    getDriverOrders,
    Driver,
    OrderWithDetails,
} from "@/services/adminSupabaseQueries";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { VehicleManager } from "@/components/admin/drivers/VehicleManager";
import { DriverDocumentsViewer } from "@/components/admin/drivers/DriverDocumentsViewer";

export default function DriverDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // États d'édition
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);

    // États des formulaires
    const [personalForm, setPersonalForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        status: "offline" as Driver['status']
    });

    useEffect(() => {
        if (id) {
            fetchDriverData();
        }
    }, [id]);

    const fetchDriverData = async () => {
        try {
            setLoading(true);
            const data = await getDriverDetails(id!);
            if (data) {
                setDriver(data);
                // Initialiser les formulaires
                setPersonalForm({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    status: data.status || "offline"
                });

                // Fetch orders using USER_ID (Auth ID) because orders are linked to auth id
                const ordersData = await getDriverOrders(data.user_id || data.id);
                setOrders(ordersData);
            } else {
                toast.error("Chauffeur introuvable");
                navigate("/admin/chauffeurs");
            }
        } catch (error) {
            console.error("Error fetching driver:", error);
            toast.error("Erreur lors du chargement du chauffeur");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePersonal = async () => {
        if (!driver) return;
        setSaving(true);
        try {
            await updateDriverPersonalInfo(driver.id, personalForm);
            setDriver({ ...driver, ...personalForm });
            setIsEditingPersonal(false);
            toast.success("Informations personnelles mises à jour");
        } catch (error) {
            console.error("Error updating personal info:", error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            available: "bg-green-500 hover:bg-green-600",
            busy: "bg-orange-500 hover:bg-orange-600",
            offline: "bg-gray-500 hover:bg-gray-600",
            suspended: "bg-red-500 hover:bg-red-600"
        };
        const labels = {
            available: "Disponible",
            busy: "En course",
            offline: "Hors ligne",
            suspended: "Suspendu"
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || styles.offline}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredOrders = orders.filter(order => {
        if (statusFilter === "all") return true;
        return order.status === statusFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!driver) return null;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/chauffeurs")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {driver.first_name} {driver.last_name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <Mail className="h-4 w-4" /> {driver.email}
                            <span className="mx-1">•</span>
                            <Phone className="h-4 w-4" /> {driver.phone}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {getStatusBadge(driver.status)}
                    {driver.is_online && (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                            En ligne
                        </Badge>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="details">Informations</TabsTrigger>
                    <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="history">Historique des courses</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Informations Personnelles */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informations Personnelles
                                </h2>
                                {!isEditingPersonal ? (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)}>
                                        Modifier
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditingPersonal(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" onClick={handleSavePersonal} disabled={saving}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Prénom</Label>
                                        <Input
                                            value={personalForm.first_name}
                                            onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                                            disabled={!isEditingPersonal}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nom</Label>
                                        <Input
                                            value={personalForm.last_name}
                                            onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                                            disabled={!isEditingPersonal}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={personalForm.email}
                                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                                        disabled={!isEditingPersonal}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Téléphone</Label>
                                    <Input
                                        value={personalForm.phone}
                                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                                        disabled={!isEditingPersonal}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Adresse</Label>
                                    <Input
                                        value={personalForm.address}
                                        onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                                        disabled={!isEditingPersonal}
                                        placeholder="Adresse complète"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="vehicles">
                    <VehicleManager driverId={driver.id} />
                </TabsContent>

                <TabsContent value="documents">
                    <DriverDocumentsViewer
                        driverId={driver.id}
                        onDocumentsValidated={fetchDriverData}
                    />
                </TabsContent>

                <TabsContent value="history">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Historique des commandes ({filteredOrders.length})
                            </h2>
                            <div className="w-[200px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les commandes</SelectItem>
                                        <SelectItem value="delivered">Livrées</SelectItem>
                                        <SelectItem value="in_progress">En cours</SelectItem>
                                        <SelectItem value="dispatched">Dispatchées</SelectItem>
                                        <SelectItem value="cancelled">Annulées</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-sm text-muted-foreground">
                                        <th className="text-left py-3 font-medium">Référence</th>
                                        <th className="text-left py-3 font-medium">Date</th>
                                        <th className="text-left py-3 font-medium">Client</th>
                                        <th className="text-left py-3 font-medium">Trajet</th>
                                        <th className="text-left py-3 font-medium">Prix</th>
                                        <th className="text-right py-3 font-medium">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/admin/commandes/${order.id}`)}
                                            >
                                                <td className="py-3 font-medium">{order.reference}</td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                                                </td>
                                                <td className="py-3 text-sm">
                                                    {order.clients?.company_name || "Client inconnu"}
                                                </td>
                                                <td className="py-3 text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3" /> {order.pickup_address}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <ArrowLeft className="h-3 w-3 rotate-180" /> {order.delivery_address}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-medium">{order.price.toFixed(2)} €</td>
                                                <td className="py-3 text-right">
                                                    <Badge variant="outline" className="capitalize">
                                                        {order.status === 'in_progress' ? 'En cours' :
                                                            order.status === 'dispatched' ? 'Dispatchée' :
                                                                order.status === 'delivered' ? 'Livrée' :
                                                                    order.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                Aucune commande trouvée
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

