import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Search } from "lucide-react";
import { CreateClientModal } from "@/components/admin/clients/CreateClientModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Client, getClientStatusLabel, getClientStatusColor } from "@/types/clients";
import { supabase } from "@/lib/supabase";
import { getClientsPaginated, getClientStatsBatch } from "@/services/adminSupabaseQueries";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const pageSize = 10;

  const [globalStats, setGlobalStats] = useState({
    totalClients: 0,
    activeClients: 0,
    suspendedClients: 0,
    totalRevenue: 0,
    totalUnpaid: 0
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchClients(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Initial load for global stats
  useEffect(() => {
    fetchGlobalStats();

    // Realtime subscription
    const channel = supabase
      .channel('admin-clients-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          fetchClients();
          fetchGlobalStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Orders affect client stats
          fetchClients();
          fetchGlobalStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // We need to import getGlobalClientStats first, but for now let's assume it's available or implement it inline if needed.
      // Actually I added it to adminSupabaseQueries.ts in the previous step.
      const { getGlobalClientStats } = await import("@/services/adminSupabaseQueries");
      const stats = await getGlobalClientStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  // Pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClients(page);
  };

  const fetchClients = async (page = currentPage) => {
    setIsLoading(true);

    try {
      // 1. Fetch Paginated Clients
      const { data, count, totalPages: pages } = await getClientsPaginated(page, pageSize, searchQuery, statusFilter);

      setTotalPages(pages);
      setTotalClients(count);

      if (data && data.length > 0) {
        // 2. Fetch Stats only for these clients
        const clientIds = data.map(c => c.id);
        const statsMap = await getClientStatsBatch(clientIds);

        // 3. Merge data
        const realClients: Client[] = data.map((c: any) => {
          const clientStats = statsMap[c.id] || { stats: {}, billing: {} };

          let addressObj = {
            street: c.address || "",
            city: c.city || "",
            postal_code: c.postal_code || "",
            country: c.country || "France"
          };

          return {
            ...c,
            internal_code: c.internal_code || `CL-${c.id.substring(0, 4).toUpperCase()}`,
            company_name: c.company_name || "Sans nom",
            sector: c.sector || "Autre",
            address: addressObj,
            billing: {
              ...clientStats.billing,
              payment_method: c.payment_method || "Virement bancaire",
              payment_terms: c.payment_terms || 30
            },
            stats: {
              ...clientStats.stats
            }
          };
        });
        setClients(realClients);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (clientId: string) => {
    navigate(`/dashboard-admin/clients/${clientId}`);
  };

  // Stats from global state
  const { activeClients: activeCount, suspendedClients: suspendedCount, totalRevenue, totalUnpaid } = globalStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Gestion des clients
          </h1>
          <p className="text-muted-foreground">CRM et portefeuille clients professionnels</p>
        </div>
        <Button variant="cta" onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={18} />
          Créer client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Clients</p>
          <p className="text-3xl font-bold">{clients.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Clients Actifs</p>
          <p className="text-3xl font-bold text-success">{activeCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Suspendus</p>
          <p className="text-3xl font-bold text-destructive">{suspendedCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Revenu Total</p>
          <p className="text-3xl font-bold text-warning">{totalRevenue.toLocaleString()}€</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Impayés</p>
          <p className="text-3xl font-bold text-destructive">{totalUnpaid.toLocaleString()}€</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-soft border-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, code, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-soft border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Facturé</TableHead>
              <TableHead>Impayé</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleViewDetails(client.id)}
                >
                  <TableCell className="font-semibold">
                    <div>
                      <p>{client.internal_code} – {client.company_name}</p>
                      {client.suspended_at && (
                        <p className="text-xs text-destructive mt-1">
                          Suspendu le {new Date(client.suspended_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.sector}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{client.email}</p>
                      <p className="text-muted-foreground">{client.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getClientStatusColor(client.status)} text-white border-0`}>
                      {getClientStatusLabel(client.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.stats.total_orders}</TableCell>
                  <TableCell className="font-semibold">{client.billing.total_invoiced.toLocaleString()}€</TableCell>
                  <TableCell className={client.billing.total_unpaid > 0 ? "font-semibold text-destructive" : ""}>
                    {client.billing.total_unpaid > 0 ? `${client.billing.total_unpaid.toLocaleString()}€` : "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(client.id)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchClients();
        }}
      />
    </div>
  );
};

export default Clients;
