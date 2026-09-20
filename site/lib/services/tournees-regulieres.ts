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
    { value: "100%", label: "Respect des horaires" },
    { value: "0", label: "Gestion RH à votre charge" },
    { value: "7j/7", label: "Disponibilité" },
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
    "Facturation mensuelle centralisée",
    "Reporting personnalisé",
  ],
  useCases: [
    { title: "Navettes inter-bureaux", body: "Échange quotidien de pochettes courrier sécurisées entre le siège social et plusieurs succursales parisiennes." },
    { title: "Réassort de boutiques", body: "Distribution régulière de stocks légers depuis un entrepôt francilien vers vos différents points de vente en centre-ville." },
  ],
  coverage: "Paris et Île-de-France (tous départements).",
  faq: [
    { question: "Puis-je modifier l'horaire de passage de la navette exceptionnellement ?", answer: "Oui, un simple appel à votre dispatcheur permet d'ajuster une tournée avec un délai de prévenance de quelques heures." },
    { question: "Que se passe-t-il si le coursier habituel est absent ?", answer: "La continuité de service est notre garantie phare : un coursier de réserve, préalablement briefé sur votre tournée, prend immédiatement le relais sans aucune interruption." },
  ],
};
