import { toast } from "sonner";

/**
 * Service de simulation d'envoi d'email.
 * Dans une application réelle, ceci appellerait une Edge Function Supabase ou une API tierce (Resend, SendGrid, etc.).
 */

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachmentUrl?: string;
}

export const sendEmail = async ({ to, subject, html, attachmentUrl }: EmailOptions): Promise<boolean> => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    console.group("📧 [MOCK EMAIL SERVICE]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html.substring(0, 50)}...`);
    if (attachmentUrl) console.log(`Attachment: ${attachmentUrl}`);
    console.groupEnd();

    // Simulation de succès
    return true;
};
