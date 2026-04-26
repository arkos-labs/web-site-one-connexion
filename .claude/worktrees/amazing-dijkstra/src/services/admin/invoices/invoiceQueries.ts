import { supabase } from '@/lib/supabase';
import { Invoice } from '@/lib/supabase';
import { sendEmail } from '../../emailService';
import { sendMessageToClient } from '../messaging/messagingQueries';

export const getAllInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            clients (
                id,
                company_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const getUnpaidInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            clients (
                id,
                company_name,
                email
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            clients (
                id,
                company_name,
                email
            )
        `)
        .eq('id', invoiceId)
        .single();

    if (error) throw error;
    return data as Invoice;
};

export const sendPaymentReminder = async (clientId: string, invoiceId: string) => {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) throw new Error("Facture introuvable");

    const clientEmail = (invoice as any).clients?.email;
    const invoiceRef = invoice.reference;

    const message = `Vous avez une facture impayée (${invoiceRef}) de ${invoice.amount_ttc}€. Merci de régulariser votre situation dans les plus brefs délais.`;
    await sendMessageToClient(clientId, message, 'Relance facture impayée');

    if (clientEmail) {
        await sendEmail({
            to: clientEmail,
            subject: `Relance : Facture impayée ${invoiceRef}`,
            html: `
                <h1>Relance de paiement</h1>
                <p>Bonjour,</p>
                <p>Sauf erreur de notre part, la facture <strong>${invoiceRef}</strong> d'un montant de <strong>${invoice.amount_ttc}€</strong> est toujours en attente de règlement.</p>
                <p>Nous vous remercions de bien vouloir procéder au paiement dès que possible.</p>
                <p>Cordialement,<br>L'équipe One Connexion</p>
            `,
            attachmentUrl: invoice.pdf_url
        });
    }
};

export const subscribeToInvoices = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-invoices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, callback)
        .subscribe();
};

export const getClientInvoices = async (clientId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const generateMonthlyInvoice = async (
    clientId: string,
    month: number,
    year: number
): Promise<Invoice> => {
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: orders } = await supabase
        .from('orders')
        .select('id, price')
        .eq('client_id', clientId)
        .eq('status', 'delivered')
        .lte('delivered_at', endDate)
        .is('invoice_id', null);

    if (!orders || orders.length === 0) {
        throw new Error('Aucune commande livrée et non facturée pour ce client');
    }

    const totalHT = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const tva = totalHT * 0.20;
    const totalTTC = totalHT + tva;

    const reference = `FAC-${year}${String(month).padStart(2, '0')}-${clientId.slice(0, 8)}`;

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
            reference,
            client_id: clientId,
            month,
            year,
            amount_ht: totalHT,
            amount_tva: tva,
            amount_ttc: totalTTC,
            status: 'pending',
            due_date: new Date(year, month, 15).toISOString(),
        })
        .select()
        .single();

    if (error) throw error;

    if (invoice && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        await supabase
            .from('orders')
            .update({ invoice_id: invoice.id })
            .in('id', orderIds);
    }

    return invoice as Invoice;
};

export const generateAllMonthlyInvoices = async (month: number, year: number) => {
    const { data: unpaidOrders, error: clientsError } = await supabase
        .from('orders')
        .select('client_id')
        .eq('status', 'delivered')
        .is('invoice_id', null);

    if (clientsError) throw clientsError;
    if (!unpaidOrders || unpaidOrders.length === 0) return { success: 0, total: 0 };

    const uniqueClientIds = [...new Set(unpaidOrders.map(o => o.client_id))];

    let generatedCount = 0;
    for (const clientId of uniqueClientIds) {
        const { data: existing } = await supabase
            .from('invoices')
            .select('id')
            .eq('client_id', clientId)
            .eq('month', month)
            .eq('year', year)
            .limit(1);

        if (!existing || existing.length === 0) {
            try {
                if (clientId) {
                    await generateMonthlyInvoice(clientId as string, month, year);
                    generatedCount++;
                }
            } catch (e) {
                console.error(`Erreur génération facture pour ${clientId}:`, e);
            }
        }
    }

    return { success: generatedCount, total: uniqueClientIds.length };
};

export const markInvoiceAsPaid = async (invoiceId: string) => {
    const { data: invoice, error } = await supabase
        .from('invoices')
        .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select(`
            *,
            clients (
                id,
                company_name,
                email
            )
        `)
        .single();

    if (error) throw error;

    if (invoice) {
        const clientEmail = (invoice.clients as any)?.email;
        const clientId = invoice.client_id;
        const invoiceRef = invoice.reference;

        await sendMessageToClient(
            clientId,
            `Votre facture ${invoiceRef} a bien été réglée. Merci de votre confiance.`,
            'Confirmation de paiement'
        );

        if (clientEmail) {
            await sendEmail({
                to: clientEmail,
                subject: `Paiement reçu : Facture ${invoiceRef}`,
                html: `
                    <h1>Paiement confirmé</h1>
                    <p>Bonjour,</p>
                    <p>Nous vous confirmons la bonne réception du paiement pour la facture <strong>${invoiceRef}</strong>.</p>
                    <p>Vous pouvez télécharger votre facture acquittée depuis votre espace client.</p>
                    <p>Cordialement,<br>L'équipe One Connexion</p>
                `,
                attachmentUrl: invoice.pdf_url
            });
        }
    }
};

export const sendInvoiceByEmail = async (invoiceId: string) => {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) throw new Error("Facture introuvable");

    const clientEmail = (invoice as any).clients?.email;
    const invoiceRef = invoice.reference;

    if (clientEmail) {
        await sendEmail({
            to: clientEmail,
            subject: `Votre facture ${invoiceRef}`,
            html: `
                <h1>Votre facture est disponible</h1>
                <p>Bonjour,</p>
                <p>Veuillez trouver ci-joint votre facture <strong>${invoiceRef}</strong>.</p>
                <p>Cordialement,<br>L'équipe One Connexion</p>
            `,
            attachmentUrl: invoice.pdf_url
        });
    }
};
