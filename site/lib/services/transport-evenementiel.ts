import type { Service } from "./types";

export const transportEvenementiel: Service = {
  slug: "transport-evenementiel",
  card: {
    tag: "05 - Événementiel & RP",
    title: "Salons et événements",
    body: "Un prototype pour un salon, des invitations à remettre, un cadeau client, du matériel oublié pour un événement : on livre vite, et on reste discrets.",
    note: "Course dédiée",
  },
  seo: {
    title: "Coursier logistique : événementiel et RP à Paris",
    description: "Coursier logistique : partenaire de vos événements, pop-up stores et opérations RP. Livraison VIP, accréditations, transport sous haute discrétion.",
    keywords: ["coursier logistique", "livraison RP paris", "transport VIP", "logistique événementielle paris"],
  },
  h1: "Coursier logistique",
  intro: "Défiez les imprévus. Qu'il s'agisse de la Fashion Week, d'un séminaire ou d'une opération de relations publiques, nous assurons des livraisons VIP au cordeau.",
  stats: [
    { value: "Sur devis", label: "Astreinte hors horaires" },
    { value: "< 45 min", label: "Enlèvement après confirmation" },
    { value: "Dédiée", label: "Course sans regroupement" },
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
    "Confirmation de livraison",
    "Attente sur site possible",
    "Traitement minutieux des objets fragiles (prototypes, maquettes)",
  ],
  useCases: [
    { title: "Opération RP", body: "Un press kit ou une invitation à remettre en main propre à une rédaction parisienne avant son bouclage : le coursier part dès la confirmation et livre sans détour." },
    { title: "Fashion Week", body: "Récupération d'un accessoire manquant dans un atelier pour livraison express en backstage quelques minutes avant le défilé." },
    { title: "Salon professionnel", body: "Documentation ou échantillons épuisés sur un stand de Paris Expo Porte de Versailles : le coursier les récupère au bureau et les livre au stand en cours de journée." },
  ],
  coverage: "Paris et toute l’Île-de-France : palaces et hôtels du centre, parcs des expositions (Paris Expo Porte de Versailles, Paris Nord Villepinte, Le Bourget), studios de Saint-Denis et de Boulogne, salles de spectacle. Précisez le point de livraison exact (hall, stand, loge) : l’accès y est souvent contrôlé.",
  pricing: {
    title: "Tarif d’une course événementielle",
    intro:
      "Accréditations oubliées, matériel de stand, pièce pour un tournage : la course se facture comme les autres, à la zone et au délai. Le coursier part dès la confirmation, sans regroupement.",
    recommended: ["urgent", "flash"],
    note:
      "Montage de nuit, démontage le dimanche ou astreinte pendant un salon : en dehors de nos horaires (lun–sam, 9h–19h), le tarif se fait sur devis.",
  },

  faqTitle: "Vos questions sur la logistique événementielle.",

  faq: [
    { question: "Assurez-vous des livraisons de nuit pour le démontage d'événements ?", answer: "Oui, sous réserve d'une planification préalable ou de l'ouverture d'un compte entreprise spécifique, nous pouvons organiser des astreintes logistiques de nuit." },
    { question: "Le coursier peut-il s'adapter au niveau d'exigence d'un palace ou d'un salon VIP ?", answer: "Absolument. Le respect strict de la confidentialité et une présentation irréprochable font partie intégrante de notre cahier des charges événementiel." },
    {
      question: "Combien coûte une course pendant un événement ?",
      answer:
        "Le même prix qu’une autre course : il dépend de la zone et du délai, par exemple 56 € TTC pour une course Super (1 h) intramuros. Seules les astreintes hors de nos horaires se font sur devis.",
    },
    {
      question: "Livrez-vous directement sur un stand ou en coulisses ?",
      answer:
        "Oui. Donnez le hall, le numéro de stand ou la loge, et le nom de la personne à prévenir : l’accès des parcs d’exposition et des salles est souvent contrôlé, le coursier se présente avec ces informations.",
    },
    {
      question: "Quel délai pour une pièce oubliée le jour J ?",
      answer:
        "Choisissez la formule Super : le coursier part dès la confirmation et livre sous 1 h intramuros, sans regroupement avec d’autres courses.",
    },
  ],
};
