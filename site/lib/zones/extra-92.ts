/**
 * lib/zones/extra-92.ts
 * Approfondissement des communes des Hauts-de-Seine : trois situations
 * concrètes, des conseils avant commande et deux questions en plus.
 * Les situations sont des exemples réalistes, pas des références clients.
 */
import type { ExtraZoneContent } from "./types";

export const EXTRA_92: Record<string, ExtraZoneContent> = {
  nanterre: {
    cases: [
      { title: "Des conclusions avant la clôture du greffe", body: "Un cabinet de La Défense termine ses conclusions à 15h30 et doit les déposer au tribunal judiciaire avant la fermeture du greffe. Le coursier passe au cabinet, dépose au service indiqué et rapporte le justificatif horodaté." },
      { title: "Du matériel pour un soir d'événement à l'Arena", body: "Une société événementielle a oublié des badges et des accréditations pour un concert à la Paris La Défense Arena. Une course immédiate les livre à l'entrée de service avant l'ouverture des portes." },
      { title: "Un dossier d'étudiant à l'université", body: "Un service de scolarité envoie des attestations urgentes à un laboratoire de l'université Paris Nanterre. Le coursier les remet en main propre au secrétariat, contre signature." },
    ],
    tips: [
      "Pour le tribunal, indiquez le service destinataire et l'heure limite de dépôt : c'est elle qui fixe le départ.",
      "Les soirs d'événement à l'Arena, prévenez-nous : l'itinéraire et l'entrée de livraison changent.",
      "Nanterre est très étendue, de la préfecture à l'université : donnez le nom du bâtiment et pas seulement la rue.",
      "À La Défense, un badge ou un nom de visiteur à l'accueil accélère l'entrée.",
    ],
    faq: [
      { q: "Livrez-vous à la préfecture des Hauts-de-Seine ?", a: "Oui, à l'accueil désigné, contre signature. Donnez le service destinataire et un numéro joignable." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Un justificatif avec le nom du signataire, la date, l'heure et le lieu de remise, que vous pouvez annexer à un dossier." },
    ],
  },

  courbevoie: {
    cases: [
      { title: "Un contrat à signer dans une tour", body: "Une direction juridique d'une tour de La Défense attend un contrat signé par un cabinet parisien. Le coursier récupère l'original, se présente à l'accueil avec le nom du signataire et rapporte l'exemplaire signé." },
      { title: "Un colis pour un chantier à Charras", body: "Un bureau d'études de Charras doit recevoir des plans imprimés pour une réunion de chantier dans l'heure. Une course dédiée part de l'imprimerie du 17e et arrive sans rupture de charge." },
      { title: "Des échantillons entre deux sites", body: "Une PME du Faubourg de l'Arche envoie des échantillons de produits à un client de Neuilly. Le trajet est court, le colis voyage seul, la remise est signée." },
    ],
    tips: [
      "Dans une tour, donnez l'entreprise, l'étage et un numéro direct : l'accueil appelle le destinataire avant de laisser monter.",
      "Les quais de livraison des tours ont des horaires : dites-nous si le colis doit passer par le quai ou par l'accueil.",
      "Pour Neuilly et Levallois, les courses sont très courtes : une course immédiate suffit presque toujours.",
      "Précisez si le destinataire est dans la partie de La Défense située à Courbevoie, Puteaux ou Nanterre : les tours se ressemblent.",
    ],
    faq: [
      { q: "Peut-on suivre l'arrivée du coursier dans la tour ?", a: "Oui, la progression de la course est visible en ligne, et nous pouvons vous appeler à l'arrivée à l'accueil." },
      { q: "Livrez-vous le soir à La Défense ?", a: "Oui, jusqu'à 23h, 7j/7, sous réserve de disponibilité au moment de la commande." },
    ],
  },

  puteaux: {
    cases: [
      { title: "Une remise sur la dalle", body: "Un cabinet d'avocats installé sur l'Esplanade attend des pièces de procédure. Le coursier stationne sur le boulevard circulaire, monte à pied sur la dalle et remet à l'accueil de la tour." },
      { title: "Du matériel de stand au CNIT", body: "Un exposant a oublié des brochures pour le deuxième jour d'un salon. Une course immédiate les livre au hall indiqué avec le nom du responsable de stand." },
      { title: "Un pli entre l'Arche et Paris 16e", body: "Une direction de la Grande Arche envoie un pli confidentiel à un cabinet du 16e. La course est dédiée, sans arrêt intermédiaire, avec signature nominative." },
    ],
    tips: [
      "La dalle est piétonne : indiquez l'entrée de la tour la plus proche du boulevard circulaire.",
      "Pendant un salon au CNIT, donnez le hall, le stand et le contact exposant.",
      "L'île de Puteaux a des accès limités : précisez le numéro et le code.",
      "Les parkings souterrains des tours ont des hauteurs et horaires propres : prévenez si un accès par le parking est nécessaire.",
    ],
    faq: [
      { q: "Un coursier à moto peut-il entrer dans le parking d'une tour ?", a: "Cela dépend de la tour. Prévenez le destinataire et donnez-nous la consigne d'accès : sinon la remise se fait à pied depuis la voirie." },
      { q: "Livrez-vous pendant les congrès au CNIT ?", a: "Oui, avec le hall et le contact organisateur. Les accès sont plus encadrés pendant les événements." },
    ],
  },

  suresnes: {
    cases: [
      { title: "Un prélèvement vers un laboratoire parisien", body: "Un service de l'hôpital Foch envoie un échantillon qui doit arriver en moins d'une heure à un laboratoire du 16e. Le coursier part avec un contenant isotherme et remet le prélèvement contre signature." },
      { title: "Un acte entre une étude et le tribunal", body: "Une étude notariale de la ville haute doit transmettre un acte à un confrère parisien avant la fin de journée. La course part de la colline et rejoint Paris par le pont de Suresnes." },
      { title: "Un colis d'agence pour un client du quai", body: "Une agence installée sur les quais envoie des maquettes à un client de La Défense, de l'autre côté de la Seine. Le trajet passe par le T2 en parallèle : la moto arrive avant le tramway." },
    ],
    tips: [
      "Pour l'hôpital, donnez le service, l'étage et le laboratoire destinataire.",
      "Haut ou bas de Suresnes ? Précisez-le : le dénivelé du Mont-Valérien allonge les trajets.",
      "Pour une adresse dans la cité-jardin, le numéro seul ne suffit pas toujours : ajoutez le nom de l'allée.",
      "Le pont de Suresnes se charge aux heures de pointe : prévoyez une marge si l'heure limite est serrée.",
    ],
    faq: [
      { q: "Livrez-vous au cimetière américain ou au Mont-Valérien ?", a: "Oui, à l'entrée de service ou à l'accueil indiqué, avec un contact sur place." },
      { q: "Comment est conditionné un prélèvement pendant la course ?", a: "Le contenant est choisi à la commande selon la température demandée. Le conditionnement initial reste de la responsabilité de l'expéditeur." },
    ],
  },

  "rueil-malmaison": {
    cases: [
      { title: "Un pli pour un siège régional", body: "Un cabinet de Paris doit remettre un pli de direction à un siège d'entreprise en bordure de l'A86. Le coursier se présente à l'accueil avec le nom du destinataire et obtient une signature." },
      { title: "Des documents pour une visite au château de Malmaison", body: "Un organisateur de réception a besoin de documents de sécurité avant l'arrivée des invités. La course immédiate les livre à l'entrée de service du domaine." },
      { title: "Un colis de pièces pour un atelier", body: "Un atelier du centre commande en urgence une pièce chez un fournisseur parisien. La pièce arrive dans la matinée, sans attendre un camion de tournée." },
    ],
    tips: [
      "Rueil est vaste : donnez le quartier (centre, Plaine, bords de Seine) en plus de la rue.",
      "Pour un site d'entreprise, communiquez le nom du bâtiment et un numéro direct du destinataire.",
      "L'A86 est chargée aux heures de pointe : une course planifiée tôt est plus sûre qu'une course de dernière minute.",
      "Pour un événement au château, précisez l'accès de service et l'heure de montage.",
    ],
    faq: [
      { q: "Livrez-vous dans les parcs d'activités de Rueil-Malmaison ?", a: "Oui, avec le nom de l'entreprise, le bâtiment et un contact. L'accès aux sites est contrôlé." },
      { q: "Peut-on prévoir un passage quotidien ?", a: "Oui, par tournées sur créneaux fixes avec un compte entreprise et une facturation mensuelle." },
    ],
  },

  "asnieres-sur-seine": {
    cases: [
      { title: "Des plans pour une réunion au tribunal de Paris", body: "Un cabinet d'architecture d'Asnières doit apporter des plans à un rendez-vous aux Batignolles dans l'heure. La Seine et le périphérique sont franchis en quelques minutes en deux-roues." },
      { title: "Un atelier qui expédie une pièce soignée", body: "Un atelier d'artisanat d'Asnières expédie un article fragile à un client parisien. Le colis voyage seul, protégé, et la remise est signée." },
      { title: "Un prélèvement de cabinet vers un laboratoire", body: "Un médecin des Grésillons envoie un prélèvement à un laboratoire d'analyses du 17e avant sa fermeture. Le coursier part avec un contenant isotherme." },
    ],
    tips: [
      "Précisez le quartier : centre, Les Grésillons ou rives de la Seine, car les distances internes sont longues.",
      "Pour une livraison à Paris 17e, les courses sont très courtes : une course immédiate suffit presque toujours.",
      "Le pont de Clichy se charge le soir : annoncez l'heure limite à la commande.",
      "Indiquez l'étage et le code d'accès : de nombreux immeubles sont en cour intérieure.",
    ],
    faq: [
      { q: "Quel est le délai habituel entre Asnières et le 17e arrondissement ?", a: "Les deux sont limitrophes : la course est très courte. Le délai exact vous est annoncé à la confirmation." },
      { q: "Livrez-vous à des artisans ou à des ateliers ?", a: "Oui. Donnez l'adresse précise et un contact : de nombreux ateliers sont en cour ou en rez-de-chaussée sans enseigne." },
    ],
  },

  "clichy-92": {
    cases: [
      { title: "Un dossier médical pour Beaujon", body: "Un cabinet parisien doit transmettre un dossier à un service de l'hôpital Beaujon avant une consultation. Le coursier le remet au secrétariat du service, contre signature." },
      { title: "Une pièce de dernière minute pour un tournage", body: "Une production installée à Clichy attend un accessoire fabriqué à Paris 10e. La course immédiate le livre à la régie en moins d'une heure." },
      { title: "Un pli pour le tribunal de Paris", body: "Un cabinet de la mairie de Clichy dépose des pièces au tribunal judiciaire avant la clôture. Les Batignolles sont à quelques minutes de la Porte de Clichy." },
    ],
    tips: [
      "Pour Beaujon, donnez le service, le bâtiment et un contact : l'hôpital est vaste.",
      "Le quartier de Clichy-Batignolles est en chantier : prévenez-nous si l'adresse est récente.",
      "Les voies autour de la Porte de Clichy changent selon les travaux : nous adaptons l'itinéraire à la commande.",
      "Pour un colis à la mairie de Clichy, précisez l'entrée du public ou du personnel.",
    ],
    faq: [
      { q: "Livrez-vous à des sociétés de production à Clichy ?", a: "Oui, avec le nom de la production, la régie et un numéro direct. Les accès aux plateaux sont réservés." },
      { q: "Peut-on suivre la course en ligne ?", a: "Oui, la progression est consultable jusqu'à la remise." },
    ],
  },

  colombes: {
    cases: [
      { title: "Un prélèvement depuis Louis-Mourier", body: "Un service de l'hôpital envoie un échantillon vers un laboratoire du 17e. Le coursier part avec un contenant isotherme, le délai de stabilité fixe l'heure de départ." },
      { title: "Du matériel pour un événement au stade", body: "Un organisateur de compétition à Yves-du-Manoir a besoin d'accréditations imprimées en urgence. La course les livre à l'entrée désignée." },
      { title: "Une pièce pour une PME de zone d'activité", body: "Une entreprise de la zone industrielle attend une pièce de rechange d'un fournisseur parisien pour relancer une machine. La course dédiée évite d'attendre un camion." },
    ],
    tips: [
      "Louis-Mourier est un grand hôpital : donnez le service, le bâtiment et un contact.",
      "Les jours de rencontre au stade, l'accès change : prévenez-nous.",
      "Pour une zone d'activité, indiquez le portail, le bâtiment et l'heure de réception.",
      "La Seine et l'A86 limitent les passages : précisez la rive de destination.",
    ],
    faq: [
      { q: "Livrez-vous à Bois-Colombes ou La Garenne-Colombes depuis Colombes ?", a: "Oui, ce sont des communes voisines : les courses sont très courtes." },
      { q: "Quelle est la limite de poids d'un colis ?", a: "18 kg dans le top-case verrouillé. Au-delà, contactez-nous avant de commander." },
    ],
  },

  gennevilliers: {
    cases: [
      { title: "Un document de douane pour un quai du port", body: "Un transitaire de Paris doit faire parvenir un document au bureau d'une entreprise du port avant l'embarquement d'un conteneur. La course dédiée arrive au poste indiqué dans l'heure." },
      { title: "Un échantillon d'un entrepôt", body: "Un site logistique envoie un échantillon de produit à un client du 8e. Le colis voyage seul, avec signature à la remise." },
      { title: "Une pièce pour un engin immobilisé", body: "Une entreprise de la zone industrielle attend une pièce d'un fournisseur de Paris. Une course immédiate la livre à l'entrée de l'atelier." },
    ],
    tips: [
      "Au port, donnez le numéro du quai ou de l'entrée et le nom de la société, pas seulement la rue.",
      "Les horaires de réception des entrepôts sont stricts : l'heure limite fixe le départ.",
      "Les portails demandent parfois une pièce d'identité : prévenez le destinataire.",
      "Pour un envoi volumineux, appelez-nous avant : le top-case est limité à 18 kg.",
    ],
    faq: [
      { q: "Livrez-vous à l'intérieur du port de Gennevilliers ?", a: "Oui, avec le quai ou l'entrée et un contact sur place. Les accès sont contrôlés." },
      { q: "Quels documents peut-on faire transporter ?", a: "Documents de transport, de douane, bons de livraison : la remise est signée, avec l'heure consignée." },
    ],
  },

  montrouge: {
    cases: [
      { title: "Un contrat à faire signer dans le 14e", body: "Un bureau de Montrouge doit faire signer un contrat à un client de Paris 14e avant 17h. La Porte d'Orléans est franchie en quelques minutes, la signature est rapportée le jour même." },
      { title: "Des œuvres légères pour le Salon", body: "Un artiste exposant au Salon de Montrouge envoie une pièce légère à la dernière minute. La course dédiée la remet au Beffroi avec le nom du responsable." },
      { title: "Une ordonnance vers une pharmacie parisienne", body: "Un cabinet médical envoie une ordonnance et un dossier à une officine du 14e. La remise est signée." },
    ],
    tips: [
      "Précisez la station de métro la plus proche : Mairie de Montrouge ou Porte d'Orléans.",
      "Pour le Beffroi, donnez l'entrée et le contact de la régie.",
      "Les bureaux ont des accueils partagés : donnez l'entreprise et l'étage.",
      "La Porte d'Orléans se charge le matin et le soir : une course immédiate est plus sûre que planifiée tard.",
    ],
    faq: [
      { q: "Quel est le temps de trajet vers Paris 14e ?", a: "Les deux sont limitrophes : la course est très courte, le délai exact est annoncé à la confirmation." },
      { q: "Livrez-vous à des galeries ou à des artistes ?", a: "Oui pour des pièces légères et protégées, jusqu'à 18 kg." },
    ],
  },

  malakoff: {
    cases: [
      { title: "Des épreuves d'imprimerie pour une association", body: "Une association de Malakoff a besoin des épreuves de son bulletin avant un bouclage. Le coursier les récupère à l'imprimerie du 15e et les remet en main propre." },
      { title: "Un prélèvement de cabinet", body: "Un médecin du plateau de Vanves envoie un échantillon à un laboratoire du 14e. La course est brève, avec contenant isotherme." },
      { title: "Un pli administratif pour un dépôt avant 17h", body: "Un bureau d'études dépose un dossier à une administration parisienne avant l'heure de fermeture. La remise est horodatée." },
    ],
    tips: [
      "Donnez la station de métro la plus proche : Plateau de Vanves ou Rue Étienne-Dolet.",
      "Le plateau est en hauteur : les rues en pente allongent un peu les trajets.",
      "Pour un colis à une association, précisez l'étage et les horaires d'accueil.",
      "Les voies vers Paris 14e sont courtes mais chargées : une course immédiate est plus fiable.",
    ],
    faq: [
      { q: "Peut-on organiser une tournée hebdomadaire ?", a: "Oui, sur créneaux fixes avec un compte entreprise, facturation mensuelle." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Un justificatif avec nom du signataire, date, heure et lieu." },
    ],
  },

  vanves: {
    cases: [
      { title: "Un échantillon pour un exposant du Parc des Expositions", body: "Un exposant de la Porte de Versailles a besoin de produits supplémentaires pour son stand. La course immédiate les livre au hall en moins d'une heure." },
      { title: "Un dossier d'étudiant pour une école", body: "Un établissement d'enseignement supérieur de Vanves reçoit en urgence un dossier d'admission. La remise est signée à la scolarité." },
      { title: "Un pli pour une administration du 15e", body: "Une association de Vanves dépose une demande de subvention avant une échéance. Le coursier la remet au service concerné." },
    ],
    tips: [
      "Pendant un salon, les rues autour de la Porte de Versailles sont saturées : annoncez l'heure limite.",
      "Pour une école, donnez le bâtiment et le service : les accueils sont distincts.",
      "Le Palais des Sports a ses horaires : précisez le créneau de livraison.",
      "Pour Paris 15e, les courses sont courtes : privilégiez la course immédiate.",
    ],
    faq: [
      { q: "Livrez-vous au Parc des Expositions depuis Vanves ?", a: "Oui, avec le hall, le stand et le contact exposant." },
      { q: "Peut-on prévoir des courses régulières avec le 15e ?", a: "Oui, par tournées à créneaux fixes avec un compte entreprise." },
    ],
  },

  clamart: {
    cases: [
      { title: "Un prélèvement depuis un hôpital", body: "Un service de l'hôpital Antoine-Béclère envoie un échantillon vers un laboratoire parisien. Le délai de stabilité fixe l'heure de départ, le contenant est isotherme." },
      { title: "Un dossier pour l'hôpital Percy", body: "Un cabinet transmet un dossier de suivi à un service de l'hôpital d'instruction des armées. L'accès étant contrôlé, le destinataire est prévenu de l'arrivée." },
      { title: "Une pièce pour un artisan du centre", body: "Un artisan de Clamart attend une pièce d'un fournisseur de Paris pour terminer un chantier. La course dédiée la livre dans la matinée." },
    ],
    tips: [
      "Donnez le quartier : centre, Fleury, Trivaux ou lisière de la forêt. La commune est vaste.",
      "Pour les hôpitaux, précisez le service, le bâtiment et un contact.",
      "Percy est un hôpital militaire : prévenez le destinataire, l'accès est contrôlé.",
      "Les adresses en lisière de forêt sont parfois sans numéro visible : donnez un contact joignable.",
    ],
    faq: [
      { q: "Livrez-vous à l'hôpital Percy ?", a: "Oui, à l'accueil désigné, contre signature. Prévenez le destinataire : l'accès dépend des règles du site." },
      { q: "Le tramway T6 aide-t-il votre livraison ?", a: "Non : le coursier suit son propre itinéraire. Le T6 est seulement un repère pour situer une adresse." },
    ],
  },

  chatillon: {
    cases: [
      { title: "Un document pour un campus de bureaux", body: "Un cabinet parisien envoie un avenant de contrat à un service d'un campus de bureaux. Le coursier se présente à l'accueil avec le nom du destinataire." },
      { title: "Du matériel informatique entre deux sites", body: "Une équipe informatique transfère un ordinateur portable de remplacement à un collaborateur. Le colis est remis contre signature." },
      { title: "Un pli pour une administration", body: "Un commerçant de Châtillon dépose un dossier à la préfecture de Nanterre ou à la mairie. La course est planifiée à l'avance." },
    ],
    tips: [
      "Un grand campus a plusieurs entrées : précisez le bâtiment et l'accueil.",
      "Donnez la distance à pied depuis la station Châtillon–Montrouge si l'adresse est mal repérée.",
      "Le terminus du métro 13 est chargé le matin : prévoyez une marge.",
      "Pour un matériel fragile, indiquez la fragilité et le poids.",
    ],
    faq: [
      { q: "Livrez-vous à l'intérieur d'un campus de bureaux ?", a: "Oui, à l'accueil désigné. Donnez le nom du destinataire et un contact direct." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case. Au-delà, appelez-nous avant de commander." },
    ],
  },

  bagneux: {
    cases: [
      { title: "Un dossier à déposer à Paris", body: "Une PME de la zone d'activité dépose un dossier de marché à un acheteur parisien avant l'heure limite. Le coursier remonte la RD920 jusqu'à Paris 14e." },
      { title: "Une pièce pour un atelier", body: "Un atelier de Bagneux attend un composant d'un fournisseur de Montrouge. La course est très courte, le colis arrive signé." },
      { title: "Un plan pour un chantier", body: "Un conducteur de travaux reçoit une version imprimée mise à jour d'un plan. La remise a lieu directement sur le chantier, avec un contact sur place." },
    ],
    tips: [
      "La station de la ligne 4 est un repère utile : donnez la distance à pied.",
      "Pour un chantier, communiquez l'entrée, le nom du conducteur de travaux et un numéro direct.",
      "Les zones d'activité ont des horaires de réception : précisez l'heure limite.",
      "Pour Paris, la RD920 est chargée aux heures de pointe : planifiez avec une marge.",
    ],
    faq: [
      { q: "Livrez-vous sur un chantier à Bagneux ?", a: "Oui, avec l'entrée, le nom du responsable et un contact. Prévenez-nous si le site impose des consignes de sécurité particulières à l'arrivée." },
      { q: "Desservez-vous le cimetière parisien de Bagneux ?", a: "Oui, à l'entrée indiquée, avec un contact sur place." },
    ],
  },

  antony: {
    cases: [
      { title: "Un colis vers Orly en fin de journée", body: "Une entreprise d'Antony doit faire partir des documents par un vol du soir. La course dédiée les remet au comptoir indiqué avant la fermeture de l'enregistrement." },
      { title: "Un prélèvement depuis l'hôpital privé", body: "Un service de l'hôpital privé d'Antony envoie un échantillon vers un laboratoire parisien. Le contenant est isotherme et le délai de stabilité fixe le départ." },
      { title: "Une pièce vers un site de Saclay", body: "Une équipe de recherche attend un composant d'un fournisseur d'Antony. La course dédiée le livre au laboratoire." },
    ],
    tips: [
      "Précisez le quartier : centre, Antony Parc, Noyer-Doré. La commune est grande.",
      "Pour Orly, indiquez le terminal, le comptoir et l'heure limite.",
      "Le RER B est un repère mais la RD920 se charge : planifiez avec une marge.",
      "Pour Saclay, la grande couronne se chiffre sur devis.",
    ],
    faq: [
      { q: "Livrez-vous à Orly depuis Antony ?", a: "Oui. Les deux sont proches : précisez le terminal et l'heure limite." },
      { q: "Quel tarif pour Saclay depuis Antony ?", a: "Le plateau de Saclay est en grande couronne : le tarif est établi sur devis." },
    ],
  },

  meudon: {
    cases: [
      { title: "Des instruments pour l'observatoire", body: "Un laboratoire de Meudon attend un composant optique d'un fournisseur de Paris. Le colis, léger et protégé, est remis au laboratoire contre signature." },
      { title: "Un dossier pour une administration de Meudon-la-Forêt", body: "Une association de Meudon-la-Forêt dépose un dossier de subvention avant une échéance. La course traverse la forêt par les routes départementales." },
      { title: "Un colis pour une résidence en hauteur", body: "Un particulier professionnel installé sur la terrasse de Meudon reçoit des échantillons d'un client. La remise a lieu au portail, avec code." },
    ],
    tips: [
      "Meudon-sur-Seine et Meudon-la-Forêt sont distants : indiquez le quartier.",
      "Pour l'observatoire, donnez le laboratoire, le bâtiment et un contact.",
      "Les adresses de la terrasse ont souvent un code : transmettez-le.",
      "Le dénivelé allonge les trajets de bas en haut : prévoyez une marge.",
    ],
    faq: [
      { q: "Livrez-vous à l'ONERA ou aux laboratoires du CNRS à Meudon ?", a: "Oui, à l'accueil désigné, avec le laboratoire et un contact." },
      { q: "Desservez-vous toute la forêt de Meudon ?", a: "Oui jusqu'aux limites accessibles. Pour un point précis de la forêt, indiquez le repère et un contact." },
    ],
  },

  sevres: {
    cases: [
      { title: "Une pièce de céramique pour une exposition", body: "Un conservateur envoie une petite pièce vers un musée parisien. Le colis, protégé, voyage seul et est remis contre signature." },
      { title: "Un document pour un centre de formation", body: "Un organisme de formation installé à Sèvres a besoin d'attestations pour un examen. La course les remet en main propre au responsable." },
      { title: "Un pli pour une étude de Boulogne", body: "Une étude de Sèvres envoie un acte à un confrère de Boulogne-Billancourt, de l'autre côté de la Seine. La course est très courte." },
    ],
    tips: [
      "Le rond-point du Pont de Sèvres est très chargé : annoncez l'heure limite à la commande.",
      "Pour le musée ou la manufacture, donnez l'entrée de service et un contact.",
      "Pour Boulogne et Paris 16e, une course immédiate suffit presque toujours.",
      "Précisez la station de métro ou l'arrêt de tram le plus proche.",
    ],
    faq: [
      { q: "Quelle est la limite de taille d'un colis ?", a: "Un top-case de 18 kg. Pour une pièce plus volumineuse, appelez-nous avant." },
      { q: "Livrez-vous à France Éducation international ?", a: "Oui, à l'accueil, avec le service destinataire." },
    ],
  },

  "saint-cloud": {
    cases: [
      { title: "Un pli pour un cabinet haut de gamme", body: "Un notaire de Saint-Cloud reçoit des pièces d'un confrère de Paris 16e. La remise est faite contre signature, en main propre." },
      { title: "Du matériel pour un jour de courses", body: "Un organisateur d'un événement à l'hippodrome a oublié des accréditations. La course immédiate les livre à l'entrée désignée." },
      { title: "Un prélèvement depuis une clinique", body: "Une clinique envoie un échantillon vers un laboratoire parisien. Le contenant est isotherme, le délai de stabilité fixe le départ." },
    ],
    tips: [
      "Le pont de Saint-Cloud est saturé aux heures de pointe : prévoyez une marge.",
      "La ville est étagée : indiquez si l'adresse est en bas, près de la gare, ou en haut.",
      "Pour le domaine national, précisez l'entrée de service.",
      "Dans les résidences, le gardien appelle le destinataire : donnez son nom exact.",
    ],
    faq: [
      { q: "Livrez-vous aux cliniques de Saint-Cloud ?", a: "Oui, à l'accueil du service. Précisez le bâtiment et un contact." },
      { q: "Pouvez-vous livrer à Garches ou à Marnes-la-Coquette ?", a: "Oui, ces communes sont voisines. Le tarif est celui de la petite couronne." },
    ],
  },

  "chatenay-malabry": {
    cases: [
      { title: "Un réactif pour la faculté de pharmacie", body: "Un laboratoire de la faculté attend un réactif d'un fournisseur parisien. La course dédiée le livre au laboratoire, avec contenant isotherme si nécessaire." },
      { title: "Des échantillons vers l'hôpital Marie-Lannelongue", body: "Un chercheur envoie des échantillons au Plessis-Robinson voisin. La course est courte, avec remise signée." },
      { title: "Un dossier d'étudiant pour une scolarité", body: "Un service de scolarité demande en urgence un dossier à un établissement parisien. La remise est faite au secrétariat." },
    ],
    tips: [
      "Un campus a plusieurs entrées : donnez le bâtiment, le laboratoire et un contact.",
      "Le tramway T10 est un repère : indiquez la station la plus proche.",
      "La ville est boisée et vallonnée : certains trajets sont plus longs qu'il n'y paraît.",
      "Pour un échantillon, donnez la température de conservation et le délai de stabilité.",
    ],
    faq: [
      { q: "Livrez-vous à la Vallée-aux-Loups ?", a: "Oui, à l'accueil de la maison de Chateaubriand ou du domaine, avec un contact." },
      { q: "Peut-on prévoir des courses régulières avec un laboratoire ?", a: "Oui, par tournées à créneaux fixes avec un compte entreprise." },
    ],
  },

  sceaux: {
    cases: [
      { title: "Un acte pour un notaire", body: "Une étude de Sceaux reçoit un acte d'un confrère parisien. Le coursier le remet en main propre, contre signature nominative." },
      { title: "Du matériel pour un concert au château", body: "Une association culturelle a besoin de partitions pour un concert dans l'orangerie. La course les livre à l'entrée de service." },
      { title: "Un prélèvement d'un cabinet médical", body: "Un médecin envoie un échantillon vers un laboratoire de Paris. Le contenant est isotherme et le délai de stabilité respecté." },
    ],
    tips: [
      "Le centre est calme mais les rues sont étroites : donnez un numéro précis.",
      "Pour le parc, précisez l'entrée : plusieurs portes existent.",
      "Les professions libérales reçoivent surtout sur rendez-vous : prévenez le destinataire.",
      "La RD920 vers Paris est chargée le matin et le soir.",
    ],
    faq: [
      { q: "Livrez-vous au lycée Lakanal ?", a: "Oui, à l'accueil du lycée, avec le service destinataire." },
      { q: "Pouvez-vous livrer à Bourg-la-Reine depuis Sceaux ?", a: "Oui, les deux communes sont voisines." },
    ],
  },

  "bourg-la-reine": {
    cases: [
      { title: "Un pli du cabinet à un client parisien", body: "Un avocat de Bourg-la-Reine doit remettre une copie de dossier à un client de Paris 14e. Le coursier descend la RD920 et remet en main propre." },
      { title: "Un colis d'un commerçant du centre", body: "Un commerçant expédie une commande urgente à un client de Sceaux. Le trajet est de quelques minutes." },
      { title: "Une ordonnance vers une pharmacie", body: "Un cabinet médical envoie une ordonnance et un dossier à une officine voisine. La remise est signée." },
    ],
    tips: [
      "Précisez le côté de la voie ferrée du RER B pour une adresse proche de la gare.",
      "Les commerces de l'avenue du Général-Leclerc reçoivent par l'arrière : indiquez l'accès.",
      "Pour une livraison dans une copropriété, donnez le code d'entrée.",
      "Pour Paris, la RD920 se charge aux heures de pointe : planifiez avec une marge.",
    ],
    faq: [
      { q: "Livrez-vous à Cachan ou L'Haÿ-les-Roses depuis Bourg-la-Reine ?", a: "Oui, ces communes sont voisines et au tarif de la petite couronne." },
      { q: "Peut-on prévoir des passages réguliers ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "fontenay-aux-roses": {
    cases: [
      { title: "Du matériel pour un laboratoire du CEA", body: "Un laboratoire attend un consommable d'un fournisseur parisien. Le destinataire est prévenu de l'arrivée, le colis est remis à l'accueil contre signature." },
      { title: "Un dossier pour la mairie", body: "Une association dépose un dossier de demande de salle à la mairie avant l'échéance. La remise est horodatée." },
      { title: "Une commande d'un commerçant", body: "Un commerçant de proximité expédie une commande urgente à un client de Bagneux. Le trajet est de quelques minutes." },
    ],
    tips: [
      "Le site du CEA est à accès contrôlé : prévenez le destinataire, donnez le bâtiment.",
      "Le centre-ville est calme mais ses rues sont étroites : numéro précis recommandé.",
      "Pour Bagneux et Châtenay-Malabry, les courses sont très courtes.",
      "Les trajets vers Paris passent par la RD920 : planifiez avec une marge.",
    ],
    faq: [
      { q: "Livrez-vous au parc Sainte-Barbe ?", a: "Oui, à l'entrée indiquée, avec un contact." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu de la remise." },
    ],
  },

  "le-plessis-robinson": {
    cases: [
      { title: "Un prélèvement depuis Marie-Lannelongue", body: "Un service de l'hôpital envoie un échantillon vers un laboratoire de Paris. Le contenant est isotherme et le départ fixé par le délai de stabilité." },
      { title: "Un document pour un siège local", body: "Une entreprise du Plessis-Robinson doit faire signer un contrat à un client de Clamart. La course est brève, la remise signée." },
      { title: "Un colis pour un résident de la cité-jardin", body: "Un particulier professionnel installé dans la cité-jardin attend des échantillons. La remise se fait au numéro indiqué, avec contact." },
    ],
    tips: [
      "Le centre de la cité-jardin est piéton à certaines heures : indiquez le point de remise.",
      "Pour l'hôpital, donnez le service, l'étage et un contact.",
      "Le tramway T10 est un repère utile pour situer l'adresse.",
      "Les trajets vers Paris sont plus longs qu'en proche couronne : planifiez avec une marge.",
    ],
    faq: [
      { q: "Livrez-vous à Châtenay-Malabry depuis Le Plessis-Robinson ?", a: "Oui, les deux communes sont voisines." },
      { q: "Quel est le délai pour un prélèvement vers Paris ?", a: "Nous confirmons la faisabilité avant le départ, selon le délai de stabilité et l'heure." },
    ],
  },

  "la-garenne-colombes": {
    cases: [
      { title: "Une remise dans une tour de La Défense", body: "Une PME de La Garenne-Colombes remet un contrat à un client d'une tour. Le coursier se présente à l'accueil avec le nom du destinataire." },
      { title: "Un colis pour un commerçant du centre", body: "Un commerçant reçoit un réassort d'un grossiste parisien. La course dédiée évite l'attente d'un camion de tournée." },
      { title: "Un pli du cabinet à l'université", body: "Un cabinet d'expertise envoie un rapport à un service de l'université Paris Nanterre. La remise est signée." },
    ],
    tips: [
      "Les rues du centre sont étroites : indiquez un numéro précis.",
      "Pour La Défense, donnez la tour et l'accueil.",
      "Les voies vers Courbevoie se chargent le matin : prévoyez une marge.",
      "Pour un colis lourd, appelez-nous avant : le top-case est limité à 18 kg.",
    ],
    faq: [
      { q: "Quel est le délai vers La Défense ?", a: "Les deux sont proches : la course est brève. Le délai exact est annoncé à la confirmation." },
      { q: "Peut-on prévoir un passage quotidien ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },
};
