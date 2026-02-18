import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Package,
  Truck,
  Navigation,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import LiveMap from '@/components/tracking/LiveMap';
import { useOrderTracking, useActiveOrders, OrderTracking } from '@/hooks/useOrderTracking';
import { useProfile } from '@/hooks/useProfile';

const Tracking = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { orders, loading: ordersLoading } = useActiveOrders(profile?.id);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { tracking, loading: trackingLoading, error } = useOrderTracking(selectedOrderId);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [filterStatus, setFilterStatus] = useState<'active' | 'delivered'>('active');

  // Filtrer les commandes
  const activeOrdersList = useMemo(() => orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'), [orders]);
  const deliveredOrdersList = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);

  const displayedOrders = filterStatus === 'active' ? activeOrdersList : deliveredOrdersList;

  // Gestion de la sélection automatique
  useEffect(() => {
    if (displayedOrders.length > 0) {
      // Si la commande sélectionnée n'est pas dans la liste affichée, on sélectionne la première
      const isSelectedInList = displayedOrders.find(o => o.id === selectedOrderId);
      if (!isSelectedInList) {
        setSelectedOrderId(displayedOrders[0].id);
      }
    } else {
      // Si la liste est vide, on désélectionne (sauf si on veut garder l'état précédent, mais ici c'est plus propre)
      // Cependant, pour éviter des clignotements si le chargement est en cours, on peut vérifier loading
      // Mais ici on est dans le composant principal
      setSelectedOrderId(null);
    }
  }, [filterStatus, displayedOrders, selectedOrderId]);

  // Mettre à jour l'heure de dernière mise à jour
  useEffect(() => {
    if (tracking) {
      setLastUpdate(new Date());
    }
  }, [tracking]);

  // Fonction pour obtenir le statut en français
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_acceptance: 'En attente',
      accepted: 'Acceptée',
      dispatched: 'En acheminement',
      in_progress: 'En cours',
      delivered: 'Livré',
      cancelled: 'Annulée',
    };
    return statusMap[status] || status;
  };

  // Fonction pour obtenir la couleur du badge
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending_acceptance: 'bg-warning',
      accepted: 'bg-info',
      dispatched: 'bg-info',
      in_progress: 'bg-accent-main',
      delivered: 'bg-success',
      cancelled: 'bg-destructive',
    };
    return colorMap[status] || 'bg-muted';
  };

  // Timeline des étapes
  const getTimeline = (trackingData: OrderTracking) => {
    const { status, created_at, accepted_at, dispatched_at, pickup_time, delivery_time, driver } = trackingData;

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (start: string | null, end: string | null) => {
      if (!start || !end) return null;
      const diff = new Date(end).getTime() - new Date(start).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return '< 1 min';
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
      }
      return `${minutes} min`;
    };

    const steps = [
      {
        label: 'Commande créée',
        icon: Package,
        status: 'completed',
        time: formatDate(created_at),
        date: created_at,
        description: 'Votre commande a été enregistrée',
        duration: null
      },
      {
        label: 'Commande acceptée',
        icon: CheckCircle,
        status: ['accepted', 'dispatched', 'in_progress', 'delivered'].includes(status) ? 'completed' : 'pending',
        time: formatDate(accepted_at),
        date: accepted_at,
        description: 'La commande a été validée par nos équipes',
        duration: calculateDuration(created_at, accepted_at)
      },
      {
        label: 'Chauffeur en route',
        icon: Truck,
        status: ['dispatched', 'in_progress', 'delivered'].includes(status) ? 'completed' : 'pending',
        time: formatDate(dispatched_at),
        date: dispatched_at,
        description: driver ? `${driver.name} est en route vers le point de retrait` : 'Recherche d\'un chauffeur...',
        duration: calculateDuration(accepted_at, dispatched_at)
      },
      {
        label: 'Colis récupéré',
        icon: MapPin,
        status: ['in_progress', 'delivered'].includes(status) ? 'completed' : status === 'dispatched' ? 'active' : 'pending',
        time: formatDate(pickup_time),
        date: pickup_time,
        description: 'Le chauffeur a récupéré le colis',
        duration: calculateDuration(dispatched_at, pickup_time)
      },
      {
        label: 'Livraison effectuée',
        icon: CheckCircle,
        status: status === 'delivered' ? 'completed' : status === 'in_progress' ? 'active' : 'pending',
        time: formatDate(delivery_time),
        date: delivery_time,
        description: 'Colis livré à destination',
        duration: calculateDuration(pickup_time, delivery_time)
      },
    ];
    return steps;
  };

  // Si aucune commande active (au global)
  if (!ordersLoading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Suivi en temps réel
          </h1>
          <p className="text-muted-foreground">
            Suivez vos livraisons en cours sur la carte
          </p>
        </div>

        <Card className="p-12 shadow-soft border-0">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">
              Aucune course en cours
            </h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez actuellement aucune livraison active à suivre.
            </p>
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate('/client/tableau-de-bord', { state: { openNewOrder: true } })}
            >
              <Package className="h-5 w-5 mr-2" />
              Créer une nouvelle commande
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Vérifier si la commande a un chauffeur assigné et des coordonnées GPS
  const hasDriverLocation = tracking?.driver?.location !== null;
  const canShowMap = tracking?.status === 'accepted' || tracking?.status === 'dispatched' || tracking?.status === 'in_progress';
  const isCancelled = tracking?.status === 'cancelled';
  const isDelivered = tracking?.status === 'delivered';

  return (
    <div className="space-y-6">
      {/* Header avec Filtres */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary mb-2">
              Suivi en temps réel
            </h1>
            <p className="text-muted-foreground">
              Suivez l'acheminement de vos colis étape par étape
            </p>
          </div>
          {!isCancelled && !isDelivered && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full w-fit">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Actualisation en direct</span>
            </div>
          )}
        </div>

        {/* Barre de filtres (Tabs) */}
        <div className="flex items-center gap-2 border-b">
          <button
            onClick={() => setFilterStatus('active')}
            className={`
                    pb-3 px-4 text-sm font-medium transition-all relative
                    ${filterStatus === 'active'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
              }
                `}
          >
            En cours
            <Badge className={`ml-2 ${filterStatus === 'active' ? 'bg-primary' : 'bg-muted text-muted-foreground'} border-0`}>
              {activeOrdersList.length}
            </Badge>
            {filterStatus === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setFilterStatus('delivered')}
            className={`
                    pb-3 px-4 text-sm font-medium transition-all relative
                    ${filterStatus === 'delivered'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
              }
                `}
          >
            Livrées (24h)
            <Badge className={`ml-2 ${filterStatus === 'delivered' ? 'bg-primary' : 'bg-muted text-muted-foreground'} border-0`}>
              {deliveredOrdersList.length}
            </Badge>
            {filterStatus === 'delivered' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Liste des commandes (si plusieurs) */}
        {displayedOrders.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayedOrders.map((order: any) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`
                            relative px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-3
                            ${selectedOrderId === order.id
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                  }
                        `}
              >
                <div className={`w-2 h-2 rounded-full ${selectedOrderId === order.id ? 'bg-white' : 'bg-accent-main'}`} />
                <div className="flex flex-col items-start">
                  <span className="leading-none">{order.reference}</span>
                  <span className={`text-[10px] mt-1 opacity-80 ${selectedOrderId === order.id ? 'text-white' : 'text-muted-foreground'}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">
              Aucune commande {filterStatus === 'active' ? 'en cours' : 'livrée récemment'}.
            </p>
          </div>
        )}
      </div>

      {trackingLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Chargement du suivi...</p>
        </div>
      ) : tracking ? (
        <>
          {/* ... (Cancelled/Delivered/Map cards remain similar but wrapped if needed) ... */}

          {/* Contenu principal */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Colonne Gauche : Carte & Infos (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte GPS (si applicable) */}
              {canShowMap && hasDriverLocation && tracking.driver ? (
                <Card className="p-0 shadow-soft border-0 overflow-hidden h-[400px] relative">
                  <LiveMap
                    driverLocation={{
                      lat: tracking.driver.location!.lat,
                      lng: tracking.driver.location!.lng,
                    }}
                    deliveryLocation={{
                      lat: tracking.delivery.lat,
                      lng: tracking.delivery.lng,
                      address: tracking.delivery.address,
                    }}
                    driverName={tracking.driver.name}
                  />
                </Card>
              ) : !isDelivered && !isCancelled && (
                <Card className="p-8 shadow-soft border-0 bg-muted/30 flex flex-col items-center justify-center text-center h-[300px]">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="font-semibold text-primary">Carte en attente</h3>
                  <p className="text-muted-foreground max-w-md">
                    La localisation en temps réel sera disponible dès que le chauffeur aura commencé sa course.
                  </p>
                </Card>
              )}

              {/* Détails Livraison */}
              <Card className="p-6 shadow-soft border-0">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Détails de la course
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Départ</p>
                    <p className="font-medium text-primary">{tracking.pickup.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Arrivée</p>
                    <p className="font-medium text-primary">{tracking.delivery.address}</p>
                  </div>
                </div>

                {tracking.driver && (
                  <div className="mt-6 pt-6 border-t flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {tracking.driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{tracking.driver.name}</p>
                        <p className="text-sm text-muted-foreground">Votre chauffeur</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      {tracking.driver.phone}
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Colonne Droite : Timeline (1/3) */}
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-soft border-0 h-full">
                <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Historique
                </h3>

                <div className="relative pl-2">
                  {/* Ligne verticale de fond */}
                  <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-border"></div>

                  <div className="space-y-8">
                    {getTimeline(tracking).map((step, index) => (
                      <div key={index} className="relative flex gap-4 group">
                        {/* Point/Icône */}
                        <div className={`
                          relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                          ${step.status === 'completed'
                            ? 'bg-success border-white text-white shadow-sm'
                            : step.status === 'active'
                              ? 'bg-white border-accent-main text-accent-main shadow-md'
                              : 'bg-muted border-white text-muted-foreground'
                          }
                        `}>
                          <step.icon className="h-4 w-4" />
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className={`font-semibold text-sm ${step.status === 'pending' ? 'text-muted-foreground' : 'text-primary'}`}>
                              {step.label}
                            </p>
                            {step.time && (
                              <span className="text-xs font-mono font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                                {step.time}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>

                          {/* Durée (si disponible) */}
                          {step.duration && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/30 w-fit px-2 py-0.5 rounded-full">
                              <Clock className="h-3 w-3" />
                              <span>{step.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
};

export default Tracking;

