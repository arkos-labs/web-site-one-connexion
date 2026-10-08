/**
 * lib/zones/local-92.ts
 * Contenu propre aux communes des Hauts-de-Seine. Remplace intro, contexte,
 * repères et acteurs de la fiche de base : chaque page raconte sa commune.
 * Règle : uniquement des faits publics et vérifiables (institutions, gares,
 * axes, lieux) ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_92: Record<string, LocalZoneContent> = {
  nanterre: {
    landmarks: ["Préfecture des Hauts-de-Seine", "Tribunal judiciaire de Nanterre", "Université Paris Nanterre", "Paris La Défense Arena", "Parc André-Malraux", "RER A"],
    intro: "Nanterre est la préfecture des Hauts-de-Seine. La commune réunit le tribunal judiciaire, la préfecture, l'université Paris Nanterre et la Paris La Défense Arena, et se prolonge à l'est par le quartier d'affaires de La Défense.",
    logisticsContext: "Le RER A, l'A14 et l'A86 se croisent à Nanterre, et les accès à La Défense saturent aux heures de pointe. La commune est très étendue, de la préfecture au quartier Pablo-Picasso : donner l'adresse exacte et le point de remise évite une recherche en cours de route.",
    keyClients: ["Tribunal judiciaire de Nanterre", "Préfecture des Hauts-de-Seine", "Université Paris Nanterre", "Paris La Défense Arena"],
    localGuide: {
      title: "Nanterre : la justice et l'administration des Hauts-de-Seine",
      paragraphs: [
        "Pour un cabinet d'avocats ou une étude des Hauts-de-Seine, Nanterre est d'abord une adresse judiciaire : le tribunal judiciaire y rend ses décisions, et les dépôts de pièces se jouent à l'heure près. Indiquez le service destinataire et l'heure limite à la commande : c'est elle qui fixe l'heure de départ du coursier.",
        "La commune est aussi un campus et une scène : l'université Paris Nanterre et la Paris La Défense Arena génèrent des flux de matériel, de documents et de colis légers les soirs d'événement. Prévenez-nous d'un concert ou d'un match, car la circulation autour de l'Arena change l'itinéraire.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un acte au tribunal judiciaire de Nanterre ?", a: "Oui. L'acte part en course dédiée, avec remise contre signature et justificatif horodaté. Précisez le service et l'heure limite de dépôt." },
      { q: "Livrez-vous à l'université Paris Nanterre ?", a: "Oui. Le campus est vaste : indiquez le bâtiment, le service et un contact sur place pour que le coursier trouve l'accueil sans détour." },
      { q: "Quel tarif pour Nanterre ?", a: "Nanterre relève de la petite couronne : à partir de 22 € HT en course planifiée, 30 € HT en course immédiate, avec devis gratuit en moins de 2 heures." },
    ],
  },

  courbevoie: {
    landmarks: ["La Défense (partie ouest)", "Faubourg de l'Arche", "Gare de Courbevoie", "Charras", "Pont de Neuilly", "Seine"],
    intro: "Courbevoie occupe une grande partie du quartier d'affaires de La Défense, avec ses tours et ses sièges, et se prolonge côté Seine par des quartiers résidentiels et de bureaux plus classiques, autour de Charras et de la gare de Courbevoie.",
    logisticsContext: "Les tours de La Défense ont des accueils, des badges et des quais de livraison distincts. Ailleurs dans la commune, la circulation est celle d'une ville dense collée à Neuilly et à Paris 17e. Le deux-roues relie les deux mondes sans chercher de stationnement.",
    keyClients: ["Tours de La Défense", "Faubourg de l'Arche", "Cabinets et PME de services", "Commerces de Charras"],
    localGuide: {
      title: "Courbevoie : livrer dans une tour de La Défense",
      paragraphs: [
        "Dans une tour de La Défense, une remise ne se fait pas à la porte : elle passe par un accueil, un badge et un ascenseur, souvent avec un visiteur à annoncer. Donnez-nous le nom du destinataire, l'étage, l'entreprise et un numéro joignable ; nous préparons la venue du coursier comme celle d'un visiteur attendu.",
        "Hors de La Défense, Courbevoie est une ville de bureaux et de logements compacts le long de la Seine. Les courses vers Neuilly, Levallois ou Paris 17e sont très courtes : c'est là que le deux-roues fait la différence sur une adresse voisine que la voiture atteint après de longs détours.",
      ],
    },
    faq: [
      { q: "Comment se passe une remise dans une tour de La Défense ?", a: "Le coursier se présente à l'accueil avec le nom du destinataire. Donnez-nous l'étage, l'entreprise et un contact direct pour qu'il soit annoncé et que la remise soit signée." },
      { q: "Livrez-vous les colis volumineux dans les tours ?", a: "Notre flotte est en deux-roues, avec un top-case de 18 kg maximum. Pour un volume plus important, appelez-nous avant de commander." },
      { q: "Quel est le tarif à Courbevoie ?", a: "Courbevoie fait partie de la petite couronne : dès 22 € HT en planifié, dès 30 € HT en immédiat, devis gratuit sous 2 heures." },
    ],
  },

  puteaux: {
    landmarks: ["Grande Arche (parvis)", "CNIT", "Île de Puteaux", "Esplanade de La Défense", "Gare de Puteaux", "Tramway T2"],
    intro: "Puteaux accueille l'Esplanade de La Défense, le CNIT et la Grande Arche. Plus au sud, la commune retrouve un tissu de rues commerçantes autour de la gare, de la mairie et de l'île de Puteaux, au bord de la Seine.",
    logisticsContext: "Les trajets entre les tours se font en grande partie sur la dalle piétonne, interdite aux véhicules : le coursier stationne sur la voirie périphérique et finit à pied. Le tramway T2 longe la Seine, et le boulevard circulaire distribue les accès aux parkings.",
    keyClients: ["CNIT", "Grande Arche", "Entreprises du quartier d'affaires", "Commerces du centre de Puteaux"],
    localGuide: {
      title: "Puteaux : une dalle piétonne, des entrées par les parkings",
      paragraphs: [
        "La dalle de La Défense n'est pas ouverte aux véhicules : un colis destiné à un bureau de l'Esplanade arrive donc par la voirie du boulevard circulaire puis à pied. Indiquez la tour, l'entrée et l'accueil exact, car plusieurs bâtiments de Puteaux ont des halls sur plusieurs niveaux.",
        "Les salons et congrès du CNIT mobilisent d'autres circuits : badges exposants, quais de livraison, horaires de montage. Si votre course concerne un événement, donnez-nous le hall, le stand ou le nom de l'organisateur, et l'heure de remise souhaitée.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer sur la dalle de La Défense à Puteaux ?", a: "Oui, à pied depuis le point de stationnement du coursier. Donnez le nom de la tour, l'accueil et un contact pour limiter l'attente." },
      { q: "Livrez-vous pendant un salon au CNIT ?", a: "Oui, avec le hall, le stand et le contact exposant. Les accès sont plus encadrés pendant les salons." },
      { q: "Quel tarif à Puteaux ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat, comme pour toute la petite couronne." },
    ],
  },

  suresnes: {
    landmarks: ["Mont-Valérien", "Hôpital Foch", "Cimetière américain de Suresnes", "Pont de Suresnes", "Tramway T2", "Cité-jardin"],
    intro: "Suresnes s'étire entre la Seine et la colline du Mont-Valérien. Commune résidentielle et tertiaire, elle accueille l'hôpital Foch, des bureaux le long du quai et l'une des plus anciennes cités-jardins d'Île-de-France.",
    logisticsContext: "Suresnes est coupée en deux par le relief : le bas, près de la Seine et du T2, et le haut, vers le Mont-Valérien, accessible par des rues en pente. Le pont de Suresnes mène au bois de Boulogne et à Paris 16e en quelques minutes.",
    keyClients: ["Hôpital Foch", "Entreprises du quai de Seine", "Professions libérales", "Commerces du centre"],
    localGuide: {
      title: "Suresnes : de l'hôpital Foch au Mont-Valérien",
      paragraphs: [
        "L'hôpital Foch fait de Suresnes un point de passage pour des prélèvements, des dossiers médicaux et des pièces entre services. Pour un échantillon, précisez le délai de stabilité et la température de conservation : nous confirmons la faisabilité avant d'engager le coursier.",
        "Le dénivelé sépare la ville basse de la ville haute. Un colis destiné à une adresse sur les pentes du Mont-Valérien demande un itinéraire précis ; donnez-nous le numéro, le code et un contact. Vers Paris 16e et la Porte Maillot, le pont de Suresnes est le raccourci naturel.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements depuis ou vers l'hôpital Foch ?", a: "Oui, en course dédiée avec contenant isotherme sur demande. Le délai de stabilité fixé par le laboratoire détermine la faisabilité." },
      { q: "Desservez-vous le haut de Suresnes ?", a: "Oui, jusqu'au Mont-Valérien. Indiquez le numéro et un contact joignable : les rues en pente sont étroites." },
      { q: "Combien coûte une course au départ de Suresnes ?", a: "Dès 22 € HT en course planifiée et 30 € HT en immédiat, devis gratuit en moins de 2 heures." },
    ],
  },

  "rueil-malmaison": {
    landmarks: ["Château de Malmaison", "RER A Rueil-Malmaison", "A86", "Seine", "Bords de Seine de Rueil", "Hôtel de ville"],
    intro: "Rueil-Malmaison est une grande commune des Hauts-de-Seine, entre La Défense et la Seine. Elle abrite le château de Malmaison, des quartiers résidentiels étendus et des sièges de plusieurs groupes industriels et de services.",
    logisticsContext: "La commune est longue : le RER A et la RN13 desservent le centre, l'A86 le sud et la Seine le nord. Les parcs d'activités sont séparés du centre par plusieurs kilomètres, ce qui compte quand une course doit partir à l'heure.",
    keyClients: ["Château de Malmaison", "Sièges et parcs d'activités", "Professions libérales", "Commerces du centre"],
    localGuide: {
      title: "Rueil-Malmaison : de longues distances à l'intérieur de la commune",
      paragraphs: [
        "Rueil-Malmaison est l'une des communes les plus étendues du département. Une adresse près du château de Malmaison et une adresse dans un parc d'activités de l'A86 sont à plusieurs kilomètres l'une de l'autre. Donnez-nous l'adresse complète et le nom du bâtiment : le délai se calcule à partir du lieu exact.",
        "Les sièges et parcs d'activités fonctionnent comme des sites fermés, avec accueil et badge. Un colis destiné à un service précis nécessite le nom du destinataire et un numéro direct. Pour les cabinets du centre, la remise en main propre contre signature reste la règle.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les parcs d'activités de Rueil-Malmaison ?", a: "Oui. Donnez le nom du bâtiment, l'accueil et le contact du destinataire : l'accès aux sites d'entreprise est contrôlé." },
      { q: "Pouvez-vous relier Rueil-Malmaison à Paris le jour même ?", a: "Oui, en course immédiate ou planifiée, par l'A86 et la RN13. Nous confirmons le délai avant le départ." },
      { q: "Quelle est la tarification ?", a: "Rueil-Malmaison est en petite couronne : dès 22 € HT planifié, 30 € HT immédiat, devis gratuit en 2 heures." },
    ],
  },

  "asnieres-sur-seine": {
    landmarks: ["Seine", "Gare d'Asnières-sur-Seine", "Les Grésillons", "Hôtel de ville", "Pont de Clichy", "Paris 17e (limite)"],
    intro: "Asnières-sur-Seine est une grande commune dense, entre Paris 17e et Gennevilliers. La ville mêle quartiers d'habitation, bureaux le long de la Seine et un artisanat historique, dont l'atelier de malletier fondé au XIXe siècle.",
    logisticsContext: "La gare d'Asnières-sur-Seine relie Paris Saint-Lazare en quelques minutes, mais les routes sont chargées : le pont de Clichy et les rues proches de la Seine se bloquent facilement. Le deux-roues relie les quartiers sans attendre dans la circulation.",
    keyClients: ["Cabinets libéraux", "PME de services", "Ateliers artisanaux", "Quartier des Grésillons"],
    localGuide: {
      title: "Asnières-sur-Seine : un voisin direct de Paris 17e",
      paragraphs: [
        "Asnières est séparée du 17e arrondissement par la Seine et le boulevard périphérique : pour un cabinet, une agence ou un artisan, les courses vers le tribunal des Batignolles ou vers les clients parisiens sont parmi les plus courtes. L'heure limite de dépôt est le point de départ de la commande.",
        "À l'intérieur de la ville, les quartiers sont distincts : le centre autour de l'hôtel de ville, Les Grésillons au nord, les rives de la Seine à l'est. Précisez toujours le quartier ou la rue transversale en plus du numéro, car plusieurs voies portent le même nom dans les communes voisines.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un document au tribunal de Paris depuis Asnières ?", a: "Oui, en course dédiée. Indiquez le service et l'heure limite ; la remise est horodatée et nominative." },
      { q: "Livrez-vous le soir à Asnières ?", a: "Oui, jusqu'à 23h, selon la disponibilité des pilotes au moment de la commande." },
      { q: "Combien coûte une livraison depuis Asnières ?", a: "Asnières est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "clichy-92": {
    landmarks: ["Hôpital Beaujon", "Mairie de Clichy", "Clichy-Batignolles (limite)", "Porte de Clichy", "Seine", "Métro 13 Mairie de Clichy"],
    intro: "Clichy touche le 17e arrondissement par la Porte de Clichy. Commune très dense, elle abrite l'hôpital Beaujon, le siège d'un grand groupe de cosmétiques, des bureaux en bord de Seine et un centre-ville commerçant autour de la mairie.",
    logisticsContext: "La ligne 13 et la Seine encadrent la ville, et le quartier de Clichy-Batignolles voisin est un chantier permanent où les voies changent régulièrement. Le coursier suit un itinéraire adapté aux fermetures de rue du moment.",
    keyClients: ["Hôpital Beaujon", "Bureaux du bord de Seine", "Cabinets libéraux", "Commerces de la mairie"],
    localGuide: {
      title: "Clichy : l'hôpital Beaujon et la porte nord-ouest de Paris",
      paragraphs: [
        "L'hôpital Beaujon est l'un des grands établissements de l'AP-HP : prélèvements, comptes rendus et pièces circulent entre ses services et les laboratoires de Paris. Précisez le service destinataire, l'heure limite et, pour un échantillon, la contrainte de température.",
        "Clichy partage avec Paris 17e une frontière que le boulevard périphérique rend plus mince qu'elle n'y paraît : le tribunal de Paris est à quelques minutes. Les cabinets de Clichy utilisent souvent cette proximité pour des dépôts de dernière minute.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'hôpital Beaujon ?", a: "Oui, en précisant le service, le bâtiment et un contact. Pour un échantillon, indiquez aussi le délai de stabilité." },
      { q: "Pouvez-vous déposer un acte au tribunal de Paris depuis Clichy ?", a: "Oui. La course est dédiée, avec justificatif horodaté à annexer au dossier." },
      { q: "Quel tarif pour Clichy ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat, comme dans toute la petite couronne." },
    ],
  },

  colombes: {
    landmarks: ["Stade Yves-du-Manoir", "Hôpital Louis-Mourier", "Gare de Colombes", "Bois-Colombes (limite)", "A86", "Seine"],
    intro: "Colombes est une grande commune à l'ouest de Paris, avec le stade Yves-du-Manoir, utilisé pour les Jeux olympiques de 1924 et ceux de 2024, l'hôpital Louis-Mourier et un tissu mixte d'habitat, de zones d'activité et de bords de Seine.",
    logisticsContext: "L'A86 et la Seine encadrent Colombes, où se mélangent zones d'activité, quartiers résidentiels et grands axes. La gare de Colombes relie Paris Saint-Lazare ; les trajets vers La Défense et Gennevilliers passent par des voies chargées en heure de pointe.",
    keyClients: ["Hôpital Louis-Mourier", "Stade Yves-du-Manoir", "Zones d'activité", "Professions libérales"],
    localGuide: {
      title: "Colombes : stade olympique, hôpital et zones d'activité",
      paragraphs: [
        "Louis-Mourier est un hôpital de l'AP-HP où circulent prélèvements, documents et pièces techniques. Indiquez le service et le délai attendu à la commande ; pour un échantillon, la température et le délai de stabilité décident de la faisabilité.",
        "Les jours de rencontre sportive ou de manifestation au stade Yves-du-Manoir, les accès changent. Prévenez-nous, et précisez l'entrée où le coursier sera attendu. Les zones d'activité de la commune fonctionnent avec des horaires de réception : l'heure limite de remise est à préciser.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements vers l'hôpital Louis-Mourier ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande et service destinataire indiqué à la commande." },
      { q: "Livrez-vous les jours d'événements au stade Yves-du-Manoir ?", a: "Oui, en prévenant de l'événement : l'itinéraire et l'entrée de remise sont adaptés." },
      { q: "Quelle est la tarification à Colombes ?", a: "Colombes est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  gennevilliers: {
    landmarks: ["Port de Gennevilliers", "Les Agnettes", "Les Grésillons", "A86", "Seine", "Gare des Grésillons"],
    intro: "Gennevilliers est la commune du premier port fluvial d'Île-de-France. Son territoire est occupé en grande partie par le port, des zones d'activité et des sites logistiques, entre l'A86 et la Seine.",
    logisticsContext: "Les distances sont longues et les voies larges : le port s'étend sur plusieurs kilomètres, avec des portails et des quais à plusieurs entrées. Donner le numéro du quai ou de l'entrée évite de longs détours au coursier.",
    keyClients: ["Port de Gennevilliers", "Plateformes logistiques", "Entreprises industrielles", "Zones d'activité"],
    localGuide: {
      title: "Gennevilliers : adresses de port et sites logistiques",
      paragraphs: [
        "Une adresse du port de Gennevilliers n'est pas une adresse de rue : elle donne un quai, une entrée, parfois un code de portail. Précisez l'entrée et le contact sur place avant l'enlèvement. Les horaires de réception des sites logistiques sont stricts, l'heure limite de remise commande donc le départ.",
        "Le port génère surtout des envois urgents de petite taille : pièces, documents douaniers, échantillons. Un top-case de 18 kg convient pour ces pièces. Pour un volume plus important, dites-nous la taille exacte à la commande.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'intérieur du port de Gennevilliers ?", a: "Oui, avec le numéro de quai ou d'entrée et un contact sur place. Les accès au port sont contrôlés." },
      { q: "Pouvez-vous acheminer des documents douaniers ?", a: "Oui, en course dédiée, avec remise contre signature et heure consignée." },
      { q: "Quel tarif à Gennevilliers ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat, devis gratuit en 2 heures." },
    ],
  },

  montrouge: {
    landmarks: ["Beffroi de Montrouge", "Salon de Montrouge", "Porte d'Orléans (limite)", "Métro Mairie de Montrouge", "Paris 14e (limite)"],
    intro: "Montrouge borde Paris 14e par la Porte d'Orléans. La commune est un pôle de bureaux tertiaires, avec le beffroi, un centre-ville commerçant et le Salon de Montrouge, rendez-vous annuel d'art contemporain.",
    logisticsContext: "Le périphérique sud, la ligne 4 qui dessert Mairie de Montrouge et l'avenue de la République structurent la commune. La Porte d'Orléans, très chargée, se franchit plus vite en deux-roues qu'en voiture.",
    keyClients: ["Bureaux tertiaires", "Cabinets médicaux", "Le Beffroi", "Commerces du centre-ville"],
    localGuide: {
      title: "Montrouge : tertiaire et culture, à deux pas du 14e",
      paragraphs: [
        "Les bureaux de Montrouge travaillent beaucoup avec Paris 14e et 13e : documents à signer, pièces comptables, contrats. La Porte d'Orléans les sépare de quelques minutes seulement, ce qui rend la course immédiate particulièrement rapide pour les envois urgents.",
        "Chaque année, le Salon de Montrouge mobilise des œuvres, des cimaises et du matériel d'exposition. Si votre envoi concerne l'événement ou le Beffroi, précisez le contenu, les dimensions et l'heure d'installation pour que nous vérifiions que le deux-roues convient.",
      ],
    },
    faq: [
      { q: "Pouvez-vous transporter des œuvres légères pour le Salon de Montrouge ?", a: "Pour les pièces qui tiennent dans un top-case de 18 kg, oui. Donnez les dimensions à la commande pour que nous confirmions." },
      { q: "En combien de temps relie-t-on Montrouge à Paris 14e ?", a: "Les deux sont limitrophes : la course est courte, nous annonçons le délai précis à la confirmation." },
      { q: "Quel est le tarif de Montrouge ?", a: "Montrouge est en petite couronne : dès 22 € HT planifié, 30 € HT immédiat." },
    ],
  },

  malakoff: {
    landmarks: ["Métro Malakoff - Plateau de Vanves", "Métro Malakoff - Rue Étienne-Dolet", "Paris 14e (limite)", "Plateau de Vanves", "Hôtel de ville", "Châtillon (limite)"],
    intro: "Malakoff est une commune dense et vivante, collée à Paris 14e, desservie par deux stations de la ligne 13. Elle mêle immeubles de bureaux, ateliers, associations et logements sur le plateau de Vanves.",
    logisticsContext: "La ligne 13 sert de colonne vertébrale, et le relief du plateau impose des rues en pente. Les trajets vers Paris 14e et 15e sont courts mais traversent des voies chargées aux heures de pointe, d'où l'intérêt du deux-roues.",
    keyClients: ["Bureaux tertiaires", "Associations et ateliers", "Cabinets libéraux", "Commerces du centre"],
    localGuide: {
      title: "Malakoff : deux stations de métro et un plateau",
      paragraphs: [
        "Malakoff se repère à ses deux stations de la ligne 13, Plateau de Vanves et Rue Étienne-Dolet. Pour une adresse, donnez la station la plus proche en plus de la rue : cela aide le coursier à se placer dans la ville, très dense et irrégulière.",
        "Les envois y sont souvent des documents entre petites structures : associations, bureaux d'études, cabinets. La remise se fait en main propre, avec nom et heure consignés. Pour un volume régulier, un compte entreprise permet des tournées à créneaux fixes.",
      ],
    },
    faq: [
      { q: "Livrez-vous à Malakoff en plein centre, près du métro ?", a: "Oui. Indiquez la rue et la station de métro la plus proche pour accélérer la remise." },
      { q: "Peut-on organiser des tournées régulières entre Malakoff et Paris ?", a: "Oui, sur créneaux fixes, avec facturation mensuelle dans le cadre d'un compte entreprise." },
      { q: "Quel tarif à Malakoff ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat, comme toute la petite couronne." },
    ],
  },

  vanves: {
    landmarks: ["Parc Frédéric-Pic", "Palais des Sports de Vanves", "Porte de Vanves", "Parc des Expositions (proche)", "Paris 15e (limite)"],
    intro: "Vanves est limitrophe du 14e et du 15e arrondissement de Paris, à deux pas du Parc des Expositions de la Porte de Versailles. La commune combine quartiers résidentiels, écoles supérieures et bureaux.",
    logisticsContext: "Le périphérique et la Porte de Vanves marquent la frontière avec Paris. Les jours de salon à la Porte de Versailles, les rues autour de Vanves se chargent : le deux-roues s'affranchit de cette congestion.",
    keyClients: ["Établissements d'enseignement supérieur", "Bureaux de services", "Palais des Sports", "Commerces du centre"],
    localGuide: {
      title: "Vanves : à côté de la Porte de Versailles",
      paragraphs: [
        "Les salons du Parc des Expositions font de Vanves un voisin immédiat de l'événementiel : badges, documents, matériel de stand à livrer au dernier moment. Donnez le hall, le numéro de stand et un contact exposant ; la remise est horodatée.",
        "Dans la commune même, les établissements d'enseignement, les cabinets et les bureaux commandent surtout des plis et des documents administratifs. Pour les envois récurrents vers le 15e, une tournée sur créneaux fixes est possible avec un compte entreprise.",
      ],
    },
    faq: [
      { q: "Livrez-vous au Parc des Expositions depuis Vanves ?", a: "Oui, en précisant le hall, le stand et le contact exposant. Les accès sont contrôlés pendant les salons." },
      { q: "Quel est le délai pour rejoindre Paris 15e ?", a: "Les deux sont limitrophes : la course est courte. Nous annonçons le délai exact à la confirmation." },
      { q: "Combien coûte une course à Vanves ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  clamart: {
    landmarks: ["Hôpital d'instruction des armées Percy", "Hôpital Antoine-Béclère", "Bois de Clamart", "Gare de Clamart", "Tramway T6", "Forêt de Meudon"],
    intro: "Clamart est une grande commune boisée du sud-ouest des Hauts-de-Seine. Elle accueille deux établissements de santé importants, l'hôpital d'instruction des armées Percy et l'hôpital Antoine-Béclère, ainsi qu'un tissu résidentiel étendu.",
    logisticsContext: "Le relief et la forêt rendent les trajets parfois longs d'un quartier à l'autre. Le tramway T6 et la gare relient le centre, mais certaines adresses sont éloignées des axes principaux. Donner le quartier précis aide à fixer un délai réaliste.",
    keyClients: ["Hôpital Percy", "Hôpital Antoine-Béclère", "Professions de santé", "Commerces du centre"],
    localGuide: {
      title: "Clamart : deux hôpitaux et une ville étendue",
      paragraphs: [
        "Percy et Antoine-Béclère donnent à Clamart une activité médicale importante : prélèvements, pièces cliniques, documents entre services. Pour chaque course, précisez le service, l'heure limite et, pour un échantillon, la température de conservation et le délai de stabilité.",
        "Clamart s'étend de la lisière de la forêt de Meudon à la limite de Châtillon. Une adresse en haut de la commune peut être à plus de vingt minutes du centre. Donnez toujours l'adresse complète et un contact joignable.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements vers les hôpitaux de Clamart ?", a: "Oui, en course dédiée, avec contenant isotherme sur demande. Le délai de stabilité fixé par le laboratoire commande la faisabilité." },
      { q: "Livrez-vous dans les quartiers boisés de Clamart ?", a: "Oui. Donnez l'adresse complète et un contact pour que le coursier trouve l'accès sans détour." },
      { q: "Quel tarif à Clamart ?", a: "Clamart est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  chatillon: {
    landmarks: ["Fort de Châtillon", "Métro Châtillon - Montrouge", "Tramway T6", "Orange Gardens", "Montrouge (limite)", "Clamart (limite)"],
    intro: "Châtillon est une petite commune au sud de Paris, au terminus de la ligne 13 et du tramway T6. Le quartier du fort et le grand campus de bureaux d'un opérateur de télécommunications côtoient des ensembles résidentiels.",
    logisticsContext: "Le terminus Châtillon–Montrouge concentre bus, métro et tramway, avec une circulation dense aux abords. Le deux-roues gagne du temps sur les derniers hectomètres jusqu'aux sites de bureaux.",
    keyClients: ["Campus de bureaux", "Quartier du fort", "Commerces de proximité", "Professions libérales"],
    localGuide: {
      title: "Châtillon : un terminus de métro et un campus",
      paragraphs: [
        "Autour de la station Châtillon–Montrouge, la commune est un nœud de transport. Pour une remise dans un site de bureaux, donnez le nom du bâtiment, l'accueil et un contact direct : les grands campus ont plusieurs entrées et un contrôle d'accès.",
        "Les envois y sont surtout des documents, des plis et du petit matériel informatique entre services. Pour des échanges réguliers avec Paris, un compte entreprise permet des tournées à créneaux fixes.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer à l'intérieur d'un grand campus de bureaux ?", a: "Oui, à l'accueil désigné. Donnez le bâtiment, l'étage et un contact pour que le coursier soit attendu." },
      { q: "Quelle est la durée d'une course vers Paris depuis Châtillon ?", a: "La commune est limitrophe de Malakoff et proche de Paris 14e : nous confirmons le délai exact à la commande." },
      { q: "Combien coûte une course à Châtillon ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  bagneux: {
    landmarks: ["Métro Barbara (ligne 4)", "Cimetière parisien de Bagneux", "Hôtel de ville", "Fontenay-aux-Roses (limite)", "Montrouge (limite)", "A6"],
    intro: "Bagneux est desservie depuis 2022 par la ligne 4 du métro, qui la relie directement à Paris. La commune compte des quartiers résidentiels, des zones d'activité et l'un des grands cimetières parisiens hors les murs.",
    logisticsContext: "Le prolongement de la ligne 4 a transformé les trajets vers Paris, mais le trafic routier reste dense autour de l'A6 et de la RD920. Un coursier en deux-roues remonte la RD920 jusqu'à Montrouge sans attendre.",
    keyClients: ["Zones d'activité", "Professions libérales", "Cimetière parisien de Bagneux", "Commerces du centre"],
    localGuide: {
      title: "Bagneux : une commune que le métro a rapprochée de Paris",
      paragraphs: [
        "Avec la station Barbara, Bagneux est à quelques stations du centre de Paris. Cela change les attentes : les entreprises de la commune veulent des envois aussi rapides que ceux d'un arrondissement voisin. Une course immédiate relie le centre de Bagneux à Paris 14e et 13e rapidement.",
        "Les zones d'activité de la commune travaillent avec des horaires de réception. Précisez l'heure limite, l'entrée et un contact sur place, surtout pour un colis destiné à un service précis dans un parc d'activités.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les zones d'activité de Bagneux ?", a: "Oui, avec le nom du bâtiment, l'entrée et le contact. L'heure limite de remise fixe le départ." },
      { q: "Pouvez-vous relier Bagneux à Paris le jour même ?", a: "Oui, en course planifiée ou immédiate. Nous annonçons le délai exact à la confirmation." },
      { q: "Quel tarif pour Bagneux ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  antony: {
    landmarks: ["RER B Antony", "Parc de Sceaux (limite)", "Hôpital privé d'Antony", "A86", "Orlyval (proche)", "Pôle d'Antony Parc"],
    intro: "Antony est la plus grande commune du sud des Hauts-de-Seine. Desservie par le RER B, elle est proche d'Orly et d'une partie du campus de Paris-Saclay, avec un hôpital privé et des zones de bureaux.",
    logisticsContext: "Le RER B coupe Antony du nord au sud, et l'A86 et l'A6 la bordent. Les trajets vers Orly et Rungis sont courts. Le deux-roues est utile pour traverser la commune aux heures de pointe, où la RD920 se charge.",
    keyClients: ["Hôpital privé d'Antony", "Zones de bureaux", "Professions libérales", "Commerces du centre"],
    localGuide: {
      title: "Antony : à mi-chemin entre Paris, Orly et Saclay",
      paragraphs: [
        "Antony se trouve entre Paris et le sud de l'Essonne. Pour les entreprises de la commune, les courses vont dans trois directions : Paris, Orly et Rungis, et le plateau de Saclay. La destination fixe le tarif : la petite couronne suit la grille standard, l'Essonne se chiffre sur devis.",
        "L'hôpital privé d'Antony et les cabinets de la commune échangent des prélèvements et des dossiers avec des laboratoires voisins. Précisez le service, l'heure limite et la température de conservation lorsqu'elle s'applique.",
      ],
    },
    faq: [
      { q: "Livrez-vous vers Orly et Rungis depuis Antony ?", a: "Oui. Ces trajets sont proches ; selon la destination, ils relèvent de la grille standard ou d'un devis." },
      { q: "Transportez-vous des prélèvements depuis l'hôpital privé d'Antony ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif à Antony ?", a: "Antony est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  meudon: {
    landmarks: ["Observatoire de Paris-Meudon", "Terrasse de Meudon", "Forêt de Meudon", "Meudon-la-Forêt", "ONERA", "Gare de Meudon-Val-Fleury"],
    intro: "Meudon s'étage entre la Seine et la forêt, avec un observatoire astronomique, des centres de recherche, la terrasse en belvédère sur Paris et le quartier plus récent de Meudon-la-Forêt, au sud.",
    logisticsContext: "Meudon est une ville de dénivelé : la Seine en bas, le plateau et la forêt en haut, et plusieurs quartiers distincts. Les trajets entre le bas et le haut se font par des rues en pente. Le deux-roues les parcourt sans dépendre des embouteillages du quai.",
    keyClients: ["Observatoire de Paris-Meudon", "Centres de recherche", "Quartiers résidentiels", "Commerces de Meudon-la-Forêt"],
    localGuide: {
      title: "Meudon : recherche, forêt et dénivelé",
      paragraphs: [
        "L'observatoire et les centres de recherche de Meudon reçoivent des pièces techniques, des instruments et des documents scientifiques. Pour du matériel délicat, indiquez les dimensions et la fragilité à la commande : nous confirmons que le top-case convient avant le départ.",
        "Meudon a deux visages : Meudon-sur-Seine en bas, Meudon-la-Forêt au sud. Entre les deux, plusieurs centaines de mètres de dénivelé. Donnez le quartier en plus de la rue, car deux voies portent parfois le même nom à quelques kilomètres de distance.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux centres de recherche de Meudon ?", a: "Oui, à l'accueil désigné, avec nom du destinataire et service. Les sites de recherche contrôlent leurs accès." },
      { q: "Desservez-vous Meudon-la-Forêt ?", a: "Oui. Donnez l'adresse complète et un contact : le quartier est vaste." },
      { q: "Quel est le tarif à Meudon ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  sevres: {
    landmarks: ["Manufacture nationale de Sèvres", "Musée national de la céramique", "Pont de Sèvres", "France Éducation international", "Métro Pont de Sèvres", "Tramway T2"],
    intro: "Sèvres est connue pour sa Manufacture nationale de porcelaine et son musée de la céramique. La commune se trouve au pied du Pont de Sèvres, nœud de transport entre le métro, le tramway T2 et les voies vers Versailles.",
    logisticsContext: "Le rond-point du Pont de Sèvres est l'un des plus chargés de l'ouest parisien. Le deux-roues le franchit sans attendre, ce qui compte lorsque l'heure de remise est contrainte.",
    keyClients: ["Manufacture nationale de Sèvres", "Musée national de la céramique", "France Éducation international", "Commerces du centre"],
    localGuide: {
      title: "Sèvres : porcelaine, musée et pont de Sèvres",
      paragraphs: [
        "La Manufacture et le musée de la céramique envoient et reçoivent des pièces fragiles. Pour une pièce de petite taille, précisez le conditionnement et la valeur à la commande : nous vérifions que le deux-roues convient. Pour un objet plus grand ou à forte valeur, appelez-nous avant.",
        "Le Pont de Sèvres est la porte d'entrée de la commune. Pour une adresse proche, notez la station de métro ou l'arrêt de tramway voisin : cela situe le coursier immédiatement. Les courses vers Boulogne-Billancourt et Paris 16e sont courtes.",
      ],
    },
    faq: [
      { q: "Pouvez-vous transporter une pièce de porcelaine ?", a: "Pour une pièce légère et bien emballée qui tient dans un top-case de 18 kg, oui. Au-delà ou pour un objet de valeur, contactez-nous avant." },
      { q: "Livrez-vous au musée national de la céramique ?", a: "Oui, à l'accueil ou à l'entrée de service indiquée, avec un contact sur place." },
      { q: "Quel tarif pour Sèvres ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "saint-cloud": {
    landmarks: ["Domaine national de Saint-Cloud", "Hippodrome de Saint-Cloud", "Pont de Saint-Cloud", "Gare de Saint-Cloud", "Seine", "A13"],
    intro: "Saint-Cloud est une commune résidentielle haut de gamme, bâtie sur les pentes qui dominent la Seine. Elle abrite le domaine national et son parc, un hippodrome, et une partie du tissu de professions libérales de l'ouest parisien.",
    logisticsContext: "Le pont de Saint-Cloud, la A13 et la RD7 forment des nœuds chargés. La ville est étagée : gare en bas, parc en haut. Le deux-roues évite les embouteillages du pont et rejoint Paris 16e et Boulogne rapidement.",
    keyClients: ["Domaine national de Saint-Cloud", "Hippodrome de Saint-Cloud", "Professions libérales", "Résidences"],
    localGuide: {
      title: "Saint-Cloud : un parc, un hippodrome et un pont chargé",
      paragraphs: [
        "Les jours de courses à l'hippodrome, les abords de Saint-Cloud sont encombrés. Si votre envoi concerne l'événement, précisez l'entrée de livraison et l'heure de remise. Sinon, la commune est surtout une ville de cabinets et de résidences, où la remise contre signature est la règle.",
        "Le pont de Saint-Cloud, étroit et saturé aux heures de pointe, est un point de passage incontournable vers Paris. Pour un dépôt à heure limite, annoncez-la dès la commande : nous partons plus tôt si le trafic l'exige.",
      ],
    },
    faq: [
      { q: "Livrez-vous le jour de courses à l'hippodrome ?", a: "Oui, en prévenant de l'événement et en précisant l'entrée de remise." },
      { q: "Peut-on envoyer un pli à un cabinet de Saint-Cloud contre signature ?", a: "Oui. Le destinataire signe, avec nom et heure consignés dans le justificatif." },
      { q: "Quel tarif à Saint-Cloud ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "chatenay-malabry": {
    landmarks: ["Faculté de pharmacie de Paris-Saclay", "Hôpital Marie-Lannelongue (proche)", "Vallée-aux-Loups", "Parc de Sceaux (limite)", "Tramway T10", "RER B Robinson (proche)"],
    intro: "Châtenay-Malabry est une ville étudiante et boisée : elle accueille la faculté de pharmacie de Paris-Saclay, la maison de Chateaubriand à la Vallée-aux-Loups et un quartier en reconversion sur l'ancien campus d'une grande école d'ingénieurs. Les zones boisées couvrent une grande partie du territoire.",
    logisticsContext: "Les sites d'enseignement sont à l'écart du centre, sur la hauteur, et reliés par des voies étroites. Aucun métro ne dessert la ville ; le tramway T10 la traverse et le RER B passe à proximité, à Robinson. Le coursier doit connaître l'entrée exacte pour limiter l'attente.",
    keyClients: ["Faculté de pharmacie", "Laboratoires de recherche", "Vallée-aux-Loups", "Professions de santé"],
    localGuide: {
      title: "Châtenay-Malabry : pharmacie, recherche et forêt",
      paragraphs: [
        "Les sites universitaires de Châtenay-Malabry fonctionnent par bâtiments, laboratoires et départements. Un colis adressé à la seule « faculté » sans bâtiment ni service attend longtemps. Précisez le laboratoire, le bâtiment et un contact : le coursier est alors attendu à la bonne entrée.",
        "La faculté de pharmacie et les laboratoires voisins échangent des échantillons et des consommables. Pour un transport sensible, donnez la température de conservation et le délai de stabilité : nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur les sites universitaires de Châtenay-Malabry ?", a: "Oui, avec le bâtiment, le laboratoire et un contact sur place." },
      { q: "Transportez-vous des échantillons vers la faculté de pharmacie ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif à Châtenay-Malabry ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  sceaux: {
    landmarks: ["Château et parc de Sceaux", "Gare de Sceaux", "Lycée Lakanal", "Bourg-la-Reine (limite)", "RER B"],
    intro: "Sceaux est une commune résidentielle et culturelle autour de son château et de son parc dessiné par Le Nôtre. Elle compte de nombreux cabinets de professions libérales, des études notariales et un lycée réputé.",
    logisticsContext: "La ville est calme et ses rues résidentielles sont étroites. Le RER B dessert Sceaux et Bourg-la-Reine ; aucune autoroute ne traverse le centre. Les courses vers Paris passent par la RD920, chargée en heure de pointe.",
    keyClients: ["Cabinets et études notariales", "Château de Sceaux", "Lycée Lakanal", "Professions de santé"],
    localGuide: {
      title: "Sceaux : professions libérales et ville-parc",
      paragraphs: [
        "À Sceaux, la clientèle est surtout composée de cabinets, d'études et de professions de santé qui échangent des documents confidentiels avec Paris. La remise contre signature, en main propre, est la règle, avec nom du signataire et heure consignés.",
        "Le parc et le château attirent des événements culturels. Pour un envoi destiné à un événement, précisez l'entrée de service et l'heure de remise. Les rues du centre étant courtes, mieux vaut annoncer l'arrivée du coursier au destinataire.",
      ],
    },
    faq: [
      { q: "Pouvez-vous remettre un acte à une étude notariale de Sceaux ?", a: "Oui, en course dédiée, contre signature nominative avec justificatif horodaté." },
      { q: "Livrez-vous au château de Sceaux ?", a: "Oui. Donnez l'entrée et un contact sur place pour un événement ou une exposition." },
      { q: "Quel tarif à Sceaux ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "bourg-la-reine": {
    landmarks: ["Gare de Bourg-la-Reine", "RER B", "Sceaux (limite)", "Cachan (limite)", "L'Haÿ-les-Roses (limite)", "Avenue du Général-Leclerc"],
    intro: "Bourg-la-Reine est une petite commune dense, desservie par le RER B, entre Sceaux, Antony, Cachan et L'Haÿ-les-Roses. Le centre-ville commerçant s'organise autour de l'avenue du Général-Leclerc et de la gare.",
    logisticsContext: "La ville tient en quelques rues : l'avenue du Général-Leclerc (RD920) la traverse du nord au sud, avec une circulation soutenue. Le deux-roues glisse dans le flux, ce qui fait gagner du temps vers Paris 14e.",
    keyClients: ["Commerces du centre", "Professions libérales", "Cabinets médicaux", "Petites entreprises de services"],
    localGuide: {
      title: "Bourg-la-Reine : une ville sur une seule avenue",
      paragraphs: [
        "Bourg-la-Reine se lit sur la RD920. Pour une adresse hors de l'avenue, indiquez la rue perpendiculaire et le côté de la voie ferrée : la ligne du RER B coupe la ville en deux et peu de passages permettent de la traverser.",
        "Les entreprises de la commune sont surtout des commerces, des cabinets et de petites structures de services. Elles envoient des plis, des documents comptables et des colis légers. Pour un volume régulier, un compte entreprise permet des passages à créneaux fixes.",
      ],
    },
    faq: [
      { q: "Livrez-vous de part et d'autre de la voie ferrée à Bourg-la-Reine ?", a: "Oui. Précisez le côté de la voie et la rue : cela évite un détour." },
      { q: "Peut-on prévoir un passage quotidien depuis Bourg-la-Reine ?", a: "Oui, par tournées sur créneaux fixes, avec facturation mensuelle." },
      { q: "Quel est le tarif de Bourg-la-Reine ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "fontenay-aux-roses": {
    landmarks: ["CEA de Fontenay-aux-Roses", "Parc Sainte-Barbe", "Bagneux (limite)", "Châtenay-Malabry (limite)", "Hôtel de ville"],
    intro: "Fontenay-aux-Roses est une commune résidentielle du sud des Hauts-de-Seine, connue pour son centre du CEA, un centre de recherche historique. Son centre-ville se concentre autour de la mairie et du parc Sainte-Barbe.",
    logisticsContext: "Le site du CEA occupe un vaste terrain au cœur de la ville, avec ses propres accès contrôlés. Hors de ce site, la ville est calme, avec des rues résidentielles étroites. Les trajets vers Paris se font par la RD920 ou la RD63.",
    keyClients: ["CEA de Fontenay-aux-Roses", "Laboratoires de recherche", "Professions libérales", "Commerces du centre"],
    localGuide: {
      title: "Fontenay-aux-Roses : un site de recherche au cœur de la ville",
      paragraphs: [
        "Les sites de recherche comme celui du CEA ont des accès réglementés. Pour qu'une remise se déroule sans attente, fournissez le nom du destinataire, le bâtiment, le service et un numéro direct. Ces informations conditionnent l'accueil du coursier.",
        "Autour du site, la ville vit au rythme des familles et des commerces de proximité. Les envois sont des plis, des petits colis et des documents de cabinets. La remise en main propre est le mode standard.",
      ],
    },
    faq: [
      { q: "Livrez-vous au CEA de Fontenay-aux-Roses ?", a: "Oui, à l'accueil désigné, avec nom du destinataire, bâtiment et contact. L'accès dépend des règles du site." },
      { q: "Quel est le délai pour rejoindre Paris depuis Fontenay ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
      { q: "Quel tarif à Fontenay-aux-Roses ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "le-plessis-robinson": {
    landmarks: ["Hôpital Marie-Lannelongue", "Cité-jardin du Plessis-Robinson", "Parc Henri-Sellier", "Clamart (limite)", "Châtenay-Malabry (limite)", "Tramway T10"],
    intro: "Le Plessis-Robinson est une commune du sud des Hauts-de-Seine, célèbre pour sa cité-jardin et son hôpital spécialisé en chirurgie cardiaque, Marie-Lannelongue. La ville est coincée entre Clamart et Châtenay-Malabry.",
    logisticsContext: "La ville est desservie par le tramway T10 et la RD2, sans métro ni RER dans son centre. Elle est un peu à l'écart des axes rapides, ce qui rallonge les trajets vers Paris aux heures de pointe.",
    keyClients: ["Hôpital Marie-Lannelongue", "Cité-jardin", "Commerces du centre", "Professions de santé"],
    localGuide: {
      title: "Le Plessis-Robinson : un hôpital spécialisé et une cité-jardin",
      paragraphs: [
        "Marie-Lannelongue est un établissement spécialisé dont les échanges avec les laboratoires sont fréquents. Précisez le service, l'heure limite et la température de conservation du prélèvement : nous confirmons la faisabilité avant d'engager la course.",
        "Hors de l'hôpital, la ville est une cité-jardin, avec des rues résidentielles tracées au cordeau. Les adresses sont faciles à trouver, mais le centre est piéton le week-end : prévenez-nous du point de remise exact.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements depuis l'hôpital Marie-Lannelongue ?", a: "Oui, en course dédiée, avec contenant isotherme sur demande." },
      { q: "Le centre piéton du Plessis-Robinson est-il un problème ?", a: "Non : le coursier s'arrête en limite de zone piétonne. Indiquez le point de remise." },
      { q: "Quel tarif au Plessis-Robinson ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "la-garenne-colombes": {
    landmarks: ["Gare de La Garenne-Colombes", "Colombes (limite)", "Paris La Défense (proche)", "Quartier des Champs-Philippe", "Courbevoie (limite)", "Seine (proche)"],
    intro: "La Garenne-Colombes est une petite commune dense, voisine de La Défense, avec une gare sur la ligne Paris Saint-Lazare – La Défense. Le centre se concentre autour de l'hôtel de ville et du quartier des Champs-Philippe.",
    logisticsContext: "La ville est bordée par Courbevoie, Colombes et Bois-Colombes. Les rues sont étroites et la circulation se densifie aux heures de pointe. Le deux-roues relie La Défense en quelques minutes.",
    keyClients: ["Petites entreprises de services", "Cabinets libéraux", "Commerces de proximité", "Proximité La Défense"],
    localGuide: {
      title: "La Garenne-Colombes : à côté de La Défense",
      paragraphs: [
        "La proximité de La Défense fait de La Garenne-Colombes un point de départ commode pour les envois vers les tours. Pour une remise dans un bureau de La Défense, indiquez la tour, l'accueil et un contact : le coursier est annoncé comme un visiteur.",
        "Dans la commune, la clientèle est surtout composée de cabinets, de petites sociétés et de commerces. Les envois sont des documents et des colis légers. Les rues étant petites, indiquez l'étage et le code d'entrée.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer à La Défense depuis La Garenne-Colombes ?", a: "Oui. La course est courte ; précisez la tour, l'accueil et un contact." },
      { q: "Faites-vous des tournées régulières depuis La Garenne-Colombes ?", a: "Oui, avec un compte entreprise, sur créneaux fixes et facturation mensuelle." },
      { q: "Quel tarif ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },
};
