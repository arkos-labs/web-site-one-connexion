/**
 * lib/zones/local-77.ts
 * Contenu propre aux communes de Seine-et-Marne (grande couronne : tarif sur devis).
 * Faits publics uniquement ; aucune entreprise citée comme cliente.
 */
import type { LocalZoneContent } from "./types";

export const LOCAL_77: Record<string, LocalZoneContent> = {
  melun: {
    landmarks: ["Préfecture de Seine-et-Marne", "Tribunal judiciaire de Melun", "Centre hospitalier de Melun", "Île Saint-Étienne", "Seine", "RER D Melun"],
    intro: "Melun est la préfecture de la Seine-et-Marne. La ville s'étend de part et d'autre de la Seine, avec l'île Saint-Étienne en son centre, et réunit la préfecture, le tribunal judiciaire et un centre hospitalier.",
    logisticsContext: "Le RER D relie Melun à Paris Gare de Lyon, mais la distance est importante pour une course. Les institutions sont concentrées dans le centre, de part et d'autre du fleuve, avec des ponts à franchir. Le coursier choisit la rive selon la destination.",
    keyClients: ["Tribunal judiciaire de Melun", "Préfecture de Seine-et-Marne", "Centre hospitalier de Melun", "Cabinets et études"],
    localGuide: {
      title: "Melun : justice et préfecture au milieu de la Seine",
      paragraphs: [
        "Pour les cabinets du département, Melun est l'adresse du tribunal judiciaire. Les dépôts se jouent à l'heure du greffe : précisez le service et l'heure limite. La remise est horodatée, nominative, avec un justificatif à annexer au dossier.",
        "La Seine divise la ville en deux rives. Une adresse sur l'île ou sur la rive opposée n'est pas à la même distance du centre que le nom de la rue le suggère. Donnez l'adresse complète. Melun étant en grande couronne, le tarif est établi sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous déposer un acte au tribunal de Melun ?", a: "Oui, depuis Paris ou depuis Melun même, en course dédiée, contre signature, avec justificatif horodaté." },
      { q: "Livrez-vous au centre hospitalier de Melun ?", a: "Oui. Précisez le service, le bâtiment et un contact." },
      { q: "Quel tarif pour Melun ?", a: "Sur devis, la commune étant en grande couronne. Réponse en moins de 2 heures." },
    ],
  },

  meaux: {
    landmarks: ["Cathédrale Saint-Étienne", "Musée de la Grande Guerre", "Marne", "Centre hospitalier de Meaux", "Gare de Meaux", "Canal de l'Ourcq"],
    intro: "Meaux est une ville historique de Seine-et-Marne, célèbre pour son brie et pour sa cathédrale. Elle abrite le musée de la Grande Guerre et un centre hospitalier, et s'étend le long de la Marne.",
    logisticsContext: "Meaux est à plus de cinquante kilomètres de Paris : une course depuis ou vers la capitale est un trajet long. La N3 et la A140 desservent la ville. Les créneaux de livraison doivent être planifiés avec une marge.",
    keyClients: ["Centre hospitalier de Meaux", "Musée de la Grande Guerre", "Producteurs et négociants", "Commerces du centre"],
    localGuide: {
      title: "Meaux : une ville à plus de cinquante kilomètres de Paris",
      paragraphs: [
        "Pour une course entre Paris et Meaux, le temps de trajet pèse plus que dans la petite couronne. Indiquez l'heure à laquelle le colis doit arriver : nous confirmons la faisabilité et le départ avant d'engager le coursier. En cas d'urgence, une course immédiate part dans l'heure.",
        "Le centre hospitalier de Meaux échange avec les laboratoires parisiens. Pour un prélèvement, précisez la température de conservation et le délai de stabilité. Le tarif de la grande couronne est établi sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer entre Paris et Meaux en urgence ?", a: "Oui, en course immédiate. Nous confirmons la faisabilité et le délai avant d'engager le coursier." },
      { q: "Transportez-vous des prélèvements depuis l'hôpital de Meaux ?", a: "Oui, en course dédiée, avec contenant isotherme à la demande." },
      { q: "Quel tarif pour Meaux ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  chelles: {
    landmarks: ["Abbaye de Chelles", "Marne", "Gare de Chelles - Gournay (RER E)", "Base nautique de Vaires-Torcy (proche)", "Centre-ville", "Canal de Chelles"],
    intro: "Chelles est une grande commune de l'est francilien, sur la Marne. Elle est desservie par le RER E et conserve l'abbaye mérovingienne qui a donné son histoire à la ville. Elle jouxte Vaires-sur-Marne et son stade nautique.",
    logisticsContext: "Le RER E relie Chelles à Paris Haussmann–Saint-Lazare, mais le trajet routier est long. Les quartiers de la ville sont étalés sur plusieurs kilomètres le long de la Marne. Le coursier a besoin de l'adresse exacte pour calculer un délai précis.",
    keyClients: ["Cabinets libéraux", "PME de services", "Commerces du centre", "Artisans"],
    localGuide: {
      title: "Chelles : une grande commune étalée le long de la Marne",
      paragraphs: [
        "Chelles s'étend du centre historique au quartier de Gournay, sur plusieurs kilomètres. Une adresse mal située peut rallonger un trajet de vingt minutes. Donnez le quartier, le numéro et un contact joignable à l'arrivée.",
        "Les cabinets, artisans et PME de la commune envoient surtout des plis et des colis légers vers Paris et la Seine-et-Marne. Pour des échanges réguliers, un compte entreprise permet des passages à créneaux fixes. Chelles étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Desservez-vous tous les quartiers de Chelles ?", a: "Oui, dont Gournay. Donnez le quartier et la rue pour un délai fiable." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif pour Chelles ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  torcy: {
    landmarks: ["RER A Torcy", "Marne-la-Vallée", "Val d'Europe (proche)", "Disneyland Paris (proche)", "Noisiel (limite)", "A4"],
    intro: "Torcy fait partie de la ville nouvelle de Marne-la-Vallée, à une vingtaine de kilomètres de Paris. La commune est desservie par le RER A, et jouxte Noisiel et Lognes. Elle est proche de Val d'Europe et de Disneyland Paris.",
    logisticsContext: "La ville nouvelle a un plan en voies rapides et ronds-points : les adresses se repèrent par quartier plutôt que par rue. L'A4 la relie à Paris, mais se charge aux heures de pointe. Le coursier a besoin du quartier et du nom du bâtiment.",
    keyClients: ["Entreprises de Marne-la-Vallée", "Bureaux de la ville nouvelle", "PME de services", "Commerces"],
    localGuide: {
      title: "Torcy : une ville nouvelle aux adresses par quartier",
      paragraphs: [
        "À Marne-la-Vallée, les adresses sont nombreuses et les rues se ressemblent. Donnez le quartier, le nom du bâtiment ou de la résidence et un contact joignable. Sans ces éléments, le coursier peut chercher longtemps entre des immeubles identiques.",
        "Les entreprises de la ville nouvelle sont principalement tertiaires. Elles envoient des plis, des documents et des colis légers. La proximité de Disneyland Paris et de Val d'Europe peut aussi générer des livraisons événementielles. Torcy étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les résidences de Torcy ?", a: "Oui. Donnez la résidence, le bâtiment et un contact." },
      { q: "Pouvez-vous livrer à Val d'Europe depuis Torcy ?", a: "Oui, les communes sont proches. Le tarif est établi sur devis." },
      { q: "Quel tarif pour Torcy ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "lagny-sur-marne": {
    landmarks: ["Marne", "Abbaye de Lagny", "Gare de Lagny - Thorigny", "A4", "Chelles (proche)", "Thorigny-sur-Marne (limite)"],
    intro: "Lagny-sur-Marne est une petite ville historique de la vallée de la Marne, bâtie autour de son ancienne abbaye. Elle est desservie par la ligne P du Transilien, et reste un pôle commerçant pour les communes voisines.",
    logisticsContext: "La ville est organisée autour de la Marne et de ses ponts, avec un centre ancien aux rues étroites. L'A4 passe à proximité. Pour une adresse du centre, le deux-roues évite la recherche de stationnement.",
    keyClients: ["Commerces du centre", "Artisans", "Cabinets libéraux", "PME locales"],
    localGuide: {
      title: "Lagny-sur-Marne : un centre ancien au bord de la rivière",
      paragraphs: [
        "Le centre de Lagny est médiéval : rues étroites, places piétonnes, stationnement rare. Indiquez le numéro, le point de remise et un contact joignable. Pour un commerce, précisez si la livraison peut se faire par l'arrière.",
        "Les artisans et commerçants de la ville envoient des plis, des colis légers et des documents vers Paris et la Seine-et-Marne. La course dédiée évite les ruptures de charge. Lagny étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans le centre ancien de Lagny ?", a: "Oui. Donnez le numéro, le point de remise et un contact." },
      { q: "Quel est le délai vers Paris ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
      { q: "Quel tarif pour Lagny-sur-Marne ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  "pontault-combault": {
    landmarks: ["RER E Pontault-Combault", "Francilienne (N104)", "A4 (proche)", "Roissy-en-Brie (limite)", "Zones d'activité", "Centre-ville"],
    intro: "Pontault-Combault est une grande commune de Seine-et-Marne, desservie par le RER E. Elle combine quartiers résidentiels et importantes zones d'activité le long de la Francilienne.",
    logisticsContext: "La Francilienne contourne la ville et relie les zones d'activité aux autoroutes. Le centre est à l'écart, côté RER. Pour une adresse en zone d'activité, donnez la rue, le bâtiment et un contact au quai.",
    keyClients: ["Zones d'activité", "Entreprises industrielles", "PME logistiques", "Commerces du centre"],
    localGuide: {
      title: "Pontault-Combault : zones d'activité le long de la Francilienne",
      paragraphs: [
        "Les zones d'activité de Pontault-Combault regroupent entrepôts, PME et services aux entreprises. Les horaires de réception y sont stricts, l'heure limite fixe donc le départ du coursier. Donnez le nom de la société, le bâtiment et le quai.",
        "Ces entreprises envoient surtout des documents de livraison, des pièces et des échantillons. Pour des échanges réguliers avec Paris, une tournée à créneaux fixes est plus économique que des courses ponctuelles. Le tarif de la grande couronne est sur devis.",
      ],
    },
    faq: [
      { q: "Livrez-vous dans les zones d'activité de Pontault-Combault ?", a: "Oui, avec le nom de la société, le bâtiment et un contact au quai." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
      { q: "Quel tarif pour Pontault-Combault ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },

  fontainebleau: {
    landmarks: ["Château de Fontainebleau", "Forêt de Fontainebleau", "INSEAD", "Gare de Fontainebleau - Avon", "Centre hospitalier de Fontainebleau", "Hôtels particuliers"],
    intro: "Fontainebleau est une ville de prestige du sud de la Seine-et-Marne, célèbre pour son château classé à l'UNESCO et pour sa forêt. Elle accueille une grande école de commerce internationale et un centre hospitalier.",
    logisticsContext: "La ville est à plus de soixante kilomètres de Paris, entourée de forêt. Les accès se font par la A6 et la N7. Les hôtels, la ville et le château sont fréquentés par des touristes : les rues du centre sont chargées en saison.",
    keyClients: ["Château de Fontainebleau", "INSEAD", "Hôtels de prestige", "Centre hospitalier de Fontainebleau"],
    localGuide: {
      title: "Fontainebleau : château, forêt et école internationale",
      paragraphs: [
        "Pour livrer à Fontainebleau depuis Paris, il faut compter plus d'une heure de route. Les envois urgents y sont des documents, des pièces ou des échantillons. Indiquez l'heure limite : nous confirmons la faisabilité avant d'engager la course, plutôt que d'accepter puis de retarder.",
        "L'école internationale et les hôtels de prestige reçoivent des colis et des documents de qualité. Donnez le bâtiment, le service et un contact. La remise est signée, avec nom et heure consignés. Fontainebleau étant en grande couronne, le tarif est sur devis.",
      ],
    },
    faq: [
      { q: "Pouvez-vous livrer à Fontainebleau le jour même depuis Paris ?", a: "Oui, en course immédiate ou planifiée. Nous confirmons la faisabilité avant le départ." },
      { q: "Livrez-vous au château de Fontainebleau ?", a: "Oui, à l'entrée de service, avec le nom du destinataire et un contact." },
      { q: "Quel tarif pour Fontainebleau ?", a: "Sur devis, gratuit et donné en moins de 2 heures." },
    ],
  },
};
