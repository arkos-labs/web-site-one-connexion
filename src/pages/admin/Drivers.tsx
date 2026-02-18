import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CreateDriverModal from "@/components/admin/drivers/CreateDriverModal";
import DriversMap from "@/components/admin/drivers/DriversMap";
import { DocumentsStatusBadge } from "@/components/admin/drivers/DocumentsStatusBadge";
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
import { createDriver } from "@/services/adminSupabaseQueries";

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

    // Realtime subscription : Optimisé pour une mise à jour INSTANTANÉE (Directe)
    const channel = supabase
      .channel('admin-drivers-list')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'drivers' },
        (payload) => {
          // 1. Mise à jour Optimiste (Immédiate)
          setDrivers((currentDrivers) =>
            currentDrivers.map((driver) => {
              if (driver.id === payload.new.id) {
                // Conversion du statut DB vers Frontend
                const dbStatus = payload.new.status;
                let newStatus = 'offline';

                if (dbStatus === 'available') newStatus = 'online';
                else if (dbStatus === 'busy') newStatus = 'on_delivery';
                else if (dbStatus === 'on_break') newStatus = 'on_break';
                else if (dbStatus === 'on_vacation') newStatus = 'on_vacation';
                else if (['online', 'offline', 'on_delivery'].includes(dbStatus)) newStatus = dbStatus;

                return {
                  ...driver,
                  ...payload.new, // Met à jour les champs bruts
                  status: newStatus as any, // Cast nécessaire car le type DriverStatus est strict
                };
              }
              return driver;
            })
          );
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        (payload) => {
          // Pour les INSERT/DELETE, on recharge
          if (payload.eventType !== 'UPDATE') {
            fetchDrivers();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Orders affect driver stats (deliveries, earnings)
          fetchDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Fetch documents for each driver
      const { data: documentsData, error: documentsError } = await supabase
        .from('driver_documents')
        .select('driver_id, status');

      if (documentsError) console.error('Error fetching documents:', documentsError);
      // const documentsData: any[] = [];

      if (driversData) {
        const realDrivers: Driver[] = driversData.map((d: any) => {
          // Calculate stats from orders
          const driverOrders = ordersData?.filter((o: any) => o.driver_id === d.id || o.driver_id === d.user_id) || [];

          const totalDeliveries = driverOrders.filter((o: any) => o.status === 'delivered').length;
          const cancelledDeliveries = driverOrders.filter((o: any) => o.status === 'cancelled').length;
          // Active orders: dispatched (assigned) or in_progress (picked up)
          const pendingDeliveries = driverOrders.filter((o: any) => ['dispatched', 'in_progress', 'driver_accepted', 'arrived_pickup'].includes(o.status)).length;
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

          // Handle vehicle info (JSON priority or Flat fallback)
          const vehicleInfo = d.vehicle ? {
            id: 'primary',
            driver_id: d.id,
            brand: d.vehicle.brand || 'Véhicule',
            model: d.vehicle.model || 'Principal',
            plate_number: d.vehicle.plate_number || d.vehicle_registration || 'Non renseigné',
            type: d.vehicle.type || d.vehicle_type,
            status: 'active',
            created_at: d.created_at,
            updated_at: d.updated_at
          } : d.vehicle_type ? {
            id: 'primary',
            driver_id: d.id,
            brand: 'Véhicule',
            model: 'Principal',
            plate_number: d.vehicle_registration || 'Non renseigné',
            type: d.vehicle_type,
            status: 'active',
            created_at: d.created_at,
            updated_at: d.updated_at
          } : undefined;

          // Calculate documents status
          const driverDocs = documentsData?.filter((doc: any) => doc.driver_id === d.user_id) || [];
          let documentsStatus = 'not_submitted';

          if (driverDocs.length > 0) {
            const allApproved = driverDocs.every((doc: any) => doc.status === 'approved');
            const anyRejected = driverDocs.some((doc: any) => doc.status === 'rejected');
            const anyPending = driverDocs.some((doc: any) => doc.status === 'pending');

            if (allApproved) {
              documentsStatus = 'validated';
            } else if (anyRejected) {
              documentsStatus = 'rejected';
            } else if (anyPending) {
              documentsStatus = 'pending';
            }
          }

          return {
            id: d.id,
            first_name: d.first_name,
            last_name: d.last_name,
            email: d.email,
            phone: d.phone,
            username: d.username,        // Nouveau
            plain_password: d.plain_password, // Nouveau
            documents_status: documentsStatus, // Statut calculé des documents
            documents_submitted_at: d.documents_submitted_at, // Date de soumission
            status: status,
            vehicle: vehicleInfo,
            documents: d.license_number ? [{
              id: 'temp-license-id', // Placeholder until real docs are fetched
              type: 'license',
              name: 'Permis de conduire',
              status: 'valid', // Assume valid if license number exists for now
              uploaded_at: d.created_at || new Date().toISOString(),
              expiry_date: undefined,
              file_url: undefined
            } as any] : [],
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

  const handleCreateDriver = async () => {
    try {
      // Le modal s'occupe déjà de la création via RPC
      // On a juste besoin de rafraîchir la liste
      setShowCreateModal(false);
      fetchDrivers();
    } catch (error: any) {
      console.error("Erreur post-création:", error);
    }
  };

  const handleViewDetails = (driverId: string) => {
    navigate(`/dashboard-admin/chauffeurs/${driverId}`);
  };

  const handleDriverMapClick = (driver: Driver) => {
    navigate(`/dashboard-admin/chauffeurs/${driver.id}`);
  };

  // Stats
  // FIXED: User wants 'En ligne' to include drivers on delivery
  const onlineCount = drivers.filter((d) => d.status === "online" || d.status === "on_delivery").length;
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
                  <TableHead>Documents</TableHead>
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
                    <TableCell colSpan={10} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
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
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <span>{driver.vehicle.plate_number}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold border">
                                {driver.vehicle.type || 'Standard'}
                              </span>
                            </div>
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DocumentsStatusBadge documentsStatus={(driver as any).documents_status} />
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
      <CreateDriverModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDriver}
      />
    </div>
  );
};

export default Drivers;
