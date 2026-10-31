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
      {
        question: "Combien coûte l’envoi d’un pli confidentiel dans Paris ?",
        answer:
          "Comme toute course : 28 € TTC en Normal (3 h), 42 € en Urgent (1 h 30) et 56 € en Super (1 h) intramuros. Le prix ne dépend pas du contenu du pli.",
      },
      {
        question: "Le pli peut-il être regroupé avec d’autres envois ?",
        answer:
          "Non. Chaque pli part en course dédiée : le coursier va directement de l’enlèvement au destinataire, sans arrêt intermédiaire.",
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
    seoTitle: "Tarif coursier Paris : prix et critères",
    description:
      "Tarif d'un coursier à Paris : distance, délai, zone et volume. Comment connaître le prix avant de commander.",
    intro:
      "Il n'existe pas de prix unique pour un coursier : la même course peut varier selon quelques critères précis. Les connaître permet de comparer des offres sur des bases identiques.",
    sections: [
      {
        heading: "Les tarifs par zone et par délai",
        paragraphs: [
          "Voici la grille de ONE CONNEXION pour une course en Île-de-France. Quand le trajet traverse deux zones, la zone la plus éloignée s'applique. En petite couronne, le prix est fixe jusqu'à 8 km, puis s'ajoute un prix par km.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super 1 h"],
          rows: [
            ["Paris (75)", "28 €", "42 €", "56 €"],
            ["Petite couronne (92, 93, 94)", "39 € + 2 €/km au-delà de 8 km", "58,50 € + 3 €/km", "78 € + 4 €/km"],
            ["Grande couronne (77, 78, 91, 95)", "dès 60 €", "dès 90 €", "dès 120 €"],
          ],
          note: "Tarifs TTC par course, TVA 20 % comprise. Le prix exact s'affiche avant de valider la commande.",
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
          "Plus le délai est court, plus la course coûte cher : en intramuros, la même course passe de 28 € TTC en 3 h à 56 € TTC en 1 h. Une navette régulière, avec un passage programmé, est en général la formule la plus économique pour des besoins répétés.",
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
          "Si vous envoyez régulièrement, un compte entreprise permet de régler les factures sous 30 jours et peut ouvrir une grille adaptée au volume. La page tarifs détaille les formules.",
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
          "Oui : un délai de 1 h coûte le double d'un délai de 3 h (56 € TTC contre 28 € TTC intramuros). Un créneau plus large réduit le tarif.",
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
        question: "Existe-t-il un tarif dégressif ?",
        answer:
          "Oui, avec un compte entreprise : au-delà d’un volume mensuel régulier, un tarif dégressif s’applique et les factures se règlent sous 30 jours.",
      },
    ],
    service: { href: "/tarifs", label: "Tarif coursier Paris" },
    published: "2026-09-21",
  },
  {
    slug: "expedier-du-materiel-de-laboratoire",
    title: "Expédier du matériel de laboratoire en Île-de-France : préparer l'envoi",
    seoTitle: "Expédier du matériel de laboratoire : guide",
    description:
      "Réactifs, consommables, pièce d'automate, instrument fragile : comment qualifier, emballer et faire transporter du matériel de laboratoire en Île-de-France, et à quel prix.",
    intro:
      "Un laboratoire n'expédie pas seulement des prélèvements. Il fait aussi circuler des réactifs, des consommables, des pièces d'automates et des instruments entre ses sites, ses fournisseurs et ses partenaires. Chacun de ces envois a ses propres contraintes. Ce guide vous aide à les identifier avant de commander une course, pour que le colis arrive à temps et en bon état.",
    sections: [
      {
        heading: "Ce que recouvre le matériel de laboratoire",
        paragraphs: [
          "Derrière la même expression se cachent des envois très différents. Les consommables (cônes, tubes, plaques, gants) sont légers et peu sensibles. Les réactifs peuvent demander une température de conservation précise. Une pièce de rechange d'automate est souvent urgente, parce qu'elle immobilise une machine. Un instrument de mesure est fragile et doit voyager dans un sens donné.",
          "Ces différences comptent plus que la distance. Elles déterminent le contenant, le délai à choisir et les informations à donner au coursier. Avant de commander, prenez une minute pour classer votre envoi dans l'une de ces catégories.",
        ],
      },
      {
        heading: "Qualifier le colis avant de commander",
        paragraphs: [
          "La plupart des incidents viennent d'une information manquante au moment de la commande. Voici ce qu'il faut savoir et transmettre :",
        ],
        list: [
          "La nature du contenu : consommable, réactif, pièce technique, instrument ou échantillon.",
          "La température de conservation, s'il y en a une, et la durée pendant laquelle elle doit être tenue.",
          "La fragilité et le sens de transport, par exemple un appareil qui doit rester à plat.",
          "Le poids et les dimensions approximatives : un deux-roues transporte jusqu'à 18 kg, dans un top-case.",
          "L'heure limite d'arrivée réelle, par exemple le démarrage d'une série d'analyses.",
          "Le nom du destinataire, son service et un numéro joignable à l'enlèvement comme à la remise.",
        ],
      },
      {
        heading: "L'emballage reste à la charge de l'expéditeur",
        paragraphs: [
          "Le coursier transporte le colis fermé, tel qu'il lui est remis. C'est donc à l'expéditeur de le préparer. Pour un instrument fragile, un calage qui empêche tout mouvement et une flèche indiquant le haut évitent l'essentiel des casses. Pour un réactif à conserver au froid, le contenant isotherme est convenu à la commande, et un relevé de température peut être joint si votre protocole l'exige.",
          "Les échantillons biologiques de catégorie B voyagent en triple emballage UN3373, préparé par l'expéditeur. Le coursier le transporte fermé, sans l'ouvrir.",
          "Certains produits demandent plus de précautions : solvants, produits corrosifs, gaz, carboglace. Selon leur nature et leur quantité, ils peuvent relever de la réglementation du transport de marchandises dangereuses, dite ADR. Dans ce cas, appelez-nous avant de commander : nous vous dirons clairement si nous pouvons prendre l'envoi en charge ou s'il faut passer par un transporteur spécialisé.",
        ],
      },
      {
        heading: "Course dédiée, course programmée ou tournée",
        paragraphs: [
          "Le bon choix dépend de l'urgence et de la fréquence de vos envois.",
        ],
        list: [
          "Course dédiée immédiate : pour une pièce qui bloque un automate ou un réactif attendu le jour même. Le coursier passe en moins de 45 minutes et va directement chez le destinataire, sans arrêt intermédiaire.",
          "Course programmée : pour un envoi prévu à l'avance, à une date et une heure choisies dans le formulaire. Elle se paie au tarif Normal.",
          "Tournée régulière : pour des navettes fréquentes entre deux sites, par exemple un réapprovisionnement en consommables plusieurs fois par semaine. Les jours et heures de passage sont fixés avec vous, sur devis.",
        ],
      },
      {
        heading: "Prix et délais en Île-de-France",
        paragraphs: [
          "Le prix ne dépend ni du contenu ni du poids, jusqu'à 18 kg. Seuls comptent la zone la plus éloignée du trajet, la distance en petite couronne et le délai choisi. Le service fonctionne du lundi au samedi, de 9 h à 19 h.",
        ],
        table: {
          head: ["Zone", "Normal 3 h", "Urgent 1 h 30", "Super 1 h"],
          rows: [
            ["Paris (75)", "28 €", "42 €", "56 €"],
            ["Petite couronne (92, 93, 94)", "39 € + 2 €/km au-delà de 8 km", "58,50 € + 3 €/km", "78 € + 4 €/km"],
            ["Grande couronne (77, 78, 91, 95)", "selon la distance", "selon la distance", "selon la distance"],
          ],
          note: "Tarifs TTC par course, TVA 20 % comprise. Le prix exact s'affiche avant de valider la commande.",
        },
      },
      {
        heading: "Envoyer plus loin qu'en Île-de-France",
        paragraphs: [
          "ONE CONNEXION ne livre qu'à Paris et en Île-de-France. Pour un envoi en province ou à l'étranger, la course peut toutefois assurer le premier trajet : de votre laboratoire jusqu'aux locaux d'un transporteur national ou international en Île-de-France, ou jusqu'aux aéroports de Roissy et d'Orly, desservis au tarif de leur zone. Le transporteur longue distance prend ensuite le relais avec ses propres conditions d'emballage et de documents.",
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
          "Oui, du lundi au samedi entre 9 h et 19 h. En course Super, la livraison se fait en 1 h, par exemple pour 56 € TTC intramuros. Le coursier passe en moins de 45 minutes.",
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
    seoTitle: "Coursier Paris banlieue : zones et prix",
    description:
      "Petite couronne, grande couronne, trajets de banlieue à banlieue : comment est calculé le prix d'un coursier entre Paris et la banlieue, quels délais choisir et comment préparer la course.",
    intro:
      "Envoyer un dossier de Paris à Nanterre, un colis de Montreuil à Créteil ou une pièce de Boulogne à Versailles : dès que la course sort de Paris, le prix et le délai ne se calculent plus de la même façon. Ce guide explique comment la banlieue est découpée, ce qui fait le prix d'une course et ce qu'il faut prévoir pour qu'elle arrive à l'heure.",
    sections: [
      {
        heading: "Petite couronne et grande couronne : deux façons de compter",
        paragraphs: [
          "En Île-de-France, la banlieue se divise en deux zones. La petite couronne regroupe les trois départements qui touchent Paris : les Hauts-de-Seine (92), la Seine-Saint-Denis (93) et le Val-de-Marne (94). La grande couronne regroupe les quatre départements plus éloignés : la Seine-et-Marne (77), les Yvelines (78), l'Essonne (91) et le Val-d'Oise (95).",
          "Pour une course, c'est la zone la plus éloignée du trajet qui compte. Un aller de Paris 8e à Levallois-Perret est une course de petite couronne. Un trajet de Saint-Denis à Pontoise est une course de grande couronne, parce que l'une des deux adresses est dans le Val-d'Oise.",
          "La zone dépend du code postal ou du nom de la commune. Une adresse complète, avec son code postal, donne donc le bon prix dès la saisie.",
        ],
      },
      {
        heading: "Le prix d'une course en petite couronne",
        paragraphs: [
          "En petite couronne, le prix suit la distance par la route entre l'adresse d'enlèvement et l'adresse de livraison. Un prix fixe couvre les 8 premiers kilomètres, puis chaque kilomètre en plus est facturé. Par exemple, une course de 15 km coûte 53 € TTC en délai Normal.",
        ],
        table: {
          head: ["Délai", "Jusqu'à 8 km", "Chaque km en plus"],
          rows: [
            ["Normal 3 h", "39 €", "2 €"],
            ["Urgent 1 h 30", "58,50 €", "3 €"],
            ["Super 1 h", "78 €", "4 €"],
          ],
          note: "Tarifs TTC par course, TVA 20 % comprise. Le prix exact s'affiche avant de valider la commande.",
        },
      },
      {
        heading: "Le prix d'une course en grande couronne",
        paragraphs: [
          "En grande couronne, le calcul change. Le coursier part de Paris, et le prix suit la distance entre Paris et l'adresse la plus éloignée du trajet. Il comprend le retour du coursier vers Paris, qui se fait le plus souvent à vide. C'est pour cette raison qu'une course vers Meaux ou Rambouillet coûte nettement plus qu'une course vers une commune proche du périphérique.",
          "En délai Normal, une course en grande couronne démarre à 59 € TTC. L'Urgent coûte 1,5 fois le prix Normal, soit à partir de 88,50 € TTC, et le Super 2 fois, soit à partir de 118 € TTC. Le prix de votre trajet s'affiche dès que vous saisissez les deux adresses.",
        ],
      },
      {
        heading: "De banlieue à banlieue, sans passer par Paris",
        paragraphs: [
          "Beaucoup de courses ne touchent pas Paris : un document entre deux agences, un colis entre un entrepôt et un client, une pièce entre deux sites industriels. Le coursier va directement de l'adresse d'enlèvement à l'adresse de livraison, sans arrêt intermédiaire.",
          "Le prix suit les mêmes règles. Entre deux villes de petite couronne, par exemple de Montreuil à Créteil, il dépend des kilomètres entre les deux adresses. Dès qu'une des deux adresses est en grande couronne, il suit la distance depuis Paris de l'adresse la plus éloignée.",
          "Si la course doit desservir plusieurs destinataires, vous pouvez ajouter des adresses de livraison. Chaque adresse en plus se paie au kilomètre depuis l'adresse précédente, sans forfait par arrêt : 3 € TTC par km à Paris et en petite couronne, 1,50 € TTC par km en grande couronne, en délai Normal. En Super, une course compte au plus deux adresses de livraison.",
        ],
      },
      {
        heading: "Choisir le bon délai",
        paragraphs: [
          "Le délai se choisit selon l'heure à laquelle le colis doit vraiment être arrivé, pas selon la distance. Trois délais sont proposés, du lundi au samedi, de 9 h à 19 h. Le service est fermé le dimanche et les jours fériés.",
        ],
        list: [
          "Normal, 3 h : pour un envoi à livrer dans la demi-journée, comme un contrat à signer l'après-midi ou un réassort de boutique.",
          "Urgent, 1 h 30 : pour un document attendu à une réunion ou une pièce qui manque à un chantier.",
          "Super, 1 h : pour une remise qui ne peut pas attendre, par exemple une pièce qui bloque une machine.",
          "Course programmée : pour un envoi prévu à l'avance, avec une date et une heure choisies dans le formulaire, au tarif Normal.",
        ],
      },
      {
        heading: "Préparer la course pour éviter les retards",
        paragraphs: [
          "Hors de Paris, les retards viennent rarement de la route. Ils viennent d'une adresse difficile à trouver ou d'un destinataire absent. Pour les trajets vers la banlieue, les rocades, La Défense ou les aéroports, nous utilisons des motos routières, plus adaptées que les scooters aux grands axes. Le colis voyage dans un top-case verrouillé, jusqu'à 18 kg.",
          "Avant de commander, vérifiez ces points :",
        ],
        list: [
          "L'adresse complète avec le code postal, le bâtiment et l'étage, surtout dans les zones d'activité et les grands ensembles de bureaux.",
          "Le nom du destinataire et un numéro joignable côté enlèvement comme côté livraison.",
          "Les codes d'accès, l'entrée à utiliser et les horaires de réception, si le site ferme à l'heure du déjeuner.",
          "Le poids et la taille du colis, pour vérifier qu'il tient dans le top-case.",
          "Une référence interne, pour retrouver la course sur votre facture.",
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
          "Non. Le service fonctionne du lundi au samedi, de 9 h à 19 h. Il est fermé le dimanche et les jours fériés. Pour un envoi prévu à l'avance, vous pouvez programmer la course à la date et à l'heure de votre choix.",
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
