/**
 * lib/payment-receipt-email.ts
 * Reçu envoyé après « Tout régler » (API Resend) : une ligne par course, le total HT / TVA / TTC,
 * et le rappel que les factures sont réglées. Même habillage que l'e-mail « Votre facture ».
 */
import { EMAIL_LOGO_ATTACHMENT } from '@/lib/email-logo';
import { EMAIL, PHONE_DISPLAY, SITE_URL } from '@/lib/site-content';

export type PaymentReceiptInput = {
  to: string;
  name: string;
  paidAt: Date;
  method: string;
  lines: { description: string; amount: number }[]; // centimes TTC
  totalCents: number;
  invoiceCount: number;
  /** Factures réglées autrement entre-temps : montant rendu au client. */
  refundedCents: number;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = (c: number) => (c / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const day = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

export function paymentReceiptHtml(r: PaymentReceiptInput): string {
  // Prix TTC, TVA 20 % « dont ».
  const ht = Math.round(r.totalCents / 1.2);
  const plural = r.invoiceCount > 1;
  const rows = r.lines
    .map((l) => {
      // « Course OC-XXXX - Trajet - livrée le … » : la référence en gras, le détail en dessous.
      const [head, ...rest] = l.description.split(' - ');
      return `<tr><td style="padding:10px 12px;border-bottom:1px solid #E6E2DA;font-size:14px;line-height:1.4">
<strong>${esc(head)}</strong>${rest.length ? `<br><span style="font-size:12px;color:#6B6862">${esc(rest.join(' · '))}</span>` : ''}</td>
<td align="right" style="padding:10px 12px;border-bottom:1px solid #E6E2DA;font-size:14px;white-space:nowrap;vertical-align:top">${eur(l.amount)}</td></tr>`;
    })
    .join('');

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#0E0F10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#ffffff;padding:22px 28px;border-bottom:4px solid #ed5518">
<img src="cid:logo" width="150" height="43" alt="ONE CONNEXION" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 28px 8px">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ed5518;font-weight:700">Paiement reçu</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">Reçu de votre règlement</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6">Bonjour ${esc(r.name || '')},<br>nous avons bien reçu votre paiement. Merci de votre confiance.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;border-radius:8px"><tr>
<td style="padding:14px 18px;font-size:12px;color:#6B6862;text-transform:uppercase;letter-spacing:.06em">Montant payé<br><strong style="font-size:18px;color:#0E0F10;text-transform:none;letter-spacing:0;white-space:nowrap">${eur(r.totalCents)}</strong></td>
<td style="padding:14px 18px;font-size:12px;color:#6B6862;text-transform:uppercase;letter-spacing:.06em">Date<br><strong style="font-size:14px;color:#0E0F10;text-transform:none;letter-spacing:0">${day(r.paidAt)}</strong></td>
<td style="padding:14px 18px;font-size:12px;color:#6B6862;text-transform:uppercase;letter-spacing:.06em">Moyen<br><strong style="font-size:14px;color:#0E0F10;text-transform:none;letter-spacing:0">${esc(r.method)}</strong></td>
</tr></table>
<p style="margin:24px 0 8px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6B6862;font-weight:700">Détail · ${r.lines.length} ligne${r.lines.length > 1 ? 's' : ''}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E6E2DA;border-radius:8px;border-collapse:separate">
${rows}
<tr><td style="padding:8px 12px;font-size:13px;color:#6B6862">Total HT</td><td align="right" style="padding:8px 12px;font-size:13px;color:#6B6862">${eur(ht)}</td></tr>
<tr><td style="padding:0 12px 8px;font-size:13px;color:#6B6862">dont TVA 20 %</td><td align="right" style="padding:0 12px 8px;font-size:13px;color:#6B6862">${eur(r.totalCents - ht)}</td></tr>
<tr><td style="padding:10px 12px;font-size:15px;font-weight:700;border-top:1px solid #E6E2DA">Montant payé</td><td align="right" style="padding:10px 12px;font-size:15px;font-weight:700;border-top:1px solid #E6E2DA;white-space:nowrap">${eur(r.totalCents)}</td></tr>
</table>
<p style="margin:20px 0;padding:12px 14px;background:#FFF4EE;border-left:3px solid #ed5518;font-size:14px;line-height:1.6">
${r.invoiceCount} facture${plural ? 's' : ''} ${plural ? 'sont' : 'est'} maintenant <strong>réglée${plural ? 's' : ''}</strong>. Vous les retrouvez en PDF dans votre espace client, rubrique <a href="${SITE_URL}/dashboard/factures" style="color:#c94410">Vos factures</a>.
${r.refundedCents > 0 ? `<br>${eur(r.refundedCents)} vous ont été remboursés : une facture avait déjà été réglée entre-temps.` : ''}</p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:1.6;color:#4A4845;border-top:1px solid #eee">
Une question sur ce paiement ? Répondez à cet e-mail ou appelez-nous au ${esc(PHONE_DISPLAY)}.<br>
<a href="${SITE_URL}" style="color:#c94410">www.oneconnexion.com</a></td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendPaymentReceiptEmail(r: PaymentReceiptInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY manquante : reçu de paiement non envoyé.');
    return false;
  }
  const from = process.env.INVOICE_FROM ?? `ONE CONNEXION <${EMAIL}>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [r.to],
        reply_to: EMAIL,
        subject: `Reçu de paiement ONE CONNEXION - ${eur(r.totalCents)}`,
        html: paymentReceiptHtml(r),
        attachments: [EMAIL_LOGO_ATTACHMENT],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('Resend a refusé le reçu :', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Envoi du reçu échoué :', err);
    return false;
  }
}
