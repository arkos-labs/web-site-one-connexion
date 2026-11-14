/**
 * lib/services/coursier-express-paris.ts
 * Page SEO dédiée. Requête visée : « coursier express Paris ». « coursier moto »
 * appartient à /services/coursier-moto-paris, les prix à /tarifs.
 * Chiffres repris de /tarifs et /flotte : ne pas en introduire de nouveaux ici.
 */
import type { Service } from "./types";
import { gridPrice } from "../pricing";

export const coursierExpressParis: Service = {
  slug: "coursier-express-paris",

  card: {
    tag: "Express",
    title: "Coursier express Paris",
    body: "Enlèvement en moins de 45 minutes, course dédiée en deux-roues, suivi en ligne et preuve de livraison horodatée.",
    note: "Super 1 h dès 56 € TTC",
  },

  seo: {
    title: "Coursier express Paris : course dédiée pour vos envois urgents",
    description:
      "Coursier express à Paris pour vos envois urgents : une course dédiée, sans mutualisation, avec suivi de la prise en charge à la remise.",
    keywords: [
      "coursier express Paris",
      "coursier paris express",
      "livraison express Paris",
      "coursier urgent Paris",
      "course urgente Paris",
      "coursier express Île-de-France",
    ],
  },

  h1: "Coursier express Paris : une course dédiée, sans mutualisation",

  intro:
    "Quand un pli, un colis ou une pièce doit partir maintenant, One Connexion envoie un coursier en deux-roues en course dédiée : un enlèvement, un trajet direct, une remise horodatée. Intramuros et Île-de-France, 7j/7 de 7h à 23h.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "1 course", label: "Un envoi, sans regroupement" },
    { value: "7j/7", label: "De 7h à 23h" },
  ],

  context: {
    title: "Ce que change une course dédiée",
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
    "Plis, contrats et actes à remettre en main propre",
    "Colis, pièces de rechange et composants",
    "Commandes e-commerce à livrer le jour même",
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
      body: "Un contrat ou un acte attendu chez un client avant la fin de journée. Enlèvement dans l’heure, remise en main propre. Voir aussi notre [coursier urgent à Paris](/services/coursier-urgent-paris).",
    },
    {
      title: "Pièce qui bloque une activité",
      body: "Une pièce de rechange ou un composant manquant à livrer en urgence sur un site de production ou un atelier.",
    },
    {
      title: "Colis e-commerce à livrer le jour même",
      body: "Une commande à livrer à un client parisien dans la journée, avec preuve de remise. Le week-end, voyez notre [coursier le dimanche à Paris](/services/coursier-dimanche-paris).",
    },
  ],

  coverage:
    "Intramuros et Île-de-France : petite couronne (92, 93, 94), grande couronne (77, 78, 91, 95), Roissy et Orly. Le coursier part de l’adresse d’enlèvement et va directement à destination.",

  pricing: {
    title: "Tarifs d’une course express",
    intro:
      "Une course express part dès la confirmation et va directement à destination. Les formules Urgent (1 h 30) et Super (1 h) sont faites pour ça ; le prix ne dépend que de la zone la plus éloignée du trajet.",
    recommended: ["urgent", "flash"],
    note:
      "En intramuros, une course Super coûte 56 € TTC, livrée sous 1 h. Si votre délai est plus large, la formule Normale (3 h) revient deux fois moins cher.",
  },

  faqTitle: "Questions fréquentes",

  offers: [
    { name: "Course Normale 3 h à Paris", price: gridPrice("standard", 0) },
    { name: "Course Urgente 1 h 30 à Paris", price: gridPrice("urgent", 0) },
    { name: "Course Super 1 h à Paris", price: gridPrice("flash", 0) },
  ],

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
      question: "Quelle différence entre course immédiate et course planifiée ?",
      answer:
        "La course Super part dans l’heure. La course normale est livrée sous 3 h, et une course planifiée part à l’heure choisie à la commande.",
    },
    {
      question: "Livrez-vous en dehors de Paris ?",
      answer:
        "Oui, en petite couronne (92, 93, 94) et en grande couronne, ainsi qu’à Roissy et Orly.",
    },
    {
      question: "Puis-je suivre la course ?",
      answer:
        "Oui. L’avancement de chaque course est consultable en ligne, et la remise est horodatée avec le nom du destinataire.",
    },
    {
      question: "Travaillez-vous le week-end ?",
      answer:
        "Oui, nos courses sont prises en charge 7j/7, de 7h à 23h.",
    },
  ],

  outline: {
    sections: [
      { key: "context", title: "Coursier express Paris : ce que couvre le service" },
    ],
    extraSections: [
      {
        after: "context",
        title: "Délais réels : moins de 45 minutes, 7j/7, 7h–23h",
        paragraphs: [
          "Pour une course express, l’enlèvement se fait en moins de 45 minutes, 7j/7 de 7h à 23h, sous réserve de disponibilité au moment de la commande ; nous confirmons le délai avant d’engager la course. Ensuite, le délai de livraison dépend de la formule choisie : Normal sous 3 h, Urgent sous 1 h 30, Super sous 1 h.",
          "Contrairement à une livraison mutualisée, où votre colis attend la fin d’une tournée avec plusieurs arrêts, la course dédiée part pour votre seul envoi : le délai annoncé est le délai réel. Notre [flotte de coursiers moto](/flotte) se faufile là où un utilitaire reste bloqué, ce qui fait la différence aux heures de pointe. Le prix de chaque formule figure sur la page [tarif coursier Paris](/tarifs) et s’affiche avant de commander.",
        ],
      },
      {
        after: "context",
        title: "Coursier express en Île-de-France et en banlieue",
        paragraphs: [
          "La même course express est disponible hors de Paris : petite couronne (92, 93, 94), grande couronne (77, 78, 91, 95), Roissy et Orly. Le coursier part de l’adresse d’enlèvement et va directement à destination, avec un colis jusqu’à 18 kg.",
          "Pour la banlieue, voyez notre page [coursier banlieue Paris](/zones/petite-couronne), qui détaille les communes, les délais et les tarifs depuis et vers la petite couronne. Pour un coursier express en Île-de-France, le prix dépend de la zone la plus éloignée du trajet et du délai choisi, et s’affiche avant la commande.",
        ],
      },
    ],
    extraH2: { pricing: true, faq: true, ctaAsText: true },
    cta: {
      title: "Commander une course express",
      text: "Commandez en ligne ou appelez-nous : nous confirmons la faisabilité avant d’engager la course. Voir aussi le [tarif d'une course express](/tarifs), notre [coursier moto à Paris](/services/coursier-moto-paris) et [nos courses dans Paris](/zones/paris).",
    },
  },
};
