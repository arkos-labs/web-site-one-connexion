/**
 * lib/zones/extra-93.ts
 * Approfondissement des communes de Seine-Saint-Denis : trois situations
 * concrètes, des conseils avant commande et deux questions en plus.
 * Les situations sont des exemples réalistes, pas des références clients.
 */
import type { ExtraZoneContent } from "./types";

export const EXTRA_93: Record<string, ExtraZoneContent> = {
  aubervilliers: {
    cases: [
      { title: "Un échantillon d'un grossiste à un acheteur parisien", body: "Un grossiste du quartier du commerce de gros envoie un échantillon de collection à un acheteur du Sentier avant 14h. La course dédiée évite d'attendre un camion de tournée et la remise est signée." },
      { title: "Des documents de recherche pour le campus Condorcet", body: "Une équipe de recherche attend des documents d'archives d'une bibliothèque parisienne. Le coursier les remet au bâtiment indiqué, contre signature." },
      { title: "Une pièce d'atelier pour un artisan d'art", body: "Un atelier de métiers d'art reçoit en urgence une pièce de fournisseur pour terminer une commande. Le colis arrive en une heure." },
    ],
    tips: [
      "Dans le quartier des grossistes, donnez le nom de la cour, le bâtiment et l'étage.",
      "Le campus Condorcet a plusieurs bâtiments : indiquez l'équipe et le contact.",
      "Le canal Saint-Denis coupe la commune : précisez la rive.",
      "Les camionnettes saturent les rues du commerce de gros l'après-midi : privilégiez une course matinale.",
    ],
    faq: [
      { q: "Livrez-vous le week-end dans le quartier du commerce de gros ?", a: "Oui, 7j/7 de 7h à 23h, sous réserve de disponibilité. Vérifiez les horaires de réception du destinataire." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu de remise." },
    ],
  },

  pantin: {
    cases: [
      { title: "Des échantillons textiles pour une agence", body: "Une agence installée dans un ancien bâtiment du canal attend des échantillons d'une maison de couture parisienne avant un rendez-vous. La course dédiée les remet à l'étage." },
      { title: "Un document pour une résidence de danse", body: "Une compagnie en résidence au Centre national de la danse a besoin d'un contrat imprimé. Le coursier le remet à l'accueil, contre signature." },
      { title: "Un livrable pour un client parisien", body: "Une agence de Pantin livre une maquette à un client du 10e avant sa réunion. Le colis voyage seul et est remis en main propre." },
    ],
    tips: [
      "Les bâtiments reconvertis du canal ont des accueils partagés : donnez l'entreprise et l'étage.",
      "Pour le Centre national de la danse, précisez le service et l'entrée.",
      "Le canal de l'Ourcq limite les passages : donnez la rive et le numéro.",
      "Pour Paris 19e et 10e, les courses sont courtes : une course immédiate suffit.",
    ],
    faq: [
      { q: "Livrez-vous aux Grands Moulins et aux Magasins généraux ?", a: "Oui, à l'accueil du bâtiment, avec le nom de l'entreprise et l'étage." },
      { q: "Pouvez-vous transporter une maquette fragile ?", a: "Pour une pièce qui tient dans un top-case de 18 kg, oui. Précisez la fragilité à la commande." },
    ],
  },

  "saint-ouen": {
    cases: [
      { title: "Un objet vendu par un antiquaire", body: "Un antiquaire du marché aux puces vend une pièce à un client du 16e. Le coursier récupère le colis emballé, le remet en main propre et rapporte un justificatif." },
      { title: "Un document pour une entreprise des Docks", body: "Une entreprise des Docks de Saint-Ouen attend un contrat à signer d'un cabinet de Paris. La course est dédiée, la remise signée." },
      { title: "Des plans pour un chantier du Grand Paris", body: "Un chef de chantier reçoit une version imprimée d'un plan modifié. La remise a lieu sur le chantier, avec un contact sur place." },
    ],
    tips: [
      "Au marché aux puces, donnez l'allée, le stand et un contact : le plan est labyrinthique.",
      "Le week-end, les allées sont très fréquentées : prévoyez une marge pour l'enlèvement.",
      "Pour un objet de valeur, précisez la valeur et le conditionnement.",
      "Les Docks sont un quartier récent : les adresses sont bien repérées, avec accueil d'immeuble.",
    ],
    faq: [
      { q: "Pouvez-vous transporter des bijoux ou des pièces de valeur ?", a: "Pour des pièces qui tiennent dans le top-case, avec remise contre signature. Pour une valeur élevée, contactez-nous avant." },
      { q: "Livrez-vous à la Porte de Clignancourt ?", a: "Oui. Les trajets vers le 18e sont très courts." },
    ],
  },

  bobigny: {
    cases: [
      { title: "Des conclusions à déposer avant 16h", body: "Un cabinet de Paris dépose des conclusions au tribunal judiciaire de Bobigny avant la clôture du greffe. La course part de Paris et rapporte le justificatif horodaté." },
      { title: "Un dossier pour la préfecture", body: "Une entreprise de Bobigny dépose un dossier d'autorisation à la préfecture. Le coursier remet le pli à l'accueil, contre signature." },
      { title: "Un prélèvement pour Avicenne", body: "Un laboratoire de Paris envoie un échantillon à un service de l'hôpital Avicenne. Le contenant est isotherme, le délai de stabilité respecté." },
    ],
    tips: [
      "Pour le tribunal, indiquez le service et l'heure limite de dépôt.",
      "À l'hôpital Avicenne, donnez le service, le bâtiment et un contact.",
      "Le tramway T1 est un repère mais pas un itinéraire : le coursier suit les routes.",
      "Les voies autour de l'A86 sont chargées le soir : planifiez avec une marge.",
    ],
    faq: [
      { q: "Pouvez-vous déposer un acte au tribunal de Bobigny le jour même ?", a: "Oui, en course immédiate. Nous confirmons la faisabilité en fonction de l'heure limite du greffe." },
      { q: "Livrez-vous à l'université Sorbonne Paris Nord ?", a: "Oui, avec le bâtiment, le service et un contact." },
    ],
  },

  drancy: {
    cases: [
      { title: "Des pièces pour une PME logistique", body: "Une PME logistique de Drancy attend des pièces d'un fournisseur de Paris pour réparer un chariot. La course dédiée les livre au quai." },
      { title: "Un dossier pour le Mémorial", body: "Un service éducatif du Mémorial de la Shoah de Drancy reçoit des documents pédagogiques. La remise est signée à l'accueil." },
      { title: "Un pli administratif à Bobigny", body: "Une entreprise de Drancy dépose un dossier à la préfecture. Les deux communes sont proches : la course est brève." },
    ],
    tips: [
      "Pour une zone d'activité, indiquez le portail, le bâtiment et l'heure de réception.",
      "Au Mémorial, donnez le service et un contact : les accès sont encadrés.",
      "Le RER B et le T1 sont des repères pour situer l'adresse.",
      "Les voies vers l'A1 sont chargées le matin : une course planifiée est plus fiable.",
    ],
    faq: [
      { q: "Livrez-vous à l'aéroport du Bourget depuis Drancy ?", a: "Oui, les deux sont proches. Précisez le point de remise exact." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case. Au-delà, contactez-nous." },
    ],
  },

  "aulnay-sous-bois": {
    cases: [
      { title: "Un prélèvement depuis Robert-Ballanger", body: "Un service de l'hôpital envoie un échantillon vers un laboratoire parisien. Le contenant est isotherme et l'heure de départ calée sur le délai de stabilité." },
      { title: "Des documents pour un transitaire de Roissy", body: "Un transitaire installé à Aulnay doit faire parvenir un dossier de douane à un bureau de l'aéroport. La course est dédiée, sur devis." },
      { title: "Une pièce pour une machine à l'arrêt", body: "Une entreprise de la zone industrielle attend un composant d'un fournisseur de Bondy. Le colis arrive en une heure, signé à l'atelier." },
    ],
    tips: [
      "La commune est étendue : donnez le quartier et l'adresse complète.",
      "Pour l'hôpital, précisez le service et la température de conservation.",
      "Pour Roissy, la zone et l'heure limite sont déterminantes : demandez un devis.",
      "Le RER B coupe la ville : indiquez le côté de la voie.",
    ],
    faq: [
      { q: "Livrez-vous à Sevran ou à Villepinte depuis Aulnay ?", a: "Oui, ces communes sont voisines." },
      { q: "Quel est le délai habituel ?", a: "Nous confirmons le délai précis à la commande, selon l'heure et la destination." },
    ],
  },

  bondy: {
    cases: [
      { title: "Un prélèvement depuis Jean-Verdier", body: "Un service de l'hôpital envoie un échantillon à un laboratoire spécialisé. Le contenant est isotherme et le départ fixé par le délai de stabilité." },
      { title: "Des plans pour un artisan du canal", body: "Un artisan installé le long du canal reçoit des plans mis à jour d'un architecte parisien. La remise est signée à l'atelier." },
      { title: "Un document pour un commerçant de la gare", body: "Un commerçant de la gare de Bondy attend un contrat à signer. Le coursier le récupère auprès d'un cabinet du 19e." },
    ],
    tips: [
      "Pour un atelier en cour, donnez le code et un contact.",
      "Le canal et la voie ferrée limitent les franchissements : précisez le côté.",
      "À l'hôpital, indiquez le service, le bâtiment et l'étage.",
      "Pour Noisy-le-Sec et Bobigny, les courses sont courtes.",
    ],
    faq: [
      { q: "Livrez-vous dans la forêt de Bondy ?", a: "Oui jusqu'aux limites accessibles. Pour un point précis, donnez un repère et un contact." },
      { q: "Peut-on prévoir des courses régulières ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "rosny-sous-bois": {
    cases: [
      { title: "Du réassort pour une enseigne de Rosny 2", body: "Un magasin du centre commercial attend un réassort urgent d'un entrepôt parisien. Le coursier passe par l'entrée de service et remet au responsable de magasin." },
      { title: "Un document de caisse à envoyer au siège", body: "Une enseigne envoie des pièces comptables de son magasin de Rosny au siège à Paris. La remise est signée." },
      { title: "Un pli pour un cabinet du centre-ville", body: "Un cabinet de Rosny dépose un acte au tribunal de Bobigny avant la clôture. La course est dédiée." },
    ],
    tips: [
      "Pour Rosny 2, donnez l'enseigne, le numéro de lot et le contact du responsable.",
      "Les horaires d'ouverture et de livraison du centre sont différents : précisez l'heure limite.",
      "Le terminus de la ligne 11 est un repère mais les rues autour sont chargées.",
      "Le fort et le plateau d'Avron ont des accès limités : donnez un point de remise.",
    ],
    faq: [
      { q: "Livrez-vous dans les bureaux autour du centre commercial ?", a: "Oui, avec l'entreprise, l'étage et un contact." },
      { q: "Peut-on suivre la course ?", a: "Oui, la progression est visible en ligne." },
    ],
  },

  "epinay-sur-seine": {
    cases: [
      { title: "Un accessoire pour un plateau", body: "Une production a besoin d'un accessoire fabriqué à Paris pour une scène tournée le lendemain matin. Une course immédiate le livre à la régie." },
      { title: "Un disque dur pour le montage", body: "Une équipe de postproduction reçoit un disque dur contenant des rushes. La remise est signée par le chef de poste." },
      { title: "Des documents pour un partenaire de Saint-Denis", body: "Une PME d'Épinay envoie un devis à un client de Saint-Denis. La course est très courte." },
    ],
    tips: [
      "Donnez le plateau, la production et le contact régie.",
      "Les studios sont en bord de Seine, à l'écart du centre : précisez l'entrée de service.",
      "Pour du matériel fragile, indiquez poids et dimensions.",
      "Le T8 est un repère mais pas un itinéraire.",
    ],
    faq: [
      { q: "Livrez-vous le soir sur un plateau ?", a: "Oui jusqu'à 23h, 7j/7, sous réserve de disponibilité." },
      { q: "Peut-on transporter des supports de stockage ?", a: "Oui, remis en main propre au destinataire, avec signature." },
    ],
  },

  "noisy-le-sec": {
    cases: [
      { title: "Des documents de transport d'une entreprise ferroviaire", body: "Un prestataire du rail envoie des bons de livraison à un client de Paris Est. La course est dédiée, la remise signée." },
      { title: "Une pièce pour un atelier de maintenance", body: "Un atelier attend une pièce d'un fournisseur de Bobigny. Le colis arrive dans l'heure." },
      { title: "Un dossier pour le tribunal", body: "Un cabinet de Noisy dépose un dossier à Bobigny, commune voisine, avant la clôture du greffe." },
    ],
    tips: [
      "Précisez le côté du faisceau ferroviaire pour une adresse proche de la gare.",
      "Les passages sous les voies sont peu nombreux : donnez la rue transversale.",
      "Pour Bobigny, la course est brève.",
      "Pour une zone d'activité, indiquez le portail et l'heure de réception.",
    ],
    faq: [
      { q: "Livrez-vous à Romainville ou Bondy depuis Noisy-le-Sec ?", a: "Oui, ce sont des communes voisines." },
      { q: "Quel est le délai habituel ?", a: "Nous le confirmons à la commande, selon l'heure et la destination." },
    ],
  },

  villepinte: {
    cases: [
      { title: "Du matériel pour un stand en plein salon", body: "Un exposant d'un salon à Paris Nord Villepinte a oublié des prospectus. Une course immédiate les livre au hall et au stand indiqués." },
      { title: "Des échantillons pour un acheteur étranger", body: "Un exposant remet des échantillons à un acheteur depuis un siège parisien. La remise a lieu à l'accueil exposants, contre signature." },
      { title: "Un dossier de douane pour Roissy", body: "Une entreprise de Paris Nord 2 transmet un dossier à un bureau de l'aéroport. La course est dédiée, sur devis." },
    ],
    tips: [
      "Sur un salon, donnez le hall, le stand et le contact exposant.",
      "Les jours de montage et démontage, les accès sont saturés : planifiez avec une marge.",
      "Le RER B Parc des Expositions est un repère pour les visiteurs, pas pour la livraison.",
      "Le tarif est établi sur devis pour cette zone.",
    ],
    faq: [
      { q: "Pouvez-vous livrer un stand le matin du premier jour ?", a: "Oui, en planifiant le créneau à l'avance. Nous confirmons la faisabilité." },
      { q: "Livrez-vous vers Roissy depuis Villepinte ?", a: "Oui, les deux sont proches. Précisez la zone et l'heure limite." },
    ],
  },

  "tremblay-en-france": {
    cases: [
      { title: "Un document de fret avant un départ", body: "Un transitaire de la zone aéroportuaire doit faire parvenir un document à une compagnie avant le chargement d'un vol. La course dédiée arrive au bureau indiqué." },
      { title: "Une pièce aéronautique", body: "Un prestataire de maintenance attend une petite pièce d'un fournisseur parisien. Le colis, léger, est remis contre signature." },
      { title: "Un pli pour un hôtel d'aéroport", body: "Un hôtel reçoit un document de direction d'un cabinet de Paris. La remise est signée à l'accueil." },
    ],
    tips: [
      "Donnez le terminal ou la zone de fret, le bureau et un contact sur place.",
      "Les contrôles d'accès de l'aéroport allongent le temps de remise.",
      "Un vol qui part ne se rattrape pas : indiquez l'heure limite exacte.",
      "Le tarif est établi sur devis.",
    ],
    faq: [
      { q: "Pouvez-vous livrer dans un terminal de Roissy ?", a: "Oui, avec le terminal, la porte et un contact. L'accès est contrôlé." },
      { q: "Quel délai prévoir ?", a: "Nous le confirmons à la commande, selon l'heure et la zone." },
    ],
  },

  "le-blanc-mesnil": {
    cases: [
      { title: "Un bon de livraison pour un entrepôt", body: "Une entreprise logistique envoie un bon de livraison signé à son client parisien. La remise est horodatée." },
      { title: "Une pièce de rechange", body: "Un atelier de la zone d'activité attend une pièce d'un fournisseur du Bourget. Le colis arrive en une heure." },
      { title: "Un dossier d'appel d'offres", body: "Une PME dépose un dossier à une administration de Bobigny avant la clôture. La course est dédiée." },
    ],
    tips: [
      "Pour un entrepôt, donnez le portail, le bâtiment et l'heure de réception.",
      "L'A1 et le RER B coupent la commune : précisez le côté.",
      "Le Bourget et Drancy sont voisins : les courses y sont courtes.",
      "Pour un colis lourd, appelez-nous avant : 18 kg maximum.",
    ],
    faq: [
      { q: "Livrez-vous à Dugny ou Bobigny depuis Le Blanc-Mesnil ?", a: "Oui, ce sont des communes proches." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  gagny: {
    cases: [
      { title: "Un prélèvement d'un cabinet médical", body: "Un médecin de Gagny envoie un échantillon à un laboratoire de Paris avant sa fermeture. Le coursier part avec un contenant isotherme." },
      { title: "Un dossier pour une mutuelle", body: "Une professionnelle de santé remet un dossier de remboursement à un organisme parisien. La remise est signée." },
      { title: "Un colis de commerçant", body: "Un commerçant du centre expédie une commande urgente à un client de Villemomble. Le trajet est de quelques minutes." },
    ],
    tips: [
      "Pour une impasse ou une allée privée, donnez le code et un contact.",
      "La RN302 se charge aux heures de pointe : prévoyez une marge.",
      "Pour un prélèvement, précisez le laboratoire et le délai de stabilité.",
      "Le RER E est un repère mais le coursier suit la route.",
    ],
    faq: [
      { q: "Livrez-vous à Villemomble ou Chelles depuis Gagny ?", a: "Oui, ces communes sont voisines." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "neuilly-sur-marne": {
    cases: [
      { title: "Un dossier pour un hôpital du domaine", body: "Un cabinet transmet un dossier à un service de l'hôpital de Ville-Évrard. Le coursier se présente au pavillon indiqué avec le nom du destinataire." },
      { title: "Un document pour une mairie voisine", body: "Une association de Neuilly-sur-Marne dépose un dossier à Noisy-le-Grand. La course est brève." },
      { title: "Un colis pour un riverain de la Marne", body: "Un professionnel installé sur les bords de Marne reçoit un colis d'un fournisseur parisien. La remise est faite au portail." },
    ],
    tips: [
      "Sur un domaine hospitalier, donnez le pavillon, le service et un contact.",
      "Les bords de Marne ont des portails : transmettez le code.",
      "Noisy-le-Grand est voisine : les courses sont courtes.",
      "Pour un prélèvement, précisez la température et le délai de stabilité.",
    ],
    faq: [
      { q: "Livrez-vous à Maison-Blanche ?", a: "Oui, avec le pavillon, le service et un contact." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "livry-gargan": {
    cases: [
      { title: "Un prélèvement vers Paris", body: "Un cabinet médical de Livry-Gargan envoie un échantillon à un laboratoire de Paris. Le contenant est isotherme et le délai de stabilité respecté." },
      { title: "Des pièces pour un artisan", body: "Un artisan pavillonnaire attend des pièces d'un fournisseur de Bondy pour un chantier. La course arrive dans la matinée." },
      { title: "Un pli pour la préfecture", body: "Un habitant professionnel dépose un dossier à la préfecture de Bobigny. La remise est signée." },
    ],
    tips: [
      "En quartier pavillonnaire, le numéro exact et un contact évitent les détours.",
      "Le T4 est un repère : indiquez l'arrêt le plus proche.",
      "La forêt de Bondy limite les accès : donnez la rue d'entrée.",
      "Pour Montfermeil, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à l'hôpital de Montfermeil depuis Livry-Gargan ?", a: "Oui, les deux sont proches." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },
};
