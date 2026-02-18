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
} from "@/services/adminSupabaseQueries";
import { supabase } from "@/lib/supabase";
import { geocoderAdresse, calculateDrivingDistance } from "@/services/locationiq";
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
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Dialog states
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [newCreatedOrderId, setNewCreatedOrderId] = useState<string | null>(null);

    // Distance Calculation State
    const [calculatedDistance, setCalculatedDistance] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    // Realtime subscription for order updates
    useEffect(() => {
        if (!id) return;

        const channel = supabase
            .channel(`order-${id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    console.log('📡 [OrderDetail] Mise à jour en temps réel:', payload);
                    // Refresh data when order changes
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
            const orderData = await getOrderById(id!);

            if (orderData) {
                setOrder(orderData);
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
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let y = 20; // Position verticale courante

            // --- FONTS & COLORS CONSTANTS ---
            const colorDark = "#333333";
            const colorGray = "#555555";
            const colorLightGray = "#aaaaaa";
            const colorBorder = "#dddddd";
            const colorBackgroundSection = "#f0f0f0";
            const colorGreen = "#2ecc71";
            const colorRed = "#e74c3c";
            const colorBlueBox = "#fcffff";
            const colorBlueBorder = "#b3e5fc";
            const colorBlueText = "#0277bd";

            // --- 1. HEADER ---
            // Logo (Texte pour l'instant)
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor("#000000");
            doc.text("ONE CONNEXION", margin, y + 8);

            // Titre Document (à droite)
            doc.setFontSize(20);
            doc.setTextColor(colorDark);
            doc.text("BON DE COMMANDE", pageWidth - margin, y + 6, { align: "right" });

            y += 20;

            // Info Entreprise (sous le logo)
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorGray);
            doc.text([
                "123 Avenue de la Logistique",
                "75000 Paris, France",
                "SIRET: 123 456 789 00012",
                "contact@oneconnexion.com | 01 23 45 67 89"
            ], margin, y);

            // Info Commande (sous le titre, à droite)
            doc.setFontSize(10);
            doc.setTextColor(colorDark);
            doc.text(`N° ${order.reference}`, pageWidth - margin, y, { align: "right" });
            doc.setFontSize(9);
            doc.setTextColor("#777777");
            doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, y + 5, { align: "right" });

            y += 25;

            // Ligne de séparation header
            doc.setDrawColor(colorBorder);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;

            // --- 2. BOXES INFO (Client & Chauffeur) ---
            const colWidth = (pageWidth - (margin * 2) - 10) / 2;
            const boxHeight = 35;

            // Box Client
            // Titre section (Fond gris)
            doc.setFillColor(colorBackgroundSection);
            doc.rect(margin, y, colWidth, 8, 'F');
            doc.setFillColor("#000000"); // Bordure noire gauche
            doc.rect(margin, y, 1, 8, 'F');

            doc.setFontSize(10);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("CLIENT / DONNEUR D'ORDRE", margin + 5, y + 5.5);

            // Contenu Client Box (Simulation de bordure grise)
            doc.setDrawColor(colorBorder);
            doc.setLineWidth(0.1);
            doc.rect(margin, y + 8, colWidth, boxHeight - 8);

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorDark);
            const clientName = order.clients?.company_name || order.facturation?.societe || order.nom_client || "Client Inconnu (Invité)";
            doc.text(clientName, margin + 5, y + 18);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor("#777777");
            doc.text("Référence client : #INV-992", margin + 5, y + 24); // Placeholder ref client
            if (order.clients?.phone || order.facturation?.telephone) {
                doc.text(`Tél : ${order.clients?.phone || order.facturation?.telephone}`, margin + 5, y + 29);
            }


            // Box Chauffeur (Droite)
            const xRight = margin + colWidth + 10;

            // Fond bleuté
            doc.setFillColor(colorBlueBox);
            doc.setDrawColor(colorBlueBorder);
            doc.rect(xRight, y, colWidth, boxHeight, 'FD'); // Fill and Draw

            // Titre Chauffeur
            doc.setFontSize(10);
            doc.setTextColor(colorBlueText);
            doc.setFont("helvetica", "bold");
            doc.text("CHAUFFEUR ASSIGNÉ", xRight + 5, y + 6);

            // Nom Chauffeur
            doc.setFontSize(14);
            doc.setTextColor(colorDark);
            const driverName = order.drivers ? `${order.drivers.first_name || ''} ${order.drivers.last_name || ''}` : "Non assigné";
            doc.text(driverName, xRight + 5, y + 18);

            // Info Véhicule
            doc.setFontSize(9);
            doc.setTextColor("#777777");
            doc.setFont("helvetica", "normal");
            const vehicle = order.drivers?.vehicle_type || "Type non spécifié";
            doc.text(`Véhicule : ${vehicle}`, xRight + 5, y + 24);

            y += boxHeight + 15;


            // --- 3. ITINÉRAIRE ---
            // Titre Section
            doc.setFillColor(colorBackgroundSection);
            doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
            doc.setFillColor("#000000");
            doc.rect(margin, y, 1, 8, 'F'); // Barre noire

            doc.setFontSize(10);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("ITINÉRAIRE & INSTRUCTIONS", margin + 5, y + 5.5);

            y += 15;

            // Départ (Gauche)
            doc.setDrawColor(colorGreen);
            doc.setLineWidth(1.5); // Bordure plus épaisse
            doc.line(margin, y, margin, y + 40); // Ligne verticale verte

            doc.setFontSize(9);
            doc.setTextColor("#777777");
            doc.setFont("helvetica", "normal");
            doc.text("DÉPART (Enlèvement)", margin + 5, y);

            doc.setFontSize(11);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            const timePickup = order.pickup_time ? new Date(order.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Immédiat";
            doc.text(`${timePickup} - ${order.delivery_type === 'immediate' ? 'Immédiat' : 'Programmé'}`, margin + 5, y + 6);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const pickupAddrLines = doc.splitTextToSize(order.pickup_address, colWidth - 10);
            doc.text(pickupAddrLines, margin + 5, y + 13);

            let currentYLeft = y + 13 + (pickupAddrLines.length * 5);
            if (order.pickup_contact_name || order.pickup_contact_phone) {
                doc.setFont("helvetica", "bold");
                doc.text("Contact :", margin + 5, currentYLeft);
                doc.setFont("helvetica", "normal");
                const contactInfo = [order.pickup_contact_name, order.pickup_contact_phone].filter(Boolean).join(" - ");
                doc.text(contactInfo, margin + 25, currentYLeft);
                currentYLeft += 5;
            }
            // Note
            doc.setFontSize(9);
            doc.setTextColor("#666666");
            doc.setFont("helvetica", "italic");
            doc.text("Note : Voir instructions chauffeur", margin + 5, currentYLeft + 3);


            // Arrivée (Droite)
            doc.setDrawColor(colorRed);
            doc.setLineWidth(1.5);
            doc.line(xRight, y, xRight, y + 40); // Ligne verticale rouge

            doc.setFontSize(9);
            doc.setTextColor("#777777");
            doc.setFont("helvetica", "normal");
            doc.text("ARRIVÉE (Livraison)", xRight + 5, y);

            doc.setFontSize(11);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("Prévision : --:--", xRight + 5, y + 6);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const deliveryAddrLines = doc.splitTextToSize(order.delivery_address, colWidth - 10);
            doc.text(deliveryAddrLines, xRight + 5, y + 13);

            let currentYRight = y + 13 + (deliveryAddrLines.length * 5);
            if (order.delivery_contact_name || order.delivery_contact_phone) {
                doc.setFont("helvetica", "bold");
                doc.text("Contact :", xRight + 5, currentYRight);
                doc.setFont("helvetica", "normal");
                const contactInfo = [order.delivery_contact_name, order.delivery_contact_phone].filter(Boolean).join(" - ");
                doc.text(contactInfo, xRight + 25, currentYRight);
                currentYRight += 5;
            }

            y += 55;


            // --- 4. TABLEAU FACTURATION ---
            // Titre Section
            doc.setFillColor(colorBackgroundSection);
            doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
            doc.setFillColor("#000000");
            doc.rect(margin, y, 1, 8, 'F');

            doc.setFontSize(10);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("DÉTAILS DE LA FACTURATION", margin + 5, y + 5.5);
            y += 15;

            // En-têtes Tableau
            doc.setFillColor("#fafafa");
            doc.setDrawColor(colorBorder);
            doc.setLineWidth(0.1);
            doc.rect(margin, y, pageWidth - (margin * 2), 8, 'FD');

            doc.setFontSize(9);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("DESCRIPTION", margin + 5, y + 5.5);
            doc.text("TYPE", margin + 100, y + 5.5);
            doc.text("DISTANCE", margin + 130, y + 5.5);
            doc.text("TOTAL HT", pageWidth - margin - 5, y + 5.5, { align: "right" });
            y += 8;

            // Ligne Tableau
            doc.rect(margin, y, pageWidth - (margin * 2), 15); // Hauteur ligne

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`Transport ${order.delivery_type || 'Standard'}`, margin + 5, y + 6);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor("#666666");

            doc.text("Trajet course simple", margin + 5, y + 11);

            doc.setTextColor(colorDark);
            doc.text(order.drivers?.vehicle_type || "Standard", margin + 100, y + 9);
            doc.text(`${order.distance_km || 0} km`, margin + 130, y + 9);
            doc.setFont("helvetica", "bold");
            const formattedPrice = order.price ? Number(order.price).toFixed(2) + " €" : "0.00 €";
            doc.text(formattedPrice, pageWidth - margin - 5, y + 9, { align: "right" });

            y += 20;

            // Totaux (à droite)
            const totalX = pageWidth - margin - 60;
            const amountX = pageWidth - margin - 5;

            // Total HT
            doc.setFont("helvetica", "bold");
            doc.text("Total HT :", totalX, y);
            doc.text(formattedPrice, amountX, y, { align: "right" });
            y += 6;

            // TVA
            doc.setFont("helvetica", "bold");
            doc.text("TVA (20%) :", totalX, y);
            const tva = order.price ? (order.price * 0.20).toFixed(2) : "0.00";
            doc.text(`${tva} €`, amountX, y, { align: "right" });
            y += 8; // Espace avant total net

            // Net à payer
            doc.setFillColor(colorBackgroundSection); // Gris
            doc.rect(totalX - 5, y - 5, 65, 10, 'F');
            doc.setFontSize(11);
            doc.setTextColor(colorDark);
            doc.text("Net à payer :", totalX, y + 1.5);
            const totalTTC = order.price ? (order.price * 1.20).toFixed(2) : "0.00";
            doc.text(`${totalTTC} €`, amountX, y + 1.5, { align: "right" });

            y += 25;


            // --- 5. SIGNATURES ---
            // Ligne séparation
            doc.setDrawColor(colorBorder);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;

            const signBoxHeight = 40;

            // Signature Enlèvement
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Signature Enlèvement", margin, y);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorGray);
            doc.text("Heure réelle : _________", margin + 50, y);

            // Box
            doc.setDrawColor(colorLightGray);
            doc.setLineDash([2, 2], 0); // Pointillé
            doc.setFillColor("#fafafa");
            doc.roundedRect(margin, y + 5, colWidth, signBoxHeight, 2, 2, 'FD');
            doc.setLineDash([], 0); // Reset

            doc.setFontSize(9);
            doc.setTextColor(colorLightGray);
            doc.text("(Signature Chauffeur / Expéditeur)", margin + (colWidth / 2), y + (signBoxHeight / 2) + 5, { align: "center" });


            // Signature Livraison
            doc.setFontSize(10);
            doc.setTextColor(colorDark);
            doc.setFont("helvetica", "bold");
            doc.text("Signature Livraison", xRight, y);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorGray);
            doc.text("Heure réelle : _________", xRight + 50, y);

            // Box
            doc.setDrawColor(colorLightGray);
            doc.setLineDash([2, 2], 0);
            doc.setFillColor("#fafafa");
            doc.roundedRect(xRight, y + 5, colWidth, signBoxHeight, 2, 2, 'FD');
            doc.setLineDash([], 0);

            doc.setFontSize(9);
            doc.setTextColor(colorLightGray);
            doc.text("(Signature Destinataire)", xRight + (colWidth / 2), y + (signBoxHeight / 2) + 5, { align: "center" });


            // --- FOOTER page ---
            doc.setFontSize(8);
            doc.setTextColor("#999999");
            doc.text(`Document généré automatiquement par One Connexion le ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, pageHeight - 15, { align: "center" });
            doc.text("Merci de conserver ce document pour toute réclamation.", pageWidth / 2, pageHeight - 10, { align: "center" });

            doc.save(`Bon_Commande_${order.reference}.pdf`);
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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending_acceptance: 'En attente',
            accepted: 'Acceptée',
            dispatched: 'Dispatchée',
            driver_accepted: 'Chauffeur a accepté',
            arrived_pickup: 'Arrivé sur place',
            in_progress: 'En route vers livraison',
            delivered: 'Livrée',
            cancelled: 'Annulée',
        };
        return labels[status] || status;
    };

    // Generate timeline from order timestamps
    const getOrderTimeline = () => {
        if (!order) return [];

        const timeline: Array<{ label: string; timestamp: string; icon: string }> = [];

        // Commande créée
        if (order.created_at) {
            timeline.push({
                label: 'Commande créée',
                timestamp: order.created_at,
                icon: '📝'
            });
        }

        // Commande acceptée par l'admin
        if ((order as any).accepted_at) {
            timeline.push({
                label: 'Acceptée par l\'admin',
                timestamp: (order as any).accepted_at,
                icon: '✅'
            });
        }

        // Dispatchée au chauffeur
        if ((order as any).dispatched_at) {
            timeline.push({
                label: 'Dispatchée au chauffeur',
                timestamp: (order as any).dispatched_at,
                icon: '📤'
            });
        }

        // Chauffeur a accepté
        if ((order as any).driver_accepted_at) {
            timeline.push({
                label: 'Chauffeur a accepté',
                timestamp: (order as any).driver_accepted_at,
                icon: '✓'
            });
        }

        // Arrivé au point de retrait
        if ((order as any).arrived_pickup_at) {
            timeline.push({
                label: 'Arrivé au point de retrait',
                timestamp: (order as any).arrived_pickup_at,
                icon: '📍'
            });
        }

        // Colis récupéré
        if ((order as any).picked_up_at) {
            timeline.push({
                label: 'Colis récupéré - En route',
                timestamp: (order as any).picked_up_at,
                icon: '🚚'
            });
        }

        // Livré
        if ((order as any).delivered_at) {
            timeline.push({
                label: 'Livré',
                timestamp: (order as any).delivered_at,
                icon: '✅'
            });
        }

        // Annulée
        if (order.status === 'cancelled' && (order as any).cancelled_at) {
            timeline.push({
                label: 'Annulée',
                timestamp: (order as any).cancelled_at,
                icon: '❌'
            });
        }

        // Trier par date
        return timeline.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
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
                                {getStatusLabel(order.status)}
                            </Badge>

                            {/* TYPE DE COMMANDE - Indicateur Principal */}
                            {order.pickup_time ? (
                                <Badge className="bg-blue-600 text-white border-0 text-sm py-1.5 px-4 shadow-md font-semibold">
                                    📅 COMMANDE DIFFÉRÉE
                                </Badge>
                            ) : (
                                <Badge className="bg-orange-600 text-white border-0 text-sm py-1.5 px-4 shadow-md font-semibold">
                                    ⚡ COMMANDE IMMÉDIATE
                                </Badge>
                            )}

                            {/* Détail de l'horaire */}
                            {order.pickup_time ? (
                                <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 text-sm py-1 px-3 shadow-sm">
                                    <Clock className="h-4 w-4 mr-2" />
                                    POUR LE : {new Date(order.pickup_time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
                            {order.pickup_time && (
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Prise en charge prévue : {formatDate(order.pickup_time)}
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
                                {order.pickup_time ? (
                                    <p className="text-sm font-bold text-blue-600 mt-1 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(order.pickup_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-xs font-normal text-gray-500 ml-1">
                                            ({new Date(order.pickup_time).toLocaleDateString('fr-FR')})
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
                                            {order.drivers.first_name?.[0]}{(order.drivers.last_name && order.drivers.last_name.length > 0) ? order.drivers.last_name[0] : ''}
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
                                <History className="h-4 w-4" /> Historique des étapes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {getOrderTimeline().length === 0 ? (
                                    <p className="text-sm text-gray-400 italic text-center">Aucun historique disponible</p>
                                ) : (
                                    getOrderTimeline().map((step, index) => (
                                        <div key={index} className="flex gap-3 relative pb-4 border-l-2 border-gray-200 last:border-l-0 pl-4">
                                            <div className="absolute -left-[9px] top-0 bg-white">
                                                <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">{step.icon}</span>
                                                    <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {formatDate(step.timestamp)}
                                                </p>
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
