/**
 * lib/chatbot/quick-questions.ts
 * Questions rapides de l'assistant : réponse fixe et immédiate, identique au site (pas d'IA).
 */
import { PHONE_DISPLAY } from "@/lib/site-content";
import { gridPrice } from "@/lib/pricing";

export const eur = (n: number) => `${n.toFixed(2).replace(".", ",").replace(",00", "")} €`;

export const P = {
  paris: { normal: gridPrice("standard", 0), urgent: gridPrice("urgent", 0), super: gridPrice("flash", 0) },
  pc: { normal: gridPrice("standard", 1), urgent: gridPrice("urgent", 1), super: gridPrice("flash", 1) },
  gcFrom: gridPrice("standard", 2),
};

/** Questions rapides affichées dans la fenêtre : réponse immédiate, identique au site. */
export const QUICK_QUESTIONS: { q: string; a: string }[] = [
  {
    q: "Combien coûte une course ?",
    a: `Prix TTC selon la zone la plus éloignée du trajet et le délai :\n• Paris : ${eur(P.paris.normal)} (Normal, 3 h), ${eur(P.paris.urgent)} (Urgent, 1 h 30), ${eur(P.paris.super)} (Super, 1 h)\n• Petite couronne (92, 93, 94) : ${eur(P.pc.normal)}, ${eur(P.pc.urgent)}, ${eur(P.pc.super)}\n• Grande couronne (77, 78, 91, 95) : selon la distance depuis Paris, dès ${eur(P.gcFrom)} en Normal.\nLe prix exact s'affiche dès que vous saisissez les adresses dans le formulaire de commande.`,
  },
  {
    q: "Quelles zones desservez-vous ?",
    a: "Paris (1er au 20e), La Défense, la petite couronne (92, 93, 94) et toute l'Île-de-France (77, 78, 91, 95), y compris Roissy-CDG et Orly. Nous ne livrons pas en province.",
  },
  {
    q: "Quels sont vos horaires ?",
    a: `Du lundi au samedi, de 9 h à 19 h. Fermé le dimanche et les jours fériés. En dehors de ces horaires, appelez le ${PHONE_DISPLAY} : nous étudions la demande au cas par cas.`,
  },
  {
    q: "En combien de temps passe le coursier ?",
    a: "Le coursier le plus proche part dès la confirmation : enlèvement en moins de 45 minutes à Paris et en petite couronne, puis livraison directe, sans regroupement avec d'autres colis.",
  },
  {
    q: "Comment commander ?",
    a: `Cliquez sur « Commander » : saisissez les adresses, le délai, et le prix s'affiche avant de valider. Vous pouvez aussi appeler le ${PHONE_DISPLAY}. Paiement par carte, Apple Pay, Google Pay ou prélèvement SEPA ; compte entreprise avec factures à 30 jours.`,
  },
  {
    q: "Comment suivre ma course ?",
    a: "Le lien de suivi est envoyé dans l'e-mail de confirmation. Avec un compte, toutes vos courses et leur statut sont dans votre espace client. Chaque remise est horodatée avec le nom du destinataire.",
  },
];
