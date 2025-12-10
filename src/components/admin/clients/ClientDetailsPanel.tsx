import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  sector: string;
  email: string;
  phone: string;
  status: string;
  orders: number;
  spent: number;
  siret?: string;
  address?: string;
  city?: string;
  description?: string;
}

interface ClientDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const mockClientOrders: Record<number, any[]> = {
  1: [
    { id: "CMD-001", date: "2025-11-25", amount: 1500, status: "delivered" },
    { id: "CMD-002", date: "2025-11-20", amount: 2000, status: "delivered" },
    { id: "CMD-003", date: "2025-11-15", amount: 1740, status: "delivered" },
  ],
  2: [
    { id: "CMD-010", date: "2025-11-24", amount: 890, status: "in_progress" },
    { id: "CMD-011", date: "2025-11-18", amount: 1200, status: "delivered" },
    { id: "CMD-012", date: "2025-11-10", amount: 1030, status: "delivered" },
  ],
  3: [
    { id: "CMD-020", date: "2025-11-26", amount: 2500, status: "in_progress" },
    { id: "CMD-021", date: "2025-11-23", amount: 2100, status: "delivered" },
    { id: "CMD-022", date: "2025-11-14", amount: 2300, status: "delivered" },
    { id: "CMD-023", date: "2025-11-05", amount: 1900, status: "delivered" },
  ],
  4: [
    { id: "CMD-030", date: "2025-11-22", amount: 890, status: "delivered" },
  ],
};

export function ClientDetailsPanel({
  isOpen,
  onClose,
  client,
}: ClientDetailsPanelProps) {
  if (!client) return null;

  const clientOrders = mockClientOrders[client.id] || [];
  const averageOrderValue = clientOrders.length > 0 ? (client.spent / clientOrders.length).toFixed(2) : "0";

  const handleDownloadContract = () => {
    const contractHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 210mm; height: 297mm; margin: auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .info-item strong { color: #333; display: block; margin-bottom: 5px; }
          .info-item p { margin: 0; color: #666; font-size: 12px; }
          table { width: 100%; margin: 20px 0; border-collapse: collapse; }
          table th { background: #f0f0f0; padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border: 1px solid #ddd; }
          table td { padding: 10px; border: 1px solid #ddd; font-size: 12px; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
          .signature-area { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-line { border-top: 1px solid #333; height: 60px; padding-top: 50px; text-align: center; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FICHE CLIENT PROFESSIONNEL</h1>
            <p>One Connexion Express</p>
          </div>

          <div class="section">
            <div class="section-title">Informations Générale</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Nom de l'Entreprise:</strong>
                <p>${client.name}</p>
              </div>
              <div class="info-item">
                <strong>Secteur d'Activité:</strong>
                <p>${client.sector}</p>
              </div>
              <div class="info-item">
                <strong>Email:</strong>
                <p>${client.email}</p>
              </div>
              <div class="info-item">
                <strong>Téléphone:</strong>
                <p>${client.phone}</p>
              </div>
            </div>
          </div>

          ${client.siret ? `
          <div class="section">
            <div class="section-title">Informations Légales</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>SIRET:</strong>
                <p>${client.siret}</p>
              </div>
              <div class="info-item">
                <strong>Adresse:</strong>
                <p>${client.address || "Non spécifiée"}<br>${client.postalCode || ""} ${client.city || ""}</p>
              </div>
            </div>
          </div>
          ` : ""}

          <div class="section">
            <div class="section-title">Statistiques de Collaboration</div>
            <table>
              <tr>
                <th>Total Commandes</th>
                <th>Montant Total</th>
                <th>Moyenne par Commande</th>
                <th>Statut</th>
              </tr>
              <tr>
                <td>${clientOrders.length}</td>
                <td>${client.spent}€</td>
                <td>${averageOrderValue}€</td>
                <td>${client.status === "active" ? "Actif" : "Inactif"}</td>
              </tr>
            </table>
          </div>

          ${client.description ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p style="font-size: 12px; line-height: 1.6;">${client.description}</p>
          </div>
          ` : ""}

          <div class="signature-area">
            <div class="signature-line">Signature du client</div>
            <div class="signature-line">Signature de One Connexion Express</div>
          </div>

          <div class="footer">
            <p>Ce document confirme l'enregistrement du client professionnel dans notre système</p>
            <p>One Connexion Express © 2025 - Tous droits réservés</p>
            <p>Date de création: ${new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const element = document.createElement("a");
    element.href = "data:text/html;charset=utf-8," + encodeURIComponent(contractHTML);
    element.download = `fiche-client-${client.name.replace(/\s+/g, "-")}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Fiche client téléchargée: fiche-client-${client.name}.html`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du client - {client.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <p className="text-sm text-gray-500">{client.sector}</p>
            </div>
            <Badge className={client.status === "active" ? "bg-green-500" : "bg-gray-500"}>
              {client.status === "active" ? "Actif" : "Inactif"}
            </Badge>
          </div>

          {/* Infos de contact */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">📞 Informations de contact</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail size={14} />
                {client.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} />
                {client.phone}
              </p>
              {client.address && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} />
                  {client.address}, {client.postalCode} {client.city}
                </p>
              )}
            </div>
          </Card>

          {/* Infos légales */}
          {client.siret && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-900">🏢 Informations légales</h3>
              <div className="space-y-2 text-sm text-blue-900">
                <p><strong>SIRET:</strong> {client.siret}</p>
              </div>
            </Card>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">Total Commandes</p>
              <p className="text-2xl font-bold">{clientOrders.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">Montant Total</p>
              <p className="text-2xl font-bold text-green-600">{client.spent}€</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">Moyenne par Commande</p>
              <p className="text-2xl font-bold">{averageOrderValue}€</p>
            </Card>
          </div>

          {/* Historique des commandes */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">📦 Historique des commandes</h3>
            <div className="space-y-2">
              {clientOrders.length > 0 ? (
                clientOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={order.status === "delivered" ? "bg-green-500" : "bg-blue-500"}>
                        {order.status === "delivered" ? "Livrée" : "En cours"}
                      </Badge>
                      <span className="font-semibold">{order.amount}€</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucune commande</p>
              )}
            </div>
          </Card>

          {/* Notes */}
          {client.description && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-900">📝 Notes</h3>
              <p className="text-sm text-yellow-800">{client.description}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Fermer
            </Button>
            <Button onClick={handleDownloadContract} variant="secondary" className="flex-1 gap-2">
              <Download size={16} />
              Fiche client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClientDetailsPanel;
