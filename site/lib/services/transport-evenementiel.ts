import type { Service } from "./types";

export const transportEvenementiel: Service = {
  slug: "transport-evenementiel",
  card: {
    tag: "Événementiel & RP",
    title: "Logistique Événementielle",
    body: "Livraison de prototypes, invitations VIP, cadeaux d'affaires et matériel avec une discrétion absolue.",
    note: "Dédiée",
  },
  seo: {
    title: "Coursier événementiel et logistique RP Paris — ONE CONNEXION",
    description: "Le partenaire logistique de vos événements, pop-up stores et opérations RP à Paris. Livraison VIP, accréditations, et transport sous haute discrétion.",
    keywords: ["coursier événementiel", "livraison RP paris", "transport VIP", "logistique événementielle paris"],
  },
  h1: "Le partenaire logistique de vos événements d'exception.",
  intro: "Défiez les imprévus. Qu'il s'agisse de la Fashion Week, d'un séminaire ou d'une opération de relations publiques, nous assurons des livraisons VIP au cordeau.",
  stats: [
    { value: "24/24", label: "Astreinte possible" },
    { value: "100%", label: "Discrétion VIP" },
    { value: "ZTL", label: "Accès hyper-centre" },
  ],
  context: {
    title: "L'urgence de la dernière minute parfaitement maîtrisée",
    paragraphs: [
      "Dans le monde de l'événementiel, de la mode ou des relations publiques, un détail manquant à la dernière minute peut compromettre des mois de préparation. Nos équipes opèrent dans l'ombre pour garantir le bon déroulement de vos opérations, même les plus complexes.",
      "Nos coursiers dédiés à l'événementiel sont sélectionnés pour leur discrétion, leur présentation professionnelle et leur capacité à évoluer dans des environnements sous haute pression (palaces, backstages, salons d'exposition)."
    ],
  },
  steps: [
    { title: "Briefing opérationnel", body: "Transmission des consignes spécifiques : accès aux backstages, contacts sur place, niveau de confidentialité requis." },
    { title: "Course dédiée exclusive", body: "Le transport est 100% exclusif. Le coursier se rend directement du point A au point B sans faire d'autres ramassages." },
    { title: "Remise VIP certifiée", body: "Livraison en main propre à la personne désignée avec confirmation immédiate par notification au donneur d'ordre." },
  ],
  included: [
    "Véhicules sécurisés et discrets",
    "Confirmation de livraison en temps réel",
    "Attente sur site possible (sur devis)",
    "Traitement minutieux des objets fragiles (prototypes, maquettes)",
  ],
  useCases: [
    { title: "Opération RP & Influence", body: "Envoi simultané de 50 invitations VIP personnalisées ou de press kits sur tout Paris dans un créneau strict de 2 heures." },
    { title: "Fashion Week", body: "Récupération d'un accessoire manquant dans un atelier pour livraison express en backstage quelques minutes avant le défilé." },
  ],
  coverage: "Hyper-centre parisien, palaces, centres d'exposition, et toute la région.",
  faq: [
    { question: "Assurez-vous des livraisons de nuit pour le démontage d'événements ?", answer: "Oui, sous réserve d'une planification préalable ou de l'ouverture d'un compte entreprise spécifique, nous pouvons organiser des astreintes logistiques de nuit." },
    { question: "Le coursier peut-il s'adapter au niveau d'exigence d'un palace ou d'un salon VIP ?", answer: "Absolument. Le respect strict de la confidentialité et une présentation irréprochable font partie intégrante de notre cahier des charges événementiel." },
  ],
};
