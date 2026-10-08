/**
 * lib/zones/local-91.ts
 * Contenu propre aux communes de l'Essonne (grande couronne : tarif sur devis).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_91: Record<string, LocalZoneContent> = {
  "evry-courcouronnes": {
    landmarks: ["Préfecture de l'Essonne", "Tribunal judiciaire d'Évry", "Cathédrale de la Résurrection", "Genopole", "Université d'Évry", "RER D Évry-Courcouronnes"],
    intro: "Évry-Courcouronnes est la préfecture de l'Essonne et une ville nouvelle bâtie dans les années 1970. Elle réunit la préfecture, le tribunal judiciaire, une université et Genopole, un pôle de biotechnologies reconnu en Europe.",
    logisticsContext: "Le RER D, la Francilienne et l'A6 desservent la ville. Les équipements publics sont regroupés autour de l'Agora et de la cathédrale, tandis que Genopole occupe un campus à part. Le coursier distingue ces pôles dès la commande.",
    keyClients: ["Préfecture de l'Essonne", "Tribunal judiciaire d'Évry", "Genopole", "Université d'Évry"],
    localGuide: {
      title: "Évry-Courcouronnes : administration, justice et biotechnologies",
      paragraphs: [
        "Pour les cabinets d'avocats de l'Essonne, Évry est l'adresse du tribunal judiciaire. Dépôts de pièces, remises d'actes, transmissions entre confrères : l'heure limite fixée par le greffe commande le départ. Précisez-la à la commande, avec le service destinataire.",
        "Genopole regroupe laboratoires, entreprises de biotechnologies et centres de recherche. Les échanges d'échantillons y sont fréquents. Pour un prélèvement ou un réactif, indiquez la température de conservation et le délai de stabilité. Évry étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un acte au tribunal judiciaire d'Évry ?", a: "Oui, en course dédiée, avec remise contre signature et justificatif horodaté. Indiquez le service et l'heure limite." },
      { q: "Livrez-vous à Genopole ?", a: "Oui, avec le nom du laboratoire, le bâtiment et un contact. Pour un échantillon, précisez la température de conservation." },
      { q: "Quel est le tarif pour Évry ?", a: "Évry est en grande couronne : le prix est établi sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  massy: {
    landmarks: ["Gare TGV Massy-Palaiseau", "RER B et C Massy-Palaiseau", "Opéra de Massy", "Quartier Atlantis", "A10", "Pôle scientifique de Saclay (proche)"],
    intro: "Massy est une commune du nord de l'Essonne, dotée d'une gare qui réunit TGV, RER B et RER C. Elle est voisine de Palaiseau et du plateau de Saclay, et accueille des bureaux, un opéra et de grands quartiers résidentiels.",
    logisticsContext: "La gare de Massy-Palaiseau est un nœud majeur de la grande couronne sud : les correspondances RER y croisent les trains à grande vitesse. Aux abords, la circulation est dense aux heures de pointe. Le deux-roues relie le quartier d'affaires à l'A10 et à Paris.",
    keyClients: ["Quartier d'affaires de la gare", "Opéra de Massy", "Bureaux et sièges régionaux", "Commerces du centre"],
    localGuide: {
      title: "Massy : la gare TGV comme point d'ancrage",
      paragraphs: [
        "La gare TGV de Massy-Palaiseau est la porte d'entrée du sud de l'Île-de-France. Un document à remettre à un voyageur, un colis à récupérer en gare : précisez le train, le quai ou le point de rendez-vous et l'heure, car le temps d'accès aux voies est court.",
        "Autour de la gare, des immeubles de bureaux accueillent des entreprises tertiaires. Chaque bâtiment a son accueil et ses horaires. Donnez le nom de l'entreprise, l'étage et un contact. Massy étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous remettre un colis à un voyageur à la gare de Massy-Palaiseau ?", a: "Oui, si le point de rendez-vous et l'heure sont précis. Nous confirmons la faisabilité avant d'envoyer le coursier." },
      { q: "Livrez-vous dans les bureaux autour de la gare ?", a: "Oui, avec l'entreprise, l'étage et un contact à l'accueil." },
      { q: "Quel est le tarif pour Massy ?", a: "Massy est en grande couronne : le prix est établi sur devis, donné en moins de 2 heures." },
    ],
  },

  palaiseau: {
    landmarks: ["École polytechnique", "Télécom Paris", "Institut d'optique", "Plateau de Saclay", "RER B Palaiseau", "A10"],
    intro: "Palaiseau est une ville universitaire et scientifique : elle abrite l'École polytechnique, Télécom Paris et l'Institut d'optique, sur le plateau de Saclay. Le centre-ville, plus bas, est desservi par le RER B.",
    logisticsContext: "Le plateau et la ville basse sont séparés par un dénivelé. Les campus sont étendus, avec plusieurs portes et un contrôle d'accès. Le coursier a besoin du nom du laboratoire et du bâtiment pour être orienté dès l'entrée.",
    keyClients: ["École polytechnique", "Télécom Paris", "Institut d'optique", "Laboratoires du plateau de Saclay"],
    localGuide: {
      title: "Palaiseau : les campus du plateau de Saclay",
      paragraphs: [
        "Les campus de Palaiseau ne sont pas des adresses de rue : ce sont des ensembles de bâtiments, avec des guérites, des badges et des laboratoires numérotés. Un colis adressé « à l'École » sans laboratoire ni bâtiment peut errer. Donnez le laboratoire, le bâtiment et un contact.",
        "Les laboratoires reçoivent du matériel scientifique, des composants, des échantillons. Pour des pièces fragiles ou sensibles, précisez les dimensions, le poids et la fragilité : nous vérifions que le top-case de 18 kg convient. La commune étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur les campus de Palaiseau ?", a: "Oui, avec le laboratoire, le bâtiment et un contact. Les accès sont contrôlés." },
      { q: "Transportez-vous du matériel scientifique ?", a: "Oui pour des pièces légères et protégées, jusqu'à 18 kg. Au-delà, appelez-nous." },
      { q: "Quel tarif pour Palaiseau ?", a: "Sur devis, la commune étant en grande couronne. Réponse en moins de 2 heures." },
    ],
  },

  "les-ulis": {
    landmarks: ["Parc de Courtabœuf", "A10", "Villebon-sur-Yvette (limite)", "Orsay (proche)", "Zone d'activité", "Quartier des Ulis"],
    intro: "Les Ulis est une ville nouvelle de la vallée de l'Yvette, adossée au parc de Courtabœuf, l'une des plus grandes zones d'activité d'Île-de-France. Elle est desservie par l'A10 et se situe aux portes du plateau de Saclay.",
    logisticsContext: "Le parc de Courtabœuf s'étend sur des centaines d'hectares, avec des voies numérotées et des entrées multiples. L'A10 et la N118 relient le parc à Paris. Donner le nom exact de la rue et de l'entreprise évite de longs détours.",
    keyClients: ["Parc de Courtabœuf", "Entreprises technologiques", "Centres de recherche", "Commerces des Ulis"],
    localGuide: {
      title: "Les Ulis : l'immense zone de Courtabœuf",
      paragraphs: [
        "Courtabœuf est une zone d'activité où les entreprises se ressemblent : mêmes bâtiments, mêmes ronds-points. Indiquez le nom de la voie, le numéro du bâtiment et un contact. Sans ces informations, une course peut perdre vingt minutes à chercher l'entrée.",
        "Les entreprises du parc envoient des pièces, des échantillons, des documents de livraison. Pour un envoi sensible, précisez la fragilité et le poids. La commune étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous à Courtabœuf ?", a: "Oui. Donnez la voie, le numéro du bâtiment et un contact : le parc est vaste." },
      { q: "Quel est le délai pour rejoindre Paris depuis Les Ulis ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
      { q: "Quel tarif pour Les Ulis ?", a: "Sur devis, la commune étant en grande couronne." },
    ],
  },

  longjumeau: {
    landmarks: ["Centre hospitalier de Longjumeau", "Gare de Longjumeau (RER C)", "A10", "Chilly-Mazarin (limite)", "Palaiseau (proche)", "Centre historique"],
    intro: "Longjumeau est une ville historique du nord de l'Essonne, desservie par le RER C et dotée d'un centre hospitalier. Elle est voisine de Chilly-Mazarin et de Palaiseau.",
    logisticsContext: "La ville se concentre autour de son centre ancien, avec des rues étroites. Les zones d'activité de Chilly-Mazarin, juste à côté, génèrent un trafic de camionnettes. Le deux-roues relie le centre aux zones voisines sans dépendre du stationnement.",
    keyClients: ["Centre hospitalier de Longjumeau", "Professions libérales", "PME de services", "Commerces du centre"],
    localGuide: {
      title: "Longjumeau : centre hospitalier et petites entreprises",
      paragraphs: [
        "Le centre hospitalier de Longjumeau échange avec les laboratoires du sud de l'Île-de-France. Pour un prélèvement, donnez le service destinataire, l'heure limite, la température de conservation et le délai de stabilité. Nous confirmons la faisabilité avant d'engager le coursier.",
        "Le centre-ville regroupe cabinets, commerces et PME. Les envois y sont des plis, des documents et des colis légers. La remise en main propre contre signature est la règle. Longjumeau étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements depuis le centre hospitalier de Longjumeau ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Livrez-vous à Chilly-Mazarin depuis Longjumeau ?", a: "Oui, les deux communes sont voisines. Le tarif est établi sur devis." },
      { q: "Quel tarif pour Longjumeau ?", a: "Sur devis, la commune étant en grande couronne. Réponse en moins de 2 heures." },
    ],
  },

  "corbeil-essonnes": {
    landmarks: ["Centre hospitalier Sud Francilien", "Grands Moulins de Corbeil", "Seine", "RER D Corbeil-Essonnes", "A6", "Cathédrale Saint-Spire"],
    intro: "Corbeil-Essonnes est une ville ancienne au confluent de la Seine et de l'Essonne. Elle accueille le centre hospitalier Sud Francilien, l'un des plus grands hôpitaux de la région, et conserve les Grands Moulins de Corbeil.",
    logisticsContext: "Le centre hospitalier est à l'extérieur du centre-ville, sur un vaste site, avec plusieurs entrées. La Seine et la voie ferrée limitent les passages. Le coursier choisit l'itinéraire selon la destination : hôpital, centre ou zone industrielle.",
    keyClients: ["Centre hospitalier Sud Francilien", "Grands Moulins de Corbeil", "Zones d'activité", "Professions libérales"],
    localGuide: {
      title: "Corbeil-Essonnes : un grand hôpital et une ville de confluent",
      paragraphs: [
        "Le Sud Francilien est un hôpital de grande taille, avec de nombreux services et laboratoires. Un colis adressé à l'hôpital sans service ni bâtiment attend longtemps. Donnez le service, l'étage et un contact. Pour un prélèvement, précisez la température et le délai de stabilité.",
        "Le centre-ville, autour de la cathédrale et de la Seine, est un tissu de cabinets, commerces et PME. Les envois y sont des plis et des documents. La commune étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous au centre hospitalier Sud Francilien ?", a: "Oui. Précisez le service, le bâtiment et un contact." },
      { q: "Transportez-vous des prélèvements vers Paris depuis Corbeil ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Corbeil-Essonnes ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "sainte-genevieve-des-bois": {
    landmarks: ["Cimetière russe", "RER C Sainte-Geneviève-des-Bois", "A6", "Villemoisson (limite)", "Saint-Michel-sur-Orge (limite)", "Centre-ville"],
    intro: "Sainte-Geneviève-des-Bois est une commune de l'Essonne connue pour son cimetière russe, où reposent des personnalités de l'émigration russe. Elle est desservie par le RER C et jouxte Saint-Michel-sur-Orge.",
    logisticsContext: "La ville est surtout résidentielle, avec une zone d'activité au nord et un centre commerçant. L'A6 passe à proximité. Les rues pavillonnaires sont étroites : un numéro précis et un contact évitent un détour.",
    keyClients: ["PME industrielles", "Zone d'activité", "Professions libérales", "Commerces du centre"],
    localGuide: {
      title: "Sainte-Geneviève-des-Bois : entre ville résidentielle et zone d'activité",
      paragraphs: [
        "Les entreprises de la commune sont installées dans une zone d'activité séparée des quartiers d'habitation. Les horaires de réception y sont stricts : précisez l'heure limite, le nom du bâtiment et un contact au quai.",
        "Les professions libérales du centre envoient des plis et des documents. Les prélèvements des médecins partent vers les laboratoires voisins : température de conservation et délai de stabilité sont à préciser. Le tarif de la grande couronne est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans la zone d'activité de Sainte-Geneviève-des-Bois ?", a: "Oui, avec le nom du bâtiment, le quai et un contact." },
      { q: "Quel est le délai pour rejoindre Paris ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
      { q: "Quel tarif pour Sainte-Geneviève-des-Bois ?", a: "Sur devis, la commune étant en grande couronne." },
    ],
  },

  "viry-chatillon": {
    landmarks: ["Seine", "A6", "Grigny (limite)", "Juvisy-sur-Orge (proche)", "RER D", "Bords de Seine"],
    intro: "Viry-Châtillon s'étend au bord de la Seine, entre Juvisy-sur-Orge et Grigny, à une vingtaine de kilomètres de Paris. La commune est résidentielle, avec un centre commerçant et des zones d'activité le long de l'A6.",
    logisticsContext: "L'A6 coupe la commune, et la Seine borde les quartiers est. Les ponts sont peu nombreux : la circulation se concentre aux heures de pointe. Le coursier choisit l'itinéraire en tenant compte du trafic.",
    keyClients: ["PME locales", "Professions libérales", "Commerces du centre", "Zones d'activité"],
    localGuide: {
      title: "Viry-Châtillon : entre la Seine et l'A6",
      paragraphs: [
        "À Viry-Châtillon, les trajets vers Paris passent presque toujours par l'A6 : un accident ou un ralentissement modifie le délai de façon sensible. Nous annonçons un délai réaliste à la confirmation, et nous adaptons l'itinéraire si le trafic l'exige.",
        "La clientèle locale est composée de PME, de cabinets et de commerces. Les envois sont des plis, des documents et des colis légers. Pour des échanges réguliers, une tournée à créneaux fixes est plus économique. La commune étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Les embouteillages de l'A6 retardent-ils la livraison ?", a: "Le deux-roues est moins sensible à la congestion. Nous annonçons un délai réaliste à la confirmation." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif pour Viry-Châtillon ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "juvisy-sur-orge": {
    landmarks: ["Gare de Juvisy", "Observatoire Camille-Flammarion", "Seine", "Orge", "RER C et D", "Aéroport d'Orly (proche)"],
    intro: "Juvisy-sur-Orge est un nœud ferroviaire majeur du sud de Paris, où les lignes du RER C et du RER D se croisent. La commune se situe au confluent de la Seine et de l'Orge et abrite l'observatoire de l'astronome Camille Flammarion.",
    logisticsContext: "La gare de Juvisy est un point de correspondance très fréquenté : le centre-ville s'organise autour. Les voies ferrées limitent les passages, et la proximité d'Orly alourdit la circulation. Le coursier choisit son itinéraire selon le côté de la voie.",
    keyClients: ["Commerces de la gare", "Professions libérales", "PME", "Observatoire Camille-Flammarion"],
    localGuide: {
      title: "Juvisy-sur-Orge : la gare au centre de tout",
      paragraphs: [
        "À Juvisy, le côté de la voie ferrée change le trajet. Pour une adresse proche de la gare, indiquez si elle est côté Seine ou côté Orge. Cela évite au coursier un détour par un passage souterrain ou un pont.",
        "Les envois locaux sont des plis, des documents et des colis légers, entre cabinets, commerces et PME. Pour les échanges avec Orly, précisez le terminal. Le tarif de la grande couronne est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous de chaque côté de la gare de Juvisy ?", a: "Oui. Précisez le côté de la voie et la rue pour fixer le bon trajet." },
      { q: "Pouvez-vous livrer à Orly depuis Juvisy ?", a: "Oui. Précisez le terminal et l'heure. Le tarif est établi sur devis." },
      { q: "Quel tarif pour Juvisy-sur-Orge ?", a: "Sur devis, la commune étant en grande couronne." },
    ],
  },

  "athis-mons": {
    landmarks: ["Aéroport de Paris-Orly (limite)", "Tramway T7", "Seine", "A6", "Paray-Vieille-Poste (limite)", "Centre-ville"],
    intro: "Athis-Mons est une commune de l'Essonne qui jouxte l'aéroport d'Orly. Elle est desservie par le tramway T7, et mêle quartiers résidentiels, zones d'activité liées au trafic aérien et bords de Seine.",
    logisticsContext: "Une partie du territoire est soumise aux contraintes de l'aéroport voisin : couloirs aériens, accès contrôlés. Le T7 relie la commune à Villejuif et à Orly. Le deux-roues atteint les zones d'activité aéroportuaires sans stationnement.",
    keyClients: ["Entreprises aéroportuaires", "Hôtels proches d'Orly", "PME de services", "Commerces du centre"],
    localGuide: {
      title: "Athis-Mons : la commune qui borde Orly",
      paragraphs: [
        "Athis-Mons est une base arrière de l'aéroport d'Orly : hôtels, prestataires, transitaires. Les envois urgents y sont des documents de transport, des pièces aéronautiques, des échantillons. Indiquez le nom du prestataire, le bâtiment et l'heure limite de remise.",
        "Dans les quartiers résidentiels, les professions libérales et les commerces échangent des plis et des colis légers. La remise en main propre contre signature est la règle. La commune étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous aux entreprises proches d'Orly ?", a: "Oui. Donnez le bâtiment, l'accueil et un contact : certains sites sont en zone réglementée." },
      { q: "Pouvez-vous rejoindre le terminal d'Orly depuis Athis-Mons ?", a: "Oui. Précisez le terminal, la porte et l'heure limite." },
      { q: "Quel tarif pour Athis-Mons ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },
};
