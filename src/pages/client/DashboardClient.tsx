import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderWizardModal } from "@/components/admin/orders/wizard/OrderWizardModal";
import { ActivityTimeline } from "@/components/client/ActivityTimeline";
import { useProfile } from "@/hooks/useProfile";
import { useClientStats } from "@/hooks/useClientStats";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { supabase } from "@/lib/supabase";
import { getUserOrdersLegacy as getUserOrders, OrderWithDriver } from "@/services/supabaseQueries";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/constants/orderStatus";

import { toast } from "sonner";
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  MapPin,
  FileText,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Truck,
  Loader2
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DashboardClient = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { stats, loading: statsLoading } = useClientStats(profile?.id);
  const { unreadCount } = useUnreadMessages('client', profile?.id);
  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<OrderWithDriver[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderRef, setLastOrderRef] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (!profile?.id) return;

    // Initial fetch
    fetchOrders(false);

    // Subscribe to realtime changes for this client's orders
    const channel = supabase
      .channel(`orders-client-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${profile.id}`
        },
        (payload) => {
          // Refetch orders when any change happens
          fetchOrders(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  useEffect(() => {
    if (location.state?.openNewOrder) {
      handleOpenModal();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchOrders = async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoadingOrders(true);

      if (profile?.id) {
        const orders = await getUserOrders(profile.id);
        setRecentOrders(orders.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (!isSilent) setIsLoadingOrders(false);
    }
  };

  const handleOpenModal = () => {
    if (profile?.status === 'suspended') {
      toast.error("Compte suspendu", {
        description: "Votre compte a été suspendu. Vous ne pouvez pas passer de commande. Veuillez contacter l'administrateur."
      });
      return;
    }

    if (profile?.status === 'deleted') {
      toast.error("Compte désactivé", {
        description: "Votre compte a été désactivé. Veuillez contacter l'administrateur."
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOrderSubmit = async (data: any) => {
    if (!profile?.id) {
      toast.error("Impossible de créer la commande : profil client introuvable");
      return;
    }

    if (profile?.status === 'suspended') {
      toast.error("Compte suspendu", {
        description: "Votre compte a été suspendu. Vous ne pouvez pas passer de commande."
      });
      handleCloseModal();
      return;
    }

    if (profile?.status === 'deleted') {
      toast.error("Compte désactivé", {
        description: "Votre compte a été désactivé."
      });
      handleCloseModal();
      return;
    }

    try {
      const reference = `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculer le prix à partir du résultat de pricing
      const price = data.pricingResult ? data.pricingResult.totalEuros : 0;

      const newOrder = {
        client_id: profile.id,
        reference: reference,
        pickup_address: data.pickupAddress,
        delivery_address: data.deliveryAddress,
        delivery_type: data.formula, // Utiliser la formule sélectionnée
        price: price,
        status: 'pending_acceptance',
        notes: data.notes,
        pickup_time: data.pickupDate ? new Date(`${data.pickupDate}T${data.pickupTime || '00:00'}`).toISOString() : null,
        user_id: profile.user_id, // Ajout pour RLS
        pickup_lat: data.pickupLat,
        pickup_lng: data.pickupLng,
        delivery_lat: data.deliveryLat,
        delivery_lng: data.deliveryLng,
      };

      const { error } = await supabase
        .from('orders')
        .insert([newOrder]);

      if (error) throw error;

      if (error) throw error;

      // Close wizard first
      handleCloseModal();

      // Show success modal
      setLastOrderRef(reference);
      setShowSuccessModal(true);

      fetchOrders();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Erreur lors de la création de la commande", {
        description: error.message
      });
    }
  };

  const statsCards = [
    {
      title: "Commandes du mois",
      value: statsLoading ? "-" : stats.ordersThisMonth.toString(),
      change: statsLoading ? "-" : stats.ordersChange,
      icon: Package,
      color: "text-accent-main",
      bgColor: "bg-accent-light",
    },
    {
      title: "Taux de succès",
      value: statsLoading ? "-" : `${stats.successRate}%`,
      change: statsLoading ? "-" : stats.successRate >= 80 ? "Excellent" : "Bon",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      title: "Temps moyen",
      value: statsLoading ? "-" : stats.averageDeliveryTime,
      change: statsLoading ? "-" : "Livraison",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
    {
      title: "Dépenses",
      value: statsLoading ? "-" : `${stats.totalSpent}€`,
      change: statsLoading ? "-" : stats.spentChange,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const quickActions = [
    {
      title: "Suivre une livraison",
      description: "Voir en temps réel",
      icon: MapPin,
      color: "text-accent-main",
      bgColor: "bg-accent-light",
      link: "/client/orders",
    },
    {
      title: "Mes factures",
      description: "Consulter & télécharger",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/client/invoices",
    },
    {
      title: "Messages",
      description: unreadCount > 0 ? `${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''}` : "Aucun nouveau",
      icon: MessageSquare,
      color: "text-cta",
      bgColor: "bg-cta/10",
      link: "/client/messages",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING_ACCEPTANCE: return 'bg-status-pending text-status-pending-foreground';
      case 'pending_acceptance': return 'bg-status-pending text-status-pending-foreground';
      case ORDER_STATUS.ACCEPTED: return 'bg-status-accepted text-status-accepted-foreground';
      case ORDER_STATUS.DISPATCHED: return 'bg-status-dispatched text-status-dispatched-foreground';
      case 'in_progress': return 'bg-status-in_progress text-status-in_progress-foreground';
      case ORDER_STATUS.DELIVERED: return 'bg-status-delivered text-status-delivered-foreground';
      case 'cancelled': return 'bg-status-cancelled text-status-cancelled-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    // Try to find in constants first
    if (status === 'pending_acceptance') return ORDER_STATUS_LABELS[ORDER_STATUS.PENDING_ACCEPTANCE];
    if (status === 'in_progress') return ORDER_STATUS_LABELS[ORDER_STATUS.DISPATCHED];

    // @ts-ignore
    return ORDER_STATUS_LABELS[status] || status;
  };

  if (profileLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Account Status Alerts */}
      {profile?.status === 'suspended' && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Loader2 className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-xl font-bold flex items-center gap-2">
                Compte Temporairement Suspendu
              </AlertTitle>
              <AlertDescription className="mt-2 text-base">
                <p className="font-medium">Votre accès aux nouvelles commandes est restreint.</p>
                <p className="mt-1 text-red-700/80">
                  Raison : {profile.suspension_reason || "Non spécifiée. Veuillez contacter le support."}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50" size="sm">
                    Contacter le support
                  </Button>
                  <Button variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50" size="sm">
                    Voir mes factures
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {profile?.status === 'deleted' && (
        <Alert variant="destructive" className="bg-gray-100 border-gray-300 text-gray-900 mb-6">
          <AlertTitle className="font-bold text-lg">Compte Désactivé</AlertTitle>
          <AlertDescription>
            Ce compte a été désactivé. Veuillez contacter l'administrateur pour plus d'informations.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace client - {currentMonth}
          </p>
        </div>
        <Button variant="cta" size="lg" className="gap-2" onClick={handleOpenModal}>
          <Plus className="h-5 w-5" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="p-6 shadow-soft border-0 hover:shadow-medium transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <Badge
                variant="outline"
                className={`${stat.change.startsWith("+") || stat.change === "Excellent"
                  ? "text-success border-success"
                  : stat.change.startsWith("-")
                    ? "text-destructive border-destructive"
                    : "text-primary border-primary"
                  }`}
              >
                {stat.change}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-display font-bold text-primary">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="p-6 shadow-soft border-0 hover:shadow-strong cursor-pointer transition-all duration-300 group"
            onClick={() => navigate(action.link)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-1 group-hover:text-accent-main transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-main group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="shadow-soft border-0">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-primary mb-1">
                Commandes récentes
              </h2>
              <p className="text-sm text-muted-foreground">
                Vos dernières livraisons
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/client/orders')}>
              Voir tout
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {isLoadingOrders ? (
            <div className="p-8 text-center text-muted-foreground">Chargement des commandes...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Aucune commande récente.</div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/client/orders/${order.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-primary">{order.reference}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{order.pickup_address}</span>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{order.delivery_address}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Type: {order.delivery_type}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-6 shadow-soft border-0">
        <h2 className="text-xl font-display font-bold text-primary mb-6">
          Activité récente
        </h2>
        {profile?.id ? (
          <ActivityTimeline clientId={profile.id} limit={8} />
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Chargement de l'activité...
          </div>
        )}
      </Card>

      {/* Modal de création de commande */}
      <OrderWizardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleOrderSubmit}
        mode="client"
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Commande créée !</DialogTitle>
              <DialogDescription className="text-center text-lg">
                Votre commande a été enregistrée avec succès.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-muted/30 rounded-lg w-full">
              <p className="text-sm text-muted-foreground mb-1">Référence</p>
              <p className="text-xl font-mono font-bold text-primary">{lastOrderRef}</p>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
              size="lg"
              onClick={() => setShowSuccessModal(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardClient;
