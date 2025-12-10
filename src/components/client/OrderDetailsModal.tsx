import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/supabase";
import { Download, MapPin, Package, Calendar, CreditCard, User } from "lucide-react";
import { generateOrderPDF } from "@/lib/pdf-generator";
import { useProfile } from "@/hooks/useProfile";

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
    const { profile } = useProfile();

    if (!order) return null;

    const getStatusBadge = (status: Order['status']) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            pending: { label: 'En attente', className: 'bg-orange-500 hover:bg-orange-600' },
            pending_acceptance: { label: 'En attente', className: 'bg-orange-500 hover:bg-orange-600' },
            accepted: { label: 'Acceptée', className: 'bg-blue-500 hover:bg-blue-600' },
            dispatched: { label: 'En cours', className: 'bg-blue-600 hover:bg-blue-700' },
            in_progress: { label: 'En cours', className: 'bg-blue-600 hover:bg-blue-700' },
            delivered: { label: 'Livrée', className: 'bg-green-500 hover:bg-green-600' },
            cancelled: { label: 'Annulée', className: 'bg-red-500 hover:bg-red-600' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
        return (
            <Badge className={`${config.className} text-white border-0`}>
                {config.label}
            </Badge>
        );
    };

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

    const handleDownloadPDF = () => {
        // Informations client mockées (à remplacer par les vraies données)
        const clientInfo = {
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            phone: '+33 6 12 34 56 78',
            company: 'Entreprise SARL'
        };

        generateOrderPDF(order, clientInfo);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#F2F6FA]">
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-[#0B2D55]">
                                Détails de la commande
                            </DialogTitle>
                            <p className="text-sm text-gray-600 mt-1">{order.reference}</p>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-[#0B2D55]" />
                                <h3 className="font-semibold text-[#0B0B0B]">Date de commande</h3>
                            </div>
                            <p className="text-gray-700 ml-7">{formatDate(order.created_at)}</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-5 w-5 text-[#0B2D55]" />
                                <h3 className="font-semibold text-[#0B0B0B]">Type de course</h3>
                            </div>
                            <p className="text-gray-700 ml-7">{order.delivery_type}</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-[#0B2D55]" />
                                <h3 className="font-semibold text-[#0B0B0B]">Client</h3>
                            </div>
                            <p className="text-gray-700 ml-7 font-mono">
                                {profile ? `CL – ${profile.company_name}` : "Chargement..."}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-5 w-5 text-[#0B2D55]" />
                                <h3 className="font-semibold text-[#0B0B0B]">Prix</h3>
                            </div>
                            <p className="text-2xl font-bold text-[#0B2D55] ml-7">
                                {order.price.toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    {/* Adresses */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#FFCC00] rounded-full p-2 mt-1">
                                    <MapPin className="h-5 w-5 text-[#0B2D55]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#0B0B0B] mb-2">
                                        Adresse de retrait
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {order.pickup_address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#0B2D55] rounded-full p-2 mt-1">
                                    <MapPin className="h-5 w-5 text-[#FFCC00]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#0B0B0B] mb-2">
                                        Adresse de livraison
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {order.delivery_address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            onClick={handleDownloadPDF}
                            className="flex-1 bg-[#FFCC00] hover:bg-[#E6B800] text-[#0B0B0B] font-semibold"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger le bon de commande
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="border-[#0B2D55] text-[#0B2D55] hover:bg-[#0B2D55] hover:text-white"
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsModal;
