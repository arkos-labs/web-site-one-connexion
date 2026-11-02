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
        heading: "Les postes de coût d'une course express",
        paragraphs: [
          "Une course express se décompose en quelques postes : le trajet entre l'enlèvement et la remise, le délai demandé, le niveau de service qu'exige l'envoi et, pour les clients réguliers, le volume mensuel.",
          "Un pli remis contre preuve, un prélèvement avec contraintes de manutention ou un colis standard n'exigent pas le même niveau de service. Le volume compte aussi : un compte entreprise permet de régler les factures sous 30 jours et peut ouvrir une grille adaptée aux envois réguliers.",
        ],
      },
      {
        heading: "Distance, délai et horaire : ce qui change le prix",
        paragraphs: [
          "Le point de départ et le point d'arrivée fixent la zone : Paris intramuros, petite couronne ou grande couronne. Quand le trajet traverse deux zones, la zone la plus éloignée s'applique, et plus elle est éloignée de Paris, plus le prix de base augmente.",
          "Plus le délai est court, plus la course coûte cher : en intramuros, la même course coûte le double livrée en 1 h plutôt qu'en 3 h. L'horaire compte aussi : une course programmée à l'avance laisse un créneau plus large qu'une course immédiate, et une navette régulière, avec un passage fixé, est en général la formule la plus économique pour des besoins répétés.",
        ],
      },
      {
        heading: "Les questions à poser avant de commander",
        paragraphs: [
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
        heading: "Voir la grille tarifaire complète",
        paragraphs: [
          "Les montants par zone et par délai figurent sur notre [grille tarifaire coursier](/tarifs), et le prix exact s'affiche avant de valider la commande. Pour une course urgente dans Paris, voyez notre [service de coursier express](/services/coursier-express-paris).",
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
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
