/**
 * lib/invoice-info.ts
 * Informations communes à toutes les factures Stripe : mentions légales du vendeur, coordonnées du client
 * (nom, adresse, TVA, SIRET) et champs personnalisés. Une seule source pour que les factures des pros,
 * des particuliers, du paiement immédiat et du paiement à 30 jours aient le même rendu.
 */
import type Stripe from 'stripe';
import { LEGAL } from '@/lib/site-content';

/** Mentions légales affichées en pied de chaque facture (à faire valider par l'expert-comptable). */
export const INVOICE_FOOTER =
  `${LEGAL.denomination} — ${LEGAL.forme} au capital de ${LEGAL.capital} — ${LEGAL.adresse} — ` +
  `SIREN ${LEGAL.siren} — SIRET ${LEGAL.siret} — TVA intracommunautaire ${LEGAL.tva} — NAF ${LEGAL.naf}. ` +
  `En cas de retard de paiement : pénalités égales à 3 fois le taux d'intérêt légal et indemnité forfaitaire ` +
  `de recouvrement de 40 € (art. L441-10 du Code de commerce). Pas d'escompte pour paiement anticipé.`;

export type InvoiceParty = {
  name: string;
  email: string;
  /** Adresse libre « 2 rue X, 75008 PARIS » ou champs séparés. */
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  vat?: string | null;
  siret?: string | null;
};

/** « 2 RUE X, 75008 PARIS » → adresse Stripe. Retourne undefined si le texte est inexploitable. */
export function toStripeAddress(p: Pick<InvoiceParty, 'address' | 'postalCode' | 'city'>): Stripe.AddressParam | undefined {
  const raw = (p.address ?? '').trim();
  if (!raw || raw === 'À remplir') return undefined;
  if (p.postalCode && p.city) {
    return { line1: raw, postal_code: p.postalCode, city: p.city, country: 'FR' };
  }
  const m = raw.match(/^(.*),\s*(\d{5})\s+(.+)$/);
  if (m) return { line1: m[1], postal_code: m[2], city: m[3], country: 'FR' };
  return { line1: raw, country: 'FR' };
}

const formatSiret = (s: string) => s.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4');

/** Champs personnalisés (4 maximum dans Stripe) : référence + SIRET du client si connu. */
export function invoiceCustomFields(ref: string, party?: Pick<InvoiceParty, 'siret'>): Stripe.InvoiceCreateParams.CustomField[] {
  const fields = [{ name: 'Réf.', value: ref }];
  const siret = party?.siret?.replace(/\D/g, '');
  if (siret && siret.length === 14) fields.push({ name: 'SIRET client', value: formatSiret(siret) });
  return fields;
}

/** Crée ou met à jour le client Stripe avec ses coordonnées de facturation. */
export async function upsertStripeCustomer(stripe: Stripe, party: InvoiceParty, existingId?: string | null, idemKey?: string): Promise<string> {
  const address = toStripeAddress(party);
  const params = {
    email: party.email,
    name: party.name || undefined,
    ...(address ? { address } : {}),
  };
  let id = existingId ?? null;
  if (id) {
    await stripe.customers.update(id, params);
  } else {
    const c = await stripe.customers.create(
      { ...params, metadata: party.siret ? { siret: party.siret } : undefined },
      idemKey ? { idempotencyKey: idemKey } : undefined
    );
    id = c.id;
  }
  // N° de TVA intracommunautaire du client (affiché sur la facture) : ajouté s'il n'existe pas déjà.
  const vat = party.vat?.replace(/\s/g, '').toUpperCase();
  if (vat && /^[A-Z]{2}[0-9A-Z]{8,12}$/.test(vat)) {
    try {
      const have = await stripe.customers.listTaxIds(id, { limit: 10 });
      if (!have.data.some((t) => t.value === vat)) await stripe.customers.createTaxId(id, { type: 'eu_vat', value: vat });
    } catch (err) {
      console.error('TVA client non ajoutée', err); // numéro refusé par Stripe : la facture part sans
    }
  }
  return id;
}
