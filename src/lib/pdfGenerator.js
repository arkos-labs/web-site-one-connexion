import { jsPDF } from "jspdf";

const COMPANY = {
    name: "One Connexion",
    siret: "000 000 000 00000",
    tva: "FR00 000000000",
    iban: "FR76 3000 4000 5000 6000 7000 890",
    address: "10 Rue de Paris, 75008 Paris",
    email: "contact@one-connexion.com",
};

/**
 * Generates a beautiful Order Form (Bon de Commande)
 * @param {Object} order The order data
 * @param {Object} client The client data/profile details
 */
export function generateOrderPdf(order, client = {}) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = 0;

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 140, "F");

    // Logo / Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, margin, 80);
    doc.text(`SIRET: ${COMPANY.siret} • TVA: ${COMPANY.tva}`, margin, 95);
    doc.text(COMPANY.email, margin, 110);

    // Document Title Badge
    doc.setFillColor(30, 41, 59); // slate-800 for consistency
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("BON DE COMMANDE", pageW - margin - 185, 55);

    doc.setFontSize(14); // Order Date or Status could go here if needed, but keeping # ID
    doc.text("COMMANDE EN COURS", pageW - margin - 185, 75);

    doc.setFontSize(11);
    const refBC = `N° BC-${String(order.id).slice(0, 8).toUpperCase()}`;
    const badgeW = doc.getTextWidth(refBC) + 20;
    doc.setFillColor(255, 255, 255, 0.1);
    doc.roundedRect(pageW - margin - 185 - 5, 83, badgeW, 20, 3, 3, "F");
    doc.setTextColor(249, 115, 22); // orange-500
    doc.text(refBC, pageW - margin - 185, 97);

    y = 180;

    // Info Grid (Two Columns)
    const drawSection = (title, x, yPos, w) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-400
        doc.text(title.toUpperCase(), x, yPos);

        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(x, yPos + 5, x + w, yPos + 5);
        return yPos + 25;
    };

    // Client Info (Left)
    let leftY = drawSection("Destinataire / Client", margin, y, contentW / 2 - 20);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    // LOGIC: If 'client' object is empty or minimal, try to parse guest info from order columns/notes
    const isGuest = !client.id && !order.client_id;
    const clientName = client.company || client.details?.company || client.name || client.details?.name || client.full_name || client.details?.full_name || order.pickup_name || "Client Invité";

    doc.text(clientName.toUpperCase(), margin, leftY);

    if (isGuest) {
        doc.setFontSize(8);
        doc.setTextColor(249, 115, 22); // Orange for guest tag
        doc.text("(COMPTE INVITÉ)", margin + doc.getTextWidth(clientName.toUpperCase()) + 5, leftY);
        doc.setTextColor(15, 23, 42); // Reset color
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let detailY = leftY + 15;

    const notesStr = order.notes || "";

    // Helper to get guest fields from regex or direct columns if they exist
    const gBillingMatch = notesStr.match(/Billing: (.*?) \| (.*?) \| (.*?)$/);
    const gBillingName = gBillingMatch?.[1];
    const gBillingCompany = gBillingMatch?.[2];
    const gBillingAddress = gBillingMatch?.[3];

    // Extract detailed fields from notes if they exist (common for both guest and client now)
    const nEntreprisePick = notesStr.match(/Entreprise Pick: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactPick = notesStr.match(/Contact Pick: (.*?)(\.|$|Phone|Email)/)?.[1]?.trim();
    const nPhonePick = notesStr.match(/Phone Pick: (.*?)(\.|$|Email)/)?.[1]?.trim();
    const nEmailEnlev = notesStr.match(/Email Enlev: (.*?)(\.|$|Entreprise|Contact|Instructions)/)?.[1]?.trim();

    const nEntrepriseDeliv = notesStr.match(/Entreprise Deliv: (.*?)(\.|$|Contact)/)?.[1]?.trim();
    const nContactDeliv = notesStr.match(/Contact Deliv: (.*?)(\.|$|Phone|Instructions)/)?.[1]?.trim();
    const nPhoneDeliv = notesStr.match(/Phone Deliv: (.*?)(\.|$|Instructions)/)?.[1]?.trim();

    const nInstructions = notesStr.match(/Instructions: (.*?)(\.|$)/)?.[1]?.trim();
    const [nPNote, nDNote] = nInstructions ? nInstructions.split('/').map(s => s.trim()) : [null, null];

    const gContact = order.pickup_contact || nContactPick || gBillingName || notesStr.match(/Contact: ([^/]+)/)?.[1]?.trim();
    const gEmail = order.pickup_email || nEmailEnlev || notesStr.match(/Email: ([^\s]+)/)?.[1];
    const gPhone = order.pickup_phone || notesStr.match(/Phone: ([\d\s]+)/)?.[1];

    const displayContact = client.contact || client.details?.contact || client.contact_person || client.details?.contact_person || client.full_name || client.details?.full_name || gContact;
    const displayEmail = client.email || client.details?.email || gEmail;
    const displayPhone = client.phone || client.details?.phone || client.phone_number || client.details?.phone_number || gPhone;
    const displayAddress = client.address || client.details?.address || client.billing_address || client.details?.billing_address || gBillingAddress || order.pickup_address; // Fallback to pickup

    if (displayContact) {
        doc.text(`Contact: ${displayContact}`, margin, detailY);
        detailY += 12;
    }
    if (gBillingCompany && gBillingCompany !== clientName) {
        doc.text(`Société: ${gBillingCompany}`, margin, detailY);
        detailY += 12;
    }
    if (displayEmail) {
        doc.text(`Email: ${displayEmail}`, margin, detailY);
        detailY += 12;
    }
    if (displayPhone) {
        doc.text(`Tél: ${displayPhone}`, margin, detailY);
        detailY += 12;
    }
    if (displayAddress) {
        // Simple word wrap for address
        const addrLines = doc.splitTextToSize(displayAddress, contentW / 2 - 30);
        doc.text(addrLines, margin, detailY);
        detailY += (12 * addrLines.length);
    }

    const zip = client.zip || client.details?.zip;
    const city = client.city || client.details?.city;
    const siret = client.siret || client.details?.siret;
    const tvaNum = client.tva || client.details?.tva;
    const ibanNum = client.iban || client.details?.iban;

    if (zip || city) {
        doc.text(`${zip || ""} ${city || ""}`, margin, detailY);
        detailY += 12;
    }
    if (siret) {
        doc.text(`SIRET: ${siret}`, margin, detailY);
        detailY += 12;
    }
    if (tvaNum) {
        doc.text(`TVA: ${tvaNum}`, margin, detailY);
        detailY += 12;
    }
    if (ibanNum) {
        doc.text(`IBAN: ${ibanNum}`, margin, detailY);
        detailY += 12;
    }

    leftY = detailY;

    // Order Info (Right)
    let rightY = drawSection("Détails Commande", margin + contentW / 2 + 20, y, contentW / 2 - 20);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Date:", margin + contentW / 2 + 20, rightY);
    doc.setFont("helvetica", "normal");
    const displayDate = order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : order.date || new Date().toLocaleDateString("fr-FR");
    doc.text(displayDate, margin + contentW / 2 + 100, rightY);

    doc.setFont("helvetica", "bold");
    doc.text("Véhicule:", margin + contentW / 2 + 20, rightY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(String(order.vehicle_type || order.vehicle || "—").toUpperCase(), margin + contentW / 2 + 100, rightY + 15);

    doc.setFont("helvetica", "bold");
    doc.text("Service:", margin + contentW / 2 + 20, rightY + 30);
    doc.setFont("helvetica", "normal");
    doc.text(String(order.service_level || order.service || "Normal").toUpperCase(), margin + contentW / 2 + 100, rightY + 30);



    y = Math.max(leftY, rightY + 60) + 30;

    // Extract instructions for itinerary if present (guest order format)
    const instructionsMatch = notesStr.match(/Instructions : (.*?) \/ (.*?)\./) || notesStr.match(/Instructions: (.*?) \/ (.*?)\./);
    const pInstruct = instructionsMatch?.[1] && instructionsMatch[1] !== "—" ? instructionsMatch[1] : null;
    const dInstruct = instructionsMatch?.[2] && instructionsMatch[2] !== "—" ? instructionsMatch[2] : null;

    // Itinerary Section
    y = drawSection("Itinéraire / Instructions", margin, y, contentW);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    // Pickup
    const pickupName = order.pickup_name || nEntreprisePick || nContactPick || "—";
    const pickupAddr = order.pickup_address || order.pickup || "—";
    const pCode = order.pickup_access_code || notesStr.match(/Code : ([\w\d]+)/)?.[1] || notesStr.match(/Code: ([\w\d]+)/)?.[1];
    const pEmail = nEmailEnlev;
    const pPhone = order.pickup_phone || nPhonePick || notesStr.match(/Phone: ([\d\s]+)/)?.[1];

    let pickupBoxH = 65;
    if (nPNote && nPNote !== "—") pickupBoxH += 15;
    if (pCode) pickupBoxH += 15;
    if (pEmail || pPhone) pickupBoxH += 15;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW, pickupBoxH, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.text("ENLÈVEMENT :", margin + 15, y + 20);
    doc.text(pickupName, margin + 120, y + 20);
    doc.setFont("helvetica", "normal");
    doc.text(pickupAddr, margin + 120, y + 35);

    let currentY = y + 50;

    if (pEmail || pPhone) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${pPhone || ""} ${pEmail ? "• " + pEmail : ""}`, margin + 120, currentY);
        currentY += 12;
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
    }

    if (pCode) {
        doc.setFont("helvetica", "bold");
        doc.text(`CODE ACCÈS : ${pCode}`, margin + 120, currentY);
        currentY += 15;
    }
    if (nPNote && nPNote !== "—") {
        doc.setFont("helvetica", "oblique");
        doc.setTextColor(100, 116, 139);
        doc.text(`Instructions : ${nPNote}`, margin + 120, currentY);
    }
    doc.setTextColor(15, 23, 42);

    y += pickupBoxH + 10;

    // Delivery
    const deliveryName = order.delivery_name || nEntrepriseDeliv || nContactDeliv || "—";
    const deliveryAddr = order.delivery_address || order.delivery || "—";
    const dCode = order.delivery_access_code || notesStr.match(/Code Deliv: ([\w\d]+)/)?.[1];
    const dPhone = order.delivery_phone || nPhoneDeliv;

    let deliveryBoxH = 65;
    if (nDNote && nDNote !== "—") deliveryBoxH += 15;
    if (dCode) deliveryBoxH += 15;
    if (dPhone) deliveryBoxH += 15;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW, deliveryBoxH, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.text("LIVRAISON :", margin + 15, y + 20);
    doc.text(deliveryName, margin + 120, y + 20);
    doc.setFont("helvetica", "normal");
    doc.text(deliveryAddr, margin + 120, y + 35);

    currentY = y + 50;

    if (dPhone) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tél: ${dPhone}`, margin + 120, currentY);
        currentY += 12;
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
    }

    if (dCode) {
        doc.setFont("helvetica", "bold");
        doc.text(`CODE ACCÈS : ${dCode}`, margin + 120, currentY);
        currentY += 15;
    }
    if (nDNote && nDNote !== "—") {
        doc.setFont("helvetica", "oblique");
        doc.setTextColor(100, 116, 139);
        doc.text(`Instructions : ${nDNote}`, margin + 120, currentY);
    }
    doc.setTextColor(15, 23, 42);

    y += deliveryBoxH + 25;

    // Package Info Section
    y = drawSection("Informations Colis", margin, y, contentW);

    const pType = order.package_type || notesStr.split(" - ")?.[0] || order.packageType || "—";
    const pWeight = order.weight || notesStr.match(/Poids: ([\d\w\s]+)/)?.[1] || "—";
    const pDims = order.package_description || notesStr.match(/Dimensions: ([^.]+)/)?.[1] || notesStr.match(/Dims: ([\d\w\sx]+)/)?.[1] || "—";

    const drawInfoBox = (label, value, xPos, width) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, y, width, 40, 5, 5, "F");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.text(label.toUpperCase(), xPos + 10, y + 15);
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), xPos + 10, y + 30);
    };

    const boxW = (contentW - 20) / 3;
    drawInfoBox("Nature", pType, margin, boxW);
    drawInfoBox("Poids", String(pWeight).includes("kg") ? String(pWeight) : `${pWeight} kg`, margin + boxW + 10, boxW);
    drawInfoBox("Description", pDims, margin + (boxW + 10) * 2, boxW);

    y += 60;

    // Clean displayNotes (remove internal guest metadata & technical chunks)
    let displayNotes = notesStr
        .replace(/Guest Order\.\s?/g, "")
        .replace(/Entreprise Pick:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Entreprise Deliv:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Contact Pick:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Contact Deliv:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Email Enlev:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Phone Pick:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Phone Deliv:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Instructions:.*?(?=\.|$)\.?\s?/g, "")
        .replace(/Contact:.*?\)\.\s?/g, "")
        .replace(/Instructions :.*?\.\s?/g, "")
        .replace(/Email:.*?\.\s?/g, "")
        .replace(/Phone:.*?\.\s?/g, "")
        .replace(/Billing:.*$/g, "")
        .replace(/Poids:.*$/g, "")
        .replace(/Dims:.*$/g, "")
        .replace(/Dimensions:.*$/g, "")
        .trim();

    if (displayNotes && displayNotes !== "—" && displayNotes !== "/" && displayNotes.length > 2) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("NOTES COMPLÉMENTAIRES:", margin, y);

        y += 10;
        const cleanNotesLines = doc.splitTextToSize(displayNotes, contentW - 30);
        const notesBoxH = Math.max(30, cleanNotesLines.length * 15 + 15);

        doc.setFillColor(241, 245, 249); // light blue/gray
        doc.roundedRect(margin, y, contentW, notesBoxH, 5, 5, "F");
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(cleanNotesLines, margin + 15, y + 18);
        y += notesBoxH + 30;
    } else {
        y += 10;
    }

    // Footer (Summary with Tax Breakdown)
    y = Math.max(y, pageH - 220); // Move footer towards bottom

    const priceHT = typeof order.price === "number" ? order.price : parseFloat(order.price || order.price_ht || 0);
    const tva = priceHT * 0.2;
    const priceTTC = priceHT + tva;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(margin, y, contentW, 100, 10, 10, "F");

    doc.setTextColor(100, 116, 139); // slate-400
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("Total HT", margin + 20, y + 30);
    doc.text(`${priceHT.toFixed(2)}€`, pageW - margin - 30, y + 30, { align: "right" });

    doc.text("TVA (20%)", margin + 20, y + 50);
    doc.text(`${tva.toFixed(2)}€`, pageW - margin - 30, y + 50, { align: "right" });

    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin + 10, y + 65, contentW - 20, 30, 5, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL TTC", margin + 30, y + 85);
    doc.text(`${priceTTC.toFixed(2)}€`, pageW - margin - 40, y + 85, { align: "right" });

    // Final Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("One Connexion SAS • Tous droits réservés • Ce document n'est pas une facture.", margin, pageH - margin);

    doc.save(`bon-commande-${String(order.id).slice(0, 8)}.pdf`);
}

/**
 * Generates a beautiful Invoice (Facture)
 * @param {Object} invoice The invoice data
 * @param {Array} orders List of orders included in the invoice
 * @param {Object} client The client data
 */
export function generateInvoicePdf(invoice, orders = [], client = {}) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = 0;

    // Header Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 140, "F");

    // Logo / Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, margin, 80);
    doc.text(`SIRET: ${COMPANY.siret} • TVA: ${COMPANY.tva}`, margin, 95);
    doc.text(COMPANY.email, margin, 110);

    // Document Title Badge
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FACTURE CLIENT", pageW - margin - 185, 55);

    doc.setFontSize(14);
    doc.text(String(invoice.period || "MENSUELLE").toUpperCase(), pageW - margin - 185, 75);

    doc.setFontSize(11);
    const refFC = `N° FAC-${String(invoice.id).slice(0, 8).toUpperCase()}`;
    const badgeW = doc.getTextWidth(refFC) + 20;
    doc.setFillColor(255, 255, 255, 0.1);
    doc.roundedRect(pageW - margin - 185 - 5, 83, badgeW, 20, 3, 3, "F");
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(refFC, pageW - margin - 185, 97);

    y = 180;

    // Grid
    const drawSection = (title, x, yPos, w) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(title.toUpperCase(), x, yPos);
        doc.setDrawColor(226, 232, 240);
        doc.line(x, yPos + 5, x + w, yPos + 5);
        return yPos + 25;
    };

    // Client Info
    let leftY = drawSection("Client / Facturé à", margin, y, contentW / 2 - 20);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    // LOGIC: Detect if guest
    const firstOrder = orders[0] || {};
    const isGuest = !client.id && !client.company && !client.full_name;
    // Fallback name from first order if client profile is empty
    const clientName = client.company || client.details?.company || client.name || client.details?.name || client.full_name || client.details?.full_name || firstOrder.pickup_name || "Client Invité";

    doc.text(clientName.toUpperCase(), margin, leftY);
    if (isGuest) {
        doc.setFontSize(8);
        doc.setTextColor(249, 115, 22);
        doc.text("(COMPTE INVITÉ)", margin + doc.getTextWidth(clientName.toUpperCase()) + 5, leftY);
        doc.setTextColor(15, 23, 42);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let detailY = leftY + 15;

    // Parse billing from notes of first order
    const billingMatch = firstOrder.notes?.match(/Billing: (.*?) \| (.*?) \| (.*?)$/);
    const gBillingName = billingMatch?.[1];
    const gBillingCompany = billingMatch?.[2];
    const gBillingAddress = billingMatch?.[3];
    const gEmail = firstOrder.pickup_email || firstOrder.notes?.match(/Email: ([^\s]+)/)?.[1];
    const gPhone = firstOrder.pickup_phone || firstOrder.notes?.match(/Phone: ([\d\s]+)/)?.[1];

    const displayContact = client.contact || client.details?.contact || client.contact_person || client.details?.contact_person || client.full_name || client.details?.full_name || gBillingName || firstOrder.pickup_contact;
    const displayEmail = client.email || client.details?.email || gEmail;
    const displayPhone = client.phone || client.details?.phone || client.phone_number || client.details?.phone_number || gPhone;
    const displayAddress = client.address || client.details?.address || client.billing_address || client.details?.billing_address || gBillingAddress || firstOrder.pickup_address;

    if (displayContact) {
        doc.text(`Contact: ${displayContact}`, margin, detailY);
        detailY += 12;
    }
    if (gBillingCompany && gBillingCompany !== clientName) {
        doc.text(`Société: ${gBillingCompany}`, margin, detailY);
        detailY += 12;
    }
    if (displayEmail) {
        doc.text(`Email: ${displayEmail}`, margin, detailY);
        detailY += 12;
    }
    if (displayPhone) {
        doc.text(`Tél: ${displayPhone}`, margin, detailY);
        detailY += 12;
    }
    if (displayAddress) {
        const addrLines = doc.splitTextToSize(displayAddress, contentW / 2 - 30);
        doc.text(addrLines, margin, detailY);
        detailY += 12 * addrLines.length;
    }

    const zip = client.zip || client.details?.zip;
    const city = client.city || client.details?.city;
    const siret = client.siret || client.details?.siret;
    const tvaNum = client.tva || client.details?.tva;
    const ibanNum = client.iban || client.details?.iban;

    if (zip || city) {
        doc.text(`${zip || ""} ${city || ""}`, margin, detailY);
        detailY += 12;
    }
    if (siret) {
        doc.text(`SIRET: ${siret}`, margin, detailY);
        detailY += 12;
    }
    if (tvaNum) {
        doc.text(`TVA: ${tvaNum}`, margin, detailY);
        detailY += 12;
    }
    if (ibanNum) {
        doc.text(`IBAN: ${ibanNum}`, margin, detailY);
        detailY += 12;
    }

    leftY = detailY;

    // Invoice Details
    let rightY = drawSection("Détails Facturation", margin + contentW / 2 + 20, y, contentW / 2 - 20);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Période:", margin + contentW / 2 + 20, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.period || "—", margin + contentW / 2 + 100, rightY);

    doc.setFont("helvetica", "bold");
    doc.text("Date émission:", margin + contentW / 2 + 20, rightY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(invoice.created_at || Date.now()).toLocaleDateString(), margin + contentW / 2 + 100, rightY + 15);

    doc.setFont("helvetica", "bold");
    doc.text("Échéance:", margin + contentW / 2 + 20, rightY + 30);
    doc.setFont("helvetica", "normal");
    // Default to +30 days if not specified
    const dueDate = invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    doc.text(dueDate, margin + contentW / 2 + 100, rightY + 30);

    y = Math.max(leftY + 40, rightY + 60);

    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentW, 25, "F");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("COMMANDE", margin + 10, y + 16);
    doc.text("DATE", margin + 100, y + 16);
    doc.text("TRAJET / DESCRIPTION", margin + 180, y + 16);
    doc.text("MONTANT HT", pageW - margin - 80, y + 16);

    y += 35;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");

    // Items
    orders.forEach((o, i) => {
        if (y > pageH - 120) {
            doc.addPage();
            y = 40;
        }
        const price = typeof o.total === "number" ? o.total : parseFloat(o.total || o.price_ht || 0);
        doc.text(`#${String(o.id).slice(0, 8).toUpperCase()}`, margin + 10, y);

        // Fix: Use created_at if date is missing
        const orderDate =
            o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"));
        doc.text(orderDate, margin + 100, y);

        const route = o.route || (o.pickup_city && o.delivery_city ? `${o.pickup_city} > ${o.delivery_city}` : "—");
        doc.text(route, margin + 180, y);
        doc.text(`${price.toFixed(2)}€`, pageW - margin - 50, y, { align: "right" });

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 5, pageW - margin, y + 5);
        y += 20;
    });

    y += 20;

    y += 20;

    // Totals Calculation (Dynamic based on provided orders)
    const totalHT = orders.reduce((sum, o) => {
        const price = typeof o.total === "number" ? o.total : parseFloat(o.total || o.price_ht || 0);
        return sum + price;
    }, 0);

    const tva = totalHT * 0.2;
    const totalTTC = totalHT + tva;

    const drawTotal = (label, value, isBold = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(isBold ? 12 : 10);
        doc.text(label, pageW - margin - 200, y);
        doc.text(`${value.toFixed(2)}€`, pageW - margin - 10, y, { align: "right" });
        y += 20;
    };

    drawTotal("Total HT", totalHT);
    drawTotal("TVA (20%)", tva);

    y += 5;
    doc.setFillColor(15, 23, 42);
    doc.rect(pageW - margin - 210, y - 15, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    drawTotal("TOTAL TTC", totalTTC, true);

    // IBAN Info
    y += 40;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("COORDONNÉES BANCAIRES POUR RÈGLEMENT:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`IBAN: ${COMPANY.iban}`, margin, y + 15);
    doc.text("Merci de préciser le numéro de facture dans l'objet du virement.", margin, y + 30);

    if (invoice.returnBlob) {
        return doc.output("blob");
    }

    doc.save(`facture-${String(invoice.id).slice(0, 8)}.pdf`);
}

/**
 * Generates a professional Driver Statement (Relevé Chauffeur)
 * @param {Object} driver The driver data (profile + details)
 * @param {Array} orders List of orders for the period
 * @param {String} period Label for the month/period
 * @param {Function} computePay Function to compute pay for an order
 */
export function generateDriverStatementPdf(driver, orders = [], period = "—", computePay) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 40;
    const contentW = pageW - margin * 2;
    let y = 0;

    const details = driver.details || {};

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 140, "F");

    // Logo / Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(COMPANY.name.toUpperCase(), margin, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, margin, 80);
    doc.text(`Email: ${COMPANY.email}`, margin, 95);

    // Document Title
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageW - margin - 220, 35, 220, 75, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("RELEVÉ MENSUEL DÉTAILLÉ", pageW - margin - 205, 55);

    doc.setFontSize(14);
    doc.text(period.toUpperCase(), pageW - margin - 205, 75);

    doc.setFontSize(9);
    const refRL = `RÉF : RL-${String(driver.id).slice(0, 4).toUpperCase()}-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    const badgeW = doc.getTextWidth(refRL) + 16;
    doc.setFillColor(255, 255, 255, 0.05);
    doc.roundedRect(pageW - margin - 205 - 4, 84, badgeW, 14, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(refRL, pageW - margin - 205, 94);

    y = 180;

    // Info Grid
    const drawDivider = (x, yPos, w) => {
        doc.setDrawColor(226, 232, 240);
        doc.line(x, yPos, x + w, yPos);
    };

    // Driver Info (Left Column)
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTATAIRE / CHAUFFEUR", margin, y);
    drawDivider(margin, y + 5, contentW / 2 - 20);

    y += 25;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(details.full_name || "Chauffeur", margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tél: ${details.phone_number || "—"}`, margin, y + 15);
    doc.text(`Email: ${details.email || driver.email || "—"}`, margin, y + 27);
    doc.text(`Adresse: ${details.address || "—"}`, margin, y + 39);

    // Company & Vehicle (Right Column)
    let rightColX = margin + contentW / 2 + 20;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("SOCIÉTÉ & VÉHICULE", rightColX, y - 25);
    drawDivider(rightColX, y - 20, contentW / 2 - 20);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`Société: ${details.company || "Indépendant"}`, rightColX, y);
    doc.text(`SIRET: ${details.siret || "—"}`, rightColX, y + 12);
    doc.text(`Véhicule: ${details.vehicle_model || "—"} (${details.vehicle_plate || "N/A"})`, rightColX, y + 24);
    doc.text(`Type: ${details.vehicle_type || "—"}`, rightColX, y + 36);

    // Bank Details (Bottom of info section)
    y += 60;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS BANCAIRES", margin, y);
    drawDivider(margin, y + 5, contentW);

    y += 20;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`IBAN: ${details.iban || "—"}`, margin, y);
    doc.text(`BIC: ${details.bic || "—"}`, margin + 250, y);

    y += 40;

    // Missions Table
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(margin, y, contentW, 25, "F");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DATE", margin + 10, y + 16);
    doc.text("MISSION ID", margin + 80, y + 16);
    doc.text("TRAJET", margin + 160, y + 16);
    doc.text("ENLÈV.", margin + 350, y + 16);
    doc.text("LIVR.", margin + 400, y + 16);
    doc.text("MONTANT HT", pageW - margin - 10, y + 16, { align: "right" });

    y += 35;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let totalGain = 0;
    orders.forEach((o) => {
        if (y > pageH - 80) {
            doc.addPage();
            y = 40;
        }
        const gain = computePay(o);
        totalGain += gain;

        const dateStr = o.scheduled_at
            ? new Date(o.scheduled_at).toLocaleDateString()
            : o.created_at
                ? new Date(o.created_at).toLocaleDateString()
                : "—";
        doc.text(dateStr, margin + 10, y);
        doc.text(`#${String(o.id).slice(0, 8).toUpperCase()}`, margin + 80, y);

        const route = `${o.pickup_city || ""} > ${o.delivery_city || ""}`.slice(0, 35);
        doc.text(route, margin + 160, y);

        const pTime = o.picked_up_at ? new Date(o.picked_up_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
        const dTime =
            o.status === "delivered" && o.updated_at
                ? new Date(o.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "—";

        doc.text(pTime, margin + 350, y);
        doc.text(dTime, margin + 400, y);

        doc.setFont("helvetica", "bold");
        doc.text(`${gain.toFixed(2)} €`, pageW - margin - 10, y, { align: "right" });
        doc.setFont("helvetica", "normal");

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 5, pageW - margin, y + 5);
        y += 20;
    });

    // Summary Box
    y += 30;
    if (y > pageH - 150) {
        doc.addPage();
        y = 50;
    }

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageW - margin - 200, y, 200, 80, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("NOMBRE DE COURSES :", pageW - margin - 180, y + 25);
    doc.text(String(orders.length), pageW - margin - 20, y + 25, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL NET À PAYER", pageW - margin - 180, y + 50);

    doc.setFontSize(20);
    doc.text(`${totalGain.toFixed(2)} €`, pageW - margin - 20, y + 75, { align: "right" });

    // Legal Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const footerY = pageH - 40;
    doc.text(
        `Généré par One Connexion le ${new Date().toLocaleDateString()} - Relevé d'auto-liquidation pour le compte du prestataire.`,
        margin,
        footerY
    );

    if (driver.returnBlob) {
        return doc.output("blob");
    }

    doc.save(`listing-chauffeur-${details.full_name?.replace(/\s+/g, "-") || "relevé"}-${period.replace(/\s+/g, "-")}.pdf`);
}

/**
 * Generates a simplified Driver Invoice (Facture sans détails)
 */
export function generateDriverInvoicePdf(driver, orders = [], period = "—", computePay) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 60;
    const contentW = pageW - margin * 2;
    let y = 0;

    const details = driver.details || {};
    const totalGain = orders.reduce((sum, o) => sum + computePay(o), 0);

    // Header Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 160, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(COMPANY.name.toUpperCase(), margin, 70);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY.address, margin, 90);
    doc.text(`SIRET: ${COMPANY.siret}`, margin, 105);
    doc.text(`Email: ${COMPANY.email}`, margin, 120);

    // Box Header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageW - margin - 200, 35, 200, 75, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FACTURE PRESTATAIRE", pageW - margin - 185, 55);

    doc.setFontSize(14);
    doc.text(period.toUpperCase(), pageW - margin - 185, 75);

    doc.setFontSize(11);
    const refFP = `N° FP-${String(driver.id).slice(0, 4).toUpperCase()}-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
    ).padStart(2, "0")}`;
    const badgeW = doc.getTextWidth(refFP) + 20;
    doc.setFillColor(255, 255, 255, 0.1);
    doc.roundedRect(pageW - margin - 185 - 5, 83, badgeW, 20, 3, 3, "F");
    doc.setTextColor(249, 115, 22); // orange-500 for the REF number
    doc.text(refFP, pageW - margin - 185, 97);

    y = 220;

    // Col 1: Driver Identity
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURE À :", margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5, margin + contentW / 2 - 20, y + 5);

    y += 25;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(details.full_name || "Chauffeur", margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tél: ${details.phone_number || "—"}`, margin, y + 15);
    doc.text(`Email: ${details.email || driver.email || "—"}`, margin, y + 27);
    doc.text(`Adresse: ${details.address || "—"}`, margin, y + 39);

    // Col 2: Company & Vehicle
    let col2X = margin + contentW / 2 + 20;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("SOCIÉTÉ & VÉHICULE :", col2X, y - 25);
    doc.line(col2X, y - 20, col2X + contentW / 2 - 20, y - 20);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`Société: ${details.company || "Indépendant"}`, col2X, y);
    doc.text(`SIRET: ${details.siret || "—"}`, col2X, y + 12);
    doc.text(`Véhicule: ${details.vehicle_model || "—"}`, col2X, y + 24);
    doc.text(`Immat: ${details.vehicle_plate || "—"} (${details.vehicle_type || "—"})`, col2X, y + 36);

    y += 75;

    // Bank info row
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS POUR LE RÈGLEMENT :", margin, y);
    doc.line(margin, y + 5, margin + contentW, y + 5);

    y += 20;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`IBAN: ${details.iban || "—"}`, margin, y);
    doc.text(`BIC: ${details.bic || "—"}`, margin + 250, y);

    y += 40;

    // Body
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageW - margin, y);
    y += 40;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION DES SERVICES", margin, y);
    doc.text("MONTANT HT", pageW - margin, y, { align: "right" });

    y += 30;
    doc.setFont("helvetica", "normal");
    doc.text(`Prestations de transport de colis - Période: ${period}`, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${totalGain.toFixed(2)} €`, pageW - margin, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`(${orders.length} missions effectuées sur la période)`, margin, y + 15);

    y += 100;

    // Totals Box
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageW - margin - 200, y, 200, 100, 10, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("TOTAL NET À PAYER", pageW - margin - 180, y + 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`${totalGain.toFixed(2)} €`, pageW - margin - 20, y + 80, { align: "right" });

    // Footer
    const footerY = pageH - 60;
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TVA non applicable, art. 293 B du CGI (si applicable au statut auto-entrepreneur).", margin, footerY);
    doc.text("Facture générée automatiquement via la plateforme One Connexion.", margin, footerY + 12);

    doc.save(`facture-chauffeur-${details.full_name?.replace(/\s+/g, "-") || "facture"}-${period.replace(/\s+/g, "-")}.pdf`);
}
