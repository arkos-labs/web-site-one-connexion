/**
 * lib/guides.ts
 * Guides pratiques (requêtes d'information). Pas de promesses non vérifiables :
 * aucune certification ni assurance n'y est affirmée. Seul le guide des prix reprend
 * la grille tarifaire de lib/pricing.ts. Les renvois vers les prestations portent les engagements.
 */
export interface GuideSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
  /** Tableau optionnel, affiché sous les paragraphes. */
  table?: { head: string[]; rows: string[][]; note?: string };
}

export interface Guide {
  slug: string;
  title: string;
  /** Titre de page (≤ 60 caractères avec le suffixe du site). */
  seoTitle: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  faq: { question: string; answer: string }[];
  /** Prestation liée */
  service: { href: string; label: string };
  published: string; // ISO
}

export const GUIDES: Guide[] = [
  {
    slug: "envoyer-un-pli-confidentiel-paris",
    title: "Envoyer un pli confidentiel à Paris : bien préparer sa remise",
    seoTitle: "Envoyer un pli confidentiel à Paris : guide",
    description:
      "Comment préparer, faire prendre en charge et suivre un pli confidentiel à Paris : conditionnement, remise en main propre, preuve de remise, course dédiée.",
    intro:
      "Contrat, acte, dossier de candidature, pièce d'un dossier judiciaire : certains documents ne doivent passer que par les mains de leur destinataire. Ce guide résume les points à régler avant de confier un pli confidentiel à un coursier.",
    sections: [
      {
        heading: "Préparer le pli",
        paragraphs: [
          "Un pli confidentiel voyage fermé et identifiable. Quelques précautions évitent la plupart des incidents :",
        ],
        list: [
          "Une enveloppe ou pochette opaque, fermée, sans mention du contenu à l'extérieur.",
          "Le nom complet du destinataire et, si besoin, son service ou son étage.",
          "Un numéro de téléphone joignable côté enlèvement et côté remise.",
          "Une référence de dossier, pour retrouver la course dans votre facturation.",
        ],
      },
      {
        heading: "Course dédiée ou tournée : que choisir ?",
        paragraphs: [
          "Pour un document sensible ou urgent, la course dédiée est la plus adaptée : le coursier part de votre adresse et va directement chez le destinataire, sans arrêt intermédiaire. Pour des envois récurrents et moins pressés (courrier quotidien entre deux sites), une tournée régulière est plus économique.",
        ],
      },
      {
        heading: "La remise en main propre et la preuve",
        paragraphs: [
          "La remise en main propre signifie que le pli n'est confié ni à un accueil ni à un voisin, sauf consigne contraire de votre part. Demandez toujours une preuve de remise : nom du destinataire, date et heure. C'est elle qui vous permet de justifier d'un dépôt ou d'une réception dans un dossier.",
        ],
      },
      {
        heading: "Ce qu'il faut préciser à la commande",
        paragraphs: [
          "Indiquez l'heure limite de remise réelle (par exemple une fermeture de greffe), les contraintes d'accès (badge, contrôle d'identité, interphone) et la personne à demander sur place. Ces éléments comptent plus que la distance pour tenir un délai.",
        ],
      },
    ],
    faq: [
      {
        question: "Puis-je faire remettre un pli à une personne précise uniquement ?",
        answer:
          "Oui, indiquez à la commande que la remise se fait en main propre au destinataire nommé. Si celui-ci est absent, le coursier vous appelle avant toute autre décision.",
      },
      {
        question: "Comment savoir que le pli est bien arrivé ?",
        answer:
          "La remise est horodatée avec le nom de la personne qui l'a reçu, et cette information est visible dans votre espace en ligne.",
      },
      {
        question: "Quel délai prévoir ?",
        answer:
          "Cela dépend de la distance et de l'heure. Pour une échéance stricte, appelez-nous avant de commander : nous vous confirmons ce qui est réaliste.",
      },
    ],
    service: { href: "/services/plis-confidentiels", label: "Plis confidentiels" },
    published: "2026-09-21",
  },
  {
    slug: "transport-de-prelevements-medicaux",
    title: "Transport de prélèvements médicaux : les points à anticiper",
    seoTitle: "Transport de prélèvements médicaux : guide",
    description:
      "Ce qu'un laboratoire ou un cabinet doit anticiper pour faire transporter des prélèvements : conditionnement, délai de stabilité, température, remise et traçabilité.",
    intro:
      "Un prélèvement a un délai de stabilité : passé ce délai, l'analyse peut être compromise. Ce guide rappelle ce qu'il faut anticiper côté expéditeur pour qu'un coursier puisse acheminer un échantillon dans de bonnes conditions.",
    sections: [
      {
        heading: "Le délai de stabilité commande tout",
        paragraphs: [
          "Chaque type d'échantillon a ses propres exigences de délai et de température, définies par le laboratoire destinataire. Communiquez à la commande l'heure limite d'arrivée et la température de conservation demandée : le choix du mode de transport en découle.",
        ],
      },
      {
        heading: "Le conditionnement relève de l'expéditeur",
        paragraphs: [
          "Les échantillons biologiques sont soumis à des règles de conditionnement et d'étiquetage, souvent désignées sous les références UN3373 (catégorie B) pour le transport routier. Le conditionnement conforme est préparé par l'expéditeur, généralement selon les consignes du laboratoire destinataire.",
          "One Connexion transporte le colis fermé tel qu'il est remis. Si votre envoi exige une conformité réglementaire particulière, précisez-la avant la commande : nous vous dirons clairement si nous pouvons la prendre en charge.",
        ],
      },
      {
        heading: "Ce qu'il faut indiquer sur le bordereau",
        paragraphs: ["Quatre informations suffisent à éviter la plupart des malentendus :"],
        list: [
          "L'identité du destinataire et son service de réception.",
          "L'heure limite d'arrivée et la température de conservation.",
          "Un contact joignable à l'enlèvement et à la remise.",
          "Le nombre de colis, pour vérifier la remise complète.",
        ],
      },
      {
        heading: "Course dédiée et traçabilité",
        paragraphs: [
          "Pour un prélèvement, la course dédiée évite les arrêts intermédiaires. La remise est horodatée avec le nom du réceptionnaire, ce qui permet de reconstituer le trajet en cas de question du laboratoire.",
        ],
      },
    ],
    faq: [
      {
        question: "Qui prépare le colis de prélèvement ?",
        answer:
          "L'expéditeur : le laboratoire ou le cabinet remet un colis conditionné selon les consignes du laboratoire destinataire.",
      },
      {
        question: "Pouvez-vous respecter une température dirigée ?",
        answer:
          "Précisez le besoin à la commande. Nous vous répondons sur ce que nous pouvons assurer avant de valider la course.",
      },
      {
        question: "Que faire pour une urgence ?",
        answer:
          "Appelez le dispatching au lieu de passer par le formulaire : nous confirmons la faisabilité avant l'enlèvement.",
      },
    ],
    service: { href: "/services/transport-medical", label: "Transport médical" },
    published: "2026-09-21",
  },
  {
    slug: "prix-coursier-express-paris",
    title: "Prix d'un coursier express à Paris : ce qui fait varier le tarif",
    seoTitle: "Prix d'un coursier express à Paris : guide",
    description:
      "Distance, délai, nature du transport, volume : les critères qui déterminent le prix d'un coursier express à Paris et en Île-de-France, et comment connaître le prix avant de commander.",
    intro:
      "Il n'existe pas de prix unique pour un coursier : la même course peut varier selon quelques critères précis. Les connaître permet de comparer des offres sur des bases identiques.",
    sections: [
      {
        heading: "Les tarifs par zone et par délai",
        paragraphs: [
          "Voici la grille de ONE CONNEXION pour une course en Île-de-France. Quand le trajet traverse deux zones, la zone la plus éloignée s'applique : de Paris vers Nanterre, c'est le tarif petite couronne.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super urgent 1 h"],
          rows: [
            ["Paris (75)", "17,50 €", "26,25 €", "35 €"],
            ["Petite couronne (92, 93, 94)", "35 €", "52,50 €", "70 €"],
            ["Grande couronne (77, 78, 91, 95)", "49 €", "73,50 €", "98 €"],
          ],
          note: "Tarifs HT par course, TVA 20 % en sus. Le prix exact s'affiche avant de valider la commande.",
        },
      },
      {
        heading: "La distance et la zone",
        paragraphs: [
          "Le point de départ et le point d'arrivée fixent la zone : Paris intramuros, petite couronne ou grande couronne. Plus la zone est éloignée de Paris, plus le tarif de base augmente.",
        ],
      },
      {
        heading: "Le délai demandé",
        paragraphs: [
          "Plus le délai est court, plus la course coûte cher : à Paris, la même course passe de 17,50 € HT en 3 h à 35 € HT en 1 h. Une navette régulière, avec un passage programmé, est en général la formule la plus économique pour des besoins répétés.",
        ],
      },
      {
        heading: "La nature du transport",
        paragraphs: [
          "Un pli confidentiel remis contre preuve, un prélèvement avec contraintes de manutention ou un colis standard n'exigent pas le même niveau de service, et donc pas le même prix.",
        ],
      },
      {
        heading: "Le volume mensuel",
        paragraphs: [
          "Si vous envoyez régulièrement, un compte entreprise regroupe la facturation en fin de mois et peut ouvrir une grille adaptée au volume. La page tarifs détaille les formules.",
        ],
      },
      {
        heading: "Comment comparer deux coursiers",
        paragraphs: [
          "Pour comparer deux coursiers, donnez à chacun les mêmes informations : adresses exactes, heure limite, nature du colis, poids et volume approximatifs, et fréquence prévue.",
        ],
      },
    ],
    faq: [
      {
        question: "Comment connaître le prix avant de commander ?",
        answer: "Le prix s’affiche automatiquement dès que vous saisissez les adresses d’enlèvement et de livraison et le délai choisi.",
      },
      {
        question: "Une course urgente est-elle plus chère ?",
        answer:
          "Oui : un délai de 1 h coûte le double d'un délai de 3 h (35 € HT contre 17,50 € HT dans Paris). Un créneau plus large réduit le tarif.",
      },
    ],
    service: { href: "/tarifs", label: "Nos tarifs" },
    published: "2026-09-21",
  },
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
