import jsPDF from 'jspdf';
import { Order } from '@/lib/supabase';

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  billingAddress?: string;
  billingCity?: string;
  billingZip?: string;
  firstName?: string;
  lastName?: string;
}

const drawBillingBlock = (
  doc: jsPDF, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  info: { 
    company?: string; 
    firstName?: string; 
    lastName?: string; 
    street?: string; 
    city?: string; 
    zip?: string; 
    email?: string;
    referenceLabel?: string;
    referenceValue?: string;
  }
) => {
  // Premium Billing Box Background
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(x, y, w, h, 8, 8, "F");
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.roundedRect(x, y, w, h, 8, 8, "D");
  
  // Orange accent bar
  doc.setFillColor(237, 85, 24); // Orange
  doc.rect(x, y + 5, 3, 22, "F");

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT À FACTURER", x + 12, y + 15);
  
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(8.5);
  
  let currentY = y + 32;

  // 1. Company Name
  if (info.company && info.company !== "—") {
    doc.setFont("helvetica", "bold");
    doc.text(info.company.toUpperCase(), x + 12, currentY);
    currentY += 13;
  }

  // 2. First Name & Last Name (Prénom & NOM)
  const fullName = `${info.firstName || ""} ${info.lastName || ""}`.trim() || info.firstName || info.lastName || "";
  if (fullName) {
    doc.setFont("helvetica", "bold");
    doc.text(fullName, x + 12, currentY);
    currentY += 13;
  }

  // 3. Street Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (info.street && info.street !== "—") {
    const splitAddr = doc.splitTextToSize(info.street, w - 24);
    doc.text(splitAddr, x + 12, currentY);
    currentY += (splitAddr.length * 10.5);
  }

  // 4. City & Postal Code (CP VILLE)
  if (info.zip || info.city) {
    const location = `${info.zip || ""} ${info.city || ""}`.trim().toUpperCase();
    doc.text(location, x + 12, currentY);
    currentY += 12;
  }

  // 5. Email
  if (info.email && info.email !== "—") {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(info.email.toLowerCase(), x + 12, currentY);
  }

  // 6. Reference (Footer of the box)
  if (info.referenceLabel && info.referenceValue) {
    doc.setTextColor(237, 85, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${info.referenceLabel} : ${info.referenceValue}`, x + 12, y + h - 12);
  }
};

const loadImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Coordonnées du logo dans le carré 1250x1250 (fond transparent/blanc)
      // Trouvé via analyse : x:73, y:446, w:1104, h:297
      const cropX = 73;
      const cropY = 446;
      const cropW = 1104;
      const cropH = 297;
      
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context error");
      
      // Dessiner uniquement la partie utile du logo
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(`Erreur de chargement: ${url}`);
    img.src = url;
  });
};

export const generateOrderPdf = async (order: Order, clientInfo: ClientInfo) => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 30;
    const contentW = pageW - margin * 2;

    // Calculs financiers
    const priceHT = Number(order.price_ht) || 0;
    const tva = priceHT * 0.20;
    const priceTTC = priceHT + tva;

    // --- Header Section ---
    await drawCompanyHeader(doc, margin);

    // Top Right: Billing Box (CLIENT À FACTURER)
    const billW = 210;
    const billH = 120; // Enough space for all 6-7 fields
    const billX = pageW - margin - billW;
    const billY = 25;
    
    // --- Billing info logic (prioritize CURRENT profile for BDCs) ---
    const getBestName = () => {
      // Prioritize PROFILE (clientInfo) if it's not a default email handle
      const profileName = clientInfo.name;
      const isEmailHandle = (name: string) => name && (name.includes('@') || /^[a-z0-9-]+-[0-9]{4}$/.test(name));
      
      if (profileName && profileName !== "Client" && !isEmailHandle(profileName)) {
        return profileName;
      }
      
      // Fallback to snapshot
      if (order.billing_name && order.billing_name !== "Client") return order.billing_name;
      
      const guestMatch = (order.notes || "").match(/\[GUEST\] ([^|]+)/);
      if (guestMatch) return guestMatch[1].trim();
      
      return profileName || "Client";
    };

    const getBestCompany = () => {
      const company = clientInfo.company || order.billing_company || "";
      return company && company !== "—" ? company : "";
    };

    const getBestAddress = () => {
      // Prioritize PROFILE (clientInfo) if it has a real address
      if (clientInfo.billingAddress && clientInfo.billingAddress !== "—" && clientInfo.billingAddress.trim() !== "") {
        return { 
          line: clientInfo.billingAddress, 
          city: `${clientInfo.billingZip || ""} ${clientInfo.billingCity || ""}`.trim() 
        };
      }

      // Fallback to SNAPSHOT from order
      if (order.billing_address && order.billing_address !== "—") {
        return { 
          line: order.billing_address, 
          city: `${order.billing_zip || ""} ${order.billing_city || ""}`.trim() 
        };
      }
      
      // Legacy guest order extraction
      const notes = order.notes || "";
      const gAddr = notes.match(/Address: ([^|]+)/)?.[1]?.trim();
      const gCity = notes.match(/City: ([^|]+)/)?.[1]?.trim();
      const gZip = notes.match(/Zip: ([^|]+)/)?.[1]?.trim();
      
      if (gAddr) {
        return { line: gAddr, city: `${gZip || ""} ${gCity || ""}`.trim() };
      }
      
      return { line: "", city: "" };
    };

    const companyName = getBestCompany();
    const contactName = getBestName();
    const email = clientInfo.email || order.sender_email || "—";
    const address = getBestAddress();
    
    const displayRef = ((): string => {
      const base = order.reference || order.id.slice(0, 8).toUpperCase();
      if (!isNaN(Number(base)) && Number(base) < 1000) {
        return `BC-${(Number(base) + 1000).toString()}`;
      }
      return `BC-${base}`;
    })();

    // Split contact name for Prénom/Nom if possible
    const nameParts = contactName.split(' ');
    const firstName = clientInfo.firstName || (nameParts.length > 1 ? nameParts[0] : contactName);
    const lastName = clientInfo.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : "");

    const cityStr = clientInfo.billingCity || order.billing_city || address.city?.replace(/^[0-9\s]+/, '').trim() || "";
    const zipStr = clientInfo.billingZip || order.billing_zip || address.city?.match(/^[0-9]+/)?.[0] || "";

    drawBillingBlock(doc, billX, billY, billW, billH, {
      company: companyName,
      firstName,
      lastName,
      street: address.line,
      city: cityStr,
      zip: zipStr,
      email: email,
      referenceLabel: "BON DE COMMANDE",
      referenceValue: displayRef
    });

    // --- Black Header Bar ---
    const barY = 135;
    doc.setFillColor(15, 23, 42); // Dark Slate 900
    doc.roundedRect(margin, barY, contentW, 25, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`CONFIRMATION DE MISSION : DOSSIER N° ${displayRef}`, margin + 15, barY + 16);

    // --- Address Sections ---
    let adY = 175;
    const colW = (contentW - 15) / 2;

    const formatTime = (d: Date) => `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;

    // Left: Pickup (DÉPART)
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, adY, colW, 90, 8, 8, "F");
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(margin, adY, colW, 90, 8, 8, "D");
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("POINT DE DÉPART", margin + 12, adY + 15);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    const pDate = new Date(order.scheduled_at || order.created_at);
    doc.text(`${pDate.toLocaleDateString('fr-FR')} à ${formatTime(pDate)}`, margin + 12, adY + 28);
    
    doc.setDrawColor(237, 85, 24, 0.3);
    doc.line(margin + 12, adY + 35, margin + colW - 12, adY + 35);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    const pickupTitle = order.pickup_name || `COLIS : ${order.package_type?.toUpperCase() || "MARCHANDISE"}`;
    doc.text(pickupTitle, margin + 12, adY + 50);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate 600
    const pAddrLines = doc.splitTextToSize(order.pickup_address || "—", colW - 24);
    doc.text(pAddrLines, margin + 12, adY + 62, { lineHeightFactor: 1.2 });

    // Right: Delivery (ARRIVÉE)
    const rCol = margin + colW + 15;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(rCol, adY, colW, 90, 8, 8, "F");
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(rCol, adY, colW, 90, 8, 8, "D");
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATION", rCol + 12, adY + 15);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    const dDate = order.delivery_deadline ? new Date(order.delivery_deadline) : pDate;
    doc.text(`${dDate.toLocaleDateString('fr-FR')} à ${formatTime(dDate)}`, rCol + 12, adY + 28);
    
    doc.setDrawColor(237, 85, 24, 0.3);
    doc.line(rCol + 12, adY + 35, rCol + colW - 12, adY + 35);
    
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(order.delivery_name || "RÉCEPTIONNAIRE", rCol + 12, adY + 50);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const dAddrLines = doc.splitTextToSize(order.delivery_address || "—", colW - 24);
    doc.text(dAddrLines, rCol + 12, adY + 62, { lineHeightFactor: 1.2 });

    // --- Special Planning Notes (Below the two cards) ---
    let nextY = adY + 105;
    if (order.delivery_schedule_notes) {
      doc.setFillColor(254, 243, 232); // Light Orange background
      doc.roundedRect(margin, nextY, contentW, 25, 4, 4, "F");
      doc.setDrawColor(237, 85, 24);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, nextY, contentW, 25, 4, 4, "D");
      
      doc.setTextColor(237, 85, 24);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("NOTE SUR L'HORAIRE DE LIVRAISON / ENLÈVEMENT :", margin + 12, nextY + 11);
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      doc.text(order.delivery_schedule_notes, margin + 210, nextY + 11);
      
      nextY += 35;
    }

    // --- Services Table ---
    let tbY = nextY;
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(margin, tbY, contentW, 20, "F");
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTATION", margin + 10, tbY + 13);
    doc.text("DÉTAILS", margin + 130, tbY + 13);
    doc.text("Qté", margin + contentW - 110, tbY + 13, { align: "center" });
    doc.text("MONTANT HT", margin + contentW - 10, tbY + 13, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const rowY = tbY + 35;
    const formulaName = (order.formula || "EXPRESS").toUpperCase();
    doc.text(`TRANSPORT DE ${order.package_type?.toUpperCase() || "MARCHANDISE"}`, margin + 10, rowY);
    doc.text(`${formulaName} - ${order.vehicle_type?.toUpperCase() || "COURSIER"}`, margin + 130, rowY);
    doc.text("1,00", margin + contentW - 110, rowY, { align: "center" });
    doc.text(`${priceHT.toFixed(2)} €`, margin + contentW - 10, rowY, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY + 10, pageW - margin, rowY + 10);

    // --- Package Content Description Box ---
    const contentBoxY = rowY + 35;
    const contentBoxW = contentW - 175; // Space for Total Summary on the right
    const contentBoxH = 65;

    doc.setFillColor(252, 252, 252);
    doc.roundedRect(margin, contentBoxY, contentBoxW, contentBoxH, 6, 6, "F");
    doc.setDrawColor(241, 245, 249);
    doc.roundedRect(margin, contentBoxY, contentBoxW, contentBoxH, 6, 6, "D");
    
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION DE LA CONTENANCE DU COLIS", margin + 12, contentBoxY + 14);

    if (order.package_description) {
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const splitContent = doc.splitTextToSize(order.package_description, contentBoxW - 24);
      doc.text(splitContent, margin + 12, contentBoxY + 28, { lineHeightFactor: 1.3 });
    } else {
      doc.setTextColor(203, 213, 225); // Slate 300
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Aucun descriptif fourni", margin + 12, contentBoxY + 28);
    }

    // --- Price Summary ---
    const totX = pageW - margin - 160;
    const totY = rowY + 35;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(totX, totY, 160, 65, 6, 6, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(totX, totY, 160, 65, 6, 6, "D");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("PRIX TOTAL HT", totX + 10, totY + 15);
    doc.text("TVA (20%)", totX + 10, totY + 28);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`${priceHT.toFixed(2)} €`, pageW - margin - 10, totY + 15, { align: "right" });
    doc.text(`${tva.toFixed(2)} €`, pageW - margin - 10, totY + 28, { align: "right" });

    doc.setDrawColor(237, 85, 24, 0.5);
    doc.line(totX + 10, totY + 36, pageW - margin - 10, totY + 36);

    doc.setTextColor(237, 85, 24);
    doc.setFontSize(11);
    doc.text("TOTAL TTC", totX + 10, totY + 53);
    doc.text(`${priceTTC.toFixed(2)} €`, pageW - margin - 10, totY + 53, { align: "right" });

    // --- Footer Notes ---
    const ftY = pageH - 70;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, ftY, pageW - margin, ftY);
    
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(`E-Dossier généré numériquement · Signatures requises sur smartphone`, margin, ftY + 15);
    doc.text(`One Connexion - Spécialiste de la messagerie urgente et délicate.`, margin, ftY + 25);

    doc.save(`OC-${displayRef}.pdf`);
  } catch (err) {
    console.error("PDF Generate Error", err);
  }
};

const drawCompanyHeader = async (doc: jsPDF, margin: number) => {
  try {
    const logoData = await loadImageToBase64("/logos/one-connexion-dark.png");
    doc.addImage(logoData, 'PNG', margin, 12, 215, 58);
  } catch (e) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ONE CONNEXION", margin, 50);
  }

  // Company contact info in a clean column
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const infoLines = [
    "5 SQUARE NUNGESSER · 94160 SAINT-MANDÉ",
    "RCS CRÉTEIL 101 517 100 · SIRET 101 517 100 00018",
    "CAPITAL 3.000,00 € · contact@one-connexion.fr"
  ];
  doc.text(infoLines, margin, 85, { lineHeightFactor: 1.4 });
};

export const generateIndividualInvoicePdf = async (order: Order, client: any) => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const margin = 30;
    const contentW = pageW - margin * 2;

    await drawCompanyHeader(doc, margin);

    const priceHT = Number(order.price_ht) || 0;
    const tva = priceHT * 0.20;
    const priceTTC = priceHT + tva;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`FACTURE N° F-${order.reference || order.id.slice(0, 8).toUpperCase()}`, margin, 140);
    doc.setFontSize(10);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, margin, 160);

    const billW = 210;
    const billH = 115;
    const billX = pageW - margin - billW;
    const billY = 25;

    const details = client?.details || {};
    const contactName = details.full_name || details.contact_name || (client?.first_name ? `${client.first_name} ${client.last_name || ""}` : (client?.email?.split('@')[0] || "Client"));
    const nameParts = contactName.split(' ');

    const orderRef = order.reference || order.id.slice(0, 8).toUpperCase();

    drawBillingBlock(doc, billX, billY, billW, billH, {
      company: details.company || client?.company_name || order?.billing_company || "",
      firstName: client?.first_name || (nameParts.length > 1 ? nameParts[0] : contactName),
      lastName: client?.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ""),
      street: client?.address || details.address || details.billing_address || order?.billing_address || "",
      city: client?.city || details.city || details.billing_city || order?.billing_city || "",
      zip: client?.postal_code || details.zip || details.postal_code || order?.billing_zip || "",
      email: client?.email || details.email || order?.sender_email || "",
      referenceLabel: "FACTURE",
      referenceValue: `F-${orderRef}`
    });

    // Table
    doc.line(margin, 200, pageW - margin, 200);
    doc.setFont("helvetica", "bold");
    doc.text("MESSAGERIE EXPRESS", margin, 215);
    doc.text(`${order.reference || order.id.slice(0, 8).toUpperCase()}`, margin + 150, 215);
    doc.text(`${priceHT.toFixed(2)} €`, pageW - margin - 20, 215, { align: "right" });
    doc.line(margin, 225, pageW - margin, 225);

    // Totals
    const totY = 300;
    doc.text("TOTAL HT", pageW - margin - 150, totY);
    doc.text(`${priceHT.toFixed(2)} €`, pageW - margin - 20, totY, { align: "right" });
    doc.text("TVA 20%", pageW - margin - 150, totY + 20);
    doc.text(`${tva.toFixed(2)} €`, pageW - margin - 20, totY + 20, { align: "right" });
    doc.setFontSize(12);
    doc.text("NET À PAYER", pageW - margin - 150, totY + 45);
    doc.text(`${priceTTC.toFixed(2)} €`, pageW - margin - 20, totY + 45, { align: "right" });

    doc.save(`Facture-${order.reference || "001"}.pdf`);
  } catch (err) {
    console.error("Invoice Generate Error", err);
  }
};

export const generateInvoicePdf = async (invoice: any, orders: any[], clientInfo: any) => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = 595;
    const pageH = 842;
    const margin = 30;
    const contentW = pageW - margin * 2;

    await drawCompanyHeader(doc, margin);

    // Business Logic Calculations
    const totalHT = orders.reduce((sum, o) => sum + (Number(o.price_ht || o.total) || 0), 0);
    const tva = totalHT * 0.20;
    const totalTTC = totalHT + tva;

    const billW = 210;
    const billH = 115;
    const billX = pageW - margin - billW;
    const billY = 25;

    const info = {
      name: clientInfo?.name || clientInfo?.firstName || "",
      firstName: clientInfo?.firstName || "",
      lastName: clientInfo?.lastName || "",
      email: clientInfo?.email || "",
      company: clientInfo?.company || "",
      billingAddress: clientInfo?.billingAddress || "",
      billingCity: clientInfo?.billingCity || "",
      billingZip: clientInfo?.billingZip || ""
    };

    drawBillingBlock(doc, billX, billY, billW, billH, {
      company: info.company || invoice?.client_company || "",
      firstName: info.firstName,
      lastName: info.lastName,
      street: info.billingAddress,
      city: info.billingCity,
      zip: info.billingZip,
      email: info.email,
      referenceLabel: "FACTURE",
      referenceValue: `FAC-${invoice.id.slice(0, 8).toUpperCase()}`
    });

    // Main Black Title Bar
    const barY = 135;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, barY, contentW, 25, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`RELEVÉ DE FACTURATION · PÉRIODE : ${invoice.period || "MENSUELLE"}`, margin + 15, barY + 16);

    // Table Header
    let tbY = 175;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, tbY, contentW, 20, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text("DATE", margin + 10, tbY + 13);
    doc.text("RÉFÉRENCE", margin + 70, tbY + 13);
    doc.text("MÉTHODE / TRAJET", margin + 150, tbY + 13);
    doc.text("MONTANT HT", margin + contentW - 10, tbY + 13, { align: "right" });

    // Table Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    let currentY = tbY + 35;

    orders.forEach((o, idx) => {
      if (currentY > pageH - 100) {
        doc.addPage();
        currentY = 40;
      }
      
      const dateStr = o.date || new Date(o.created_at).toLocaleDateString('fr-FR');
      const refStr = o.id.slice(0, 8).toUpperCase();
      const routeStr = o.route || `${o.pickup_city || "?"} -> ${o.delivery_city || "?"}`;
      const amountHT = Number(o.price_ht || o.total || 0);

      doc.text(dateStr, margin + 10, currentY);
      doc.text(`#${refStr}`, margin + 70, currentY);
      doc.text(routeStr, margin + 150, currentY);
      doc.text(`${amountHT.toFixed(2)} €`, margin + contentW - 10, currentY, { align: "right" });

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 6, margin + contentW, currentY + 6);
      currentY += 18;
    });

    // Summary Totals
    const totW = 160;
    const totX = pageW - margin - totW;
    const summaryY = currentY + 20;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(totX, summaryY, totW, 70, 6, 6, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(totX, summaryY, totW, 70, 6, 6, "D");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("TOTAL HT", totX + 10, summaryY + 18);
    doc.text("TVA (20%)", totX + 10, summaryY + 32);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`${totalHT.toFixed(2)} €`, pageW - margin - 10, summaryY + 18, { align: "right" });
    doc.text(`${tva.toFixed(2)} €`, pageW - margin - 10, summaryY + 32, { align: "right" });

    doc.setDrawColor(237, 85, 24, 0.5);
    doc.line(totX + 10, summaryY + 40, pageW - margin - 10, summaryY + 40);

    doc.setTextColor(237, 85, 24);
    doc.setFontSize(11);
    doc.text("TOTAL TTC", totX + 10, summaryY + 58);
    doc.text(`${totalTTC.toFixed(2)} €`, pageW - margin - 10, summaryY + 58, { align: "right" });

    // Footer Info
    const ftY = pageH - 60;
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(`Une question sur cette facture ? Contactez notre service comptabilité : contact@one-connexion.fr`, margin, ftY);
    doc.text(`One Connexion · 5 Square Nungesser, 94160 Saint-Mandé`, margin, ftY + 10);

    doc.save(`Facture-FAC-${invoice.id.slice(0, 8)}.pdf`);
  } catch (err) {
    console.error("Batch Invoice Generate Error", err);
  }
};

export const generateDriverStatementPdf = (driver: any, orders: any[]) => {
  const doc = new jsPDF();
  doc.text("Relevé Driver", 20, 20);
  doc.save("releve.pdf");
};
