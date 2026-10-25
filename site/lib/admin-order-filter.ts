/**
 * Commandes visibles : entreprises, et particuliers une fois payés.
 * Une commande particulier dont le paiement n'a pas abouti n'apparaît ni dans l'admin ni chez le client.
 */
export const ADMIN_VISIBLE_ORDERS =
  "client_type.eq.entreprise,client_type.is.null,billing_status.eq.paye";

export const CLIENT_VISIBLE_ORDERS = ADMIN_VISIBLE_ORDERS;
