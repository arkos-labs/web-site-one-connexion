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
    title: "Coursier pour laboratoire à Paris : prélèvements et matériel",
    description:
      "Coursier pour laboratoire à Paris : transport de prélèvements, de matériel et de documents en course dédiée, traçabilité de la prise en charge à la remise.",
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
      {
        title: "Prélèvements et chaîne du froid",
        paragraphs: [
          "Pour un prélèvement qui doit rester au frais, le contenant isotherme est convenu à la commande et préparé par le laboratoire. Le coursier le transporte fermé, sans l’ouvrir, et va directement chez le destinataire pour limiter la durée du trajet. Le détail du service figure sur notre page de [transport de prélèvements sanguins](/services/transport-prelevements-sang).",
          "Le [guide des prélèvements médicaux](/guides/transport-de-prelevements-medicaux) explique comment préparer l’envoi, quel conditionnement prévoir et ce que le coursier prend en charge ou non. Pour les établissements d’hébergement, lisez aussi notre guide du [coursier pour EHPAD](/guides/coursier-ehpad-logistique-des-soins).",
        ],
      },
      {
        title: "Matériel et consommables : ce qui se transporte, ce qui ne se transporte pas",
        paragraphs: [
          "Réactifs sous conditionnement fermé, consommables, petites pièces d’appareil, documents d’analyse : tout ce qui tient dans un colis léger peut partir en course dédiée. Notre [transport de matériel médical](/services/transport-medical) couvre ces envois entre laboratoires, cabinets et établissements.",
          "Notre flotte est composée de deux-roues. Un volume ou un gabarit important, ou un conditionnement qui demande des précautions particulières, doit nous être signalé avant la commande : nous vous disons si nous pouvons prendre l’envoi en charge, plutôt que de le découvrir à l’enlèvement.",
        ],
      },
      {
        title: "Preuve de remise et destinataire désigné",
        paragraphs: [
          "À chaque course, l’heure de prise en charge et l’heure de remise sont enregistrées, avec le nom de la personne qui reçoit l’envoi. Ces informations peuvent être conservées dans le dossier de l’échantillon ou de la commande de matériel.",
          "Indiquez à la commande le service ou la personne destinataire, ainsi qu’un numéro joignable : le coursier remet l’envoi en main propre, pas à un accueil non prévu.",
        ],
      },
    ],
    faq: [
      {
        question: "Pouvez-vous transporter des prélèvements pour un laboratoire ?",
        answer:
          "Oui, en course dédiée : le coursier transporte le colis fermé, sans l’ouvrir, et le remet en main propre au service désigné. Pour les prélèvements à conserver au frais, le contenant isotherme est convenu à la commande.",
      },
      {
        question: "Qui prépare le colis avant l’enlèvement ?",
        answer:
          "Le laboratoire, selon ses protocoles. Le coursier transporte le colis tel qu’il lui est remis, calé et dans le sens indiqué.",
      },
      {
        question: "En combien de temps le coursier prend-il l’envoi en charge ?",
        answer:
          "En moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Nous confirmons la faisabilité avant d’engager la course.",
      },
      {
        question: "Combien coûte une course pour un laboratoire ?",
        answer:
          `Le prix dépend de la zone et du délai, jamais de la nature de l’envoi. À Paris, une course Normal (sous 3 h) coûte ${gridPrice("standard", 0)} € TTC, une course Urgent (sous 1 h 30) ${gridPrice("urgent", 0)} € TTC et une course Super (sous 1 h) ${gridPrice("flash", 0)} € TTC.`,
      },
      {
        question: "Peut-on organiser des envois réguliers entre deux sites ?",
        answer:
          "Oui. Nous convenons à l’avance des adresses, des contenants et des personnes à prévenir, et vous gardez un interlocuteur unique pour toutes vos courses.",
      },
    ],
  },
  {
    slug: "coursier-avocat-notaire",
    name: "Coursier avocat et notaire",
    title: "Coursier avocat et notaire à Paris : actes et pièces",
    description:
      "Coursier pour avocat et notaire à Paris : transport de pièces, actes et dossiers en course dédiée, remise en main propre et suivi de chaque envoi.",
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
      {
        title: "Pièces, actes et dossiers : ce qui part et comment le préparer",
        paragraphs: [
          "Un envoi de cabinet ou d’étude se prépare comme un dossier : pièces classées, actes dans une pochette ou une enveloppe fermée, nom du destinataire inscrit lisiblement. Plus l’envoi est sensible, plus il est utile de le sceller avant l’arrivée du coursier. Pour un original ou un document confidentiel, voyez notre service de [plis confidentiels](/services/plis-confidentiels).",
          "Le guide pour [envoyer un pli confidentiel à Paris](/guides/envoyer-un-pli-confidentiel-paris) détaille cette préparation. Le coursier transporte l’envoi tel qu’il lui est remis, sans l’ouvrir.",
        ],
      },
      {
        title: "Preuve de remise et traçabilité du dossier",
        paragraphs: [
          "À la remise, le nom de la personne qui reçoit l’envoi et l’heure sont enregistrés. Cette preuve peut être jointe au dossier du client, pour établir qu’une pièce ou un acte a bien été remis à la date et à l’heure voulues.",
          "L’avancement de la course est consultable en ligne depuis la prise en charge, et le coursier reste joignable. Vous pouvez prévenir le destinataire de l’arrivée, ce qui évite l’attente à l’accueil.",
        ],
      },
      {
        title: "Un seul coursier, un seul destinataire",
        paragraphs: [
          "Le principe tient en une phrase : un envoi, un coursier, un trajet direct. C’est la [course dédiée](/guides/course-dediee-coursier), qui évite les arrêts intermédiaires et les regroupements avec d’autres colis.",
          "Pour un cabinet comme pour une étude, cela signifie que le dossier n’est pas confié à un tiers en cours de route et ne transite par aucun dépôt. Si le destinataire change au dernier moment, prévenez-nous : le coursier est joignable et adapte la remise.",
        ],
      },
    ],
    faq: [
      {
        question: "Pouvez-vous transporter des actes et des pièces de procédure ?",
        answer:
          "Oui. Pièces de procédure, conclusions, actes à faire signer et dossiers sont transportés en course dédiée, avec remise en main propre à la personne désignée.",
      },
      {
        question: "À qui le dossier est-il remis ?",
        answer:
          "À la personne désignée lors de la commande : le nom du clerc, du notaire ou du greffier est consigné avec l’heure de remise.",
      },
      {
        question: "Peut-on déposer un dossier au tribunal ou au greffe ?",
        answer:
          "Oui. Indiquez le service destinataire et l’heure limite : le coursier se présente à l’accueil avec ces éléments.",
      },
      {
        question: "Le dossier voyage-t-il avec d’autres colis ?",
        answer:
          "Non. La course est dédiée à un seul envoi : le dossier ne passe par aucun dépôt et reste avec le coursier jusqu’à la remise.",
      },
      {
        question: "Combien coûte une course pour un cabinet ou une étude ?",
        answer:
          `Le prix dépend de la zone et du délai choisi. À Paris, une course Normal (sous 3 h) coûte ${gridPrice("standard", 0)} € TTC, une course Urgent (sous 1 h 30) ${gridPrice("urgent", 0)} € TTC et une course Super (sous 1 h) ${gridPrice("flash", 0)} € TTC.`,
      },
    ],
  },
  {
    slug: "coursier-dimanche-paris",
    name: "Coursier dimanche Paris",
    title: "Coursier le dimanche à Paris : course dédiée 7j/7",
    description:
      "Besoin d'un coursier le dimanche à Paris ? Une course dédiée par envoi, prise en charge en moins de 45 minutes, suivi en direct et remise horodatée.",
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
      {
        title: "Ce qui circule le dimanche",
        paragraphs: [
          "Les envois du dimanche relèvent de quelques familles : plis et documents à remettre avant la reprise du lundi, prélèvements et matériel dont un laboratoire a besoin sans attendre, pièces ou colis légers qu’un collaborateur ou un client attend. Dans tous les cas, l’envoi part en [course dédiée](/guides/course-dediee-coursier) : un coursier pour un seul envoi, sans regroupement avec d’autres colis.",
          "Le gabarit compte autant que la nature de l’envoi. Notre flotte est composée de deux-roues : elle convient aux plis, aux documents, aux petits colis et au matériel léger. Pour un volume ou un format important, prévenez-nous avant de commander.",
        ],
      },
      {
        title: "Organiser une course un dimanche",
        paragraphs: [
          "Commandez dès que l’envoi est prêt, en ligne ou par téléphone. La prise en charge se fait en moins de 45 minutes, sous réserve de disponibilité au moment de la commande, et nous confirmons la faisabilité avant d’engager le coursier. Si le besoin est pressant, regardez aussi notre service de [coursier urgent à Paris](/services/coursier-urgent-paris).",
          "Une fois la course lancée, vous suivez son avancement en ligne et le coursier reste joignable. Les [zones couvertes](/zones/ile-de-france) vont de Paris à la grande couronne : indiquez l’adresse complète pour vérifier que votre trajet en fait partie.",
        ],
      },
      {
        title: "Dimanche et jours fériés : ce qui change et ce qui ne change pas",
        paragraphs: [
          "Les horaires de prise en charge sont ceux de toute la semaine : 7j/7 de 8h à 19h. Ce qui change le dimanche, c’est l’environnement : bureaux fermés, accueils absents, destinataire à joindre autrement. Ce qui ne change pas, c’est la méthode : une course dédiée, un suivi en ligne, une remise en main propre et l’heure de remise enregistrée.",
          "Pour un jour férié, appelez-nous avant de commander : nous confirmons la faisabilité avant d’engager le coursier.",
        ],
      },
    ],
    faq: [
      {
        question: "Livrez-vous le dimanche à Paris ?",
        answer:
          "Oui, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Nous confirmons la faisabilité avant d’engager le coursier.",
      },
      {
        question: "Que se passe-t-il si le destinataire est absent ?",
        answer:
          "Le coursier vous appelle avant toute décision : il attend, remet l’envoi à la personne que vous désignez, ou le rapporte. Sans consigne, il ne laisse pas l’envoi à un tiers.",
      },
      {
        question: "Faut-il préparer l’envoi à l’avance ?",
        answer:
          "Oui : indiquez l’adresse complète avec le code d’accès et l’étage, un destinataire joignable et l’heure de remise souhaitée, et préparez l’envoi fermé avant l’arrivée du coursier.",
      },
      {
        question: "Comment connaître le prix d’une course le dimanche ?",
        answer:
          "Le prix dépend de la zone et du délai choisi, et il s’affiche avant de valider la commande.",
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
  {
    slug: "livraison-jour-meme-b2b",
    name: "Livraison le jour même B2B",
    title: "Livraison le jour même B2B : coursier dédié en Île-de-France",
    description:
      "Livraison le jour même B2B en Île-de-France : une course dédiée pour chaque envoi professionnel, prise en charge en moins de 45 minutes, remise horodatée.",
    h1: "Livraison le jour même B2B : une course dédiée pour chaque envoi",
    intro:
      "Un contrat à faire parvenir avant la fin de la journée, une pièce qui bloque un site, une commande client à livrer sans attendre demain : le coursier part pour votre seul envoi et le remet en main propre, avec une preuve de livraison.",
    sections: [
      {
        title: "Livraison le jour même : ce que cela change pour une entreprise",
        paragraphs: [
          "Pour une entreprise, une livraison le jour même n’est pas un confort : c’est un engagement tenu envers un client, un partenaire ou un site de production. La différence avec un transporteur classique tient à la course dédiée. Un coursier prend en charge un seul envoi, le conduit directement à destination, sans passage par un centre de tri ni tournée à plusieurs arrêts. L’heure de remise n’est pas une estimation de fin de journée : c’est celle du trajet.",
          "C’est aussi une livraison documentée. Chaque course produit un justificatif : le nom de la personne qui reçoit l’envoi, l’heure exacte et le lieu sont enregistrés à la remise, archivés sur votre compte et restitués sur demande. Pour les équipes qui commandent régulièrement, c’est la garantie de retrouver en quelques secondes qui a reçu quoi, et quand. Vous gardez un interlocuteur unique, qui connaît vos adresses et vos consignes, plutôt qu’un standard. Cette organisation est détaillée sur la page [notre méthode](/methode).",
        ],
      },
      {
        title: "Livraison le jour même : commande et horaires (7j/7, 8h–19h)",
        paragraphs: [
          "Vous commandez en ligne, par téléphone ou depuis votre compte, en indiquant l’adresse d’enlèvement, la destination, la nature de l’envoi et l’heure limite de remise. Le coursier prend l’envoi en charge en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande.",
          "Le délai de livraison dépend de la formule : Normal sous 3 h, Urgent sous 1 h 30, Super sous 1 h. Pour une livraison le jour même, choisissez la formule qui correspond à votre heure limite. Si l’envoi doit être remis avant une heure précise, dites-le à la commande : nous confirmons la faisabilité avant d’engager la course, plutôt que d’accepter puis de manquer l’échéance.",
        ],
      },
      {
        title: "Secteurs concernés : juridique, santé, e-commerce, industrie",
        paragraphs: [
          "La livraison le jour même sert des métiers très différents. Les cabinets juridiques y recourent pour des actes et pièces à déposer avant une clôture ; les laboratoires et établissements de santé pour des prélèvements, du matériel et des documents confidentiels ; les e-commerçants pour livrer une commande client dans la journée, ou traiter un retour ou un échange urgent ; les sites industriels et ateliers pour recevoir une pièce de rechange qui immobilise une activité.",
          "Chaque secteur a ses exigences de procédure, que nous détaillons métier par métier sur la page [nos secteurs d’activité](/secteurs). Quel que soit le secteur, la règle reste la même : un coursier, un envoi, un trajet direct, une remise en main propre horodatée.",
        ],
      },
      {
        title: "Tarifs et mise en place d’un compte entreprise",
        paragraphs: [
          `Le prix dépend de la zone la plus éloignée du trajet et du délai choisi, jamais de la nature de l’envoi (jusqu’à 18 kg). À Paris, une course coûte ${gridPrice("standard", 0)} € TTC en Normal, ${gridPrice("urgent", 0)} € TTC en Urgent et ${gridPrice("flash", 0)} € TTC en Super ; en petite couronne, elle démarre à ${gridPrice("standard", 1)} € TTC en Normal. Le prix exact s’affiche avant de valider la commande, et la grille complète figure sur la page [tarif coursier Paris](/tarifs).`,
          "Pour des livraisons régulières, ouvrez un [compte entreprise](/services/compte-entreprise) : l’ouverture se fait en ligne en 2 minutes, plusieurs collaborateurs, services ou sites peuvent avoir leur propre compte avec le même SIRET, et les factures se règlent sous 30 jours. Un tarif dégressif s’applique au-delà d’un volume mensuel régulier. Si vos besoins se répètent sur les mêmes trajets, voyez aussi nos [tournées régulières](/services/tournees-regulieres).",
        ],
      },
    ],
    faq: [
      {
        question: "Qu’est-ce qu’une livraison le jour même B2B ?",
        answer:
          "C’est la livraison d’un envoi professionnel, document, pièce ou colis, le jour de la commande, par un coursier dédié qui va directement de l’enlèvement à la remise, sans regroupement avec d’autres colis.",
      },
      {
        question: "En combien de temps le coursier vient-il chercher l’envoi ?",
        answer:
          "En moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Nous confirmons la faisabilité avant d’engager la course.",
      },
      {
        question: "Comment suivre et prouver la livraison ?",
        answer:
          "L’avancement de la course est visible en ligne. À la remise, le nom du destinataire, l’heure et le lieu sont enregistrés ; le justificatif est archivé sur votre compte et restituable sur demande.",
      },
      {
        question: "Combien coûte une livraison le jour même ?",
        answer:
          `Selon la zone et le délai : à Paris, ${gridPrice("standard", 0)} € TTC en Normal (sous 3 h), ${gridPrice("urgent", 0)} € TTC en Urgent (sous 1 h 30) et ${gridPrice("flash", 0)} € TTC en Super (sous 1 h). Le prix s’affiche avant de commander.`,
      },
      {
        question: "Faut-il un compte entreprise pour commander ?",
        answer:
          "Non, on peut commander à la course. Un compte entreprise est utile pour des livraisons régulières : plusieurs comptes avec le même SIRET, factures détaillées course par course, à régler sous 30 jours.",
      },
    ],
  },
];

export function getLandingService(slug: string): LandingService | undefined {
  return LANDING_SERVICES.find((s) => s.slug === slug);
}
