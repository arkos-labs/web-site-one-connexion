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
      {
        heading: "Sceller le pli avant le passage du coursier",
        paragraphs: [
          "Le pli se prépare avant l’arrivée du coursier, pas devant lui. Fermez l’enveloppe ou la pochette, vérifiez que le nom du destinataire est lisible et gardez un double de ce que contient le pli si vous en avez besoin pour votre dossier.",
          "Le coursier transporte le pli tel qu’il lui est remis : il ne l’ouvre pas et ne vérifie pas son contenu. Un pli fermé, sans mention du contenu à l’extérieur, limite aussi les questions à l’accueil du destinataire.",
        ],
      },
      {
        heading: "Choisir le bon service : pli simple, pli confidentiel, acte",
        paragraphs: [
          "Pour un document courant, une course dédiée suffit : un coursier pour un seul envoi, avec remise horodatée. Pour un pli dont le destinataire doit être le seul à le recevoir, choisissez la remise en main propre et décrivez-la à la commande. Notre [coursier plis confidentiels](/services/plis-confidentiels) correspond à ce besoin.",
          "Pour un acte, un dossier de procédure ou une pièce à remettre à une autre étude, voyez le [coursier avocat et notaire](/services/coursier-avocat-notaire). Le délai se choisit ensuite selon l’échéance : Normal (3 h), Urgent (1 h 30) ou Super (1 h), selon [nos tarifs](/tarifs).",
        ],
      },
      {
        heading: "Ce que le coursier ne fait pas",
        paragraphs: [
          "Le périmètre de la prestation est simple : le coursier prend en charge l’envoi fermé, le transporte directement et le remet à la personne désignée. Il n’ouvre pas le pli, ne contrôle pas son contenu et ne le laisse à un accueil que sur votre consigne.",
          "La remise horodatée établit qui a reçu l’envoi et à quelle heure. Elle ne remplace pas les formalités propres à un acte (signification, lettre recommandée) lorsque la loi les impose. En cas de doute sur ce qu’exige votre dossier, renseignez-vous auprès de votre conseil avant de commander.",
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
      {
        heading: "Contenant isotherme et température de conservation",
        paragraphs: [
          "La température demandée figure dans les consignes du laboratoire destinataire. Elle se communique à la commande, avec le contenant prévu : c’est l’expéditeur qui prépare le colis, le coursier le transporte fermé, dans le sens indiqué, sans l’ouvrir.",
          "Pour un envoi qui doit rester au frais, ne comptez pas sur le trajet pour rattraper un conditionnement insuffisant. Si vous hésitez sur le contenant, appelez-nous avant de commander : nous vous disons ce que nous pouvons prendre en charge. Notre page de [transport de prélèvements sanguins](/services/transport-prelevements-sang) précise ce service.",
        ],
      },
      {
        heading: "Délais et horodatage de la course",
        paragraphs: [
          "Le délai de stabilité fixe l’heure limite d’arrivée, et c’est à partir d’elle que se choisit la formule : Normal (3 h), Urgent (1 h 30) ou Super (1 h). La prise en charge se fait en moins de 45 minutes, sous réserve de disponibilité au moment de la commande.",
          "L’heure de prise en charge et l’heure de remise sont enregistrées avec le nom de la personne qui reçoit le colis. Si le laboratoire s’interroge sur le délai d’un échantillon, vous pouvez reconstituer le trajet.",
        ],
      },
      {
        heading: "Laboratoires et EHPAD : deux cas d’usage",
        paragraphs: [
          "Un laboratoire envoie ses prélèvements vers un plateau technique ou un laboratoire partenaire : c’est le cas décrit sur notre page [coursier pour laboratoire](/services/coursier-laboratoire), avec des courses régulières entre les mêmes adresses.",
          "Un établissement d’hébergement pour personnes âgées envoie des prélèvements ponctuels vers le laboratoire qui assure les analyses : le déroulé est détaillé dans notre guide du [coursier pour EHPAD](/guides/coursier-ehpad-logistique-des-soins). Dans les deux cas, la course est dédiée et le colis part fermé.",
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
    slug: "course-dediee-coursier",
    title: "Qu'est-ce qu'une course dédiée coursier ?",
    h1: "Qu'est-ce qu'une course dédiée coursier ?",
    summary: "Définition d'une course dédiée : un coursier, un seul envoi, un trajet direct. Ce qui la distingue d'une tournée groupée, et quand la choisir.",
    seoTitle: "Course dédiée coursier : définition et comparatif",
    description:
      "Qu'est-ce qu'une course dédiée coursier ? Un seul envoi, un trajet direct, une responsabilité traçable. Comparatif avec la tournée groupée et cas d'usage.",
    intro:
      "Une course dédiée coursier est une mission où le coursier ne transporte que votre envoi, du point de collecte au point de remise, sans arrêt intermédiaire pour un autre client. Vous réservez un véhicule et un chauffeur pour votre seul pli, sur un trajet direct. La dédiée s'achète pour la maîtrise du trajet, pas pour le prix au kilomètre.",
    sections: [
      {
        heading: "Définition : un mode d'exécution, pas un niveau de gamme",
        paragraphs: [
          "Une course dédiée est une prestation de transport express dans laquelle un coursier se voit confier un envoi unique et le remet à son destinataire sans collecter ni livrer autre chose en chemin. Le véhicule est mobilisé pour vous pendant la durée de la mission. Personne d'autre ne monte dans le coffre, personne d'autre ne dicte l'ordre des arrêts.",
          "Le mot décrit la manière dont la mission est organisée, pas le véhicule. Un coursier à vélo peut faire une course dédiée dans Paris intra-muros, un utilitaire peut faire une tournée groupée en petite couronne.",
        ],
        list: [
          "Un seul expéditeur par mission, un seul destinataire.",
          "Un itinéraire direct, sans détour pour charger ou déposer chez un tiers.",
          "Une responsabilité traçable de bout en bout : le coursier qui prend le pli est celui qui le remet.",
        ],
      },
      {
        heading: "Comment se déroule une course dédiée",
        paragraphs: [
          "Le déroulé est simple : vous transmettez la demande (adresse de collecte, adresse de remise, nature de l'envoi, créneau souhaité), le prestataire affecte un coursier et confirme la prise en charge. Le coursier récupère l'envoi, vérifie ce qu'il prend, part directement vers le destinataire, puis la remise se fait contre signature ou contre accusé, selon ce que vous avez demandé. Vous recevez la confirmation de livraison.",
          "Pour un envoi sensible, cadrez l'étape de collecte : un coursier qui récupère un colis scellé doit pouvoir constater l'état du scellé avant de partir. Un scellé déjà rompu à la collecte ne peut pas être imputé au transporteur.",
          "Sur une dédiée, vous achetez une fenêtre de disponibilité et non une place dans un planning partagé. Si l'accueil du destinataire est occupé, le coursier peut attendre quelques minutes, dans la limite prévue par le contrat.",
        ],
      },
      {
        heading: "Course dédiée ou tournée groupée : le comparatif",
        paragraphs: [
          "Les deux formats répondent à des besoins différents. Le tableau compare les critères observables. Aucun prix n'y figure : les tarifs dépendent du trajet, du véhicule et de l'horaire.",
        ],
        table: {
          head: ["Critère", "Course dédiée", "Tournée groupée"],
          rows: [
            ["Nombre d'envois par véhicule", "Un seul", "Plusieurs, mutualisés"],
            ["Itinéraire", "Direct, collecte puis remise", "Ordonné selon les autres clients"],
            ["Maîtrise de l'heure de remise", "Élevée, le trajet ne dépend que de vous", "Dépendante des arrêts précédents"],
            ["Chaîne de responsabilité", "Courte : un coursier du début à la fin", "Plus longue, plusieurs manipulations"],
            ["Coût par envoi", "Plus élevé, le véhicule est mobilisé pour vous", "Plus bas, partagé entre expéditeurs"],
            ["Pertinent pour", "Plis confidentiels, pièces sensibles, délais serrés", "Volume de plis courants, zones proches"],
            ["Attente à la remise", "Possible dans la limite du contrat", "Difficile, elle décale la suite"],
            ["Traçabilité", "Suivi d'une mission unique", "Suivi d'une tournée multi-arrêts"],
          ],
        },
      },
      {
        heading: "Quand la course dédiée s'impose",
        paragraphs: [
          "Trois contextes justifient le plus souvent une dédiée. D'abord les pièces à valeur juridique ou contractuelle (acte notarié, contrat signé, dossier à remettre avant clôture) : la preuve de remise doit être conservée, et une dédiée avec accusé de réception répond à cette exigence. Ensuite les envois dont la confidentialité est structurante, comme un pli de licenciement ou un rapport d'audit, qui ne doivent pas voyager avec les plis d'autres expéditeurs. Enfin les envois fragiles ou sensibles au transport, comme les échantillons ou le matériel de laboratoire, car chaque arrêt d'une tournée est une occasion de cogner un colis.",
          "À l'inverse, un pli courant sans contrainte d'heure ni de confidentialité supporte très bien une tournée groupée. Une entreprise qui envoie une vingtaine de plis administratifs dans le même quartier n'a pas besoin de vingt véhicules dédiés.",
        ],
        list: [
          "Envoi courant, sans contrainte d'heure : tournée groupée.",
          "Pièce juridique ou contractuelle : course dédiée avec accusé de réception.",
          "Document confidentiel : course dédiée, pli scellé et remise contre signature.",
          "Échantillon ou matériel fragile : course dédiée pour limiter les manipulations.",
        ],
      },
      {
        heading: "Ce que la course dédiée ne règle pas",
        paragraphs: [
          "Une course dédiée n'est pas plus rapide qu'une autre si le trajet et le trafic sont identiques. Elle ne remplace ni une préparation soignée du colis, ni la vérification de l'identité du destinataire à la remise. Une adresse fausse fait déplacer le coursier pour rien, dédié ou non.",
          "Elle ne convient pas non plus aux volumes : livrer cinquante plis dans la journée en dédiée n'a pas de sens économique. Pour ce cas, une [livraison le jour même](/guides/livraison-le-jour-meme-entreprise) organisée en tournée est plus adaptée.",
        ],
      },
    ],
    faq: [
      {
        question: "Une course dédiée coursier est-elle la même chose qu'un coursier express ?",
        answer:
          "Non. Le coursier express désigne la promesse de délai, souvent dans la journée. La course dédiée désigne le mode d'exécution : un seul envoi par véhicule, trajet direct. Un coursier express peut être dédié ou groupé.",
      },
      {
        question: "Combien de plis puis-je envoyer lors d'une course dédiée ?",
        answer:
          "Un seul envoi par mission, c'est la définition. Plusieurs plis pour un même destinataire peuvent voyager ensemble dans la même mission. Dès qu'il y a plusieurs destinataires, il faut une tournée groupée ou plusieurs dédiées.",
      },
      {
        question: "La course dédiée coûte-t-elle toujours plus cher ?",
        answer:
          "Par envoi, en général oui, puisque le véhicule est mobilisé pour vous seul. Le calcul se fait à l'échelle de l'enjeu : si un retard entraîne une reprise, une reprogrammation ou une perte contractuelle, la dédiée peut être l'option la moins coûteuse au total.",
      },
      {
        question: "Comment vérifier qu'un prestataire me facture bien une dédiée ?",
        answer:
          "Demandez à la commande : « le coursier part-il avec mon seul envoi ? ». La réponse doit être explicite. Demandez aussi si le contrat prévoit l'exclusivité du véhicule pendant la mission.",
      },
      {
        question: "Une course dédiée est-elle adaptée aux envois confidentiels ?",
        answer:
          "Elle réduit le nombre d'intermédiaires, ce qui est un prérequis. Elle ne suffit pas seule : le pli doit être scellé, référencé et remis contre signature. La confidentialité se construit avec la procédure d'envoi, pas seulement avec le mode de transport. Voir le guide [pli confidentiel à Paris](/guides/envoyer-un-pli-confidentiel-paris).",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-11-10",
  },
  {
    slug: "delai-formules-coursier-express",
    title: "Combien de temps met un coursier express pour livrer en Île-de-France ?",
    h1: "Combien de temps met un coursier express pour livrer en Île-de-France ?",
    summary: "Délai d'un coursier express en Île-de-France : enlèvement en moins de 45 min, puis livraison sous 3 h, 1 h 30 ou 1 h selon la formule.",
    seoTitle: "Délai coursier express Île-de-France : par formule",
    description:
      "Combien de temps met un coursier express pour livrer en Île-de-France ? Enlèvement en moins de 45 min, livraison sous 3 h (Normal), 1 h 30 (Urgent) ou 1 h (Super).",
    intro:
      "Comptez moins de 45 minutes pour l'enlèvement, puis sous 3 heures en Normal, sous 1 h 30 en Urgent ou sous 1 heure en Super, pour une course dédiée.",
    sections: [
      {
        heading: "Combien de temps met un coursier express pour livrer en Île-de-France, concrètement",
        paragraphs: [
          "La réponse directe : le délai total se décompose en deux séquences. D'abord l'enlèvement, annoncé en moins de 45 minutes chez One Connexion, 7 jours sur 7 entre 8h et 19h, sous réserve de disponibilité au moment où vous commandez. Ensuite le trajet jusqu'au destinataire, qui suit la formule retenue. Une course en formule Super vise la livraison sous 1 heure après enlèvement. La formule Urgent vise sous 1 h 30. La formule Normal vise sous 3 heures. Pour un besoin immédiat, voyez notre service de [coursier urgent](/services/coursier-urgent-paris).",
          "Ce découpage a son importance. Beaucoup de prestataires communiquent un chiffre unique, du genre « livraison en 1 heure », sans préciser s'il inclut le temps d'enlèvement. Chez One Connexion, la confirmation se fait avant d'engager la course : vous savez à quelle heure le coursier arrive, et vous savez quelle formule vous avez choisie. Le délai annoncé correspond au délai réel parce que la course est dédiée, sans regroupement avec d'autres colis et sans passage par un centre de tri.",
          "Autre point à intégrer : le coursier ne part pas d'un entrepôt. Il part de l'adresse d'enlèvement que vous indiquez. Le trajet est donc celui de votre expédition, pas celui d'un réseau logistique. C'est ce qui rend le calcul lisible : vous connaissez vos deux adresses, vous connaissez l'heure de prise en charge, vous pouvez estimer le reste.",
          "La zone change la donne. Un trajet intra-Paris en deux-roues et un trajet Paris vers la grande couronne ne se jouent pas de la même façon. Le deux-roues passe là où un utilitaire reste bloqué, ce qui fait la différence aux heures de pointe. Sur les trajets vers la banlieue, La Défense, Roissy ou Orly, ce sont les motos routières qui prennent le relais.",
        ],
      },
      {
        heading: "Comment se déroule une course express, étape par étape",
        paragraphs: [
          "Le mécanisme est simple, et c'est justement sa simplicité qui rend le délai tenable. Voici comment une course se déroule chez One Connexion.",
        ],
        list: [
          "Vous saisissez les deux adresses, l'enlèvement et la destination. Le prix s'affiche tout de suite, sans inscription.",
          "Vous choisissez la formule : Normal, Urgent ou Super. Chacune correspond à un engagement de délai différent.",
          "La faisabilité et le prix sont confirmés avant que la course ne soit engagée. Si le créneau n'est pas tenable, vous le savez avant, pas après.",
          "Un coursier passe chercher le pli ou le colis en moins de 45 minutes, dans la plage 8h-19h, 7j/7.",
          "La course est dédiée : un seul envoi à bord, trajet direct vers le destinataire, sans autre arrêt en route.",
          "La remise est horodatée. Vous suivez l'avancement de la course en ligne jusqu'à la remise.",
          "La facture avec TVA détaillée arrive par e-mail à la livraison. Le paiement se fait par carte via Stripe, ou sur facture à 30 jours pour les comptes entreprise.",
        ],
      },
      {
        heading: "Ce déroulé explique pourquoi le délai tient",
        paragraphs: [
          "Ce déroulé explique pourquoi le délai tient. Une livraison mutualisée fait attendre votre colis jusqu'à la fin d'une tournée qui comporte plusieurs arrêts. Une course dédiée part pour vous seul. Le temps de trajet n'est donc pas gonflé par les livraisons des autres clients. Pour un envoi à livrer dans la journée sans formule express, la [livraison le jour même](/services/livraison-jour-meme-b2b) pour les entreprises est l'alternative.",
          "La nature de l'envoi entre aussi dans l'organisation, même si elle ne change pas le tarif, qui dépend seulement de la zone et du délai. Un pli juridique destiné à un tribunal ou à un notaire exige une remise en main propre avec preuve de dépôt horodatée. Un prélèvement ou un échantillon de laboratoire peut nécessiter un contenant isotherme pour rester au frais. Ces procédures se calent sur le même squelette de course, avec les mêmes repères de temps.",
        ],
      },
      {
        heading: "Lire le tableau : formule et géographie",
        paragraphs: [
          "Deux lectures possibles de ce tableau. La première porte sur la formule : plus vous serrez le délai, plus le prix monte, et le tarif dépend de la zone et du délai. La seconde porte sur la géographie : la plage horaire de service reste la même partout en Île-de-France, mais le temps de trajet réel dépend de la distance et de la circulation. Un colis jusqu'à 18 kg peut être pris en charge, ce qui couvre la majorité des envois professionnels courants.",
          "Pour situer le budget avant de choisir une formule, la page sur le [prix d'une course](/guides/prix-coursier-express-paris) de [coursier express à Paris](/services/coursier-express-paris) détaille ce qui fait varier la facture. Et si votre destinataire se trouve hors de la capitale, le fonctionnement des trajets vers la banlieue est décrit sur la page coursier Paris banlieue. Les [zones couvertes en Île-de-France](/zones/ile-de-france) y sont détaillées commune par commune.",
        ],
      },
      {
        heading: "Les erreurs qui font rater le délai annoncé",
        paragraphs: [
          "Le premier piège consiste à commander trop tard dans la journée. La plage de service s'arrête à 19h. Une commande passée en fin d'après-midi pour un trajet long vers la grande couronne peut ne plus être tenable, même si l'enlèvement en moins de 45 minutes reste possible. La confirmation de faisabilité existe précisément pour éviter cette déconvenue : elle vous dit si le créneau tient, avant que vous ne comptiez dessus.",
          "Le deuxième piège concerne l'adresse. Une adresse imprécise, un bâtiment avec plusieurs entrées, un destinataire absent à l'arrivée : chacun de ces imprévus ajoute du temps que personne n'avait prévu. Sur une course dédiée, le coursier n'a qu'un arrêt, donc pas de marge pour absorber un contretemps. Donnez un numéro de téléphone joignable pour le destinataire, et vérifiez que quelqu'un sera là pour réceptionner.",
          "Troisième erreur fréquente : confondre course dédiée et livraison mutualisée. Si vous commandez une course en pensant qu'elle sera groupée avec d'autres envois pour réduire le coût, vous serez déçu du prix. À l'inverse, si vous commandez une livraison groupée en espérant un délai serré, vous serez déçu du délai. Le choix entre les deux dépend de l'enjeu de l'envoi, et la page course dédiée ou tournée groupée pour entreprise aide à trancher selon votre cas.",
          "Quatrième erreur : négliger la nature du contenu. Un pli confidentiel ne se remet pas à n'importe qui, un prélèvement médical ne se transporte pas à température ambiante. Ces contraintes ne rallongent pas forcément le trajet, mais elles imposent une procédure de remise qui doit être prévue dès la commande. Si votre envoi est un document sensible, la page sur l'envoi d'un pli confidentiel à Paris précise le cadre.",
          "Enfin, un piège moins visible : croire que le délai affiché par un comparateur vaut engagement. Seul le prestataire qui prend la course peut confirmer un horaire. Un devis générique ne dit rien de la disponibilité réelle à l'instant où vous commandez.",
        ],
      },
      {
        heading: "Le délai que personne ne mesure : le temps entre votre décision et votre commande",
        paragraphs: [
          "Voici un point que peu de prestataires mettent en avant. Le délai qui compte le plus dans une urgence n'est pas celui du trajet, c'est celui qui sépare le moment où vous savez qu'il faut envoyer quelque chose du moment où la course est réellement lancée. Un coursier peut mettre moins de 45 minutes à arriver, encore faut-il avoir commandé. Et entre la découverte du besoin et la commande, il y a souvent une recherche de prestataire, un échange de mails, une attente de devis, une validation interne.",
          "Sur ce plan, la mécanique de One Connexion réduit l'écart : vous entrez vos deux adresses, le prix s'affiche immédiatement, sans inscription. Pour un compte entreprise, l'ouverture se fait en quelques minutes et chaque service ou site peut disposer du sien avec le même SIRET, avec un suivi centralisé de toutes les courses et un paiement sur facture à 30 jours. L'intérêt n'est pas commercial, il est temporel : moins de temps passé à commander, c'est plus de temps gagné sur le délai global.",
          "Cette distinction change la façon de comparer deux offres. Un prestataire qui annonce une livraison en une heure mais vous fait attendre un devis pendant trente minutes est plus lent, en pratique, qu'un prestataire qui annonce une heure et demie et prend la course en trois clics. Le délai qui vous intéresse court à partir de votre besoin, pas à partir de la validation du bon de commande.",
          "Un détail concret va dans le même sens : la facture avec TVA détaillée part par e-mail à la livraison. Personne n'a besoin de relancer la comptabilité pour clôturer le dossier, ce qui compte quand une course s'insère dans une journée déjà chargée. Pour les structures qui gèrent aussi des rendez-vous en parallèle, des outils comme [Kalenai](https://kalenai.eu/), une plateforme de prise de rendez-vous en ligne avec agenda synchronisé et rappels automatiques, répondent à une logique voisine : supprimer les allers-retours qui grignotent le temps avant même que le service ne commence.",
        ],
      },
      {
        heading: "Ce qui fait vraiment varier le délai, zone par zone",
        paragraphs: [
          "À Paris intramuros, le deux-roues est le moyen le plus fiable pour tenir un créneau serré. Les rues étroites, les sens uniques et les embouteillages rendent l'utilitaire imprévisible. Un scooter ou une moto se faufile et garde une vitesse moyenne plus stable. C'est la raison pour laquelle les formules les plus rapides sont réalistes en intra-muros.",
          "En petite couronne, le trajet reste court mais la circulation change de nature : axes plus larges, entrées de ville saturées aux heures de pointe. Le deux-roues ou la moto routière selon la distance permettent de tenir les formules Urgent et Super dans de bonnes conditions.",
          "En grande couronne, la distance prend le dessus. Un trajet vers le 77 ou le 95 implique plus de kilomètres, donc un temps incompressible que la formule ne peut pas effacer. La moto routière est adaptée, mais il faut accepter que la formule Super soit plus difficile à tenir sur les destinations les plus éloignées. La confirmation de faisabilité joue ici son rôle : elle vous dit si le créneau est réaliste pour votre trajet précis.",
          "Les plateformes aéroportuaires, Roissy et Orly, forment un cas à part. Les accès sont contraints, les contrôles nombreux, et le temps d'accès au point de remise peut dépasser le temps de trajet routier. Prévoyez une marge si votre destinataire est situé côté zone réservée.",
          "Une limite à admettre clairement : aucun prestataire sérieux ne peut garantir un délai à la minute près sur un trajet soumis à la circulation francilienne. Ce qui peut être garanti, c'est un engagement de formule et une confirmation de faisabilité avant le départ. Le reste relève de l'aléa routier, et il vaut mieux le savoir avant de promettre un horaire à votre propre client.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien de temps met un coursier express pour livrer en Île-de-France si je commande maintenant ?",
        answer:
          "L'enlèvement se fait en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité confirmée au moment de la commande. Ensuite, la livraison dépend de la formule : sous 3 h en Normal, sous 1 h 30 en Urgent, sous 1 h en Super. La faisabilité est confirmée avant que la course ne démarre.",
      },
      {
        question: "Le délai de livraison inclut-il le temps d'enlèvement ?",
        answer:
          "Non. Le délai de livraison court à partir de l'enlèvement. Le temps total pour le client correspond donc au temps de prise en charge, moins de 45 minutes, plus le délai de la formule choisie. C'est pourquoi il faut toujours préciser la formule quand on compare deux offres.",
      },
      {
        question: "La zone change-t-elle le délai ?",
        answer:
          "Oui, par le temps de trajet. Paris intramuros se traite en deux-roues, ce qui tient bien les créneaux serrés. La petite couronne reste rapide mais subit les entrées de ville aux heures de pointe. La grande couronne, Roissy et Orly imposent des distances plus longues, donc un temps incompressible que la formule ne peut pas supprimer.",
      },
      {
        question: "Que se passe-t-il si le créneau demandé n'est pas tenable ?",
        answer:
          "La faisabilité et le prix sont confirmés avant d'engager la course. Si le créneau n'est pas réaliste pour votre trajet, vous le savez avant le départ et pouvez ajuster la formule ou l'horaire. C'est plus utile que de découvrir le retard à l'arrivée.",
      },
      {
        question: "Puis-je envoyer un colis volumineux ou lourd en express ?",
        answer:
          "La course express prend en charge un colis jusqu'à 18 kg. Au-delà, il faut en parler au moment de la commande pour vérifier la faisabilité avec le véhicule adapté. Le poids ne change pas la logique de délai, mais il peut changer le véhicule mobilisé.",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-11-11",
  },
  {
    slug: "coursier-ehpad-logistique-des-soins",
    title: "Coursier pour EHPAD : organiser les transports liés aux soins",
    h1: "Coursier pour EHPAD : ce qui doit être transporté, et ce qui ne l'est plus",
    seoTitle: "Coursier EHPAD : prélèvements, matériel et documents",
    description:
      "Coursier pour EHPAD en Île-de-France : prélèvements, matériel de soin et documents à faire transporter, et les déplacements que la téléexpertise permet d'éviter.",
    summary:
      "Prélèvements, matériel de soin, documents : ce qu'un EHPAD fait transporter par coursier, comment préparer la course, et ce que la téléexpertise évite de déplacer.",
    intro:
      "Un EHPAD fait circuler chaque semaine des prélèvements, du matériel de soin et des documents entre l'établissement, le laboratoire, les fournisseurs et les familles. Ce guide fait le tri : ce qui demande une course, comment la préparer, et les déplacements qu'il est désormais possible d'éviter, à commencer par certains transports de résidents vers un spécialiste.",
    sections: [
      {
        heading: "Ce qu'un EHPAD fait transporter",
        paragraphs: [
          "Les envois d'un établissement se rangent en trois familles, qui n'ont ni les mêmes délais ni les mêmes précautions. Les identifier évite de commander une course urgente pour un envoi qui pouvait attendre, ou l'inverse.",
        ],
        list: [
          "Les prélèvements : tubes de sang, flacons, écouvillons à remettre au laboratoire dans leur délai de stabilité. C'est l'envoi le plus contraint, détaillé dans notre guide du [transport de prélèvements médicaux](/guides/transport-de-prelevements-medicaux).",
          "Le matériel de soin : pansements, consommables, petit matériel en rupture, pièce d'un appareil. L'urgence dépend du stock restant dans l'établissement.",
          "Les documents : dossiers d'admission, pièces administratives, contrats à remettre contre signature. Pour ceux qui ne doivent passer que par leur destinataire, voyez le guide du [pli confidentiel](/guides/envoyer-un-pli-confidentiel-paris).",
        ],
      },
      {
        heading: "Préparer une course depuis l'établissement",
        paragraphs: [
          "Dans un EHPAD, le temps perdu se situe rarement sur la route : il se situe à l'accueil, quand le coursier ne sait pas à qui s'adresser ni où le colis l'attend. Quelques informations à la commande suffisent :",
        ],
        list: [
          "Le point d'enlèvement précis : accueil, infirmerie ou salle de soins, avec l'étage et les horaires d'ouverture.",
          "Le nom d'un soignant joignable sur place, et celui du service de réception côté destinataire.",
          "L'heure limite d'arrivée réelle, par exemple la dernière réception du laboratoire.",
          "La température de conservation, s'il y en a une : le contenant isotherme est convenu à la commande.",
          "Le nombre de colis, pour vérifier la remise complète.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super 1 h"],
          rows: [
            ["Paris", "28 €", "42 €", "56 €"],
            ["Petite couronne (dès)", "39 €", "58,50 €", "78 €"],
          ],
          note: "Prix par course, TTC (TVA 20 % comprise). Petite couronne : 8 km de route compris. Grande couronne : prix selon la distance, affiché avant la commande. Le prix ne dépend pas du contenu, jusqu'à 18 kg.",
        },
      },
      {
        heading: "Ce qui ne se déplace plus : l'avis spécialisé sur une plaie",
        paragraphs: [
          "Le transport le plus lourd pour un EHPAD n'est pas celui d'un colis : c'est celui d'un résident. Une escarre ou un ulcère qui n'évolue pas malgré les pansements demande l'avis d'un spécialiste, et cet avis supposait jusqu'ici un rendez-vous éloigné, un transport sanitaire et une demi-journée fatigante pour une personne fragile.",
          "La téléexpertise change cette équation : c'est le dossier qui voyage, pas le patient. Depuis l'avenant 9 à la convention médicale, applicable au 1er avril 2022, elle est un acte reconnu et pris en charge par l'Assurance Maladie. Une plateforme comme EIZOR est spécialisée dans la [téléexpertise des plaies](https://eizor.fr/) : l'infirmière ou le médecin coordonnateur envoie la photo de la plaie et le contexte clinique depuis la chambre du résident, et un médecin expert renvoie un avis structuré, avec le protocole de soin et l'ordonnance.",
          "Les deux logiques se complètent. L'avis arrive sans déplacement, mais il se traduit souvent par un besoin matériel : un type de pansement que l'établissement n'a pas en stock, un prélèvement à porter au laboratoire. Le résident reste dans sa chambre, et seul ce qui doit réellement circuler prend la route.",
        ],
      },
      {
        heading: "Course ponctuelle ou tournée régulière",
        paragraphs: [
          "Pour un besoin imprévu (un prélèvement hors tournée du laboratoire, un consommable en rupture), la course dédiée est la plus adaptée : le coursier part de l'établissement et va directement chez le destinataire, sans arrêt intermédiaire, et la remise est horodatée avec le nom du réceptionnaire. Le service fonctionne 7j/7, de 8 h à 19 h.",
          "Pour des envois qui reviennent à jours fixes, une tournée régulière avec des heures de passage convenues est plus économique, et un [compte entreprise](/services/compte-entreprise) regroupe les courses sur des factures à régler sous 30 jours. Le détail des engagements figure sur la page de notre service de [transport médical](/services/transport-medical).",
        ],
      },
    ],
    faq: [
      {
        question: "Un coursier peut-il venir chercher un prélèvement le week-end ?",
        answer:
          "Oui. Le service fonctionne 7j/7, de 8 h à 19 h, dimanche compris. Vérifiez avant de commander que le laboratoire destinataire réceptionne bien ce jour-là.",
      },
      {
        question: "Qui prépare le colis ?",
        answer:
          "L'établissement. Le coursier transporte le colis fermé, tel qu'il lui est remis ; pour un prélèvement, le conditionnement suit les consignes du laboratoire destinataire.",
      },
      {
        question: "Transportez-vous des résidents ou des patients ?",
        answer:
          "Non. Nous transportons des plis et des colis jusqu'à 18 kg, pas des personnes. Le transport d'un résident relève d'un transporteur sanitaire.",
      },
      {
        question: "Combien coûte une course entre un EHPAD et un laboratoire ?",
        answer:
          "Le prix d'une course classique, selon la zone et le délai : par exemple 28 € TTC en Normal (3 h) dans Paris. Le prix exact s'affiche avant de valider la commande.",
      },
      {
        question: "L'établissement peut-il régler sur facture ?",
        answer:
          "Oui, avec un compte entreprise : les courses sont suivies en ligne et les factures se règlent sous 30 jours. L'ouverture du compte est immédiate.",
      },
    ],
    service: { href: "/services/transport-medical", label: "Transport médical" },
    published: "2026-11-11",
  },
  {
    slug: "coursier-transport-sang-refrigere",
    title: "Coursier pour le transport de sang réfrigéré : les points à cadrer",
    h1: "Coursier pour le transport de sang réfrigéré : ce qu'il faut cadrer",
    seoTitle: "Coursier transport de sang réfrigéré : points clés",
    description:
      "Coursier pour le transport de sang réfrigéré : informations à donner à la commande, conditionnement, délai, course dédiée et preuve de remise.",
    summary:
      "Transporter du sang réfrigéré par coursier : ce qu'il faut préciser à la commande, qui prépare le colis, quel délai choisir et pourquoi une course dédiée.",
    intro:
      "Un coursier peut transporter du sang réfrigéré, à condition que la course soit cadrée avant le départ. Ce guide liste ce qu'il faut préciser à la commande, ce qui revient à l'expéditeur et ce qui relève du coursier, pour qu'un échantillon arrive dans les temps et dans les conditions demandées par le laboratoire.",
    sections: [
      {
        heading: "Transport de sang réfrigéré : de quoi parle-t-on",
        paragraphs: [
          "Le sang réfrigéré désigne ici les prélèvements et échantillons biologiques qui doivent rester au frais pendant le trajet : tubes de prélèvement, petits flacons, échantillons destinés à un laboratoire d'analyses. Ce n'est pas un colis ordinaire. Deux paramètres commandent tout le reste : le délai de stabilité de l'échantillon et la température de conservation demandée.",
          "Ces deux paramètres sont fixés par le laboratoire destinataire, pas par le transporteur. Le rôle de la course est de les respecter, en limitant le temps de trajet et les manipulations. Pour des produits sanguins labiles destinés à un établissement de transfusion, appelez-nous avant de commander : nous vous confirmerons si l'envoi entre dans notre périmètre.",
        ],
      },
      {
        heading: "Les informations à donner à la commande",
        paragraphs: [
          "La plupart des retards ou des échantillons refusés viennent d'une information manquante au moment de la commande. Transmettez au minimum :",
        ],
        list: [
          "Le nom du laboratoire ou du service destinataire, et celui de la personne à qui remettre le colis.",
          "L'heure limite d'arrivée, déterminée par le délai de stabilité de l'échantillon.",
          "La température de conservation demandée et la plage acceptée par le laboratoire.",
          "Le nombre de colis et leur taille approximative, pour choisir le contenant isotherme.",
          "Un contact joignable à l'enlèvement comme à la remise.",
          "Si le protocole l'exige, la demande d'un relevé de température joint à la course.",
        ],
      },
      {
        heading: "Conditionnement : qui fait quoi",
        paragraphs: [
          "L'expéditeur prépare le colis, selon les consignes du laboratoire destinataire. Pour des échantillons biologiques, ces consignes reprennent souvent la référence UN3373, utilisée pour les envois de catégorie B : récipient étanche, emballage secondaire étanche avec absorbant, emballage extérieur rigide et étiqueté. C'est au laboratoire de confirmer la catégorie de son envoi ; le guide ne remplace pas ses procédures.",
          "Le coursier transporte le colis fermé, tel qu'il lui est remis, dans le sens indiqué, sans l'ouvrir et sans en vérifier le contenu. Son rôle commence à la prise en charge et finit à la remise, pas à la préparation du colis. Si un conditionnement vous paraît insuffisant pour la durée du trajet, dites-le avant la commande plutôt que de compter sur la course pour rattraper l'écart.",
        ],
      },
      {
        heading: "Choisir le délai selon le temps de stabilité",
        paragraphs: [
          "La prise en charge se fait en moins de 45 minutes, 7 jours sur 7 de 8 h à 19 h, sous réserve de disponibilité au moment de la commande. La livraison suit la formule choisie : Normal sous 3 h, Urgent sous 1 h 30 ou Super sous 1 h. Pour un prélèvement, c'est le délai de stabilité qui décide de la formule, et non l'inverse.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super 1 h"],
          rows: [
            ["Paris", "28 €", "42 €", "56 €"],
            ["Petite couronne (dès)", "39 €", "58,50 €", "78 €"],
          ],
          note: "Prix par course, TTC, TVA 20 % comprise. Petite couronne : 8 km de route compris, puis 2 € TTC par km en Normal, 3 € en Urgent et 4 € en Super. Grande couronne : prix selon la distance, affiché avant la commande.",
        },
      },
      {
        heading: "Pourquoi une course dédiée",
        paragraphs: [
          "Pour un échantillon sensible à la température, chaque arrêt compte. En course dédiée, le coursier part de votre adresse et va directement au laboratoire, sans passer chez un autre client. Le colis n'est ni regroupé avec d'autres envois, ni déposé en route.",
          "Une tournée groupée reste possible pour des envois sans heure limite. Son ordre d'arrêts rend cependant l'heure d'arrivée moins prévisible. Pour un prélèvement dont l'heure limite est fixée par le laboratoire, la course dédiée donne un délai que vous pouvez vérifier avant de commander. Le principe est détaillé dans notre guide sur la [course dédiée coursier](/guides/course-dediee-coursier).",
        ],
      },
      {
        heading: "Preuve de remise et traçabilité",
        paragraphs: [
          "L'heure de prise en charge est enregistrée et l'avancement de la course est consultable en ligne. La remise se fait en main propre au service ou à la personne désignés, avec le nom du réceptionnaire et l'heure de remise. Ces informations restent consultables dans votre espace.",
          "Ce justificatif permet de reconstituer le trajet, de la prise en charge à la remise, si le laboratoire pose une question sur un échantillon. Il ne remplace ni les données de traçabilité que le laboratoire tient de son côté, ni les procédures internes de vos analyses.",
        ],
      },
    ],
    faq: [
      {
        question: "Pouvez-vous transporter du sang réfrigéré ?",
        answer:
          "Oui, en course dédiée, dans un contenant isotherme convenu à la commande. Indiquez la température et le délai de stabilité fixés par le laboratoire : nous confirmons la faisabilité avant d'engager la course.",
      },
      {
        question: "Qui prépare le colis ?",
        answer:
          "L'expéditeur, selon les consignes du laboratoire destinataire. Le coursier transporte le colis fermé et ne l'ouvre pas.",
      },
      {
        question: "Peut-on obtenir un relevé de température ?",
        answer:
          "Oui, sur demande, lorsque le protocole du laboratoire l'exige. Précisez-le au moment de la commande.",
      },
      {
        question: "Transportez-vous des produits sanguins pour un établissement de transfusion ?",
        answer:
          "Pour ces produits, appelez-nous avant de commander. Nous vous confirmerons si l'envoi entre dans notre périmètre.",
      },
      {
        question: "Quel délai prévoir pour un prélèvement ?",
        answer:
          "La prise en charge se fait en moins de 45 minutes, 7j/7 de 8 h à 19 h, sous réserve de disponibilité. La livraison suit la formule : sous 3 h, 1 h 30 ou 1 h.",
      },
    ],
    service: { href: "/services/transport-prelevements-sang", label: "Transport de prélèvements sanguins" },
    published: "2026-11-12",
  },
  {
    slug: "fideliser-clients-commerce-livraison-express",
    title: "Commerçants : fidéliser ses clients grâce à la livraison express",
    h1: "Fidéliser ses clients quand on est commerçant : carte de fidélité et livraison express",
    seoTitle: "Fidéliser ses clients en commerce : outils et livraison",
    description:
      "Commerçant de proximité : comment faire revenir vos clients avec une carte de fidélité numérique, des avis Google et une livraison express fiable à Paris.",
    summary:
      "Carte de fidélité numérique, suivi des clients et avis Google d'un côté, livraison express fiable de l'autre : les leviers d'un commerce de proximité pour faire revenir ses clients.",
    intro:
      "Un client satisfait ne revient pas par hasard. Il revient parce que le commerçant lui a donné une raison de le faire : un avantage simple à utiliser, un contact au bon moment et, de plus en plus, une livraison qui tient ses délais. Voici les leviers à combiner quand on tient un restaurant, un salon, une boulangerie ou une boutique.",
    sections: [
      {
        heading: "Une carte de fidélité que le client a déjà dans sa poche",
        paragraphs: [
          "Le frein classique des cartes de fidélité tient à leur support : la carte en carton se perd, l'application à installer reste souvent vide. La solution qui s'impose consiste à ranger la carte dans le portefeuille numérique du téléphone, Apple Wallet ou Google Wallet, sans application à télécharger.",
          "C'est le principe de [Loyzia](https://loyzia.com), une plateforme française pensée pour les commerçants de proximité : le client ajoute la carte à son Wallet, puis cumule des tampons ou des points à chaque passage. Le commerçant garde la main sur la récompense, ce qui lui permet de la calibrer selon sa marge.",
        ],
      },
      {
        heading: "Suivre ses clients et relancer ceux qui s'éloignent",
        paragraphs: [
          "Fidéliser suppose de savoir qui revient et qui a disparu. Un outil de CRM client répond à cette question : il met en évidence les clients les plus assidus, pour les remercier, et ceux qui ne sont pas revenus depuis plusieurs semaines, pour leur envoyer une notification au bon moment.",
          "Pour les commerçants qui ont plusieurs points de vente, la même logique s'applique établissement par établissement. Sur Loyzia, la gestion multi-établissements et l'application de caisse font partie des fonctions proposées, avec un essai gratuit de 14 jours sans carte bancaire pour se faire une idée avant de s'engager.",
        ],
        list: [
          "Remercier les clients les plus fidèles par un avantage ciblé.",
          "Relancer les clients inactifs avec une notification plutôt qu'une promotion générale.",
          "Mesurer ce qui fonctionne avant d'élargir l'opération à tous les établissements.",
        ],
      },
      {
        heading: "Les avis Google : la fidélité qui travaille pour vous",
        paragraphs: [
          "Un client fidèle est aussi le meilleur ambassadeur d'un commerce. Les avis Google pèsent sur la visibilité locale et sur la décision d'un nouveau client qui compare deux adresses. Plutôt que de les attendre, on peut les solliciter au bon moment, à la sortie de la caisse, avec un geste simple.",
          "Certaines formules, comme le plan Business de [Loyzia](https://loyzia.com), proposent un mini-jeu, la Roue de la Chance, pour encourager le client à laisser un avis. Quel que soit l'outil retenu, respectez les règles de la plateforme d'avis et ne conditionnez jamais la récompense à une note positive.",
        ],
      },
      {
        heading: "La livraison express : tenir sa promesse jusqu'à la remise",
        paragraphs: [
          "Pour un commerce qui livre, la fidélité se joue aussi sur le dernier kilomètre. Un colis en retard, une commande abîmée ou un coursier injoignable effacent en une fois les efforts d'une carte de fidélité. La livraison est un moment de contact avec le client : elle mérite la même attention que le comptoir.",
          "Pour les envois urgents d'un commerce ou d'une entreprise à Paris et en Île-de-France, une course dédiée ou une [livraison le jour même](/guides/livraison-le-jour-meme-entreprise) permet de maîtriser le créneau et de suivre l'avancement. Avant de choisir, comparez les [formules de délai](/guides/delai-formules-coursier-express) et consultez la [grille tarifaire](/tarifs) : le prix est affiché avant de commander.",
        ],
      },
    ],
    faq: [
      {
        question: "Faut-il une application pour une carte de fidélité numérique ?",
        answer:
          "Non, pas nécessairement. Des solutions comme [Loyzia](https://loyzia.com) ajoutent la carte directement à Apple Wallet ou Google Wallet, sans application à installer pour le client.",
      },
      {
        question: "Comment savoir quels clients ne reviennent plus ?",
        answer:
          "Un outil de CRM client liste les clients les plus fidèles et ceux qui n'ont pas reparu depuis un certain temps. Vous pouvez ensuite leur envoyer une notification ciblée.",
      },
      {
        question: "Peut-on offrir une récompense en échange d'un avis Google ?",
        answer:
          "Solliciter un avis est possible, mais la récompense ne doit jamais dépendre de la note donnée. Renseignez-vous sur les règles de la plateforme avant de lancer une opération.",
      },
      {
        question: "Comment livrer rapidement un client à Paris ?",
        answer:
          "Par une course dédiée ou une [livraison le jour même](/guides/livraison-le-jour-meme-entreprise). Le prix est affiché avant la commande sur la [grille tarifaire](/tarifs).",
      },
    ],
    service: { href: "/services/coursier-express-paris", label: "Coursier express Paris" },
    published: "2026-11-13",
  },
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
