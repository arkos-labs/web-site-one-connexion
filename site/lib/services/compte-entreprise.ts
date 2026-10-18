/**
 * lib/services/compte-entreprise.ts
 * Prestation transversale : compte entreprise, suivi et des factures à 30 jours.
 * Requêtes visées : compte coursier entreprise, factures à 30 jours coursier.
 *
 * Fonctionnement réel : ouverture immédiate en ligne ; une entreprise peut ouvrir plusieurs comptes
 * avec le même SIRET (un par collaborateur, service ou site) ; chaque compte voit ses propres courses
 * et reçoit ses propres factures, à régler sous 30 jours. Ne pas promettre d'export comptable ni de référence de dossier.
 */
import type { Service } from "./types";

export const compteEntreprise: Service = {
  slug: "compte-entreprise",

  card: {
    tag: "04 - Comptes entreprises",
    title: "Suivi & facturation",
    body: "Ouverture immédiate, un compte par collaborateur, service ou site, suivi de chaque course et factures à 30 jours.",
    note: "Plusieurs comptes avec le même SIRET",
  },

  seo: {
    title: "Compte entreprise coursier - paiement à 30 jours",
    description:
      "Compte coursier pour votre entreprise à Paris : ouverture immédiate en ligne, plusieurs comptes avec le même SIRET (un par service ou par site), suivi de chaque course et factures à régler sous 30 jours.",
    keywords: [
      "compte coursier entreprise",
      "coursier paiement 30 jours",
      "contrat coursier entreprise Paris",
      "coursier multi-sites Île-de-France",
    ],
  },

  h1: "Compte entreprise : ouverture immédiate, suivi en ligne et paiement à 30 jours",

  intro:
    "Ouvrez votre compte en ligne et commandez dans la minute. Chaque collaborateur, service ou site peut avoir son propre compte avec le même SIRET : chacun suit ses courses et reçoit ses factures, à régler sous 30 jours, sans avancer de frais.",

  stats: [
    { value: "Immédiate", label: "Ouverture du compte" },
    { value: "30 jours", label: "Pour régler les factures" },
    { value: "Illimité", label: "Comptes par SIRET" },
  ],

  context: {
    title: "Le coût d’une course n’est pas seulement son prix",
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
    "Le compte entreprise couvre toutes nos prestations à Paris et en Île-de-France, chacune au tarif de sa zone : plis confidentiels, transport médical, livraison e-commerce, courses événementielles et tournées régulières.",

  pricing: {
    title: "Les tarifs avec un compte entreprise",
    intro:
      "Un compte entreprise ne change pas le prix des courses : chaque compte commande à la grille ci-dessous, et les factures, détaillées course par course, se règlent sous 30 jours.",
    recommended: ["standard", "urgent", "flash"],
    note:
      "Au-delà d’un volume mensuel régulier, un tarif dégressif s’applique. Contactez-nous avec votre volume estimé pour le connaître.",
  },

  faqTitle: "Vos questions sur le compte entreprise.",

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
        "Oui : plis confidentiels, transport médical, livraison e-commerce, courses événementielles et tournées régulières se commandent depuis le même compte, au tarif de la grille.",
    },
  ],
};
