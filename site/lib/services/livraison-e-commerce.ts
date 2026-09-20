/**
 * lib/services/livraison-e-commerce.ts
 * Prestation e-commerce. Requêtes visées : livraison le jour même Paris,
 * coursier e-commerce, livraison same day Île-de-France.
 */
import type { Service } from "./types";

export const livraisonEcommerce: Service = {
  slug: "livraison-e-commerce",

  card: {
    tag: "03 — E-commerce",
    title: "Livraison jour même",
    body: "Collecte en boutique ou en entrepôt, livraison dans la journée sur Paris et première couronne. Créneaux au choix du destinataire.",
    note: "Tournées récurrentes possibles",
  },

  seo: {
    title: "Livraison le jour même à Paris — coursier e-commerce en Île-de-France",
    description:
      "Collecte en boutique ou en entrepôt et livraison le jour même sur Paris et la petite couronne. Créneaux choisis par le destinataire, suivi en temps réel, preuve de livraison.",
    keywords: [
      "livraison jour même Paris",
      "coursier e-commerce Paris",
      "livraison same day Île-de-France",
      "livraison dernier kilomètre Paris",
      "coursier boutique en ligne",
    ],
  },

  h1: "Livraison le jour même à Paris pour votre e-commerce",

  intro:
    "Vos clients commandent le matin et reçoivent avant le dîner. One Connexion collecte en boutique ou en entrepôt et livre dans la journée sur Paris et la petite couronne, avec un créneau choisi par le destinataire.",

  stats: [
    { value: "Jour même", label: "Délai de livraison" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "18 kg", label: "Charge par course" },
  ],

  context: {
    title: "Le dernier kilomètre porte votre promesse, pas la nôtre",
    paragraphs: [
      "Le transporteur est invisible tant que tout va bien. Dès qu’une livraison échoue, c’est votre marque que le client tient pour responsable, votre service client qui absorbe la réclamation, et votre note qui en porte la trace. Le dernier kilomètre est le seul moment physique de la relation : il vaut mieux qu’il soit tenu.",
      "L’échec de livraison est le premier poste de coût caché du secteur. Un destinataire absent, c’est une seconde présentation, un colis qui dort quelque part, et un client qui ne comprend pas. Laisser le destinataire choisir son créneau supprime la cause à la racine plutôt que d’en traiter les conséquences.",
      "La livraison le jour même change par ailleurs la nature de l’argument commercial. Ce n’est plus une option de confort en fin de tunnel : c’est ce qui permet de vendre à quelqu’un qui hésitait à traverser la ville pour l’acheter en boutique.",
    ],
  },

  steps: [
    {
      title: "Collecte",
      body: "Enlèvement en boutique, en entrepôt ou en point de stockage, sur créneau fixe ou à la demande selon votre volume.",
    },
    {
      title: "Créneau avec le destinataire",
      body: "Le créneau de réception est choisi par le destinataire, ce qui supprime la première cause d’échec de livraison.",
    },
    {
      title: "Livraison dans la journée",
      body: "Course directe sur Paris et la petite couronne. Le deux-roues n’attend ni les bouchons ni les restrictions de circulation.",
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
    "Collecte en boutique, entrepôt ou point de stockage",
    "Créneau de réception choisi par le destinataire",
    "Livraison le jour même sur Paris et petite couronne",
    "Suivi de position en temps réel",
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
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Les collectes récurrentes s’organisent sur créneaux fixes convenus à l’avance.",

  faq: [
    {
      question: "Quelle est l’heure limite de collecte pour une livraison le jour même ?",
      answer:
        "PLACEHOLDER — heure limite (cut-off) à confirmer avant mise en ligne. Elle dépend de la zone de collecte et de la zone de livraison.",
    },
    {
      question: "Que se passe-t-il si le destinataire est absent ?",
      answer:
        "La consigne est définie à l’ouverture du compte : représentation, retour à l’expéditeur, ou remise à une personne désignée. Le créneau choisi par le destinataire réduit fortement ce cas de figure.",
    },
    {
      question: "Quel est le poids maximal par course ?",
      answer:
        "18 kg par course, dans un top-case de 60 × 40 cm. Au-delà, la commande est répartie sur plusieurs courses : nous le signalons au moment du devis.",
    },
    {
      question: "Peut-on brancher la commande sur notre boutique en ligne ?",
      answer:
        "PLACEHOLDER — intégration technique (API, connecteurs de plateformes e-commerce) à confirmer. Les commandes se passent aujourd’hui par téléphone et par courriel.",
    },
    {
      question: "Gérez-vous les retours ?",
      answer:
        "Oui, sur le même principe qu’une livraison : enlèvement chez le client et retour vers votre boutique ou votre entrepôt, avec preuve d’enlèvement.",
    },
    {
      question: "Proposez-vous des tarifs dégressifs au volume ?",
      answer:
        "PLACEHOLDER — grille tarifaire et conditions de dégressivité à confirmer avant mise en ligne.",
    },
  ],
};
