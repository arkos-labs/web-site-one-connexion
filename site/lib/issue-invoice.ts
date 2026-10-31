import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { vatRateId } from '@/lib/stripe-vat';
import { INVOICE_FOOTER, invoiceCustomFields, upsertStripeCustomer } from '@/lib/invoice-info';

const parisDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export type IssueResult = { invoice: string; ok: boolean; skipped?: boolean; detail?: string };

// Statuts d'une facture : en_cours (courses qui s'ajoutent) → emission (création Stripe) → prete (validée
// sur Stripe, visible par l'admin, pas encore envoyée) → envoi → emise (envoyée, à régler) → payee.
// retenue : bloquée par l'admin, rien ne part.

// Prépare via Stripe une facture interne ouverte ('en_cours') : facture validée, échéance à 30 jours,
// paiement par carte ou virement (IBAN Stripe, rapproché automatiquement), sans l'envoyer. Idempotent : la
// facture est "réservée" avant l'appel Stripe, donc deux déclenchements simultanés ne créent qu'une facture.
export async function issueInternalInvoice(
  supabase: SupabaseClient,
  stripe: Stripe,
  invoiceId: string,
  // Facture refaite après annulation : clés Stripe neuves, sinon Stripe renverrait la facture annulée.
  attempt = ''
): Promise<IssueResult> {
  const { data: claimed } = await supabase
    .from('invoices')
    .update({ status: 'emission' })
    .eq('id', invoiceId)
    .eq('status', 'en_cours')
    .gt('total_amount', 0)
    .select('id, client_id, invoice_number, total_amount')
    .maybeSingle();
  if (!claimed) return { invoice: invoiceId, ok: true, skipped: true, detail: 'déjà émise ou rien à facturer' };

  const release = () => supabase.from('invoices').update({ status: 'en_cours' }).eq('id', invoiceId);

  try {
    const { data: rawItems } = await supabase
      .from('invoice_items')
      .select('id, order_id, description, total_price')
      .eq('invoice_id', invoiceId);

    // Garde-fou anti double paiement : une course déjà réglée via Stripe (mode de paiement
    // enregistré) ou celle d'un particulier (qui paie par carte avant la prise en charge) ne
    // doit jamais être facturée ici. Ces lignes sont retirées avant émission.
    const orderIds = (rawItems ?? []).map((i) => i.order_id).filter(Boolean);
    const { data: linked } = orderIds.length
      ? await supabase.from('orders').select('id, payment_mode, client_type').in('id', orderIds)
      : { data: [] as { id: string; payment_mode: string | null; client_type: string | null }[] };
    const excluded = new Set(
      (linked ?? []).filter((o) => o.payment_mode || o.client_type === 'particulier').map((o) => o.id)
    );
    const dropped = (rawItems ?? []).filter((i) => excluded.has(i.order_id));
    const items = (rawItems ?? []).filter((i) => !excluded.has(i.order_id));

    if (dropped.length) {
      await supabase.from('invoice_items').delete().in('id', dropped.map((i) => i.id));
      // Prix des courses TTC (TVA 20 % comprise) : HT = TTC / 1,20.
      const ttc = Math.round(items.reduce((s, i) => s + Number(i.total_price), 0) * 100) / 100;
      const sub = Math.round((ttc / 1.2) * 100) / 100;
      await supabase.from('invoices').update({ subtotal: sub, tax_amount: Math.round((ttc - sub) * 100) / 100, total_amount: ttc }).eq('id', invoiceId);
      claimed.total_amount = ttc;
    }
    if (!items.length) {
      // Plus rien à facturer : on supprime la facture vide.
      await supabase.from('invoices').delete().eq('id', invoiceId);
      return { invoice: claimed.invoice_number, ok: true, skipped: true, detail: 'courses déjà payées ou particulier, rien à facturer' };
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id, company_name, contact_name, contact_email, stripe_customer_id, siret, tax_id, billing_address, billing_postal_code, billing_city')
      .eq('id', claimed.client_id)
      .single();
    if (!client) throw new Error('Client introuvable');

    let email = client.contact_email as string | null;
    if (!email) {
      const { data } = await supabase.auth.admin.getUserById(client.id);
      email = data.user?.email ?? '';
    }
    if (!email) throw new Error('Aucun email pour ce client');

    // Coordonnées du client sur la facture : société, adresse, n° de TVA (SIRET en champ personnalisé).
    const party = {
      name: client.company_name || client.contact_name || '',
      email,
      address: client.billing_address,
      postalCode: client.billing_postal_code,
      city: client.billing_city,
      vat: client.tax_id,
      siret: client.siret,
    };
    const customerId = await upsertStripeCustomer(stripe, party, client.stripe_customer_id as string | null, `customer-${client.id}`);
    if (customerId !== client.stripe_customer_id) {
      await supabase.from('clients').update({ stripe_customer_id: customerId }).eq('id', client.id);
    }

    // Date de livraison de chaque course sur la ligne de facture.
    const { data: deliveries } = await supabase.from('orders').select('id, delivered_at').in('id', items.map((i) => i.order_id).filter(Boolean));
    const deliveredOn = new Map((deliveries ?? []).map((d) => [d.id as string, d.delivered_at as string | null]));
    // Date de la facture : la dernière livraison facturée, même si la facture part plus tard.
    const lastDelivery = (deliveries ?? []).reduce<Date | null>((max, d) => {
      const at = d.delivered_at ? new Date(d.delivered_at as string) : null;
      return at && (!max || at > max) ? at : max;
    }, null);
    const issuedOn = lastDelivery && lastDelivery < new Date() ? lastDelivery : new Date();
    const describe = (i: { order_id: string | null; description: string }) => {
      const at = i.order_id ? deliveredOn.get(i.order_id) : null;
      return at ? `${i.description} - livrée le ${new Date(at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}` : i.description;
    };

    const taxRate = await vatRateId(stripe);
    const base: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      auto_advance: false,
      effective_at: Math.floor(issuedOn.getTime() / 1000),
      pending_invoice_items_behavior: 'exclude',
      currency: 'eur',
      default_tax_rates: taxRate ? [taxRate] : undefined,
      description: items.map((i) => i.description).join(' · ').slice(0, 300),
      custom_fields: invoiceCustomFields(claimed.invoice_number, party),
      footer: INVOICE_FOOTER,
      metadata: { invoice_id: claimed.id, invoice_number: claimed.invoice_number, invoice_ids: claimed.id },
    };

    // Carte + virement (IBAN dédié au client, rapprochement automatique par Stripe). Si le virement
    // n'est pas activé dans le dashboard Stripe, on émet quand même la facture, payable par carte.
    let draft: Stripe.Invoice;
    try {
      draft = await stripe.invoices.create(
        {
          ...base,
          payment_settings: {
            payment_method_types: ['card', 'customer_balance'],
            payment_method_options: {
              customer_balance: {
                funding_type: 'bank_transfer',
                bank_transfer: { type: 'eu_bank_transfer', eu_bank_transfer: { country: 'FR' } },
              },
            },
          },
        },
        { idempotencyKey: `invoice-${claimed.id}${attempt}-bt` }
      );
    } catch (err: any) {
      if (!String(err?.message).includes('customer_balance')) throw err;
      draft = await stripe.invoices.create(base, { idempotencyKey: `invoice-${claimed.id}${attempt}-card` });
    }

    for (const item of items) {
      await stripe.invoiceItems.create(
        {
          customer: customerId,
          invoice: draft.id,
          currency: 'eur',
          amount: Math.round(Number(item.total_price) * 100),
          description: describe(item),
        },
        { idempotencyKey: `item-${item.id}${attempt}` }
      );
    }

    // Validée sur Stripe (numéro, PDF, lien de paiement) mais pas encore envoyée : l'admin la voit dans
    // la fiche client, et l'envoi part le lendemain matin (sendPreparedInvoices) s'il ne l'a pas bloquée.
    const finalized = await stripe.invoices.finalizeInvoice(draft.id!, { auto_advance: false });

    await supabase
      .from('invoices')
      .update({
        status: 'prete',
        stripe_invoice_id: finalized.id,
        hosted_invoice_url: finalized.hosted_invoice_url,
        pdf_url: finalized.invoice_pdf,
        invoice_date: parisDate(issuedOn),
        due_date: parisDate(new Date(Date.now() + 30 * 86400000)),
      })
      .eq('id', claimed.id);

    const expected = Math.round(Number(claimed.total_amount) * 100);
    return {
      invoice: claimed.invoice_number,
      ok: true,
      detail: Math.abs((finalized.total ?? 0) - expected) <= 1 ? undefined : `Total Stripe ${finalized.total} ≠ attendu ${expected} (centimes)`,
    };
  } catch (err: any) {
    console.error('Issue invoice error', claimed.invoice_number, err);
    await release();
    return { invoice: claimed.invoice_number, ok: false, detail: err.message };
  }
}

// Temps laissé à l'admin pour relire une facture préparée avant qu'elle parte.
const REVIEW_DELAY_MS = 6 * 3600 * 1000;

// Envoie au client (e-mail Stripe) une facture préparée depuis au moins 6 h : l'admin a eu le temps de la
// relire. Une facture plus récente attend le passage suivant (chaque jour à 9 h).
export async function sendPreparedInvoice(
  supabase: SupabaseClient,
  stripe: Stripe,
  invoiceId: string
): Promise<IssueResult> {
  const { data: claimed } = await supabase
    .from('invoices')
    .update({ status: 'envoi' })
    .eq('id', invoiceId)
    .eq('status', 'prete')
    .select('id, invoice_number, stripe_invoice_id')
    .maybeSingle();
  if (!claimed) return { invoice: invoiceId, ok: true, skipped: true, detail: 'pas prête ou bloquée' };
  const back = (status: string) => supabase.from('invoices').update({ status }).eq('id', invoiceId);

  try {
    const invoice = await stripe.invoices.retrieve(claimed.stripe_invoice_id);
    const finalizedAt = invoice.status_transitions?.finalized_at;
    if (finalizedAt && Date.now() - finalizedAt * 1000 < REVIEW_DELAY_MS) {
      await back('prete');
      return { invoice: claimed.invoice_number, ok: true, skipped: true, detail: 'préparée il y a moins de 6 h, envoi au prochain passage' };
    }
    if (invoice.status === 'paid') {
      await back('payee');
      return { invoice: claimed.invoice_number, ok: true, skipped: true, detail: 'déjà payée' };
    }
    await stripe.invoices.sendInvoice(invoice.id!);
    // Échéance : 30 jours après l'envoi de la facture au client.
    await supabase
      .from('invoices')
      .update({ status: 'emise', due_date: parisDate(new Date(Date.now() + 30 * 86400000)) })
      .eq('id', invoiceId);

    const { data: items } = await supabase.from('invoice_items').select('order_id').eq('invoice_id', invoiceId);
    const orderIds = (items ?? []).map((i) => i.order_id).filter(Boolean);
    if (orderIds.length) {
      await supabase.from('orders').update({ invoice_sent_at: new Date().toISOString() }).in('id', orderIds).is('invoice_sent_at', null);
    }
    return { invoice: claimed.invoice_number, ok: true };
  } catch (err: any) {
    console.error('Send invoice error', claimed.invoice_number, err);
    await back('prete');
    return { invoice: claimed.invoice_number, ok: false, detail: err.message };
  }
}
