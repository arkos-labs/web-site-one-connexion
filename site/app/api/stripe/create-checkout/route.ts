import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { calculatePrice, isServedAddress, ServiceLevel } from '@/lib/pricing';
import { vatRateId } from '@/lib/stripe-vat';
import { INVOICE_FOOTER, invoiceFooter, invoiceCustomFields, upsertStripeCustomer, type InvoiceParty } from '@/lib/invoice-info';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

// Pro qui paie par virement : facture Stripe envoyée tout de suite par email, avec un IBAN
// dédié au client et une échéance à J+30. Stripe rapproche le virement tout seul ;
// le webhook invoice.paid passe la commande en 'paye', le cron deferred-payments gère retard/annulation.
async function sendTransferInvoice(p: {
  orderId: string; email: string; companyName?: string; siret?: string;
  price: number; pickupAddress: string; dropoffAddress: string;
}) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // La commande doit exister, être récente et pas encore facturée (sinon n'importe qui
  // pourrait déclencher une facture sur la commande d'un autre).
  const { data: order } = await supabase
    .from('orders')
    .select('id, client_type, billing_status, created_at, contact_name, raison_sociale, adresse_facturation, siret, tva_number')
    .eq('tracking_code', p.orderId)
    .maybeSingle();
  if (!order || order.client_type !== 'entreprise' || order.billing_status
      || Date.now() - new Date(order.created_at).getTime() > 60 * 60 * 1000) {
    return NextResponse.json({ error: 'Commande introuvable ou déjà facturée.' }, { status: 400 });
  }

  // Coordonnées complètes du client (société, adresse, TVA, SIRET) pour que la facture soit conforme.
  const party: InvoiceParty = {
    name: p.companyName || order.raison_sociale || order.contact_name || '',
    email: p.email,
    address: order.adresse_facturation,
    vat: order.tva_number,
    siret: order.siret || p.siret,
  };
  const customer = { id: await upsertStripeCustomer(stripe, party) };

  let invoice: Stripe.Invoice;
  try {
    invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 30,
        auto_advance: true,
        pending_invoice_items_behavior: 'exclude',
        currency: 'eur',
        default_tax_rates: [await vatRateId(stripe)],
        description: `Course ${p.orderId}`,
        custom_fields: invoiceCustomFields(p.orderId, party),
        footer: INVOICE_FOOTER,
        // Le client choisit sur la page de la facture : virement (IBAN dédié) ou carte bancaire.
        payment_settings: {
          payment_method_types: ['card', 'customer_balance'],
          payment_method_options: {
            customer_balance: {
              funding_type: 'bank_transfer',
              bank_transfer: { type: 'eu_bank_transfer', eu_bank_transfer: { country: 'FR' } },
            },
          },
        },
        metadata: { order_id: order.id, tracking_code: p.orderId },
      },
      { idempotencyKey: `transfer-invoice-v2-${order.id}` }
    );
  } catch (err: any) {
    // Les virements bancaires doivent être activés dans le dashboard Stripe (Paramètres > Moyens de paiement).
    if (String(err?.message).includes('customer_balance')) {
      await stripe.customers.del(customer.id).catch(() => {});
      return NextResponse.json(
        { error: "Le paiement par virement n'est pas encore disponible. Choisissez la carte ou le RIB." },
        { status: 400 }
      );
    }
    throw err;
  }

  await stripe.invoiceItems.create(
    {
      customer: customer.id,
      invoice: invoice.id,
      currency: 'eur',
      amount: Math.round(p.price * 100),
      description: `Course ${p.orderId} — ${p.pickupAddress} → ${p.dropoffAddress}`,
    },
    { idempotencyKey: `transfer-item-${order.id}` }
  );
  await stripe.invoices.finalizeInvoice(invoice.id!);
  await stripe.invoices.sendInvoice(invoice.id!);

  await supabase
    .from('orders')
    .update({
      payment_mode: 'fin_de_mois',
      billing_status: 'virement_attendu',
      amount_due: p.price,
      payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      stripe_customer_id: customer.id,
      stripe_invoice_id: invoice.id,
    })
    .eq('id', order.id);

  return NextResponse.json({ invoiceSent: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientType,
      service,
      format,
      pickupAddress,
      dropoffAddress,
      orderId,
      email,
      paymentMode,
      debitMethod,
      companyName,
      siret
    } = body;

    // Hors Paris / Île-de-France : pas de tarif, pas de paiement.
    if (!isServedAddress(String(pickupAddress ?? '')) || !isServedAddress(String(dropoffAddress ?? ''))) {
      return NextResponse.json({ error: 'Adresse non reconnue : nous livrons uniquement à Paris et en Île-de-France.' }, { status: 400 });
    }
    const price = calculatePrice(pickupAddress, dropoffAddress, service as ServiceLevel);
    // Stripe takes amounts in cents
    const unitAmount = Math.round(price * 100);

    // Coordonnées du client (saisies à la commande) : elles figureront sur la facture envoyée à la livraison.
    const pro = clientType === 'entreprise';
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: ord } = await admin
      .from('orders')
      .select('id, contact_name, contact_email, raison_sociale, adresse_facturation, siret, tva_number')
      .eq('tracking_code', orderId)
      .maybeSingle();
    const party: InvoiceParty = {
      name: (pro ? ord?.raison_sociale || ord?.contact_name || companyName : ord?.contact_name) || '',
      email: email || ord?.contact_email || '',
      address: ord?.adresse_facturation,
      vat: ord?.tva_number,
      siret: ord?.siret || siret,
    };

    // Format service labels
    const formatLabels: Record<string, string> = {
      'doc': 'Pli/Doc',
      'petit': 'Petit colis',
      'volumineux': 'Volumineux'
    };
    const serviceLabels: Record<string, string> = {
      'standard': 'Normal (3h)',
      'urgent': 'Urgent (1h30)',
      'flash': 'Super (1h)',
      'navette': 'Navette'
    };

    const formatLabel = formatLabels[format] || format;
    const serviceLabel = serviceLabels[service] || service;

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const baseUrl = origin;

    if (clientType === 'entreprise' && paymentMode === 'fin_de_mois' && debitMethod === 'virement') {
      return sendTransferInvoice({ orderId, email, companyName, siret, price, pickupAddress, dropoffAddress });
    }

    if (clientType === 'entreprise' && paymentMode === 'fin_de_mois') {
      // Pro en paiement différé : on enregistre seulement la carte ou le RIB (mandat SEPA) en mode
      // 'setup', aucun montant n'est prélevé aujourd'hui. Le cron deferred-payments prélève à 30 jours.
      // Le client Stripe est créé d'abord pour que le moyen de paiement lui soit rattaché et réutilisable.
      const isSepa = debitMethod === 'sepa';
      const customer = { id: await upsertStripeCustomer(stripe, party) };

      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: isSepa ? ['sepa_debit'] : ['card'],
          mode: 'setup',
          customer: customer.id,
          success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${baseUrl}/?commande_annulee=${orderId}`,
          metadata: {
            orderId: orderId,
            clientType: 'entreprise',
            paymentMode: 'fin_de_mois',
            debitMethod: isSepa ? 'sepa' : 'card',
            price: price.toString(),
          },
        });
      } catch (err: any) {
        // Le prélèvement SEPA doit être activé dans le dashboard Stripe (Paramètres > Moyens de paiement).
        if (isSepa && String(err?.message).includes('sepa_debit')) {
          await stripe.customers.del(customer.id).catch(() => {});
          return NextResponse.json(
            { error: "Le prélèvement par RIB n'est pas encore disponible. Choisissez le prélèvement par carte." },
            { status: 400 }
          );
        }
        throw err;
      }

      return NextResponse.json({ url: session.url });
    } else {
      // Particuliers, et pros qui paient tout de suite : paiement immédiat par carte.
      // Stripe crée la facture au paiement ; elle n'est envoyée au client qu'à la livraison de la course
      // (lib/deliver-order-invoice). Prix TTC pour tous, TVA 20 % « dont ».
      let taxRate: string | undefined;
      try {
        taxRate = await vatRateId(stripe);
      } catch (err) {
        console.error('Taux de TVA indisponible, paiement sans ligne de TVA :', err);
      }
      let customerId: string | undefined;
      try {
        customerId = await upsertStripeCustomer(stripe, party, undefined, `cust-checkout-${ord?.id ?? orderId}`);
      } catch (err) {
        console.error('Client Stripe non créé, paiement sans client :', err);
      }
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        ...(customerId ? { customer: customerId } : { customer_email: email }),
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: '⚡ Livraison Express Paris & Île-de-France',
                description: `✓ Enlèvement sécurisé  •  Confirmation de livraison  •  Garantie de confidentialité\n\nFORMULE: ${formatLabel} | DÉLAI: ${serviceLabel} | TARIF: ${price.toFixed(2)}€\n\nDe: ${pickupAddress}\nÀ: ${dropoffAddress}`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
            ...(taxRate ? { tax_rates: [taxRate] } : {}),
          },
        ],
        // Session abandonnée : elle expire au bout de 30 min (minimum Stripe), le webhook
        // checkout.session.expired marque alors la commande « paiement non réussi ».
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        // Le refus de carte (payment_intent.payment_failed) retrouve la commande par ce code.
        payment_intent_data: { metadata: { orderId } },
        success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${baseUrl}/?commande_annulee=${orderId}`,
        metadata: {
          orderId: orderId,
          clientType: clientType === 'entreprise' ? 'entreprise' : 'particulier',
          paymentMode: 'carte',
          price: price.toString(),
        },
      };

      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.create({
          ...sessionParams,
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: `Course ${orderId}`,
              footer: invoiceFooter(true), // payée à la commande : pas de mention de retard de paiement
              custom_fields: invoiceCustomFields(orderId, party),
              metadata: { order_id: ord?.id ?? '', tracking_code: orderId },
            },
          },
        });
      } catch (err) {
        // Ne jamais perdre une commande : sans facture automatique, le paiement fonctionne comme avant et
        // la facture est alors créée à la livraison.
        console.error('Checkout avec facture refusé, nouvel essai sans :', err);
        session = await stripe.checkout.sessions.create(sessionParams);
      }

      return NextResponse.json({ url: session.url });
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session Stripe' },
      { status: 500 }
    );
  }
}
