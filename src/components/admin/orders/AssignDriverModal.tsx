import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  currentDriverId?: string | null;
  onAssign: () => void;
}

const mockDrivers = [
  { id: "1", name: "Jean Dupont", status: "online", rating: 4.8, deliveries: 45 },
  { id: "2", name: "Marie Martin", status: "offline", rating: 4.9, deliveries: 32 },
  { id: "3", name: "Pierre Moreau", status: "online", rating: 4.6, deliveries: 28 },
  { id: "4", name: "Sophie Bernard", status: "online", rating: 4.7, deliveries: 51 },
];

const AssignDriverModal = ({
  isOpen,
  onClose,
  orderId,
  currentDriverId,
  onAssign,
}: AssignDriverModalProps) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(currentDriverId || "");

  const handleAssign = () => {
    if (!selectedDriverId) {
      toast.error("Veuillez sélectionner un chauffeur");
      return;
    }
    const driver = mockDrivers.find((d) => d.id === selectedDriverId);
    toast.success(`Commande assignée à ${driver?.name}`);
    onAssign();
    onClose();
  };

  const handleDownloadDeliveryNote = () => {
    if (!selectedDriverId) {
      toast.error("Veuillez d'abord sélectionner un chauffeur");
      return;
    }

    const driver = mockDrivers.find((d) => d.id === selectedDriverId);
    
    // Créer le contenu PDF en HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 210mm; height: 297mm; margin: auto; border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #333; }
          .header p { margin: 5px 0; color: #666; font-size: 12px; }
          .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-block { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .info-block h3 { margin: 0 0 10px 0; font-size: 14px; color: #333; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .info-block p { margin: 5px 0; font-size: 12px; }
          .info-block strong { color: #333; }
          .status { color: #10b981; font-weight: bold; }
          .delivery-instructions { margin-top: 30px; border: 2px dashed #fbbf24; padding: 15px; background: #fef3c7; border-radius: 5px; }
          .delivery-instructions h3 { margin: 0 0 10px 0; font-size: 14px; color: #92400e; }
          .delivery-instructions p { margin: 5px 0; font-size: 12px; color: #78350f; }
          .signature-area { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-line { border-top: 1px solid #333; height: 60px; padding-top: 50px; text-align: center; font-size: 11px; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
          .barcode { text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BON DE COMMANDE / DELIVERY NOTE</h1>
            <p>One Connexion Express - Livraison Express</p>
          </div>

          <div class="barcode">${orderId}</div>

          <div class="order-info">
            <div class="info-block">
              <h3>📍 Chauffeur Assigné</h3>
              <p><strong>Nom :</strong> ${driver?.name}</p>
              <p><strong>Statut :</strong> <span class="status">${driver?.status === "online" ? "En ligne" : "Hors ligne"}</span></p>
              <p><strong>Note :</strong> ${driver?.rating}⭐ / 5</p>
              <p><strong>Livraisons :</strong> ${driver?.deliveries} courses</p>
            </div>
            
            <div class="info-block">
              <h3>📦 Commande</h3>
              <p><strong>N° Commande :</strong> ${orderId}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
              <p><strong>Heure :</strong> ${new Date().toLocaleTimeString("fr-FR")}</p>
              <p><strong>Priorité :</strong> Standard</p>
            </div>
          </div>

          <div class="delivery-instructions">
            <h3>⚠️ Instructions de Livraison</h3>
            <p>• Vérifier l'identité du destinataire</p>
            <p>• Demander une signature de réception</p>
            <p>• Prendre une photo de la livraison</p>
            <p>• Faire remplir le bon par le client</p>
            <p>• Retourner ce document signé</p>
          </div>

          <div class="signature-area">
            <div class="signature-line">Signature du chauffeur</div>
            <div class="signature-line">Signature du client</div>
          </div>

          <div class="footer">
            <p>Ce document doit être retourné signé après livraison | This document must be returned signed after delivery</p>
            <p>One Connexion Express © 2025 - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Créer un blob et télécharger
    const element = document.createElement("a");
    element.href = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
    element.download = `bon-commande-${orderId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Bon de commande téléchargé : bon-commande-${orderId}.html`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un chauffeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info commande */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Commande :</strong> {orderId}
            </p>
          </div>

          {/* Sélection chauffeur */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionner un chauffeur</label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un chauffeur..." />
              </SelectTrigger>
              <SelectContent>
                {mockDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div className="flex items-center gap-2">
                      <span>{driver.name}</span>
                      <Badge
                        variant="outline"
                        className={driver.status === "online" ? "bg-green-100" : "bg-gray-100"}
                      >
                        {driver.status === "online" ? "🟢 Libre" : "🔴 Occupé"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info chauffeur sélectionné */}
          {selectedDriverId && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
              {mockDrivers.find((d) => d.id === selectedDriverId) && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Chauffeur sélectionné</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-green-900">
                    <strong>{mockDrivers.find((d) => d.id === selectedDriverId)?.name}</strong>
                  </p>
                  <div className="text-xs text-green-800 space-y-1">
                    <p>Note: {mockDrivers.find((d) => d.id === selectedDriverId)?.rating}⭐</p>
                    <p>
                      Livraisons: {mockDrivers.find((d) => d.id === selectedDriverId)?.deliveries}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Boutons actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleAssign} className="flex-1 gap-2">
              <CheckCircle size={16} />
              Assigner
            </Button>
          </div>

          {/* Bouton télécharger bon */}
          {selectedDriverId && (
            <Button
              onClick={handleDownloadDeliveryNote}
              variant="secondary"
              className="w-full gap-2"
            >
              <Download size={16} />
              Télécharger le bon de commande
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverModal;
