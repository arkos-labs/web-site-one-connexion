/**
 * lib/services/livraison-e-commerce.ts
 * Prestation e-commerce. Requêtes visées : livraison le jour même Paris,
 * coursier e-commerce, livraison same day Île-de-France.
 */
import type { Service } from "./types";

export const livraisonEcommerce: Service = {
  slug: "livraison-e-commerce",

  card: {
    tag: "03 - E-commerce",
    title: "Livraison programmée ou urgente",
    body: "Vous programmez une livraison plusieurs jours à l'avance. Ou vous êtes pressé : un coursier vient chercher le colis sur le lieu d'enlèvement et le livre dans l'heure, dans les 3 heures ou dans la journée, à Paris et en petite couronne.",
    note: "Programmée ou urgente",
  },

  seo: {
    title: "Coursier jour : livraison same-day pour l'e-commerce",
    description:
      "Livraison programmée ou urgente à Paris et en petite couronne : enlèvement sur le lieu de départ, livraison dans l'heure, dans les 3 heures ou dans la journée. Suivi en ligne, preuve de livraison.",
    keywords: [
      "livraison jour même Paris",
      "coursier e-commerce Paris",
      "livraison same day Île-de-France",
      "livraison dernier kilomètre Paris",
      "coursier boutique en ligne",
    ],
  },

  h1: "Livraison programmée ou urgente",

  intro:
    "Vos clients peuvent prendre rendez-vous plusieurs jours à l’avance. Ou être livrés en urgence : dans l’heure, dans les 3 heures ou dans la journée. One Connexion vient chercher le colis sur le lieu d’enlèvement et le livre dans la capitale et la petite couronne.",

  stats: [
    { value: "Jour même", label: "Délai de livraison" },
    { value: "< 45 min", label: "Enlèvement" },
    { value: "18 kg", label: "Charge par course" },
  ],

  context: {
    title: "Le dernier kilomètre porte votre promesse, pas la nôtre",
    paragraphs: [
      "Le transporteur est invisible tant que tout va bien. Dès qu’une livraison échoue, c’est votre marque que le client tient pour responsable, votre service client qui absorbe la réclamation, et votre note qui en porte la trace. Le dernier kilomètre est le seul moment physique de la relation : il vaut mieux qu’il soit tenu.",
      "L’échec de livraison est le premier poste de coût caché du secteur. Un destinataire absent, c’est une seconde présentation, un colis qui dort quelque part, et un client qui ne comprend pas. Laisser le destinataire choisir son créneau supprime la cause à la racine plutôt que d’en traiter les conséquences.",
      "Avoir les deux options change l’argument commercial. Une livraison programmée rassure le client qui planifie, une livraison urgente sauve la vente de celui qui hésitait à traverser la ville pour acheter en boutique.",
    ],
  },

  steps: [
    {
      title: "Collecte",
      body: "Enlèvement sur le lieu de départ, à l’heure prévue ou dès l’appel, selon le type de livraison choisi.",
    },
    {
      title: "Créneau avec le destinataire",
      body: "Le créneau de réception est choisi à l’avance par le destinataire. C’est la première cause d’échec de livraison qui disparaît.",
    },
    {
      title: "Livraison sur le créneau",
      body: "Course directe dans la capitale et la petite couronne, à l’heure réservée. Le deux-roues n’attend ni les bouchons ni les restrictions de circulation.",
    },
    {
      title: "Remise et preuve",
      body: "Remise en main propre, horodatée. La preuve de livraison est disponible pour votre service client en cas de contestation.",
    },
    {
      title: "Retour éventuel",
      body: "En cas d’absence malgré le créneau, le colis vous est rapporté ou représenté selon la consigne définie à l’ouverture du compte.",
    },
  ],

  included: [
    "Enlèvement sur le lieu de départ",
    "Livraison programmée plusieurs jours à l’avance, ou urgente dans l’heure, dans les 3 heures ou dans la journée",
    "Livraison le jour même en intramuros et petite couronne",
    "Suivi de chaque course en ligne",
    "Preuve de livraison horodatée et archivée",
    "Consigne de repli définie à l’avance en cas d’absence",
    "Tournées récurrentes sur créneaux fixes",
  ],

  useCases: [
    {
      title: "Commande passée avant midi",
      body: "Une commande passée le matin sur votre boutique, collectée en début d’après-midi et livrée avant le dîner, dans le créneau choisi par le client.",
    },
    {
      title: "Réassort entre points de vente",
      body: "Un article disponible dans une seule boutique et demandé dans une autre. Transfert dans la journée plutôt que vente perdue.",
    },
    {
      title: "Pic saisonnier",
      body: "Un volume qui double sur quelques jours. Les tournées passent en créneaux rapprochés sans renégocier le contrat.",
    },
  ],

  coverage:
    "Intramuros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne au tarif de leur zone. Les collectes récurrentes s’organisent sur créneaux fixes convenus à l’avance.",

  pricing: {
    title: "Tarif d’une livraison e-commerce, programmée ou urgente",
    intro:
      "Pour une livraison urgente dans l’heure, la formule Super (1 h) s’applique ; dans 1 h 30, la formule Urgent ; dans les 3 heures ou dans la journée, la formule Normale (3 h). Pour une livraison programmée, le prix est connu avant l’envoi.",
    recommended: ["standard"],
    note:
      "Vous expédiez chaque semaine ? Avec un compte entreprise, vos livraisons sont facturées à 30 jours, avec un tarif dégressif selon le volume.",
  },

  faqTitle: "Vos questions sur la livraison à créneau.",

  faq: [
    {
      question: "Que se passe-t-il si le destinataire est absent ?",
      answer:
        "La consigne est définie à l’ouverture du compte : représentation, retour à l’expéditeur, ou remise à une personne désignée. Le créneau choisi par le destinataire réduit fortement ce cas de figure.",
    },
    {
      question: "Quel est le poids maximal par course ?",
      answer:
        "18 kg par course, dans un top-case de 60 × 40 cm. Au-delà, la commande est répartie sur plusieurs courses : nous le signalons au moment de la commande.",
    },
    {
      question: "Peut-on réserver une livraison plusieurs jours à l’avance ?",
      answer:
        "Oui. Vous pouvez programmer une livraison plusieurs jours à l’avance. Pour une livraison urgente le jour même, la commande se passe avant l’heure limite.",
    },
    {
      question: "Combien coûte une livraison le jour même ?",
      answer:
        "En intramuros, 28 € TTC en Normal (livré sous 3 h) ; vers la petite couronne, 39 € TTC jusqu'à 8 km puis 2 € TTC par km. Le prix est le même quel que soit le colis, dans la limite de 18 kg.",
    },
    {
      question: "Jusqu’à quelle heure commander pour livrer le jour même ?",
      answer:
        "Nous travaillons du lundi au samedi, de 9h à 19h. Pour une livraison en Normal (3 h) le jour même, commandez avant 16h ; en Super (1 h), jusqu’à 18h.",
    },
  ],
};
