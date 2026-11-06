import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { buildCashInvoicePdf } from '@/lib/cash-invoice-pdf';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Facture interne (hors Stripe) d'une course, émise avant ou après le paiement.
// Renvoie le PDF. Si la facture existe déjà, renvoie le même numéro (une facture par course).
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });

  const { orderId } = await req.json().catch(() => ({}));
  if (typeof orderId !== 'string' || !UUID.test(orderId)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: order } = await supabase
    .from('orders')
    .select('id, tracking_code, created_at, pickup_address, dropoff_address, price_estimate, amount_due, contact_name, raison_sociale, adresse_facturation, siret, user_id, billing_status, payment_method, paid_at')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: 'Course introuvable.' }, { status: 404 });

  const ttc = Number(order.amount_due ?? order.price_estimate ?? 0);
  if (!(ttc > 0)) return NextResponse.json({ error: 'Prix de la course manquant : renseignez le prix avant d\'émettre la facture.' }, { status: 400 });

  let clientAddress: string | null = null;
  if (order.user_id) {
    const { data: client } = await supabase.from('clients').select('billing_address').eq('id', order.user_id).maybeSingle();
    clientAddress = client?.billing_address && client.billing_address !== 'À remplir' ? client.billing_address : null;
  }

  const { data: invoice, error } = await supabase.rpc('issue_internal_invoice', {
    p_order_id: order.id,
    p_buyer_name: order.raison_sociale || order.contact_name || 'Client',
    p_buyer_address: order.adresse_facturation || clientAddress,
    p_buyer_siret: order.siret || null,
    p_amount_ttc: ttc,
  });
  if (error || !invoice) return NextResponse.json({ error: error?.message ?? 'Émission impossible.' }, { status: 500 });

  const pdf = buildCashInvoicePdf({
    number: invoice.number,
    issuedAt: invoice.issued_at,
    buyerName: invoice.buyer_name,
    buyerAddress: invoice.buyer_address,
    buyerSiret: invoice.buyer_siret,
    amountHt: Number(invoice.amount_ht),
    vatAmount: Number(invoice.vat_amount),
    amountTtc: Number(invoice.amount_ttc),
    trackingCode: order.tracking_code,
    orderDate: order.created_at,
    pickupAddress: order.pickup_address,
    dropoffAddress: order.dropoff_address,
    paid: order.billing_status === 'paye',
    paymentMethod: order.payment_method ?? null,
  });

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
