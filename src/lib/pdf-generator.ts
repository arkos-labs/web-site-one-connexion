import jsPDF from 'jspdf';
import { Order, Invoice } from '@/lib/supabase';

const COMPANY = {
    name: "One Connexion",
    siret: "000 000 000 00000",
    tva: "FR00 000000000",
    iban: "FR76 3000 4000 5000 6000 7000 890",
    address: "10 Rue de Paris, 75008 Paris",
    email: "contact@one-connexion.com",
};

interface ClientInfo {
    name: string;
    email: string;
    phone: string;
    company?: string;
}

interface DriverInfo {
    id: string;
    sender_email?: string;
    scheduled_at?: string;
    pickup_city?: string;
    delivery_city?: string;
    distance_km?: number;
    price_ht?: number;
    details?: {
        full_name?: string;
        phone_number?: string;
        address?: string;
        company?: string;
        siret?: string;
        vehicle_model?: string;
        vehicle_plate?: string;
        vehicle_type?: string;
        iban?: string;
        bic?: string;
    };
    returnBlob?: boolean;
}

const COLORS = {
    primary: '#ed5518', // Brand Orange
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate200: '#e2e8f0',
    slate50: '#f8fafc',
    white: '#ffffff'
};

// Helper to draw a divider
const drawDivider = (doc: jsPDF, x: number, y: number, w: number) => {
    doc.setDrawColor(226, 232, 240); 
    doc.line(x, y, x + w, y);
};

/**
 * Generates an Order Form (Bon de Commande)
 */
export const generateOrderPDF = (order: Order, clientInfo: ClientInfo) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = 0;

    // Header Background
    doc.setFillColor(COLORS.slate900);
    doc.rect(0, 0, pageW, 140, "F");

    // Logo / Company Name
    doc.setTextColor(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, margin, 80);
    doc.text(`SIRET: ${COMPANY.siret} • TVA: ${COMPANY.tva}`, margin, 95);
    doc.text(COMPANY.email, margin, 110);

    // Document Title Badge
    doc.setFillColor(COLORS.primary); 
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");

    doc.setTextColor(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("BON DE COMMANDE", pageW - margin - 185, 55);

    doc.setFontSize(14);
    doc.text(`#${order.reference?.toUpperCase() || String(order.id).slice(0, 8).toUpperCase()}`, pageW - margin - 185, 75);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.white);
    doc.text(`Émis le ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, pageW - margin - 185, 95);

    y = 180;

    // Info Grid
    doc.setTextColor(COLORS.slate500);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("DONNEUR D'ORDRE / CLIENT", margin, y);
    drawDivider(doc, margin, y + 5, contentW / 2 - 20);

    y += 25;
    doc.setTextColor(COLORS.slate900);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(clientInfo.company || clientInfo.name, margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nom: ${clientInfo.name}`, margin, y + 15);
    doc.text(`Email: ${clientInfo.email}`, margin, y + 27);
    doc.text(`Tél: ${clientInfo.phone}`, margin, y + 39);

    // Delivery Info (Right Column)
    let rightColX = margin + contentW / 2 + 20;
    doc.setTextColor(COLORS.slate500);
    doc.setFont("helvetica", "bold");
    doc.text("DÉTAILS DE LIVRAISON", rightColX, y - 25);
    drawDivider(doc, rightColX, y - 20, contentW / 2 - 20);

    doc.setTextColor(COLORS.slate900);
    doc.setFont("helvetica", "normal");
    doc.text(`Type: ${order.delivery_type}`, rightColX, y);
    doc.text(`Formule: ${order.formula?.toUpperCase() || "STANDARD"}`, rightColX, y + 12);
    doc.text(`Poids/Type: ${order.package_type || "Colis"}`, rightColX, y + 24);

    y += 70;

    // Addresses
    doc.setFillColor(COLORS.slate50);
    doc.roundedRect(margin, y, contentW, 100, 8, 8, "F");

    doc.setTextColor(COLORS.slate900);
    doc.setFont("helvetica", "bold");
    doc.text("ENLÈVEMENT", margin + 15, y + 25);
    doc.text("LIVRAISON", margin + contentW / 2 + 15, y + 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const pickupTxt = doc.splitTextToSize(order.pickup_address || "—", contentW / 2 - 40);
    const deliveryTxt = doc.splitTextToSize(order.delivery_address || "—", contentW / 2 - 40);
    doc.text(pickupTxt, margin + 15, y + 40);
    doc.text(deliveryTxt, margin + contentW / 2 + 15, y + 40);

    y += 130;

    // Table Header
    doc.setFillColor(COLORS.slate900);
    doc.rect(margin, y, contentW, 26, "F");
    doc.setTextColor(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION DES PRESTATIONS", margin + 10, y + 17);
    doc.text("PRIX HT", pageW - margin - 10, y + 17, { align: "right" });

    y += 34;
    doc.setTextColor(COLORS.slate900);
    doc.setFont("helvetica", "normal");
    doc.text(`Course express #${order.reference}`, margin + 10, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${order.price.toFixed(2)} €`, pageW - margin - 10, y, { align: "right" });

    // Summary
    y += 40;
    doc.setFillColor(COLORS.slate900);
    doc.roundedRect(pageW - margin - 200, y, 200, 60, 10, 10, "F");
    doc.setTextColor(COLORS.white);
    doc.setFontSize(12);
    doc.text("TOTAL HT", pageW - margin - 180, y + 40);
    doc.setFontSize(20);
    doc.text(`${order.price.toFixed(2)} €`, pageW - margin - 20, y + 40, { align: "right" });

    // Footer
    doc.setTextColor(COLORS.slate400);
    doc.setFontSize(8);
    doc.text(`One Connexion - ${COMPANY.address} - SIRET: ${COMPANY.siret}`, pageW / 2, pageH - 40, { align: "center" });

    doc.save(`bon-commande-${order.reference}.pdf`);
};

/**
 * Generates an Invoice for a Client
 */
export const generateInvoicePDF = (invoice: any, clientInfo: ClientInfo, orders: any[] = []) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = 0;

    // Header 
    doc.setFillColor(COLORS.slate900);
    doc.rect(0, 0, pageW, 140, "F");
    doc.setTextColor(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFillColor(COLORS.primary);
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");
    doc.setTextColor(COLORS.white);
    doc.setFontSize(10);
    doc.text("FACTURE CLIENT", pageW - margin - 185, 55);
    doc.setFontSize(14);
    doc.text(invoice.reference, pageW - margin - 185, 75);

    y = 180;
    doc.setTextColor(COLORS.slate500);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURÉ À", margin, y);
    drawDivider(doc, margin, y + 5, contentW / 2 - 20);

    y += 25;
    doc.setTextColor(COLORS.slate900);
    doc.setFontSize(11);
    doc.text(clientInfo.company || clientInfo.name, margin, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(clientInfo.name, margin, y + 15);
    doc.text(clientInfo.email, margin, y + 27);

    y += 60;
    doc.setFillColor(COLORS.slate900);
    doc.rect(margin, y, contentW, 26, "F");
    doc.setTextColor(COLORS.white);
    doc.text("DÉSIGNATION", margin + 10, y + 17);
    doc.text("TVA", pageW - margin - 120, y + 17, { align: "right" });
    doc.text("TOTAL TTC", pageW - margin - 10, y + 17, { align: "right" });

    y += 34;
    doc.setTextColor(COLORS.slate900);
    doc.text(`Prestations de transport - Réf: ${invoice.reference}`, margin + 10, y);
    doc.text("20%", pageW - margin - 120, y, { align: "right" });
    doc.text(`${invoice.amount_ttc.toFixed(2)} €`, pageW - margin - 10, y, { align: "right" });

    y += 60;
    doc.setFillColor(COLORS.slate900);
    doc.roundedRect(pageW - margin - 220, y, 220, 100, 10, 10, "F");
    doc.setTextColor(COLORS.white);
    doc.text("MONTANT HT", pageW - margin - 200, y + 30);
    doc.text(`${(invoice.amount_ttc / 1.2).toFixed(2)} €`, pageW - margin - 20, y + 30, { align: "right" });
    doc.text("TVA (20%)", pageW - margin - 200, y + 50);
    doc.text(`${(invoice.amount_ttc - (invoice.amount_ttc / 1.2)).toFixed(2)} €`, pageW - margin - 20, y + 50, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL TTC", pageW - margin - 200, y + 80);
    doc.text(`${invoice.amount_ttc.toFixed(2)} €`, pageW - margin - 20, y + 80, { align: "right" });

    doc.save(`facture-${invoice.reference}.pdf`);
};

/**
 * Generates a detailed Driver Monthly Statement
 */
export const generateDriverStatementPdf = (driver: DriverInfo, orders: Order[], period: string, computePay: (o: Order) => number) => {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 30;
    const contentW = pageW - margin * 2;
    let y = 0;

    const details = driver.details || {};

    // Header
    doc.setFillColor(COLORS.slate900);
    doc.rect(0, 0, pageW, 140, "F");
    doc.setTextColor(COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    // Title
    doc.setFillColor(COLORS.primary);
    doc.roundedRect(pageW - margin - 220, 35, 220, 75, 10, 10, "F");
    doc.setTextColor(COLORS.white);
    doc.setFontSize(10);
    doc.text("RELEVÉ MENSUEL DÉTAILLÉ", pageW - margin - 205, 55);
    doc.setFontSize(14);
    doc.text(period.toUpperCase(), pageW - margin - 205, 75);

    y = 180;
    doc.setTextColor(COLORS.slate500);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTATAIRE / CHAUFFEUR", margin, y);
    drawDivider(doc, margin, y + 5, contentW / 2 - 20);

    y += 25;
    doc.setTextColor(COLORS.slate900);
    doc.setFontSize(11);
    doc.text(details.full_name || "Chauffeur", margin, y);
    doc.setFontSize(9);
    doc.text(`SIRET: ${details.siret || "—"}`, margin, y + 15);
    doc.text(`IBAN: ${details.iban || "—"}`, margin, y + 27);

    // Missions Table
    y += 40;
    const colX = { date: margin + 8, ref: margin + 80, from: margin + 170, to: margin + 360, km: margin + 560, amount: pageW - margin - 10 };
    doc.setFillColor(COLORS.slate900);
    doc.rect(margin, y, contentW, 26, "F");
    doc.setTextColor(COLORS.white);
    doc.text("DATE", colX.date, y + 17);
    doc.text("RÉF", colX.ref, y + 17);
    doc.text("ORIGINE", colX.from, y + 17);
    doc.text("DESTINATION", colX.to, y + 17);
    doc.text("KM", colX.km, y + 17, { align: "right" });
    doc.text("MONTANT HT", colX.amount, y + 17, { align: "right" });

    y += 34;
    let totalGain = 0;
    doc.setTextColor(COLORS.slate900);
    doc.setFont("helvetica", "normal");
    orders.forEach((o, idx) => {
        if (y > pageH - 80) { doc.addPage(); y = 40; }
        const gain = computePay(o);
        totalGain += gain;
        if (idx % 2 === 0) { doc.setFillColor(COLORS.slate50); doc.rect(margin, y - 12, contentW, 22, "F"); }
        doc.text(new Date(o.scheduled_at || o.created_at).toLocaleDateString('fr-FR'), colX.date, y);
        doc.text(`#${o.reference || String(o.id).slice(0, 8).toUpperCase()}`, colX.ref, y);
        doc.text((o.pickup_city || "—").toString().slice(0, 24), colX.from, y);
        doc.text((o.delivery_city || "—").toString().slice(0, 24), colX.to, y);
        doc.text(String(o.distance_km || 0), colX.km, y, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`${gain.toFixed(2)} €`, colX.amount, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        y += 22;
    });

    y += 30;
    doc.setFillColor(COLORS.slate900);
    doc.roundedRect(pageW - margin - 200, y, 200, 60, 10, 10, "F");
    doc.setTextColor(COLORS.white);
    doc.setFontSize(14);
    doc.text(`TOTAL HT: ${totalGain.toFixed(2)} €`, pageW - margin - 20, y + 35, { align: "right" });

    if (driver.returnBlob) return doc.output("blob");
    doc.save(`relevé-${details.full_name}-${period}.pdf`);
};

/**
 * Generates a simplified Driver Invoice
 */
export const generateDriverInvoicePdf = (driver: DriverInfo, orders: Order[], period: string, computePay: (o: Order) => number) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const margin = 40;
    const contentW = pageW - margin * 2;
    const totalGain = orders.reduce((sum, o) => sum + computePay(o), 0);
    const details = driver.details || {};

    // Header 
    doc.setFillColor(COLORS.slate900);
    doc.rect(0, 0, pageW, 140, "F");
    doc.setTextColor(COLORS.white);
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFillColor(COLORS.primary);
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");
    doc.setFontSize(10);
    doc.text("FACTURE PRESTATAIRE", pageW - margin - 185, 55);
    doc.setFontSize(14);
    doc.text(period.toUpperCase(), pageW - margin - 185, 75);
    
    let y = 180;
    doc.setTextColor(COLORS.slate900);
    doc.setFontSize(12);
    doc.text(`Prestataire: ${details.full_name || "Chauffeur"}`, margin, y);
    doc.text(`Siret: ${details.siret || "—"}`, margin, y + 20);
    
    y += 60;
    doc.setFillColor(COLORS.slate900);
    doc.rect(margin, y, contentW, 26, "F");
    doc.setTextColor(COLORS.white);
    doc.text("DESCRIPTION", margin + 10, y + 17);
    doc.text("TOTAL HT", pageW - margin - 10, y + 17, { align: "right" });

    y += 34;
    doc.setTextColor(COLORS.slate900);
    doc.text(`Prestations de transport - ${period}`, margin + 10, y);
    doc.text(`${totalGain.toFixed(2)} €`, pageW - margin - 10, y, { align: "right" });

    doc.save(`facture-chauffeur-${period}.pdf`);
};

/**
 * Legacy compatibility wrapper for individual invoices
 */
export const generateIndividualInvoicePdf = (order: Order, clientInfo: ClientInfo) => {
    generateOrderPDF(order, clientInfo);
};

// Aliases for camelCase support
export const generateOrderPdf = generateOrderPDF;
export const generateInvoicePdf = generateInvoicePDF;
export const downloadInvoicePdf = generateInvoicePDF;
export const downloadOrderPdf = generateOrderPDF;
