/**
 * lib/services/plis-confidentiels.ts
 * Prestation juridique & notariale. Requêtes visées : coursier juridique Paris,
 * transport de plis confidentiels, coursier huissier, remise contre signature.
 */
import type { Service } from "./types";

export const plisConfidentiels: Service = {
  slug: "plis-confidentiels",

  card: {
    tag: "01 — Juridique & notarial",
    title: "Plis confidentiels",
    body: "Remise contre signature, chaîne de responsabilité documentée, coursiers dédiés aux cabinets et études.",
    note: "Preuve de dépôt horodatée",
  },

  seo: {
    title: "Coursier juridique à Paris — plis confidentiels remis contre signature",
    description:
      "Transport de plis confidentiels pour cabinets d’avocats, études notariales et offices d’huissiers à Paris et en petite couronne. Course dédiée, remise contre signature, preuve horodatée.",
    keywords: [
      "coursier juridique Paris",
      "transport plis confidentiels",
      "coursier huissier Paris",
      "coursier notaire Paris",
      "remise contre signature",
    ],
  },

  h1: "Coursier juridique à Paris : plis confidentiels remis contre signature",

  intro:
    "One Connexion transporte les actes, conclusions et pièces de procédure des cabinets d’avocats, études notariales et offices d’huissiers d’Île-de-France. Chaque pli part en course dédiée, sans regroupement, et arrive avec une preuve de remise nominative.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "3,5 M€", label: "Assurance marchandises" },
  ],

  context: {
    title: "Ce qu’un pli juridique ne pardonne pas",
    paragraphs: [
      "Un acte déposé après la clôture du greffe, c’est un délai forclos. Une pièce remise à une personne non identifiée, c’est une remise contestable. Dans le juridique, le transport ne relève pas de la commodité logistique : il s’inscrit dans la procédure et s’expose aux mêmes contestations qu’elle.",
      "La confidentialité impose une contrainte parallèle. Un pli qui voyage avec quinze autres colis, manipulé par trois personnes successives, ne permet plus d’établir qui a eu accès à quoi. C’est la raison pour laquelle nous n’appliquons aucun regroupement sur ces courses : un coursier, un pli, un trajet.",
      "Reste la preuve. Un justificatif de livraison n’a de valeur que s’il nomme la personne qui a signé, l’heure exacte et le lieu. Ces éléments sont enregistrés au moment de la remise, archivés, et restitués sur demande pour être versés au dossier.",
    ],
  },

  steps: [
    {
      title: "Commande",
      body: "Par téléphone ou par courriel, avec l’adresse d’enlèvement, la destination et l’heure limite de remise. Nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      title: "Enlèvement",
      body: "Le coursier se présente au cabinet et prend le pli en charge nominativement. Le pli ne quitte pas sa sacoche jusqu’à la remise.",
    },
    {
      title: "Transport dédié",
      body: "Course directe, sans regroupement ni passage par un centre de tri. La position du coursier est suivie en temps réel pendant tout le trajet.",
    },
    {
      title: "Remise contre signature",
      body: "Le destinataire signe numériquement. Le nom du signataire, l’horodatage et le lieu sont consignés au moment précis de la remise.",
    },
    {
      title: "Preuve archivée",
      body: "Le justificatif vous est transmis puis conservé. Vous pouvez le redemander pour l’annexer à un dossier.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement avec d’autres plis",
    "Remise en main propre contre signature numérique",
    "Nom du signataire, horodatage et lieu consignés",
    "Suivi de position en temps réel pendant le transport",
    "Justificatif de livraison archivé et restituable",
    "Coursier identifiable et joignable pendant la course",
    "Assurance marchandises jusqu’à 3,5 M€",
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
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Les palais de justice, greffes et études d’Île-de-France sont desservis aux mêmes conditions.",

  faq: [
    {
      question: "La remise contre signature a-t-elle une valeur probante ?",
      answer:
        "Le justificatif enregistre le nom du signataire, l’horodatage et le lieu de remise : il établit la réalité et la date de la remise. Il ne se substitue pas à une signification par huissier, qui constitue un acte de procédure distinct.",
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
        "Les justificatifs de remise (nom du signataire, horodatage, lieu) sont archivés et restituables sur simple demande. Contactez-nous pour connaître les conditions d'archivage applicables à votre type de mission.",
    },
    {
      question: "Intervenez-vous en dehors des heures de bureau ?",
      answer:
        "Nous opérons 7j/7, de 7h à 23h. Les courses du soir et du week-end s’organisent aux mêmes conditions, sous réserve de disponibilité au moment de la commande.",
    },
    {
      question: "Peut-on ouvrir un compte pour l’ensemble du cabinet ?",
      answer:
        "Oui. Le compte entreprise regroupe les courses de tous les collaborateurs, centralise la facturation sur une échéance mensuelle et permet l’imputation par dossier.",
    },
  ],
};
