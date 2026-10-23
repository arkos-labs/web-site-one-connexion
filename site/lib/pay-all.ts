/**
 * lib/pay-all.ts (serveur)
 * « Tout régler » : le client paie en une fois toutes ses factures en attente.
 *  1. dueInvoices() relit chez Stripe les factures à régler du client (Stripe fait foi pour le montant) ;
 *  2. la route /api/invoices/pay-all ouvre une page de paiement Stripe avec une ligne par course ;
 *  3. au paiement, le webhook appelle settlePayAll() : chaque facture est marquée payée (« hors Stripe »,
 *     l'argent est sur le paiement groupé) et la base est mise à jour. Le reçu est celui de Stripe.
 */
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

// Factures que le client peut régler lui-même. Les courses « à débiter » (prélèvement programmé à
// J+30) et les prélèvements en cours sont exclus : ils seraient payés deux fois.
const UNPAID_ORDER = ['a_regler', 'echec', 'en_retard', 'virement_attendu'];
const UNPAID_INVOICE = ['prete', 'emise', 'echec'];

/** Limite Stripe : 100 lignes par page de paiement. */
export const MAX_LINES = 100;

export type DueLine = { description: string; amount: number }; // montant TTC en centimes
export type DueInvoice = { id: string; number: string | null; amount: number; created: number; lines: DueLine[] };

/** Factures Stripe ouvertes du client, de la plus ancienne à la plus récente. */
export async function dueInvoices(admin: SupabaseClient, stripe: Stripe, userId: string): Promise<DueInvoice[]> {
  const [orders, invoices] = await Promise.all([
    admin.from('orders').select('stripe_invoice_id').eq('user_id', userId).in('billing_status', UNPAID_ORDER).not('stripe_invoice_id', 'is', null),
    admin.from('invoices').select('stripe_invoice_id').eq('client_id', userId).in('status', UNPAID_INVOICE).not('stripe_invoice_id', 'is', null),
  ]);
  if (orders.error) throw new Error(orders.error.message);
  if (invoices.error) throw new Error(invoices.error.message);

  const ids = [...new Set([...(orders.data ?? []), ...(invoices.data ?? [])].map((r) => r.stripe_invoice_id as string))];
  const found: (Stripe.Invoice | null)[] = await Promise.all(
    ids.map((id) => stripe.invoices.retrieve(id).then((inv): Stripe.Invoice => inv).catch(() => null))
  );

  return found
    .filter((inv): inv is Stripe.Invoice =>
      !!inv && inv.status === 'open' && inv.collection_method === 'send_invoice' && inv.currency === 'eur' && inv.amount_remaining > 0)
    .map((inv) => {
      const lines = inv.lines.data.map((l) => ({ description: l.description || `Facture ${inv.number ?? ''}`.trim(), amount: l.amount }));
      const complete = !inv.lines.has_more && lines.length > 0 && lines.every((l) => l.amount > 0)
        && lines.reduce((s, l) => s + l.amount, 0) === inv.amount_remaining;
      return {
        id: inv.id!,
        number: inv.number,
        amount: inv.amount_remaining,
        created: inv.created,
        // Facture déjà en partie réglée (virement partiel…) : une seule ligne avec le reste à payer.
        lines: complete ? lines : [{ description: `Facture ${inv.number ?? ''} - reste à payer`.replace('  ', ' '), amount: inv.amount_remaining }],
      };
    })
    .sort((a, b) => a.created - b.created);
}

/** Les plus anciennes factures qui tiennent dans une seule page de paiement (100 lignes). */
export function fitInOnePayment(due: DueInvoice[]): { batch: DueInvoice[]; left: number } {
  const batch: DueInvoice[] = [];
  let lines = 0;
  for (const inv of due) {
    if (lines + inv.lines.length > MAX_LINES) break;
    batch.push(inv);
    lines += inv.lines.length;
  }
  return { batch, left: due.length - batch.length };
}

/** Factures payées et montant attendu pour chacune, rangés dans les métadonnées Stripe (500 caractères par clé). */
export function encodeBatch(batch: DueInvoice[]): Record<string, string> {
  const out: Record<string, string> = {};
  let key = 0;
  for (const inv of batch) {
    const entry = `${inv.id}:${inv.amount}`;
    const k = `inv_${key}`;
    if (out[k] && out[k].length + entry.length + 1 > 500) key++;
    const cur = out[`inv_${key}`];
    out[`inv_${key}`] = cur ? `${cur},${entry}` : entry;
  }
  return out;
}

function decodeBatch(metadata: Stripe.Metadata): { id: string; amount: number }[] {
  return Object.keys(metadata)
    .filter((k) => /^inv_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
    .flatMap((k) => metadata[k].split(','))
    .map((e) => {
      const [id, amount] = e.split(':');
      return { id, amount: Number(amount) };
    })
    .filter((e) => /^in_/.test(e.id) && Number.isFinite(e.amount));
}

/**
 * Paiement groupé reçu (webhook checkout.session.completed). Rejouable sans risque : Stripe peut renvoyer
 * l'événement, chaque facture garde l'identifiant du paiement qui l'a réglée.
 * Une facture réglée autrement entre-temps (virement…) est remboursée au client sur ce paiement.
 */
export async function settlePayAll(admin: SupabaseClient, stripe: Stripe, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  if (!userId || !paymentIntentId) throw new Error('Paiement groupé sans client ou sans paiement');

  const settled: string[] = [];
  let refunded = 0;
  const refund = async (invoiceId: string, amount: number) => {
    if (amount <= 0) return;
    await stripe.refunds.create(
      { payment_intent: paymentIntentId, amount, metadata: { invoice_id: invoiceId, reason: 'deja_reglee' } },
      { idempotencyKey: `pay-all-refund-${session.id}-${invoiceId}` }
    );
    refunded += amount;
  };

  for (const { id, amount } of decodeBatch(session.metadata ?? {})) {
    let inv = await stripe.invoices.retrieve(id);
    const ours = inv.metadata?.paid_by_session === session.id;

    if (inv.status === 'open') {
      if (!ours) inv = await stripe.invoices.update(id, { metadata: { ...inv.metadata, paid_by_session: session.id } });
      const remaining = inv.amount_remaining;
      try {
        await stripe.invoices.pay(id, { paid_out_of_band: true });
      } catch (err) {
        // Réglée par un autre moyen à l'instant même : on rembourse ce qu'elle représentait.
        const again = await stripe.invoices.retrieve(id);
        if (again.status !== 'paid') throw err;
        await refund(id, amount);
        continue;
      }
      settled.push(id);
      // Reste à payer plus bas que prévu (acompte reçu entre-temps) : la différence est rendue.
      await refund(id, amount - remaining);
    } else if (inv.status === 'paid' && ours) {
      settled.push(id); // déjà traitée lors d'un envoi précédent du même événement
    } else {
      await refund(id, amount); // payée ailleurs ou annulée : rien à encaisser pour elle
    }
  }

  if (settled.length) {
    const now = new Date().toISOString();
    const [o, i] = await Promise.all([
      admin.from('orders').update({ billing_status: 'paye', paid_at: now }).eq('user_id', userId).in('stripe_invoice_id', settled).neq('billing_status', 'paye'),
      admin.from('invoices').update({ status: 'payee', payment_date: now.slice(0, 10) }).eq('client_id', userId).in('stripe_invoice_id', settled).neq('status', 'payee'),
    ]);
    if (o.error) throw new Error(o.error.message);
    if (i.error) throw new Error(i.error.message);
  }

  // Pas de reçu envoyé par le site : Stripe envoie le sien (une ligne par course) après le paiement.
  return { settled: settled.length, refunded };
}
