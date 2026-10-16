import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { vatRateId } from '@/lib/stripe-vat';

const parisDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

export type IssueResult = { invoice: string; ok: boolean; skipped?: boolean; detail?: string };

// Émet via Stripe une facture interne ouverte ('en_cours') : e-mail au client, échéance à 30 jours,
// paiement par carte ou virement (IBAN Stripe, rapproché automatiquement). Idempotent : la facture est
// "réservée" avant l'appel Stripe, donc deux déclenchements simultanés n'émettent qu'une facture.
export async function issueInternalInvoice(
  supabase: SupabaseClient,
  stripe: Stripe,
  invoiceId: string
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
    const { data: items } = await supabase
      .from('invoice_items')
      .select('id, order_id, description, total_price')
      .eq('invoice_id', invoiceId);
    if (!items?.length) {
      await release();
      return { invoice: claimed.invoice_number, ok: true, skipped: true, detail: 'aucune ligne' };
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id, company_name, contact_name, contact_email, stripe_customer_id')
      .eq('id', claimed.client_id)
      .single();
    if (!client) throw new Error('Client introuvable');

    let email = client.contact_email as string | null;
    if (!email) {
      const { data } = await supabase.auth.admin.getUserById(client.id);
      email = data.user?.email ?? '';
    }
    if (!email) throw new Error('Aucun email pour ce client');

    let customerId = client.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create(
        { email, name: client.company_name || client.contact_name || undefined, metadata: { client_id: client.id } },
        { idempotencyKey: `customer-${client.id}` }
      );
      customerId = customer.id;
      await supabase.from('clients').update({ stripe_customer_id: customerId }).eq('id', client.id);
    }

    const taxRate = await vatRateId(stripe);
    const base: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      auto_advance: false,
      pending_invoice_items_behavior: 'exclude',
      currency: 'eur',
      default_tax_rates: taxRate ? [taxRate] : undefined,
      description: items.map((i) => i.description).join(' · ').slice(0, 300),
      custom_fields: [{ name: 'Réf.', value: claimed.invoice_number }],
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
        { idempotencyKey: `invoice-${claimed.id}-bt` }
      );
    } catch (err: any) {
      if (!String(err?.message).includes('customer_balance')) throw err;
      draft = await stripe.invoices.create(base, { idempotencyKey: `invoice-${claimed.id}-card` });
    }

    for (const item of items) {
      await stripe.invoiceItems.create(
        {
          customer: customerId,
          invoice: draft.id,
          currency: 'eur',
          amount: Math.round(Number(item.total_price) * 100),
          description: item.description,
        },
        { idempotencyKey: `item-${item.id}` }
      );
    }

    const finalized = await stripe.invoices.finalizeInvoice(draft.id!, { auto_advance: false });
    await stripe.invoices.sendInvoice(draft.id!);

    const today = parisDate(new Date());
    await supabase
      .from('invoices')
      .update({
        status: 'emise',
        stripe_invoice_id: finalized.id,
        hosted_invoice_url: finalized.hosted_invoice_url,
        pdf_url: finalized.invoice_pdf,
        invoice_date: today,
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
