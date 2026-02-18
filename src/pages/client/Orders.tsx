import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Search, Download, Eye, Calendar, Package, Loader2 } from "lucide-react";
import { OrderWithDriver, getUserOrdersLegacy as getUserOrders } from "@/services/supabaseQueries";
import { generateOrderPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

type TimeFilter = "all" | "today" | "week" | "month" | "year";
type StatusFilter = "all" | "pending" | "in_progress" | "delivered" | "cancelled";

const Orders = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [orders, setOrders] = useState<OrderWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Charger les commandes quand le profil est prêt
  useEffect(() => {
    if (profile?.id) {
      loadOrders();

      // Realtime subscription
      const channel = supabase
        .channel(`client-orders-list-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `client_id=eq.${profile.id}`
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else if (!profileLoading && !profile) {
      setLoading(false); // Pas de profil, on arrête le chargement
    }
  }, [profile, profileLoading]);

  const loadOrders = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const clientOrders = await getUserOrders(profile.id);
      setOrders(clientOrders);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  // Fonction de filtrage par date
  const filterByDate = (orderDate: string, filter: TimeFilter): boolean => {
    if (filter === "all") return true;

    const date = new Date(orderDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return date >= today;
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      }
      case "year": {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date >= yearAgo;
      }
      default:
        return true;
    }
  };

  // Filtrer les commandes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = (() => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return ["pending", "pending_acceptance"].includes(order.status);
      if (statusFilter === "in_progress") return ["accepted", "dispatched", "in_progress"].includes(order.status);
      return order.status === statusFilter;
    })();

    const matchesDate = filterByDate(order.created_at, timeFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: OrderWithDriver['status']) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'En attente', className: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90' },
      pending_acceptance: { label: 'En attente', className: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/90' },
      accepted: { label: 'Acceptée', className: 'bg-status-accepted text-status-accepted-foreground hover:bg-status-accepted/90' },
      dispatched: { label: 'En cours', className: 'bg-status-dispatched text-status-dispatched-foreground hover:bg-status-dispatched/90' },
      in_progress: { label: 'En cours', className: 'bg-status-in_progress text-status-in_progress-foreground hover:bg-status-in_progress/90' },
      delivered: { label: 'Livrée', className: 'bg-status-delivered text-status-delivered-foreground hover:bg-status-delivered/90' },
      cancelled: { label: 'Annulée', className: 'bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/90' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };

    return (
      <Badge className={`${config.className} border-0`}>
        {config.label}
      </Badge>
    );
  };

  // Naviguer vers la page de détails
  const handleViewOrder = (order: OrderWithDriver) => {
    navigate(`/client/commandes/${order.id}`);
  };

  // Télécharger le bon de commande
  const handleDownloadPDF = (order: OrderWithDriver, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!profile) {
      toast.error("Profil client introuvable");
      return;
    }

    // Utiliser les vraies données du profil client
    const clientInfo = {
      name: profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : 'Client',
      email: profile.email || '',
      phone: profile.phone || '',
      company: profile.company_name || ''
    };

    try {
      generateOrderPDF(order, clientInfo);
      toast.success("Bon de commande téléchargé");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Mes commandes
          </h1>
          <p className="text-muted-foreground">
            Gérez et consultez toutes vos livraisons
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <Package className="h-5 w-5" />
          <span className="font-semibold">{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-6 shadow-soft border-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, adresse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par période */}
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par statut */}
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tableau des commandes */}
      <Card className="shadow-soft border-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">Aucune commande trouvée</p>
            <p className="text-muted-foreground text-sm mt-2">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Référence</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Adresse retrait</TableHead>
                  <TableHead className="font-semibold">Adresse livraison</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Prix</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleViewOrder(order)}
                  >
                    <TableCell className="font-semibold text-primary">
                      {order.reference}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate" title={order.pickup_address}>
                      {order.pickup_address}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate" title={order.delivery_address}>
                      {order.delivery_address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/20 text-primary">
                        {order.delivery_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.price.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className="hover:bg-primary/10 hover:text-primary"
                          title="Voir la commande"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDownloadPDF(order, e)}
                          className="hover:bg-cta/20 hover:text-cta-foreground"
                          title="Télécharger le bon de commande"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Orders;

