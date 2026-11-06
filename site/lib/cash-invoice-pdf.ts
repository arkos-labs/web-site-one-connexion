import jsPDF from "jspdf";
import { LEGAL } from "@/lib/site-content";
import { invoiceFooter } from "@/lib/invoice-info";

export interface CashInvoiceData {
  number: string;
  issuedAt: string; // YYYY-MM-DD
  buyerName: string;
  buyerAddress: string | null;
  buyerSiret: string | null;
  amountHt: number;
  vatAmount: number;
  amountTtc: number;
  trackingCode: string | null;
  orderDate: string; // ISO
  pickupAddress: string;
  dropoffAddress: string;
  paid: boolean;
  paymentMethod: string | null;
}

const money = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
const PAYMENT_LABEL: Record<string, string> = { especes: "espèces", virement: "virement", carte: "carte bancaire", autre: "autre moyen" };

/** Facture interne (hors Stripe) d'une course. Renvoie le PDF en octets. */
export function buildCashInvoicePdf(d: CashInvoiceData): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 15;
  let y = 20;

  doc.setFont("helvetica", "bold").setFontSize(16).text(LEGAL.denomination, left, y);
  doc.setFont("helvetica", "normal").setFontSize(9);
  for (const line of [LEGAL.forme, LEGAL.adresse, `SIRET ${LEGAL.siret} - TVA ${LEGAL.tva}`]) {
    y += 5; doc.text(line, left, y);
  }

  doc.setFont("helvetica", "bold").setFontSize(14).text("FACTURE", 195, 20, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(`N° ${d.number}`, 195, 27, { align: "right" });
  doc.text(`Date : ${dateFr(d.issuedAt)}`, 195, 33, { align: "right" });

  y = 60;
  doc.setFont("helvetica", "bold").text("Facturé à", left, y);
  doc.setFont("helvetica", "normal");
  y += 5; doc.text(d.buyerName, left, y);
  if (d.buyerAddress) { y += 5; doc.text(d.buyerAddress, left, y); }
  if (d.buyerSiret) { y += 5; doc.text(`SIRET : ${d.buyerSiret}`, left, y); }

  y = 95;
  doc.setFont("helvetica", "bold").text("Désignation", left, y);
  doc.text("Montant TTC", 195, y, { align: "right" });
  doc.line(left, y + 2, 195, y + 2);
  doc.setFont("helvetica", "normal");
  y += 9;
  const label = `Transport de colis, course ${d.trackingCode ?? ""} du ${dateFr(d.orderDate)}`.trim();
  doc.text(label, left, y);
  doc.text(money(d.amountTtc), 195, y, { align: "right" });
  y += 5;
  doc.setFontSize(8).setTextColor(90);
  doc.text(`Enlèvement : ${d.pickupAddress}`, left, y);
  y += 4;
  doc.text(`Livraison : ${d.dropoffAddress}`, left, y);
  doc.setTextColor(0).setFontSize(10);

  y += 12;
  doc.line(120, y, 195, y);
  y += 6;
  doc.text("Total HT", 120, y);
  doc.text(money(d.amountHt), 195, y, { align: "right" });
  y += 5;
  doc.text("TVA 20 %", 120, y);
  doc.text(money(d.vatAmount), 195, y, { align: "right" });
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC", 120, y);
  doc.text(money(d.amountTtc), 195, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal").setFontSize(10);
  if (d.paid) {
    const how = d.paymentMethod ? PAYMENT_LABEL[d.paymentMethod] ?? d.paymentMethod : "hors ligne";
    doc.text(`Facture acquittée, réglée par ${how}.`, left, y);
  } else {
    doc.text("Facture à régler.", left, y);
  }

  doc.setFontSize(7).setTextColor(90);
  doc.text(doc.splitTextToSize(invoiceFooter(d.paid), 180), left, 280);

  return doc.output("arraybuffer");
}
