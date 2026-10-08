/**
 * lib/zones/local-95.ts
 * Contenu propre aux communes du Val-d'Oise (grande couronne : tarif sur devis).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_95: Record<string, LocalZoneContent> = {
  cergy: {
    landmarks: ["Préfecture du Val-d'Oise", "CY Cergy Paris Université", "ESSEC", "Axe majeur", "RER A Cergy-Préfecture", "Centre commercial Les 3 Fontaines"],
    intro: "Cergy est la préfecture du Val-d'Oise et le cœur de la ville nouvelle de Cergy-Pontoise. Elle réunit la préfecture, CY Cergy Paris Université, une grande école de commerce et un centre commercial régional, autour de l'Axe majeur.",
    logisticsContext: "Le RER A relie Cergy à La Défense et à Paris, mais la distance reste importante. Le tribunal judiciaire est à Pontoise, commune voisine. Les trajets internes à la ville nouvelle sont longs et nécessitent une adresse précise.",
    keyClients: ["Préfecture du Val-d'Oise", "CY Cergy Paris Université", "Grandes écoles", "Les 3 Fontaines"],
    localGuide: {
      title: "Cergy : préfecture, campus et ville nouvelle",
      paragraphs: [
        "Pour les cabinets d'avocats du département, Cergy et Pontoise forment un seul ensemble : la préfecture est à Cergy, le tribunal à Pontoise. Précisez le service et l'heure limite de dépôt. La remise est horodatée, nominative, avec un justificatif à annexer au dossier.",
        "Les campus et les grandes écoles de la ville reçoivent du matériel, des documents et des commandes de laboratoires. Donnez le bâtiment, le service et un contact. Cergy étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous à la préfecture du Val-d'Oise ?", a: "Oui, à l'accueil désigné, contre signature. Donnez le service et un contact." },
      { q: "Pouvez-vous déposer un acte au tribunal de Pontoise ?", a: "Oui, depuis Cergy. Indiquez le service et l'heure limite de dépôt." },
      { q: "Quel tarif pour Cergy ?", a: "Cergy est en grande couronne : le prix est établi sur devis, donné en moins de 2 heures." },
    ],
  },

  argenteuil: {
    landmarks: ["Basilique Saint-Denys", "Seine", "Pont d'Argenteuil", "Hôpital Victor-Dupouy", "Gare d'Argenteuil", "A15"],
    intro: "Argenteuil est la plus grande commune du Val-d'Oise. Elle borde la Seine face à Colombes et Gennevilliers, abrite la basilique Saint-Denys et l'hôpital Victor-Dupouy, et compte de vastes zones d'activité le long de l'A15.",
    logisticsContext: "Le pont d'Argenteuil est un goulot de circulation majeur entre le Val-d'Oise et les Hauts-de-Seine. La gare d'Argenteuil dessert Paris Saint-Lazare. Le coursier choisit l'itinéraire selon l'heure, car les ponts saturent rapidement.",
    keyClients: ["Hôpital Victor-Dupouy", "Zones d'activité", "Commerces du centre", "PME"],
    localGuide: {
      title: "Argenteuil : une grande ville qui dépend de ses ponts",
      paragraphs: [
        "Argenteuil est séparée de La Défense et de Colombes par la Seine. Les ponts sont les seuls passages, et un ralentissement sur l'un d'eux modifie le délai. Indiquez l'heure à laquelle le colis doit arriver : nous planifions le départ pour tenir compte du trafic.",
        "L'hôpital Victor-Dupouy reçoit et envoie des prélèvements et des dossiers. Précisez le service, la température de conservation et le délai de stabilité. La commune étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Les ponts d'Argenteuil ralentissent-ils les courses ?", a: "Ils concentrent le trafic aux heures de pointe. Nous planifions le départ en conséquence et annonçons un délai réaliste." },
      { q: "Transportez-vous des prélèvements depuis l'hôpital d'Argenteuil ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Argenteuil ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  sarcelles: {
    landmarks: ["Gare de Sarcelles - Saint-Brice (RER D)", "Sarcelles Village", "Grands ensembles", "A1", "Garges-lès-Gonesse (limite)", "Centre commercial"],
    intro: "Sarcelles est une commune du nord de l'agglomération parisienne, connue pour ses grands ensembles construits dans les années 1950 et 1960. Elle est desservie par le RER D et bordée par l'A1.",
    logisticsContext: "Les grands ensembles de Sarcelles ont des adresses particulières : numéros de bâtiment, de cage, d'étage. Le coursier a besoin de ces trois informations pour trouver la bonne entrée. La gare relie Paris Gare du Nord par le RER D.",
    keyClients: ["Commerces du centre", "PME de services", "Professions libérales", "Centre commercial"],
    localGuide: {
      title: "Sarcelles : les grands ensembles, bâtiment par bâtiment",
      paragraphs: [
        "À Sarcelles, une adresse seule ne suffit pas toujours : plusieurs bâtiments portent le même numéro de voie, et les cages d'escalier sont numérotées. Donnez le numéro du bâtiment, de la cage, l'étage et un contact joignable pour que le coursier trouve l'entrée sans détour.",
        "Les commerces et petites entreprises du centre échangent des plis, des commandes et des documents. Pour des flux réguliers, une tournée sur créneaux fixes est possible avec un compte entreprise. La commune étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les grands ensembles de Sarcelles ?", a: "Oui. Donnez le bâtiment, la cage, l'étage et un contact." },
      { q: "Pouvez-vous organiser des tournées régulières ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif pour Sarcelles ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  gonesse: {
    landmarks: ["Centre hospitalier de Gonesse", "Triangle de Gonesse", "Aéroport de Roissy (limite)", "A1", "Zone d'activité", "Marché de Gonesse"],
    intro: "Gonesse est une commune du Val-d'Oise voisine de l'aéroport de Roissy. Elle abrite le centre hospitalier de Gonesse, un important marché hebdomadaire et de vastes zones d'activité autour de l'A1.",
    logisticsContext: "L'A1 et la proximité de Roissy concentrent le trafic. Les zones d'activité fonctionnent avec les horaires du fret aérien. Le coursier a besoin du nom de l'entreprise et du quai pour entrer dans les parcs.",
    keyClients: ["Centre hospitalier de Gonesse", "Entreprises du fret", "Hôtels d'aéroport", "Commerces du centre"],
    localGuide: {
      title: "Gonesse : un hôpital et la porte de Roissy",
      paragraphs: [
        "Le centre hospitalier de Gonesse échange avec les laboratoires du nord de l'Île-de-France. Pour un prélèvement, précisez le service, l'heure limite, la température de conservation et le délai de stabilité. Nous confirmons la faisabilité avant d'engager la course.",
        "Les zones d'activité de la commune travaillent pour Roissy : transitaires, entrepôts, prestataires. Les envois urgents sont des documents de transport et des pièces. Gonesse étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Transportez-vous des prélèvements vers l'hôpital de Gonesse ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Livrez-vous vers Roissy depuis Gonesse ?", a: "Oui. Précisez le terminal ou la zone de fret et l'heure limite." },
      { q: "Quel tarif pour Gonesse ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "enghien-les-bains": {
    landmarks: ["Lac d'Enghien", "Casino d'Enghien", "Thermes d'Enghien", "Gare d'Enghien-les-Bains", "Maison du Lac", "A115 (proche)"],
    intro: "Enghien-les-Bains est une station thermale de la banlieue nord, organisée autour de son lac. La ville abrite un casino, des thermes, un centre de congrès et une clientèle de professions libérales et d'hôteliers.",
    logisticsContext: "Le lac et le centre-ville sont étroits et souvent piétons le week-end. La gare relie Paris Gare du Nord en une vingtaine de minutes en train. Le coursier se présente à l'entrée de service de l'établissement, pas à l'entrée du public.",
    keyClients: ["Casino d'Enghien", "Thermes", "Hôtels et restaurants du lac", "Professions libérales"],
    localGuide: {
      title: "Enghien-les-Bains : hôtellerie, thermes et lac",
      paragraphs: [
        "Les établissements du lac, casino, hôtels, restaurants, thermes, ont des entrées de service distinctes de l'entrée du public. Précisez-la à la commande, avec le nom du responsable. Une livraison à l'entrée principale est refusée ou retardée.",
        "La ville compte aussi de nombreux cabinets de médecins et de praticiens qui échangent des prélèvements et des dossiers avec Paris. Indiquez la température de conservation et le délai de stabilité. Enghien étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous au casino ou aux hôtels du lac ?", a: "Oui, par l'entrée de service. Donnez le nom du responsable et un contact." },
      { q: "Pouvez-vous transporter des prélèvements depuis un cabinet d'Enghien ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Enghien-les-Bains ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  franconville: {
    landmarks: ["Gare de Franconville - Le Plessis-Bouchard", "Forêt de Montmorency (proche)", "A115", "Ermont (limite)", "Cormeilles-en-Parisis (limite)", "Centre-ville"],
    intro: "Franconville est une commune résidentielle du Val-d'Oise, au pied de la forêt de Montmorency. Elle est desservie par la ligne H du Transilien, qui la relie à Paris Gare du Nord.",
    logisticsContext: "La ville s'étire entre la gare et la forêt, avec des rues résidentielles parfois étroites. L'A115 la borde au nord. La gare est le repère naturel pour guider le coursier.",
    keyClients: ["Professions libérales", "Commerces du centre", "PME de services", "Cabinets médicaux"],
    localGuide: {
      title: "Franconville : une ville entre gare et forêt",
      paragraphs: [
        "Franconville est desservie par une seule ligne de train, la ligne H : la gare sert de point de repère. Pour une adresse éloignée du centre, indiquez la distance à pied depuis la gare, cela aide le coursier à se placer.",
        "Les professions libérales et les petites entreprises de la commune envoient des plis, des documents et des colis légers vers Paris et le Val-d'Oise. La remise est signée, avec nom et heure consignés. Franconville étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les quartiers proches de la forêt ?", a: "Oui. Donnez le numéro, le code éventuel et un contact." },
      { q: "Quel est le délai vers Paris ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
      { q: "Quel tarif pour Franconville ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  ermont: {
    landmarks: ["Gare d'Ermont - Eaubonne", "RER C et ligne H", "Enghien-les-Bains (limite)", "Eaubonne (limite)", "A115", "Centre-ville"],
    intro: "Ermont est une commune du Val-d'Oise dotée d'un pôle de transport important : la gare d'Ermont–Eaubonne, où se croisent le RER C et la ligne H du Transilien. La ville est voisine d'Eaubonne et d'Enghien-les-Bains.",
    logisticsContext: "La gare est le centre de la commune : le trafic piéton et routier y est dense aux heures de pointe. La voie ferrée coupe la ville, avec peu de passages. Le coursier choisit le côté de la voie selon l'adresse.",
    keyClients: ["Commerces de la gare", "Professions libérales", "PME de services", "Cabinets médicaux"],
    localGuide: {
      title: "Ermont : une gare qui commande tout",
      paragraphs: [
        "À Ermont, le côté de la voie ferrée est une information essentielle : peu de ponts permettent de traverser. Pour une adresse proche de la gare, précisez de quel côté se trouve le bâtiment, nord ou sud, pour que le coursier choisisse le bon passage.",
        "Les envois locaux sont des plis, des documents et des colis légers entre cabinets, commerces et PME. La remise est signée, avec nom et heure consignés. Ermont étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous des deux côtés de la gare d'Ermont ?", a: "Oui. Précisez le côté de la voie et la rue." },
      { q: "Pouvez-vous livrer à Enghien-les-Bains depuis Ermont ?", a: "Oui, les deux communes sont voisines. Le tarif est établi sur devis." },
      { q: "Quel tarif pour Ermont ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "herblay-sur-seine": {
    landmarks: ["Seine", "Gare d'Herblay", "A15", "Conflans-Sainte-Honorine (proche)", "Cormeilles-en-Parisis (proche)", "Bords de Seine"],
    intro: "Herblay-sur-Seine est une commune du Val-d'Oise au bord de la Seine, face à la boucle de Montesson. Elle est desservie par le Transilien (ligne J) et se trouve entre Argenteuil et Conflans-Sainte-Honorine.",
    logisticsContext: "La Seine et l'A15 encadrent la commune. Les quartiers de bord de Seine sont résidentiels, avec des rues étroites et peu de commerces. Le coursier a besoin d'une adresse précise et d'un contact joignable.",
    keyClients: ["Professions libérales", "PME locales", "Commerces de proximité", "Résidences de bords de Seine"],
    localGuide: {
      title: "Herblay-sur-Seine : une ville de bord de fleuve",
      paragraphs: [
        "Herblay est une commune de maisons et de petites entreprises. Les adresses de bord de Seine sont parfois en impasse, sans accès direct pour une voiture. Le deux-roues passe là où une camionnette doit faire demi-tour. Donnez le numéro, le code éventuel et un contact.",
        "Les professions libérales et les PME envoient surtout des plis, des documents et des colis légers vers Paris et les communes voisines. Pour des échanges réguliers, un compte entreprise permet des passages à créneaux fixes. Le tarif de la grande couronne est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les impasses des bords de Seine ?", a: "Oui. Donnez le numéro, le code et un contact joignable." },
      { q: "Pouvez-vous livrer à Conflans-Sainte-Honorine depuis Herblay ?", a: "Oui, les deux communes sont voisines. Le tarif est établi sur devis." },
      { q: "Quel tarif pour Herblay-sur-Seine ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "maisons-laffitte": {
    landmarks: ["Château de Maisons", "Hippodrome de Maisons-Laffitte", "Seine", "RER A Maisons-Laffitte", "Forêt de Saint-Germain", "Parc de Maisons-Laffitte"],
    intro: "Maisons-Laffitte est une ville résidentielle des Yvelines, connue pour son château du XVIIe siècle et son hippodrome, l'un des grands centres d'entraînement de chevaux de course en France. Le RER A la relie à Paris.",
    logisticsContext: "Le parc de Maisons-Laffitte est un lotissement paysager du XIXe siècle, avec des avenues arborées et des grilles. L'hippodrome et les écuries occupent une grande partie de la ville. Le coursier a besoin du nom de la propriété ou du haras.",
    keyClients: ["Château de Maisons", "Hippodrome et écuries", "Professions libérales", "Résidences du parc"],
    localGuide: {
      title: "Maisons-Laffitte : château, parc et écuries",
      paragraphs: [
        "Les propriétés du parc de Maisons-Laffitte sont souvent signalées par un nom plutôt qu'un numéro. Donnez le nom de la propriété, l'avenue, le code du portail et un contact. Cela évite de longues recherches dans un lotissement aux avenues semblables.",
        "Les écuries et les professions liées aux chevaux ont des besoins propres : documents sanitaires, pièces de sellerie, petits colis. Précisez le poids et la fragilité. Maisons-Laffitte étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les propriétés du parc de Maisons-Laffitte ?", a: "Oui. Donnez le nom de la propriété, le code du portail et un contact." },
      { q: "Pouvez-vous livrer à une écurie ou à l'hippodrome ?", a: "Oui, avec le nom du responsable et l'entrée de service." },
      { q: "Quel tarif pour Maisons-Laffitte ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "conflans-sainte-honorine": {
    landmarks: ["Confluence Seine-Oise", "Musée de la Batellerie", "Port fluvial", "Gare de Conflans-Sainte-Honorine", "RER A Conflans-Fin d'Oise", "Péniches"],
    intro: "Conflans-Sainte-Honorine, au confluent de la Seine et de l'Oise, est la capitale de la batellerie française. Son port fluvial, ses péniches et son musée de la batellerie lui donnent un visage unique en Île-de-France.",
    logisticsContext: "La ville est étagée : les quais en bas, le vieux Conflans sur la colline, accessible par des rues en pente. Le port fluvial occupe une zone à part, avec des quais, des portails et des horaires de manœuvre.",
    keyClients: ["Port fluvial", "Opérateurs de batellerie", "Musée de la Batellerie", "Commerces du centre"],
    localGuide: {
      title: "Conflans-Sainte-Honorine : capitale de la batellerie",
      paragraphs: [
        "Livrer sur un bateau ne ressemble pas à une livraison classique : l'adresse est un quai, un emplacement, un nom de péniche. Donnez le nom du bateau, le quai et un contact à bord. Les horaires de manœuvre et d'amarrage peuvent décaler la remise.",
        "Dans la ville haute, les cabinets et commerces échangent des plis et des documents. Les rues sont en pente et étroites : un numéro précis évite un détour. Conflans étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur une péniche ?", a: "Oui, au quai, avec le nom du bateau, l'emplacement et un contact à bord." },
      { q: "Desservez-vous le vieux Conflans sur la colline ?", a: "Oui. Donnez le numéro et un contact : les rues sont en pente et étroites." },
      { q: "Quel tarif pour Conflans-Sainte-Honorine ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },
};
