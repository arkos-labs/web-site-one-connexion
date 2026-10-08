/**
 * lib/zones/paris-local.ts
 * Contenu propre à chaque arrondissement : guide local + FAQ.
 * Règle éditoriale : aucune phrase ne doit se retrouver d'un arrondissement à
 * l'autre. Chaque entrée s'appuie sur les institutions et lieux réels de
 * l'arrondissement ; pas de chiffre ni de promesse hors de ce que le site
 * affirme déjà (enlèvement < 45 min, 7j/7 7h–23h, tarifs de /tarifs).
 */
import type { ZoneFaqItem, ZoneGuide } from "./types";

export const PARIS_LOCAL: Record<string, { localGuide: ZoneGuide; faq: ZoneFaqItem[] }> = {
  "paris-1er": {
    localGuide: {
      title: "Livrer autour du Palais-Royal : un arrondissement d'institutions",
      paragraphs: [
        "Le 1er arrondissement concentre des institutions que l'on ne dessert pas comme un immeuble de bureaux : le Conseil d'État et le Conseil constitutionnel autour du Palais-Royal, le ministère de la Justice place Vendôme, le ministère de la Culture rue de Valois, le Louvre. Chacun a son accueil, ses horaires et ses règles d'entrée.",
        "Pour une remise réussie, donnez-nous le nom du destinataire, le service et un numéro joignable : le coursier se présente à l'accueil avec ces éléments et obtient une signature nominative. Les rues piétonnes des Halles et la rue de Rivoli, très encombrées en journée, se traversent plus vite en deux-roues qu'en camionnette.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer au Palais-Royal ou place Vendôme ?", a: "Oui. Ces adresses ont des accueils contrôlés : indiquez le nom du destinataire, le service et un contact, le coursier remet le pli à l'accueil contre signature nominative." },
      { q: "Quel coursier choisir pour déposer un pli dans le 1er avant la fermeture d'un service ?", a: "Une course immédiate, avec l'heure limite précisée à la commande. Nous confirmons la faisabilité avant d'engager le coursier, plutôt que d'accepter puis d'échouer." },
      { q: "Les rues piétonnes des Halles posent-elles un problème ?", a: "Pas pour un deux-roues, qui s'arrête à la limite de la zone piétonne. Pour une adresse au cœur du quartier, précisez le point de remise et un contact qui descend récupérer le colis." },
    ],
  },

  "paris-2e": {
    localGuide: {
      title: "Livrer dans le Sentier : cours, passages et digicodes",
      paragraphs: [
        "Le 2e est le plus petit arrondissement après le 1er, et l'un des plus denses. Les adresses se cachent souvent dans des cours intérieures et des passages couverts, comme la galerie Vivienne ou le passage du Grand-Cerf, avec un interphone à chaque porte. Les showrooms et ateliers du Sentier s'y mêlent aux sièges d'entreprises autour de la Bourse et de la bibliothèque Richelieu.",
        "Beaucoup de courses y sont des échanges entre showrooms, ateliers de confection et clients : échantillons, patrons, tissus, retouches. Indiquez l'étage, le code d'accès et un contact, et précisez si le colis est fragile ou à plat : nous choisissons la conduite et le top-case en conséquence.",
      ],
    },
    faq: [
      { q: "Livrez-vous des échantillons de tissu et des vêtements dans le Sentier ?", a: "Oui, pour des pièces légères qui tiennent dans un top-case verrouillé et étanche, jusqu'à 18 kg. Pour une série plus volumineuse, appelez-nous avant de commander." },
      { q: "Comment gérer les adresses en cour intérieure ?", a: "Communiquez le code, l'étage et un contact joignable. Le coursier ne perd pas de temps à chercher l'entrée dans les passages couverts, et la remise est horodatée." },
      { q: "Faites-vous des navettes régulières entre un showroom du 2e et des boutiques ?", a: "Oui, en tournées sur créneaux fixes dans le cadre d'un compte entreprise, avec une facturation mensuelle unique." },
    ],
  },

  "paris-3e": {
    localGuide: {
      title: "Haut Marais : galeries, archives et ruelles médiévales",
      paragraphs: [
        "Le 3e rassemble les galeries du Haut Marais, les Archives nationales (hôtel de Soubise), le musée Picasso (hôtel Salé), le Carreau du Temple et le Conservatoire national des arts et métiers. Ce sont des adresses de culture, de design et de recherche, souvent dans des hôtels particuliers dont l'entrée n'est pas sur la rue principale.",
        "Les ruelles du quartier, dont certaines remontent au Moyen Âge, sont étroites et à sens unique. Le deux-roues s'y glisse là où un utilitaire tourne en rond. Pour les œuvres, tirages et maquettes d'une galerie, précisez les dimensions et le conditionnement : nous vérifions que le colis tient dans le top-case avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Pouvez-vous transporter des tirages ou des œuvres légères d'une galerie du Marais ?", a: "Oui, si le colis est protégé et tient dans un top-case de 18 kg maximum. Pour un format plus grand, dites-nous les dimensions à la commande et nous vous répondons avant de vous envoyer un coursier." },
      { q: "Livrez-vous aux Archives nationales ou au CNAM ?", a: "Oui, comme pour toute institution : indiquez l'entrée et le service destinataire, car les accès diffèrent selon les bâtiments." },
      { q: "Intervenez-vous le soir et le week-end dans le 3e ?", a: "Oui, 7j/7 de 7h à 23h, sous réserve de disponibilité à la commande. Le week-end, le Marais est très fréquenté : prévoyez un contact pour la remise." },
    ],
  },

  "paris-4e": {
    localGuide: {
      title: "Île de la Cité et Hôtel de Ville : le 4e administratif",
      paragraphs: [
        "Le 4e arrondissement réunit sur l'Île de la Cité la préfecture de police, le tribunal de commerce de Paris et l'Hôtel-Dieu, puis sur la rive droite l'Hôtel de Ville et le Centre Pompidou. Des pièces de procédure, des actes de société et des documents administratifs y circulent chaque jour entre quelques centaines de mètres.",
        "Les accès autour de Notre-Dame et du parvis changent selon les périodes de travaux et les événements. Prévenez-nous de l'entrée à utiliser, le coursier se présente avec le nom du destinataire. Pour le tribunal de commerce, indiquez l'heure limite de dépôt au greffe : c'est elle qui fixe l'heure de départ de la course.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un document au tribunal de commerce de Paris ?", a: "Oui. Indiquez l'heure limite de dépôt au greffe et le nom du destinataire ; la remise est horodatée et nominative, avec un justificatif que vous pouvez annexer au dossier." },
      { q: "Livrez-vous sur l'Île Saint-Louis et à l'Hôtel de Ville ?", a: "Oui. Sur l'Île Saint-Louis, les rues sont étroites : un numéro précis et un contact évitent de chercher l'entrée. À l'Hôtel de Ville, précisez le service destinataire." },
      { q: "Le 4e est-il facile d'accès pour un coursier en période d'affluence ?", a: "Le deux-roues contourne la congestion qui bloque les utilitaires autour du Châtelet et du pont d'Arcole. Pour un événement majeur, prévenez-nous d'une éventuelle fermeture de voie." },
    ],
  },

  "paris-5e": {
    localGuide: {
      title: "Quartier Latin : de la Sorbonne aux laboratoires de recherche",
      paragraphs: [
        "Le 5e abrite la Sorbonne, le Collège de France, l'École normale supérieure de la rue d'Ulm, l'Institut Curie, le Muséum national d'histoire naturelle et de nombreuses maisons d'édition. Les échanges y sont académiques et scientifiques : manuscrits, épreuves, prélèvements, pièces de laboratoire.",
        "La montagne Sainte-Geneviève est une côte, et le Quartier Latin un lacis de rues à sens unique. Pour les échantillons, indiquez le délai de stabilité et la température de conservation : nous confirmons la faisabilité avant d'engager la course. Pour les épreuves d'imprimerie, la remise se fait en main propre, avec signature.",
      ],
    },
    faq: [
      { q: "Transportez-vous des échantillons entre laboratoires du Quartier Latin ?", a: "Oui, en course dédiée avec un contenant isotherme choisi à la commande. Précisez le délai de stabilité fixé par le laboratoire : nous vous disons avant le départ si la course est tenable." },
      { q: "Livrez-vous des manuscrits et des épreuves à des éditeurs ?", a: "Oui. La remise est contre signature, avec le nom du réceptionnaire et l'heure consignés, ce qui évite les contestations de livraison." },
      { q: "Peut-on prévoir des passages réguliers entre deux sites universitaires ?", a: "Oui, par tournées sur créneaux fixes, avec un compte entreprise et une facturation mensuelle imputable par laboratoire ou département." },
    ],
  },

  "paris-6e": {
    localGuide: {
      title: "Saint-Germain-des-Prés : éditeurs, galeries et Sénat",
      paragraphs: [
        "Le 6e arrondissement s'organise autour du Sénat et du jardin du Luxembourg, de Saint-Germain-des-Prés et de la rue de Seine. On y trouve des maisons d'édition, des galeries d'art, des antiquaires, l'Académie nationale de médecine et l'École des Beaux-Arts, ainsi que des cabinets d'avocats.",
        "L'essentiel des envois y est précieux ou confidentiel : épreuves, tableaux de petit format, bijoux, contrats. La remise se fait en main propre, avec signature. Nous ne regroupons pas les courses : un coursier, un envoi, un trajet. Précisez le conditionnement et la valeur à la commande pour que nous confirmions que le deux-roues convient.",
      ],
    },
    faq: [
      { q: "Pouvez-vous transporter une œuvre ou un objet de valeur depuis une galerie du 6e ?", a: "Pour un objet qui tient dans un top-case verrouillé de 18 kg, oui. Pour une pièce plus grande ou à forte valeur, contactez-nous avant de commander : nous vous disons si le deux-roues est adapté." },
      { q: "La remise se fait-elle en main propre ?", a: "Oui, contre signature, avec le nom du réceptionnaire et l'heure consignés. Le colis n'est jamais laissé à un tiers non identifié." },
      { q: "Livrez-vous autour du Sénat et de l'Institut ?", a: "Oui. Ces sites ont des contrôles d'accès : donnez le nom du destinataire, le service et un contact, pour que le coursier soit attendu." },
    ],
  },

  "paris-7e": {
    localGuide: {
      title: "Le 7e institutionnel : ministères, Assemblée et ambassades",
      paragraphs: [
        "Le 7e arrondissement est celui de l'Assemblée nationale, de l'hôtel de Matignon, des ministères de la rue de Varenne et du Quai d'Orsay, des Invalides et d'un grand nombre d'ambassades. Les entrées y sont contrôlées, souvent avec contrôle d'identité et liste d'accès.",
        "Pour livrer ici sans retard, fournissez le nom du destinataire, son service, un numéro direct et, si nécessaire, le nom de la personne qui annoncera le coursier. Nous ne promettons pas l'entrée dans un bâtiment : nous organisons la remise à l'accueil, contre signature, avec l'heure consignée. Tour Eiffel et Champ-de-Mars sont, eux, de simples contraintes de circulation les jours d'événement.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux ministères et à l'Assemblée nationale ?", a: "Oui, à l'accueil désigné. Prévenez le destinataire de l'arrivée du coursier et donnez-nous un contact : l'accès aux bâtiments dépend des règles de chaque site." },
      { q: "Et pour une ambassade ?", a: "Même principe : nom du destinataire, service et contact. La remise se fait au point d'accueil indiqué, contre signature nominative." },
      { q: "Les jours d'événements autour des Invalides ou de la tour Eiffel, comment procédez-vous ?", a: "Prévenez-nous de l'événement lors de la commande. Nous adaptons l'itinéraire et vous confirmons le délai avant d'engager la course." },
    ],
  },

  "paris-8e": {
    localGuide: {
      title: "Champs-Élysées et Triangle d'Or : cabinets, banques et palaces",
      paragraphs: [
        "Le 8e arrondissement rassemble le Palais de l'Élysée, la Madeleine, la gare Saint-Lazare, le parc Monceau et les avenues du Triangle d'Or. Les immeubles haussmanniens y logent des cabinets d'avocats d'affaires, des banques, des sociétés de gestion et des hôtels de luxe.",
        "La plupart des remises s'y font à une loge ou à un accueil : contrats à signer, pièces de closing, courrier de direction. Donnez-nous le nom du destinataire, l'étage et l'heure limite. Pour un client d'hôtel, précisez le nom de séjour et le numéro de chambre ou demandez une remise à la conciergerie, en indiquant votre consigne.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer des documents de closing à un cabinet du 8e ?", a: "Oui, en course dédiée avec remise contre signature. Indiquez l'heure à laquelle le document doit être signé : elle fixe l'heure de départ." },
      { q: "Livrez-vous dans les hôtels de luxe ?", a: "Oui. Précisez le nom du client et le mode de remise voulu (en chambre ou à la conciergerie) : le coursier suit votre consigne." },
      { q: "Les Champs-Élysées ralentissent-ils la livraison ?", a: "Le trafic autour de l'Étoile et de la Concorde est dense, ce qui avantage le deux-roues. Les jours de manifestation, nous vous prévenons si l'itinéraire est modifié." },
    ],
  },

  "paris-9e": {
    localGuide: {
      title: "Opéra, Drouot et grands magasins : le 9e commerçant",
      paragraphs: [
        "Le 9e arrondissement se structure autour de l'Opéra Garnier, des Grands Boulevards et de la rue Drouot, où se tient l'hôtel des ventes. S'y ajoutent les grands magasins du boulevard Haussmann, des sièges de sociétés de services et des cabinets de profession libérale du quartier Saint-Georges.",
        "Les ventes aux enchères et les magasins génèrent des flux particuliers : lots à livrer avant une vente, retours de marchandise, échanges entre magasins et clients. Précisez le jour de la vente ou l'heure de fermeture de la boutique : c'est le point d'arrivée qui commande l'heure de départ du coursier.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer un lot à l'hôtel des ventes avant une vente ?", a: "Oui. Indiquez l'heure limite de dépôt et les consignes de la salle ; la remise est horodatée avec le nom du réceptionnaire." },
      { q: "Faites-vous les retours express pour un magasin du 9e ?", a: "Oui, à la course ou en tournée sur créneaux fixes avec un compte entreprise. L'objet voyage seul, sans regroupement avec d'autres colis." },
      { q: "Quelles sont les contraintes du boulevard Haussmann pour un coursier ?", a: "Le trafic et les livraisons des grands magasins saturent la voirie aux heures de pointe. Le deux-roues garde son avantage de délai, surtout en fin d'après-midi." },
    ],
  },

  "paris-10e": {
    localGuide: {
      title: "Gares du Nord et de l'Est : tenir l'heure du train",
      paragraphs: [
        "Le 10e arrondissement est un nœud ferroviaire : la gare du Nord et la gare de l'Est y sont voisines, avec les liaisons internationales. Le canal Saint-Martin et la place de la République attirent agences, studios et entreprises de la création. Trois hôpitaux, Lariboisière, Saint-Louis et Fernand-Widal, y forment un pôle de santé.",
        "Les courses y obéissent souvent à un horaire fixe : un document à remettre avant le départ d'un train, un prélèvement attendu avant la fermeture d'un laboratoire. Précisez l'heure limite à la commande. Pour les échantillons, ajoutez le délai de stabilité : nous confirmons la faisabilité avant l'enlèvement.",
      ],
    },
    faq: [
      { q: "Pouvez-vous remettre un colis à un voyageur avant son train ?", a: "Si l'heure et le point de remise sont clairs (gare, quai ou parvis, contact), oui. Nous confirmons la faisabilité avant d'envoyer le coursier." },
      { q: "Transportez-vous des prélèvements autour de Lariboisière ou Saint-Louis ?", a: "Oui, en course dédiée avec contenant isotherme sur demande. Précisez le délai de stabilité et la température fixés par le laboratoire destinataire." },
      { q: "Les travaux autour des gares retardent-ils les courses ?", a: "Le quartier est congestionné ; le deux-roues le traverse plus vite. Nous vous annonçons le délai réaliste à la confirmation de la commande." },
    ],
  },

  "paris-11e": {
    localGuide: {
      title: "Faubourg Saint-Antoine, Oberkampf et Bastille : ateliers et petites séries",
      paragraphs: [
        "Le 11e est l'arrondissement de l'artisanat et des petites entreprises : le faubourg Saint-Antoine, historique pour l'ébénisterie, les ateliers de la rue de la Roquette, les imprimeurs, les créateurs, mais aussi les start-ups et espaces de coworking d'Oberkampf et de République.",
        "Les envois y sont des petites séries : prototypes, épreuves, pièces détachées, échantillons de designers. Ils changent souvent d'adresse en cours de journée, entre un atelier du faubourg et un client du 8e. Indiquez le contenu, le poids et l'heure de remise : nous vous disons si le top-case de 18 kg convient.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prototypes ou des pièces entre ateliers ?", a: "Oui, pour des pièces qui tiennent dans un top-case verrouillé de 18 kg. Au-delà, contactez-nous avant de commander." },
      { q: "Peut-on organiser des tournées régulières entre un atelier du 11e et des boutiques ?", a: "Oui : tournées sur créneaux fixes, facturées mensuellement dans le cadre d'un compte entreprise." },
      { q: "Livrez-vous à Bastille et à Nation le soir ?", a: "Oui, jusqu'à 23h, 7j/7, sous réserve de disponibilité à la commande." },
    ],
  },

  "paris-12e": {
    localGuide: {
      title: "Bercy, Gare de Lyon et bois de Vincennes : le 12e, voisin de notre siège",
      paragraphs: [
        "Le 12e arrondissement s'étend de la Gare de Lyon et de Bercy, avec le ministère de l'Économie et des Finances et l'Accor Arena, jusqu'au bois de Vincennes. L'hôpital Saint-Antoine et les Quinze-Vingts y forment un pôle de soins, et le quartier d'Aligre un tissu de commerces.",
        "Le 12e est limitrophe de Saint-Mandé, la ville de notre siège : les courses au départ ou à destination de l'est parisien sont parmi les plus courtes de notre réseau. Pour les trains, précisez la gare, l'horaire et le point de rendez-vous ; pour les institutions de Bercy, le nom du destinataire et le bâtiment.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux ministères de Bercy ?", a: "Oui, à l'accueil désigné. Indiquez le nom du destinataire, le bâtiment et un contact : l'accès dépend des règles du site." },
      { q: "Pouvez-vous déposer un colis à la Gare de Lyon avant un départ ?", a: "Oui, si le point et l'heure de remise sont clairs. Nous confirmons la faisabilité avant l'enlèvement." },
      { q: "Le 12e est-il plus rapide à servir que les autres arrondissements ?", a: "Il est voisin de notre siège de Saint-Mandé : l'approche est courte, donc l'enlèvement souvent plus rapide que le maximum annoncé de 45 minutes." },
    ],
  },

  "paris-13e": {
    localGuide: {
      title: "Station F, Pitié-Salpêtrière et BnF : le 13e entre tech et santé",
      paragraphs: [
        "Le 13e arrondissement associe l'un des plus grands campus de start-ups du monde, Station F, l'hôpital de la Pitié-Salpêtrière, la Bibliothèque nationale de France et le quartier des Gobelins. Le matériel électronique et les prélèvements médicaux y voisinent avec les commerces de l'avenue d'Ivry.",
        "Deux types d'envois dominent. Côté tech : ordinateurs, cartes, prototypes et petits équipements à remettre à une équipe pressée. Côté santé : prélèvements et pièces à acheminer avant une échéance de stabilité. Les deux demandent des informations claires à la commande : le contenu, l'heure de remise et la contrainte éventuelle de température.",
      ],
    },
    faq: [
      { q: "Livrez-vous du matériel informatique à une start-up de Station F ?", a: "Oui, pour du matériel qui tient dans un top-case de 18 kg. Précisez le nom de l'équipe et un contact : les accès au campus sont contrôlés." },
      { q: "Transportez-vous des prélèvements autour de la Pitié-Salpêtrière ?", a: "Oui, en course dédiée, avec un contenant isotherme choisi à la commande. Le délai de stabilité fixé par le laboratoire commande l'organisation de la course." },
      { q: "Desservez-vous la BnF et le quartier Tolbiac ?", a: "Oui, comme le reste du 13e. L'avenue de France et les quais de Seine permettent des liaisons directes avec le centre." },
    ],
  },

  "paris-14e": {
    localGuide: {
      title: "Montparnasse, Cochin et Cité universitaire : le 14e en trois pôles",
      paragraphs: [
        "Le 14e arrondissement tourne autour de trois ensembles : le pôle de Montparnasse avec sa gare et sa tour, un pôle hospitalier (Cochin, Sainte-Anne, l'Institut mutualiste Montsouris), et la Cité internationale universitaire avec l'Observatoire de Paris. La Fondation Cartier et les ateliers du quartier de l'Ouest s'y ajoutent.",
        "La gare Montparnasse dessert l'ouest de la France : beaucoup de colis y arrivent ou en partent. Précisez le train, le quai ou le point de remise. Pour les hôpitaux, donnez le service destinataire et l'heure limite. Pour la Cité universitaire, indiquez le bâtiment : chaque maison a son accueil.",
      ],
    },
    faq: [
      { q: "Pouvez-vous récupérer un colis à la gare Montparnasse ?", a: "Oui, si le point de rendez-vous et l'heure sont précisés. Nous confirmons le délai avant d'engager la course." },
      { q: "Transportez-vous des documents ou des échantillons vers Cochin ou Sainte-Anne ?", a: "Oui, en course dédiée. Indiquez le service destinataire et, pour un échantillon, le délai de stabilité." },
      { q: "Livrez-vous à la Cité internationale universitaire ?", a: "Oui. Précisez la maison ou le bâtiment : l'accueil diffère d'une résidence à l'autre." },
    ],
  },

  "paris-15e": {
    localGuide: {
      title: "Pasteur, Necker, Balard et Porte de Versailles : un 15e très varié",
      paragraphs: [
        "Le 15e arrondissement est le plus peuplé de Paris et très diversifié : l'Institut Pasteur, les hôpitaux Necker et Georges-Pompidou, le ministère des Armées à Balard, le siège de France Télévisions, les tours de Beaugrenelle et le Parc des expositions de la Porte de Versailles.",
        "Cela donne des envois très différents dans le même arrondissement : échantillons de recherche, documents pour un plateau de télévision, matériel de stand pour un salon. Lors d'un salon, la remise se fait au quai de livraison ou à l'accueil exposants : donnez-nous le hall, le stand et le contact exposant.",
      ],
    },
    faq: [
      { q: "Livrez-vous du matériel sur un salon de la Porte de Versailles ?", a: "Oui, pour du matériel léger. Indiquez le hall, le numéro de stand et un contact exposant ; les accès sont contrôlés pendant les salons." },
      { q: "Transportez-vous des échantillons vers l'Institut Pasteur ou l'hôpital Necker ?", a: "Oui, en course dédiée avec contenant isotherme sur demande. Le délai de stabilité fixé par le laboratoire détermine la faisabilité." },
      { q: "Pouvez-vous livrer un document sur un plateau de télévision ?", a: "Oui, avec un nom de destinataire et un contact : les accès aux sites audiovisuels sont réservés." },
    ],
  },

  "paris-16e": {
    localGuide: {
      title: "Trocadéro, Auteuil et Passy : ambassades, sport et Radio France",
      paragraphs: [
        "Le 16e arrondissement combine des quartiers résidentiels haut de gamme, des ambassades, la Maison de la Radio et de la Musique, le Palais de Tokyo, le musée Guimet, et de grands sites sportifs : Roland-Garros et le Parc des Princes. La Fondation Louis Vuitton se trouve au bois de Boulogne.",
        "Les jours de match ou de tournoi, les accès aux stades sont réglementés et la circulation change. Prévenez-nous de l'événement à la commande, nous adaptons l'itinéraire et confirmons le délai. Pour une résidence ou une ambassade, donnez le nom du destinataire et un contact : le gardien ne reçoit pas toujours sans annonce.",
      ],
    },
    faq: [
      { q: "Livrez-vous les jours de Roland-Garros ou de match au Parc des Princes ?", a: "Oui, en prévenant de l'événement : les accès sont limités. Nous adaptons l'itinéraire et vous confirmons le délai avant le départ." },
      { q: "Pouvez-vous remettre un pli à une ambassade du 16e ?", a: "Oui, à l'accueil désigné, contre signature nominative. Prévenez le destinataire de l'arrivée du coursier." },
      { q: "Desservez-vous le bois de Boulogne et la Fondation Louis Vuitton ?", a: "Oui. Indiquez le point de remise exact et un contact sur place, car le bois est vaste et les entrées sont multiples." },
    ],
  },

  "paris-17e": {
    localGuide: {
      title: "Tribunal de Paris aux Batignolles : les dépôts avant clôture",
      paragraphs: [
        "Depuis son installation aux Batignolles, le tribunal judiciaire de Paris est la grande adresse du 17e arrondissement. Autour, le quartier Wagram, la place des Ternes et le Palais des Congrès de la Porte Maillot accueillent cabinets d'avocats, sièges de sociétés et événements professionnels.",
        "Les courses vers le tribunal ont une particularité : l'heure limite de dépôt est fixée par le service qui reçoit le document, pas par vous. Indiquez-la à la commande, avec le service et la référence du dossier. Nous confirmons la faisabilité avant d'engager le coursier, puis nous vous transmettons le justificatif horodaté, à annexer au dossier.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer des conclusions au tribunal de Paris ?", a: "Oui. Précisez le service, la référence du dossier et l'heure limite ; la remise est horodatée et nominative, avec un justificatif à annexer au dossier." },
      { q: "Livrez-vous au Palais des Congrès et à la Porte Maillot ?", a: "Oui. Pour un salon ou un congrès, donnez le hall, le stand ou le service destinataire et un contact." },
      { q: "Peut-on organiser une navette quotidienne entre un cabinet du 17e et le tribunal ?", a: "Oui, par tournées sur créneaux fixes avec un compte entreprise, facturation mensuelle unique et imputation par dossier." },
    ],
  },

  "paris-18e": {
    localGuide: {
      title: "La butte Montmartre et la Porte de la Chapelle : un relief à connaître",
      paragraphs: [
        "Le 18e arrondissement est celui de la butte Montmartre, du Sacré-Cœur, de Pigalle et de la Chapelle, avec l'hôpital Bichat-Claude-Bernard au nord. Les escaliers, les rues pavées et les sens uniques de la butte, et le trafic de la Porte de la Chapelle, font de ce quartier l'un des plus contraignants pour une camionnette.",
        "Un coursier en deux-roues y gagne du temps, mais l'adresse reste décisive : sur la butte, certaines rues sont des escaliers ou des impasses piétonnes. Indiquez le numéro, le code et la rue la plus proche accessible en moto. Pour les envois vers l'hôpital Bichat, précisez le service et l'heure limite.",
      ],
    },
    faq: [
      { q: "Livrez-vous au sommet de la butte Montmartre ?", a: "Oui, jusqu'au point accessible à moto. Si l'adresse est en escalier, indiquez la rue la plus proche et un contact qui vient récupérer le colis." },
      { q: "Transportez-vous des documents ou des échantillons vers Bichat ?", a: "Oui, en course dédiée. Précisez le service destinataire, l'heure limite et, pour un échantillon, la température de conservation." },
      { q: "Intervenez-vous à Pigalle le soir ?", a: "Oui, jusqu'à 23h, 7j/7, sous réserve de disponibilité à la commande." },
    ],
  },

  "paris-19e": {
    localGuide: {
      title: "La Villette, canal de l'Ourcq et Robert-Debré : événements et pédiatrie",
      paragraphs: [
        "Le 19e arrondissement est celui du parc de la Villette, avec la Cité des sciences, la Philharmonie de Paris et le Zénith, des Buttes-Chaumont, du canal de l'Ourcq et de l'hôpital Robert-Debré, centre pédiatrique de référence. Il offre des axes dégagés vers le périphérique de la Porte de Pantin.",
        "Deux sortes de courses s'y croisent : des livraisons pour les salles de spectacle et les expositions (accessoires, documents, matériel léger), et des envois médicaux vers l'hôpital. Pour une salle, donnez le nom de la régie et l'heure de la répétition ou du spectacle ; pour l'hôpital, le service et le délai attendu.",
      ],
    },
    faq: [
      { q: "Livrez-vous du matériel léger à la régie d'une salle de spectacle ?", a: "Oui. Précisez le nom de la régie, l'entrée de service et l'heure de remise : les accès aux artistes et aux coulisses sont réservés." },
      { q: "Pouvez-vous transporter des prélèvements vers Robert-Debré ?", a: "Oui, en course dédiée avec contenant isotherme sur demande. Le délai de stabilité et le service destinataire sont à préciser à la commande." },
      { q: "Le 19e est-il bien relié aux communes de l'Est ?", a: "Oui : la Porte de Pantin et la Porte de la Villette donnent accès à Pantin, Bobigny et au nord de la Seine-Saint-Denis." },
    ],
  },

  "paris-20e": {
    localGuide: {
      title: "Belleville, Gambetta et la Porte de Bagnolet : le 20e en relief",
      paragraphs: [
        "Le 20e arrondissement est un quartier de collines : Belleville, Ménilmontant et le Père-Lachaise. On y trouve des ateliers d'artistes, des pépinières d'entreprises, des associations, l'hôpital Tenon et la mairie à Gambetta. À l'est, la Porte de Bagnolet ouvre sur Bagnolet et Montreuil.",
        "Les pentes de Belleville imposent des itinéraires précis et un stationnement difficile pour les véhicules : le deux-roues reste le plus rapide. Pour les envois vers l'hôpital Tenon, précisez le service et l'heure limite. Pour un atelier, indiquez l'étage et le code de la cour.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux ateliers d'artistes de Belleville ?", a: "Oui, en précisant l'étage, le code de la cour et un contact. La remise est horodatée avec le nom du réceptionnaire." },
      { q: "Pouvez-vous transporter des documents vers l'hôpital Tenon ?", a: "Oui, en course dédiée, avec le service destinataire et l'heure limite indiqués à la commande." },
      { q: "Desservez-vous Bagnolet et Montreuil depuis le 20e ?", a: "Oui, la Porte de Bagnolet les relie directement. Ces trajets suivent la grille de la petite couronne." },
    ],
  },
};
