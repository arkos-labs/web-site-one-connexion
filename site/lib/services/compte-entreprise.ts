/**
 * lib/services/compte-entreprise.ts
 * Prestation transversale : compte entreprise, suivi et des factures à 30 jours.
 * Requête visée : « coursier pour entreprise » (partagée avec /secteurs, qui oriente
 * vers les pages service ; celle-ci porte l'ouverture du compte).
 *
 * Fonctionnement réel : ouverture immédiate en ligne ; une entreprise peut ouvrir plusieurs comptes
 * avec le même SIRET (un par collaborateur, service ou site) ; chaque compte voit ses propres courses
 * et reçoit ses propres factures, à régler sous 30 jours. Ne pas promettre d'export comptable ni de référence de dossier.
 */
import type { Service } from "./types";

export const compteEntreprise: Service = {
  slug: "compte-entreprise",

  card: {
    tag: "06 - Comptes entreprises",
    title: "Compte entreprise",
    body: "Vous ouvrez votre compte en deux minutes. Chaque service ou chaque site peut avoir le sien avec le même SIRET, vous suivez toutes vos courses au même endroit et vous payez sur facture à 30 jours.",
    note: "Paiement à 30 jours",
  },

  seo: {
    title: "Coursier pour entreprise : ouvrir un compte",
    description:
      "Coursier pour entreprise : ouvrez un compte, centralisez vos courses et gardez un interlocuteur unique pour tous vos envois professionnels.",
    keywords: [
      "coursier pour entreprise",
      "coursier paiement 30 jours",
      "contrat coursier entreprise Paris",
      "coursier multi-sites Île-de-France",
    ],
  },

  h1: "Coursier pour entreprise : ouvrir un compte",

  intro:
    "Ouvrez votre compte en ligne et commandez dans la minute. Chaque collaborateur, service ou site peut avoir son propre compte avec le même SIRET : chacun suit ses courses et reçoit ses factures, à régler sous 30 jours, sans avancer de frais.",

  stats: [
    { value: "Immédiate", label: "Ouverture du compte" },
    { value: "30 jours", label: "Pour régler les factures" },
    { value: "Illimité", label: "Comptes par SIRET" },
  ],

  context: {
    title: "Ce qu'apporte un compte entreprise",
    paragraphs: [
      "Dans la plupart des structures, les courses se commandent au fil de l’eau : chacun appelle, chacun avance, et la comptabilité récupère en fin de mois une liasse de justificatifs disparates qu’il faut rapprocher un par un. Le temps passé à régulariser dépasse souvent le prix des courses elles-mêmes.",
      "Avec un compte par service ou par site, ce tri est fait d’avance : chaque compte reçoit ses propres factures, avec le détail de ses courses. La comptabilité sait tout de suite à quel service rattacher chaque montant.",
      "Reste la preuve. Pour chaque course livrée, le nom de la personne qui a reçu le colis et l’heure de remise sont enregistrés dans l’espace du compte : le jour où une réception est contestée, l’information est retrouvée en quelques secondes.",
    ],
  },

  steps: [
    {
      title: "Ouverture immédiate",
      body: "En ligne, en 2 minutes : vous saisissez le SIRET, la raison sociale et l’adresse se remplissent seules. Le compte est actif tout de suite.",
    },
    {
      title: "Un compte par service ou par site",
      body: "D’autres collaborateurs, services ou sites de l’entreprise ouvrent leur propre compte avec le même SIRET. Chaque compte est indépendant.",
    },
    {
      title: "Chacun voit ses courses",
      body: "Dans son espace, chaque compte suit l’avancement de ses courses en ligne, de l’enlèvement à la remise. Les autres comptes de l’entreprise ne les voient pas.",
    },
    {
      title: "Preuve de livraison",
      body: "Pour chaque course livrée, le nom du destinataire et l’heure de remise sont enregistrés et consultables depuis l’espace du compte.",
    },
    {
      title: "Paiement à 30 jours",
      body: "Chaque compte reçoit ses factures, détaillées course par course, à régler sous 30 jours par carte, prélèvement ou virement.",
    },
  ],

  included: [
    "Ouverture du compte immédiate, en ligne",
    "Plusieurs comptes possibles avec le même SIRET",
    "Chaque compte voit uniquement ses propres courses",
    "Commandes sans avance de frais",
    "Suivi de chaque course en ligne",
    "Nom du destinataire et heure de remise enregistrés",
    "Factures par compte, détaillées course par course, à 30 jours",
  ],

  useCases: [
    {
      title: "Cabinet multi-associés",
      body: "Chaque associé ouvre son compte avec le SIRET du cabinet : il suit ses propres courses, et ses factures correspondent à ses dossiers.",
    },
    {
      title: "Entreprise multi-sites",
      body: "Trois implantations en Île-de-France ont chacune leur compte : chaque site commande, suit ses courses et reçoit sa facture, sans mélange avec les autres.",
    },
    {
      title: "Réception contestée",
      body: "Un client affirme ne pas avoir reçu un document. Le compte retrouve la course : nom de la personne qui l’a reçu et heure de remise.",
    },
  ],

  coverage:
    "Le compte entreprise couvre toutes nos prestations dans la capitale et en Île-de-France : plis confidentiels, transport médical, livraison e-commerce, courses événementielles et tournées régulières.",

  pricing: {
    title: "Les tarifs avec un compte entreprise",
    intro:
      "Un compte entreprise ne change pas le prix des courses : chaque compte commande à la grille ci-dessous, et les factures, détaillées course par course, se règlent sous 30 jours.",
    recommended: ["standard", "urgent", "flash"],
    note:
      "Au-delà d’un volume mensuel régulier, un tarif dégressif s’applique. Contactez-nous avec votre volume estimé pour le connaître.",
  },

  faqTitle: "Questions fréquentes",

  faq: [
    {
      question: "Comment ouvrir un compte entreprise ?",
      answer:
        "En ligne, en 2 minutes : vous saisissez le SIRET (la raison sociale et l’adresse se remplissent seules), le contact et l’adresse de facturation. Le compte est actif immédiatement, vous pouvez commander tout de suite.",
    },
    {
      question: "Plusieurs collaborateurs peuvent-ils avoir un compte ?",
      answer:
        "Oui. Une entreprise peut ouvrir autant de comptes qu’elle veut avec le même SIRET : un par collaborateur, par service ou par site. Chaque compte a son propre accès.",
    },
    {
      question: "Un compte voit-il les courses des autres comptes de l’entreprise ?",
      answer:
        "Non. Chaque compte voit uniquement ses propres courses et ses propres factures. Pour qu’une équipe partage le même suivi, elle utilise un seul compte commun.",
    },
    {
      question: "Comment fonctionne la facturation ?",
      answer:
        "Chaque compte reçoit ses factures, avec le détail de chaque course. Elles se règlent sous 30 jours, par carte, prélèvement ou virement, et restent disponibles dans l’espace du compte.",
    },
    {
      question: "Le compte couvre-t-il toutes les prestations ?",
      answer:
        "Oui : plis confidentiels, transport médical, livraison e-commerce, courses événementielles et tournées régulières se commandent depuis le même compte.",
    },
  ],

  outline: {
    sections: [
      { key: "context", title: "Coursier pour entreprise : ce que couvre le compte" },
      { key: "included", title: "Facturation et suivi des courses" },
      { key: "steps", title: "Comment se déroule l'ouverture" },
    ],
    extraSections: [
      {
        after: "included",
        title: "Livraison le jour même pour les équipes B2B",
        paragraphs: [
          "Avec un compte entreprise, chaque équipe peut commander une livraison le jour même : l’envoi part dès la confirmation, en course dédiée, avec une prise en charge en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité. Le prix s’affiche avant la commande, et la facture est rattachée au compte du service ou du site qui a commandé.",
          "Pour les besoins qui se répètent sur les mêmes trajets, les [tournées régulières](/services/tournees-regulieres) évitent de recommander chaque semaine. Le fonctionnement, les horaires et les métiers concernés sont détaillés sur la page [livraison le jour même B2B](/services/livraison-jour-meme-b2b). Toutes les prestations se commandent depuis le même compte : retrouvez les métiers desservis sur [coursier pour entreprise : nos secteurs](/secteurs), et la grille de prix sur la page [tarif coursier Paris](/tarifs).",
        ],
      },
    ],
    extraH2: { faq: true, ctaAsText: true },
    cta: {
      title: "Nous contacter",
      text: "Une question sur l’ouverture ou sur votre volume ? [Nous contacter](/contact). Découvrez aussi [nos secteurs d'activité](/secteurs) et notre [grille tarifaire](/tarifs).",
    },
    hidePricing: true,
  },
};
