/**
 * lib/payment-method.ts (serveur)
 * Moyen de paiement enregistré d'un client (carte ou RIB / prélèvement SEPA), pour le paiement en 1 clic.
 * Il vit chez Stripe : défaut du client Stripe (invoice_settings.default_payment_method).
 * L'identifiant du client Stripe est gardé dans app_metadata (non modifiable par l'utilisateur)
 * et dans clients.stripe_customer_id quand la fiche client existe (factures du mois).
 */
import type Stripe from 'stripe';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type SavedMethod = {
  id: string;
  type: 'card' | 'sepa_debit';
  label: string; // « Visa •••• 4242 » / « Prélèvement •••• 3000 »
  detail: string | null; // « Expire 12/28 » / nom de la banque
};

/** Utilisateur connecté (session du navigateur). */
export async function sessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await auth.auth.getUser();
  return user;
}

/** Client Stripe du compte (créé au premier besoin). */
export async function customerIdFor(admin: SupabaseClient, stripe: Stripe, user: User, create: boolean): Promise<string | null> {
  let id = (user.app_metadata?.stripe_customer_id as string | undefined) ?? null;
  if (!id) {
    const { data: c } = await admin.from('clients').select('stripe_customer_id').eq('id', user.id).maybeSingle();
    id = c?.stripe_customer_id ?? null;
  }
  if (id || !create) return id;

  const { data: client } = await admin.from('clients').select('company_name, contact_name').eq('id', user.id).maybeSingle();
  const customer = await stripe.customers.create(
    {
      email: user.email,
      name: client?.company_name || client?.contact_name || (user.user_metadata?.full_name as string) || undefined,
      metadata: { user_id: user.id },
    },
    { idempotencyKey: `customer-user-${user.id}` }
  );
  await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, stripe_customer_id: customer.id } });
  await admin.from('clients').update({ stripe_customer_id: customer.id }).eq('id', user.id).is('stripe_customer_id', null);
  return customer.id;
}

export function describeMethod(pm: Stripe.PaymentMethod): SavedMethod | null {
  if (pm.type === 'card' && pm.card) {
    const brand = pm.card.brand ? pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1) : 'Carte';
    return { id: pm.id, type: 'card', label: `${brand} •••• ${pm.card.last4}`, detail: `Expire ${String(pm.card.exp_month).padStart(2, '0')}/${String(pm.card.exp_year).slice(-2)}` };
  }
  if (pm.type === 'sepa_debit' && pm.sepa_debit) {
    return { id: pm.id, type: 'sepa_debit', label: `Prélèvement •••• ${pm.sepa_debit.last4}`, detail: pm.sepa_debit.bank_code ? `Banque ${pm.sepa_debit.bank_code}` : null };
  }
  return null;
}

/** Moyen de paiement par défaut du client Stripe, s'il y en a un. */
export async function savedMethodOf(stripe: Stripe, customerId: string | null): Promise<{ method: SavedMethod; pm: Stripe.PaymentMethod } | null> {
  if (!customerId) return null;
  const customer = await stripe.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] });
  if ((customer as Stripe.DeletedCustomer).deleted) return null;
  const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
  if (!pm || typeof pm === 'string') return null;
  const method = describeMethod(pm);
  return method ? { method, pm } : null;
}
