/**
 * lib/services/compte-entreprise.ts
 * Prestation transversale : suivi, justificatifs et facturation centralisée.
 * Requêtes visées : compte coursier entreprise, facturation mensuelle coursier.
 */
import type { Service } from "./types";

export const compteEntreprise: Service = {
  slug: "compte-entreprise",

  card: {
    tag: "04 — Comptes entreprises",
    title: "Suivi & facturation",
    body: "Position en temps réel, justificatifs de livraison archivés, facturation mensuelle centralisée et export comptable.",
    note: "Interlocuteur unique",
  },

  seo: {
    title: "Compte entreprise coursier — suivi en temps réel et facturation centralisée",
    description:
      "Ouvrez un compte coursier pour votre entreprise à Paris : commandes par plusieurs collaborateurs, justificatifs archivés, facturation mensuelle unique et export comptable.",
    keywords: [
      "compte coursier entreprise",
      "facturation mensuelle coursier",
      "contrat coursier entreprise Paris",
      "coursier multi-sites Île-de-France",
    ],
  },

  h1: "Compte entreprise : suivi en temps réel et facturation centralisée",

  intro:
    "Le compte entreprise regroupe les courses de tous vos collaborateurs et de tous vos sites sous une facturation unique. Un interlocuteur, une échéance mensuelle, et des justificatifs archivés que vous pouvez retrouver des mois plus tard.",

  stats: [
    { value: "1", label: "Interlocuteur dédié" },
    { value: "Mensuelle", label: "Facturation" },
    { value: "Sous 2 h", label: "Réponse aux devis" },
  ],

  context: {
    title: "Le coût d’une course n’est pas seulement son prix",
    paragraphs: [
      "Dans la plupart des structures, les courses se commandent au fil de l’eau : chacun appelle, chacun avance, et la comptabilité récupère en fin de mois une liasse de justificatifs disparates qu’il faut rapprocher un par un. Le temps passé à régulariser dépasse souvent le prix des courses elles-mêmes.",
      "Le second angle mort est la preuve. Un justificatif de livraison ne sert à rien le jour de la course : il sert six mois plus tard, quand un client ou une partie adverse conteste une réception. S’il n’est pas archivé et retrouvable, il n’existe pas.",
      "Le compte entreprise traite les deux : une facture unique par mois, imputable par dossier ou par service, et des justificatifs conservés et restituables à la demande.",
    ],
  },

  steps: [
    {
      title: "Ouverture du compte",
      body: "Nous définissons ensemble les sites concernés, les collaborateurs autorisés à commander et les consignes de repli en cas d’absence du destinataire.",
    },
    {
      title: "Commandes multi-collaborateurs",
      body: "Chaque collaborateur autorisé commande par téléphone ou par courriel. Les courses sont rattachées automatiquement au compte, sans avance de frais.",
    },
    {
      title: "Suivi en temps réel",
      body: "La position du coursier est consultable pendant la course, pour le demandeur comme pour le destinataire.",
    },
    {
      title: "Justificatifs archivés",
      body: "Chaque remise génère un justificatif horodaté et nominatif, conservé et restituable sur demande.",
    },
    {
      title: "Facturation centralisée",
      body: "Une facture mensuelle unique, détaillée course par course, avec export comptable et imputation par dossier ou par service.",
    },
  ],

  included: [
    "Interlocuteur unique pour l’ensemble du compte",
    "Commandes par plusieurs collaborateurs, sans avance de frais",
    "Suivi de position en temps réel",
    "Justificatifs de livraison archivés et restituables",
    "Facture mensuelle unique et détaillée",
    "Export comptable et imputation par dossier ou service",
    "Consignes de livraison définies une fois pour toutes",
  ],

  useCases: [
    {
      title: "Cabinet multi-associés",
      body: "Quinze collaborateurs commandent des courses sans avancer de frais ; la comptabilité reçoit une facture unique, imputable par dossier.",
    },
    {
      title: "Entreprise multi-sites",
      body: "Trois implantations en Île-de-France commandent indépendamment, sous un seul contrat et une seule échéance mensuelle.",
    },
    {
      title: "Justificatif réclamé a posteriori",
      body: "Une réception contestée plusieurs mois après la livraison. Le justificatif horodaté et nominatif est retrouvé et transmis.",
    },
  ],

  coverage:
    "Le compte entreprise couvre l’ensemble de nos prestations sur Paris et la petite couronne (92, 93, 94), Roissy, Orly et la grande couronne sur devis. Il s’applique indifféremment aux plis confidentiels, au transport médical et à la livraison e-commerce.",

  faq: [
    {
      question: "Y a-t-il un volume minimum pour ouvrir un compte ?",
      answer:
        "PLACEHOLDER — conditions d’ouverture et volume minimum éventuel à confirmer avant mise en ligne.",
    },
    {
      question: "Comment sont imputées les courses par dossier ou par service ?",
      answer:
        "La référence de dossier ou de service est indiquée au moment de la commande ; elle est reprise sur le détail de la facture mensuelle, ce qui permet la refacturation ou l’imputation analytique.",
    },
    {
      question: "Combien de temps les justificatifs sont-ils conservés ?",
      answer:
        "PLACEHOLDER — durée de conservation des justificatifs à confirmer avant mise en ligne.",
    },
    {
      question: "Quels sont les délais de règlement ?",
      answer:
        "PLACEHOLDER — conditions et délais de règlement à confirmer avant mise en ligne.",
    },
    {
      question: "Plusieurs collaborateurs peuvent-ils commander ?",
      answer:
        "Oui. Vous désignez les collaborateurs autorisés à l’ouverture du compte ; ils commandent sans avance de frais, et toutes les courses remontent sur la même facture.",
    },
    {
      question: "Le compte couvre-t-il toutes les prestations ?",
      answer:
        "Oui : plis confidentiels, transport médical et livraison e-commerce relèvent du même compte, du même interlocuteur et de la même facture mensuelle.",
    },
  ],
};
