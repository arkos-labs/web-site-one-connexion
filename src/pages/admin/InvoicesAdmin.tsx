import { useEffect, useState } from "react";
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
import { Search, RefreshCw, Loader2, Bell, FileText, Download, CheckCircle, Mail } from "lucide-react";
import { toast } from "sonner";

// Services
import {
  getAllInvoices,
  sendBulkPaymentReminders,
  markInvoiceAsPaid,
  sendInvoiceByEmail
} from "@/services/adminSupabaseQueries";

import { supabase } from "@/lib/supabase";

const InvoicesAdmin = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setIsLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    fetchInvoices();

    const channel = supabase
      .channel('admin-invoices-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Relancer les impayés
  const handleSendReminders = async () => {
    if (!confirm("Envoyer une relance à tous les clients avec des factures impayées ?")) {
      return;
    }

    try {
      setIsSendingReminders(true);
      const result = await sendBulkPaymentReminders();

      toast.success(`Relance envoyée à ${result.successCount} client(s)`, {
        description: result.errorCount > 0
          ? `${result.errorCount} erreur(s) rencontrée(s)`
          : undefined
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'envoi des relances");
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleDownloadPDF = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error("PDF non disponible pour cette facture");
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm("Marquer cette facture comme payée ? Cela enverra une confirmation au client.")) return;
    try {
      await markInvoiceAsPaid(invoiceId);
      toast.success("Facture marquée comme payée");
      fetchInvoices();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    try {
      await sendInvoiceByEmail(invoiceId);
      toast.success("Facture envoyée par email");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi");
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchQuery.toLowerCase();
    return (
      invoice.reference?.toLowerCase().includes(searchLower) ||
      invoice.clients?.company_name?.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0);
  const unpaidCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Gestion des factures
          </h1>
          <p className="text-muted-foreground">
            Gérez les factures et relancez les impayés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInvoices} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="default"
            onClick={handleSendReminders}
            disabled={isSendingReminders || unpaidCount === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Bell className={`h-4 w-4 mr-2 ${isSendingReminders ? 'animate-pulse' : ''}`} />
            {isSendingReminders ? 'Envoi en cours...' : `Relancer les impayés (${unpaidCount})`}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total factures</p>
              <p className="text-2xl font-bold text-primary">{invoices.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant payé</p>
              <p className="text-2xl font-bold text-green-600">{paidAmount.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{pendingAmount.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-purple-600">{totalAmount.toFixed(2)}€</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6 shadow-soft border-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro de facture ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="shadow-soft border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold text-primary">
                    {invoice.reference}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {invoice.clients?.company_name ||
                          invoice.facturation?.societe ||
                          'Client inconnu'}
                      </span>
                      {/* Badge "Invité" si pas de client lié */}
                      {!invoice.client_id && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Invité
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {invoice.amount_ttc?.toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${invoice.status === 'paid'
                        ? 'bg-green-500'
                        : invoice.status === 'overdue'
                          ? 'bg-red-500'
                          : 'bg-orange-500'
                        } text-white border-0`}
                    >
                      {invoice.status === 'paid'
                        ? 'Payée'
                        : invoice.status === 'overdue'
                          ? 'En retard'
                          : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {invoice.status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          title="Marquer comme payée"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendEmail(invoice.id)}
                        title="Envoyer par email"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice.pdf_url)}
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default InvoicesAdmin;
