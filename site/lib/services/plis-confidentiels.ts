/**
 * lib/services/plis-confidentiels.ts
 * Prestation juridique & notariale. Requêtes visées : coursier juridique Paris,
 * transport de plis confidentiels, coursier huissier, remise en main propre.
 */
import type { Service } from "./types";

export const plisConfidentiels: Service = {
  slug: "plis-confidentiels",

  card: {
    tag: "01 - Juridique & notarial",
    title: "Plis confidentiels",
    body: "Remise en main propre, chaîne de responsabilité documentée, coursiers dédiés aux cabinets et études.",
    note: "Preuve de dépôt horodatée",
  },

  seo: {
    title: "Envoi de pli confidentiel à Paris - coursier juridique",
    description:
      "Envoyer un pli confidentiel à Paris : course dédiée pour avocats, notaires et huissiers, remise en main propre, preuve horodatée.",
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

  h1: "Envoi de pli confidentiel à Paris : coursier juridique, remise en main propre",

  intro:
    "One Connexion transporte les actes, conclusions et pièces de procédure des cabinets d’avocats, études notariales et offices d’huissiers d’Île-de-France. Chaque pli part en course dédiée, sans regroupement, et arrive avec une preuve de remise nominative.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "Dédiée", label: "Course sans regroupement" },
    { value: "En main propre", label: "Remise au destinataire" },
  ],

  context: {
    title: "Ce qu’un pli juridique ne pardonne pas",
    paragraphs: [
      "Un acte déposé après la clôture du greffe, c’est un délai forclos. Une pièce remise à une personne non identifiée, c’est une remise contestable. Dans le juridique, le transport ne relève pas de la commodité logistique : il s’inscrit dans la procédure et s’expose aux mêmes contestations qu’elle.",
      "La confidentialité impose une contrainte parallèle. Un pli qui voyage avec quinze autres colis, manipulé par trois personnes successives, ne permet plus d’établir qui a eu accès à quoi. C’est la raison pour laquelle nous n’appliquons aucun regroupement sur ces courses : un coursier, un pli, un trajet.",
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

  included: [
    "Course dédiée, sans regroupement avec d’autres plis",
    "Remise en main propre numérique",
    "Nom du destinataire, horodatage et lieu consignés",
    "Suivi de chaque course en ligne pendant le transport",
    "Justificatif de livraison archivé et restituable",
    "Coursier identifiable et joignable pendant la course",
    "Course dédiée, sans regroupement avec d’autres colis",
  ],

  useCases: [
    {
      title: "Dépôt au greffe avant clôture",
      body: "Un jeu de conclusions à déposer avant la fermeture du greffe. Enlèvement au cabinet, dépôt dans la journée, justificatif horodaté en retour.",
    },
    {
      title: "Transmission entre études",
      body: "Un acte à transmettre entre deux études parisiennes, avec remise nominative au clerc désigné et identification de la personne ayant signé.",
    },
    {
      title: "Pièces réclamées en audience",
      body: "Des originaux demandés en cours d’audience. Course immédiate du cabinet vers le palais, coursier joignable pendant tout le trajet.",
    },
  ],

  coverage:
    "Intramuros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne au tarif de leur zone. Les palais de justice, greffes et études d’Île-de-France sont desservis aux mêmes conditions.",

  pricing: {
    title: "Tarif d’un pli confidentiel",
    intro:
      "Un pli confidentiel se facture comme toute course : selon la zone et le délai, jamais selon la nature du document. La course dédiée et la remise en main propre au destinataire sont comprises, sans supplément.",
    recommended: ["standard", "urgent"],
    note:
      "Une audience, un dépôt au greffe ou un rendez-vous chez le notaire à heure fixe ? Choisissez Urgent ou Super : le coursier part dès la confirmation, sans attendre d’autres plis.",
  },

  faqTitle: "Vos questions sur l’envoi d’un pli confidentiel.",

  faq: [
    {
      question: "Qu’est-ce qu’un pli confidentiel ?",
      answer:
        "Un pli confidentiel est un document ou un courrier qui ne doit être remis qu’à son destinataire désigné : acte, conclusions, pièces de procédure, contrat ou courrier sensible. Il voyage fermé, sans regroupement avec d’autres envois, et n’est remis qu’à son destinataire, en main propre.",
    },
    {
      question: "Comment envoyer un pli confidentiel à Paris ?",
      answer:
        "Commandez une course en ligne, par téléphone ou par courriel en indiquant l’adresse d’enlèvement, la destination et l’heure limite. Un coursier prend le pli en charge, le transporte en course directe et le remet en main propre au destinataire, dont le nom et l’heure de remise sont enregistrés.",
    },
    {
      question: "La remise en main propre a-t-elle une valeur probante ?",
      answer:
        "Le justificatif enregistre le nom du destinataire, l’horodatage et le lieu de remise : il établit la réalité et la date de la remise. Il ne se substitue pas à une signification par huissier, qui constitue un acte de procédure distinct.",
    },
    {
      question: "Que se passe-t-il si le destinataire est absent ?",
      answer:
        "Le coursier vous appelle avant toute décision. Selon votre consigne, il patiente, remet à une personne que vous désignez, ou rapporte le pli au cabinet. Un pli confidentiel n’est jamais déposé en boîte aux lettres ni laissé à un tiers non identifié.",
    },
    {
      question: "Le pli voyage-t-il avec d’autres courses ?",
      answer:
        "Non. Les plis confidentiels partent en course dédiée : un coursier, un pli, un trajet direct. C’est la condition pour que la chaîne de responsabilité reste documentable de bout en bout.",
    },
    {
      question: "Combien de temps conservez-vous les justificatifs ?",
      answer:
        "Les justificatifs de remise (nom du destinataire, horodatage, lieu) sont archivés et restituables sur simple demande. Contactez-nous pour connaître les conditions d'archivage applicables à votre type de mission.",
    },
    {
      question: "Intervenez-vous en dehors des heures de bureau ?",
      answer:
        "Nous opérons du lundi au samedi, de 9h à 19h. Nous sommes fermés le dimanche et les jours fériés.",
    },
    {
      question: "Peut-on ouvrir un compte pour l’ensemble du cabinet ?",
      answer:
        "Oui. Le compte entreprise regroupe les courses de tous les collaborateurs, permet de régler les factures sous 30 jours.",
    },
  ],
};
