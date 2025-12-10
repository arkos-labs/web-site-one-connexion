import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateDriverForm, DriverFormData } from "@/components/admin/drivers/CreateDriverForm";
import DriversMap from "@/components/admin/drivers/DriversMap";
import { Eye, Plus, Search, Map } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Driver } from "@/types/drivers";
import { getDriverStatusLabel, getDriverStatusBadgeColor } from "@/types/orders";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setIsLoading(true);

    try {
      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*');

      if (driversError) throw driversError;

      // Fetch orders for stats calculation
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, driver_id, status, price');

      if (ordersError) throw ordersError;

      // Fetch vehicles for all drivers
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) console.error('Error fetching vehicles:', vehiclesError);

      // Fetch documents for all drivers
      const { data: documentsData, error: documentsError } = await supabase
        .from('driver_documents')
        .select('*');

      if (documentsError) console.error('Error fetching documents:', documentsError);

      if (driversData) {
        const realDrivers: Driver[] = driversData.map((d: any) => {
          // Calculate stats from orders
          const driverOrders = ordersData?.filter((o: any) => o.driver_id === d.id) || [];

          const totalDeliveries = driverOrders.filter((o: any) => o.status === 'delivered').length;
          const cancelledDeliveries = driverOrders.filter((o: any) => o.status === 'cancelled').length;
          // Active orders: dispatched (assigned) or in_progress (picked up)
          const pendingDeliveries = driverOrders.filter((o: any) => ['dispatched', 'in_progress'].includes(o.status)).length;
          const totalEarnings = driverOrders
            .filter((o: any) => o.status === 'delivered')
            .reduce((sum: number, o: any) => sum + (o.price || 0), 0);

          // Map status
          let status: any = 'offline';
          if (d.status === 'available') status = 'online';
          else if (d.status === 'busy') status = 'on_delivery';
          else if (d.status === 'offline') status = 'offline';
          else if (d.status === 'suspended') status = 'offline';
          else if (d.status === 'on_break') status = 'on_break';
          else if (d.status === 'on_vacation') status = 'on_vacation';
          // If the DB status matches the frontend type directly, use it.
          if (['online', 'offline', 'on_delivery', 'on_break', 'on_vacation'].includes(d.status)) {
            status = d.status;
          }

          return {
            id: d.id,
            first_name: d.first_name,
            last_name: d.last_name,
            email: d.email,
            phone: d.phone,
            status: status,
            vehicle: (() => {
              const driverVehicles = vehiclesData?.filter((v: any) => v.driver_id === d.id) || [];
              const primaryVehicle = driverVehicles.find((v: any) => v.status === 'active') || driverVehicles[0];
              return primaryVehicle ? {
                type: primaryVehicle.vehicle_type,
                model: `${primaryVehicle.brand} ${primaryVehicle.model}`,
                license_plate: primaryVehicle.license_plate,
                color: primaryVehicle.color,
                year: primaryVehicle.year
              } : undefined;
            })(),
            documents: (() => {
              const driverDocs = documentsData?.filter((doc: any) => doc.driver_id === d.id) || [];
              return driverDocs.map((doc: any) => ({
                type: doc.document_type,
                status: doc.verification_status,
                expiry_date: doc.expiry_date
              }));
            })(),
            current_location: d.current_lat && d.current_lng ? {
              latitude: d.current_lat,
              longitude: d.current_lng,
              updated_at: new Date().toISOString()
            } : undefined,
            stats: {
              total_deliveries: totalDeliveries,
              completed_deliveries: totalDeliveries,
              cancelled_deliveries: cancelledDeliveries,
              pending_deliveries: pendingDeliveries,
              total_earnings: totalEarnings,
              average_rating: 5.0, // Default rating
              total_distance_km: 0 // Default distance
            },
            created_at: d.created_at,
            updated_at: d.updated_at || new Date().toISOString()
          };
        });
        setDrivers(realDrivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Erreur lors du chargement des chauffeurs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDriver = async (formData: DriverFormData) => {
    try {
      // Diviser le nom complet en prénom et nom
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Si un seul nom, utiliser comme nom de famille aussi

      // Mapper le statut du formulaire vers le statut de la base de données
      let dbStatus = 'offline';
      if (formData.status === 'online') {
        dbStatus = 'available';
      } else if (formData.status === 'offline') {
        dbStatus = 'offline';
      }

      // Insérer le chauffeur dans Supabase
      const { data, error } = await supabase
        .from('drivers')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email: formData.email,
            phone: formData.phone,
            status: dbStatus,
            vehicle_type: null,
            vehicle_plate: null,
            current_lat: null,
            current_lng: null,
            last_position_update: null
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du chauffeur:", error);

        // Gestion des erreurs spécifiques
        if (error.code === '23505') { // Violation de contrainte unique
          toast.error("Un chauffeur avec cet email existe déjà");
        } else {
          toast.error("Erreur lors de la création du chauffeur: " + error.message);
        }
        return;
      }

      toast.success("Chauffeur créé avec succès");
      setShowCreateModal(false);
      fetchDrivers();
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast.error("Une erreur inattendue s'est produite");
    }
  };

  const handleViewDetails = (driverId: string) => {
    navigate(`/dashboard-admin/chauffeurs/${driverId}`);
  };

  const handleDriverMapClick = (driver: Driver) => {
    navigate(`/dashboard-admin/chauffeurs/${driver.id}`);
  };

  // Stats
  const onlineCount = drivers.filter((d) => d.status === "online").length;
  const onDeliveryCount = drivers.filter((d) => d.status === "on_delivery").length;
  const totalDeliveries = drivers.reduce((sum, d) => sum + d.stats.total_deliveries, 0);
  const totalEarnings = drivers.reduce((sum, d) => sum + d.stats.total_earnings, 0);

  // Filtered drivers
  const filteredDrivers = drivers.filter((driver) => {
    if (statusFilter !== "all" && driver.status !== statusFilter) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      driver.first_name.toLowerCase().includes(searchLower) ||
      driver.last_name.toLowerCase().includes(searchLower) ||
      driver.email.toLowerCase().includes(searchLower) ||
      driver.phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Gestion des chauffeurs
          </h1>
          <p className="text-muted-foreground">Suivi et gestion de votre flotte en temps réel</p>
        </div>
        <Button variant="cta" onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={18} />
          Créer chauffeur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Chauffeurs</p>
          <p className="text-3xl font-bold">{drivers.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">En ligne</p>
          <p className="text-3xl font-bold text-success">{onlineCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">En livraison</p>
          <p className="text-3xl font-bold text-blue-600">{onDeliveryCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Gains totaux</p>
          <p className="text-3xl font-bold text-warning">{totalEarnings.toLocaleString()}€</p>
        </Card>
      </div>

      {/* Tabs: Liste / Carte */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste des chauffeurs</TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Carte en temps réel
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card className="p-6 shadow-soft border-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="online">En ligne</SelectItem>
                  <SelectItem value="on_delivery">En déplacement</SelectItem>
                  <SelectItem value="on_break">En pause</SelectItem>
                  <SelectItem value="offline">Hors ligne</SelectItem>
                  <SelectItem value="on_vacation">En vacances</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card className="shadow-soft border-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>En cours</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Gains</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Aucun chauffeur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow
                      key={driver.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleViewDetails(driver.id)}
                    >
                      <TableCell className="font-semibold">
                        {driver.first_name} {driver.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{driver.email}</p>
                          <p className="text-muted-foreground">{driver.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.vehicle ? (
                          <div className="text-sm">
                            <p className="font-medium">
                              {driver.vehicle.brand} {driver.vehicle.model}
                            </p>
                            <p className="text-muted-foreground">{driver.vehicle.plate_number}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getDriverStatusBadgeColor(driver.status)} text-white border-0`}>
                          {getDriverStatusLabel(driver.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${driver.stats.pending_deliveries > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          {driver.stats.pending_deliveries}
                        </span>
                      </TableCell>
                      <TableCell>{driver.stats.total_deliveries}</TableCell>
                      <TableCell>⭐ {driver.stats.average_rating}</TableCell>
                      <TableCell className="font-semibold">{driver.stats.total_earnings}€</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(driver.id)}
                          className="gap-2"
                        >
                          <Eye size={16} />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <DriversMap drivers={drivers} onDriverClick={handleDriverMapClick} />
        </TabsContent>
      </Tabs>

      {/* Create Driver Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau chauffeur</DialogTitle>
          </DialogHeader>
          <CreateDriverForm
            onSubmit={handleCreateDriver}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Drivers;
