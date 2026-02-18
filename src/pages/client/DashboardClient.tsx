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
  ArrowRight,
  Truck,
  Loader2,
  Calendar
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderCardSkeleton, StatCardSkeleton } from "@/components/ui/skeleton-loaders";

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
    if (!profile?.id) {
      if (!profileLoading) setIsLoadingOrders(false);
      return;
    }

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
  }, [profile?.id, profileLoading]);

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
        // Add a detailed log to debug if it hangs
        console.log("Fetching orders for client:", profile.id);

        // Use Promise.race to enforce a timeout on the fetch operation
        const ordersPromise = getUserOrders(profile.id);
        const timeoutPromise = new Promise<OrderWithDriver[]>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        try {
          const orders = await Promise.race([ordersPromise, timeoutPromise]);
          setRecentOrders(orders.slice(0, 5));
        } catch (err) {
          console.error("Fetch orders timed out/failed, defaulting to empty list.", err);
          // Default to empty list on error to show "Aucune commande" instead of stuck loader
          setRecentOrders([]);
        }
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
      const price = data.pricingResult ? data.pricingResult.totalEuros : 0;

      const newOrder = {
        client_id: profile.id,
        reference: reference,
        pickup_address: data.pickupAddress,
        delivery_address: data.deliveryAddress,
        delivery_type: data.formula,
        price: price,
        status: 'pending_acceptance',
        notes: data.notes,
        pickup_time: data.pickupDate ? new Date(`${data.pickupDate}T${data.pickupTime || '00:00'}`).toISOString() : null,
        user_id: profile.user_id,
        pickup_lat: data.pickupLat,
        pickup_lng: data.pickupLng,
        delivery_lat: data.deliveryLat,
        delivery_lng: data.deliveryLng,
      };

      const { error } = await supabase
        .from('orders')
        .insert([newOrder]);

      if (error) throw error;

      handleCloseModal();
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
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
    {
      title: "Facturation",
      value: statsLoading ? "-" : `${stats.totalSpent}€`,
      change: statsLoading ? "-" : stats.spentChange,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Temps moyen",
      value: statsLoading ? "-" : stats.averageDeliveryTime,
      change: "min",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Taux de succès",
      value: statsLoading ? "-" : `${stats.successRate}%`,
      change: "succès",
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const quickActions = [
    {
      title: "Suivre une livraison",
      description: "Temps réel",
      icon: MapPin,
      link: "/client/orders",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Mes factures",
      description: "Consulter l'historique",
      icon: FileText,
      link: "/client/invoices",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Support Client",
      description: unreadCount > 0 ? `${unreadCount} message(s)` : "Besoin d'aide ?",
      icon: MessageSquare,
      link: "/client/messages",
      color: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING_ACCEPTANCE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ORDER_STATUS.ACCEPTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ORDER_STATUS.DISPATCHED: return 'bg-purple-100 text-purple-800 border-purple-200';
      case ORDER_STATUS.IN_PROGRESS: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case ORDER_STATUS.DELIVERED: return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    // @ts-ignore
    return ORDER_STATUS_LABELS[status] || status;
  };

  if (profileLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Account Alerts */}
      {profile?.status === 'suspended' && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTitle>Compte Suspendu</AlertTitle>
          <AlertDescription>Votre compte est suspendu. Contactez le support.</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#0B1525] tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span className="capitalize">{currentMonth}</span>
          </p>
        </div>
        <Button
          className="bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium px-4 h-11 shadow-md hover:shadow-lg transition-all rounded-xl"
          onClick={handleOpenModal}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statsCards.map((stat, index) => (
            <Card
              key={index}
              className="p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.value.includes('+') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-[#0B1525]">{stat.value}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content (Recent Orders) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-[#0B1525]">Commandes récentes</h2>
            <Button variant="ghost" size="sm" className="text-[#D4AF37] hover:bg-[#D4AF37]/10" onClick={() => navigate('/client/orders')}>
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {isLoadingOrders ? (
                <div className="p-6 space-y-4">
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucune commande</p>
                  <p className="text-gray-400 text-sm mt-1">Commencez par créer votre première course !</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/client/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#0B1525]/5 rounded-lg flex items-center justify-center text-[#0B1525] font-bold text-xs">
                          {order.delivery_type === 'express' ? 'EXP' : 'STD'}
                        </div>
                        <div>
                          <p className="font-bold text-[#0B1525] group-hover:text-[#D4AF37] transition-colors">{order.reference}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge className={`border-0 font-medium px-3 py-1 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-4 pl-13">
                      <div className="flex-1 relative">
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4">
                          <div className="relative pl-4">
                            <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0B1525]"></div>
                            <p className="text-sm font-medium text-gray-900 truncate">{order.pickup_address}</p>
                          </div>
                          <div className="relative pl-4">
                            <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#D4AF37]"></div>
                            <p className="text-sm font-medium text-gray-900 truncate">{order.delivery_address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-lg font-bold text-[#0B1525]">{order.price}€</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Content (Quick Actions & Activity) */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#0B1525]">Accès rapide</h2>
            <div className="grid gap-4">
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#D4AF37]/30 transition-all cursor-pointer group flex items-center gap-4"
                  onClick={() => navigate(action.link)}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#D4AF37] transition-colors">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-serif font-bold text-[#0B1525] mb-4">Activité récente</h2>
            {profile?.id ? (
              <ActivityTimeline clientId={profile.id} limit={5} />
            ) : (
              <div className="py-4 text-center text-gray-400 text-sm">Chargement...</div>
            )}
          </div>
        </div>
      </div>

      <OrderWizardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleOrderSubmit}
        mode="client"
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-center text-[#0B1525]">Commande confirmée</DialogTitle>
              <DialogDescription className="text-center text-base">
                Votre demande de course a bien été prise en compte.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-50 rounded-xl w-full border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Référence</p>
              <p className="text-2xl font-mono font-bold text-[#0B1525]">{lastOrderRef}</p>
            </div>
            <Button
              className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium h-12 rounded-xl shadow-md hover:shadow-lg transition-all mt-4"
              onClick={() => setShowSuccessModal(false)}
            >
              Fermer et suivre ma commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardClient;
