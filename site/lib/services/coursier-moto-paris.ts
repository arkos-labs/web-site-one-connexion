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
    title: "Coursier moto Paris : courses rapides en deux-roues",
    description:
      "Coursier moto à Paris et en Île-de-France : une flotte de deux-roues dédiée aux courses professionnelles, avec un interlocuteur unique par envoi.",
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
      question: "Quels types de colis un coursier moto peut-il transporter ?",
      answer:
        "Documents, plis, petits colis et pièces légères, dans la limite d’un top-case verrouillé et étanche de 18 kg. Pour un colis plus volumineux, contactez-nous : nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      question: "Quel deux-roues est utilisé ?",
      answer:
        "Un deux-roues léger pour les courses intramuros, une moto routière pour la banlieue, les rocades et les trajets vers La Défense, Roissy ou Orly.",
    },
    {
      question: "Le coursier moto est-il plus rapide qu’un utilitaire ?",
      answer:
        "En ville, oui : le deux-roues contourne la congestion qui est le principal risque sur les délais courts. Pour les gros volumes, un utilitaire reste plus adapté.",
    },
    {
      question: "En combien de temps le coursier vient-il chercher mon colis ?",
      answer:
        "En intramuros, la moto est généralement chez vous en moins de 45 minutes ; le délai exact vous est annoncé à la confirmation.",
    },
    {
      question: "Intervenez-vous le week-end ?",
      answer:
        "Oui, 7j/7, de 8h à 19h.",
    },
  ],

  outline: {
    sections: [
      { key: "context", title: "Pourquoi une course en deux-roues" },
      { key: "steps", title: "Notre flotte et son organisation" },
      { key: "useCases", title: "Types d'envois confiés à un coursier moto" },
    ],
    cta: {
      title: "Réserver une course moto",
      text: "Commandez en ligne ou appelez-nous : nous confirmons la faisabilité avant d’engager la course. Pour aller plus loin : [découvrir notre flotte](/flotte), notre [coursier express Paris](/services/coursier-express-paris) et notre [grille tarifaire](/tarifs).",
    },
    hidePricing: true,
  },
};
