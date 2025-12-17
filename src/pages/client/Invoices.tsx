import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Download, FileText, TrendingUp, Clock, Calendar, CreditCard } from "lucide-react";
import { filterByDate, TimeRange } from "@/lib/date-utils";
import { getInvoicesByUser } from "@/services/supabaseQueries";
import { Invoice, supabase } from "@/lib/supabase";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const Invoices = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [timeFilter, setTimeFilter] = useState<TimeRange>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchInvoices();
    } else if (!profileLoading && !profile) {
      setLoading(false);
    }
  }, [profile, profileLoading]);

  const fetchInvoices = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await getInvoicesByUser(profile.id);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (!profile) return;

    const clientInfo = {
      name: profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.company_name,
      email: profile.email,
      phone: profile.phone || "",
      company: profile.company_name
    };

    try {
      generateInvoicePDF(invoice, clientInfo);
      toast.success("Facture téléchargée");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handlePayClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;

    setIsProcessingPayment(true);
    // Simulate payment processing
    setTimeout(async () => {
      // Update status in Supabase
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', selectedInvoice.id);

      if (error) {
        toast.error("Erreur lors du paiement");
      } else {
        toast.success("Paiement effectué avec succès");
        fetchInvoices(); // Refresh list
        setIsPaymentModalOpen(false);
      }
      setIsProcessingPayment(false);
    }, 2000);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    filterByDate(invoice.created_at, timeFilter, "yyyy-MM-dd")
  );

  // Calculate stats
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount_ttc, 0);
  const paidCount = filteredInvoices.filter(inv => inv.status === 'paid').length;
  const pendingCount = filteredInvoices.filter(inv => inv.status === 'pending').length;

  const stats = [
    {
      title: "Total de la période",
      value: `${totalAmount.toFixed(2)}€`,
      change: "TTC",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Factures payées",
      value: paidCount.toString(),
      change: "Sur la période",
      icon: FileText,
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      title: "En attente",
      value: pendingCount.toString(),
      change: "À régler",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning-light",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          Mes factures
        </h1>
        <p className="text-muted-foreground">
          Consultez et téléchargez vos factures
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 shadow-soft border-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-display font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.change}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Invoices Table */}
      <Card className="shadow-soft border-0">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-primary">
              Historique des factures
            </h2>
            <div className="flex gap-2">
              <Select value={timeFilter} onValueChange={(value: TimeRange) => setTimeFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="today">Aujourd’hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois-ci</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Aucune facture trouvée</TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell className="font-semibold">{invoice.reference}</TableCell>
                  <TableCell>{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-semibold text-lg">
                    {invoice.amount_ttc.toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Badge className={`${invoice.status === 'paid' ? 'bg-success' :
                      invoice.status === 'pending' ? 'bg-warning' : 'bg-destructive'
                      } text-white border-0`}>
                      {invoice.status === 'paid' ? 'Payée' :
                        invoice.status === 'pending' ? 'En attente' : 'En retard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button
                          size="sm"
                          className="bg-cta text-cta-foreground hover:bg-cta/90 font-semibold"
                          onClick={() => handlePayClick(invoice)}
                        >
                          Payer ma facture
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )))}
          </TableBody>
        </Table>
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payer la facture {selectedInvoice?.reference}</DialogTitle>
            <DialogDescription>
              Récapitulatif de votre commande et paiement sécurisé via Stripe.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="py-4 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant à payer</span>
                  <span className="font-bold text-lg">{selectedInvoice.amount_ttc.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date de facture</span>
                  <span>{new Date(selectedInvoice.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Paiement par carte</span>
                </div>
                {/* Placeholder for Stripe Element */}
                <div className="bg-background border border-input rounded p-3 text-sm text-muted-foreground">
                  [Formulaire Stripe sécurisé]
                  <br />
                  Numéro de carte •••• •••• •••• 4242
                  <br />
                  MM/AA  CVC
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-cta text-cta-foreground hover:bg-cta/90 font-semibold w-full sm:w-auto"
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Traitement..." : `Payer ${selectedInvoice?.amount_ttc.toFixed(2)}€`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
