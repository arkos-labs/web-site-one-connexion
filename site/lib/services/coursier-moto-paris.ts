/**
 * lib/services/coursier-moto-paris.ts
 * Page SEO dédiée. Requête visée : « coursier moto Paris ». « scooter » reste
 * secondaire (une seule mention dans le texte), le détail des véhicules vit sur
 * /flotte et les prix sur /tarifs.
 * Chiffres repris de /tarifs et /flotte : ne pas en introduire de nouveaux ici.
 */
import type { Service } from "./types";

export const coursierMotoParis: Service = {
  slug: "coursier-moto-paris",

  card: {
    tag: "Deux-roues",
    title: "Coursier moto Paris",
    body: "Scooters et motos routières équipés pour un usage professionnel, top-case verrouillé et étanche, coursiers vérifiés.",
    note: "Course dès 28 € TTC",
  },

  seo: {
    title: "Coursier moto à Paris : course dédiée en 45 min",
    description:
      "Coursier moto à Paris et en Île-de-France : un deux-roues dédié par envoi, 8h-19h, 7j/7. Délais constatés, traçabilité complète, devis en 2 h.",
    keywords: [
      "coursier moto Paris",
      "livraison moto Paris",
      "coursier deux-roues Paris",
      "coursier moto Île-de-France",
    ],
  },

  h1: "Coursier moto Paris : notre flotte de deux-roues",

  intro:
    "One Connexion livre dans la capitale et en Île-de-France avec sa propre flotte de deux-roues, équipés pour un usage professionnel. Le deux-roues passe dans la circulation là où un utilitaire reste bloqué : c’est ce qui permet de tenir des délais courts.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "18 kg", label: "Top-case verrouillé" },
    { value: "7j/7", label: "De 8h à 19h" },
  ],

  context: {
    title: "Pourquoi une course en deux-roues",
    paragraphs: [
      "En ville, la circulation décide du délai. Une moto traverse la ville sans dépendre des embouteillages, et reste disponible pour une course dédiée plutôt qu’une tournée avec plusieurs arrêts.",
      "Dans les rues les plus denses de la capitale, un deux-roues léger, comme un scooter, se faufile plus facilement. Sur les rocades et les axes rapides, une moto routière garde une bonne vitesse.",
      "Chaque véhicule est équipé d’un top-case verrouillé et étanche, jusqu’à 18 kg. Les colis volumineux ou lourds ne conviennent pas à ce mode de transport : dites-nous ce que vous envoyez, nous confirmons la faisabilité avant d’engager la course.",
    ],
  },

  steps: [
    {
      title: "Commande",
      body: "Vous décrivez le colis (contenu, poids approximatif), les deux adresses et l’heure à laquelle il doit arriver.",
    },
    {
      title: "Choix du véhicule",
      body: "Un deux-roues léger pour l’intra-muros, une moto routière pour les trajets plus longs ou rapides. Nous choisissons selon la mission.",
    },
    {
      title: "Enlèvement",
      body: "Le pilote arrive avec son top-case verrouillé, vérifie le colis avec vous et le range avant de partir.",
    },
    {
      title: "Un colis, un trajet",
      body: "La moto ne fait aucun autre arrêt. Vous voyez sa progression en ligne jusqu’à l’arrivée.",
    },
    {
      title: "Remise à l’arrivée",
      body: "Le colis est remis en main propre ; le nom du destinataire et l’heure de remise sont enregistrés dans votre espace.",
    },
  ],

  included: [
    "Deux-roues équipés pour un usage professionnel",
    "Top-case verrouillé et étanche, jusqu’à 18 kg",
    "Un colis par trajet, jamais de tournée partagée",
    "Progression de la moto visible en ligne",
    "Nom du destinataire et heure de remise enregistrés",
    "Coursiers vérifiés",
  ],

  useCases: [
    {
      title: "Documents et plis",
      body: "Contrats, actes et pièces administratives à transporter rapidement entre deux adresses, avec remise en main propre.",
    },
    {
      title: "Petits colis et pièces",
      body: "Pièces techniques, échantillons, matériel léger : tout ce qui tient dans un top-case de 18 kg maximum.",
    },
    {
      title: "Trajets vers la banlieue et les aéroports",
      body: "Une moto routière pour relier La Défense, Roissy ou Orly par les axes rapides.",
    },
  ],

  coverage:
    "Les 20 arrondissements de Paris, les Hauts-de-Seine, la Seine-Saint-Denis et le Val-de-Marne, ainsi que la grande couronne (77, 78, 91, 95).",

  pricing: {
    title: "Prix d’un coursier moto à Paris",
    intro:
      "Le tarif dépend de la zone et du délai choisis.",
    recommended: ["standard", "urgent", "flash"],
    note: "Le prix exact s’affiche avant de commander.",
  },

  faqTitle: "Vos questions sur le coursier moto.",

  faq: [
    {
      question: "Un coursier moto peut-il transporter des documents confidentiels ?",
      answer:
        "Oui. Un pli ou un document confidentiel part en course dédiée, sans regroupement, et est remis en main propre au destinataire désigné, avec le nom et l’heure de remise enregistrés.",
    },
    {
      question: "Livrez-vous des prélèvements ou des échantillons à moto ?",
      answer:
        "Oui, dans un contenant isotherme convenu à la commande, en course dédiée et directe. Précisez les conditions de température fixées par le laboratoire : nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      question: "Combien de temps pour une livraison moto dans Paris ?",
      answer:
        "L’enlèvement se fait en moins de 45 minutes, sous réserve de disponibilité. Le délai de livraison dépend de la formule : Normal 3 h, Urgent 1 h 30, Super 1 h.",
    },
  ],

  outline: {
    sections: [
      { key: "context", title: "Pourquoi une course en deux-roues" },
      { key: "steps", title: "Notre flotte et son organisation" },
      { key: "useCases", title: "Types d'envois confiés à un coursier moto" },
    ],
    extraSections: [
      {
        after: "context",
        title: "Pourquoi une moto plutôt qu’un vélo ou une voiture",
        paragraphs: [
          "Pour une course urgente à Paris, la moto est le compromis le plus fiable pour un usage professionnel. Elle passe entre les files là où une voiture ou un utilitaire reste bloqué, et elle transporte plus qu’un vélo : un top-case verrouillé et étanche accepte jusqu’à 18 kg, de quoi emporter des plis, des dossiers, des échantillons ou du petit matériel.",
          "Le vélo reste pertinent pour les très courtes distances dans l’hypercentre, et la voiture pour les volumes ou le matériel lourd. Dès qu’il faut combiner délai, capacité et fiabilité par tous les temps, le deux-roues motorisé répond le mieux à une course dédiée. C’est une question de délai tenu.",
          "Le deux-roues stationne plus facilement qu’un véhicule à quatre roues, ce qui évite de perdre du temps à chercher une place devant l’immeuble du destinataire. Pour les cas où le vélo ou la voiture sont plus adaptés, nous vous le disons à la commande.",
        ],
      },
      {
        after: "useCases",
        title: "Coursier moto par secteur : juridique, laboratoire, e-commerce",
        paragraphs: [
          "Juridique : actes, plis confidentiels et dossiers à remettre contre signature, avec la confidentialité d’une course dédiée et une remise nominative. Pour les professions du droit, voyez notre [coursier pour avocat et notaire](/services/coursier-avocat-notaire) ou le [pli confidentiel](/services/plis-confidentiels).",
          "Laboratoire : prélèvements, échantillons et matériel, transportés dans un contenant isotherme convenu à la commande, avec horodatage de la prise en charge et de la remise. Pour les prélèvements, voyez notre page [transport médical](/services/transport-medical).",
          "E-commerce : courses du dernier kilomètre, retours et livraisons à créneau, avec suivi en ligne et preuve de livraison. Pour un trajet direct le jour même, voyez notre [coursier express Paris](/services/coursier-express-paris).",
        ],
      },
    ],
    cta: {
      title: "Réserver une course moto",
      text: "Commandez en ligne ou appelez-nous : nous confirmons la faisabilité avant d’engager la course. Pour aller plus loin : [découvrir notre flotte](/flotte), notre [coursier express Paris](/services/coursier-express-paris) et notre [grille tarifaire](/tarifs).",
    },
    hidePricing: true,
  },
};
