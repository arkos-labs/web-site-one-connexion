import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle,
  XCircle,
  Copy,
  Plus,
  Truck,
  RefreshCw,
  Loader2,
  Lock,
  Check,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Services
import {
  getAllOrders,
  updateOrderStatus,
  assignDriverToOrder,
  cancelOrder,
  duplicateOrder,
  sendMessageToClient,
  OrderWithDetails,
  getOrdersPaginated,
  getGlobalOrderStats
} from "@/services/adminSupabaseQueries";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { supabase } from "@/lib/supabase";

// Components
import DispatchDriverModal from "@/components/admin/orders/DispatchDriverModal";
import { CreateClientModal } from "@/components/admin/clients/CreateClientModal";
import { OrderWizardModal } from "@/components/admin/orders/wizard/OrderWizardModal";
import { ConfirmDialog, CancelOrderDialog } from "@/components/admin/orders/ConfirmDialogs";

// Helper function to check if dispatch is allowed
const getDispatchStatus = (scheduledPickupTime?: string) => {
  if (!scheduledPickupTime) {
    return { allowed: true, unlockTime: null, isImmediate: true };
  }

  const pickupTime = new Date(scheduledPickupTime);
  const unlockTime = new Date(pickupTime.getTime() - 45 * 60000); // -45 minutes
  const now = new Date();

  return {
    allowed: now >= unlockTime,
    unlockTime,
    isImmediate: false
  };
};

const OrdersAdmin = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<OrderWithDetails | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newCreatedOrderId, setNewCreatedOrderId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 10;

  // Confirmation dialogs state
  const [deliveryConfirmOpen, setDeliveryConfirmOpen] = useState(false);
  const [orderToDeliver, setOrderToDeliver] = useState<OrderWithDetails | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithDetails | null>(null);

  // Fetch orders
  const fetchOrders = async (page = currentPage, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const { data, count, totalPages: pages } = await getOrdersPaginated(page, pageSize, searchQuery, statusFilter);
      setOrders(data);
      setTotalPages(pages);
      setTotalOrders(count);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(`Erreur lors du chargement des commandes: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Debounce search and filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders(currentPage, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage]); // Re-subscribe if page changes to ensure we refresh correct data? No, just refresh current page.

  // ==================== ACTIONS ====================

  // Accepter une commande
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'accepted', {
        accepted_at: new Date().toISOString()
      });
      toast.success("Commande acceptée avec succès");
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'acceptation de la commande");
    }
  };

  // Ouvrir le modal de dispatch
  const openDispatchModal = (order: OrderWithDetails) => {
    if (order.status !== 'accepted') {
      toast.error("Cette commande doit d'abord être acceptée");
      return;
    }
    setSelectedOrderForDispatch(order);
    setDispatchModalOpen(true);
  };

  // Dispatcher une commande
  const handleDispatchOrder = async (driverId: string) => {
    if (!selectedOrderForDispatch) return;

    try {
      await assignDriverToOrder(selectedOrderForDispatch.id, driverId);
      toast.success("Commande dispatchée avec succès");
      setDispatchModalOpen(false);
      setSelectedOrderForDispatch(null);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du dispatch de la commande");
    }
  };

  // Marquer comme livrée - ouvrir le modal de confirmation
  const openDeliveryConfirm = (order: OrderWithDetails) => {
    if (order.status !== 'dispatched' && order.status !== 'in_progress') {
      toast.error("Seules les commandes dispatchées peuvent être marquées comme livrées");
      return;
    }
    setOrderToDeliver(order);
    setDeliveryConfirmOpen(true);
  };

  // Confirmer la livraison
  const confirmDelivery = async () => {
    if (!orderToDeliver) return;
    try {
      await updateOrderStatus(orderToDeliver.id, 'delivered', {
        delivered_at: new Date().toISOString()
      });
      toast.success("Commande marquée comme livrée");
      setDeliveryConfirmOpen(false);
      setOrderToDeliver(null);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la validation de la livraison");
    }
  };

  // Annuler une commande - ouvrir le modal
  const openCancelDialog = (order: OrderWithDetails) => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      toast.error("Cette commande ne peut pas être annulée");
      return;
    }
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  // Confirmer l'annulation
  const confirmCancellation = async (reason: string) => {
    if (!orderToCancel) return;
    try {
      // 1. Annuler la commande
      await cancelOrder(orderToCancel.id, reason);

      // 2. Envoyer un message au client
      if (orderToCancel.client_id) {
        await sendMessageToClient(
          orderToCancel.client_id,
          `Votre commande ${orderToCancel.reference} a été annulée pour le motif suivant : ${reason}`,
          'Commande annulée'
        );
      }

      toast.success("Commande annulée et client notifié");
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'annulation de la commande");
    }
  };

  // Dupliquer une commande
  const handleDuplicateOrder = async (orderId: string) => {
    try {
      const newOrderId = await duplicateOrder(orderId);
      setNewCreatedOrderId(newOrderId);
      setShowSuccessDialog(true);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la duplication de la commande");
    }
  };

  // Gestion du modal de création de client
  const handleOpenCreateClientModal = () => setIsCreateClientModalOpen(true);
  const handleCloseCreateClientModal = () => setIsCreateClientModalOpen(false);

  const handleClientCreated = async (newClient: any) => {
    // newClient comes from CreateClientModal onSuccess which passes the full profile object
    try {
      if (newClient) {
        setClients(prev => [...prev, { id: newClient.id, name: newClient.company_name }]);
        setSelectedClientId(newClient.id);
      }
    } catch (error) {
      console.error("Error handling new client:", error);
      toast.error("Erreur lors de la récupération du nouveau client");
    }
    handleCloseCreateClientModal();
  };

  // Charger les clients pour le dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, company_name')
          .order('company_name');

        if (error) throw error;

        if (data) {
          setClients(data.map(c => ({ id: c.id, name: c.company_name })));
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
      }
    };
    fetchClients();
  }, []);

  // Créer une commande
  const handleOrderSubmit = async (data: any) => {
    // Le client ID vient maintenant du wizard
    const clientIdToUse = data.clientId || selectedClientId;

    if (!clientIdToUse) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `CMD-${dateStr}-${randomSuffix}`;

      // DEBUG: Voir ce qui est reçu
      console.log('📋 Données reçues:', { pickupDate: data.pickupDate, pickupTime: data.pickupTime });

      // Calculer scheduled_pickup_time si date/heure fournies
      let scheduledPickupTime: string | null = null;
      if (data.pickupDate && data.pickupTime) {
        const scheduledDateTime = new Date(`${data.pickupDate}T${data.pickupTime}`);
        const now = new Date();
        const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);

        // Si c'est dans plus de 45 minutes, c'est une commande différée
        if (diffMinutes > 45) {
          scheduledPickupTime = scheduledDateTime.toISOString();
        }
      }

      const { error } = await supabase
        .from('orders')
        .insert({
          reference: reference,
          client_id: clientIdToUse,
          pickup_address: data.pickupAddress,
          delivery_address: data.deliveryAddress,
          delivery_type: data.packageType,
          status: 'pending_acceptance',
          price: data.pricingResult?.totalEuros || 0,
          scheduled_pickup_time: scheduledPickupTime,
        });

      if (error) throw error;

      toast.success(scheduledPickupTime
        ? `Commande différée créée pour le ${new Date(scheduledPickupTime).toLocaleString('fr-FR')}`
        : 'Commande immédiate créée avec succès'
      );
      setCreateModalOpen(false);
      setSelectedClientId('');
      fetchOrders();
    } catch (e: any) {
      console.error("Error creating order:", e);
      toast.error(e.message || 'Erreur inattendue lors de la création de la commande');
    }
  };

  // Navigation vers la page de détails
  const openDetailsPage = (orderId: string) => {
    navigate(`/dashboard-admin/commandes/${orderId}`);
  };

  // ==================== HELPERS ====================

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "pending" | "accepted" | "dispatched" | "in_progress" | "delivered" | "cancelled" => {
    const variants: Record<string, any> = {
      pending_acceptance: 'pending',
      accepted: 'accepted',
      dispatched: 'dispatched',
      in_progress: 'in_progress',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return variants[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_acceptance: 'En attente',
      accepted: 'Acceptée',
      dispatched: 'Dispatchée',
      in_progress: 'En cours',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const canAcceptOrder = (order: OrderWithDetails) => {
    return order.status === 'pending_acceptance';
  };

  const canDispatchOrder = (order: OrderWithDetails) => {
    return order.status === 'accepted';
  };

  const canMarkAsDelivered = (order: OrderWithDetails) => {
    return order.status === 'dispatched' || order.status === 'in_progress';
  };

  const canCancelOrder = (order: OrderWithDetails) => {
    return order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Gestion des commandes
          </h1>
          <p className="text-muted-foreground">
            Acceptez, dispatchez et gérez toutes les livraisons en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOrders(currentPage, false)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="cta" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une commande
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-soft border-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, client, adresse..."
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
              <SelectItem value="pending_acceptance">En attente</SelectItem>
              <SelectItem value="accepted">Acceptée</SelectItem>
              <SelectItem value="dispatched">Dispatchée</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-soft border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dispatch</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const dispatchStatus = getDispatchStatus(order.scheduled_pickup_time);

                return (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => openDetailsPage(order.id)}
                  >
                    <TableCell className="font-semibold text-primary">
                      {order.reference}
                    </TableCell>

                    {/* TYPE BADGE */}
                    <TableCell>
                      {dispatchStatus.isImmediate ? (
                        <Badge className="bg-info/20 text-info border-0 rounded-full px-3 py-1 text-xs font-semibold">
                          Immédiat
                        </Badge>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-warning/20 text-warning border-0 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
                            Différé
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.scheduled_pickup_time!).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.clients?.company_name ||
                              (order.facturation?.societe) ||
                              order.nom_client ||
                              "Client inconnu"}
                          </span>
                          {!order.user_id && (
                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                              Invité
                            </Badge>
                          )}
                        </div>
                        {!order.user_id && order.email_client && (
                          <span className="text-xs text-muted-foreground">
                            {order.email_client}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="truncate text-muted-foreground" title={order.pickup_address}>
                          {order.pickup_address}
                        </span>
                        <span className="truncate font-medium" title={order.delivery_address}>
                          ↘ {order.delivery_address}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="border-0">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>

                    {/* DISPATCH STATUS */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {['delivered', 'cancelled'].includes(order.status) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground font-medium">
                            Indisponible
                          </span>
                        </div>
                      ) : (
                        <>
                          {!dispatchStatus.isImmediate && (
                            <div className="flex items-center gap-1.5">
                              {dispatchStatus.allowed ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-success" />
                                  <span className="text-xs text-success font-medium">
                                    Disponible
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      Verrouillé
                                    </span>
                                    <span className="text-xs text-muted-foreground/80">
                                      jusqu'à {dispatchStatus.unlockTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          {dispatchStatus.isImmediate && (
                            <div className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-success" />
                              <span className="text-xs text-success font-medium">
                                Disponible
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {order.drivers ? (
                        <span className="text-sm font-medium">
                          {order.drivers.first_name} {order.drivers.last_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non assigné</span>
                      )}
                    </TableCell>

                    <TableCell className="font-semibold">
                      {order.price > 0 ? `${order.price}€` : '-'}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {/* Accepter */}
                        {canAcceptOrder(order) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Accepter la commande"
                            onClick={() => handleAcceptOrder(order.id)}
                            className="text-success hover:text-success"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Dispatcher */}
                        {canDispatchOrder(order) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title={dispatchStatus.allowed ? "Dispatcher la commande" : `Dispatch verrouillé jusqu'à ${dispatchStatus.unlockTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                            onClick={() => openDispatchModal(order)}
                            disabled={!dispatchStatus.allowed && !order.driver_id}
                            className="text-info hover:text-info/80 disabled:opacity-50"
                          >
                            {!dispatchStatus.allowed && !order.driver_id ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Truck className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {/* Marquer comme livrée */}
                        {canMarkAsDelivered(order) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Marquer comme livrée"
                            onClick={() => openDeliveryConfirm(order)}
                            className="text-primary hover:text-primary/80"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Annuler */}
                        {canCancelOrder(order) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Annuler la commande"
                            onClick={() => openCancelDialog(order)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Dupliquer */}
                        {order.status === 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Dupliquer la commande"
                            onClick={() => handleDuplicateOrder(order.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modals */}
      {selectedOrderForDispatch && (
        <DispatchDriverModal
          isOpen={dispatchModalOpen}
          onClose={() => {
            setDispatchModalOpen(false);
            setSelectedOrderForDispatch(null);
          }}
          orderId={selectedOrderForDispatch.id}
          pickupAddress={selectedOrderForDispatch.pickup_address}
          onDispatch={handleDispatchOrder}
        />
      )}

      <OrderWizardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleOrderSubmit}
        mode="admin"
      />

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={handleCloseCreateClientModal}
        onSuccess={handleClientCreated}
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Commande dupliquée !</DialogTitle>
              <DialogDescription className="text-center">
                La commande a été dupliquée avec succès. Une nouvelle référence a été générée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full sm:justify-center">
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  setShowSuccessDialog(false);
                  if (newCreatedOrderId) {
                    navigate(`/dashboard-admin/commandes/${newCreatedOrderId}`);
                  }
                }}
              >
                Voir la nouvelle commande
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deliveryConfirmOpen}
        onClose={() => {
          setDeliveryConfirmOpen(false);
          setOrderToDeliver(null);
        }}
        onConfirm={confirmDelivery}
        title="Confirmer la livraison"
        description={`Voulez-vous marquer la commande ${orderToDeliver?.reference || ''} comme livrée ?`}
        confirmLabel="Confirmer la livraison"
        variant="success"
      />

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancellation}
        orderReference={orderToCancel?.reference || ''}
      />
    </div>
  );
};

export default OrdersAdmin;
