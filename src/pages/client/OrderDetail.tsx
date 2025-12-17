import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Package,
    Calendar,
    CreditCard,
    User,
    Download,
    ArrowLeft,
    Truck,
    Clock,
    XCircle,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { OrderWithDriver, getOrderById } from "@/services/supabaseQueries";
import { generateOrderPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LiveMap from "@/components/tracking/LiveMap";

const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { profile } = useProfile();
    const [order, setOrder] = useState<OrderWithDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            const orderData = await getOrderById(orderId);
            setOrder(orderData);
        } catch (error) {
            console.error("Erreur lors du chargement de la commande:", error);
            toast.error("Impossible de charger la commande");
            navigate("/client/orders");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        setCancelling(true);
        try {
            // Vérifier si la commande est dispatchée
            const isDispatched = ["dispatched", "in_progress"].includes(order.status);
            const cancellationFee = isDispatched ? 8 : 0;

            // Calculer le montant à rembourser
            const refundAmount = order.price - cancellationFee;

            const { error } = await supabase
                .from("orders")
                .update({
                    status: "cancelled",
                    cancellation_reason: isDispatched
                        ? `Annulation après dispatch - Frais de 8€ appliqués. Montant remboursé: ${refundAmount.toFixed(2)}€`
                        : "Annulation avant dispatch - Remboursement intégral"
                })
                .eq("id", order.id);

            if (error) throw error;

            if (isDispatched) {
                toast.success("Commande annulée", {
                    description: `Des frais d'annulation de 8€ s'appliquent. Vous serez remboursé de ${refundAmount.toFixed(2)}€.`
                });
            } else {
                toast.success("Commande annulée avec succès", {
                    description: "Vous serez remboursé intégralement."
                });
            }

            setShowCancelDialog(false);
            loadOrder(); // Recharger pour mettre à jour le statut
        } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
            toast.error("Impossible d'annuler la commande");
        } finally {
            setCancelling(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!order || !profile) return;

        const clientInfo = {
            name: profile.first_name && profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : 'Client',
            email: profile.email || "",
            phone: profile.phone || "",
            company: profile.company_name || "",
        };

        try {
            generateOrderPDF(order, clientInfo);
            toast.success("Bon de commande téléchargé");
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error("Erreur lors du téléchargement");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: OrderWithDriver["status"]) => {
        const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
            pending: { label: "En attente", className: "bg-warning hover:bg-warning/90", icon: Clock },
            pending_acceptance: { label: "En attente", className: "bg-warning hover:bg-warning/90", icon: Clock },
            accepted: { label: "Acceptée", className: "bg-info hover:bg-info/90", icon: CheckCircle },
            dispatched: { label: "En cours", className: "bg-info hover:bg-info/90", icon: Truck },
            in_progress: { label: "En cours", className: "bg-info hover:bg-info/90", icon: Truck },
            delivered: { label: "Livrée", className: "bg-success hover:bg-success/90", icon: CheckCircle },
            cancelled: { label: "Annulée", className: "bg-destructive hover:bg-destructive/90", icon: XCircle },
        };

        const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground", icon: AlertCircle };
        const Icon = config.icon;

        return (
            <Badge className={`${config.className} text-white border-0 flex items-center gap-2`}>
                <Icon className="h-4 w-4" />
                {config.label}
            </Badge>
        );
    };

    const getTimelineSteps = () => {
        if (!order) return [];

        const steps = [
            {
                label: "Commande créée",
                date: order.created_at,
                completed: true,
                icon: Package,
            },
            {
                label: "Commande acceptée",
                date: order.accepted_at,
                completed: ["accepted", "dispatched", "in_progress", "delivered"].includes(order.status),
                icon: CheckCircle,
            },
            {
                label: "Chauffeur en route",
                date: order.pickup_time,
                completed: ["dispatched", "in_progress", "delivered"].includes(order.status),
                icon: Truck,
            },
            {
                label: "Colis récupéré",
                date: order.pickup_time,
                completed: ["in_progress", "delivered"].includes(order.status),
                icon: MapPin,
            },
            {
                label: "Livraison effectuée",
                date: order.delivery_time,
                completed: order.status === "delivered",
                icon: CheckCircle,
            },
        ];

        return steps;
    };

    const canCancelOrder = () => {
        if (!order) return false;
        // Peut annuler si pas encore livrée ou déjà annulée
        return !["delivered", "cancelled"].includes(order.status);
    };

    const getCancellationMessage = () => {
        if (!order) return "";

        const isDispatched = ["dispatched", "in_progress"].includes(order.status);

        if (isDispatched) {
            const refundAmount = order.price - 8;
            return `Cette commande est déjà en cours de livraison. Des frais d'annulation de 8€ seront appliqués. Vous serez remboursé de ${refundAmount.toFixed(2)}€ sur ${order.price.toFixed(2)}€.`;
        }

        return `Êtes-vous sûr de vouloir annuler cette commande ? Vous serez remboursé intégralement de ${order.price.toFixed(2)}€.`;
    };

    const canShowMap = order && ["accepted", "dispatched", "in_progress", "delivered"].includes(order.status);
    const hasDriverLocation = order?.driver?.location;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    Chargement...
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground text-lg">Commande introuvable</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/client/orders")}
                    className="hover:bg-muted"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Retour
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-display font-bold text-primary mb-2">
                        Détails de la commande
                    </h1>
                    <p className="text-muted-foreground">{order.reference}</p>
                </div>
                {getStatusBadge(order.status)}
            </div>

            {/* Live Map Section */}
            {canShowMap && (
                <Card className="p-0 shadow-soft border-0 overflow-hidden h-[350px] relative mb-6">
                    {hasDriverLocation && order.driver ? (
                        <LiveMap
                            driverLocation={{
                                lat: order.driver.location.lat,
                                lng: order.driver.location.lng,
                            }}
                            deliveryLocation={{
                                lat: 48.8566, // Fallback or need to geocode delivery address
                                lng: 2.3522,
                                address: order.delivery_address,
                            }}
                            driverName={order.driver.name}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-muted/30 text-center p-6">
                            <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="font-semibold text-primary">Carte indisponible</h3>
                            <p className="text-muted-foreground">
                                La localisation n'est pas encore disponible pour cette commande.
                            </p>
                        </div>
                    )}
                </Card>
            )}

            {/* Informations principales */}
            <Card className="p-6 shadow-soft border-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Date de commande</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{formatDate(order.created_at)}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Type de course</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{order.delivery_type}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Client</h3>
                        </div>
                        <p className="text-muted-foreground text-sm font-mono">
                            {profile ? `CL – ${profile.company_name}` : "Chargement..."}
                        </p>
                    </div>

                    <div className="bg-cta/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-5 w-5 text-cta-foreground" />
                            <h3 className="font-semibold text-cta-foreground">Prix</h3>
                        </div>
                        <p className="text-2xl font-bold text-cta-foreground">{order.price.toFixed(2)} €</p>
                    </div>
                </div>
            </Card>

            {/* Adresses avec informations complètes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations d'enlèvement */}
                <Card className="p-6 shadow-soft border-0">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-cta rounded-full p-3">
                            <MapPin className="h-6 w-6 text-cta-foreground" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2 text-lg">Informations d'enlèvement</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">ADRESSE D'ENLÈVEMENT</p>
                            <p className="text-foreground leading-relaxed font-medium">{order.pickup_address}</p>
                        </div>

                        {order.pickup_contact_name && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">CONTACT</p>
                                <p className="text-foreground">{order.pickup_contact_name}</p>
                            </div>
                        )}

                        {order.pickup_contact_phone && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">TÉLÉPHONE</p>
                                <p className="text-foreground">{order.pickup_contact_phone}</p>
                            </div>
                        )}

                        {order.pickup_instructions && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">INSTRUCTIONS</p>
                                <p className="text-muted-foreground text-sm">{order.pickup_instructions}</p>
                            </div>
                        )}

                        {order.scheduled_pickup_time && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">HEURE D'ENLÈVEMENT</p>
                                <p className="text-foreground">{formatDate(order.scheduled_pickup_time)}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Informations de livraison */}
                <Card className="p-6 shadow-soft border-0">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-primary rounded-full p-3">
                            <MapPin className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2 text-lg">Informations de livraison</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">ADRESSE DE LIVRAISON</p>
                            <p className="text-foreground leading-relaxed font-medium">{order.delivery_address}</p>
                        </div>

                        {order.delivery_contact_name && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">CONTACT</p>
                                <p className="text-foreground">{order.delivery_contact_name}</p>
                            </div>
                        )}

                        {order.delivery_contact_phone && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">TÉLÉPHONE</p>
                                <p className="text-foreground">{order.delivery_contact_phone}</p>
                            </div>
                        )}

                        {order.delivery_instructions && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">INSTRUCTIONS</p>
                                <p className="text-muted-foreground text-sm">{order.delivery_instructions}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Détails de la commande */}
            <Card className="p-6 shadow-soft border-0">
                <h3 className="font-semibold text-foreground mb-4 text-xl flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    Détails de la commande
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.package_type && (
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">TYPE DE COLIS</p>
                            <p className="text-foreground font-medium">{order.package_type}</p>
                        </div>
                    )}

                    {order.formula && (
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">FORMULE DE LIVRAISON</p>
                            <p className="text-foreground font-medium capitalize">{order.formula}</p>
                        </div>
                    )}

                    {order.schedule_type && (
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">TYPE DE PLANIFICATION</p>
                            <p className="text-foreground font-medium">
                                {order.schedule_type === 'asap' ? 'Dès que possible' : 'Créneau planifié'}
                            </p>
                        </div>
                    )}
                </div>

                {order.notes && (
                    <div className="mt-4 bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">NOTES COMPLÉMENTAIRES</p>
                        <p className="text-foreground">{order.notes}</p>
                    </div>
                )}
            </Card>

            {/* Informations de facturation (si commande sans compte) */}
            {(order.billing_company || order.billing_name) && (
                <Card className="p-6 shadow-soft border-0">
                    <h3 className="font-semibold text-foreground mb-4 text-xl flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Informations de facturation
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.billing_company && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">SOCIÉTÉ</p>
                                <p className="text-foreground font-medium">{order.billing_company}</p>
                            </div>
                        )}

                        {order.billing_siret && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">SIRET</p>
                                <p className="text-foreground font-medium">{order.billing_siret}</p>
                            </div>
                        )}

                        {order.billing_name && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">NOM À FACTURER</p>
                                <p className="text-foreground font-medium">{order.billing_name}</p>
                            </div>
                        )}

                        {order.sender_email && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">EMAIL</p>
                                <p className="text-foreground font-medium">{order.sender_email}</p>
                            </div>
                        )}

                        {(order.billing_address || order.billing_zip || order.billing_city) && (
                            <div className="bg-muted/50 rounded-lg p-4 md:col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">ADRESSE DE FACTURATION</p>
                                <p className="text-foreground">
                                    {order.billing_address}
                                    {order.billing_zip && order.billing_city && `, ${order.billing_zip} ${order.billing_city}`}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}


            {/* Timeline */}
            <Card className="p-6 shadow-soft border-0">
                <h3 className="font-semibold text-foreground mb-6 text-xl flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Suivi de la commande
                </h3>
                <div className="space-y-4">
                    {getTimelineSteps().map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? "bg-success text-white" : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                                        {step.label}
                                    </p>
                                    {step.date && step.completed && (
                                        <p className="text-sm text-muted-foreground">{formatDate(step.date)}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Actions */}
            <Card className="p-6 shadow-soft border-0">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleDownloadPDF}
                        variant="cta"
                        className="flex-1 font-semibold"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le bon de commande
                    </Button>
                    {canCancelOrder() && (
                        <Button
                            onClick={() => setShowCancelDialog(true)}
                            variant="destructive"
                            className="flex-1"
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler ma commande
                        </Button>
                    )}
                </div>
            </Card>

            {/* Dialog de confirmation d'annulation */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la commande ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getCancellationMessage()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelling}>Retour</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {cancelling ? "Annulation..." : "Confirmer l'annulation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrderDetail;
