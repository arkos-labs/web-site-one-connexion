/**
 * lib/chatbot/quick-questions.ts
 * Parcours guidé de l'assistant : réponses fixes et immédiates, identiques au site (pas d'IA).
 * Chaque étape propose des boutons ; « Comment commander ? » demande d'abord pro ou particulier,
 * car la commande et la facturation diffèrent (pro : à 30 jours possible ; particulier : carte à la commande).
 */
import { PHONE_DISPLAY } from "@/lib/site-content";
import { gridPrice, pcKmPrice, PC_INCLUDED_KM } from "@/lib/pricing";

export const eur = (n: number) => `${n.toFixed(2).replace(".", ",").replace(",00", "")} €`;

export const P = {
  paris: { normal: gridPrice("standard", 0), urgent: gridPrice("urgent", 0), super: gridPrice("flash", 0) },
  pc: { normal: gridPrice("standard", 1), urgent: gridPrice("urgent", 1), super: gridPrice("flash", 1) },
  gcFrom: gridPrice("standard", 2),
};

/** Bouton proposé sous une réponse : une autre étape, ou une action. */
export type Choice =
  | { label: string; step: StepId }
  | { label: string; action: "order" | "callback" | "call" }
  | { label: string; href: string };

export type StepId = "menu" | "type" | "pro" | "particulier" | "prix" | "zones" | "horaires" | "delai" | "suivi";

const ORDER: Choice = { label: "Commander maintenant", action: "order" };
const CALLBACK: Choice = { label: "Être rappelé", action: "callback" };
const HOW: Choice = { label: "Comment commander ?", step: "type" };
const PRIX: Choice = { label: "Combien ça coûte ?", step: "prix" };
const MENU: Choice = { label: "Autre question", step: "menu" };

export const STEPS: Record<StepId, { text: string; choices: Choice[] }> = {
  menu: {
    text: "Que puis-je faire pour vous ?",
    choices: [
      { label: "Je suis nouveau client", step: "type" },
      PRIX,
      { label: "Zones desservies", step: "zones" },
      { label: "Horaires", step: "horaires" },
      { label: "Délai du coursier", step: "delai" },
      { label: "Suivre ma course", step: "suivi" },
      CALLBACK,
    ],
  },
  type: {
    text: "Bienvenue ! Pour vous expliquer la commande et la facturation, vous êtes :",
    choices: [
      { label: "Professionnel (entreprise)", step: "pro" },
      { label: "Particulier", step: "particulier" },
    ],
  },
  pro: {
    text:
      "Commander en tant que professionnel, en 3 étapes :\n" +
      "1. Cliquez sur « Commander », choisissez « Entreprise » et saisissez les adresses : le prix s'affiche tout de suite.\n" +
      "2. Indiquez vos coordonnées et votre SIRET (vérifié automatiquement).\n" +
      "3. Choisissez le délai et validez.\n\n" +
      "Facturation : règlement sous 30 jours, sur facture. La facture, avec la TVA détaillée, est envoyée par e-mail. Vous la réglez par prélèvement, par virement, ou par carte bancaire depuis la facture ou depuis votre espace client sur le site.\n\n" +
      "Ensuite, un dispatcheur vous contacte dans les 10 minutes et vous recevez un code de suivi. Avec un compte entreprise (ouverture immédiate), vous retrouvez toutes vos courses et factures, avec un tarif dégressif selon le volume.",
    choices: [ORDER, { label: "Créer mon compte entreprise", href: "/inscription" }, PRIX, CALLBACK],
  },
  particulier: {
    text:
      "Commander en tant que particulier, en 3 étapes :\n" +
      "1. Cliquez sur « Commander », choisissez « Particulier » et saisissez les adresses : le prix s'affiche tout de suite.\n" +
      "2. Indiquez vos coordonnées, le colis et le délai.\n" +
      "3. Payez par carte bancaire sur la page de paiement sécurisée (Stripe). Le paiement se fait à la commande, avant la prise en charge.\n\n" +
      "Ensuite, un dispatcheur vous contacte dans les 10 minutes et vous recevez un code de suivi pour suivre votre course.",
    choices: [ORDER, PRIX, CALLBACK],
  },
  prix: {
    text:
      `Prix TTC selon le trajet et le délai :\n` +
      `• Paris : ${eur(P.paris.normal)} (Normal, 3 h), ${eur(P.paris.urgent)} (Urgent, 1 h 30), ${eur(P.paris.super)} (Super, 1 h)\n` +
      `• Petite couronne (92, 93, 94) : ${eur(P.pc.normal)} (Normal), ${eur(P.pc.urgent)} (Urgent), ${eur(P.pc.super)} (Super) jusqu'à ${PC_INCLUDED_KM} km de route, puis ${eur(pcKmPrice("standard"))}, ${eur(pcKmPrice("urgent"))} ou ${eur(pcKmPrice("flash"))} par km en plus. Exemple : 15 km en Normal = ${eur(P.pc.normal + 7 * pcKmPrice("standard"))}.\n` +
      `• Grande couronne (77, 78, 91, 95) : selon la distance depuis Paris, dès ${eur(P.gcFrom)} en Normal.\n` +
      `Le prix exact s'affiche dès que vous saisissez les adresses dans le formulaire de commande.`,
    choices: [ORDER, HOW, MENU],
  },
  zones: {
    text: "Paris (1er au 20e), La Défense, la petite couronne (92, 93, 94) et toute l'Île-de-France (77, 78, 91, 95), y compris Roissy-CDG et Orly. Nous ne livrons pas en province.",
    choices: [ORDER, HOW, MENU],
  },
  horaires: {
    text: `Du lundi au samedi, de 9 h à 19 h. Fermé le dimanche et les jours fériés. En dehors de ces horaires, laissez votre numéro : nous étudions la demande au cas par cas.`,
    choices: [ORDER, CALLBACK, MENU],
  },
  delai: {
    text: "Le coursier le plus proche part dès la confirmation : enlèvement en moins de 45 minutes à Paris et en petite couronne, puis livraison directe, sans regroupement avec d'autres colis. Délais : Normal sous 3 h, Urgent sous 1 h 30, Super sous 1 h.",
    choices: [ORDER, PRIX, MENU],
  },
  suivi: {
    text: `Le lien de suivi est dans l'e-mail de confirmation. Avec un compte, toutes vos courses et leur statut sont dans votre espace client. Chaque remise est horodatée avec le nom du destinataire. Pour une course en cours, appelez le ${PHONE_DISPLAY}.`,
    choices: [{ label: "Mon espace client", href: "/dashboard" }, { label: `Appeler le ${PHONE_DISPLAY}`, action: "call" }, MENU],
  },
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Question écrite reconnue sans IA (réponse immédiate). null : à envoyer à l'assistant IA. */
export function matchStep(text: string): StepId | null {
  const t = norm(text);
  if (/\b(pro|professionnel|entreprise|societe|siret|30 jours|fin de mois)\b/.test(t) && !/\bparticulier\b/.test(t)) return "pro";
  if (/\bparticulier\b/.test(t)) return "particulier";
  if (/commande|commander|reserver|nouveau|inscri|factur|payer|paiement|regler|reglement/.test(t)) return "type";
  if (/suivi|suivre|ou en est|statut/.test(t)) return "suivi";
  if (/horaire|ouvert|dimanche|ferie|heure d'ouverture/.test(t)) return "horaires";
  if (/\b(zone|livrez|desservez|banlieue|province|ile-de-france|idf)\b/.test(t)) return "zones";
  if (/combien de temps|delai|rapide|vite|attendre/.test(t)) return "delai";
  if (/prix|tarif|cout|combien/.test(t)) return "prix";
  return null;
}
