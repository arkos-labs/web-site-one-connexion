/**
 * lib/site-content.ts
 * Valeurs de contenu centralisées — données légales et de contact ONE CONNEXION.
 */

export const PHONE_DISPLAY = "06 66 02 67 07";
export const PHONE_TEL = "+33666026707";
export const EMAIL = "contact@oneconnexion.com";
export const FOUNDED_YEAR = "2026";

export const SITE_URL = "https://www.oneconnexion.com";

// Lien Google Maps vers le siège (schema.org hasMap, page contact).
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=5+Square+Nungesser+94160+Saint-Mand%C3%A9";

// Informations légales ONE CONNEXION — SAS immatriculée le 21/02/2026
export const LEGAL = {
  denomination: "ONE CONNEXION",
  forme: "SAS, société par actions simplifiée",
  siren: "101 517 100",
  siret: "101 517 100 00018",
  tva: "FR24 101 517 100",
  naf: "49.41B",
  activite: "Transports routiers de fret de proximité",
  capital: "3 000,00 €",
  adresse: "5 Square Nungesser, 94160 Saint-Mandé",
  dateCreation: "21/02/2026",
  dateCreationISO: "2026-02-21",
  clotureExercice: "30 septembre",
};

// Bascule pour afficher/masquer les témoignages (désactivée : aucun retour client réel à publier pour l'instant).
export const SHOW_TESTIMONIALS = false;

// Date de dernière mise à jour du contenu public (sitemap <lastmod>, pages légales).
export const SITE_LAST_UPDATED = new Date("2026-09-21");
export const SITE_LAST_UPDATED_LABEL = "21/09/2026";
