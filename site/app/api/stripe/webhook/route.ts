import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Note: We use the service role key to bypass RLS for the webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Pour les tests sans webhook secret
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const clientType = session.metadata?.clientType;

      if (orderId) {
        let updateData: any = {};
        
        if (clientType === 'particulier') {
          updateData = { status: 'paye' };
        } else if (clientType === 'entreprise') {
          // Pour un pro, on a enregistré la carte. On valide la commande.
          updateData = { status: 'valide' };
          // TODO: Gérer la logique de prélèvement à 30 jours via l'API Stripe
          // en utilisant le setup_intent lié à cette session (session.setup_intent).
        }

        const { error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId); // Si 'id' est un UUID. Si c'est tracking_code, faire .eq('tracking_code', orderId)
          
        if (error) {
          // Si jamais la mise à jour par UUID échoue, on tente par tracking_code
          await supabase
            .from('orders')
            .update(updateData)
            .eq('tracking_code', orderId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}
