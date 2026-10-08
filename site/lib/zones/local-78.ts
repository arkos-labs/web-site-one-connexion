/**
 * lib/zones/local-78.ts
 * Contenu propre aux communes des Yvelines (grande couronne : tarif sur devis).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_78: Record<string, LocalZoneContent> = {
  versailles: {
    landmarks: ["Château de Versailles", "Cour d'appel de Versailles", "Préfecture des Yvelines", "Gare de Versailles-Chantiers", "Gare de Versailles-Rive-Gauche", "Gare de Versailles-Rive-Droite"],
    intro: "Versailles est la préfecture des Yvelines et le siège d'une cour d'appel. La ville est connue pour son château, et compte trois gares qui la relient à Paris Montparnasse, Saint-Lazare et aux Invalides.",
    logisticsContext: "Versailles a une trame de grandes avenues héritée du XVIIe siècle. Les abords du château sont très fréquentés par les touristes, avec des restrictions de circulation. Le coursier choisit l'itinéraire selon l'heure et la gare la plus proche de la destination.",
    keyClients: ["Cour d'appel de Versailles", "Préfecture des Yvelines", "Château de Versailles", "Cabinets d'avocats"],
    localGuide: {
      title: "Versailles : cour d'appel, préfecture et avenues royales",
      paragraphs: [
        "Pour les avocats du département, la cour d'appel de Versailles est l'adresse décisive : les dépôts et remises de pièces se jouent à l'heure du greffe. Précisez le service et l'heure limite. La remise est horodatée, nominative, avec un justificatif à joindre au dossier.",
        "La ville a trois gares distinctes. Pour une adresse en centre-ville, indiquez la plus proche : Rive-Droite, Rive-Gauche ou Chantiers. Cela situe immédiatement le coursier. Versailles étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer des conclusions à la cour d'appel de Versailles ?", a: "Oui. Course dédiée, remise contre signature, justificatif horodaté. Indiquez le service et l'heure limite." },
      { q: "Livrez-vous au château de Versailles ?", a: "Oui, à l'entrée de service, avec le nom du destinataire et un contact." },
      { q: "Quel tarif pour Versailles ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "saint-germain-en-laye": {
    landmarks: ["Château de Saint-Germain-en-Laye", "Musée d'archéologie nationale", "Grande Terrasse", "Forêt de Saint-Germain", "RER A Saint-Germain-en-Laye", "Centre hospitalier intercommunal"],
    intro: "Saint-Germain-en-Laye est une ville résidentielle haut de gamme, terminus du RER A. Son château abrite le musée d'archéologie nationale, et sa terrasse domine la Seine. La forêt de Saint-Germain borde la ville.",
    logisticsContext: "Le centre est piéton en partie, autour du château. La forêt, à l'ouest, impose des routes sinueuses. Le RER A relie directement La Défense et Paris, mais le trajet routier est plus long. Le coursier choisit l'itinéraire selon la destination.",
    keyClients: ["Musée d'archéologie nationale", "Cabinets libéraux", "Hôtels de prestige", "Centre hospitalier intercommunal"],
    localGuide: {
      title: "Saint-Germain-en-Laye : château, forêt et clientèle de prestige",
      paragraphs: [
        "Saint-Germain-en-Laye concentre cabinets, études et professionnels de santé qui échangent des documents confidentiels avec Paris. La remise en main propre contre signature est la règle, avec nom du signataire et heure consignés.",
        "Le musée d'archéologie nationale reçoit des pièces et des documents : donnez le service, les dimensions et un contact. Pour un prélèvement vers un laboratoire parisien, précisez la température de conservation et le délai de stabilité. Le tarif de la grande couronne est sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous remettre un pli confidentiel à un cabinet de Saint-Germain-en-Laye ?", a: "Oui, en course dédiée, contre signature nominative avec justificatif horodaté." },
      { q: "Livrez-vous au musée d'archéologie nationale ?", a: "Oui, par l'entrée de service, avec le destinataire et un contact." },
      { q: "Quel tarif pour Saint-Germain-en-Laye ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "mantes-la-jolie": {
    landmarks: ["Collégiale Notre-Dame", "Seine", "Gare de Mantes-la-Jolie", "Hôpital François-Quesnay", "A13", "Zone d'activité"],
    intro: "Mantes-la-Jolie est la grande ville de l'ouest des Yvelines, sur la Seine. Elle abrite une collégiale gothique, l'hôpital François-Quesnay et un important nœud ferroviaire, la gare reliant Paris Saint-Lazare par plusieurs lignes.",
    logisticsContext: "Mantes est à plus de cinquante kilomètres de Paris par l'A13. Le trafic y est dense aux heures de pointe. Les trajets doivent être planifiés avec une marge, surtout pour un dépôt à heure limite.",
    keyClients: ["Hôpital François-Quesnay", "Zones d'activité", "Cabinets et commerces", "Collectivités"],
    localGuide: {
      title: "Mantes-la-Jolie : à cinquante kilomètres de Paris par l'A13",
      paragraphs: [
        "La A13 relie Paris à Mantes en moins d'une heure hors trafic, mais les embouteillages du retour peuvent doubler ce temps. Pour une livraison à heure limite, indiquez-la dès la commande : nous partons plus tôt si le trafic l'exige.",
        "L'hôpital François-Quesnay échange avec les laboratoires parisiens. Pour un prélèvement, précisez le service, la température de conservation et le délai de stabilité. Mantes étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer à heure précise à Mantes-la-Jolie ?", a: "Oui. Nous confirmons la faisabilité avant d'engager la course et partons plus tôt si le trafic l'exige." },
      { q: "Transportez-vous des prélèvements vers l'hôpital de Mantes ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Mantes-la-Jolie ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  poissy: {
    landmarks: ["Villa Savoye", "Collégiale Notre-Dame", "Seine", "RER A Poissy", "Centre hospitalier intercommunal", "Ancien site industriel automobile"],
    intro: "Poissy est une ville des Yvelines connue pour la villa Savoye de Le Corbusier et pour un site industriel automobile historique. Elle est desservie par le RER A et jouxte la forêt de Saint-Germain.",
    logisticsContext: "Le site industriel, les ponts sur la Seine et la gare créent un trafic soutenu. Le centre ancien est étroit. Pour une adresse en zone d'activité, donnez le nom de la société, le bâtiment et un contact.",
    keyClients: ["Villa Savoye", "Centre hospitalier intercommunal", "Zones d'activité", "Sous-traitants industriels"],
    localGuide: {
      title: "Poissy : architecture moderne et industrie",
      paragraphs: [
        "La villa Savoye est un monument historique ouvert aux visiteurs. Pour un envoi destiné au site, donnez le service, l'entrée de service et un contact. Les accès sont différents pour le public et pour les livraisons.",
        "L'industrie automobile a laissé à Poissy un réseau de sous-traitants et de prestataires. Les envois urgents y sont des pièces, des échantillons et des documents de livraison. Précisez le poids et l'heure limite. Poissy étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous à la villa Savoye ?", a: "Oui, par l'entrée de service, avec le nom du destinataire et un contact." },
      { q: "Pouvez-vous transporter des pièces industrielles légères ?", a: "Oui, jusqu'à 18 kg dans le top-case. Au-delà, appelez-nous avant." },
      { q: "Quel tarif pour Poissy ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  sartrouville: {
    landmarks: ["Seine", "RER A Sartrouville", "Gare de Sartrouville", "Argenteuil (proche)", "Houilles (limite)", "Bords de Seine"],
    intro: "Sartrouville est une commune des Yvelines sur la rive de la Seine, face à Argenteuil. Elle est desservie par le RER A, et s'étend entre le fleuve et la boucle de Montesson.",
    logisticsContext: "La Seine, la voie ferrée et l'A86 forment des coupures qui limitent les passages. Le centre est organisé autour de la gare. Selon le côté de la voie, une adresse proche peut demander un long détour.",
    keyClients: ["Commerces de la gare", "Professions libérales", "PME locales", "Zones d'activité"],
    localGuide: {
      title: "Sartrouville : une ville traversée par la voie ferrée",
      paragraphs: [
        "À Sartrouville, la voie ferrée sépare le centre des quartiers du bord de Seine, avec peu de franchissements. Indiquez le côté de la voie pour une adresse proche de la gare, cela évite un détour par un pont ou un passage souterrain.",
        "Les PME et les commerces envoient des plis, des colis et des documents vers Paris, Argenteuil et les Yvelines. La remise est signée, avec nom et heure consignés. Sartrouville étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous de part et d'autre de la voie ferrée ?", a: "Oui. Précisez le côté de la voie et la rue." },
      { q: "Pouvez-vous livrer à Argenteuil depuis Sartrouville ?", a: "Oui, la Seine sépare les deux communes mais elles sont proches. Tarif sur devis." },
      { q: "Quel tarif pour Sartrouville ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  guyancourt: {
    landmarks: ["Technocentre", "Saint-Quentin-en-Yvelines", "Université de Versailles Saint-Quentin", "Étang de Saint-Quentin", "A12", "Montigny-le-Bretonneux (limite)"],
    intro: "Guyancourt fait partie de la ville nouvelle de Saint-Quentin-en-Yvelines. La commune accueille un grand centre d'ingénierie automobile, un campus universitaire et de vastes zones de bureaux.",
    logisticsContext: "La ville nouvelle a un plan en voies rapides et ronds-points. Les sites d'ingénierie sont fermés, avec accueil et badge. Le coursier a besoin du nom du bâtiment, du service et d'un contact pour être annoncé.",
    keyClients: ["Centres d'ingénierie", "Université de Versailles Saint-Quentin", "Entreprises tertiaires", "Sous-traitants"],
    localGuide: {
      title: "Guyancourt : ingénierie et ville nouvelle",
      paragraphs: [
        "Dans une ville nouvelle comme Saint-Quentin-en-Yvelines, les adresses se ressemblent. Les sites d'ingénierie sont de vastes campus avec plusieurs bâtiments : donnez le bâtiment, le plateau et un contact direct. Sans cela, le coursier est arrêté à l'accueil.",
        "Les équipes d'ingénieurs et de sous-traitants échangent des pièces, des prototypes, des disques durs. Précisez le poids, la fragilité et le niveau de confidentialité. Guyancourt étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur un site d'ingénierie à accès contrôlé ?", a: "Oui. Donnez le bâtiment, le service et un contact pour que le coursier soit annoncé." },
      { q: "Pouvez-vous transporter des prototypes légers ?", a: "Oui, jusqu'à 18 kg. Précisez la fragilité à la commande." },
      { q: "Quel tarif pour Guyancourt ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "velizy-villacoublay": {
    landmarks: ["Centre commercial Vélizy 2", "Base aérienne de Villacoublay", "Tramway T6", "A86", "N118", "Zones d'activité"],
    intro: "Vélizy-Villacoublay est une commune des Yvelines à la limite des Hauts-de-Seine, entre Meudon et Versailles. Elle accueille un grand centre commercial, la base aérienne de Villacoublay et de vastes zones d'activité technologiques.",
    logisticsContext: "Le tramway T6 la relie à Châtillon, et l'A86 la borde. Les zones d'activité ont des voies larges, des ronds-points et des portails. Le centre commercial génère un trafic dense le week-end.",
    keyClients: ["Vélizy 2", "Zones d'activité technologiques", "Base de Villacoublay", "Entreprises de services"],
    localGuide: {
      title: "Vélizy-Villacoublay : zones d'activité et centre commercial",
      paragraphs: [
        "Les zones d'activité de Vélizy accueillent des entreprises technologiques et de services, avec des accueils sécurisés. Donnez le nom de la société, le bâtiment et un contact direct. La base aérienne de Villacoublay est un site militaire à accès strictement réglementé : prévenez le destinataire.",
        "Dans le centre commercial, la livraison passe par l'entrée de service et un responsable de magasin. Donnez l'enseigne, le numéro de lot et un contact. Vélizy étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans un magasin de Vélizy 2 ?", a: "Oui. Donnez l'enseigne, le lot et un contact : l'entrée de service est distincte." },
      { q: "Pouvez-vous livrer sur un site à accès contrôlé ?", a: "Oui, à l'accueil désigné, contre signature. Prévenez le destinataire de la venue du coursier." },
      { q: "Quel tarif pour Vélizy-Villacoublay ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  chatou: {
    landmarks: ["Île des Impressionnistes", "Maison Fournaise", "Seine", "RER A Chatou - Croissy", "Croissy-sur-Seine (limite)", "Rueil-Malmaison (limite)"],
    intro: "Chatou est une commune des Yvelines au bord de la Seine, face à Rueil-Malmaison. L'île des Impressionnistes, où Renoir a peint le Déjeuner des canotiers, est son lieu emblématique. Le RER A la relie à Paris.",
    logisticsContext: "L'île est reliée à la rive par un pont et un accès unique, avec des restrictions de circulation les jours d'événements. Le coursier a besoin du point de remise précis et d'un contact sur place.",
    keyClients: ["Île des Impressionnistes", "Maison Fournaise", "Professions libérales", "PME locales"],
    localGuide: {
      title: "Chatou : l'île des Impressionnistes et les bords de Seine",
      paragraphs: [
        "L'île de Chatou accueille des événements professionnels, des salons d'antiquaires et des réceptions. Pour une livraison liée à un événement, donnez le nom de l'organisateur, le point d'accès et l'heure de remise. L'accès par le pont est limité aux véhicules autorisés.",
        "Dans le reste de la commune, les professions libérales et les PME envoient des plis et des colis légers. La remise est signée, avec nom et heure consignés. Chatou étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous sur l'île des Impressionnistes ?", a: "Oui, avec le point d'accès, le nom de l'organisateur et un contact sur place." },
      { q: "Pouvez-vous livrer à Rueil-Malmaison depuis Chatou ?", a: "Oui, les communes se font face de part et d'autre de la Seine. Le tarif est sur devis." },
      { q: "Quel tarif pour Chatou ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  houilles: {
    landmarks: ["Gare de Houilles - Carrières-sur-Seine", "Sartrouville (limite)", "Carrières-sur-Seine (limite)", "Boucle de Montesson", "A86 (proche)", "Centre-ville"],
    intro: "Houilles est une commune des Yvelines dans la boucle de la Seine, entre Sartrouville et Carrières-sur-Seine. Elle est desservie par la ligne J du Transilien, qui la relie à Paris Saint-Lazare.",
    logisticsContext: "La ville est dense, avec un centre commerçant autour de la gare et des quartiers pavillonnaires. La boucle de la Seine limite les accès routiers. Le deux-roues gagne du temps sur les ponts aux heures de pointe.",
    keyClients: ["Commerces du centre", "Professions libérales", "PME locales", "Cabinets médicaux"],
    localGuide: {
      title: "Houilles : dans la boucle de la Seine",
      paragraphs: [
        "Houilles est enserrée dans la boucle de la Seine : pour rejoindre Paris, les trajets passent par des ponts qui se chargent aux heures de pointe. Indiquez l'heure à laquelle le colis doit arriver, nous planifions le départ en conséquence.",
        "Les cabinets, commerces et PME de la commune envoient des plis, des documents et des prélèvements. Pour un prélèvement, précisez la température de conservation et le délai de stabilité. Houilles étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Les ponts de la boucle de la Seine ralentissent-ils les courses ?", a: "Ils concentrent le trafic aux heures de pointe. Nous planifions le départ en conséquence." },
      { q: "Transportez-vous des prélèvements depuis un cabinet de Houilles ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Houilles ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },
};
