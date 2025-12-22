import jsPDF from 'jspdf';
import { Order, Invoice } from '@/lib/supabase';

interface ClientInfo {
    name: string;
    email: string;
    phone: string;
    company?: string;
}

export const generateOrderPDF = (order: Order, clientInfo: ClientInfo) => {
    const doc = new jsPDF();

    // Couleurs One Connexion
    const primaryBlue = '#0B2D55';
    const yellow = '#FFCC00';
    const black = '#0B0B0B';
    const lightGray = '#F2F6FA';

    // En-tête avec fond bleu
    doc.setFillColor(11, 45, 85); // #0B2D55
    doc.rect(0, 0, 210, 40, 'F');

    // Logo / Titre
    doc.setTextColor(255, 204, 0); // #FFCC00
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE CONNEXION', 105, 20, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Bon de commande', 105, 30, { align: 'center' });

    // Réinitialiser la couleur du texte
    doc.setTextColor(11, 11, 11); // #0B0B0B

    let yPos = 55;

    // Référence de la commande
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Référence: ${order.reference}`, 20, yPos);

    yPos += 15;

    // Informations client
    doc.setFillColor(242, 246, 250); // #F2F6FA
    doc.rect(15, yPos, 180, 35, 'F');

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations client', 20, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (clientInfo.company) {
        doc.text(`Société: ${clientInfo.company}`, 20, yPos);
        yPos += 5;
    }

    doc.text(`Nom: ${clientInfo.name}`, 20, yPos);
    yPos += 5;
    doc.text(`Email: ${clientInfo.email}`, 20, yPos);
    yPos += 5;
    doc.text(`Téléphone: ${clientInfo.phone}`, 20, yPos);
    yPos += 5;
    doc.text(`Code client: ${order.client_code}`, 20, yPos);

    yPos += 15;

    // Détails de la commande
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la commande', 20, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Date
    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.text(`Date de commande: ${formattedDate}`, 20, yPos);
    yPos += 7;

    doc.text(`Type de course: ${order.delivery_type}`, 20, yPos);
    yPos += 7;

    // Statut avec badge coloré
    doc.setFont('helvetica', 'bold');
    doc.text('Statut: ', 20, yPos);

    let statusText = '';
    let statusColor: [number, number, number] = [0, 0, 0];

    switch (order.status) {
        case 'pending_acceptance':
        case 'accepted':
            statusText = 'En attente';
            statusColor = [255, 193, 7]; // Orange
            break;
        case 'dispatched':
        case 'in_progress':
            statusText = 'En cours';
            statusColor = [33, 150, 243]; // Bleu
            break;
        case 'delivered':
            statusText = 'Livrée';
            statusColor = [76, 175, 80]; // Vert
            break;
        case 'cancelled':
            statusText = 'Annulée';
            statusColor = [244, 67, 54]; // Rouge
            break;
    }

    doc.setFillColor(...statusColor);
    const statusWidth = doc.getTextWidth(statusText) + 6;
    doc.roundedRect(40, yPos - 4, statusWidth, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(statusText, 43, yPos);
    doc.setTextColor(11, 11, 11);
    doc.setFont('helvetica', 'normal');

    yPos += 15;

    // Informations d'enlèvement
    doc.setFillColor(242, 246, 250); // #F2F6FA
    doc.rect(15, yPos, 180, 5, 'F');
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('📍 Informations d\'enlèvement', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Adresse de retrait
    const pickupLines = doc.splitTextToSize(order.pickup_address, 170);
    doc.text(pickupLines, 20, yPos);
    yPos += pickupLines.length * 5 + 3;

    // Contact enlèvement
    if (order.pickup_contact_name) {
        doc.setFont('helvetica', 'bold');
        doc.text('Contact: ', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(order.pickup_contact_name, 45, yPos);
        yPos += 5;
    }

    if (order.pickup_contact_phone) {
        doc.setFont('helvetica', 'bold');
        doc.text('Téléphone: ', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(order.pickup_contact_phone, 45, yPos);
        yPos += 5;
    }

    if (order.pickup_time) {
        const pickupDate = new Date(order.pickup_time);
        const formattedPickupTime = pickupDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.setFont('helvetica', 'bold');
        doc.text('Heure d\'enlèvement: ', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(formattedPickupTime, 60, yPos);
        yPos += 5;
    }

    if (order.pickup_instructions) {
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions: ', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const instructionLines = doc.splitTextToSize(order.pickup_instructions, 170);
        doc.text(instructionLines, 20, yPos);
        yPos += instructionLines.length * 5 + 3;
    }

    yPos += 5;

    // Informations de livraison
    doc.setFillColor(242, 246, 250); // #F2F6FA
    doc.rect(15, yPos, 180, 5, 'F');
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('📍 Informations de livraison', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Adresse de livraison
    const deliveryLines = doc.splitTextToSize(order.delivery_address, 170);
    doc.text(deliveryLines, 20, yPos);
    yPos += deliveryLines.length * 5 + 3;

    // Contact livraison
    if (order.delivery_contact_name) {
        doc.setFont('helvetica', 'bold');
        doc.text('Contact: ', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(order.delivery_contact_name, 45, yPos);
        yPos += 5;
    }

    if (order.delivery_contact_phone) {
        doc.setFont('helvetica', 'bold');
        doc.text('Téléphone: ', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(order.delivery_contact_phone, 45, yPos);
        yPos += 5;
    }

    if (order.delivery_instructions) {
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions: ', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const deliveryInstructionLines = doc.splitTextToSize(order.delivery_instructions, 170);
        doc.text(deliveryInstructionLines, 20, yPos);
        yPos += deliveryInstructionLines.length * 5 + 3;
    }

    yPos += 5;

    // Détails de la commande
    if (order.package_type || order.formula || order.notes) {
        doc.setFillColor(242, 246, 250); // #F2F6FA
        doc.rect(15, yPos, 180, 5, 'F');
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('📦 Détails de la commande', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (order.package_type) {
            doc.setFont('helvetica', 'bold');
            doc.text('Type de colis: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.package_type, 55, yPos);
            yPos += 5;
        }

        if (order.formula) {
            doc.setFont('helvetica', 'bold');
            doc.text('Formule: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.formula.toUpperCase(), 45, yPos);
            yPos += 5;
        }

        if (order.schedule_type) {
            doc.setFont('helvetica', 'bold');
            doc.text('Type: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.schedule_type === 'asap' ? 'Dès que possible' : 'Créneau planifié', 38, yPos);
            yPos += 5;
        }

        if (order.notes) {
            doc.setFont('helvetica', 'bold');
            doc.text('Notes complémentaires: ', 20, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            const notesLines = doc.splitTextToSize(order.notes, 170);
            doc.text(notesLines, 20, yPos);
            yPos += notesLines.length * 5 + 3;
        }

        yPos += 5;
    }

    // Informations de facturation (pour commandes sans compte)
    if (order.billing_company || order.billing_name) {
        doc.setFillColor(242, 246, 250); // #F2F6FA
        doc.rect(15, yPos, 180, 5, 'F');
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('💳 Informations de facturation', 20, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (order.billing_company) {
            doc.setFont('helvetica', 'bold');
            doc.text('Société: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.billing_company, 45, yPos);
            yPos += 5;
        }

        if (order.billing_siret) {
            doc.setFont('helvetica', 'bold');
            doc.text('SIRET: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.billing_siret, 40, yPos);
            yPos += 5;
        }

        if (order.billing_name) {
            doc.setFont('helvetica', 'bold');
            doc.text('Nom: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.billing_name, 35, yPos);
            yPos += 5;
        }

        if (order.sender_email) {
            doc.setFont('helvetica', 'bold');
            doc.text('Email: ', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(order.sender_email, 38, yPos);
            yPos += 5;
        }

        if (order.billing_address) {
            doc.setFont('helvetica', 'bold');
            doc.text('Adresse: ', 20, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            const billingAddressText = `${order.billing_address}${order.billing_zip && order.billing_city ? `, ${order.billing_zip} ${order.billing_city}` : ''}`;
            const billingLines = doc.splitTextToSize(billingAddressText, 170);
            doc.text(billingLines, 20, yPos);
            yPos += billingLines.length * 5 + 3;
        }

        yPos += 5;
    }

    // Prix
    doc.setFillColor(255, 204, 0); // #FFCC00
    doc.rect(15, yPos, 180, 15, 'F');

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 11, 11);
    doc.text('Prix total:', 20, yPos);
    doc.text(`${order.price.toFixed(2)} €`, 175, yPos, { align: 'right' });

    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('One Connexion - Service de livraison express', 105, pageHeight - 20, { align: 'center' });
    doc.text('www.oneconnexion.fr - contact@oneconnexion.fr', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, pageHeight - 10, { align: 'center' });

    // Télécharger le PDF
    doc.save(`bon-commande-${order.reference}.pdf`);
};

export const generateInvoicePDF = (invoice: Invoice, clientInfo: ClientInfo) => {
    const doc = new jsPDF();

    // Couleurs One Connexion
    const primaryBlue = '#0B2D55';
    const yellow = '#FFCC00';
    const black = '#0B0B0B';
    const lightGray = '#F2F6FA';

    // En-tête avec fond bleu
    doc.setFillColor(11, 45, 85); // #0B2D55
    doc.rect(0, 0, 210, 40, 'F');

    // Logo / Titre
    doc.setTextColor(255, 204, 0); // #FFCC00
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE CONNEXION', 105, 20, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Facture', 105, 30, { align: 'center' });

    // Réinitialiser la couleur du texte
    doc.setTextColor(11, 11, 11); // #0B0B0B

    let yPos = 55;

    // Référence de la facture
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Référence: ${invoice.reference}`, 20, yPos);

    yPos += 15;

    // Informations client
    doc.setFillColor(242, 246, 250); // #F2F6FA
    doc.rect(15, yPos, 180, 35, 'F');

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations client', 20, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (clientInfo.company) {
        doc.text(`Société: ${clientInfo.company}`, 20, yPos);
        yPos += 5;
    }

    doc.text(`Nom: ${clientInfo.name}`, 20, yPos);
    yPos += 5;
    doc.text(`Email: ${clientInfo.email}`, 20, yPos);
    yPos += 5;
    doc.text(`Téléphone: ${clientInfo.phone}`, 20, yPos);

    yPos += 15;

    // Détails de la facture
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails de la facture', 20, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Date
    const invoiceDate = new Date(invoice.created_at);
    const formattedDate = invoiceDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    doc.text(`Date de facturation: ${formattedDate}`, 20, yPos);
    yPos += 7;

    // Statut avec badge coloré
    doc.setFont('helvetica', 'bold');
    doc.text('Statut: ', 20, yPos);

    let statusText = '';
    let statusColor: [number, number, number] = [0, 0, 0];

    switch (invoice.status) {
        case 'pending':
            statusText = 'En attente';
            statusColor = [255, 193, 7]; // Orange
            break;
        case 'paid':
            statusText = 'Payée';
            statusColor = [76, 175, 80]; // Vert
            break;
        case 'overdue':
            statusText = 'En retard';
            statusColor = [244, 67, 54]; // Rouge
            break;
    }

    doc.setFillColor(...statusColor);
    const statusWidth = doc.getTextWidth(statusText) + 6;
    doc.roundedRect(40, yPos - 4, statusWidth, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(statusText, 43, yPos);
    doc.setTextColor(11, 11, 11);
    doc.setFont('helvetica', 'normal');

    yPos += 15;

    // Montant
    doc.setFillColor(255, 204, 0); // #FFCC00
    doc.rect(15, yPos, 180, 15, 'F');

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 11, 11);
    doc.text('Montant TTC:', 20, yPos);
    doc.text(`${invoice.amount_ttc.toFixed(2)} €`, 175, yPos, { align: 'right' });

    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('One Connexion - Service de livraison express', 105, pageHeight - 20, { align: 'center' });
    doc.text('www.oneconnexion.fr - contact@oneconnexion.fr', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, pageHeight - 10, { align: 'center' });

    // Télécharger le PDF
    doc.save(`facture-${invoice.reference}.pdf`);
};
