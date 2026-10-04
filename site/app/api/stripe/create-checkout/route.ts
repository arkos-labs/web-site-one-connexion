import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculatePrice, ServiceLevel } from '@/lib/pricing';
import { vatRateId } from '@/lib/stripe-vat';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

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

    const price = calculatePrice(pickupAddress, dropoffAddress, service as ServiceLevel);
    // Stripe takes amounts in cents
    const unitAmount = Math.round(price * 100);

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

    if (clientType === 'entreprise' && paymentMode === 'fin_de_mois') {
      // Pro en paiement différé : on enregistre seulement la carte ou le RIB (mandat SEPA) en mode
      // 'setup', aucun montant n'est prélevé aujourd'hui. Le cron deferred-payments prélève à 30 jours.
      // Le client Stripe est créé d'abord pour que le moyen de paiement lui soit rattaché et réutilisable.
      const isSepa = debitMethod === 'sepa';
      const customer = await stripe.customers.create({
        email,
        name: companyName || undefined,
        metadata: { orderId, siret: siret || '' },
      });

      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: isSepa ? ['sepa_debit'] : ['card'],
          mode: 'setup',
          customer: customer.id,
          success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${baseUrl}/#commander-form`,
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
      // Particuliers, et pros qui paient tout de suite : paiement immédiat par carte
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email,
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
            // Tarif pro affiché HT : TVA 20 % ajoutée, comme sur le débit à 30 jours
            ...(clientType === 'entreprise' ? { tax_rates: [await vatRateId(stripe)] } : {}),
          },
        ],
        success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${baseUrl}/#commander-form`,
        metadata: {
          orderId: orderId,
          clientType: clientType === 'entreprise' ? 'entreprise' : 'particulier',
          paymentMode: 'carte',
          price: price.toString(),
        },
      });

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
