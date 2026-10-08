/**
 * lib/zones/local-93.ts
 * Contenu propre aux communes de Seine-Saint-Denis (Montreuil est dans data-93).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_93: Record<string, LocalZoneContent> = {
  aubervilliers: {
    landmarks: ["Canal Saint-Denis", "Fort d'Aubervilliers", "Campus Condorcet", "Métro Mairie d'Aubervilliers", "Quartier du commerce de gros", "Paris 19e (limite)"],
    intro: "Aubervilliers est limitrophe du 19e arrondissement. Ancienne ville industrielle, elle concentre aujourd'hui l'un des plus grands pôles de commerce de gros d'Île-de-France, un campus universitaire de sciences humaines et sociales et des ateliers de métiers d'art.",
    logisticsContext: "Le canal Saint-Denis traverse la commune, et le commerce de gros génère un trafic de camionnettes très dense dans les rues proches. La ligne 12 relie la Mairie d'Aubervilliers à Paris. Le deux-roues évite l'encombrement du quartier des grossistes.",
    keyClients: ["Commerce de gros", "Campus Condorcet", "Ateliers de métiers d'art", "Entreprises du canal"],
    localGuide: {
      title: "Aubervilliers : commerce de gros, campus et ateliers",
      paragraphs: [
        "Le quartier des grossistes d'Aubervilliers fonctionne avec ses propres rythmes : arrivages le matin, livraisons dans l'après-midi, rues saturées de camionnettes. Pour un échantillon, un document de douane ou une commande urgente, la course dédiée évite d'attendre un camion. Indiquez la cour, le bâtiment et l'étage.",
        "Le campus Condorcet attire laboratoires, bibliothèques de recherche et équipes universitaires. Pour un envoi destiné à un bâtiment du campus, donnez le nom de l'équipe et un contact : les accueils sont distincts d'un bâtiment à l'autre.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans le quartier des grossistes d'Aubervilliers ?", a: "Oui. Donnez le nom de la cour, le bâtiment et l'étage pour que le coursier entre sans chercher." },
      { q: "Pouvez-vous livrer au campus Condorcet ?", a: "Oui, avec le bâtiment, le service et un contact sur place." },
      { q: "Quel tarif à Aubervilliers ?", a: "Aubervilliers est en petite couronne : dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  pantin: {
    landmarks: ["Canal de l'Ourcq", "Grands Moulins de Pantin", "Magasins généraux", "Centre national de la danse", "Cimetière parisien de Pantin", "RER E Pantin"],
    intro: "Pantin borde le canal de l'Ourcq, au nord-est de Paris 19e. L'ancienne friche industrielle est devenue un quartier d'agences, de sièges et de lieux culturels, installés dans les Grands Moulins, les Magasins généraux et le Centre national de la danse.",
    logisticsContext: "Le canal et la RN3 structurent Pantin. Les anciens bâtiments industriels reconvertis ont des entrées sur cour ou sur quai. Le coursier se présente avec le nom de l'entreprise et l'étage, et passe sans détour.",
    keyClients: ["Grands Moulins de Pantin", "Magasins généraux", "Centre national de la danse", "Agences et studios créatifs"],
    localGuide: {
      title: "Pantin : des friches industrielles devenues bureaux",
      paragraphs: [
        "À Pantin, les adresses les plus recherchées sont dans des bâtiments reconvertis : les Grands Moulins, les Magasins généraux, des anciens entrepôts du canal. Ils ont des accueils communs avec plusieurs entreprises. Donnez le nom de l'entreprise destinataire et l'étage, pas seulement le numéro de rue.",
        "Le quartier de la mode et de la création y livre des maquettes, des échantillons et des épreuves. Pour du matériel fragile, indiquez les dimensions et le poids : nous vérifions que le top-case de 18 kg convient avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les anciens sites industriels reconvertis ?", a: "Oui. Précisez le nom de l'entreprise, le bâtiment et l'étage : l'accueil est souvent partagé." },
      { q: "Pouvez-vous transporter des échantillons ou des maquettes ?", a: "Pour des pièces légères et protégées, oui, jusqu'à 18 kg. Au-delà, appelez-nous avant de commander." },
      { q: "Quel est le tarif de Pantin ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "saint-ouen": {
    landmarks: ["Marché aux puces de Saint-Ouen", "Mairie de Saint-Ouen (métro 14)", "Les Docks de Saint-Ouen", "Canal Saint-Denis", "Paris 18e (limite)", "Porte de Clignancourt"],
    intro: "Saint-Ouen-sur-Seine jouxte le 18e arrondissement par la Porte de Clignancourt. La ville est connue pour son marché aux puces, l'un des plus grands marchés d'antiquités du monde, et pour l'éco-quartier des Docks, bordant la Seine.",
    logisticsContext: "La ligne 14 relie désormais Saint-Ouen au centre de Paris, ce qui rapproche la ville. Le marché aux puces est difficile d'accès en voiture le week-end, quand les allées sont fermées à la circulation. Le coursier précise l'entrée à utiliser.",
    keyClients: ["Marché aux puces", "Antiquaires et galeristes", "Les Docks de Saint-Ouen", "Entreprises du canal"],
    localGuide: {
      title: "Saint-Ouen : antiquaires, marché et éco-quartier",
      paragraphs: [
        "Les antiquaires et marchands du marché aux puces envoient des objets précieux ou fragiles : bijoux, petits objets d'art, livres anciens. Précisez le conditionnement, la valeur et le mode de remise voulu. Pour un meuble ou un objet volumineux, un deux-roues ne convient pas : contactez-nous avant.",
        "Les week-ends, les allées du marché sont très fréquentées et la circulation est limitée. Donnez l'allée, le stand et un contact joignable. Dans les Docks, quartier récent, les adresses sont plus lisibles, avec des accueils d'immeuble classiques.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux stands du marché aux puces ?", a: "Oui. Donnez l'allée, le stand et un contact : la circulation est restreinte les jours d'affluence." },
      { q: "Pouvez-vous transporter un objet de valeur ?", a: "Pour un objet qui tient dans un top-case de 18 kg, avec remise contre signature. Pour une pièce plus grande ou de forte valeur, appelez-nous." },
      { q: "Quel tarif à Saint-Ouen ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  bobigny: {
    landmarks: ["Préfecture de la Seine-Saint-Denis", "Tribunal judiciaire de Bobigny", "Hôpital Avicenne", "Métro Bobigny - Pablo Picasso", "Tramway T1", "Université Sorbonne Paris Nord"],
    intro: "Bobigny est la préfecture de la Seine-Saint-Denis. Elle regroupe le tribunal judiciaire, l'hôtel du département, l'hôpital Avicenne et un campus de santé de l'université Sorbonne Paris Nord.",
    logisticsContext: "Le terminus de la ligne 5 et le tramway T1 desservent le centre. Les institutions se trouvent dans un périmètre restreint, à quelques minutes les unes des autres, mais entourées de grands axes : A86, RN3, canal de l'Ourcq.",
    keyClients: ["Tribunal judiciaire de Bobigny", "Préfecture de la Seine-Saint-Denis", "Hôpital Avicenne", "Université Sorbonne Paris Nord"],
    localGuide: {
      title: "Bobigny : tribunal, préfecture et hôpital",
      paragraphs: [
        "Pour les cabinets d'avocats du département, Bobigny est l'adresse du tribunal judiciaire : dépôts de pièces, remises d'actes, transmissions entre confrères. Précisez le service destinataire et l'heure limite de dépôt ; la remise est horodatée et nominative.",
        "L'hôpital Avicenne et le campus de santé voisin produisent des échanges d'échantillons et de dossiers. Pour un prélèvement, donnez le service, le délai de stabilité et la température de conservation : nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un acte au tribunal de Bobigny ?", a: "Oui. Course dédiée, remise contre signature et justificatif horodaté. Indiquez le service et l'heure limite de dépôt." },
      { q: "Transportez-vous des prélèvements vers l'hôpital Avicenne ?", a: "Oui, avec contenant isotherme à la demande et service destinataire précisé à la commande." },
      { q: "Quel tarif à Bobigny ?", a: "Bobigny est en petite couronne : dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  drancy: {
    landmarks: ["Cité de la Muette", "Mémorial de la Shoah de Drancy", "RER B Le Bourget - Drancy", "Tramway T1", "A86", "Aéroport du Bourget (proche)"],
    intro: "Drancy est une commune dense du nord-est de la petite couronne, entre Bobigny, Le Bourget et Le Blanc-Mesnil. Elle abrite le Mémorial de la Shoah de Drancy, installé dans la cité de la Muette, des zones d'activité et de nombreux petits commerces.",
    logisticsContext: "Le tramway T1 et le RER B desservent la ville, l'A86 la contourne. Les grands axes se chargent aux heures de pointe. Le coursier choisit l'itinéraire selon les fermetures de voie du moment.",
    keyClients: ["Mémorial de la Shoah de Drancy", "Zones d'activité", "Commerces du centre", "PME de services"],
    localGuide: {
      title: "Drancy : zones d'activité entre Bobigny et Le Bourget",
      paragraphs: [
        "Drancy est une commune de transit pour les entreprises du nord-est : zones d'activité, entrepôts, petites industries. Les horaires de réception sont stricts, et l'heure limite de remise fixe le départ. Donnez le nom de la société, le bâtiment et le contact au quai.",
        "Le Mémorial et les établissements culturels et éducatifs de la ville échangent des documents et du petit matériel. Pour un envoi destiné au Mémorial, indiquez le service et un contact : les accès sont encadrés.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les zones d'activité de Drancy ?", a: "Oui, avec le nom de la société, le bâtiment et un contact au quai." },
      { q: "Pouvez-vous livrer au Mémorial de la Shoah de Drancy ?", a: "Oui, avec le nom du destinataire et un contact : les accès sont encadrés." },
      { q: "Quel tarif à Drancy ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "aulnay-sous-bois": {
    landmarks: ["Hôpital Robert-Ballanger", "RER B Aulnay-sous-Bois", "Parc Dupeyroux", "Paris Nord 2 (limite)", "A1 et A3", "Ancien site industriel automobile"],
    intro: "Aulnay-sous-Bois est une grande commune du nord-est de la Seine-Saint-Denis, proche de l'aéroport de Roissy. Elle accueille l'hôpital intercommunal Robert-Ballanger, d'anciennes grandes usines en reconversion et de vastes zones d'activité.",
    logisticsContext: "Le RER B coupe la ville du sud au nord, et deux autoroutes, l'A1 et l'A3, la bordent. La commune est étendue : du centre aux zones d'activité du nord, les distances comptent. Le deux-roues gagne du temps sur la RN2 et la RD115.",
    keyClients: ["Hôpital Robert-Ballanger", "Zones d'activité", "Logisticiens", "PME de services"],
    localGuide: {
      title: "Aulnay-sous-Bois : hôpital, zones d'activité et Roissy",
      paragraphs: [
        "L'hôpital Robert-Ballanger est le principal établissement de la commune : prélèvements, dossiers et pièces circulent entre ses services et les laboratoires voisins. Donnez le service, l'heure limite, et pour un échantillon la température et le délai de stabilité.",
        "Le nord de la ville est tourné vers Roissy : entreprises de logistique, transitaires, prestataires aéroportuaires. Une course d'Aulnay vers l'aéroport relève des tarifs hors petite couronne. Demandez un devis en précisant l'heure et le terminal.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements vers l'hôpital Robert-Ballanger ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Livrez-vous vers l'aéroport de Roissy depuis Aulnay ?", a: "Oui, sur devis. Précisez l'heure et le terminal ou la zone de fret." },
      { q: "Quel tarif à Aulnay-sous-Bois ?", a: "Aulnay est en petite couronne : dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  bondy: {
    landmarks: ["Hôpital Jean-Verdier", "Canal de l'Ourcq", "Forêt de Bondy", "RER E Bondy", "Tramway T1 et T4", "Noisy-le-Sec (limite)"],
    intro: "Bondy est au carrefour du canal de l'Ourcq, du RER E et de deux lignes de tramway, le T1 et le T4. La commune accueille l'hôpital Jean-Verdier, et s'ouvre à l'est sur la forêt de Bondy.",
    logisticsContext: "La gare de Bondy est un nœud de correspondances entre RER et tramways. Aux abords, les rues sont étroites et le trafic dense le matin et en fin d'après-midi. Le deux-roues traverse sans attendre aux croisements.",
    keyClients: ["Hôpital Jean-Verdier", "Artisans et PME", "Commerces du centre", "Canal de l'Ourcq"],
    localGuide: {
      title: "Bondy : canal, forêt et hôpital Jean-Verdier",
      paragraphs: [
        "Jean-Verdier est un hôpital de l'AP-HP où circulent prélèvements et dossiers cliniques. Indiquez le service destinataire et l'heure limite à la commande ; pour un échantillon, précisez la température de conservation et le délai de stabilité fixés par le laboratoire.",
        "Le long du canal, les ateliers et les entrepôts restent actifs. Les adresses y sont parfois en cour, avec accès par un portail. Donnez le code ou un numéro à appeler à l'arrivée du coursier.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'hôpital Jean-Verdier ?", a: "Oui, en course dédiée. Précisez le service et, pour un prélèvement, la contrainte de température." },
      { q: "Desservez-vous les adresses en cour le long du canal ?", a: "Oui. Donnez le code du portail ou un numéro joignable." },
      { q: "Quel tarif à Bondy ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "rosny-sous-bois": {
    landmarks: ["Centre commercial Rosny 2", "Métro Rosny - Bois-Perrier (ligne 11)", "RER E Rosny-Bois-Perrier", "Plateau d'Avron", "Fort de Rosny", "A86"],
    intro: "Rosny-sous-Bois abrite Rosny 2, l'un des plus grands centres commerciaux d'Île-de-France, et le terminus de la ligne 11 du métro. La ville est aussi desservie par le RER E et possède un important tissu de bureaux autour du centre commercial.",
    logisticsContext: "Le centre commercial génère un trafic de livraison permanent, avec des quais et des horaires dédiés. Le coursier précise l'entrée de service et le magasin avant d'arriver. La ligne 11 et le RER E rapprochent la ville de Paris, mais les routes restent chargées.",
    keyClients: ["Rosny 2", "Enseignes du centre commercial", "Bureaux du centre-ville", "Commerces"],
    localGuide: {
      title: "Rosny-sous-Bois : un centre commercial comme adresse",
      paragraphs: [
        "Livrer dans un centre commercial ne ressemble pas à une livraison de rue. Le coursier entre par une entrée de service, passe par un poste de sécurité et remet à un responsable de magasin. Donnez le nom de l'enseigne, le numéro de lot et le contact du responsable.",
        "Les magasins attendent souvent des pièces de remplacement, des documents de caisse ou de l'affichage. Les horaires d'ouverture et de livraison varient : précisez l'heure limite, car les accès changent en fin de journée.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans un magasin de Rosny 2 ?", a: "Oui. Indiquez l'enseigne, le numéro de lot et un contact : l'entrée de service est distincte de l'entrée public." },
      { q: "Peut-on prévoir un passage régulier pour un magasin ?", a: "Oui, par tournées à créneaux fixes avec un compte entreprise." },
      { q: "Quel tarif à Rosny-sous-Bois ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "epinay-sur-seine": {
    landmarks: ["Studios d'Épinay", "Seine", "Gare d'Épinay-sur-Seine", "Tramway T8", "A86", "Saint-Denis (limite)"],
    intro: "Épinay-sur-Seine, sur la rive de la Seine, est connue pour ses studios de cinéma et de télévision. La commune est desservie par le RER C, la ligne H et le tramway T8, et jouxte Saint-Denis.",
    logisticsContext: "La gare d'Épinay-sur-Seine concentre trains et tramways. Les studios et les ateliers de production sont installés en bord de Seine, loin du centre-ville. Le coursier doit connaître le plateau ou l'entrée de service pour éviter les retards.",
    keyClients: ["Studios d'Épinay", "Maisons de production", "Équipes de tournage", "PME de services"],
    localGuide: {
      title: "Épinay-sur-Seine : studios et plateaux",
      paragraphs: [
        "Un tournage fonctionne avec un planning serré : un accessoire, un document ou un disque dur qui arrive en retard peut bloquer un plateau. Donnez le nom de la production, le plateau, le régisseur et un numéro direct. Le coursier est attendu à l'entrée de service.",
        "Les envois sont majoritairement légers : accessoires, costumes, scripts, supports de stockage. Précisez le poids et la fragilité à la commande, afin que nous confirmions que le deux-roues convient.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer sur un plateau de tournage à Épinay ?", a: "Oui. Donnez la production, le plateau et le contact régie." },
      { q: "Transportez-vous des supports de stockage ou des accessoires ?", a: "Oui, pour des pièces légères et protégées, dans la limite de 18 kg." },
      { q: "Quel tarif à Épinay-sur-Seine ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "noisy-le-sec": {
    landmarks: ["Gare de Noisy-le-Sec", "Faisceau ferroviaire", "RER E", "Tramway T1", "A3", "Bondy (limite)"],
    intro: "Noisy-le-Sec est un nœud ferroviaire de l'est parisien : sa gare, le RER E et un grand faisceau de voies structurent la ville. Elle est voisine de Bobigny, Bondy et Romainville.",
    logisticsContext: "Les voies ferrées coupent la commune en deux, avec peu de passages. Selon le côté, le trajet vers une adresse proche peut faire un détour de plusieurs minutes. Précisez le côté de la voie et le quartier.",
    keyClients: ["Entreprises liées au rail", "PME et artisans", "Commerces du centre", "Services"],
    localGuide: {
      title: "Noisy-le-Sec : une ville coupée par le rail",
      paragraphs: [
        "Pour une adresse de Noisy-le-Sec, le côté de la voie ferrée change beaucoup le trajet : les ponts et passages sont peu nombreux. Indiquez la rue transversale et le côté, pour que le coursier choisisse le bon passage d'emblée.",
        "Les entreprises de la commune sont souvent liées au fret ferroviaire ou à l'artisanat : documents de transport, pièces de rechange, commandes. Pour un envoi urgent entre un site de Noisy et un client de Paris, la course dédiée évite les ruptures de charge.",
      ],
    },
    faq: [
      { q: "Livrez-vous de chaque côté des voies à Noisy-le-Sec ?", a: "Oui. Donnez la rue transversale et le côté de la voie ferrée." },
      { q: "Pouvez-vous transporter des documents de transport ou des pièces de rechange ?", a: "Oui, en course dédiée, avec remise contre signature." },
      { q: "Quel tarif à Noisy-le-Sec ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  villepinte: {
    landmarks: ["Paris Nord Villepinte (parc des expositions)", "RER B Parc des Expositions", "Roissy - Charles-de-Gaulle (proche)", "A1", "A104", "Paris Nord 2"],
    intro: "Villepinte accueille le parc des expositions Paris Nord Villepinte, qui reçoit de grands salons professionnels internationaux. La commune est desservie par le RER B, à proximité immédiate de l'aéroport de Roissy.",
    logisticsContext: "Pendant les salons, les accès au parc des expositions sont saturés, avec des files de véhicules sur l'A1 et l'A104. La station RER Parc des Expositions concentre les visiteurs. Un coursier en deux-roues contourne les files, mais doit connaître la porte d'accès exposant.",
    keyClients: ["Parc des expositions", "Exposants de salons", "Organisateurs", "Entreprises de Paris Nord 2"],
    localGuide: {
      title: "Villepinte : livrer sur un salon professionnel",
      paragraphs: [
        "Sur un salon, une livraison se joue au mètre près : numéro de hall, numéro de stand, porte exposant, créneau de montage. Donnez ces informations, ainsi que le nom du responsable du stand et un numéro direct. Sans cela, le coursier attend à l'entrée.",
        "Les exposants ont souvent besoin de dépannages : documents oubliés, échantillons, matériel de démonstration. Pour une livraison en cours de salon, une course immédiate part dans l'heure. Pour le montage, planifiez le créneau à l'avance.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer un stand en plein salon ?", a: "Oui, avec le hall, le stand et un contact. Les accès exposants sont contrôlés." },
      { q: "Livrez-vous les jours de montage et de démontage ?", a: "Oui, en planifiant le créneau et la porte d'entrée à l'avance." },
      { q: "Quel est le tarif pour Villepinte ?", a: "Villepinte relève d'un devis, la zone étant hors petite couronne. Il est donné en moins de 2 heures." },
    ],
  },

  "tremblay-en-france": {
    landmarks: ["Zone aéroportuaire de Roissy - Charles-de-Gaulle", "Paris Nord 2 (proche)", "A1", "A104", "N2", "Zones de fret"],
    intro: "Tremblay-en-France se trouve en partie sur le site de l'aéroport de Roissy – Charles-de-Gaulle. La commune réunit zones de fret, hôtels d'aéroport, entreprises de services aéroportuaires et un tissu résidentiel plus calme.",
    logisticsContext: "L'aéroport impose ses règles : accès contrôlés, badges, files de contrôle. Les entreprises de la zone de fret ont des horaires de réception et des quais numérotés. Une course vers l'aéroport nécessite le nom du terminal ou de la zone de fret.",
    keyClients: ["Zones de fret de Roissy", "Hôtels d'aéroport", "Transitaires", "Entreprises de services"],
    localGuide: {
      title: "Tremblay-en-France : la zone aéroportuaire de Roissy",
      paragraphs: [
        "À Tremblay, l'adresse compte moins que la zone : terminal, zone de fret, hôtel, entreprise sous douane. Donnez le nom exact de la zone et le contact sur place. Un coursier qui arrive à l'aéroport sans badge ni nom de destinataire perd du temps aux contrôles.",
        "Les envois urgents sont typiquement des documents de transport, des pièces aéronautiques ou des échantillons. Précisez le poids, le contenu et l'heure limite : un avion qui part ne se rattrape pas. Nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans la zone de fret de Roissy ?", a: "Oui, avec le nom de la zone, le quai et un contact. Les accès sont contrôlés." },
      { q: "Pouvez-vous respecter l'heure d'un vol ?", a: "Nous confirmons la faisabilité avant le départ. Indiquez l'heure limite exacte et le point de remise." },
      { q: "Quel tarif pour Tremblay-en-France ?", a: "Sur devis, la commune étant hors petite couronne et liée à l'aéroport. Réponse en moins de 2 heures." },
    ],
  },

  "le-blanc-mesnil": {
    landmarks: ["RER B Le Blanc-Mesnil", "Zones d'activité", "A1", "Le Bourget (limite)", "Drancy (limite)", "Centre-ville"],
    intro: "Le Blanc-Mesnil est une commune dense du nord de la Seine-Saint-Denis, voisine du Bourget, de Drancy et d'Aulnay-sous-Bois. Desservie par le RER B, elle compte plusieurs zones d'activité le long de l'A1.",
    logisticsContext: "Le RER B et l'A1 encadrent la ville. Les zones d'activité sont séparées du centre par des voies rapides et des carrefours chargés. Pour une adresse en zone d'activité, donnez le nom de la voie, le bâtiment et le quai.",
    keyClients: ["Zones d'activité", "PME logistiques", "Commerces du centre", "Services B2B"],
    localGuide: {
      title: "Le Blanc-Mesnil : zones d'activité le long de l'A1",
      paragraphs: [
        "Les zones d'activité du Blanc-Mesnil accueillent des entrepôts, des PME et des services aux entreprises. Les adresses se ressemblent : voie, numéro, quai. Donnez le nom du bâtiment, l'accueil et un contact au quai. Les horaires de réception sont strictes.",
        "Ces sociétés envoient surtout des documents, des pièces de rechange et des échantillons à Paris et dans les départements voisins. Pour des échanges réguliers, une tournée sur créneaux fixes est plus économique que des courses à l'unité.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les zones d'activité du Blanc-Mesnil ?", a: "Oui, avec le nom du bâtiment, le quai et un contact." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes et facturation mensuelle." },
      { q: "Quel tarif au Blanc-Mesnil ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  gagny: {
    landmarks: ["RER E Gagny", "Forêt de Bondy (limite)", "Plateau d'Avron", "A3", "Neuilly-sur-Marne (limite)", "Villemomble (limite)"],
    intro: "Gagny est une commune résidentielle de l'est de la Seine-Saint-Denis, en bordure de la forêt régionale de Bondy. Desservie par le RER E, elle compte un centre commerçant et de nombreux cabinets de professions de santé.",
    logisticsContext: "La gare de Gagny relie Paris Haussmann–Saint-Lazare par le RER E. Les rues résidentielles sont calmes, mais la RN302 se charge aux heures de pointe. Le deux-roues relie Gagny à Villemomble et Rosny sans attendre.",
    keyClients: ["Professions de santé", "Cabinets libéraux", "Commerces du centre", "PME locales"],
    localGuide: {
      title: "Gagny : cabinets de santé et lisière de forêt",
      paragraphs: [
        "À Gagny, une bonne part des envois viennent de cabinets : médecins, kinésithérapeutes, dentistes, professions de santé qui envoient des prélèvements, des radios et des dossiers. Indiquez le laboratoire destinataire, la contrainte de température et l'heure limite.",
        "Les adresses résidentielles proches de la forêt de Bondy sont parfois difficiles à trouver : allées privées, impasses. Donnez le numéro, le code et un contact pour que le coursier arrive sans détour.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements depuis un cabinet de Gagny ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande et délai de stabilité à indiquer." },
      { q: "Livrez-vous dans les impasses et allées privées ?", a: "Oui. Donnez le code et un contact joignable." },
      { q: "Quel tarif à Gagny ?", a: "Dès 22 € HT en planifié, 30 € HT en immédiat." },
    ],
  },

  "neuilly-sur-marne": {
    landmarks: ["Hôpital de Ville-Évrard", "Hôpital Maison-Blanche", "Bords de Marne", "A4 (proche)", "Neuilly-Plaisance (limite)", "Noisy-le-Grand (limite)"],
    intro: "Neuilly-sur-Marne, sur la rive de la Marne, est connue pour ses deux grands établissements de santé mentale, Ville-Évrard et Maison-Blanche. Elle est voisine de Noisy-le-Grand et de Neuilly-Plaisance.",
    logisticsContext: "Les établissements hospitaliers occupent de vastes domaines, avec plusieurs portes d'entrée et des bâtiments dispersés. Le coursier a besoin du nom du pavillon ou du service pour trouver le bon accueil dans le domaine.",
    keyClients: ["Hôpital de Ville-Évrard", "Hôpital Maison-Blanche", "Bords de Marne", "PME locales"],
    localGuide: {
      title: "Neuilly-sur-Marne : de grands domaines hospitaliers",
      paragraphs: [
        "Ville-Évrard et Maison-Blanche sont des domaines de plusieurs hectares, avec une dizaine de pavillons. Une adresse « hôpital » ne suffit pas : donnez le pavillon, le service et un contact. Sans cela, un coursier peut chercher longtemps l'accueil du bon bâtiment.",
        "Hors des hôpitaux, la ville est résidentielle, entre la Marne et les axes vers Noisy-le-Grand. Les professionnels y envoient des dossiers et des petits colis. La remise en main propre contre signature est la règle.",
      ],
    },
    faq: [
      { q: "Livrez-vous à l'hôpital de Ville-Évrard ou à Maison-Blanche ?", a: "Oui. Précisez le pavillon, le service et un contact : les domaines sont vastes." },
      { q: "Desservez-vous les bords de Marne ?", a: "Oui, comme le reste de la commune." },
      { q: "Quel tarif à Neuilly-sur-Marne ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },

  "livry-gargan": {
    landmarks: ["Forêt de Bondy", "Tramway T4", "Hôpital intercommunal de Montfermeil (proche)", "A3", "A86 (proche)", "Centre-ville"],
    intro: "Livry-Gargan est une grande commune pavillonnaire de l'est de la Seine-Saint-Denis, bordée par la forêt de Bondy. Elle est desservie par le tramway T4 et se situe à proximité de l'hôpital intercommunal de Montfermeil.",
    logisticsContext: "La ville s'étire le long du tramway T4 et de la RN3. Les zones pavillonnaires ont des rues étroites et peu de voies de transit. Pour une adresse en retrait, un numéro précis et un contact évitent un détour.",
    keyClients: ["Professions de santé", "Artisans", "Commerces du centre", "PME locales"],
    localGuide: {
      title: "Livry-Gargan : une ville pavillonnaire le long du T4",
      paragraphs: [
        "Livry-Gargan est surtout composée de quartiers pavillonnaires, avec peu de bureaux. Les envois viennent d'artisans, de professionnels de santé, de petits commerces : plis, colis légers, échantillons. L'adresse exacte et un numéro de téléphone sont essentiels, car les rues se ressemblent.",
        "Pour un prélèvement à destination d'un laboratoire de Paris ou de l'hôpital de Montfermeil, précisez la température de conservation et le délai de stabilité : nous confirmons la faisabilité avant d'engager la course.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les quartiers pavillonnaires de Livry-Gargan ?", a: "Oui. Donnez le numéro, le code éventuel et un contact joignable." },
      { q: "Transportez-vous des prélèvements vers l'hôpital de Montfermeil ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif à Livry-Gargan ?", a: "Dès 22 € HT en planifié et 30 € HT en immédiat." },
    ],
  },
};
