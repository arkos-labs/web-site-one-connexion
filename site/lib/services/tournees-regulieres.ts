import type { Service } from "./types";

export const tourneesRegulieres: Service = {
  slug: "tournees-regulieres",
  card: {
    tag: "Navettes & Tournées",
    title: "Tournées régulières B2B",
    body: "Externalisez vos navettes inter-sites, tournées de distribution ou collectes régulières avec un coursier dédié.",
    note: "Sur-mesure",
  },
  seo: {
    title: "Tournées régulières et navettes coursier B2B Paris",
    description: "Confiez vos navettes inter-sites et tournées régulières en Île-de-France à nos coursiers. Flexibilité, ponctualité et suivi quotidien garantis.",
    keywords: ["tournées régulières", "navette entreprise paris", "coursier dédié", "navette inter-sites"],
  },
  h1: "Vos navettes inter-sites et tournées régulières.",
  intro: "Une organisation logistique sur-mesure pour vos flux récurrents, assurée par un dispatcheur dédié et des coursiers familiers de vos exigences.",
  stats: [
    { value: "Fixe", label: "Même créneau chaque semaine" },
    { value: "0", label: "Gestion RH à votre charge" },
    { value: "6j/7", label: "Lun–sam, 9h–19h" },
  ],
  context: {
    title: "La régularité comme maître-mot",
    paragraphs: [
      "De nombreuses entreprises franciliennes ont des besoins logistiques récurrents : courriers entre le siège et les filiales, transferts de pièces, réassorts de boutiques, etc. Internaliser cette fonction requiert des véhicules, coûte cher et demande du temps de gestion RH.",
      "Notre prestation de tournées régulières vous libère de ces contraintes. Nous définissons ensemble un cahier des charges (fréquence, horaires, type de véhicules), et nous prenons l'entière responsabilité de son exécution fluide au quotidien."
    ],
  },
  steps: [
    { title: "Audit et définition du plan", body: "Analyse de vos itinéraires, volumétries et contraintes horaires pour calibrer la tournée de manière optimale." },
    { title: "Affectation d'une équipe", body: "Des coursiers habitués à vos sites et à vos protocoles de sécurité sont spécifiquement affectés à vos missions." },
    { title: "Déploiement et suivi", body: "Lancement des navettes avec un reporting régulier de notre dispatcheur pour ajuster le service à vos pics d'activité." },
  ],
  included: [
    "Continuité de service (coursiers de remplacement garantis)",
    "Véhicules adaptés (moto, scooter ou cargo)",
    "Factures à régler sous 30 jours",
    "Reporting personnalisé",
  ],
  useCases: [
    { title: "Navettes inter-bureaux", body: "Échange quotidien de pochettes courrier sécurisées entre le siège social et plusieurs succursales parisiennes." },
    { title: "Réassort de boutiques", body: "Distribution régulière de stocks légers depuis un entrepôt francilien vers vos différents points de vente en centre-ville." },
    { title: "Collecte de prélèvements", body: "Passage chaque fin de matinée dans plusieurs cabinets médicaux du même secteur pour récupérer les prélèvements et les déposer ensemble au laboratoire." },
  ],
  coverage: "Les tournées couvrent Paris et toute l’Île-de-France : sièges et agences parisiennes, zones d’activité de petite couronne (La Défense, Saint-Denis, Rungis) et sites de grande couronne. Un même circuit peut relier plusieurs départements ; le prix par passage dépend alors de la zone la plus éloignée.",
  pricing: {
    title: "Tarif d’une tournée régulière",
    intro:
      "Une tournée se facture au passage, moins cher qu’une course ponctuelle : le trajet, les jours et les horaires sont connus d’avance. Le prix ci-dessous est un point de départ par passage, selon la zone.",
    recommended: ["navette"],
    note:
      "Le prix exact dépend du nombre d’arrêts et du volume transporté. Il s’affiche quand vous configurez votre navette depuis votre espace client, avant toute validation.",
  },

  faqTitle: "Vos questions sur les tournées régulières.",

  faq: [
    { question: "Puis-je modifier l'horaire de passage de la navette exceptionnellement ?", answer: "Oui, un simple appel à votre dispatcheur permet d'ajuster une tournée avec un délai de prévenance de quelques heures." },
    { question: "Que se passe-t-il si le coursier habituel est absent ?", answer: "La continuité de service est notre garantie phare : un coursier de réserve, préalablement briefé sur votre tournée, prend immédiatement le relais sans aucune interruption." },
    {
      question: "Combien coûte une tournée régulière ?",
      answer:
        "Une tournée se facture au passage. Le prix dépend de la zone, du nombre d’arrêts et du volume ; il s’affiche quand vous configurez la navette dans votre espace client, avant validation.",
    },
    {
      question: "Quels jours et à quelles heures une navette peut-elle passer ?",
      answer:
        "Du lundi au samedi, entre 9h et 19h. Vous choisissez les jours de la semaine et l’heure de passage ; le même créneau est tenu chaque semaine.",
    },
    {
      question: "Comment mettre en place une tournée ?",
      answer:
        "Depuis votre espace client, onglet Navettes : vous indiquez le point de départ, les arrêts, le volume et les jours. Un conseiller vous rappelle pour confirmer la tournée avant le premier passage.",
    },
  ],
};
