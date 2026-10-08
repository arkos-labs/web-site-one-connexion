/**
 * lib/zones/local-94.ts
 * Contenu propre aux communes du Val-de-Marne (Vincennes et Saint-Mandé sont dans data-94).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_94: Record<string, LocalZoneContent> = {
  "vitry-sur-seine": {
    landmarks: ["MAC VAL", "Zone industrielle des Ardoines", "RER C Vitry-sur-Seine", "Tramway T9", "Seine", "Paris 13e (proche)"],
    intro: "Vitry-sur-Seine est la plus grande commune du Val-de-Marne par sa superficie. Elle mêle une ancienne zone industrielle en bord de Seine, en cours de transformation, un musée d'art contemporain, le MAC VAL, et de vastes quartiers résidentiels.",
    logisticsContext: "Les Ardoines, au bord de la Seine, sont à plusieurs kilomètres du centre, de l'autre côté de la voie ferrée. Le tramway T9 et le RER C desservent la commune. Le coursier distingue les deux pôles dès la commande : centre-ville ou bord de Seine.",
    keyClients: ["MAC VAL", "Zone industrielle des Ardoines", "PME industrielles", "Commerces du centre"],
    localGuide: {
      title: "Vitry-sur-Seine : un centre-ville et une zone industrielle à plusieurs kilomètres",
      paragraphs: [
        "À Vitry, la première question à poser est : centre ou Ardoines ? Les deux pôles sont séparés par la voie ferrée et par plusieurs minutes de trajet. Indiquez-le à la commande, avec le nom de la société et l'entrée, pour fixer un délai réaliste.",
        "Le MAC VAL reçoit des œuvres, des documents et du matériel d'exposition. Pour un envoi destiné au musée, donnez le service, les dimensions et le mode de remise. Les entreprises industrielles des Ardoines envoient surtout des pièces de rechange et des documents de livraison.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans la zone industrielle des Ardoines ?", a: "Oui. Donnez le nom de la société, l'entrée et un contact au quai." },
      { q: "Pouvez-vous transporter des pièces d'exposition légères pour le MAC VAL ?", a: "Pour des pièces qui tiennent dans un top-case de 18 kg, oui. Au-delà, appelez-nous avant." },
      { q: "Quel tarif à Vitry-sur-Seine ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  alfortville: {
    landmarks: ["Confluence Seine-Marne", "Gare du Vert de Maisons (proche)", "Maisons-Alfort (limite)", "A86", "Seine", "Ivry-sur-Seine (face)"],
    intro: "Alfortville est une commune très dense, bâtie sur la pointe formée par la Seine et la Marne. Elle fait face à Ivry-sur-Seine et touche Maisons-Alfort, Créteil et Vitry.",
    logisticsContext: "La situation au confluent limite les ponts et les voies de passage : la ville est une presqu'île urbaine, accessible par un nombre restreint de ponts. Le coursier choisit son itinéraire en fonction de l'heure, car les ponts se chargent rapidement.",
    keyClients: ["Commerces de proximité", "PME de services", "Professions libérales", "Entreprises du bord de Seine"],
    localGuide: {
      title: "Alfortville : une presqu'île entre Seine et Marne",
      paragraphs: [
        "La géographie d'Alfortville influe sur chaque course : les accès se font par peu de ponts, et un bouchon sur l'un d'eux rallonge le trajet. Indiquez l'heure à laquelle le colis doit arriver, nous planifions le départ en tenant compte du trafic habituel.",
        "Les entreprises locales sont des commerces, des cabinets et des PME de services. Elles envoient des documents, des plis et des petits colis vers Paris et Créteil. Pour les échanges quotidiens, une tournée sur créneaux fixes est possible avec un compte entreprise.",
      ],
    },
    faq: [
      { q: "Les ponts d'Alfortville ralentissent-ils les courses ?", a: "Ils concentrent le trafic aux heures de pointe. Nous planifions le départ en conséquence et annonçons un délai réaliste." },
      { q: "Faites-vous des tournées régulières depuis Alfortville ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif à Alfortville ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "maisons-alfort": {
    landmarks: ["École nationale vétérinaire d'Alfort", "ANSES", "Métro ligne 8", "RER D Maisons-Alfort - Alfortville", "Marne", "A86"],
    intro: "Maisons-Alfort abrite l'École nationale vétérinaire d'Alfort et le siège de l'agence nationale de sécurité sanitaire. La ville est desservie par la ligne 8 du métro, ce qui la relie directement au centre de Paris.",
    logisticsContext: "La ligne 8 fait de Maisons-Alfort une commune proche de Paris 12e. L'école vétérinaire et les centres de recherche sanitaires occupent de grands campus avec accès contrôlés. Pour tout envoi, le nom du service est indispensable.",
    keyClients: ["École nationale vétérinaire d'Alfort", "ANSES", "Cliniques vétérinaires", "Professions libérales"],
    localGuide: {
      title: "Maisons-Alfort : vétérinaires et sécurité sanitaire",
      paragraphs: [
        "L'école vétérinaire, les cliniques et les laboratoires de santé animale échangent des prélèvements et des échantillons. Précisez le laboratoire destinataire, la contrainte de température et le délai de stabilité. Nous confirmons la faisabilité avant d'engager le coursier.",
        "Les grands campus d'enseignement et de recherche ont des portes et des horaires précis. Donnez le bâtiment, le service et un contact sur place. Pour des échanges réguliers entre laboratoires, une tournée à créneaux fixes est possible.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements vétérinaires ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande. Le délai de stabilité fixé par le laboratoire commande la faisabilité." },
      { q: "Livrez-vous à l'école vétérinaire d'Alfort ?", a: "Oui, avec le bâtiment, le service et un contact." },
      { q: "Quel tarif à Maisons-Alfort ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "charenton-le-pont": {
    landmarks: ["Paris 12e (limite)", "Métro Charenton - Écoles", "Bercy Village (proche)", "Marne", "A4", "Bois de Vincennes (proche)"],
    intro: "Charenton-le-Pont touche directement le 12e arrondissement et Bercy. La commune est desservie par la ligne 8 du métro, avec les stations Liberté et Charenton–Écoles, et abrite des bureaux, des commerces et un important centre commercial.",
    logisticsContext: "La frontière avec Paris 12e est une avenue : un colis traverse de Charenton à Bercy en quelques minutes. Les jours de grands événements à Bercy, la circulation est dense. Le deux-roues évite la congestion.",
    keyClients: ["Bureaux tertiaires", "Centre commercial", "Commerces du centre", "Professions libérales"],
    localGuide: {
      title: "Charenton-le-Pont : à une avenue de Bercy",
      paragraphs: [
        "Charenton est l'une des communes de petite couronne les plus proches du centre. Pour les cabinets et sociétés qui travaillent avec le 12e et le 13e, une course immédiate se compte en minutes. Précisez l'heure limite de remise et le service destinataire.",
        "Le centre commercial et les bureaux autour de la station Liberté sont des sites à accès contrôlé. Donnez le nom de l'enseigne ou de l'entreprise, l'étage et un contact. Le coursier se présente à l'accueil indiqué.",
      ],
    },
    faq: [
      { q: "Combien de temps pour relier Charenton à Bercy ?", a: "Les deux sont limitrophes : la course est très courte. Nous annonçons le délai exact à la confirmation." },
      { q: "Livrez-vous dans le centre commercial de Charenton ?", a: "Oui, avec l'enseigne, le lot et un contact. L'entrée de service est distincte de l'entrée publique." },
      { q: "Quel tarif à Charenton-le-Pont ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "saint-maurice": {
    landmarks: ["Hôpital national de Saint-Maurice", "Hôpital Esquirol", "Saint-Mandé (limite)", "Charenton-le-Pont (limite)", "Marne", "Bois de Vincennes"],
    intro: "Saint-Maurice est une petite commune entre la Marne et le bois de Vincennes, voisine de Saint-Mandé et de Charenton. Elle abrite l'hôpital national de Saint-Maurice et l'hôpital Esquirol, deux établissements de santé importants à l'échelle du département.",
    logisticsContext: "Les deux hôpitaux occupent de vastes domaines au bord du bois, avec plusieurs bâtiments et accueils. La ville est proche de Saint-Mandé, où se trouve notre siège : les courses y sont parmi les plus courtes de notre réseau.",
    keyClients: ["Hôpital national de Saint-Maurice", "Hôpital Esquirol", "Professions de santé", "Résidences"],
    localGuide: {
      title: "Saint-Maurice : deux hôpitaux en bordure du bois",
      paragraphs: [
        "Les hôpitaux de Saint-Maurice reçoivent des prélèvements, des dossiers et des pièces de rééducation. Donnez le nom du pavillon, le service et un contact : sur un domaine hospitalier, une adresse ne suffit pas pour que le coursier trouve le bon accueil.",
        "La proximité avec Saint-Mandé permet de répondre vite aux demandes urgentes. Pour un prélèvement, précisez la température de conservation et le délai de stabilité : nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux hôpitaux de Saint-Maurice ?", a: "Oui. Précisez le pavillon, le service et un contact." },
      { q: "Les courses depuis Saint-Maurice sont-elles plus rapides ?", a: "La ville est voisine de notre siège de Saint-Mandé : l'approche est courte et l'enlèvement souvent plus rapide que le maximum de 45 minutes." },
      { q: "Quel tarif à Saint-Maurice ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "joinville-le-pont": {
    landmarks: ["Bords de Marne", "Île Fanac", "RER A Joinville-le-Pont", "Ancien site des studios de Joinville", "Nogent-sur-Marne (limite)", "Bois de Vincennes (proche)"],
    intro: "Joinville-le-Pont s'étire en bord de Marne, entre le bois de Vincennes et Nogent-sur-Marne. La commune garde le souvenir de ses studios de cinéma historiques, et compte aujourd'hui des professions libérales, des agences et des commerces.",
    logisticsContext: "Le RER A relie Joinville à Paris et à La Défense. La Marne et la voie ferrée limitent les passages : peu de ponts, des rues en cul-de-sac sur les îles. Le coursier a besoin d'une adresse précise et d'un code d'accès pour les résidences.",
    keyClients: ["Professions libérales", "Agences", "Commerces du centre", "Résidences des bords de Marne"],
    localGuide: {
      title: "Joinville-le-Pont : les rives de la Marne et leurs îles",
      paragraphs: [
        "Les îles et les rives de Joinville ont des accès particuliers : ponts étroits, rues à sens unique, résidences fermées. Pour une remise sur l'île ou dans une résidence, donnez le nom de la résidence, le code et un contact joignable à l'arrivée.",
        "Les cabinets et agences de la commune envoient des plis et des documents. La remise en main propre est la règle, avec nom et heure consignés dans le justificatif. Pour les envois vers l'Est parisien, la route par le bois de Vincennes est rapide.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur les îles de Joinville ?", a: "Oui. Donnez l'adresse précise, le code et un contact." },
      { q: "Pouvez-vous remettre un pli en main propre à un cabinet de Joinville ?", a: "Oui, contre signature avec nom et heure consignés." },
      { q: "Quel tarif à Joinville-le-Pont ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "nogent-sur-marne": {
    landmarks: ["Pavillon Baltard", "Bords de Marne", "RER A Nogent-sur-Marne", "Bois de Vincennes (limite)", "Joinville-le-Pont (limite)", "Le Perreux-sur-Marne (limite)"],
    intro: "Nogent-sur-Marne est une commune résidentielle et commerçante des bords de Marne. Elle est connue pour le pavillon Baltard, ancien pavillon des Halles de Paris remonté sur place, et pour ses guinguettes. Le RER A la relie directement à Paris.",
    logisticsContext: "Le centre-ville est organisé autour de la Grande Rue et de la gare. Les rives de la Marne et les rues étroites compliquent l'accès aux voitures. Le deux-roues se faufile sans difficulté et relie Paris 12e rapidement par le bois de Vincennes.",
    keyClients: ["Professions libérales", "Études notariales", "Pavillon Baltard", "Commerces du centre"],
    localGuide: {
      title: "Nogent-sur-Marne : la Marne, le pavillon Baltard et les cabinets",
      paragraphs: [
        "Le pavillon Baltard accueille des événements : salons, expositions, réceptions. Pour une livraison liée à un événement, donnez le nom de l'organisateur, l'entrée de service et l'heure de remise. Les accès sont différents pour le public et pour les livreurs.",
        "Le centre de Nogent concentre des études notariales et des cabinets. Les actes et pièces se remettent en main propre, contre signature. Pour un envoi destiné à un notaire, indiquez le nom de l'étude et du clerc, ainsi que l'heure limite.",
      ],
    },
    faq: [
      { q: "Livrez-vous au pavillon Baltard lors d'un événement ?", a: "Oui, avec le nom de l'organisateur, l'entrée de service et l'heure de remise." },
      { q: "Pouvez-vous remettre un acte à une étude notariale de Nogent ?", a: "Oui, en course dédiée, contre signature nominative avec justificatif horodaté." },
      { q: "Quel tarif à Nogent-sur-Marne ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "le-perreux-sur-marne": {
    landmarks: ["Bords de Marne", "RER A Nogent - Le Perreux", "Nogent-sur-Marne (limite)", "Bry-sur-Marne (limite)", "Villas des bords de Marne", "A4 (proche)"],
    intro: "Le Perreux-sur-Marne est une commune résidentielle sur la rive nord de la Marne, entre Nogent-sur-Marne et Bry-sur-Marne. Elle est connue pour ses villas de bord de rivière et dessert, via le RER A, le centre de Paris.",
    logisticsContext: "Les voies principales sont peu nombreuses, et les rues résidentielles sont étroites. Beaucoup d'adresses sont en retrait, derrière un portail. Le coursier a besoin du code d'entrée et d'un numéro joignable pour éviter l'attente.",
    keyClients: ["Professions libérales", "Cabinets médicaux", "PME de services", "Commerces de proximité"],
    localGuide: {
      title: "Le Perreux-sur-Marne : adresses derrière un portail",
      paragraphs: [
        "Dans les quartiers de villas, une livraison se heurte à un portail, un interphone, parfois une allée privée. Donnez le code, le nom du destinataire et un numéro joignable. Un coursier qui attend sur le trottoir sans réponse perd plusieurs minutes.",
        "Le Perreux compte beaucoup de professions libérales et de cabinets médicaux. Les prélèvements partent vers des laboratoires de Paris ou du Val-de-Marne : précisez la température de conservation et le délai de stabilité à la commande.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les villas des bords de Marne ?", a: "Oui. Donnez le code du portail et un contact joignable." },
      { q: "Transportez-vous des prélèvements depuis un cabinet du Perreux ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif au Perreux-sur-Marne ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "fontenay-sous-bois": {
    landmarks: ["Val de Fontenay", "RER A et E Val-de-Fontenay", "Bois de Vincennes (limite)", "Vincennes (limite)", "A86", "Tramway T1"],
    intro: "Fontenay-sous-Bois abrite le quartier d'affaires du Val de Fontenay, un nœud de transports où se croisent RER A, RER E et tramway T1. La commune borde le bois de Vincennes et compte de nombreux bureaux.",
    logisticsContext: "Le Val de Fontenay concentre les tours de bureaux autour de la gare, avec des accueils et des parkings dédiés. En dehors, la ville est résidentielle. La gare est un repère utile pour le coursier : donnez la distance à pied depuis le RER.",
    keyClients: ["Bureaux du Val de Fontenay", "Cabinets libéraux", "Commerces du centre", "PME de services"],
    localGuide: {
      title: "Fontenay-sous-Bois : le pôle tertiaire du Val de Fontenay",
      paragraphs: [
        "Le Val de Fontenay est un pôle de bureaux compact, desservi par deux RER et un tramway. Les immeubles ont des accueils, des badges et plusieurs entrées. Indiquez l'entreprise, le bâtiment et l'étage, avec un numéro direct du destinataire.",
        "Le reste de la commune est un tissu de cabinets, de PME et de commerces, entre le bois de Vincennes et la voie ferrée. Les envois y sont des plis, des documents et des petits colis. Pour un volume régulier, un compte entreprise permet une tournée à créneaux fixes.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les tours du Val de Fontenay ?", a: "Oui. Donnez l'entreprise, le bâtiment, l'étage et un numéro direct." },
      { q: "Peut-on prévoir une tournée régulière depuis Fontenay ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif à Fontenay-sous-Bois ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "saint-maur-des-fosses": {
    landmarks: ["Boucle de la Marne", "RER A Saint-Maur - Créteil", "La Varenne-Saint-Hilaire", "Bords de Marne", "Abbaye de Saint-Maur (site)", "A4 (proche)"],
    intro: "Saint-Maur-des-Fossés est l'une des plus grandes villes du Val-de-Marne, bâtie dans une boucle de la Marne. Elle s'organise en quartiers distincts, dont La Varenne-Saint-Hilaire, et compte de nombreux cabinets de professions libérales.",
    logisticsContext: "La boucle de la Marne crée une presqu'île qui n'a que peu d'accès routiers. Les quartiers sont éloignés les uns des autres, et peu de voies les relient. Le coursier a besoin du quartier précis pour calculer un délai réaliste.",
    keyClients: ["Professions libérales", "Études notariales", "Cliniques", "Commerces des quartiers"],
    localGuide: {
      title: "Saint-Maur-des-Fossés : une boucle et plusieurs quartiers",
      paragraphs: [
        "Saint-Maur ne se traverse pas facilement : la boucle de la Marne force les trajets à faire un détour par un nombre limité de ponts et de grands axes. Donnez toujours le quartier, par exemple La Varenne ou Le Parc, en plus de la rue.",
        "La clientèle est surtout composée de cabinets de professions libérales, d'études et de cliniques. Les actes et pièces voyagent en course dédiée avec remise contre signature. Les prélèvements demandent le délai de stabilité et la température de conservation.",
      ],
    },
    faq: [
      { q: "Desservez-vous tous les quartiers de Saint-Maur ?", a: "Oui, dont La Varenne. Donnez le quartier et la rue pour un délai fiable." },
      { q: "Pouvez-vous remettre un acte à une étude de Saint-Maur ?", a: "Oui, contre signature nominative avec justificatif horodaté." },
      { q: "Quel tarif à Saint-Maur-des-Fossés ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "champigny-sur-marne": {
    landmarks: ["Musée de la Résistance nationale", "RER A Champigny", "Bords de Marne", "A4", "A86", "Zone d'activité"],
    intro: "Champigny-sur-Marne est une grande commune du Val-de-Marne, entre la Marne et l'A4. Elle abrite le musée de la Résistance nationale, des zones d'activité industrielles et de nombreux quartiers résidentiels.",
    logisticsContext: "La commune est traversée par l'A4 et l'A86, ce qui la place à portée de Paris, mais ces axes se chargent aux heures de pointe. Les zones d'activité sont à l'écart du centre. Donnez le nom de la société et l'entrée pour éviter les détours.",
    keyClients: ["Musée de la Résistance nationale", "Zones d'activité", "PME industrielles", "Commerces"],
    localGuide: {
      title: "Champigny-sur-Marne : autoroutes, zones d'activité et rives de la Marne",
      paragraphs: [
        "Les zones d'activité de Champigny fonctionnent avec des horaires de réception. Un colis qui arrive après la fermeture du quai ne sera pas remis. Indiquez l'heure limite, le nom de la société, le bâtiment et un contact au quai.",
        "Le musée de la Résistance nationale et les équipements culturels locaux échangent des documents et des pièces d'exposition. Pour un envoi destiné au musée, donnez le service et les dimensions du colis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les zones d'activité de Champigny ?", a: "Oui, avec le nom de la société, l'entrée et un contact au quai." },
      { q: "Pouvez-vous livrer au musée de la Résistance nationale ?", a: "Oui, avec le service destinataire et un contact." },
      { q: "Quel tarif à Champigny-sur-Marne ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  villejuif: {
    landmarks: ["Gustave Roussy", "Hôpital Paul-Brousse", "Cancer Campus", "Métro ligne 7 Villejuif", "Tramway T7", "A6"],
    intro: "Villejuif est un pôle de cancérologie : l'institut Gustave-Roussy, l'hôpital Paul-Brousse et le Cancer Campus y sont installés. La ligne 7 du métro la relie directement à Paris 13e.",
    logisticsContext: "Les établissements de santé de Villejuif sont à plusieurs minutes les uns des autres. La station Villejuif–Louis Aragon dessert le centre, Paul-Vaillant-Couturier et Léo-Lagrange les quartiers voisins. Le coursier doit connaître le bâtiment et l'entrée du service pour une remise sans attente.",
    keyClients: ["Gustave Roussy", "Hôpital Paul-Brousse", "Laboratoires du Cancer Campus", "Cliniques et cabinets"],
    localGuide: {
      title: "Villejuif : le pôle de cancérologie du Val-de-Marne",
      paragraphs: [
        "Autour de Gustave Roussy, les laboratoires et services échangent des prélèvements, des échantillons et des documents cliniques. Pour chaque course, donnez le service destinataire, l'heure limite et, pour un échantillon, la température de conservation et le délai de stabilité.",
        "Ces établissements sont de grands sites avec plusieurs bâtiments et accès contrôlés. Un colis adressé simplement à l'établissement ne suffit pas : indiquez le bâtiment, le laboratoire et un contact joignable. Le coursier est alors attendu à la bonne entrée.",
      ],
    },
    faq: [
      { q: "Transportez-vous des échantillons vers Gustave Roussy ?", a: "Oui, en course dédiée avec contenant isotherme à la demande. Le délai de stabilité fixé par le laboratoire commande la faisabilité." },
      { q: "Livrez-vous à l'hôpital Paul-Brousse ?", a: "Oui. Précisez le service, le bâtiment et un contact." },
      { q: "Quel tarif à Villejuif ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  gentilly: {
    landmarks: ["RER B Gentilly", "Paris 13e (limite)", "Porte d'Italie (proche)", "A6", "Le Kremlin-Bicêtre (limite)", "Arcueil (limite)"],
    intro: "Gentilly est une petite commune collée au sud du 13e arrondissement. Elle est desservie par le RER B et traversée par le tracé de l'ancienne Bièvre, et mêle bureaux, ateliers et habitat.",
    logisticsContext: "La Porte d'Italie, toute proche, est l'un des points les plus chargés du périphérique sud. Le RER B permet d'atteindre Paris rapidement mais les routes restent chargées. Le deux-roues relie Gentilly au 13e en quelques minutes.",
    keyClients: ["Bureaux et ateliers", "Commerces de proximité", "Professions libérales", "Petites entreprises de services"],
    localGuide: {
      title: "Gentilly : la porte sud du 13e",
      paragraphs: [
        "Gentilly est séparée du 13e arrondissement par le périphérique. Pour un cabinet, une agence ou un atelier de la commune, les courses vers la Pitié-Salpêtrière, Station F ou Tolbiac sont très courtes. Donnez l'adresse de destination et le service pour fixer un délai précis.",
        "La commune est petite et dense : l'adresse exacte, avec numéro et étage, suffit généralement. Pour des échanges réguliers avec Paris, une tournée à créneaux fixes est possible dans le cadre d'un compte entreprise.",
      ],
    },
    faq: [
      { q: "Combien de temps pour relier Gentilly à Paris 13e ?", a: "Les deux sont limitrophes : la course est courte. Nous annonçons le délai exact à la confirmation." },
      { q: "Peut-on organiser une tournée régulière depuis Gentilly ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif à Gentilly ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  arcueil: {
    landmarks: ["Aqueduc d'Arcueil", "RER B Laplace", "Cachan (limite)", "Gentilly (limite)", "Paris 14e (proche)", "A6"],
    intro: "Arcueil est une commune du sud de Paris, traversée par l'aqueduc qui porte son nom et desservie par le RER B. Voisine de Cachan et de Gentilly, elle compte des bureaux, des laboratoires et des ateliers.",
    logisticsContext: "L'aqueduc et la vallée de la Bièvre ont façonné la topographie : des quartiers bas et des quartiers hauts reliés par des rues en pente. La station du RER B donne un repère clair pour guider le coursier.",
    keyClients: ["Laboratoires et bureaux d'études", "Professions libérales", "Ateliers", "Commerces du centre"],
    localGuide: {
      title: "Arcueil : une commune bâtie sur une vallée",
      paragraphs: [
        "Arcueil se construit sur les deux versants de l'ancienne vallée de la Bièvre. Pour une adresse en hauteur, indiquez le numéro, le code et la station de RER la plus proche. Cela aide le coursier à se repérer dans les rues en pente.",
        "La commune compte des entreprises techniques, des laboratoires et des bureaux d'études qui échangent des pièces, des échantillons et des documents avec Paris. Précisez le contenu et la fragilité à la commande pour que nous confirmions que le deux-roues convient.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les quartiers en hauteur d'Arcueil ?", a: "Oui. Donnez l'adresse précise, le code et un contact." },
      { q: "Pouvez-vous transporter des pièces techniques ?", a: "Pour des pièces légères et protégées, dans la limite de 18 kg. Au-delà, appelez-nous." },
      { q: "Quel tarif à Arcueil ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  cachan: {
    landmarks: ["ENS Paris-Saclay", "RER B Arcueil - Cachan", "Arcueil (limite)", "Bagneux (limite)", "Villejuif (limite)", "A6"],
    intro: "Cachan abrite l'ENS Paris-Saclay, une grande école normale scientifique, et se trouve à proximité du RER B. La ville est voisine d'Arcueil, de Villejuif et de Bagneux.",
    logisticsContext: "Le campus de l'ENS occupe un site important au cœur de la ville. Les laboratoires et départements ont chacun leur entrée. Le coursier a besoin du nom du département et d'un contact pour trouver le bon accueil.",
    keyClients: ["ENS Paris-Saclay", "Laboratoires de recherche", "Centres de formation", "Commerces du centre"],
    localGuide: {
      title: "Cachan : le campus de l'ENS Paris-Saclay",
      paragraphs: [
        "À l'ENS Paris-Saclay, les laboratoires et départements reçoivent des commandes de matériel, des échantillons et des documents. Indiquez le département, le bâtiment et un contact : le campus a plusieurs entrées et les accueils ne sont pas centralisés.",
        "Autour du campus, la ville est calme, avec des commerces et des PME. Les envois y sont des plis, des petits colis et des documents administratifs. La remise en main propre contre signature reste la règle.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'ENS Paris-Saclay ?", a: "Oui, avec le département, le bâtiment et un contact." },
      { q: "Transportez-vous des échantillons de laboratoire ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif à Cachan ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  rungis: {
    landmarks: ["Marché international de Rungis", "Tramway T7", "A6 et A106", "Aéroport d'Orly (proche)", "Silic (zone d'activité)", "Chevilly-Larue (limite)"],
    intro: "Rungis accueille le marché d'intérêt national de Rungis, le plus grand marché de produits frais du monde. La commune abrite aussi des zones d'activité logistiques, à proximité de l'aéroport d'Orly.",
    logisticsContext: "Le marché fonctionne la nuit et le petit matin : les grossistes ouvrent vers minuit et les livraisons commencent avant l'aube. Les horaires de la ville ne sont pas ceux de Paris. Une course nocturne se planifie à l'avance, selon la disponibilité des pilotes.",
    keyClients: ["Marché international de Rungis", "Grossistes", "Zones d'activité logistiques", "Entreprises proches d'Orly"],
    localGuide: {
      title: "Rungis : une ville qui travaille la nuit",
      paragraphs: [
        "Le marché de Rungis suit un cycle inversé : les grossistes travaillent de nuit, et les acheteurs arrivent avant le jour. Notre service couvre de 7h à 23h : pour une course avant 7h, appelez-nous pour savoir si elle peut être planifiée. Pour les envois de la journée, tous les créneaux habituels s'appliquent.",
        "Autour du marché, les entreprises logistiques et les zones d'activité envoient des documents de transport, des échantillons et des pièces. Précisez le bâtiment, le quai et un contact au portail : les accès sont réglementés.",
      ],
    },
    faq: [
      { q: "Livrez-vous au marché de Rungis ?", a: "Oui, de 7h à 23h. Donnez le pavillon, le stand ou l'entreprise, et un contact : les accès sont contrôlés." },
      { q: "Pouvez-vous faire une course avant 7h pour un grossiste ?", a: "Contactez-nous : nous vous disons si la course peut être planifiée." },
      { q: "Quel tarif à Rungis ?", a: "Rungis est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  orly: {
    landmarks: ["Aéroport de Paris-Orly", "Tramway T7", "Métro ligne 14 Aéroport d'Orly", "Orlyval", "A106", "Rungis (limite)"],
    intro: "Orly accueille l'aéroport de Paris-Orly, desservi par le tramway T7, la ligne 14 du métro et la navette Orlyval. La commune est aussi le siège de zones d'activité et d'hôtels liés au trafic aérien.",
    logisticsContext: "L'aéroport impose des contrôles d'accès, des badges et des zones réservées. Un coursier qui se présente sans nom de destinataire ni terminal perd du temps. Donnez le terminal, la porte et un contact sur place.",
    keyClients: ["Aéroport de Paris-Orly", "Entreprises aéroportuaires", "Hôtels d'aéroport", "Transitaires"],
    localGuide: {
      title: "Orly : livrer dans un aéroport",
      paragraphs: [
        "À Orly, une adresse se compose d'un terminal, d'une zone, d'un contact. Pour un document de transport ou un colis destiné à une compagnie, donnez le terminal, la porte et un contact. Sans ces informations, le coursier est arrêté aux contrôles.",
        "Les envois urgents sont typiquement des documents de transport, des pièces aéronautiques ou des échantillons. Précisez le poids et l'heure limite : un avion qui part ne se rattrape pas. Nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les terminaux d'Orly ?", a: "Oui, avec le terminal, la porte et un contact. L'accès est contrôlé." },
      { q: "Pouvez-vous respecter l'heure d'un vol ?", a: "Nous confirmons la faisabilité avant le départ. Indiquez l'heure limite exacte." },
      { q: "Quel tarif à Orly ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "chevilly-larue": {
    landmarks: ["Marché international de Rungis (limite)", "Tramway T7", "A6", "A86", "Thiais (limite)", "Zones logistiques"],
    intro: "Chevilly-Larue est au cœur du bassin logistique du sud de Paris, à côté du marché de Rungis. La commune concentre entrepôts, plateformes de distribution et petites entreprises, entre l'A6 et l'A86.",
    logisticsContext: "Le tramway T7 la traverse. Les entrepôts sont répartis sur de grands terrains, avec plusieurs quais et portails. Le nom du quai, du bâtiment et un contact au portail sont indispensables.",
    keyClients: ["Entrepôts logistiques", "Distributeurs alimentaires", "PME", "Zones d'activité"],
    localGuide: {
      title: "Chevilly-Larue : entrepôts et plateformes",
      paragraphs: [
        "À Chevilly-Larue, une adresse d'entrepôt se confond avec la voisine : même rue, même portail. Donnez le nom de la société, le numéro du bâtiment et le quai. Les horaires de réception sont stricts, et l'heure limite fixe le départ.",
        "Les entreprises de la zone envoient surtout des documents de livraison, des échantillons produits et des pièces. Pour un échange régulier avec Paris ou Orly, une tournée à créneaux fixes est plus économique que des courses isolées.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les entrepôts de Chevilly-Larue ?", a: "Oui. Donnez la société, le bâtiment, le quai et un contact au portail." },
      { q: "Faites-vous des tournées entre Chevilly et Orly ?", a: "Oui, par tournées sur créneaux fixes avec un compte entreprise." },
      { q: "Quel tarif à Chevilly-Larue ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "lhay-les-roses": {
    landmarks: ["Roseraie du Val-de-Marne", "Fresnes (limite)", "Villejuif (limite)", "A6", "Centre-ville", "Parc de la Roseraie"],
    intro: "L'Haÿ-les-Roses est connue pour sa roseraie, la première roseraie du monde, créée en 1899. La commune est résidentielle, avec un centre-ville commerçant et plusieurs cabinets de professions libérales.",
    logisticsContext: "L'A6 longe la ville, et la RD7 la traverse. La roseraie attire des visiteurs et des événements. Les rues résidentielles sont calmes mais les accès à l'A6 se chargent aux heures de pointe.",
    keyClients: ["Roseraie du Val-de-Marne", "Professions libérales", "Cabinets médicaux", "Commerces du centre"],
    localGuide: {
      title: "L'Haÿ-les-Roses : la roseraie et les cabinets du centre",
      paragraphs: [
        "La roseraie accueille des événements professionnels et des mariages. Pour une livraison liée à un événement, donnez le nom de l'organisateur, l'entrée de service et l'heure de remise. Les accès au parc sont différents pour le public et les prestataires.",
        "Le centre-ville regroupe cabinets et commerces. Les prélèvements des médecins partent vers les laboratoires voisins : précisez la température et le délai de stabilité. Les plis et documents se remettent en main propre contre signature.",
      ],
    },
    faq: [
      { q: "Livrez-vous à la roseraie lors d'un événement ?", a: "Oui, avec l'organisateur, l'entrée de service et l'heure de remise." },
      { q: "Transportez-vous des prélèvements depuis un cabinet de L'Haÿ ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif à L'Haÿ-les-Roses ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  fresnes: {
    landmarks: ["Établissement public de santé national de Fresnes", "Maison d'arrêt de Fresnes", "A6", "A86", "L'Haÿ-les-Roses (limite)", "Rungis (proche)"],
    intro: "Fresnes accueille un établissement public de santé national et une grande maison d'arrêt. La commune est coincée entre l'A6 et l'A86, entre L'Haÿ-les-Roses et Rungis.",
    logisticsContext: "Les établissements publics de la commune ont des accès strictement contrôlés, avec contrôle d'identité à l'entrée. Le coursier doit être annoncé : donnez le nom du destinataire, le service et un numéro joignable.",
    keyClients: ["Établissement public de santé national de Fresnes", "Professions libérales", "PME", "Commerces du centre"],
    localGuide: {
      title: "Fresnes : des sites publics à accès contrôlé",
      paragraphs: [
        "Les établissements publics de Fresnes appliquent des règles d'accès strictes. Nous ne promettons pas l'entrée dans un bâtiment : nous organisons la remise à l'accueil désigné, contre signature, avec l'heure consignée. Prévenez le destinataire de la venue du coursier.",
        "Les cabinets et PME du centre envoient des plis et des documents. Pour les prélèvements, précisez la température de conservation et le délai de stabilité : nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'établissement de santé de Fresnes ?", a: "Oui, à l'accueil désigné. Donnez le destinataire, le service et un contact." },
      { q: "Quelles règles pour un site à accès contrôlé ?", a: "Prévenez le destinataire, car l'accès dépend des règles du site. La remise est signée à l'accueil." },
      { q: "Quel tarif à Fresnes ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  thiais: {
    landmarks: ["Belle Épine", "Cimetière parisien de Thiais", "Tramway T7", "A86", "A6", "Marché de Rungis (proche)"],
    intro: "Thiais abrite Belle Épine, l'un des plus grands centres commerciaux d'Île-de-France, et le cimetière parisien de Thiais. La commune est bordée par l'A86 et l'A6, à proximité du marché de Rungis et d'Orly.",
    logisticsContext: "Belle Épine génère un trafic dense aux abords, notamment le samedi. Les enseignes ont des entrées de service distinctes. Le coursier reçoit de votre part le nom de l'enseigne et le numéro de lot.",
    keyClients: ["Belle Épine", "Enseignes du centre commercial", "Logisticiens de Rungis", "PME"],
    localGuide: {
      title: "Thiais : un grand centre commercial comme voisin",
      paragraphs: [
        "À Belle Épine, une livraison passe par l'entrée de service, parfois par un poste de sécurité, et se remet à un responsable de magasin. Donnez le nom de l'enseigne, le numéro de lot et le contact du responsable. Les horaires de livraison et d'ouverture au public sont distincts.",
        "Hors du centre commercial, Thiais est une ville résidentielle et logistique, proche de Rungis et d'Orly. Les entreprises envoient des documents de transport et des petites pièces. La course dédiée permet de tenir des délais serrés sans rupture de charge.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans un magasin de Belle Épine ?", a: "Oui. Indiquez l'enseigne, le lot et un contact : l'entrée de service est distincte de l'entrée publique." },
      { q: "Pouvez-vous livrer vers Rungis ou Orly depuis Thiais ?", a: "Oui. Les trajets sont courts ; la grille standard s'applique." },
      { q: "Quel tarif à Thiais ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },
};
