/**
 * lib/services/plis-confidentiels.ts
 * Prestation juridique & notariale. Requête visée : « pli confidentiel ». La
 * méthode d'envoi appartient au guide /guides/envoyer-un-pli-confidentiel-paris.
 */
import type { Service } from "./types";

export const plisConfidentiels: Service = {
  slug: "plis-confidentiels",

  card: {
    tag: "01 - Juridique & notarial",
    title: "Plis et actes juridiques",
    body: "Votre pli ne passe que par une seule paire de mains, celle du coursier, jusqu'au destinataire. Au tribunal, chez un notaire ou chez un huissier, il le remet en main propre et vous recevez l'heure exacte du dépôt.",
    note: "Preuve de dépôt horodatée",
  },

  serviceType: "Transport de plis confidentiels",

  seo: {
    title: "Coursier plis confidentiels à Paris : envoi sous pli scellé",
    description:
      "Transport de plis confidentiels à Paris : course dédiée, pli scellé, remise en main propre contre signature et suivi en direct de la prise en charge à la remise.",
    keywords: [
      "pli confidentiel",
      "envoi pli confidentiel Paris",
      "coursier juridique Paris",
      "transport plis confidentiels",
      "coursier huissier Paris",
      "coursier notaire Paris",
      "remise en main propre",
    ],
  },

  h1: "Pli confidentiel : envoi sécurisé par coursier dédié",

  intro:
    "One Connexion transporte les actes, conclusions et pièces de procédure des cabinets d’avocats, études notariales et offices d’huissiers d’Île-de-France. Chaque pli part en course dédiée, sans regroupement, et arrive avec une preuve de remise nominative. Comment savez-vous que mon pli est bien arrivé ? Au moment de la remise, le coursier enregistre le nom de la personne qui reçoit le pli, prend une photo et horodate la remise. Ces éléments sont transmis dans la minute, puis archivés sur votre compte pendant 12 mois. Pendant la course, vous suivez l’avancement en ligne.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "Dédiée", label: "Course sans regroupement" },
    { value: "En main propre", label: "Remise au destinataire" },
  ],

  context: {
    title: "Pli confidentiel : ce que nous transportons",
    paragraphs: [
      "Un envoi sous pli confidentiel est un document qui ne doit être remis qu’à son destinataire désigné : acte, conclusions, pièces de procédure, contrat ou courrier sensible. Il voyage fermé, sans regroupement avec d’autres envois, et n’est remis qu’en main propre.",
      "Un acte déposé après la clôture du greffe, c’est un délai forclos. Une pièce remise à une personne non identifiée, c’est une remise contestable. Dans le juridique, le transport ne relève pas de la commodité logistique : il s’inscrit dans la procédure et s’expose aux mêmes contestations qu’elle.",
      "La confidentialité impose une contrainte parallèle. Un pli qui voyage avec quinze autres colis, manipulé par trois personnes successives, ne permet plus d’établir qui a eu accès à quoi. C’est la raison pour laquelle nous n’appliquons aucun regroupement sur ces courses : un coursier, un pli, un trajet.",
      "Concrètement, nous transportons des actes, des contrats, des dossiers juridiques et des résultats d’analyses. Pour les professions du droit, voyez notre [coursier pour avocat et notaire](/services/coursier-avocat-notaire) ; pour les résultats et prélèvements, notre [coursier de laboratoire](/services/coursier-laboratoire).",
      "Reste la preuve. Un justificatif de livraison n’a de valeur que s’il nomme la personne qui a reçu le pli, l’heure exacte et le lieu. Ces éléments sont enregistrés au moment de la remise, archivés, et restitués sur demande pour être versés au dossier.",
    ],
  },

  steps: [
    {
      title: "Commande",
      body: "Sur le site, par téléphone ou par courriel, avec l’adresse d’enlèvement, la destination et l’heure limite de remise. Nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      title: "Enlèvement",
      body: "Le coursier vient chercher le pli au cabinet et le garde avec lui jusqu’à la remise : il ne passe par aucun dépôt ni aucune autre main.",
    },
    {
      title: "Transport dédié",
      body: "Course directe, sans regroupement ni passage par un centre de tri. L'avancement de la course est visible en ligne à chaque étape.",
    },
    {
      title: "Remise en main propre",
      body: "Le pli est remis au destinataire en personne. Son nom, l’horodatage et le lieu sont consignés au moment précis de la remise.",
    },
    {
      title: "Preuve archivée",
      body: "Le justificatif vous est transmis puis conservé. Vous pouvez le redemander pour l’annexer à un dossier.",
    },
  ],

  // Photo interne, anonymisée. Écartées : la photo de remise (trop basse
  // définition) et la photo de banque d'images (ni casque ni top-case, logo tiers).
  photos: {
    context: {
      src: "/images/services/pli-confidentiel/pli-confidentiel-enveloppe-fermee-paris.webp",
      alt: "Enveloppe kraft fermée, tenue à deux mains avant sa remise.",
      caption: "Un pli fermé, une course dédiée : il ne circule pas avec d’autres envois.",
      width: 1200,
      height: 800,
    },
  },

  included: [
    "Course dédiée, sans regroupement avec d’autres plis",
    "Remise en main propre numérique",
    "Nom du destinataire, horodatage et lieu consignés",
    "Suivi de chaque course en ligne pendant le transport",
    "Justificatif de livraison archivé et restituable",
    "Coursier identifiable et joignable pendant la course",
  ],

  useCases: [
    {
      title: "Dépôt au greffe avant clôture",
      body: "Un jeu de conclusions à déposer avant la fermeture du greffe. Enlèvement au cabinet, dépôt dans la journée, justificatif horodaté en retour.",
    },
    {
      title: "Transmission entre études",
      body: "Un acte à transmettre entre deux études parisiennes, remis en main propre au clerc désigné, dont le nom et l’heure de remise sont consignés.",
    },
    {
      title: "Pièces réclamées en audience",
      body: "Des originaux demandés en cours d’audience. Course immédiate du cabinet vers le palais, coursier joignable pendant tout le trajet. Voir aussi notre [coursier pour avocat et notaire](/services/coursier-avocat-notaire).",
    },
  ],

  coverage:
    "Prise en charge en moins de 45 minutes, 7j/7 de 7h à 23h. Intramuros et petite couronne (92, 93, 94) au tarif standard ; Roissy, Orly et le reste de l’Île-de-France au tarif de leur zone. Les palais de justice, greffes et études sont desservis aux mêmes conditions. Les prix par zone sont détaillés sur la [grille de tarifs](/tarifs).",

  pricing: {
    title: "Tarifs d’un envoi de pli confidentiel",
    intro:
      "Un pli confidentiel se facture comme toute course : selon la zone et le délai, jamais selon la nature du document. La course dédiée et la remise en main propre au destinataire sont comprises, sans supplément.",
    recommended: ["standard", "urgent"],
    note:
      "Une audience, un dépôt au greffe ou un rendez-vous chez le notaire à heure fixe ? Choisissez Urgent ou Super : le coursier part dès la confirmation, sans attendre d’autres plis.",
  },

  faqTitle: "Questions fréquentes",

  faq: [
    {
      question: "Quel est le délai pour un envoi de pli confidentiel ?",
      answer:
        "La prise en charge se fait en moins de 45 minutes, 7j/7 de 7h à 23h. Le coursier part en course directe vers le destinataire, sans regroupement : le délai total dépend de la distance et de la formule choisie (Standard, Urgent ou Super).",
    },
    {
      question: "Comment la confidentialité du pli est-elle garantie ?",
      answer:
        "Un coursier, un pli, un trajet : le pli ne passe par aucun dépôt ni aucune autre main, et n’est jamais regroupé avec d’autres envois. Il est remis uniquement au destinataire désigné, jamais déposé en boîte aux lettres ni laissé à un tiers non identifié.",
    },
    {
      question: "La preuve de remise a-t-elle une valeur probante ?",
      answer:
        "Le justificatif enregistre le nom du destinataire, l’horodatage et le lieu de remise : il établit la réalité et la date de la remise, et reste restituable sur demande pour être versé à un dossier. Il ne se substitue pas à une signification par huissier, qui est un acte de procédure distinct.",
    },
    {
      question: "Combien coûte l’envoi d’un pli confidentiel ?",
      answer:
        "Un pli confidentiel se facture comme toute course : selon la zone et le délai, jamais selon la nature du document. La course dédiée et la remise en main propre sont comprises, sans supplément. Les prix par zone figurent sur la grille de tarifs.",
    },
    {
      question: "Quelles zones sont couvertes pour un pli confidentiel ?",
      answer:
        "Paris intramuros, la petite couronne (92, 93, 94) et le reste de l’Île-de-France, y compris Roissy et Orly, au tarif de leur zone. Les palais de justice, greffes et études notariales sont desservis aux mêmes conditions.",
    },
  ],

  outline: {
    sections: [
      { key: "context", title: "Pli confidentiel : ce que nous transportons" },
      { key: "steps", title: "Envoi pli confidentiel : la chaîne de traçabilité" },
    ],
    extraH2: {
      coverage: "Délais et zones couvertes (Paris, petite couronne, Île-de-France)",
      pricing: true,
      faq: true,
      ctaAsText: true,
    },
    cta: {
      title: "Demander une course pour un pli confidentiel",
      text: "Appelez-nous ou écrivez-nous pour [organiser une course](/contact) : nous confirmons la faisabilité avant d’engager le coursier. Pour préparer le document, lisez notre guide pour [envoyer un pli confidentiel à Paris](/guides/envoyer-un-pli-confidentiel-paris).",
    },
  },
};
