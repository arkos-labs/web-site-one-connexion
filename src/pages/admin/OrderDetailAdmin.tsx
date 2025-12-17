import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    MapPin,
    User,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    Copy,
    AlertCircle,
    Calendar,
    Phone,
    Mail,
    Download,
    History,
    FileText,
    Navigation,
    Loader2,
    Lock,
    Unlock
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
    getOrderById,
    OrderWithDetails,
    updateOrderStatus,
    assignDriverToOrder,
    cancelOrder,
    duplicateOrder,
    getOrderEvents,
} from "@/services/adminSupabaseQueries";
import { geocoderAdresse, calculateDrivingDistance } from "@/services/locationiq";
import { OrderEvent, ORDER_EVENT_LABELS, ORDER_EVENT_ICONS } from "@/types/order_events";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants/orderStatus";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OrderDetailAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [events, setEvents] = useState<OrderEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Distance Calculation State

    // Distance Calculation State
    const [calculatedDistance, setCalculatedDistance] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
            fetchData();
        }
    }, [id]);

    // Check for deferred departure logic whenever order changes


    // Automatic Distance Calculation
    useEffect(() => {
        const calculateOrderDistance = async () => {
            if (!order || !order.pickup_address || !order.delivery_address) return;

            // If distance is already in DB, use it (optional, but good for performance)
            // But user wants "Calculé automatiquement", so let's force calculation or check if we want to update it.
            // For now, let's calculate it to be sure it's accurate via API.

            try {
                const pickupCoords = await geocoderAdresse(order.pickup_address);
                const deliveryCoords = await geocoderAdresse(order.delivery_address);

                const distance = await calculateDrivingDistance(
                    { lat: pickupCoords.latitude, lon: pickupCoords.longitude },
                    { lat: deliveryCoords.latitude, lon: deliveryCoords.longitude }
                );

                setCalculatedDistance(distance);
            } catch (error) {
                console.error("Error calculating distance:", error);
            }
        };

        if (order) {
            calculateOrderDistance();
        }
    }, [order]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [orderData, eventsData] = await Promise.all([
                getOrderById(id!),
                getOrderEvents(id!),
            ]);

            if (orderData) {
                setOrder(orderData);
                setEvents(eventsData);
            } else {
                toast.error("Commande introuvable");
                navigate("/dashboard-admin/commandes");
            }
        } catch (error: any) {
            console.error("Error fetching order details:", error);
            toast.error("Erreur lors du chargement de la commande");
        } finally {
            setLoading(false);
        }
    };



    // Actions
    const handleAcceptOrder = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            await updateOrderStatus(order.id, "accepted");
            toast.success("Commande acceptée");
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de l'acceptation");
        } finally {
            setActionLoading(false);
        }
    };



    const handleMarkAsDelivered = async () => {
        if (!order) return;
        if (!confirm("Confirmer la livraison de cette commande ?")) return;
        setActionLoading(true);
        try {
            await updateOrderStatus(order.id, 'delivered');
            toast.success("Commande marquée comme livrée");
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        if (!cancellationReason.trim()) {
            toast.error("Veuillez indiquer une raison");
            return;
        }
        setActionLoading(true);
        try {
            await cancelOrder(order.id, cancellationReason);
            toast.success("Commande annulée");
            setShowCancelDialog(false);
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de l'annulation");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDuplicateOrder = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            const newOrderId = await duplicateOrder(order.id);
            setNewCreatedOrderId(newOrderId);
            setShowSuccessDialog(true);
        } catch (error) {
            toast.error("Erreur lors de la duplication");
        } finally {
            setActionLoading(false);
        }
    };

    // PDF Generation
    const generateOrderFormPDF = () => {
        if (!order) return;
        setIsGeneratingPDF(true);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text("BON DE COMMANDE", pageWidth / 2, 20, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Référence : ${order.reference}`, pageWidth / 2, 30, { align: "center" });

            // Company Info
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text("ONE CONNEXION", 15, 50);
            doc.text("Service Logistique", 15, 55);
            doc.text("contact@oneconnexion.fr", 15, 60);

            // Client Info
            doc.text("CLIENT :", 120, 50);
            const clientName = order.clients?.company_name || order.facturation?.societe || order.nom_client || "Client Inconnu";
            doc.setFont("helvetica", "bold");
            doc.text(clientName, 120, 55);
            doc.setFont("helvetica", "normal");
            if (order.clients?.email || order.email_client) {
                doc.text(order.clients?.email || order.email_client || "", 120, 60);
            }
            if (order.clients?.phone || order.facturation?.telephone) {
                doc.text(order.clients?.phone || order.facturation?.telephone || "", 120, 65);
            }

            // Order Details
            doc.setDrawColor(200, 200, 200);
            doc.rect(15, 80, pageWidth - 30, 35);

            doc.setFontSize(11);
            doc.text(`Date de création : ${new Date(order.created_at).toLocaleDateString('fr-FR')} à ${new Date(order.created_at).toLocaleTimeString('fr-FR')}`, 20, 90);
            doc.text(`Type de livraison : ${order.delivery_type}`, 20, 100);
            if (order.price) {
                doc.text(`Montant HT : ${order.price} €`, 120, 90);
            }
            doc.text(`Statut actuel : ${ORDER_STATUS_LABELS[order.status] || order.status}`, 120, 100);

            // Addresses
            doc.setFontSize(14);
            doc.text("Détails du trajet", 15, 130);

            doc.setFontSize(12);
            doc.setTextColor(0, 100, 0);
            doc.text("DÉPART (Enlèvement)", 15, 140);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pickupLines = doc.splitTextToSize(order.pickup_address, 80);
            doc.text(pickupLines, 15, 148);

            doc.setFontSize(12);
            doc.setTextColor(200, 0, 0);
            doc.text("ARRIVÉE (Livraison)", 110, 140);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const deliveryLines = doc.splitTextToSize(order.delivery_address, 80);
            doc.text(deliveryLines, 110, 148);

            // Driver
            if (order.drivers) {
                doc.setFontSize(14);
                doc.text("Chauffeur assigné", 15, 180);
                doc.setFontSize(10);
                doc.text(`Nom : ${order.drivers.first_name} ${order.drivers.last_name}`, 15, 190);
                doc.text(`Téléphone : ${order.drivers.phone}`, 15, 195);
                if (order.drivers.vehicle_type) {
                    doc.text(`Véhicule : ${order.drivers.vehicle_type}`, 15, 200);
                }
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Ce document est un bon de commande et ne fait pas office de facture.", pageWidth / 2, 280, { align: "center" });
            doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 285, { align: "center" });

            doc.save(`Bon_de_commande_${order.reference}.pdf`);
            toast.success("Bon de commande téléchargé");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Erreur lors de la génération du PDF");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-admin/commandes")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex flex-wrap items-center gap-3">
                            {order.reference}
                            <Badge className={`${ORDER_STATUS_COLORS[order.status] || 'bg-gray-500'} text-white border-0`}>
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                            </Badge>

                            {/* TYPE DE COMMANDE - Indicateur Principal */}
                            {order.scheduled_pickup_time ? (
                                <Badge className="bg-blue-600 text-white border-0 text-sm py-1.5 px-4 shadow-md font-semibold">
                                    📅 COMMANDE DIFFÉRÉE
                                </Badge>
                            ) : (
                                <Badge className="bg-orange-600 text-white border-0 text-sm py-1.5 px-4 shadow-md font-semibold">
                                    ⚡ COMMANDE IMMÉDIATE
                                </Badge>
                            )}

                            {/* Détail de l'horaire */}
                            {order.scheduled_pickup_time ? (
                                <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 text-sm py-1 px-3 shadow-sm">
                                    <Clock className="h-4 w-4 mr-2" />
                                    POUR LE : {new Date(order.scheduled_pickup_time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50 text-sm py-1 px-3 shadow-sm">
                                    <Clock className="h-4 w-4 mr-2" />
                                    DÉPART IMMÉDIAT
                                </Badge>
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Créée le {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={generateOrderFormPDF}
                        disabled={isGeneratingPDF}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {isGeneratingPDF ? "Génération..." : "Bon de commande (PDF)"}
                    </Button>
                </div>
            </div>

            {/* DEFERRED DEPARTURE ALERT */}


            {/* ACTIONS BAR */}
            <Card className="p-4 border-l-4 border-l-primary shadow-sm">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium mr-2">Actions disponibles :</span>

                    {order.status === "pending_acceptance" && (
                        <Button onClick={handleAcceptOrder} disabled={actionLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" /> Accepter
                        </Button>
                    )}



                    {(order.status === "dispatched" || order.status === "in_progress") && (
                        <Button
                            onClick={handleMarkAsDelivered}
                            disabled={actionLoading}
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="h-4 w-4" /> Marquer livré
                        </Button>
                    )}

                    {order.status !== "delivered" && order.status !== "cancelled" && (
                        <Button
                            onClick={() => setShowCancelDialog(true)}
                            disabled={actionLoading}
                            variant="destructive"
                            className="gap-2"
                        >
                            <XCircle className="h-4 w-4" /> Annuler
                        </Button>
                    )}

                    <Button onClick={handleDuplicateOrder} disabled={actionLoading} variant="ghost" className="gap-2 ml-auto">
                        <Copy className="h-4 w-4" /> Dupliquer
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COL 1: INFO GÉNÉRALES & CLIENT */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3 bg-gray-50/50">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Client
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <p className="font-semibold text-lg">
                                    {order.clients?.company_name || order.facturation?.societe || order.nom_client || "Client Inconnu"}
                                </p>
                                {order.clients?.internal_code && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                        {order.clients.internal_code}
                                    </Badge>
                                )}
                                {!order.user_id && (
                                    <Badge variant="secondary" className="mt-1 ml-2 text-xs">Invité</Badge>
                                )}
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                                {(order.clients?.email || order.email_client) && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{order.clients?.email || order.email_client}</span>
                                    </div>
                                )}
                                {(order.clients?.phone || order.facturation?.telephone) && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span>{order.clients?.phone || order.facturation?.telephone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3 bg-gray-50/50">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Détails & Formule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Formule</span>
                                <Badge variant="outline" className="font-bold border-primary text-primary">
                                    {order.delivery_type}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Prix</span>
                                <span className="font-bold text-lg">{order.price} €</span>
                            </div>
                            {order.scheduled_pickup_time && (
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Prise en charge prévue : {formatDate(order.scheduled_pickup_time)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* COL 2: TRAJET */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-gray-200 h-full">
                        <CardHeader className="pb-3 bg-gray-50/50">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                <Navigation className="h-4 w-4" /> Trajet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                            {/* Pickup */}
                            <div className="relative pl-6 border-l-2 border-green-200 pb-6">
                                <div className="absolute -left-[9px] top-0 bg-white p-1">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                </div>
                                <p className="text-xs font-bold text-green-600 mb-1 uppercase">Départ</p>
                                <p className="text-sm font-medium leading-snug">{order.pickup_address}</p>
                                {order.scheduled_pickup_time ? (
                                    <p className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(order.scheduled_pickup_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-xs font-normal text-gray-500 ml-1">
                                            ({new Date(order.scheduled_pickup_time).toLocaleDateString('fr-FR')})
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Immédiat
                                    </p>
                                )}
                            </div>

                            {/* Delivery */}
                            <div className="relative pl-6 border-l-2 border-transparent">
                                <div className="absolute -left-[9px] top-0 bg-white p-1">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                </div>
                                <p className="text-xs font-bold text-red-600 mb-1 uppercase">Arrivée</p>
                                <p className="text-sm font-medium leading-snug">{order.delivery_address}</p>
                                {(order as any).delivery_time && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {(order as any).delivery_time}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-4 pt-2">
                                <div className="text-center p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">Distance</p>
                                    <p className="font-semibold">
                                        {calculatedDistance ? `${calculatedDistance} km` : (
                                            (order as any).distance_km ? `${(order as any).distance_km} km` : 'Calcul en cours...'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COL 3: CHAUFFEUR & TIMELINE */}
                <div className="space-y-6">
                    {/* Driver */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-3 bg-gray-50/50">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Chauffeur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {order.drivers ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {order.drivers.first_name[0]}{order.drivers.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">{order.drivers.first_name} {order.drivers.last_name}</p>
                                            <p className="text-xs text-gray-500">{order.drivers.phone}</p>
                                        </div>
                                    </div>
                                    {order.drivers.vehicle_type && (
                                        <Badge variant="secondary" className="w-full justify-center">
                                            {order.drivers.vehicle_type}
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border border-dashed">
                                    <p className="text-sm">Aucun chauffeur assigné</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="shadow-sm border-gray-200 flex-1">
                        <CardHeader className="pb-3 bg-gray-50/50">
                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                <History className="h-4 w-4" /> Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {events.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic text-center">Aucun historique disponible</p>
                                ) : (
                                    events.map((event) => (
                                        <div key={event.id} className="flex gap-3 relative">
                                            <div className="mt-0.5 text-lg">
                                                {ORDER_EVENT_ICONS[event.event_type] || '•'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{ORDER_EVENT_LABELS[event.event_type] || event.event_type}</p>
                                                <p className="text-xs text-gray-500">{formatDate(event.created_at)}</p>
                                                {event.description && (
                                                    <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* DIALOGS */}


            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Annuler la commande</DialogTitle>
                        <DialogDescription>
                            Veuillez indiquer la raison de l'annulation
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Raison de l'annulation..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Fermer
                        </Button>
                        <Button variant="destructive" onClick={handleCancelOrder} disabled={!cancellationReason.trim() || actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Annuler la commande"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">Commande dupliquée !</DialogTitle>
                            <DialogDescription className="text-center">
                                La commande a été dupliquée avec succès.
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
        </div>
    );
}
