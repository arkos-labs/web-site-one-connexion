/**
 * lib/services/coursier-express-paris.ts
 * Page SEO dédiée. Requêtes visées : coursier express Paris, coursier paris
 * express, livraison express Paris, coursier urgent Paris, prix coursier express.
 * Chiffres repris de /tarifs et /flotte : ne pas en introduire de nouveaux ici.
 */
import type { Service } from "./types";

export const coursierExpressParis: Service = {
  slug: "coursier-express-paris",

  card: {
    tag: "Express",
    title: "Coursier express Paris",
    body: "Enlèvement en moins de 45 minutes, course dédiée en deux-roues, suivi en ligne et preuve de livraison horodatée.",
    note: "Super 1 h dès 56 € TTC",
  },

  seo: {
    title: "Coursier express Paris - dès 42 € TTC",
    description:
      "Coursier express à Paris : enlèvement en moins de 45 min, course dédiée en moto ou scooter, suivi en ligne. Dès 42 € TTC en 1 h 30, 56 € TTC en 1 h.",
    keywords: [
      "coursier express Paris",
      "coursier paris express",
      "livraison express Paris",
      "coursier urgent Paris",
      "prix coursier express Paris",
      "course urgente Paris",
      "coursier express Île-de-France",
    ],
  },

  h1: "Coursier express à Paris : enlèvement en moins de 45 minutes",

  intro:
    "Quand un pli, un colis ou une pièce doit partir maintenant, One Connexion envoie un coursier en deux-roues en course dédiée : un enlèvement, un trajet direct, une remise horodatée. Intramuros et Île-de-France, du lundi au samedi de 9h à 19h.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "Dès 42 € TTC", label: "Course urgente Paris (1 h 30)" },
    { value: "6j/7", label: "Lun–sam, 9h – 19h" },
  ],

  context: {
    title: "Ce qui fait une vraie course express",
    paragraphs: [
      "Une livraison express n’a de sens que si le coursier part tout de suite et va directement à destination. Sans regroupement avec d’autres colis ni passage par un centre de tri, le délai annoncé est le délai réel.",
      "En intramuros, le deux-roues est le moyen le plus fiable pour tenir un créneau serré : il passe là où un utilitaire reste bloqué. Nos scooters et motos assurent les courses intra-muros, et les motos routières les trajets vers la banlieue, La Défense, Roissy ou Orly.",
      "Avant d’engager la course, nous confirmons la faisabilité et le prix. Vous savez à quelle heure le coursier arrive, et vous suivez l’avancement de la course en ligne jusqu’à la remise.",
    ],
  },

  steps: [
    {
      title: "Commande",
      body: "En ligne, par téléphone ou par courriel, avec l’adresse d’enlèvement, la destination et l’heure limite de remise.",
    },
    {
      title: "Confirmation du prix et du délai",
      body: "Nous confirmons la faisabilité et le tarif avant d’envoyer le coursier. Pas de surprise à la livraison.",
    },
    {
      title: "Enlèvement en moins de 45 minutes",
      body: "Le coursier se présente à l’adresse indiquée et prend le colis en charge.",
    },
    {
      title: "Trajet direct",
      body: "Course dédiée, sans regroupement. Vous suivez l’avancement en ligne à chaque étape.",
    },
    {
      title: "Remise horodatée",
      body: "Remise en main propre, avec le nom du destinataire et l’heure exacte consignés comme preuve de livraison.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement avec d’autres colis",
    "Enlèvement en moins de 45 minutes",
    "Suivi de la course en ligne",
    "Preuve de livraison horodatée et nominative",
    "Coursier joignable pendant toute la course",
    "Tarif confirmé avant l’envoi du coursier",
  ],

  useCases: [
    {
      title: "Document à livrer dans l’heure",
      body: "Un contrat ou un acte attendu chez un client avant la fin de journée. Enlèvement dans l’heure, remise en main propre.",
    },
    {
      title: "Pièce qui bloque une activité",
      body: "Une pièce de rechange ou un composant manquant à livrer en urgence sur un site de production ou un atelier.",
    },
    {
      title: "Colis e-commerce à livrer le jour même",
      body: "Une commande à livrer à un client parisien dans la journée, avec preuve de remise.",
    },
  ],

  coverage:
    "Une course express coûte 42 € TTC en urgent (1 h 30) et 56 € TTC en formule Super (1 h) en intramuros, puis 58,50 € et 78 € TTC dans les Hauts-de-Seine, la Seine-Saint-Denis et le Val-de-Marne jusqu'à 8 km, et 3 € ou 4 € TTC par km au-delà. En grande couronne (77, 78, 91, 95), le prix suit la distance depuis Paris : dès 90 € et 120 € TTC.",

  pricing: {
    title: "Prix d’un coursier express à Paris",
    intro:
      "Une course express part dès la confirmation et va directement à destination. Les formules Urgent (1 h 30) et Super (1 h) sont faites pour ça ; le prix ne dépend que de la zone la plus éloignée du trajet.",
    recommended: ["urgent", "flash"],
    note:
      "En intramuros, une course Super coûte 56 € TTC, livrée sous 1 h. Si votre délai est plus large, la formule Normale (3 h) revient deux fois moins cher.",
  },

  faqTitle: "Vos questions sur le coursier express.",

  faq: [
    {
      question: "Qu’est-ce qu’un coursier express ?",
      answer:
        "Un coursier express prend en charge un colis ou un document sur demande et le livre en trajet direct, sans regroupement. C’est la solution pour les envois urgents qui ne peuvent pas attendre une tournée.",
    },
    {
      question: "En combien de temps un coursier express vient-il chercher mon colis ?",
      answer:
        "L’enlèvement se fait en moins de 45 minutes en intramuros, sous réserve de disponibilité au moment de la commande. Nous confirmons le délai avant d’engager la course.",
    },
    {
      question: "Quel est le prix d’un coursier express à Paris ?",
      answer:
        "Une course express démarre à 42 € TTC en urgent (1 h 30) et 56 € TTC en formule Super (1 h) en intramuros, 58,50 € et 78 € TTC en petite couronne jusqu'à 8 km (puis 3 € ou 4 € TTC par km). Le prix est affiché avant de commander, détail sur la page tarifs.",
    },
    {
      question: "Quelle différence entre course immédiate et course planifiée ?",
      answer:
        "La course Super part dans l’heure. La course normale, livrée sous 3 h, démarre à 28 € TTC en intramuros.",
    },
    {
      question: "Livrez-vous en dehors de Paris ?",
      answer:
        "Oui, en petite couronne (92, 93, 94) au tarif standard. La grande couronne, Roissy et Orly sont desservis, au tarif de leur zone.",
    },
    {
      question: "Puis-je suivre la course ?",
      answer:
        "Oui. L’avancement de chaque course est consultable en ligne, et la remise est horodatée avec le nom du destinataire.",
    },
    {
      question: "Travaillez-vous le week-end ?",
      answer:
        "Le samedi oui, de 9h à 19h, comme en semaine. Nous sommes fermés le dimanche et les jours fériés.",
    },
  ],
};
