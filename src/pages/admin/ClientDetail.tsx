import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    ArrowLeft,
    Building,
    Mail,
    Phone,
    MapPin,
    Loader2,
    CheckCircle,
    XCircle,
    Calendar,
    CreditCard,
    Clock,
    AlertTriangle,
    Shield,
    Search,
    Truck,
    Plus
} from "lucide-react";
import { toast } from "sonner";

// Services
import {
    getClientDetails,
    updateClientStatus,
    getAllOrders,
    getAllInvoices,
    suspendClient,
    unsuspendClient,
    assignDriverToOrder,
    getAllDrivers,
    OrderWithDetails,
    Driver
} from "@/services/adminSupabaseQueries";
import { Client, Invoice } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import EditClientModal from "@/components/admin/clients/EditClientModal";

const ClientDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [orders, setOrders] = useState<OrderWithDetails[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtres
    const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, year

    // Modals
    const [showSuspendDialog, setShowSuspendDialog] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState("");
    const [showDispatchDialog, setShowDispatchDialog] = useState(false);
    const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>("");
    const [showEditModal, setShowEditModal] = useState(false);

    // Filtered orders
    const getFilteredOrders = () => {
        let filtered = orders.filter(order =>
            order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
            case "today":
                filtered = filtered.filter(o => new Date(o.created_at) >= today);
                break;
            case "week":
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                filtered = filtered.filter(o => new Date(o.created_at) >= weekAgo);
                break;
            case "month":
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filtered = filtered.filter(o => new Date(o.created_at) >= monthAgo);
                break;
            case "year":
                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                filtered = filtered.filter(o => new Date(o.created_at) >= yearAgo);
                break;
        }

        return filtered;
    };

    const filteredOrders = getFilteredOrders();

    // Fetch client data
    const fetchClientData = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            const [clientData, allOrders, allInvoices, allDrivers] = await Promise.all([
                getClientDetails(id),
                getAllOrders(),
                getAllInvoices(),
                getAllDrivers()
            ]);

            setClient(clientData);
            // Filter orders for this client
            setOrders(allOrders.filter(o => o.client_id === id));
            // Filter invoices for this client
            setInvoices(allInvoices.filter((i: any) => i.client_id === id));
            // Filter available drivers (only by status)
            setDrivers(allDrivers.filter(d => d.status === 'available'));
        } catch (error: any) {
            console.error("Error fetching client:", error);
            toast.error("Erreur lors du chargement du client");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientData();
    }, [id]);

    // Change client status
    const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'pending') => {
        if (!id) return;

        if (newStatus === 'suspended') {
            setShowSuspendDialog(true);
            return;
        }

        try {
            setIsUpdatingStatus(true);
            if (newStatus === 'active' && client?.status === 'suspended') {
                await unsuspendClient(id);
            } else {
                await updateClientStatus(id, newStatus);
            }
            toast.success(`Statut mis à jour : ${newStatus === 'active' ? 'Actif' : 'En attente'}`);
            await fetchClientData();
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSuspendClient = async () => {
        if (!id) return;
        try {
            setIsUpdatingStatus(true);
            await suspendClient(id, suspensionReason);
            toast.success("Client suspendu avec succès");
            setShowSuspendDialog(false);
            await fetchClientData();
        } catch (error) {
            console.error("Error suspending client:", error);
            toast.error("Erreur lors de la suspension");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDispatchOrder = async () => {
        if (!selectedOrderForDispatch || !selectedDriver) return;
        try {
            await assignDriverToOrder(selectedOrderForDispatch, selectedDriver);
            toast.success("Commande dispatchée avec succès");
            setShowDispatchDialog(false);
            await fetchClientData();
        } catch (error) {
            console.error("Error dispatching order:", error);
            toast.error("Erreur lors du dispatch");
        }
    };

    const openDispatchDialog = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedOrderForDispatch(orderId);
        setShowDispatchDialog(true);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500 text-white border-0 px-3 py-1">Actif</Badge>;
            case 'suspended':
            case 'inactive':
                return <Badge className="bg-red-500 text-white border-0 px-3 py-1">Suspendu</Badge>;
            case 'pending':
                return <Badge className="bg-orange-500 text-white border-0 px-3 py-1">En attente</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Get order status badge color
    const getOrderStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_acceptance: 'bg-orange-500',
            accepted: 'bg-blue-500',
            dispatched: 'bg-purple-500',
            in_progress: 'bg-indigo-500',
            delivered: 'bg-green-500',
            cancelled: 'bg-red-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Client non trouvé</p>
                <Button variant="outline" onClick={() => navigate('/dashboard-admin/clients')} className="mt-4">
                    Retour à la liste
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard-admin/clients')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
                            {client.company_name}
                            {getStatusBadge(client.status || 'pending')}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                                {client.internal_code || 'Pas de code'}
                            </span>
                            <span>•</span>
                            <span>Client depuis le {new Date(client.created_at).toLocaleDateString('fr-FR')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Actions rapides */}
                    {client.status === 'active' ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange('suspended')}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Suspendre le compte
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                            onClick={() => handleStatusChange('active')}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Activer le compte
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Colonne Gauche : Infos & Compte */}
                <div className="space-y-6">
                    {/* Bloc 1 : Informations personnelles */}
                    <Card className="p-6 shadow-sm border-0 h-fit">
                        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-6 pb-2 border-b">
                            <Building className="h-5 w-5 text-accent-main" />
                            Coordonnées
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email professionnel</p>
                                    <p className="font-medium break-all">{client.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-medium">{client.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Adresse principale</p>
                                    <p className="font-medium">{client.address || 'Non renseignée'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Bloc 3 : Informations de compte */}
                    <Card className="p-6 shadow-sm border-0 h-fit">
                        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-6 pb-2 border-b">
                            <Shield className="h-5 w-5 text-accent-main" />
                            Informations du compte
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Création
                                </span>
                                <span className="font-medium text-sm">
                                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Factures
                                </span>
                                <span className="font-medium text-sm">
                                    {invoices.length} ({invoices.filter(i => i.status === 'paid').length} payées)
                                </span>
                            </div>

                            {client.status === 'suspended' && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Compte suspendu
                                    </p>
                                    {client.suspension_reason && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Raison : {client.suspension_reason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Bloc 4 : Actions Admin (supplémentaire) */}
                    <Card className="p-6 shadow-sm border-0 bg-muted/30">
                        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Zone administrative
                        </h2>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" onClick={() => setShowEditModal(true)}>
                                Modifier les informations
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Fonctionnalité à venir")}>
                                Réinitialiser le mot de passe
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Colonne Droite : Historique Commandes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bloc 2 : Historique commandes */}
                    <Card className="p-6 shadow-sm border-0 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-primary">
                                Historique des commandes
                            </h2>
                            <div className="flex items-center gap-2">
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Période" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les dates</SelectItem>
                                        <SelectItem value="today">Aujourd'hui</SelectItem>
                                        <SelectItem value="week">Cette semaine</SelectItem>
                                        <SelectItem value="month">Ce mois</SelectItem>
                                        <SelectItem value="year">Cette année</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Badge variant="secondary" className="text-sm h-10 px-3 flex items-center">
                                    {filteredOrders.length} commandes
                                </Badge>
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une commande (référence, adresse, statut...)"
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Trajet</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                Aucune commande trouvée.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="cursor-pointer hover:bg-muted/30 transition-colors"
                                                onClick={() => navigate(`/dashboard-admin/commandes/${order.id}`)}
                                            >
                                                <TableCell className="font-medium text-primary">
                                                    {order.reference}
                                                </TableCell>
                                                <TableCell className="max-w-[250px]">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="truncate text-muted-foreground flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-main"></div>
                                                            {order.pickup_address}
                                                        </span>
                                                        <span className="truncate flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                            {order.delivery_address}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`${getOrderStatusColor(order.status)} text-white border-0 shadow-sm`}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <ArrowLeft className="h-4 w-4 rotate-180" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Dialog Suspension */}
            <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspendre le client</DialogTitle>
                        <DialogDescription>
                            Le client ne pourra plus passer de commandes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Raison de la suspension..."
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleSuspendClient}>
                            Confirmer la suspension
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Dispatch */}
            <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dispatcher la commande</DialogTitle>
                        <DialogDescription>
                            Sélectionnez un chauffeur disponible
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un chauffeur" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.length > 0 ? (
                                    drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                            {driver.first_name} {driver.last_name} - {driver.vehicle_type}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>Aucun chauffeur disponible</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDispatchDialog(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleDispatchOrder} disabled={!selectedDriver}>
                            Dispatcher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Client Modal */}
            {client && (
                <EditClientModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    client={client}
                    onSuccess={fetchClientData}
                />
            )}
        </div>
    );
};

export default ClientDetail;
