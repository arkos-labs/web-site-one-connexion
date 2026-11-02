/**
 * lib/services/landing.ts
 * Pages service créées par le plan « nouvelles pages » (novembre 2026). Chacune vise une seule
 * requête, compte un H1 et quatre H2, sans lien interne dans le corps.
 * Hors de SERVICES : elles n'apparaissent ni sur l'accueil ni sur /services.
 * Règles de contenu : aucun prix, aucun délai chiffré, aucun horaire.
 * Exception : une page avec `faq` suit le plan SEO étendu (5 H2 : quatre sections + FAQ), peut
 * chiffrer prix et délais, et porte des liens internes [ancre](/chemin) dans ses paragraphes.
 */

export type LandingService = {
  slug: string;
  /** Libellé court du fil d'Ariane. */
  name: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { title: string; paragraphs: string[] }[];
  /** Plan étendu : H2 « Questions fréquentes » + schéma FAQPage. */
  faq?: { question: string; answer: string }[];
  /** Offres chiffrées (TTC) exposées en schema.org Offer. */
  offers?: { name: string; price: number }[];
};

import { gridPrice } from "../pricing";

export const LANDING_SERVICES: LandingService[] = [
  {
    slug: "coursier-laboratoire",
    name: "Coursier pour laboratoire",
    title: "Coursier pour laboratoire : courses dédiées en Île-de-France",
    description:
      "Coursier pour laboratoire : transport de prélèvements, de matériel et de documents en course dédiée, avec traçabilité de la prise en charge à la remise.",
    h1: "Coursier pour laboratoire : une course dédiée par envoi",
    intro:
      "Un laboratoire confie ses prélèvements, son matériel et ses documents à un coursier qui vient les chercher sur place. L’envoi part seul, dans le contenant convenu, et va directement au destinataire. Il est remis en main propre, et la prise en charge comme la remise sont enregistrées.",
    sections: [
      {
        title: "Ce qu'un laboratoire confie à un coursier",
        paragraphs: [
          "Les envois d’un laboratoire sont variés : prélèvements et échantillons à acheminer vers un plateau technique ou un laboratoire partenaire, consommables et matériel entre deux sites, pièces pour un appareil d’analyse, documents et comptes rendus à remettre à un établissement ou à un prescripteur.",
          "Chacun part en course dédiée : un coursier pour un seul envoi, sans le mêler aux colis d’autres clients. C’est ce qui le distingue de la mutualisation, où un même trajet regroupe plusieurs envois et plusieurs arrêts.",
        ],
      },
      {
        title: "Prélèvements et matériel : les précautions de transport",
        paragraphs: [
          "Le conditionnement est préparé par le laboratoire, selon ses protocoles. Le coursier transporte le colis fermé, calé et dans le sens indiqué, sans jamais l’ouvrir.",
          "Quand l’envoi doit rester au frais, le contenant isotherme est convenu à la commande pour préserver la chaîne du froid pendant le trajet. Les conditions à respecter sont celles que vous fixez : nous confirmons la faisabilité avant d’engager la course.",
          "La remise se fait en main propre, au service ou à la personne désignés, jamais dans une boîte ou à un accueil non prévu.",
        ],
      },
      {
        title: "Traçabilité et remise",
        paragraphs: [
          "L’heure de prise en charge est enregistrée, l’avancement de la course est consultable en ligne et le coursier reste joignable pendant le trajet. Vous pouvez ainsi prévenir le destinataire de l’arrivée.",
          "À la remise, le nom de la personne qui reçoit l’envoi et l’heure sont consignés. Pour toutes vos courses, vous gardez un interlocuteur unique, qui connaît vos adresses et vos consignes.",
        ],
      },
      {
        title: "Organiser une course pour votre laboratoire",
        paragraphs: [
          "Commandez en ligne ou par téléphone en indiquant l’adresse d’enlèvement, le destinataire, la nature de l’envoi et les conditions de transport. Pour des envois réguliers entre plusieurs sites, nous convenons à l’avance des adresses, des contenants et des personnes à prévenir.",
        ],
      },
    ],
  },
  {
    slug: "coursier-avocat-notaire",
    name: "Coursier avocat et notaire",
    title: "Coursier avocat et notaire : transport de vos documents",
    description:
      "Coursier pour avocat et notaire : transport de pièces, actes et dossiers en course dédiée, avec remise en main propre et suivi de chaque envoi.",
    h1: "Coursier avocat et notaire : vos documents en course dédiée",
    intro:
      "Un cabinet d’avocats et une étude notariale n’envoient pas les mêmes documents, mais ils ont la même exigence : que l’envoi arrive à la bonne personne, et qu’on puisse le prouver. Chaque course part seule et se termine par une remise en main propre.",
    sections: [
      {
        title: "Les documents confiés par un cabinet ou une étude",
        paragraphs: [
          "Pour un cabinet d’avocats : pièces de procédure, conclusions, dossiers de plaidoirie, courriers à un confrère ou à un client. Ces envois suivent le rythme des audiences et des échéances, et ils arrivent souvent au dernier moment.",
          "Pour une étude notariale : actes à faire signer, pièces d’un dossier de vente ou de succession, documents à remettre à une autre étude. Ici, l’enjeu est surtout que l’original parvienne intact à la bonne étude, entre les mains du clerc ou du notaire désigné.",
          "Que vous cherchiez un coursier pour avocat ou un coursier pour notaire, la course est organisée de la même façon : un envoi, un coursier, un trajet direct.",
        ],
      },
      {
        title: "Confidentialité et remise en main propre",
        paragraphs: [
          "La course est dédiée à un seul envoi : le dossier ne voyage pas avec d’autres colis et ne passe par aucun dépôt. Le coursier le garde avec lui jusqu’à la remise.",
          "La remise se fait en main propre à la personne que vous avez désignée. Son nom et l’heure de remise sont enregistrés : cette preuve de remise peut être jointe au dossier.",
        ],
      },
      {
        title: "Courses entre cabinets, études et tribunaux",
        paragraphs: [
          "Les trajets les plus courants relient un cabinet à un autre cabinet, un cabinet au tribunal ou au greffe, et une étude à une autre étude. Pour un dépôt, indiquez le service destinataire et l’heure limite : le coursier se présente à l’accueil avec ces éléments.",
          "Pour une étude, précisez le nom du clerc ou du notaire qui attend l’acte : la remise est faite à cette personne, pas à un accueil général.",
        ],
      },
      {
        title: "Organiser une course pour votre cabinet",
        paragraphs: [
          "Commandez en ligne ou par téléphone avec l’adresse d’enlèvement, la destination, le nom du destinataire et l’heure limite. Nous confirmons la faisabilité avant d’engager la course. Pour les envois réguliers d’un cabinet ou d’une étude, un compte regroupe les courses de tous les collaborateurs.",
        ],
      },
    ],
  },
  {
    slug: "coursier-dimanche-paris",
    name: "Coursier dimanche Paris",
    title: "Coursier dimanche Paris : courses dédiées le week-end",
    description:
      "Coursier le dimanche à Paris : courses dédiées pour vos envois du week-end, avec prise en charge, suivi de la course et remise au destinataire.",
    h1: "Coursier dimanche Paris : une course dédiée le week-end",
    intro:
      "Certains envois ne peuvent pas attendre le lundi. Le dimanche, un coursier prend en charge votre document ou votre colis et le remet directement au destinataire, avec le même suivi qu’en semaine.",
    sections: [
      {
        title: "Les envois du dimanche",
        paragraphs: [
          "Le dimanche, on fait appel à un coursier pour un document à remettre avant une réunion du lundi matin, un colis professionnel attendu pour une ouverture, une pièce oubliée par un collaborateur, ou une remise urgente qu’un service postal ne fera pas le week-end.",
          "La différence avec une course de semaine tient surtout au destinataire : les bureaux sont fermés, les accueils aussi. La course se prépare donc avec la personne qui recevra l’envoi, plutôt qu’avec un service.",
        ],
      },
      {
        title: "Préparer une course pour le week-end",
        paragraphs: [
          "Indiquez l’adresse complète, avec le code d’accès et l’étage, le nom d’un destinataire joignable et l’heure de remise souhaitée. Préparez l’envoi fermé avant l’arrivée du coursier.",
          "Si le destinataire ne peut pas être présent, dites-nous à qui l’envoi peut être remis à sa place : sans consigne, le coursier ne le laisse pas à un tiers.",
        ],
      },
      {
        title: "Suivi et remise le dimanche",
        paragraphs: [
          "L’avancement de la course est visible en ligne, comme en semaine. Le coursier remet l’envoi en main propre, et le nom de la personne qui le reçoit est enregistré avec l’heure de remise.",
          "En cas d’absence, le coursier vous appelle avant toute décision : il attend, remet l’envoi à la personne que vous désignez ou le rapporte.",
        ],
      },
      {
        title: "Organiser une course pour le dimanche",
        paragraphs: [
          "Pour une course le dimanche, contactez-nous en amont avec l’adresse d’enlèvement, la destination et l’heure souhaitée : nous confirmons la faisabilité avant d’engager le coursier.",
        ],
      },
    ],
  },
  {
    slug: "coursier-particulier-paris",
    name: "Coursier pour particulier",
    title: "Coursier pour particulier à Paris : courses ponctuelles",
    description:
      "Coursier pour particulier à Paris : confiez un colis, un document ou un objet à une course dédiée, avec prise en charge et remise au destinataire.",
    h1: "Coursier pour particulier : une course dédiée à Paris",
    intro:
      "Vous n’êtes pas une entreprise et vous avez un colis, un document ou un objet à faire porter ? Un coursier le prend chez vous ou chez la personne qui le détient, et le remet directement au destinataire.",
    sections: [
      {
        title: "Ce qu'un particulier peut confier à un coursier",
        paragraphs: [
          "Un document à remettre en main propre, un colis à envoyer à un proche, des clés à transmettre, un objet oublié chez quelqu’un, un achat à récupérer en boutique : tout ce qui tient dans le top-case d’un deux-roues peut partir en course.",
          "La course est dédiée : votre envoi voyage seul, du point de départ au destinataire, sans passer par un centre de tri.",
        ],
      },
      {
        title: "Récupérer un colis ou faire livrer un objet",
        paragraphs: [
          "Vous avez besoin d’un coursier pour récupérer un colis ? Il peut aller le chercher chez un commerçant, dans un point de retrait ou chez un tiers, puis vous l’apporter. Prévenez la personne ou la boutique qui remet le colis, et indiquez à la commande la référence ou le nom sous lequel il est réservé.",
          "Pour un service de coursier pour particulier, le principe est le même dans les deux sens : un enlèvement à une adresse, une remise à une autre, et une personne joignable à chaque bout.",
        ],
      },
      {
        title: "Comment se déroule une course",
        paragraphs: [
          "Vous indiquez l’adresse d’enlèvement, l’adresse de remise, les coordonnées du destinataire et une description de l’envoi. Le coursier se présente, prend l’envoi en charge et part directement vers le destinataire.",
          "Vous suivez la course en ligne. À la remise, le nom de la personne qui reçoit l’envoi et l’heure sont enregistrés.",
        ],
      },
      {
        title: "Commander une course à Paris",
        paragraphs: [
          "Vous cherchez un coursier pour particulier à Paris ? Commandez en ligne ou par téléphone. Préparez l’envoi fermé avant l’arrivée du coursier, et vérifiez que le destinataire sera joignable.",
        ],
      },
    ],
  },
  {
    slug: "coursier-urgent-paris",
    name: "Coursier urgent Paris",
    title: "Coursier urgent Paris : course dédiée en moins de 45 minutes",
    description:
      "Coursier urgent à Paris : une course dédiée pour votre envoi pressé, sans mutualisation, avec prise en charge et suivi jusqu'à la remise.",
    h1: "Coursier urgent Paris : une course dédiée en moins de 45 minutes",
    intro:
      "Un envoi devient urgent quand quelqu’un l’attend et qu’il ne peut pas attendre une tournée. Le coursier part pour votre seul envoi et va directement au destinataire.",
    offers: [
      { name: "Course Urgente 1 h 30 à Paris", price: gridPrice("urgent", 0) },
      { name: "Course Super 1 h à Paris", price: gridPrice("flash", 0) },
    ],
    sections: [
      {
        title: "Coursier urgent Paris : quand nous appeler",
        paragraphs: [
          "Un contrat à faire signer avant la fin de la journée, une pièce manquante qui bloque un dossier ou un chantier, un colis à récupérer chez un fournisseur et à livrer dans la journée, un document oublié avant un rendez-vous : l’urgence vient du besoin, pas du type de colis.",
          "Pour gagner du temps, donnez des adresses complètes, avec le code d’accès, l’étage et le nom de l’entreprise, et un destinataire joignable. Préparez l’envoi fermé avant l’arrivée du coursier : il n’attend pas qu’un document soit imprimé ou signé. Si votre envoi est urgent mais que l’heure limite est plus souple, notre [coursier express Paris](/services/coursier-express-paris) répond au même besoin.",
        ],
      },
      {
        title: "Délais garantis et horaires (8h–19h, 7j/7)",
        paragraphs: [
          "Le coursier prend l’envoi en charge en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Si l’envoi doit être remis avant une heure précise, dites-le à la commande : nous confirmons la faisabilité avant d’engager la course.",
          "Dans un envoi mutualisé, votre colis attend que d’autres soient collectés, puis suit une tournée avec plusieurs arrêts. En course dédiée, le coursier ne transporte que le vôtre : il part de votre adresse et va directement au destinataire. Vous suivez la course en ligne jusqu’à la remise, et le nom de la personne qui reçoit l’envoi est enregistré avec l’heure.",
        ],
      },
      {
        title: "Ce que nous transportons en urgence",
        paragraphs: [
          "Documents, contrats, actes, pièces de rechange, petits colis et commandes à livrer le jour même : tout ce qui tient dans le top-case d’un deux-roues, jusqu’à 18 kg. Pour les documents sensibles, notre service de [pli confidentiel](/services/plis-confidentiels) ajoute la remise en main propre au seul destinataire désigné.",
          "Les courses partent de Paris et de toute l’Île-de-France ; pour les adresses dans la capitale, voyez notre page [coursier Paris](/zones/paris).",
        ],
      },
      {
        title: "Tarifs d’une course urgente",
        paragraphs: [
          `Le prix dépend de la zone la plus éloignée du trajet et du délai choisi. À Paris, une course Urgente (livrée sous 1 h 30) coûte ${gridPrice("urgent", 0)} € TTC et une course Super (sous 1 h) ${gridPrice("flash", 0)} € TTC, contre ${gridPrice("standard", 0)} € TTC pour une course Normale (sous 3 h). Pour une urgence, choisissez Urgent ou Super.`,
          "Le prix exact s’affiche avant de valider la commande. Retrouvez toute la grille, par zone et par délai, sur la page [tarif coursier Paris](/tarifs).",
        ],
      },
    ],
    faq: [
      {
        question: "En combien de temps un coursier urgent prend-il mon envoi en charge ?",
        answer:
          "En moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Nous confirmons la faisabilité avant d’engager la course.",
      },
      {
        question: "Quelle est la différence entre une course urgente et une course super ?",
        answer:
          "La course Urgente est livrée sous 1 h 30, la course Super sous 1 h. Le prix suit le délai : Urgent coûte 1,5 fois le Normal, Super 2 fois.",
      },
      {
        question: "Que peut-on envoyer par coursier urgent ?",
        answer:
          "Documents, contrats, actes, pièces de rechange et colis jusqu’à 18 kg. La nature de l’envoi ne change pas le prix, seuls comptent la zone et le délai.",
      },
      {
        question: "Puis-je suivre ma course urgente ?",
        answer:
          "Oui. L’avancement de la course est visible en ligne, et la remise est horodatée avec le nom du destinataire.",
      },
      {
        question: "Faites-vous des courses urgentes hors de Paris ?",
        answer:
          "Oui, en petite couronne (92, 93, 94) et dans le reste de l’Île-de-France. Le prix dépend de la zone la plus éloignée du trajet et s’affiche avant la commande.",
      },
    ],
  },
  {
    slug: "transport-prelevements-sang",
    name: "Transport de prélèvements sanguins",
    title: "Transport de prélèvements sanguins : coursier dédié Paris",
    description:
      "Transport de prélèvements sanguins et de sang réfrigéré à Paris : coursier dédié, contenant isotherme convenu à la commande, suivi et remise en main propre.",
    h1: "Transport de prélèvements sanguins et de sang réfrigéré par coursier dédié",
    intro:
      "Un prélèvement sanguin a un délai de stabilité et, souvent, une température à tenir. Un coursier dédié vient le chercher, le conduit directement au laboratoire et le remet en main propre, avec une preuve de remise horodatée.",
    sections: [
      {
        title: "Transport de sang réfrigéré : la chaîne du froid respectée",
        paragraphs: [
          "Le sang réfrigéré, tubes de prélèvement et échantillons biologiques à conserver au frais, ne voyage pas comme un colis ordinaire. La température de conservation est fixée par le laboratoire destinataire, et c’est elle qui commande le choix du contenant. Chez One Connexion, le contenant isotherme est convenu à la commande, en fonction de ce qui est transporté et de la durée prévue du trajet.",
          "Le coursier transporte le colis fermé, tel qu’il lui est remis, sans jamais l’ouvrir. Comme la course est dédiée, il va droit au laboratoire, sans arrêt intermédiaire ni regroupement avec d’autres colis : le temps passé en transport est celui du trajet, ce qui limite l’exposition du prélèvement. Un relevé de température peut être joint à la course lorsque le protocole du laboratoire l’exige : précisez-le au moment de la commande. Les conditions à respecter sont celles que vous fixez ; nous confirmons la faisabilité avant d’engager la course.",
        ],
      },
      {
        title: "Prélèvements biologiques : délais et conditions de prise en charge",
        paragraphs: [
          "Le délai de stabilité commande tout le reste. À la commande, indiquez l’heure limite d’arrivée et la température de conservation demandée : le choix du mode de transport en découle. Quatre informations évitent la plupart des malentendus : le nom du destinataire et son service de réception, l’heure limite d’arrivée avec la température, un contact joignable à l’enlèvement comme à la remise, et le nombre de colis, pour vérifier la remise complète.",
          "Le conditionnement est préparé par l’expéditeur, selon les consignes du laboratoire destinataire. Les échantillons biologiques de catégorie B sont généralement conditionnés en triple emballage UN3373 : un récipient étanche, un emballage secondaire étanche avec absorbant, et un emballage extérieur rigide étiqueté. Si votre envoi exige une conformité réglementaire particulière, précisez-la avant la commande : nous vous dirons clairement si nous pouvons la prendre en charge. Pour préparer l’envoi, lisez notre guide du [transport de prélèvements médicaux](/guides/transport-de-prelevements-medicaux).",
        ],
      },
      {
        title: "Laboratoires, hôpitaux et centres d’analyses : nos donneurs d’ordre",
        paragraphs: [
          "Nos courses de prélèvements s’adressent aux laboratoires d’analyses, aux cliniques, aux cabinets médicaux et aux établissements de santé qui ont besoin d’un transport fiable entre leurs sites, ou vers un plateau technique ou un laboratoire partenaire. Pour l’ensemble de leurs flux, voyez notre page [coursier pour laboratoire](/services/coursier-laboratoire) ; pour le matériel, les consommables et les médicaments urgents, notre service de [coursier médical moto](/services/transport-medical).",
          "Pour des envois réguliers entre plusieurs sites, nous convenons à l’avance des adresses, des contenants et des personnes à prévenir. Vous gardez un interlocuteur unique, qui connaît vos adresses et vos consignes. L’ensemble des métiers que nous desservons est présenté sur la page [nos secteurs d’activité](/secteurs).",
        ],
      },
      {
        title: "Traçabilité et preuve de remise pour les prélèvements",
        paragraphs: [
          "L’heure de prise en charge est enregistrée, l’avancement de la course est consultable en ligne et le coursier reste joignable pendant le trajet : vous pouvez prévenir le laboratoire de l’arrivée. À la remise, le colis est donné en main propre au service ou à la personne désignés, jamais déposé dans une boîte ou laissé à un accueil non prévu.",
          "Le nom de la personne qui reçoit le prélèvement et l’heure de remise sont consignés, puis archivés et restitués sur demande. En cas de question du laboratoire sur un échantillon, ce justificatif permet de reconstituer le trajet, de la prise en charge à la remise.",
        ],
      },
      {
        title: "Zones et délais (Paris, petite couronne, Île-de-France)",
        paragraphs: [
          `Le coursier prend le prélèvement en charge en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Il intervient à Paris, en petite couronne (92, 93, 94) et dans le reste de l’Île-de-France. Le délai de livraison dépend de la formule choisie : Normal sous 3 h, Urgent sous 1 h 30, Super sous 1 h.`,
          `Un prélèvement se facture comme n’importe quelle course : la zone et le délai font le tarif, jamais la nature de l’envoi. À Paris, une course Super (sous 1 h) coûte ${gridPrice("flash", 0)} € TTC, et le contenant isotherme est compris. Le prix exact s’affiche avant de valider la commande ; la grille complète figure sur la page [tarif coursier Paris](/tarifs).`,
        ],
      },
    ],
    faq: [
      {
        question: "Pouvez-vous transporter du sang réfrigéré ?",
        answer:
          "Oui, dans un contenant isotherme convenu à la commande, en course dédiée et directe. Précisez la plage de température et le délai de stabilité fixés par le laboratoire : nous confirmons la faisabilité avant d’engager la course.",
      },
      {
        question: "Qui prépare le colis de prélèvement ?",
        answer:
          "L’expéditeur : le laboratoire ou le cabinet remet un colis conditionné selon les consignes du laboratoire destinataire, généralement en triple emballage UN3373 pour les échantillons de catégorie B. Le coursier le transporte fermé, sans l’ouvrir.",
      },
      {
        question: "Un relevé de température est-il possible ?",
        answer:
          "Oui, sur demande : un relevé de température peut être joint à la course lorsque le protocole du laboratoire l’exige. Précisez-le au moment de la commande.",
      },
      {
        question: "En combien de temps un prélèvement est-il pris en charge ?",
        answer:
          "En moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Pour une urgence, appelez la coordination : nous confirmons la faisabilité avant l’enlèvement.",
      },
      {
        question: "Combien coûte le transport d’un prélèvement ?",
        answer:
          `Le prix d’une course classique, selon la zone et le délai : par exemple ${gridPrice("flash", 0)} € TTC en Super (1 h) intramuros. Le contenant isotherme est compris.`,
      },
    ],
  },
];

export function getLandingService(slug: string): LandingService | undefined {
  return LANDING_SERVICES.find((s) => s.slug === slug);
}
