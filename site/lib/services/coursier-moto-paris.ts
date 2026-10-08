/**
 * lib/services/coursier-moto-paris.ts
 * Page SEO dédiée. Requêtes visées : coursier moto Paris, coursier scooter
 * Paris, livraison moto Paris, prix coursier moto.
 * Chiffres repris de /tarifs et /flotte : ne pas en introduire de nouveaux ici.
 */
import type { Service } from "./types";

export const coursierMotoParis: Service = {
  slug: "coursier-moto-paris",

  card: {
    tag: "Deux-roues",
    title: "Coursier moto Paris",
    body: "Scooters et motos routières équipés pour un usage professionnel, top-case verrouillé et étanche, coursiers vérifiés.",
    note: "Course planifiée dès 15 € HT",
  },

  seo: {
    title: "Coursier moto et scooter Paris — dès 15 € HT",
    description:
      "Coursier moto et scooter à Paris : livraison express en deux-roues, top-case verrouillé, suivi en ligne, 7j/7. Course dès 15 € HT en planifié, devis gratuit en 2 h.",
    keywords: [
      "coursier moto Paris",
      "coursier scooter Paris",
      "livraison moto Paris",
      "coursier deux-roues Paris",
      "prix coursier moto Paris",
      "coursier moto Île-de-France",
    ],
  },

  h1: "Coursier moto et scooter à Paris : livraison express en deux-roues",

  intro:
    "One Connexion livre à Paris et en Île-de-France avec une flotte de scooters et de motos routières équipées pour un usage professionnel. Le deux-roues passe dans la circulation là où un utilitaire reste bloqué : c’est ce qui permet de tenir des délais courts.",

  stats: [
    { value: "Dès 15 € HT", label: "Course planifiée Paris" },
    { value: "< 45 min", label: "Prise en charge" },
    { value: "7j/7", label: "7h – 23h" },
  ],

  context: {
    title: "Pourquoi un coursier moto plutôt qu’un utilitaire",
    paragraphs: [
      "Dans Paris, la circulation décide du délai. Un scooter ou une moto traverse la ville sans dépendre des embouteillages, et reste disponible pour une course dédiée plutôt qu’une tournée avec plusieurs arrêts.",
      "Nos scooters électriques et 125cc circulent dans les rues les plus denses de Paris sans être limités par les restrictions ZFE. Nos motos routières de 300 à 600cc gardent une bonne vitesse sur les rocades et les axes rapides.",
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
      body: "Scooter pour l’intra-muros, moto routière pour les trajets plus longs ou rapides. Nous choisissons selon la mission.",
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
      title: "Signature à l’arrivée",
      body: "Le destinataire signe ; son nom et l’heure de remise sont enregistrés dans votre espace.",
    },
  ],

  included: [
    "Scooters et motos équipés pour un usage professionnel",
    "Top-case verrouillé et étanche, jusqu’à 18 kg",
    "Un colis par trajet, jamais de tournée partagée",
    "Progression de la moto visible en ligne",
    "Signature du destinataire enregistrée avec l’heure",
    "Coursiers vérifiés",
  ],

  useCases: [
    {
      title: "Documents et plis",
      body: "Contrats, actes et pièces administratives à transporter rapidement entre deux adresses, avec remise contre signature.",
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
    "Les 20 arrondissements de Paris, de 15 € HT en course planifiée, puis les Hauts-de-Seine, la Seine-Saint-Denis et le Val-de-Marne à partir de 22 € HT. Les aéroports et les autres départements d’Île-de-France se chiffrent sur devis.",

  faq: [
    {
      question: "Combien coûte un coursier moto à Paris ?",
      answer:
        "Une course en moto ou scooter démarre à partir de 15 € HT en course planifiée dans Paris et 22 € HT en course immédiate. En petite couronne, comptez à partir de 22 € HT en planifié et 30 € HT en immédiat. Devis gratuit en moins de 2 heures.",
    },
    {
      question: "Quels types de colis un coursier moto peut-il transporter ?",
      answer:
        "Documents, plis, petits colis et pièces légères, dans la limite d’un top-case verrouillé et étanche de 18 kg. Pour un colis plus volumineux, contactez-nous : nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      question: "Scooter ou moto : lequel est utilisé ?",
      answer:
        "Les scooters électriques et 125cc assurent les courses dans Paris. Les motos routières de 300 à 600cc sont utilisées pour la banlieue, les rocades et les trajets vers La Défense, Roissy ou Orly.",
    },
    {
      question: "Le coursier moto est-il plus rapide qu’un utilitaire ?",
      answer:
        "En ville, oui : le deux-roues contourne la congestion qui est le principal risque sur les délais courts. Pour les gros volumes, un utilitaire reste plus adapté.",
    },
    {
      question: "En combien de temps le coursier vient-il chercher mon colis ?",
      answer:
        "Dans Paris, la moto est généralement chez vous en moins de 45 minutes ; le délai exact vous est annoncé à la confirmation.",
    },
    {
      question: "Intervenez-vous le week-end ?",
      answer:
        "Tous les jours de 7h à 23h. Les courses du soir et du dimanche sont possibles, selon la disponibilité des pilotes au moment de la commande.",
    },
  ],
};
