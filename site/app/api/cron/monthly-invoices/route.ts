import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { vatRateId } from '@/lib/stripe-vat';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const parisDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

type PendingInvoice = { id: string; client_id: string; invoice_number: string; billing_period_start: string; total_amount: number };

// Appelée le 1er de chaque mois : émet via Stripe les factures des mois écoulés (courses livrées).
// Un client reçoit UNE seule facture regroupant toutes ses courses pas encore facturées,
// même si elles s'étalent sur plusieurs mois.
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
    .gt('total_amount', 0)
    .order('billing_period_start');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const byClient = new Map<string, PendingInvoice[]>();
  for (const inv of (invoices ?? []) as PendingInvoice[]) {
    byClient.set(inv.client_id, [...(byClient.get(inv.client_id) ?? []), inv]);
  }

  const taxRate = byClient.size ? await vatRateId(stripe) : null;
  const results: { client: string; invoices: string[]; ok: boolean; detail?: string }[] = [];

  for (const [clientId, group] of byClient) {
    const numbers = group.map((inv) => inv.invoice_number);
    try {
      // Garde-fou anti double paiement : une course déjà réglée via Stripe (mode de paiement
      // enregistré, ou commande publique de particulier payée par carte à la commande) est
      // retirée de la facture mensuelle avant émission.
      const invoiceIds = group.map((inv) => inv.id);
      const { data: rawItems } = await supabase
        .from('invoice_items')
        .select('id, invoice_id, order_id, description, total_price')
        .in('invoice_id', invoiceIds);
      const orderIds = (rawItems ?? []).map((i) => i.order_id).filter(Boolean);
      const { data: linkedOrders } = orderIds.length
        ? await supabase.from('orders').select('id, payment_mode, source, client_type').in('id', orderIds)
        : { data: [] as { id: string; payment_mode: string | null; source: string | null; client_type: string | null }[] };
      const alreadyPaid = new Set(
        (linkedOrders ?? [])
          .filter((o) => o.payment_mode || (o.source === 'page_publique' && o.client_type === 'particulier'))
          .map((o) => o.id)
      );
      const paidItems = (rawItems ?? []).filter((i) => alreadyPaid.has(i.order_id));
      const items = (rawItems ?? []).filter((i) => !alreadyPaid.has(i.order_id));

      if (paidItems.length) {
        await supabase.from('invoice_items').delete().in('id', paidItems.map((i) => i.id));
        for (const inv of group) {
          const sub = Math.round(
            items.filter((i) => i.invoice_id === inv.id).reduce((s, i) => s + Number(i.total_price), 0) * 100
          ) / 100;
          const tax = Math.round(sub * 20) / 100;
          await supabase.from('invoices').update({ subtotal: sub, tax_amount: tax, total_amount: sub + tax }).eq('id', inv.id);
          inv.total_amount = sub + tax;
        }
      }
      if (!items.length) {
        results.push({ client: clientId, invoices: numbers, ok: true, detail: 'courses déjà payées via Stripe, rien à facturer' });
        continue;
      }

      const { data: client } = await supabase
        .from('clients')
        .select('id, company_name, contact_name, contact_email, stripe_customer_id')
        .eq('id', clientId)
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

      // Seuls les mois qui ont encore des courses à facturer entrent dans la facture.
      const billed = group.filter((inv) => items.some((i) => i.invoice_id === inv.id));
      const months = billed.map((inv) =>
        new Date(inv.billing_period_start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      );
      const primary = billed[billed.length - 1];

      const draft = await stripe.invoices.create(
        {
          customer: customerId,
          collection_method: hasCard ? 'charge_automatically' : 'send_invoice',
          ...(hasCard ? {} : { days_until_due: 30 }),
          auto_advance: false,
          pending_invoice_items_behavior: 'exclude',
          currency: 'eur',
          default_tax_rates: taxRate ? [taxRate] : undefined,
          description: `Courses de ${months.join(', ')}`,
          custom_fields: [{ name: 'Réf.', value: primary.invoice_number }],
          // invoice_ids : toutes les factures internes réglées par cette facture Stripe (lu par le webhook).
          metadata: {
            invoice_id: primary.id,
            invoice_number: primary.invoice_number,
            invoice_ids: billed.map((inv) => inv.id).join(','),
          },
        },
        { idempotencyKey: `invoice-${clientId}-${firstOfMonth}` }
      );

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

      const finalized = await stripe.invoices.finalizeInvoice(draft.id!, { auto_advance: hasCard });
      if (!hasCard) await stripe.invoices.sendInvoice(draft.id!);

      const emitted = {
        status: 'emise',
        hosted_invoice_url: finalized.hosted_invoice_url,
        pdf_url: finalized.invoice_pdf,
        invoice_date: today,
        due_date: new Date(new Date(today).getTime() + 30 * 86400000).toISOString().slice(0, 10),
      };
      // stripe_invoice_id est unique : il ne va que sur la facture principale, les autres
      // sont retrouvées par le webhook via metadata.invoice_ids.
      await supabase.from('invoices').update({ ...emitted, stripe_invoice_id: finalized.id }).eq('id', primary.id);
      const others = billed.filter((inv) => inv.id !== primary.id).map((inv) => inv.id);
      if (others.length) await supabase.from('invoices').update(emitted).in('id', others);

      const expected = Math.round(billed.reduce((s, inv) => s + Number(inv.total_amount), 0) * 100);
      results.push({
        client: clientId,
        invoices: billed.map((inv) => inv.invoice_number),
        ok: true,
        detail: Math.abs((finalized.total ?? 0) - expected) <= billed.length
          ? undefined
          : `Total Stripe ${finalized.total} ≠ attendu ${expected} (centimes)`,
      });
    } catch (err: any) {
      console.error('Monthly invoice error', numbers.join(', '), err);
      results.push({ client: clientId, invoices: numbers, ok: false, detail: err.message });
    }
  }

  return Response.json({ processed: results.length, results });
}
