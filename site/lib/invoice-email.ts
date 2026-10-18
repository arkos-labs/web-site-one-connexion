/**
 * lib/invoice-email.ts
 * E-mail « Votre facture » envoyé au client à la livraison de sa course (API Resend).
 * Trois cas : déjà payée (facture acquittée), à régler avant une date, ou prélevée automatiquement.
 */
import { EMAIL_LOGO_ATTACHMENT } from '@/lib/email-logo';
import { EMAIL, PHONE_DISPLAY, SITE_URL } from '@/lib/site-content';

export type InvoiceEmailInput = {
  to: string;
  name: string;
  number: string;
  trackingCode: string;
  totalCents: number;
  /** paid = déjà payée · due = à régler avant dueDate · auto = prélèvement automatique à dueDate */
  state: 'paid' | 'due' | 'auto';
  dueDate?: Date | null;
  pdfUrl?: string | null;
  hostedUrl?: string | null;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = (c: number) => (c / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const day = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

export async function sendInvoiceEmail(i: InvoiceEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY manquante : e-mail de facture non envoyé.');
    return false;
  }
  const from = process.env.INVOICE_FROM ?? `ONE CONNEXION <${EMAIL}>`;

  const statusLine =
    i.state === 'paid'
      ? `<strong style="color:#1a7f37">Facture acquittée</strong> - votre paiement a bien été reçu, il ne vous reste rien à régler.`
      : i.state === 'auto'
        ? `Cette facture sera <strong>prélevée automatiquement le ${i.dueDate ? day(i.dueDate) : 'jour de l’échéance'}</strong> sur le moyen de paiement que vous avez enregistré. Aucune action n’est nécessaire.`
        : `Cette facture est à régler <strong>avant le ${i.dueDate ? day(i.dueDate) : 'jour de l’échéance'}</strong>, par carte ou par virement.`;

  const primary = i.state === 'due' ? i.hostedUrl : i.pdfUrl ?? i.hostedUrl;
  const primaryLabel = i.state === 'due' ? 'Voir et régler la facture' : 'Télécharger la facture (PDF)';

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#0E0F10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#ffffff;padding:22px 28px;border-bottom:4px solid #ed5518">
<img src="cid:logo" width="150" height="43" alt="ONE CONNEXION" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 28px 8px">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ed5518;font-weight:700">Course livrée</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">Votre facture est disponible</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6">Bonjour ${esc(i.name || '')},<br>votre course <strong>${esc(i.trackingCode)}</strong> a bien été livrée. Merci de votre confiance.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;border-radius:8px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.7">
Facture n° <strong>${esc(i.number)}</strong><br>Montant TTC : <strong style="font-size:18px">${eur(i.totalCents)}</strong></td></tr></table>
<p style="margin:18px 0;font-size:15px;line-height:1.6">${statusLine}</p>
${primary ? `<p style="margin:22px 0"><a href="${esc(primary)}" style="background:#ed5518;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:6px;display:inline-block">${primaryLabel}</a></p>` : ''}
${i.state !== 'due' && i.hostedUrl ? `<p style="margin:0 0 18px;font-size:13px"><a href="${esc(i.hostedUrl)}" style="color:#c94410">Consulter la facture en ligne</a></p>` : ''}
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:1.6;color:#4A4845;border-top:1px solid #eee">
Une question sur cette facture ? Répondez à cet e-mail ou appelez-nous au ${esc(PHONE_DISPLAY)}.<br>
<a href="${SITE_URL}" style="color:#c94410">www.oneconnexion.com</a></td></tr>
</table></td></tr></table></body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [i.to],
        reply_to: EMAIL,
        subject: `Votre facture ONE CONNEXION n° ${i.number}${i.state === 'paid' ? ' (acquittée)' : ''}`,
        html,
        attachments: [EMAIL_LOGO_ATTACHMENT],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('Resend a refusé la facture :', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Envoi de la facture échoué :', err);
    return false;
  }
}
