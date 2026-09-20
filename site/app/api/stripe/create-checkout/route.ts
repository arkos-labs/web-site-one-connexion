import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculatePrice, ServiceLevel } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      clientType, 
      service, 
      pickupAddress, 
      dropoffAddress, 
      orderId,
      email 
    } = body;

    const price = calculatePrice(pickupAddress, dropoffAddress, service as ServiceLevel);
    // Stripe takes amounts in cents
    const unitAmount = Math.round(price * 100);

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const baseUrl = origin;

    if (clientType === 'entreprise') {
      // Pour les pros: SetupIntent ou Session Setup pour enregistrer la carte.
      // Une autre option est de créer une facture avec un délai de 30 jours, 
      // mais le plus simple ici est de prendre l'empreinte de carte via un mode 'setup'.
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit'],
        mode: 'setup',
        customer_email: email,
        success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${baseUrl}/#commander-form`,
        metadata: {
          orderId: orderId,
          clientType: 'entreprise',
          price: price.toString(),
        },
      });

      return NextResponse.json({ url: session.url });
    } else {
      // Pour les particuliers: Paiement immédiat
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
                description: `Enlèvement sécurisé • Suivi en temps réel • Garantie de confidentialité\n\nDe ${pickupAddress} à ${dropoffAddress}`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${baseUrl}/#commander-form`,
        metadata: {
          orderId: orderId,
          clientType: 'particulier',
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
