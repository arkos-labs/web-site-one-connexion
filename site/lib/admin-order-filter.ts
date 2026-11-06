/**
 * Commandes visibles : entreprises, et particuliers une fois payés.
 * Une commande particulier dont le paiement n'a pas abouti n'apparaît ni dans l'admin ni chez le client.
 * Exception côté admin : une commande créée par l'admin (saisie téléphonique) reste visible tant qu'elle
 * n'est pas payée, pour pouvoir la valider et la dispatcher.
 */
const BASE_VISIBLE_ORDERS = "client_type.eq.entreprise,client_type.is.null,billing_status.eq.paye";

export const ADMIN_VISIBLE_ORDERS = `${BASE_VISIBLE_ORDERS},source.eq.admin`;

export const CLIENT_VISIBLE_ORDERS = BASE_VISIBLE_ORDERS;
