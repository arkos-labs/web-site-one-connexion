import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

async function vatRateId(): Promise<string> {
  const rates = await stripe.taxRates.list({ active: true, limit: 100 });
  const existing = rates.data.find((r) => r.percentage === 20 && !r.inclusive && r.country === 'FR');
  if (existing) return existing.id;
  const created = await stripe.taxRates.create({
    display_name: 'TVA',
    percentage: 20,
    inclusive: false,
    country: 'FR',
    jurisdiction: 'FR',
  });
  return created.id;
}

const parisDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

// Appelée le 1er de chaque mois : émet via Stripe les factures des mois écoulés (courses livrées).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const today = parisDate(new Date());
  const firstOfMonth = `${today.slice(0, 7)}-01`;

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, client_id, invoice_number, billing_period_start, total_amount')
    .eq('status', 'en_cours')
    .lt('billing_period_start', firstOfMonth)
    .gt('total_amount', 0);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const taxRate = (invoices ?? []).length ? await vatRateId() : null;
  const results: { invoice: string; ok: boolean; detail?: string }[] = [];

  for (const inv of invoices ?? []) {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id, company_name, contact_name, contact_email, stripe_customer_id')
        .eq('id', inv.client_id)
        .single();
      if (!client) throw new Error('Client introuvable');

      let email = client.contact_email;
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

      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      const hasCard = !!customer.invoice_settings?.default_payment_method;

      const { data: items } = await supabase
        .from('invoice_items')
        .select('id, description, total_price')
        .eq('invoice_id', inv.id);

      const monthLabel = new Date(inv.billing_period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      const draft = await stripe.invoices.create(
        {
          customer: customerId,
          collection_method: hasCard ? 'charge_automatically' : 'send_invoice',
          ...(hasCard ? {} : { days_until_due: 30 }),
          auto_advance: false,
          pending_invoice_items_behavior: 'exclude',
          currency: 'eur',
          default_tax_rates: taxRate ? [taxRate] : undefined,
          description: `Courses de ${monthLabel}`,
          custom_fields: [{ name: 'Réf.', value: inv.invoice_number }],
          metadata: { invoice_id: inv.id, invoice_number: inv.invoice_number },
        },
        { idempotencyKey: `invoice-${inv.id}` }
      );

      for (const item of items ?? []) {
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

      const finalized = await stripe.invoices.finalizeInvoice(draft.id, { auto_advance: hasCard });
      if (!hasCard) await stripe.invoices.sendInvoice(draft.id);

      const expected = Math.round(Number(inv.total_amount) * 100);
      await supabase
        .from('invoices')
        .update({
          status: 'emise',
          stripe_invoice_id: finalized.id,
          hosted_invoice_url: finalized.hosted_invoice_url,
          pdf_url: finalized.invoice_pdf,
          invoice_date: today,
          due_date: new Date(new Date(today).getTime() + 30 * 86400000).toISOString().slice(0, 10),
        })
        .eq('id', inv.id);

      results.push({
        invoice: inv.invoice_number,
        ok: true,
        detail: finalized.total === expected ? undefined : `Total Stripe ${finalized.total} ≠ attendu ${expected} (centimes)`,
      });
    } catch (err: any) {
      console.error('Monthly invoice error', inv.invoice_number, err);
      results.push({ invoice: inv.invoice_number, ok: false, detail: err.message });
    }
  }

  return Response.json({ processed: results.length, results });
}
