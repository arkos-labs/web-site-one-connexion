/**
 * lib/services/transport-medical.ts
 * Prestation santé & laboratoires. Requêtes visées : coursier médical Paris,
 * transport de prélèvements, transport d'échantillons biologiques Île-de-France.
 *
 * ATTENTION : aucune certification ni agrément (ADR, transport de matières dangereuses) n'est
 * affirmé ici. UN3373 est expliqué comme un conditionnement préparé par l'expéditeur, que le
 * coursier transporte fermé : ne pas écrire « certifié » ou « agréé UN3373 ».
 */
import type { Service } from "./types";

export const transportMedical: Service = {
  slug: "transport-medical",

  card: {
    tag: "02 - Santé & laboratoires",
    title: "Prélèvements et labos",
    body: "Prélèvements, échantillons, matériel de labo : on part tout de suite et on va droit au labo, sans détour. Si l'envoi doit rester au frais, on utilise un contenant isotherme.",
    note: "Course dédiée, sans détour",
  },

  seo: {
    title: "Coursier médical Paris - transport laboratoire",
    description:
      "Coursier médical : transport prélèvements et échantillons pour laboratoires. Enlèvement < 45 min, contenants isothermes, remise directe, dès 28€.",
    keywords: [
      "coursier médical",
      "transport laboratoire",
      "transport de prélèvements sanguins",
      "coursier médical Paris",
      "transport prélèvements laboratoire",
      "transport échantillons biologiques Île-de-France",
      "coursier laboratoire analyses Paris",
      "transport urgent matériel médical",
      "coursier transport de sang réfrigéré",
      "transport échantillons réfrigérés Paris",
      "prix coursier médical Paris",
    ],
  },

  h1: "Coursier médical à Paris : prélèvements, échantillons et matériel de laboratoire",

  intro:
    "Un prélèvement doit arriver au laboratoire avant de s’abîmer. Un coursier vient le chercher en moins de 45 minutes et l’apporte directement, sans détour, dans un contenant isotherme. Pour les laboratoires d’analyses, cliniques et cabinets médicaux d’Île-de-France.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "6j/7", label: "Lun–sam, 9h – 19h" },
    { value: "Dédiée", label: "Course sans regroupement" },
  ],

  context: {
    title: "Un échantillon ne se renvoie pas",
    paragraphs: [
      "Un prélèvement dégradé n’est pas une livraison ratée : c’est un patient qu’il faut reconvoquer, une analyse à refaire, et un résultat qui arrive trop tard pour la décision qu’il devait éclairer. Contrairement à un colis, un échantillon ne se réexpédie pas.",
      "Le délai de stabilité commande toute la course. Il varie selon la nature du prélèvement et les exigences du laboratoire destinataire : c’est vous qui le fixez, et c’est lui qui détermine si la course est réalisable. Nous confirmons la faisabilité avant d’engager, plutôt que d’accepter puis d’échouer.",
      "Le maintien en température suit la même logique. Le contenant isotherme est choisi en fonction de ce qui est transporté, et un relevé de température peut être joint à la course lorsque le protocole du laboratoire l’exige, à préciser à la commande.",
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
      title: "Suivi en ligne de chaque course",
      body: "L'avancement de la course est consultable en ligne. Vous pouvez ainsi prévenir le laboratoire destinataire de l'arrivée.",
    },
    {
      title: "Remise et traçabilité",
      body: "Remise en main propre au service destinataire, horodatée et nominative. Relevé de température joint lorsque la course en prévoit un.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement ni rupture de charge",
    "Contenant isotherme adapté, convenu à la commande",
    "Colis UN3373 en triple emballage transportés fermés, sans jamais être ouverts",
    "Relevé de température sur demande",
    "Confirmation de faisabilité avant engagement de la course",
    "Suivi de chaque course en ligne",
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
    "Intramuros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne au tarif de leur zone. Laboratoires, cliniques et plateaux techniques d’Île-de-France desservis aux mêmes conditions.",

  pricing: {
    title: "Tarif d’un coursier médical",
    intro:
      "Un prélèvement ou un échantillon se facture au même prix qu’une autre course : la zone et le délai font le tarif. Le contenant isotherme et le transport fermé du triple emballage UN3373 sont compris.",
    recommended: ["urgent", "flash"],
    note:
      "Pour un prélèvement dont le délai de stabilité est court, préférez Super (1 h) : le coursier va directement au laboratoire, sans aucun arrêt.",
  },

  faqTitle: "Vos questions sur le transport d’échantillons.",

  faq: [
    {
      question: "Qu’est-ce qu’un coursier médical ?",
      answer:
        "Un coursier médical transporte en urgence des prélèvements, échantillons, pièces techniques ou matériel entre laboratoires, cliniques et cabinets. La course est dédiée, le contenant adapté et le délai de stabilité de ce qui est transporté commande l’organisation de la course.",
    },
    {
      question: "Pouvez-vous transporter des prélèvements sanguins et des échantillons réfrigérés ?",
      answer:
        "Nous transportons des prélèvements sanguins, échantillons et pièces en contenant isotherme adapté, en course dédiée et directe, du lundi au samedi. Pour un transport réfrigéré, précisez à la commande la plage de température et le délai de stabilité fixés par le laboratoire : nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      question: "Quel est le prix d’un coursier médical à Paris ?",
      answer:
        "Le transport médical est facturé au tarif standard de la zone : à partir de 28 € TTC en intramuros (3 h), 42 € TTC en urgent et 56 € TTC en formule Super (1 h), et en petite couronne 39 €, 58,50 € ou 78 € TTC jusqu'à 8 km, puis 2 € à 4 € TTC par km selon le délai. Le prix est affiché avant de commander, détail sur la page tarifs.",
    },
    {
      question: "Assurez-vous le transport entre laboratoires et vers un plateau technique ?",
      answer:
        "Oui. Nous assurons le transport laboratoire entre sites de prélèvement, laboratoires d’analyses et plateaux techniques d’Île-de-France, à la demande ou en tournées régulières sur créneaux fixes.",
    },
    {
      question: "Comment le maintien en température est-il assuré ?",
      answer:
        "Le contenant isotherme est choisi à la commande en fonction de la nature du transport et de la durée prévue. Un relevé de température peut être joint lorsque le protocole du laboratoire l’exige : précisez-le au moment de la commande.",
    },
    {
      question: "Qui est responsable du conditionnement de l’échantillon ?",
      answer:
        "Le conditionnement relève du site expéditeur, qui applique les protocoles propres à la nature du prélèvement (triple emballage UN3373 pour un échantillon biologique). Nous assurons le transport dans le contenant convenu et le maintien des conditions pendant la course.",
    },
    {
      question: "Transportez-vous les échantillons UN3373 (triple emballage) ?",
      answer:
        "Oui. Un échantillon biologique de catégorie B (UN3373) voyage dans un triple emballage : un récipient primaire étanche (le tube ou le flacon), un emballage secondaire étanche avec un matériau absorbant, puis un emballage extérieur rigide qui porte l’étiquette UN3373. L’expéditeur prépare ce conditionnement ; le coursier le transporte fermé, calé et dans le sens indiqué, dans le contenant convenu, sans jamais l’ouvrir, jusqu’au laboratoire destinataire.",
    },
    {
      question: "Que se passe-t-il si le délai de stabilité ne peut pas être tenu ?",
      answer:
        "Nous vous le disons avant d’engager la course, pas après. La faisabilité est confirmée au moment de la commande en fonction du délai que vous fixez, de l’heure et de la distance.",
    },
    {
      question: "Assurez-vous des tournées récurrentes ?",
      answer:
        "Oui. Les collectes régulières entre sites ou cabinets et plateau technique s’organisent sur créneaux fixes dans le cadre d’un compte entreprise.",
    },
    {
      question: "Intervenez-vous le week-end ?",
      answer:
        "Le samedi oui, de 9h à 19h, comme en semaine. Nous sommes fermés le dimanche et les jours fériés.",
    },
  ],
};
