/**
 * lib/services/transport-medical.ts
 * Prestation santé & laboratoires. Requêtes visées : coursier médical Paris,
 * transport de prélèvements, transport d'échantillons biologiques Île-de-France.
 *
 * ATTENTION : aucune conformité réglementaire (UN3373, ADR, agrément) n'est
 * affirmée ici. Les mentions correspondantes restent PLACEHOLDER.
 */
import type { Service } from "./types";

export const transportMedical: Service = {
  slug: "transport-medical",

  card: {
    tag: "02 — Santé & laboratoires",
    title: "Transport médical",
    body: "Prélèvements, pièces critiques et matériel technique. Contenants isothermes et relevés de température à la demande.",
    note: "Course dédiée, sans regroupement",
  },

  seo: {
    title: "Coursier médical à Paris — transport de prélèvements et matériel de laboratoire",
    description:
      "Transport urgent de prélèvements, échantillons et matériel technique pour laboratoires, cliniques et cabinets d’Île-de-France. Course dédiée, contenants isothermes, traçabilité de bout en bout.",
    keywords: [
      "coursier médical Paris",
      "transport prélèvements laboratoire",
      "transport échantillons biologiques Île-de-France",
      "coursier laboratoire analyses Paris",
      "transport urgent matériel médical",
    ],
  },

  h1: "Transport médical urgent à Paris : prélèvements et matériel de laboratoire",

  intro:
    "One Connexion achemine les prélèvements, échantillons et pièces techniques des laboratoires d’analyses, cliniques et cabinets d’Île-de-France. Course dédiée, contenant adapté, et une contrainte qui commande tout le reste : le délai de stabilité de ce qui est transporté.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "Sans regroupement", label: "Course dédiée" },
  ],

  context: {
    title: "Un échantillon ne se renvoie pas",
    paragraphs: [
      "Un prélèvement dégradé n’est pas une livraison ratée : c’est un patient qu’il faut reconvoquer, une analyse à refaire, et un résultat qui arrive trop tard pour la décision qu’il devait éclairer. Contrairement à un colis, un échantillon ne se réexpédie pas.",
      "Le délai de stabilité commande toute la course. Il varie selon la nature du prélèvement et les exigences du laboratoire destinataire : c’est vous qui le fixez, et c’est lui qui détermine si la course est réalisable. Nous confirmons la faisabilité avant d’engager, plutôt que d’accepter puis d’échouer.",
      "Le maintien en température suit la même logique. Le contenant isotherme est choisi en fonction de ce qui est transporté, et un relevé de température peut être joint à la course lorsque le protocole du laboratoire l’exige — à préciser à la commande.",
    ],
  },

  steps: [
    {
      title: "Commande et faisabilité",
      body: "Vous indiquez la nature du transport, le délai de stabilité et les conditions de température. Nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      title: "Enlèvement conditionné",
      body: "Le coursier se présente avec le contenant adapté convenu à la commande. Le conditionnement de l’échantillon relève du site expéditeur, conformément aux protocoles en vigueur.",
    },
    {
      title: "Transport direct",
      body: "Course dédiée, sans regroupement ni rupture de charge. Le deux-roues s’affranchit des congestions qui constituent le principal risque sur les délais courts.",
    },
    {
      title: "Suivi en temps réel",
      body: "La position du coursier est consultable pendant toute la course. Le laboratoire destinataire peut anticiper la réception.",
    },
    {
      title: "Remise et traçabilité",
      body: "Remise en main propre au service destinataire, horodatée et nominative. Relevé de température joint lorsque la course en prévoit un.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement ni rupture de charge",
    "Contenant isotherme adapté, convenu à la commande",
    "Relevé de température sur demande",
    "Confirmation de faisabilité avant engagement de la course",
    "Suivi de position en temps réel",
    "Remise en main propre horodatée et nominative",
    "Coursier joignable pendant toute la course",
  ],

  useCases: [
    {
      title: "Prélèvements vers un plateau technique",
      body: "Des prélèvements collectés en cabinet à acheminer vers le plateau technique dans le délai de stabilité fixé par le laboratoire.",
    },
    {
      title: "Transfert inter-sites",
      body: "Un échantillon à transférer entre deux sites d’un même groupe pour une analyse spécialisée, avec maintien des conditions de température.",
    },
    {
      title: "Pièce technique immobilisante",
      body: "Une pièce de rechange qui bloque un automate d’analyse. Enlèvement chez le fournisseur et livraison directe au service technique.",
    },
  ],

  coverage:
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Laboratoires, cliniques et plateaux techniques d’Île-de-France desservis aux mêmes conditions.",

  faq: [
    {
      question: "Comment le maintien en température est-il assuré ?",
      answer:
        "Le contenant isotherme est choisi à la commande en fonction de la nature du transport et de la durée prévue. Un relevé de température peut être joint lorsque le protocole du laboratoire l’exige : précisez-le au moment de la commande.",
    },
    {
      question: "Qui est responsable du conditionnement de l’échantillon ?",
      answer:
        "Le conditionnement relève du site expéditeur, qui applique les protocoles propres à la nature du prélèvement. Nous assurons le transport dans le contenant convenu et le maintien des conditions pendant la course.",
    },
    {
      question: "Que se passe-t-il si le délai de stabilité ne peut pas être tenu ?",
      answer:
        "Nous vous le disons avant d’engager la course, pas après. La faisabilité est confirmée au moment de la commande en fonction du délai que vous fixez, de l’heure et de la distance.",
    },
    {
      question: "Disposez-vous des habilitations réglementaires pour le transport d’échantillons biologiques ?",
      answer:
        "PLACEHOLDER — habilitations, formations ADR et conformité au conditionnement UN3373 à documenter et faire valider avant mise en ligne. Ne pas publier cette page sans avoir tranché ce point.",
    },
    {
      question: "Assurez-vous des tournées récurrentes ?",
      answer:
        "Oui. Les collectes régulières entre sites ou cabinets et plateau technique s’organisent sur créneaux fixes dans le cadre d’un compte entreprise.",
    },
    {
      question: "Intervenez-vous le week-end ?",
      answer:
        "Nous opérons 7j/7, de 7h à 23h. Les collectes de week-end s’organisent aux mêmes conditions, sous réserve de disponibilité au moment de la commande.",
    },
  ],
};
