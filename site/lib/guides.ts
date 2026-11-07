/**
 * lib/guides.ts
 * Guides pratiques (requêtes d'information). Pas de promesses non vérifiables :
 * aucune certification ni assurance n'y est affirmée. Les renvois vers les
 * prestations portent les engagements ; la grille chiffrée vit sur /tarifs.
 *
 * Une page = une recherche : chaque guide vise la requête de son seoTitle et de
 * son h1. Les liens internes s'écrivent [ancre](/chemin) dans les paragraphes
 * et les listes.
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
  /** Titre éditorial : carte du sommaire /guides, fil d'Ariane, schéma Article. */
  title: string;
  /** H1 de la page. */
  h1: string;
  /** Balise title, affichée telle quelle (sans suffixe du site). */
  seoTitle: string;
  /** Meta description. */
  description: string;
  /** Résumé de la carte du sommaire /guides (page à ne pas modifier). */
  summary: string;
  intro: string;
  sections: GuideSection[];
  faq: { question: string; answer: string }[];
  /** Prestation liée */
  service: { href: string; label: string };
  published: string; // ISO
  /** Plan à 6 H2 : titre « Questions fréquentes » rendu en H2. */
  faqHeading?: boolean;
  /** Dernière modification de fond (schéma Article dateModified) ; à défaut, `published`. */
  modified?: string; // ISO
}

export const GUIDES: Guide[] = [
  {
    slug: "envoyer-un-pli-confidentiel-paris",
    title: "Envoyer un pli confidentiel à Paris : bien préparer sa remise",
    h1: "Envoi sous pli confidentiel : comment procéder",
    seoTitle: "Envoi sous pli confidentiel : la méthode à Paris",
    description:
      "Envoi sous pli confidentiel à Paris : comment préparer le document, choisir la remise en main propre et suivre la course jusqu'à la signature.",
    summary:
      "Comment préparer, faire prendre en charge et suivre un pli confidentiel à Paris : conditionnement, remise en main propre, preuve de remise, course dédiée.",
    intro:
      "Contrat, acte, dossier de candidature, pièce d'un dossier judiciaire : certains documents ne doivent passer que par les mains de leur destinataire. Voici la méthode, étape par étape, avant de confier un tel document à un coursier.",
    sections: [
      {
        heading: "Préparer le document avant l'envoi",
        paragraphs: [
          "Le document voyage fermé et identifiable. Quelques précautions évitent la plupart des incidents :",
        ],
        list: [
          "Une enveloppe ou pochette opaque, fermée, sans mention du contenu à l'extérieur.",
          "Le nom complet du destinataire et, si besoin, son service ou son étage.",
          "Un numéro de téléphone joignable côté enlèvement et côté remise.",
          "Une référence de dossier, pour retrouver la course dans votre facturation.",
        ],
      },
      {
        heading: "Remise en main propre ou dépôt",
        paragraphs: [
          "La remise en main propre signifie que l'enveloppe n'est confiée ni à un accueil ni à un voisin : seul le destinataire nommé la reçoit. Si celui-ci est absent, le coursier vous appelle avant toute autre décision.",
          "Le dépôt à un accueil ou à un service courrier reste possible, mais seulement sur consigne de votre part. Choisissez-le quand le destinataire n'a pas à signer lui-même, et la main propre dès qu'il faut prouver qui a reçu le document.",
        ],
      },
      {
        heading: "Suivre la course jusqu'à la remise",
        paragraphs: [
          "Demandez toujours une preuve de remise : nom du destinataire, date et heure. C'est elle qui vous permet de justifier d'un dépôt ou d'une réception dans un dossier.",
          "À la commande, indiquez l'heure limite de remise réelle (par exemple une fermeture de greffe), les contraintes d'accès (badge, contrôle d'identité, interphone) et la personne à demander sur place. Ces éléments comptent plus que la distance pour tenir un délai.",
        ],
      },
      {
        heading: "Confier l'envoi à un coursier",
        paragraphs: [
          "Pour un document sensible ou urgent, la course dédiée est la plus adaptée : le coursier part de votre adresse et va directement chez le destinataire, sans arrêt intermédiaire. Pour des envois récurrents et moins pressés (courrier quotidien entre deux sites), une tournée régulière est plus économique. Pour les cabinets et les études, voyez notre [coursier avocat et notaire](/services/coursier-avocat-notaire).",
          "Le détail des engagements figure sur la page de notre [service de transport de plis confidentiels](/services/plis-confidentiels), et le [tarif d'une course](/tarifs) sur notre grille.",
        ],
      },
    ],
    faq: [
      {
        question: "Puis-je faire remettre un document à une personne précise uniquement ?",
        answer:
          "Oui, indiquez à la commande que la remise se fait en main propre au destinataire nommé. Si celui-ci est absent, le coursier vous appelle avant toute autre décision.",
      },
      {
        question: "Comment savoir que le document est bien arrivé ?",
        answer:
          "La remise est horodatée avec le nom de la personne qui l'a reçu, et cette information est visible dans votre espace en ligne.",
      },
      {
        question: "Quel délai prévoir ?",
        answer:
          "Cela dépend de la distance et de l'heure. Pour une échéance stricte, appelez-nous avant de commander : nous vous confirmons ce qui est réaliste.",
      },
      {
        question: "Combien coûte un tel envoi dans Paris ?",
        answer:
          "Comme toute course : 28 € TTC en Normal (3 h), 42 € en Urgent (1 h 30) et 56 € en Super (1 h) intramuros. Le prix ne dépend pas du contenu de l'enveloppe.",
      },
      {
        question: "L'enveloppe peut-elle être regroupée avec d’autres envois ?",
        answer:
          "Non. Chaque envoi part en course dédiée : le coursier va directement de l’enlèvement au destinataire, sans arrêt intermédiaire.",
      },
    ],
    service: { href: "/services/plis-confidentiels", label: "Plis confidentiels" },
    published: "2026-09-21",
  },
  {
    slug: "transport-de-prelevements-medicaux",
    title: "Transport de prélèvements médicaux : les points à anticiper",
    h1: "Transport matériel médical : le guide des prélèvements",
    seoTitle: "Transport matériel médical : prélèvements et courses",
    description:
      "Transport de matériel médical et de prélèvements : conditionnement, chaîne du froid et course dédiée pour laboratoires et établissements de santé.",
    summary:
      "Faire transporter des prélèvements : conditionnement, délai de stabilité, température, remise et traçabilité. Ce qu'un laboratoire doit anticiper.",
    intro:
      "Un prélèvement a un délai de stabilité : passé ce délai, l'analyse peut être compromise. Ce guide rappelle ce qu'il faut anticiper côté expéditeur pour qu'un coursier puisse acheminer un échantillon dans de bonnes conditions.",
    sections: [
      {
        heading: "Ce que recouvre le transport de prélèvements",
        paragraphs: [
          "Tubes, flacons, écouvillons : chaque type d'échantillon a ses propres exigences de délai et de température, définies par le laboratoire destinataire. Le délai de stabilité commande tout le reste.",
          "Communiquez à la commande l'heure limite d'arrivée et la température de conservation demandée : le choix du mode de transport en découle.",
        ],
      },
      {
        heading: "Conditionnement et chaîne du froid",
        paragraphs: [
          "Les échantillons biologiques sont soumis à des règles de conditionnement et d'étiquetage, souvent désignées sous la référence UN3373 (catégorie B) pour le transport routier. Le conditionnement conforme est préparé par l'expéditeur, généralement selon les consignes du laboratoire destinataire.",
          "La température fait partie de la commande : un tube de sang réfrigéré ne voyage pas comme un échantillon à température ambiante. Le contenant isotherme est convenu à l'avance, et le coursier transporte le colis fermé tel qu'il est remis. Si votre envoi exige une conformité réglementaire particulière, précisez-la avant la commande : nous vous dirons clairement si nous pouvons la prendre en charge.",
        ],
      },
      {
        heading: "Organiser la course avec un laboratoire",
        paragraphs: ["Quatre informations suffisent à éviter la plupart des malentendus :"],
        list: [
          "L'identité du destinataire et son service de réception.",
          "L'heure limite d'arrivée et la température de conservation.",
          "Un contact joignable à l'enlèvement et à la remise.",
          "Le nombre de colis, pour vérifier la remise complète.",
        ],
      },
      {
        heading: "Passer du guide au service",
        paragraphs: [
          "Pour un prélèvement, la course dédiée évite les arrêts intermédiaires. La remise est horodatée avec le nom du réceptionnaire, ce qui permet de reconstituer le trajet en cas de question du laboratoire.",
          "Pour commander, voyez notre service de [coursier médical moto](/services/transport-medical). Pour les réactifs, consommables et instruments, lisez le guide de l'[expédition de matériel de laboratoire](/guides/expedier-du-materiel-de-laboratoire).",
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
          "Appelez la coordination au lieu de passer par le formulaire : nous confirmons la faisabilité avant l'enlèvement.",
      },
      {
        question: "Qu’est-ce que le triple emballage UN3373 ?",
        answer:
          "C’est le conditionnement des échantillons biologiques de catégorie B : un récipient étanche (le tube), un emballage secondaire étanche avec absorbant, et un emballage extérieur rigide étiqueté UN3373. Le coursier le transporte fermé, sans l’ouvrir.",
      },
      {
        question: "Combien coûte le transport d’un prélèvement ?",
        answer:
          "Le prix d’une course classique, selon la zone et le délai : par exemple 56 € TTC en Super (1 h) intramuros. Le contenant isotherme est compris.",
      },
    ],
    service: { href: "/services/transport-medical", label: "Transport médical" },
    published: "2026-09-21",
  },
  {
    slug: "prix-coursier-express-paris",
    title: "Prix d'un coursier express à Paris : ce qui fait varier le tarif",
    h1: "Prix coursier Paris : ce qui fait varier la facture",
    seoTitle: "Prix coursier Paris : comprendre le coût d'une course",
    description:
      "Prix d'un coursier à Paris : ce qui fait varier la facture, les postes de coût et les questions à poser avant de commander une course express.",
    summary:
      "Tarif d'un coursier à Paris : distance, délai, zone et volume. Comment connaître le prix avant de commander.",
    intro:
      "Il n'existe pas de prix unique pour un coursier : la même course peut varier selon quelques critères précis. Les connaître permet de comparer des offres sur des bases identiques.",
    sections: [
      {
        heading: "Prix coursier Paris : les composantes du tarif",
        paragraphs: [
          "Une course express se décompose en quelques postes : le trajet entre l'enlèvement et la remise, le délai demandé, le niveau de service qu'exige l'envoi et, pour les clients réguliers, le volume mensuel.",
          "Un pli remis contre preuve, un prélèvement avec contraintes de manutention ou un colis standard n'exigent pas le même niveau de service. Le volume compte aussi : un compte entreprise permet de régler les factures sous 30 jours et peut ouvrir une grille adaptée aux envois réguliers.",
          "Sur toute offre, trois éléments suffisent à juger le prix : la zone de départ et d'arrivée, le délai promis, et les conditions de facturation (TTC ou HT, paiement à la course ou compte entreprise). Si l'un des trois reste flou, la comparaison entre deux devis n'a pas de sens. Notre [grille de tarifs](/tarifs) détaille ces trois éléments pour chacune de nos formules.",
        ],
      },
      {
        heading: "Combien coûte une course à Paris, en petite couronne, en grande couronne",
        paragraphs: [
          "Le prix dépend d'abord de la zone. À Paris intramuros, une course coûte 28 € TTC en Normal (3 h), 42 € TTC en Urgent (1 h 30) et 56 € TTC en Super (1 h). En petite couronne (92, 93, 94), elle démarre à 39 € TTC en Normal, 58,50 € TTC en Urgent et 78 € TTC en Super, jusqu'à 8 km de route, puis 2 € TTC par km supplémentaire en Normal.",
          "En grande couronne (77, 78, 91, 95), il n'y a pas de prix fixe : le montant dépend de la distance depuis Paris, retour à vide compris, et s'affiche avant la commande. Quand le trajet traverse deux zones, la zone la plus éloignée s'applique. Pour le détail des communes et des délais, voyez notre page [coursier banlieue Paris](/zones/petite-couronne).",
          "Plus le délai est court, plus la course coûte cher : en intramuros, la même course coûte le double livrée en 1 h plutôt qu'en 3 h. Une course programmée à l'avance laisse un créneau plus large qu'une course immédiate, et une navette régulière, avec un passage fixé, est en général la formule la plus économique pour des besoins répétés.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super 1 h"],
          rows: [
            ["Paris", "28 €", "42 €", "56 €"],
            ["Petite couronne (dès)", "39 €", "58,50 €", "78 €"],
          ],
          note: "Prix par course, TTC (TVA 20 % comprise). Petite couronne : kilomètres compris jusqu'à 8 km de route. Grande couronne : prix selon la distance, affiché avant la commande.",
        },
      },
      {
        heading: "Prix d'un coursier : les 5 erreurs de calcul",
        paragraphs: [
          "Comparer deux devis de coursier est plus piégeux qu'il n'y paraît. Voici les cinq erreurs les plus fréquentes :",
        ],
        list: [
          "Comparer un prix HT à un prix TTC : l'écart est de 20 %.",
          "Ignorer le délai : un prix bas pour une livraison sous 3 h n'a rien à voir avec un prix pour une livraison sous 1 h.",
          "Oublier la zone la plus éloignée : dès que le trajet sort de Paris, c'est la zone de destination qui s'applique.",
          "Comparer une course dédiée à une course regroupée : le colis regroupé coûte moins cher, mais son heure d'arrivée dépend des autres envois de la tournée.",
          "Négliger les suppléments : certains coursiers facturent le poids, le nombre d'adresses ou l'attente. Chez One Connexion, la nature du colis (jusqu'à 18 kg) ne change pas le prix.",
        ],
      },
      {
        heading: "Course dédiée ou plateforme : quel coût réel",
        paragraphs: [
          "Le prix affiché ne dit pas tout : le coût réel inclut le risque de retard et le temps passé à suivre l'envoi. Une course dédiée mobilise un coursier pour un seul envoi, avec un trajet direct, une remise en main propre horodatée et un interlocuteur unique, c'est le principe de notre [méthode](/methode). Une plateforme mutualisée regroupe les envois pour baisser le prix unitaire, au prix d'un délai moins prévisible.",
          "Pour comparer deux coursiers, donnez à chacun les mêmes informations et posez les mêmes questions :",
        ],
        list: [
          "Le prix est-il TTC, et la facture détaille-t-elle le montant HT ?",
          "La course est-elle dédiée, ou le colis est-il regroupé avec d'autres envois ?",
          "Le prix change-t-il selon le poids, le contenu ou le nombre d'adresses ?",
          "Une preuve de remise, avec nom et heure, est-elle fournie ?",
          "Pour une estimation juste : adresses exactes, heure limite, nature du colis, poids et volume approximatifs, fréquence prévue.",
        ],
      },
      {
        heading: "Demander un devis",
        paragraphs: [
          "Les montants par zone et par délai figurent sur notre [grille tarifaire coursier](/tarifs), et le prix exact s'affiche avant de valider la commande. Pour des envois réguliers, le [compte entreprise](/services/compte-entreprise) applique un tarif dégressif selon le volume mensuel, avec des factures à régler sous 30 jours.",
          "Pour une course urgente dans Paris, voyez notre [service de coursier express](/services/coursier-express-paris) et notre [coursier urgent Paris](/services/coursier-urgent-paris).",
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
          "Oui : un délai de 1 h coûte le double d'un délai de 3 h. Un créneau plus large réduit le prix.",
      },
      {
        question: "Le prix change-t-il selon le poids ou le contenu ?",
        answer:
          "Non. Un pli, un dossier ou un colis jusqu’à 18 kg coûtent le même prix : seuls la zone la plus éloignée du trajet et le délai comptent.",
      },
      {
        question: "Les prix sont-ils HT ou TTC ?",
        answer:
          "Les prix affichés sont TTC, TVA de 20 % comprise, pour les professionnels comme pour les particuliers. La facture détaille le montant HT et la TVA.",
      },
      {
        question: "Existe-t-il un prix dégressif ?",
        answer:
          "Oui, avec un compte entreprise : au-delà d’un volume mensuel régulier, un tarif dégressif s’applique et les factures se règlent sous 30 jours.",
      },
    ],
    service: { href: "/tarifs", label: "Grille tarifaire" },
    published: "2026-09-21",
    modified: "2026-11-02",
  },
  {
    slug: "combien-coute-un-coursier-a-paris",
    title: "Combien coûte un coursier à Paris ? Prix et calcul détaillé",
    h1: "Combien coûte un coursier à Paris ? Prix et calcul détaillé",
    seoTitle: "Combien coûte un coursier à Paris ? Prix et calcul détaillé",
    description:
      "Combien coûte un coursier à Paris ? Prix par formule, facteurs qui font varier le tarif, exemples chiffrés en banlieue et conseils pour réduire sa facture.",
    summary:
      "Le prix d'un coursier à Paris expliqué : tarifs par formule, calcul en petite couronne, coût réel d'une course dédiée et leviers pour réduire sa facture.",
    intro:
      "Combien coûte un coursier à Paris ? La réponse tient en une phrase : à partir de 28 € TTC pour une course dans Paris, et le montant exact dépend de deux critères, la zone et le délai. Ce guide détaille le calcul, avec des exemples chiffrés et les leviers pour réduire une facture de coursier professionnelle.",
    faqHeading: true,
    sections: [
      {
        heading: "Le prix d'un coursier à Paris en 2026",
        paragraphs: [
          "Dans Paris intramuros, le prix d'une course dépend du délai de livraison demandé. Trois formules existent : Normal (livraison sous 3 h), Urgent (sous 1 h 30) et Super (sous 1 h). Les prix sont TTC, TVA de 20 % comprise, identiques pour les professionnels et les particuliers, et le montant exact s'affiche avant de valider la commande.",
          "Le prix hors taxe s'obtient en divisant le prix TTC par 1,20. La facture détaille le montant HT et la TVA, ce qui compte pour un service comptable. Chaque formule correspond à une course dédiée : un coursier pour un seul envoi, sans regroupement. La grille complète figure sur notre page [tarif coursier Paris](/tarifs).",
          "Un exemple concret : un cabinet envoie un dossier du 8e au 12e arrondissement. En Normal, la course coûte 28 € TTC, soit 23,33 € HT. Si le dossier doit être remis dans l'heure, le même trajet passe à 56 € TTC, soit 46,67 € HT. Le trajet est identique : seul le délai a changé, et c'est lui qui fait l'écart.",
          "Ce qui ne fait pas varier le prix est tout aussi utile à savoir. La nature de l'envoi (pli confidentiel, prélèvement médical, colis, pièce de rechange) ne change pas le tarif, pas plus que la remise en main propre, le suivi en ligne ou la preuve de remise horodatée : tout cela est compris, dans la limite de 18 kg. Pour comprendre chaque poste de coût en détail, lisez notre guide [prix coursier Paris : comprendre le coût](/guides/prix-coursier-express-paris).",
        ],
        table: {
          head: ["Formule à Paris", "Prix TTC", "Prix HT"],
          rows: [
            ["Normal · 3 h", "28 €", "23,33 €"],
            ["Urgent · 1 h 30", "42 €", "35 €"],
            ["Super · 1 h", "56 €", "46,67 €"],
          ],
          note: "Prix par course, TVA 20 % comprise dans le prix TTC (HT = TTC ÷ 1,20).",
        },
      },
      {
        heading: "Les 5 facteurs qui font varier le tarif",
        paragraphs: [
          "Un coursier ne se facture pas au kilomètre partout ni à l'heure : cinq éléments fixent le prix, et il est utile de les connaître pour comparer des offres sur des bases identiques :",
        ],
        list: [
          "La zone : Paris, petite couronne (92, 93, 94) ou grande couronne (77, 78, 91, 95). Quand le trajet traverse deux zones, la zone la plus éloignée s'applique.",
          "Le délai : une course Urgente coûte 1,5 fois le prix Normal, une course Super 2 fois. En intramuros, la même course coûte le double livrée en 1 h plutôt qu'en 3 h.",
          "La distance en petite couronne : le prix de base couvre les 8 premiers kilomètres de route, puis chaque kilomètre en plus s'ajoute.",
          "Le type de service : une course ponctuelle se commande à la demande, une navette régulière sur créneaux fixes se chiffre sur devis.",
          "Le volume : un compte entreprise ouvre un tarif dégressif selon le volume mensuel.",
        ],
      },
      {
        heading: "Course dédiée ou plateforme mutualisée : le coût réel",
        paragraphs: [
          "Comparer le prix affiché ne suffit pas. Une plateforme mutualisée regroupe plusieurs envois sur une même tournée : le tarif unitaire peut être plus bas, mais l'heure d'arrivée dépend des autres livraisons, et un retard se paie en temps perdu, en client mécontent ou en échéance manquée. Une course dédiée mobilise un coursier pour un seul envoi, avec un trajet direct : le prix est connu avant la commande et le délai annoncé est le délai réel.",
          "Il faut aussi compter la preuve. Avec une course dédiée, la remise est horodatée, avec le nom du destinataire, et le coursier garde l'envoi de l'enlèvement à la remise : le jour où une réception est contestée, l'information est retrouvée en quelques secondes. Ce fonctionnement est détaillé sur la page [notre méthode](/methode), et l'urgence est le terrain du [coursier express Paris](/services/coursier-express-paris).",
          "Prenons un document à remettre avant la clôture d'un greffe. Si une course regroupée arrive après la clôture, l'économie de quelques euros se transforme en délai forclos. À l'inverse, pour un colis sans échéance, une formule Normal à 28 € ou une tournée régulière suffit. Le bon choix dépend donc de ce que coûte un retard, pas seulement du prix de la course.",
        ],
      },
      {
        heading: "Tarifs en petite couronne et en Île-de-France",
        paragraphs: [
          "En petite couronne, une course démarre à 39 € TTC en Normal, 58,50 € TTC en Urgent et 78 € TTC en Super, jusqu'à 8 km de route entre l'enlèvement et la livraison. Au-delà, chaque kilomètre en plus coûte 2 € TTC en Normal.",
          "Exemple : une course de 15 km par la route en petite couronne revient à 53 € TTC en Normal, soit 39 € de prix de base plus 7 km supplémentaires à 2 €. En grande couronne (77, 78, 91, 95), il n'y a pas de prix fixe : le montant dépend de la distance depuis Paris, retour à vide compris, et s'affiche avant la commande. Le détail des communes et des délais figure sur notre page [coursier banlieue Paris](/zones/petite-couronne).",
          "Pour une entreprise dont les sites sont répartis sur plusieurs départements, le calcul se fait course par course : chaque trajet est facturé à la zone la plus éloignée entre l'enlèvement et la livraison. Un trajet Paris – Montreuil relève ainsi de la petite couronne, un trajet Montreuil – Versailles de la grande couronne. Le prix s'affiche toujours avant de valider.",
        ],
      },
      {
        heading: "Comment réduire sa facture de coursier B2B",
        paragraphs: [
          "Cinq leviers permettent de maîtriser le budget sans sacrifier la fiabilité :",
        ],
        list: [
          "Choisir la formule au plus juste de l'échéance : si la livraison peut attendre 3 h, la formule Normal coûte deux fois moins cher que la formule Super.",
          "Programmer les courses à l'avance quand c'est possible : un créneau plus large évite de payer l'urgence.",
          "Transmettre des adresses complètes dès la commande (code d'accès, étage, contact joignable) : le coursier ne perd pas de temps sur place.",
          "Ouvrir un [compte entreprise](/services/compte-entreprise) : tarif dégressif selon le volume mensuel, un compte par service ou par site avec le même SIRET, et des factures détaillées course par course à régler sous 30 jours.",
          "Regrouper les besoins répétitifs en navettes régulières, chiffrées sur devis : voyez nos [tournées régulières](/services/tournees-regulieres), puis appelez-nous avec vos adresses et votre fréquence pour connaître le prix avant toute commande.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte un coursier à Paris ?",
        answer:
          "Une course dans Paris démarre à 28 € TTC en Normal (livraison sous 3 h), 42 € TTC en Urgent (sous 1 h 30) et 56 € TTC en Super (sous 1 h). Le prix exact s'affiche avant de valider la commande.",
      },
      {
        question: "Quel est le prix d'une course urgente ?",
        answer:
          "À Paris, 42 € TTC pour une livraison sous 1 h 30 et 56 € TTC pour une livraison sous 1 h. Une course Urgente coûte 1,5 fois le prix Normal, une course Super 2 fois.",
      },
      {
        question: "Les prix sont-ils HT ou TTC ?",
        answer:
          "Les prix affichés sont TTC, TVA de 20 % comprise, pour les professionnels comme pour les particuliers. La facture détaille le montant HT et la TVA.",
      },
      {
        question: "Le poids ou la nature du colis changent-ils le prix ?",
        answer:
          "Non. Un pli, un dossier ou un colis jusqu'à 18 kg coûtent le même prix : seuls comptent la zone la plus éloignée du trajet et le délai.",
      },
      {
        question: "Combien coûte une course en banlieue ?",
        answer:
          "En petite couronne, une course démarre à 39 € TTC en Normal, 58,50 € TTC en Urgent et 78 € TTC en Super, jusqu'à 8 km de route, puis 2 € TTC par km en plus en Normal.",
      },
      {
        question: "Existe-t-il un tarif pour les entreprises ?",
        answer:
          "Oui : avec un compte entreprise, un tarif dégressif s'applique au-delà d'un volume mensuel régulier, et les factures se règlent sous 30 jours.",
      },
    ],
    service: { href: "/tarifs", label: "Grille tarifaire" },
    published: "2026-11-02",
  },
  {
    slug: "expedier-du-materiel-de-laboratoire",
    title: "Expédier du matériel de laboratoire en Île-de-France : préparer l'envoi",
    h1: "Expédition matériel de laboratoire : le guide",
    seoTitle: "Expédition matériel de laboratoire : organiser l'envoi",
    description:
      "Expédition de matériel de laboratoire : préparer le colis, choisir le bon conditionnement et confier l'envoi à une course dédiée en Île-de-France.",
    summary:
      "Réactifs, consommables, pièce d'automate, instrument fragile : comment emballer et faire transporter du matériel de laboratoire en IDF, et à quel prix.",
    intro:
      "Un laboratoire fait circuler des réactifs, des consommables, des pièces d'automates et des instruments entre ses sites, ses fournisseurs et ses partenaires. Chacun de ces envois a ses propres contraintes. Ce guide vous aide à les identifier avant de commander une course, pour que le colis arrive à temps et en bon état.",
    sections: [
      {
        heading: "Préparer le matériel avant l'envoi",
        paragraphs: [
          "Derrière la même expression se cachent des envois très différents. Les consommables (cônes, tubes, plaques, gants) sont légers et peu sensibles. Les réactifs peuvent demander une température de conservation précise. Une pièce de rechange d'automate est souvent urgente, parce qu'elle immobilise une machine. Un instrument de mesure est fragile et doit voyager dans un sens donné.",
          "La plupart des incidents viennent d'une information manquante au moment de la commande. Voici ce qu'il faut savoir et transmettre :",
        ],
        list: [
          "La nature du contenu : consommable, réactif, pièce technique ou instrument.",
          "La température de conservation, s'il y en a une, et la durée pendant laquelle elle doit être tenue.",
          "La fragilité et le sens de transport, par exemple un appareil qui doit rester à plat.",
          "Le poids et les dimensions approximatives : un deux-roues transporte jusqu'à 18 kg, dans un top-case.",
          "L'heure limite d'arrivée réelle, par exemple le démarrage d'une série d'analyses.",
          "Le nom du destinataire, son service et un numéro joignable à l'enlèvement comme à la remise.",
        ],
      },
      {
        heading: "Conditionnement et étiquetage",
        paragraphs: [
          "Le coursier transporte le colis fermé, tel qu'il lui est remis. C'est donc à l'expéditeur de le préparer. Pour un instrument fragile, un calage qui empêche tout mouvement et une flèche indiquant le haut évitent l'essentiel des casses. Pour un réactif à conserver au froid, le contenant isotherme est convenu à la commande, et un relevé de température peut être joint si votre protocole l'exige.",
          "Certains produits demandent plus de précautions : solvants, produits corrosifs, gaz, carboglace. Selon leur nature et leur quantité, ils peuvent relever de la réglementation du transport de marchandises dangereuses, dite ADR, avec son propre étiquetage. Dans ce cas, appelez-nous avant de commander : nous vous dirons clairement si nous pouvons prendre l'envoi en charge ou s'il faut passer par un transporteur spécialisé.",
        ],
      },
      {
        heading: "Choisir le mode d'expédition",
        paragraphs: [
          "Le bon choix dépend de l'urgence et de la fréquence de vos envois. Le prix ne dépend ni du contenu ni du poids, jusqu'à 18 kg : seuls comptent la zone, la distance et le délai choisi. Le service fonctionne 7j/7, de 8 h à 19 h.",
        ],
        list: [
          "Course immédiate : pour une pièce qui bloque un automate ou un réactif attendu le jour même. Le coursier passe en moins de 45 minutes.",
          "Course programmée : pour un envoi prévu à l'avance, à une date et une heure choisies dans le formulaire. Elle se paie au tarif Normal.",
          "Tournée régulière : pour des navettes fréquentes entre deux sites, par exemple un réapprovisionnement en consommables plusieurs fois par semaine. Les jours et heures de passage sont fixés avec vous, sur devis.",
          "Envoi hors Île-de-France : la course assure le premier trajet, jusqu'aux locaux d'un transporteur national ou international en Île-de-France, ou jusqu'aux aéroports de Roissy et d'Orly. Le transporteur longue distance prend ensuite le relais.",
        ],
      },
      {
        heading: "Confier l'envoi à une course dédiée",
        paragraphs: [
          "En course dédiée, le coursier va directement chez le destinataire, sans arrêt intermédiaire, et la remise est horodatée avec le nom de la personne qui reçoit le colis. Voir aussi notre [coursier pour laboratoire](/services/coursier-laboratoire).",
          "Notre service de [transport de matériel médical](/services/transport-medical) détaille les engagements. Pour les échantillons biologiques, lisez notre guide du [transport de prélèvements médicaux](/guides/transport-de-prelevements-medicaux).",
        ],
      },
    ],
    faq: [
      {
        question: "Quel poids et quelle taille maximum pour un colis de laboratoire ?",
        answer:
          "18 kg, dans un top-case d'environ 60 × 40 cm. Au-delà de 10 kg, ou pour un colis encombrant, appelez-nous avant de commander.",
      },
      {
        question: "Pouvez-vous transporter des réactifs ou des produits chimiques ?",
        answer:
          "Cela dépend du produit et de la quantité. Pour tout produit susceptible d'être classé dangereux (solvant, corrosif, gaz, carboglace), contactez-nous avant de commander : nous confirmons ce qui est possible avant d'engager la course.",
      },
      {
        question: "Une pièce d'automate peut-elle être livrée le jour même ?",
        answer:
          "Oui, 7j/7 entre 8 h et 19 h. En course Super, la livraison se fait en 1 h, par exemple pour 56 € TTC intramuros. Le coursier passe en moins de 45 minutes.",
      },
      {
        question: "Comment ouvrir un compte pour les envois du laboratoire ?",
        answer:
          "L'ouverture du compte entreprise est immédiate. Il permet de commander en ligne, de suivre chaque course et de régler les factures sous 30 jours.",
      },
    ],
    service: { href: "/services/transport-medical", label: "Transport médical" },
    published: "2026-10-23",
  },
  {
    slug: "coursier-paris-banlieue",
    title: "Coursier entre Paris et la banlieue : zones, délais et prix",
    h1: "Coursier banlieue Paris : le guide pratique",
    seoTitle: "Coursier banlieue Paris : organiser une course hors Paris",
    description:
      "Coursier en banlieue parisienne : comment organiser une course vers ou depuis Paris, quelles zones couvrir et comment préparer votre envoi.",
    summary:
      "Coursier entre Paris et la banlieue : comment le prix est calculé en petite et grande couronne, quel délai choisir et comment préparer la course.",
    intro:
      "Envoyer un dossier de Paris à Nanterre, un colis de Montreuil à Créteil ou une pièce de Boulogne à Versailles : dès que la course sort de Paris, le prix et le délai ne se calculent plus de la même façon. Ce guide explique la méthode : ce qui change, comment préparer l'envoi et quelles zones sont desservies.",
    sections: [
      {
        heading: "Paris et banlieue : ce qui change pour une course",
        paragraphs: [
          "Dans Paris, le prix est le même d'un arrondissement à l'autre. Hors de Paris, il dépend de la distance, et c'est la zone la plus éloignée du trajet qui compte. Un aller de Paris 8e à Levallois-Perret est une course de petite couronne. Un trajet de Saint-Denis à Pontoise est une course de grande couronne, parce que l'une des deux adresses est dans le Val-d'Oise.",
          "En petite couronne, le prix suit la distance par la route entre l'enlèvement et la livraison : un prix fixe couvre les 8 premiers kilomètres, puis chaque kilomètre en plus est facturé. En grande couronne, il suit la distance entre Paris et l'adresse la plus éloignée, retour du coursier compris.",
          "Pour les trajets vers la banlieue, les rocades, La Défense ou les aéroports, nous utilisons des motos routières, plus adaptées que les scooters aux grands axes. Le colis voyage dans un top-case verrouillé, jusqu'à 18 kg.",
        ],
        table: {
          head: ["Délai", "Jusqu'à 8 km", "Chaque km en plus"],
          rows: [
            ["Normal 3 h", "39 €", "2 €"],
            ["Urgent 1 h 30", "58,50 €", "3 €"],
            ["Super 1 h", "78 €", "4 €"],
          ],
          note: "Petite couronne, tarifs TTC par course, TVA 20 % comprise. Le prix exact s'affiche avant de valider la commande.",
        },
      },
      {
        heading: "Préparer un envoi depuis la banlieue",
        paragraphs: [
          "Hors de Paris, les retards viennent rarement de la route. Ils viennent d'une adresse difficile à trouver ou d'un destinataire absent. Avant de commander, vérifiez ces points :",
        ],
        list: [
          "L'adresse complète avec le code postal, le bâtiment et l'étage, surtout dans les zones d'activité et les grands ensembles de bureaux.",
          "Le nom du destinataire et un numéro joignable côté enlèvement comme côté livraison.",
          "Les codes d'accès, l'entrée à utiliser et les horaires de réception, si le site ferme à l'heure du déjeuner.",
          "Le poids et la taille du colis, pour vérifier qu'il tient dans le top-case.",
          "Le délai réel : Normal (3 h), Urgent (1 h 30), Super (1 h), ou une course programmée à l'avance au tarif Normal. Le service fonctionne 7j/7, de 8 h à 19 h.",
        ],
      },
      {
        heading: "Les zones desservies",
        paragraphs: [
          "La petite couronne regroupe les trois départements qui touchent Paris : les Hauts-de-Seine (92), la Seine-Saint-Denis (93) et le Val-de-Marne (94). Les communes couvertes sont détaillées sur notre page [coursier en petite couronne](/zones/petite-couronne).",
          "La grande couronne regroupe la Seine-et-Marne (77), les Yvelines (78), l'Essonne (91) et le Val-d'Oise (95) : voyez notre page [coursier grand Paris](/zones/grande-couronne). Les aéroports de Roissy et d'Orly sont desservis au tarif de leur zone.",
          "Beaucoup de courses ne touchent pas Paris : un document entre deux agences, un colis entre un entrepôt et un client. Le coursier va directement d'une ville à l'autre, sans arrêt intermédiaire.",
        ],
      },
      {
        heading: "Passer d'un guide à une course",
        paragraphs: [
          "Saisissez les deux adresses avec leur code postal : la zone et le prix s'affichent avant de valider. Si la course doit desservir plusieurs destinataires, vous pouvez ajouter des adresses de livraison, payées au kilomètre depuis l'adresse précédente.",
          "Pour un envoi urgent au départ ou à l'arrivée de Paris, voyez notre service de [coursier express Paris](/services/coursier-express-paris).",
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte un coursier entre Paris et la petite couronne ?",
        answer:
          "En délai Normal, 39 € TTC jusqu'à 8 km entre l'enlèvement et la livraison, puis 2 € TTC par km en plus. Une course de 15 km coûte 53 € TTC. En Urgent, c'est 58,50 € puis 3 € par km, et en Super 78 € puis 4 € par km.",
      },
      {
        question: "Faites-vous des courses de banlieue à banlieue ?",
        answer:
          "Oui. Le coursier va directement d'une ville à l'autre, sans passer par Paris. En petite couronne, le prix suit les kilomètres entre les deux adresses. Si l'une des adresses est en grande couronne, le prix suit la distance depuis Paris de l'adresse la plus éloignée.",
      },
      {
        question: "Livrez-vous en dehors de l'Île-de-France ?",
        answer:
          "Non, nous livrons uniquement à Paris et en Île-de-France. Les aéroports de Roissy et d'Orly sont desservis au tarif de leur zone.",
      },
      {
        question: "Peut-on commander une course le dimanche ?",
        answer:
          "Oui. Le service fonctionne 7j/7, de 8 h à 19 h, dimanche compris. Pour un envoi prévu à l'avance, vous pouvez programmer la course à la date et à l'heure de votre choix.",
      },
      {
        question: "Comment ouvrir un compte pour les courses de l'entreprise ?",
        answer:
          "L'ouverture du compte entreprise est immédiate. Il permet de commander en ligne, de suivre chaque course et de régler les factures sous 30 jours.",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-10-29",
  },
  {
    slug: "livraison-le-jour-meme-entreprise",
    title: "Livraison le jour même pour les entreprises : bien l'organiser",
    h1: "Livraison le jour même pour les entreprises : comment l'organiser",
    seoTitle: "Livraison le jour même pour entreprise : guide B2B",
    description:
      "Livraison le jour même pour les entreprises à Paris et en Île-de-France : délais réels, formules, prix TTC et préparation de l'envoi.",
    summary:
      "Organiser une livraison le jour même en entreprise : quel délai choisir, combien ça coûte, comment préparer l'envoi et en garder la preuve.",
    intro:
      "Une pièce bloquée, un document à remettre avant la fermeture d'un greffe, un échantillon attendu pour le début d'une série : certaines livraisons ne peuvent pas attendre le lendemain. Ce guide explique comment organiser une livraison le jour même, quels délais existent et ce qu'il faut transmettre pour que l'envoi arrive à temps.",
    sections: [
      {
        heading: "Livraison le jour même : de quoi parle-t-on",
        paragraphs: [
          "Une livraison le jour même part et arrive dans la même journée de travail. Elle se distingue d'un envoi standard, qui s'organise sur un ou deux jours ouvrés, par une contrainte : l'heure limite de remise compte autant que la distance. Un dossier qui doit être déposé avant la fermeture d'un accueil ne se mesure pas en kilomètres, mais en minutes restantes.",
          "Dans une course dédiée, un coursier prend l'envoi à une adresse et le remet à une autre, sans passer par un centre de tri. C'est la forme la plus directe de livraison le jour même. Le service fonctionne 7j/7, de 8 h à 19 h : au-delà de cette plage, il faut prévoir une course pour le lendemain.",
        ],
      },
      {
        heading: "Choisir le bon délai",
        paragraphs: [
          "Le délai se choisit à la commande, et c'est lui qui fixe le prix. Trois formules existent : Normal (livraison sous 3 h), Urgent (sous 1 h 30) et Super (sous 1 h). Pour une course dans Paris, les prix TTC sont de 28 €, 42 € et 56 €.",
        ],
        table: {
          head: ["Zone", "Normal · 3 h", "Urgent · 1 h 30", "Super · 1 h"],
          rows: [
            ["Paris", "28 €", "42 €", "56 €"],
            ["Petite couronne (dès)", "39 €", "58,50 €", "78 €"],
          ],
          note: "Prix par course, TTC, TVA 20 % comprise. Petite couronne : 8 km de route compris, puis le kilomètre supplémentaire. Grande couronne : prix selon la distance, affiché avant la commande.",
        },
      },
      {
        heading: "Préparer la course en quelques minutes",
        paragraphs: [
          "Une course le jour même se joue sur les informations transmises à la commande. Un coursier qui perd dix minutes à chercher un interphone ou un service n'a plus la même marge. Indiquez :",
        ],
        list: [
          "L'adresse complète, avec le bâtiment, l'étage et le nom du service.",
          "Le nom et un numéro joignable du destinataire, côté enlèvement comme côté remise.",
          "Les codes d'accès, le badge ou le contrôle d'identité à prévoir.",
          "L'heure limite réelle de remise, par exemple la fermeture d'un accueil.",
          "Le poids et la taille du colis : un deux-roues transporte jusqu'à 18 kg, dans un top-case verrouillé.",
        ],
      },
      {
        heading: "Suivre la livraison et garder la preuve",
        paragraphs: [
          "Le suivi de la course est consultable en ligne. La remise est horodatée et nominative : le coursier note le nom de la personne qui reçoit l'envoi. C'est cette information qui sert en cas de question sur une réception.",
          "Pour une échéance stricte, prévenez le destinataire de l'arrivée de l'envoi et conservez le numéro de course dans votre dossier. Si la remise doit se faire à une personne précise, indiquez-le à la commande : en cas d'absence, le coursier vous appelle avant toute décision.",
        ],
      },
      {
        heading: "Course dédiée ou messagerie regroupée",
        paragraphs: [
          "Pour un envoi sans heure précise, une messagerie qui regroupe les colis sur une tournée reste économique. Le jour même, elle a une limite : l'heure d'arrivée dépend des autres envois de la tournée, et un colis peut arriver après l'heure attendue. Une course dédiée part directement de votre adresse et va au destinataire, sans arrêt intermédiaire. Elle coûte plus cher à l'unité, mais son délai est connu avant la commande.",
          "Une règle simple : si l'envoi peut arriver le lendemain sans conséquence, un envoi regroupé suffit. Si une heure précise compte, prenez la course dédiée. Pour comparer les offres sur des bases identiques, lisez notre guide sur le [prix d'un coursier à Paris](/guides/prix-coursier-express-paris).",
        ],
      },
      {
        heading: "Organiser des envois réguliers",
        paragraphs: [
          "Si vous faites appel au même service plusieurs fois par semaine, un [compte entreprise](/services/compte-entreprise) simplifie l'organisation : commande en ligne, suivi de chaque course et factures détaillées course par course, à régler sous 30 jours. Un tarif dégressif s'applique au-delà d'un volume mensuel régulier, et l'ouverture du compte est immédiate.",
          "Pour une course urgente dans Paris, voyez notre [service de coursier express](/services/coursier-express-paris).",
        ],
      },
    ],
    faq: [
      {
        question: "Peut-on commander une livraison le jour même le dimanche ?",
        answer:
          "Oui. Le service fonctionne 7j/7, de 8 h à 19 h, dimanche compris. Au-delà de cette plage, la course se programme pour le lendemain.",
      },
      {
        question: "Quel est le délai le plus court ?",
        answer:
          "La formule Super vise une livraison sous 1 h. Pour une course immédiate, le coursier se présente en moins de 45 minutes ; le délai total dépend de la distance et de l'heure. Si votre échéance est très serrée, appelez-nous avant de commander.",
      },
      {
        question: "Le prix change-t-il pour une livraison le jour même ?",
        answer:
          "Oui, c'est le délai qui fait le prix. À Paris, la formule Super coûte 56 € TTC, soit deux fois la formule Normal à 28 € TTC. Le prix exact s'affiche avant de valider la commande.",
      },
      {
        question: "Peut-on livrer hors Paris le jour même ?",
        answer:
          "Oui, en petite couronne (92, 93, 94) et en grande couronne (77, 78, 91, 95). En grande couronne, le prix dépend de la distance depuis Paris et s'affiche avant la commande. Nous ne livrons pas hors d'Île-de-France.",
      },
      {
        question: "Un compte entreprise est-il utile pour un envoi occasionnel ?",
        answer:
          "Pas forcément. Il devient utile dès que les envois se répètent : commandes, suivi et factures sont centralisés, et les factures se règlent sous 30 jours.",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-11-06",
  },
  {
    slug: "delai-coursier-express-ile-de-france",
    title: "Combien de temps met un coursier express pour livrer en Île-de-France ?",
    h1: "Combien de temps met un coursier express pour livrer en Île-de-France ?",
    seoTitle: "Délai coursier express Île-de-France : guide",
    description:
      "Combien de temps met un coursier express pour livrer en Île-de-France ? Délai d'une course dédiée, facteurs qui le font varier et erreurs qui le font exploser.",
    intro:
      "La réponse honnête tient en une phrase : sur une course dédiée, le délai dépend surtout de la distance réelle entre l'enlèvement et la livraison, du moment de la journée et de la fluidité de la prise en charge. Ce guide détaille ce qui compose vraiment un délai, zone par zone.",
    sections: [
      {
        heading: "Le délai d'un coursier express, concrètement",
        paragraphs: [
          "Un coursier express en Île-de-France transporte un pli ou un petit colis confié à un seul véhicule, sans passage par un centre de tri, entre une adresse d'enlèvement et une adresse de livraison précises. Le délai se mesure entre le moment où le coursier récupère l'objet et celui où il le remet en main propre ou contre signature.",
          "Sur une course dédiée en zone dense, le trajet tourne autour de l'heure, parfois moins. Entre deux arrondissements parisiens, la livraison peut se faire bien plus vite. Vers la grande couronne, la distance pèse davantage et le temps de prise en charge devient le facteur dominant. Ce sont des ordres de grandeur, pas des engagements : aucun prestataire sérieux ne peut garantir une minute exacte sur un réseau routier qui bouge.",
          "« Express » ne signifie pas « en un temps fixe ». Cela signifie que la course est traitée en priorité, sans regroupement, avec un départ dès que possible. Le délai final se calcule à partir de l'adresse d'enlèvement réelle, de l'adresse de livraison réelle et de l'heure de validation de la demande.",
          "Le délai commence à courir à la validation de la demande, pas à l'envoi du mail. Adresse incomplète, contact qui ne décroche pas, colis pas prêt à l'heure dite : le compteur tourne quand même. La préparation en amont fait gagner plus de temps que n'importe quel choix de véhicule.",
        ],
      },
      {
        heading: "Comment se construit le délai, étape par étape",
        paragraphs: [
          "Le délai d'une course express se décompose en cinq phases. Les comprendre permet de savoir où le temps se perd et où il se gagne.",
        ],
        list: [
          "Prise en charge de la demande : vérification de la faisabilité et affectation d'un coursier. Plus les informations sont complètes, plus cette étape est courte.",
          "Trajet vers le point d'enlèvement : en zone dense, le stationnement peut allonger ce trajet.",
          "Enlèvement : récupération du pli, vérification de l'adresse et de l'emballage. Un colis mal fermé fait perdre du temps à tout le monde.",
          "Trajet direct : le cœur du délai, qui dépend de la distance réelle, du sens de circulation, des ponts et de l'heure.",
          "Remise : le coursier trouve le bon interlocuteur, fait signer si nécessaire et repart. Une adresse sans précision d'étage ou de service rallonge cette phase.",
        ],
      },
      {
        heading: "Deux-roues ou voiture ?",
        paragraphs: [
          "Un deux-roues se faufile là où une voiture reste bloquée, mais il transporte moins de volume. Pour un pli ou un petit colis, c'est souvent le choix le plus rapide en zone dense. Pour un objet plus encombrant, la voiture redevient pertinente malgré le stationnement. Le véhicule doit suivre la nature de l'envoi, pas une préférence abstraite.",
        ],
      },
      {
        heading: "Le délai selon la zone",
        paragraphs: [
          "Ordres de grandeur, pas des engagements. Sur une course dédiée :",
        ],
        list: [
          "Paris, trajet court : le plus souvent moins d'une heure. Le stationnement est le principal frein.",
          "Paris, trajet long entre arrondissements : plus long, à cause de la Seine et des axes saturés.",
          "Paris vers la petite couronne : modéré, selon la sortie de Paris et la prise en charge.",
          "Vers la grande couronne : plus long, la distance devient le facteur dominant.",
        ],
      },
      {
        heading: "Les erreurs qui font exploser le délai",
        paragraphs: [
          "Ces erreurs reviennent dans presque toutes les courses en retard, et n'ont presque jamais de rapport avec la vitesse du coursier.",
        ],
        list: [
          "Adresse approximative : donnez l'adresse exacte, avec le nom de l'entreprise, l'étage et le contact sur place.",
          "Colis non prêt : la préparation doit être terminée avant l'heure d'enlèvement annoncée.",
          "Mauvais format : un objet volumineux confié à un deux-roues, ou un pli urgent confié à une tournée, crée un décalage.",
          "Horaires du destinataire ignorés : livrer pendant la pause déjeuner ou après la fermeture de l'accueil ajoute un arrêt au lendemain.",
          "Commande au dernier moment : une course prioritaire reste soumise au trafic, surtout aux heures de pointe.",
        ],
      },
      {
        heading: "Pourquoi l'heure de commande compte autant que le trajet",
        paragraphs: [
          "Une course lancée quand un coursier se trouve déjà près du point d'enlèvement part plus vite qu'une course qui oblige à rapatrier un véhicule d'une autre zone. Une entreprise qui envoie régulièrement des plis a donc intérêt à regrouper ses demandes sur des créneaux prévisibles.",
          "La distance à vol d'oiseau trompe aussi : deux adresses séparées par la Seine peuvent imposer un détour par un pont saturé, alors que deux points éloignés sur un axe fluide se rejoignent vite. Le délai se calcule sur le trajet réel, c'est pourquoi un devis sérieux demande les deux adresses exactes.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien de temps met un coursier express pour livrer en Île-de-France ?",
        answer:
          "Sur une course dédiée en zone dense, le délai se compte souvent en moins d'une heure entre l'enlèvement et la livraison. En grande couronne, il faut compter davantage, car la distance et la prise en charge pèsent plus lourd. Le délai réel dépend du trafic, de l'heure et de la précision des adresses.",
      },
      {
        question: "Pourquoi le délai annoncé diffère-t-il du délai réel ?",
        answer:
          "Le délai annoncé repose sur une estimation de trajet. Le délai réel intègre le stationnement, la recherche du contact sur place, l'état du colis et les aléas de circulation.",
      },
      {
        question: "Une course dédiée est-elle plus rapide qu'une tournée groupée ?",
        answer:
          "Dans la grande majorité des cas, oui, car elle supprime les arrêts chez d'autres clients. Une tournée groupée peut rester pertinente pour des envois non urgents vers une même zone, mais elle allonge le délai de chaque destinataire.",
      },
      {
        question: "Que faire pour réduire le temps de livraison ?",
        answer:
          "Donnez l'adresse exacte avec le nom de l'entreprise et le contact sur place, préparez le colis avant l'heure d'enlèvement, vérifiez les horaires de réception du destinataire et choisissez le format de course adapté. Ces éléments pèsent plus que le choix du véhicule.",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-11-07",
  },
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
