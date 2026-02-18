import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    AlertTriangle,
    Shield,
    Search,
    FileText,
    Receipt,
    Euro,
    Download,
    Plus,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Services
import {
    getClientDetails,
    updateClientStatus,
    getClientOrders,
    getClientInvoices,
    suspendClient,
    unsuspendClient,
    assignDriverToOrder,
    getAllDrivers,
    OrderWithDetails,
    Driver
} from "@/services/adminSupabaseQueries";
import { Client, Invoice } from "@/lib/supabase";
import {
    getClientStatusLabel,
    getClientStatusColor,
    getInvoiceStatusLabel,
    getInvoiceStatusColor as getInvoiceStatusColorHelper
} from "@/types/clients";
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

    // Stats
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        activeOrders: 0,
        totalInvoiced: 0
    });

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
    const fetchClientData = async (background = false) => {
        if (!id) return;

        try {
            if (!background) setIsLoading(true);
            const clientData = await getClientDetails(id);
            if (!clientData) {
                toast.error("Client introuvable");
                navigate('/admin/clients');
                return;
            }
            setClient(clientData);

            // Fetch related data in parallel
            // On utilise des fonctions spécifiques qui ne font pas de jointures superflues qui pourraient casser
            const [clientOrders, clientInvoicesData, allDrivers] = await Promise.all([
                getClientOrders(id).catch(e => { console.error("Err Orders", e); return []; }),
                getClientInvoices(id).catch(e => { console.error("Err Invoices", e); return []; }),
                getAllDrivers().catch(e => { console.error("Err Drivers", e); return []; })
            ]);

            setOrders(clientOrders);
            setInvoices(clientInvoicesData);
            setDrivers(allDrivers.filter(d => d.status === 'available'));

            // Calculate Stats
            const totalSpent = clientOrders
                .filter(o => ['delivered', 'completed'].includes(o.status))
                .reduce((sum, o) => sum + (o.price || 0), 0);

            const totalInvoicedAmount = clientInvoicesData
                .reduce<number>((sum, i) => sum + (i.amount_ttc || 0), 0);

            const activeOrdersCount = clientOrders
                .filter(o => ['pending_acceptance', 'assigned', 'in_progress', 'dispatched'].includes(o.status))
                .length;

            setStats({
                totalOrders: clientOrders.length,
                totalSpent,
                activeOrders: activeOrdersCount,
                totalInvoiced: totalInvoicedAmount
            });

        } catch (error: any) {
            console.error("Error fetching client:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            if (!background) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientData();
    }, [id]);

    // Change client status
    const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'pending') => {
        if (!id) return;

        if (newStatus === 'suspended') {
            setSuspensionReason("");
            setShowSuspendDialog(true);
            return;
        }

        try {
            setIsUpdatingStatus(true);
            if (newStatus === 'active' && client?.status === 'suspended') {
                await unsuspendClient(id);
                // Optimistic update
                if (client) {
                    setClient({
                        ...client,
                        status: 'active',
                        is_suspended: false,
                        suspended_at: undefined,
                        suspension_reason: undefined
                    });
                }
            } else {
                await updateClientStatus(id, newStatus);
                // Optimistic update
                if (client) {
                    setClient({ ...client, status: newStatus });
                }
            }
            toast.success(`Statut mis à jour : ${newStatus === 'active' ? 'Actif' : 'En attente'}`);
            // No background fetch to avoid race condition - we trust our optimistic update
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour du statut");
            fetchClientData(true);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSuspendClient = async () => {
        if (!id) return;
        try {
            setIsUpdatingStatus(true);
            await suspendClient(id, suspensionReason);

            // Optimistic update to ensure immediate feedback
            if (client) {
                setClient({
                    ...client,
                    status: 'suspended',
                    is_suspended: true,
                    suspended_at: new Date().toISOString(),
                    suspension_reason: suspensionReason
                });
            }

            toast.success("Client suspendu avec succès");
            setShowSuspendDialog(false);
            // No background fetch to avoid race condition - we trust our optimistic update
        } catch (error) {
            console.error("Error suspending client:", error);
            toast.error("Erreur lors de la suspension");
            fetchClientData(true);
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
        // @ts-ignore
        const label = getClientStatusLabel(status) || status;
        // @ts-ignore
        const color = getClientStatusColor(status) || 'bg-gray-500';

        return <Badge className={`${color} text-white border-0 px-3 py-1`}>{label}</Badge>;
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

    const getInvoiceStatusColor = (status: string) => {
        // @ts-ignore
        return getInvoiceStatusColorHelper(status) || 'bg-orange-500';
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
                <Button variant="outline" onClick={() => navigate('/admin/clients')} className="mt-4">
                    Retour à la liste
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Suspended Account Banner */}
            {client.status === 'suspended' && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="ml-2 text-lg font-bold">Compte Suspendu</AlertTitle>
                    <AlertDescription className="ml-2 mt-1 text-red-700">
                        Ce compte client est actuellement suspendu. Le client ne peut plus passer de commandes.
                        {client.suspended_at && (
                            <div className="mt-2 text-sm font-medium">
                                Suspendu le : {new Date(client.suspended_at).toLocaleDateString('fr-FR')}
                            </div>
                        )}
                        {client.suspension_reason && (
                            <div className="mt-1 text-sm">
                                Raison : {client.suspension_reason}
                            </div>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/clients')}>
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
                    {client.status === 'suspended' || client.is_suspended ? (
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
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange('suspended')}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Suspendre le compte
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Row - Traceability Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeOrders} en cours
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} €</div>
                        <p className="text-xs text-muted-foreground">
                            Sur commandes livrées
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Facturation</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInvoiced.toFixed(2)} €</div>
                        <p className="text-xs text-muted-foreground">
                            {invoices.length} factures générées
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Factures Impayées</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + curr.amount_ttc, 0).toFixed(2)} €
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {invoices.filter(i => i.status !== 'paid').length} à régler
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Fiche Client</TabsTrigger>
                    <TabsTrigger value="orders">Bons de Commande & Courses</TabsTrigger>
                    <TabsTrigger value="invoices">Factures</TabsTrigger>
                </TabsList>

                {/* TAB 1: FICHE CLIENT (OVERVIEW) */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Coordonnées */}
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
                                        <p className="font-medium">{client.phone || 'Non renseigné'}</p>
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

                        {/* Informations Compte & Admin */}
                        <div className="space-y-6">
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
                                            <CreditCard className="h-4 w-4" /> Mode Facturation
                                        </span>
                                        <span className="font-medium text-sm">
                                            {client.auto_invoice ? 'Automatique' : 'Manuel'}
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
                                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Fonctionnalité à venir")}>
                                        Gérer les utilisateurs associés
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: COMMANDES (REQUESTS & PO) */}
                <TabsContent value="orders" className="space-y-4">
                    <Card className="p-6 shadow-sm border-0 h-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-primary">
                                    Bons de Commande & Courses
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Historique complet des demandes et bons de commande associés.
                                </p>
                            </div>
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
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher (référence, adresse, bon de commande...)"
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Référence / Bon</TableHead>
                                        <TableHead>Trajet</TableHead>
                                        <TableHead>Prix HT</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                Aucune commande trouvée.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="cursor-pointer hover:bg-muted/30 transition-colors"
                                                onClick={() => navigate(`/admin/commandes/${order.id}`)}
                                            >
                                                <TableCell className="font-medium text-primary">
                                                    <div className="flex flex-col">
                                                        <span>{order.reference}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <FileText className="h-3 w-3" /> Bon de commande
                                                        </span>
                                                    </div>
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
                                                    {order.price ? `${order.price.toFixed(2)} €` : '-'}
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
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                {/* TAB 3: FACTURES (INVOICES) */}
                <TabsContent value="invoices" className="space-y-4">
                    <Card className="p-6 shadow-sm border-0 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-primary">
                                    Factures
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Liste des factures générées pour ce client.
                                </p>
                            </div>
                            <Button onClick={() => toast.info("Génération de facture manuelle à venir")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une facture
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Date d'émission</TableHead>
                                        <TableHead>Montant TTC</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                Aucune facture disponible.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    {invoice.reference || `FAC-${invoice.id.slice(0, 8)}`}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold">{invoice.amount_ttc?.toFixed(2) || '0.00'} €</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getInvoiceStatusColor(invoice.status)} text-white`}>
                                                        {invoice.status === 'paid' ? 'Payée' :
                                                            invoice.status === 'overdue' ? 'En retard' : 'En attente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => window.open(invoice.pdf_url, '_blank')} disabled={!invoice.pdf_url}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        PDF
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

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

