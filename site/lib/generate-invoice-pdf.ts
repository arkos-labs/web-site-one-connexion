import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LEGAL, EMAIL, PHONE_DISPLAY } from "@/lib/site-content";

interface Order {
  tracking_code: string;
  created_at: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  price_estimate: number | string | null;
  delivery_recipient?: string | null;
  delivery_department?: string | null;
  _type?: string;
}

interface InvoiceData {
  invoiceId: string;
  monthLabel: string;
  clientName: string;
  clientEmail: string;
  orders: Order[];
}

const ORANGE = [226, 100, 20] as const;
const DARK = [29, 40, 58] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_GRAY = [156, 163, 175] as const;
const BG_LIGHT = [249, 250, 251] as const;

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function truncate(str: string | undefined, max: number): string {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function drawRoundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number, r: number,
  fill: readonly [number, number, number]
) {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

export async function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 22;
  const contentW = pw - m * 2;

  // ── Orange accent bar at top ──
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pw, 3, "F");

  // ── Logo ──
  let logoLoaded = false;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/logo.png";
    });
    doc.addImage(img, "PNG", m, 10, 38, 17);
    logoLoaded = true;
  } catch {
    // fallback text
  }

  if (!logoLoaded) {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ORANGE);
    doc.text("ONE CONNEXION", m, 22);
  }

  // ── FACTURE title ──
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("FACTURE", pw - m, 18, { align: "right" });

  // Invoice number pill
  const pillText = data.invoiceId;
  doc.setFontSize(9);
  const pillW = doc.getTextWidth(pillText) + 8;
  drawRoundedRect(doc, pw - m - pillW, 22, pillW, 6, 1.5, BG_LIGHT);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text(pillText, pw - m - pillW / 2, 26, { align: "center" });

  // ── Thin separator ──
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(m, 34, pw - m, 34);

  // ── Info blocks row ──
  const colLeft = m;
  const colRight = pw / 2 + 8;

  // ÉMETTEUR
  let y = 42;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text("ÉMETTEUR", colLeft, y);
  y += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(LEGAL.denomination, colLeft, y);
  y += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(LEGAL.adresse, colLeft, y);
  y += 4;
  doc.text(`Tél : ${PHONE_DISPLAY}`, colLeft, y);
  y += 4;
  doc.text(EMAIL, colLeft, y);
  y += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`SIRET ${LEGAL.siret}  •  TVA ${LEGAL.tva}`, colLeft, y);
  y += 3.5;
  doc.text(`${LEGAL.forme}  •  Capital ${LEGAL.capital}`, colLeft, y);

  // CLIENT box
  let yR = 42;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text("FACTURÉ À", colRight, yR);
  yR += 6;

  // Client card background
  drawRoundedRect(doc, colRight - 3, yR - 4, contentW / 2 - 3, 28, 2, BG_LIGHT);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(data.clientName || "—", colRight, yR);
  yR += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(data.clientEmail, colRight, yR);

  // Invoice details inside client card
  yR += 8;
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`Période :`, colRight, yR);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(data.monthLabel, colRight + 19, yR);
  yR += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`Émise le :`, colRight, yR);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(new Date().toLocaleDateString("fr-FR"), colRight + 19, yR);

  // ── Table ──
  const tableStartY = Math.max(y, yR) + 12;

  const tableBody = data.orders.map((o) => {
    const type = o._type === "navette" ? "Navette" : "Course";
    const reception = [o.delivery_recipient, o.delivery_department].filter(Boolean).join(" — ") || "—";
    return [
      o.tracking_code || "—",
      type,
      new Date(o.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      truncate(o.pickup_address, 30),
      truncate(o.dropoff_address, 30),
      truncate(reception, 30),
      o.price_estimate ? `${fmt(Number(o.price_estimate))} €` : "—",
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: m, right: m },
    head: [["N°", "Type", "Date", "Enlèvement", "Livraison", "Réception", "Montant HT"]],
    body: tableBody,
    styles: {
      fontSize: 7,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      textColor: [60, 60, 60],
      lineColor: [235, 235, 235],
      lineWidth: 0,
      font: "helvetica",
    },
    headStyles: {
      fillColor: [...DARK],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    bodyStyles: {
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: 14 },
      2: { cellWidth: 20 },
      6: { halign: "right" as const, cellWidth: 20, fontStyle: "bold" },
    },
    tableLineColor: [235, 235, 235],
    tableLineWidth: 0.2,
    didDrawPage: () => {
      // Orange bar on every page
      doc.setFillColor(...ORANGE);
      doc.rect(0, 0, pw, 3, "F");
    },
  });

  // ── Totals box ──
  const totalHT = data.orders.reduce(
    (sum, o) => sum + (o.price_estimate ? Number(o.price_estimate) : 0),
    0
  );
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;

  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 40;

  const boxW = 72;
  const boxX = pw - m - boxW;
  const boxY = finalY + 8;
  const boxH = 38;

  // Totals card
  drawRoundedRect(doc, boxX, boxY, boxW, boxH, 3, BG_LIGHT);

  const labelX = boxX + 6;
  const valueX = boxX + boxW - 6;
  let tY = boxY + 9;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Total HT", labelX, tY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(`${fmt(totalHT)} €`, valueX, tY, { align: "right" });

  tY += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("TVA 20%", labelX, tY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(`${fmt(totalTVA)} €`, valueX, tY, { align: "right" });

  // Divider
  tY += 4;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(labelX, tY, valueX, tY);

  // TTC with orange background
  tY += 2;
  drawRoundedRect(doc, boxX + 3, tY, boxW - 6, 10, 2, ORANGE);
  tY += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL TTC", labelX, tY);
  doc.text(`${fmt(totalTTC)} €`, valueX, tY, { align: "right" });

  // ── Payment note ──
  const noteY = boxY + 4;
  const noteX = m;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Conditions de paiement", noteX, noteY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.text("Paiement à 30 jours à réception de la facture.", noteX, noteY + 5);
  doc.text("En cas de retard, une pénalité de 3× le taux d'intérêt", noteX, noteY + 9);
  doc.text("légal sera appliquée. Indemnité forfaitaire : 40 €.", noteX, noteY + 13);

  // ── Footer ──
  const footerY = ph - 12;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  doc.line(m, footerY - 6, pw - m, footerY - 6);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(
    `${LEGAL.denomination}  •  ${LEGAL.forme}  •  Capital ${LEGAL.capital}  •  SIRET ${LEGAL.siret}  •  TVA ${LEGAL.tva}`,
    pw / 2,
    footerY - 1,
    { align: "center" }
  );
  doc.text(
    `${LEGAL.adresse}  •  ${EMAIL}  •  ${PHONE_DISPLAY}`,
    pw / 2,
    footerY + 3,
    { align: "center" }
  );

  // ── Bottom accent bar ──
  doc.setFillColor(...ORANGE);
  doc.rect(0, ph - 3, pw, 3, "F");

  // ── Save ──
  doc.save(`${data.invoiceId}.pdf`);
}
