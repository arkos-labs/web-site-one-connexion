/**
 * lib/zones/extra-94.ts
 * Approfondissement des communes du Val-de-Marne : trois situations concrètes,
 * des conseils avant commande et deux questions en plus.
 * Les situations sont des exemples réalistes, pas des références clients.
 */
import type { ExtraZoneContent } from "./types";

export const EXTRA_94: Record<string, ExtraZoneContent> = {
  "vitry-sur-seine": {
    cases: [
      { title: "Une pièce pour une chaîne de production", body: "Une entreprise des Ardoines attend en urgence un composant d'un fournisseur de Paris 13e pour relancer une ligne. La course dédiée traverse la Seine et le livre au quai en une heure." },
      { title: "Une pièce d'exposition pour le MAC VAL", body: "Un artiste envoie une œuvre légère au musée pour un accrochage de dernière minute. Le colis protégé est remis au régisseur, contre signature." },
      { title: "Un dossier d'un cabinet du centre", body: "Un cabinet de Vitry transmet un dossier de succession à une étude de Paris. La remise est faite en main propre." },
    ],
    tips: [
      "Précisez si l'adresse est au centre ou aux Ardoines, les deux pôles sont éloignés.",
      "Pour un quai d'usine, donnez le portail et les horaires de réception.",
      "Le T9 et le RER C sont des repères pour situer l'adresse.",
      "Pour Paris 13e et Ivry, les courses sont courtes.",
    ],
    faq: [
      { q: "Livrez-vous à Ivry-sur-Seine depuis Vitry ?", a: "Oui, les deux communes se touchent." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu de remise." },
    ],
  },

  alfortville: {
    cases: [
      { title: "Un colis vers Créteil avant 17h", body: "Un commerçant d'Alfortville expédie une commande à un client de Créteil avant la fermeture d'un comptoir. Le coursier choisit le pont le moins chargé." },
      { title: "Un pli de cabinet à Paris 13e", body: "Un cabinet de la commune transmet un document à une étude de Paris. La remise est signée." },
      { title: "Des documents pour une entreprise du bord de Seine", body: "Une PME installée au confluent reçoit des bons de commande d'un client parisien. La course est dédiée." },
    ],
    tips: [
      "La commune est une presqu'île : précisez le pont de sortie le plus pratique pour le destinataire.",
      "Indiquez l'étage et le code d'accès, la densité des immeubles est forte.",
      "Pour Maisons-Alfort et Créteil, les courses sont courtes.",
      "Aux heures de pointe, les ponts se bouchent : prévoyez une marge.",
    ],
    faq: [
      { q: "Livrez-vous à Ivry-sur-Seine depuis Alfortville ?", a: "Oui, de l'autre côté de la Seine." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "maisons-alfort": {
    cases: [
      { title: "Un prélèvement vétérinaire", body: "Une clinique envoie un échantillon à un laboratoire spécialisé de Paris. Le contenant est isotherme et le délai de stabilité fixe le départ." },
      { title: "Un document pour l'école vétérinaire", body: "Un service de l'école reçoit des attestations d'un organisme parisien. La remise est signée à la scolarité." },
      { title: "Un dossier pour l'ANSES", body: "Un laboratoire envoie un rapport à un service de l'agence. L'accès étant contrôlé, le destinataire est prévenu." },
    ],
    tips: [
      "Sur un campus, donnez le bâtiment, le service et un contact.",
      "Le métro 8 est un repère pour situer l'adresse.",
      "Pour un échantillon, précisez la température et le délai de stabilité.",
      "Pour Paris 12e et Charenton, les courses sont courtes.",
    ],
    faq: [
      { q: "Livrez-vous à Alfortville depuis Maisons-Alfort ?", a: "Oui, les deux communes se touchent." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "charenton-le-pont": {
    cases: [
      { title: "Un contrat à faire signer à Bercy", body: "Une société de Charenton doit faire signer un contrat à un client de Bercy avant 17h. La frontière entre les deux est une avenue : la course dure quelques minutes." },
      { title: "Un réassort pour une boutique du centre commercial", body: "Une enseigne du centre commercial attend un réassort d'un entrepôt parisien. Le coursier passe par l'entrée de service." },
      { title: "Un pli de cabinet pour une étude du 12e", body: "Un cabinet de Charenton remet un acte à un notaire du 12e. La remise est signée." },
    ],
    tips: [
      "Donnez la station de métro la plus proche : Liberté ou Charenton–Écoles.",
      "Pour le centre commercial, précisez l'enseigne, le lot et l'entrée de service.",
      "Les jours d'événement à Bercy, la circulation change : prévenez-nous.",
      "Pour Paris 12e, une course immédiate suffit presque toujours.",
    ],
    faq: [
      { q: "Livrez-vous à Saint-Maurice depuis Charenton ?", a: "Oui, les deux communes sont voisines." },
      { q: "Peut-on suivre la course en ligne ?", a: "Oui, jusqu'à la remise." },
    ],
  },

  "saint-maurice": {
    cases: [
      { title: "Un prélèvement depuis un hôpital", body: "Un service de l'hôpital national envoie un échantillon vers un laboratoire parisien. Le contenant est isotherme, le départ calé sur le délai de stabilité." },
      { title: "Un dossier de patient pour Esquirol", body: "Un cabinet transmet un dossier à un service de l'hôpital Esquirol. Le coursier se présente au pavillon indiqué." },
      { title: "Un document pour une résidence", body: "Un syndic remet un document à une résidence de la commune. La remise est signée au gardien." },
    ],
    tips: [
      "Sur un domaine hospitalier, donnez le pavillon, le service et un contact.",
      "Saint-Mandé est voisine : une course vers notre siège est très courte.",
      "Les abords de la Marne sont piétons à certains endroits : précisez le point de remise.",
      "Pour un échantillon, donnez la température de conservation.",
    ],
    faq: [
      { q: "Livrez-vous à Charenton depuis Saint-Maurice ?", a: "Oui, les deux communes se touchent." },
      { q: "Les courses sont-elles plus rapides à Saint-Maurice ?", a: "Souvent, car la commune est proche de notre siège de Saint-Mandé." },
    ],
  },

  "joinville-le-pont": {
    cases: [
      { title: "Un pli pour une résidence de l'île", body: "Un syndic de copropriété remet un document à une résidence sur l'île Fanac. Le coursier utilise l'accès du pont et remet au gardien." },
      { title: "Un document d'agence pour un client de Vincennes", body: "Une agence de Joinville livre une maquette à un client de Vincennes avant sa réunion. La course est très courte." },
      { title: "Un prélèvement de cabinet", body: "Un médecin de Joinville envoie un échantillon à un laboratoire du 12e. Le contenant est isotherme." },
    ],
    tips: [
      "Pour les îles, donnez le nom de la résidence, le code et un contact.",
      "Peu de ponts : précisez la rive de destination.",
      "Le RER A est un repère mais pas un itinéraire.",
      "Pour Nogent et Saint-Maur, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Champigny depuis Joinville ?", a: "Oui, de l'autre côté de la Marne." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "nogent-sur-marne": {
    cases: [
      { title: "Du matériel pour un événement au pavillon Baltard", body: "Un organisateur de salon a oublié des supports de communication. Une course immédiate les livre à l'entrée de service avant l'ouverture au public." },
      { title: "Un acte pour une étude de la Grande Rue", body: "Un confrère parisien envoie un acte à une étude de Nogent. La remise est signée en main propre." },
      { title: "Un prélèvement vers Paris 12e", body: "Un cabinet médical envoie un échantillon à un laboratoire. Le coursier traverse le bois de Vincennes en quelques minutes." },
    ],
    tips: [
      "Pour le pavillon, donnez l'entrée de service et le nom de l'organisateur.",
      "La Grande Rue est piétonne à certaines heures : indiquez un point de remise.",
      "Les bords de Marne ont des rues étroites : numéro précis recommandé.",
      "Pour Joinville et Le Perreux, les courses sont très brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Bry-sur-Marne depuis Nogent ?", a: "Oui, la commune est voisine." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "le-perreux-sur-marne": {
    cases: [
      { title: "Un pli pour une villa", body: "Un notaire du Perreux remet un acte à un client dans une villa des bords de Marne. Le coursier utilise le code du portail et obtient la signature." },
      { title: "Un prélèvement de cabinet", body: "Un médecin envoie un échantillon à un laboratoire de Nogent. Le contenant est isotherme." },
      { title: "Un document pour une PME", body: "Une PME de services livre des documents à un client de Fontenay-sous-Bois. La course est brève." },
    ],
    tips: [
      "Transmettez le code du portail et un numéro joignable.",
      "Les voies principales sont peu nombreuses : précisez le quartier.",
      "Le RER A est un repère mais pas un itinéraire.",
      "Pour Nogent et Bry, les courses sont très courtes.",
    ],
    faq: [
      { q: "Livrez-vous à Bry-sur-Marne depuis Le Perreux ?", a: "Oui, la commune est voisine." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "fontenay-sous-bois": {
    cases: [
      { title: "Un contrat à signer au Val de Fontenay", body: "Une entreprise d'une tour du Val de Fontenay attend un contrat signé d'un cabinet parisien. Le coursier se présente à l'accueil avec le nom du destinataire." },
      { title: "Des documents pour un cabinet de la commune", body: "Un cabinet de Fontenay reçoit des pièces d'un confrère de Vincennes. La course est très courte." },
      { title: "Un colis de commerçant", body: "Un commerçant du centre expédie une commande à un client de Nogent. Le trajet passe par le bois de Vincennes." },
    ],
    tips: [
      "Dans le quartier d'affaires, donnez l'entreprise, le bâtiment et l'étage.",
      "La gare du Val-de-Fontenay est un repère pour situer l'adresse.",
      "Le bois de Vincennes limite les passages : précisez le côté.",
      "Pour Vincennes et Montreuil, une course immédiate suffit presque toujours.",
    ],
    faq: [
      { q: "Livrez-vous à Rosny-sous-Bois depuis Fontenay ?", a: "Oui, le Val de Fontenay est à la limite des deux communes." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "saint-maur-des-fosses": {
    cases: [
      { title: "Un acte pour une étude de La Varenne", body: "Un confrère de Paris envoie un acte à une étude de La Varenne-Saint-Hilaire. Le coursier prend la route de la boucle et remet en main propre." },
      { title: "Un prélèvement de clinique", body: "Une clinique de la boucle envoie un échantillon à un laboratoire de Créteil. Le contenant est isotherme." },
      { title: "Un colis à une résidence en bord de Marne", body: "Un syndic remet un document à une résidence. Le gardien signe la remise." },
    ],
    tips: [
      "Précisez toujours le quartier : La Varenne, Le Parc, Adamville ou Saint-Maur-Créteil.",
      "Les ponts sont peu nombreux : un bouchon décale la livraison.",
      "Le RER A est un repère mais le coursier suit la route.",
      "Pour Créteil, une course immédiate suffit.",
    ],
    faq: [
      { q: "Livrez-vous à Créteil depuis Saint-Maur ?", a: "Oui, les deux communes sont voisines." },
      { q: "Desservez-vous tous les quartiers ?", a: "Oui. Donnez le quartier et la rue pour un délai fiable." },
    ],
  },

  "champigny-sur-marne": {
    cases: [
      { title: "Une pièce pour une usine", body: "Une entreprise de la zone industrielle attend une pièce d'un fournisseur de Paris. La course dédiée la livre au quai en une heure." },
      { title: "Un document pour le musée de la Résistance", body: "Un service du musée reçoit un dossier d'archives. La remise est signée à l'accueil." },
      { title: "Un pli pour une entreprise de l'A4", body: "Une société du pôle d'affaires de l'A4 attend un contrat. La course traverse la Marne." },
    ],
    tips: [
      "Pour une usine, donnez le portail, le bâtiment et l'heure de réception.",
      "L'A4 et l'A86 se chargent le soir : prévoyez une marge.",
      "Les bords de Marne ont des rues étroites : numéro précis recommandé.",
      "Pour Joinville et Nogent, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Chennevières depuis Champigny ?", a: "Oui, les communes sont voisines." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  villejuif: {
    cases: [
      { title: "Un échantillon vers Gustave Roussy", body: "Un laboratoire de Paris envoie un échantillon à un service de l'institut. Le contenant est isotherme et le délai de stabilité respecté." },
      { title: "Un dossier pour Paul-Brousse", body: "Un cabinet transmet un dossier à un service de l'hôpital. Le coursier le remet au secrétariat, contre signature." },
      { title: "Un consommable pour le Cancer Campus", body: "Une équipe de recherche reçoit un consommable d'un fournisseur du 13e. La course est dédiée." },
    ],
    tips: [
      "Pour les hôpitaux, donnez le service, le bâtiment et un contact.",
      "Sur le campus, indiquez le laboratoire et l'équipe.",
      "La ligne 7 est un repère pour situer l'adresse.",
      "Pour un échantillon, précisez la température et le délai de stabilité.",
    ],
    faq: [
      { q: "Livrez-vous à Paris 13e depuis Villejuif ?", a: "Oui, les deux sont voisins." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  gentilly: {
    cases: [
      { title: "Un contrat pour Station F", body: "Une société de Gentilly doit faire signer un contrat à une start-up du 13e. La course est très courte." },
      { title: "Un plan pour un chantier", body: "Un architecte de Gentilly envoie un plan mis à jour à un conducteur de travaux du 14e. La remise a lieu sur le chantier." },
      { title: "Un colis de commerçant", body: "Un commerçant du centre expédie une commande à un client d'Arcueil. Le trajet dure quelques minutes." },
    ],
    tips: [
      "La commune est dense : donnez l'étage et le code d'accès.",
      "La Porte d'Italie est un point chargé : prévoyez une marge aux heures de pointe.",
      "Pour Paris 13e, une course immédiate suffit presque toujours.",
      "Le RER B est un repère pour situer l'adresse.",
    ],
    faq: [
      { q: "Livrez-vous au Kremlin-Bicêtre depuis Gentilly ?", a: "Oui, les communes sont voisines." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  arcueil: {
    cases: [
      { title: "Un composant pour un bureau d'études", body: "Un bureau d'études technique attend un composant d'un fournisseur du 13e. La course dédiée le livre au laboratoire." },
      { title: "Un document pour une association", body: "Une association d'Arcueil reçoit des pièces d'un cabinet de Paris. La remise est signée." },
      { title: "Un prélèvement", body: "Un médecin envoie un échantillon à un laboratoire du 14e. Le contenant est isotherme." },
    ],
    tips: [
      "Donnez la station de RER la plus proche pour situer l'adresse.",
      "Le relief entre le haut et le bas d'Arcueil allonge les trajets.",
      "Pour un colis technique, précisez poids et fragilité.",
      "Pour Cachan et Gentilly, les courses sont courtes.",
    ],
    faq: [
      { q: "Livrez-vous à Cachan depuis Arcueil ?", a: "Oui, les communes se touchent." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  cachan: {
    cases: [
      { title: "Un consommable pour un laboratoire de l'ENS", body: "Un laboratoire attend un consommable d'un fournisseur de Paris. Le destinataire est prévenu et le colis remis contre signature." },
      { title: "Des documents pour un centre de formation", body: "Un organisme de formation reçoit des attestations. La remise est faite au secrétariat." },
      { title: "Un pli pour un cabinet", body: "Un cabinet de Cachan remet un acte à une étude de Paris 14e. La remise est signée." },
    ],
    tips: [
      "Sur le campus de l'ENS, donnez le département, le bâtiment et un contact.",
      "Le RER B est un repère pour situer l'adresse.",
      "Pour Arcueil et Bagneux, les courses sont courtes.",
      "Pour un échantillon, précisez la température de conservation.",
    ],
    faq: [
      { q: "Livrez-vous à Villejuif depuis Cachan ?", a: "Oui, les communes sont voisines." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  rungis: {
    cases: [
      { title: "Un document de commande pour un grossiste", body: "Un restaurateur parisien envoie un bon de commande à un pavillon du marché. Le coursier le remet à l'heure d'ouverture des étals." },
      { title: "Un échantillon pour un contrôle qualité", body: "Un négociant envoie un échantillon de produit à un laboratoire de Paris. Le contenant est isotherme." },
      { title: "Une pièce pour un entrepôt", body: "Un entrepôt de la zone attend une pièce de rechange d'un fournisseur d'Orly. La course est très courte." },
    ],
    tips: [
      "Notre service couvre 7h–23h : pour une course avant 7h, appelez-nous.",
      "Au marché, donnez le pavillon, l'allée et un contact.",
      "Les accès au marché sont contrôlés : prévenez le destinataire.",
      "Pour Orly et Chevilly-Larue, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Orly depuis Rungis ?", a: "Oui, les communes sont voisines." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  orly: {
    cases: [
      { title: "Un document pour une compagnie aérienne", body: "Un prestataire envoie un document de maintenance à un bureau d'une compagnie à l'aéroport. Le coursier se présente au terminal indiqué." },
      { title: "Un colis pour un hôtel", body: "Un hôtel proche d'Orly reçoit un document de direction d'un cabinet parisien. La remise est signée à l'accueil." },
      { title: "Une pièce aéronautique légère", body: "Un atelier attend une petite pièce d'un fournisseur de Rungis. La course dédiée la livre en moins d'une heure." },
    ],
    tips: [
      "Donnez le terminal, la porte et un contact : l'accès est contrôlé.",
      "Un vol qui part ne se rattrape pas : indiquez l'heure limite exacte.",
      "Le T7, le métro 14 et Orlyval sont des repères pour situer l'adresse.",
      "Pour Athis-Mons et Rungis, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Orly Sud et Orly Ouest ?", a: "Oui, avec le terminal et la porte." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "chevilly-larue": {
    cases: [
      { title: "Un bon de livraison pour un entrepôt", body: "Un entrepôt alimentaire de Chevilly-Larue envoie un bon de livraison signé à un client de Paris. La remise est horodatée." },
      { title: "Une pièce pour un engin", body: "Un loueur d'engins attend une pièce d'un fournisseur de Rungis. La course est très courte." },
      { title: "Un document pour un marché", body: "Une société de la zone remet un contrat à un grossiste du marché. La remise est signée." },
    ],
    tips: [
      "Pour un entrepôt, donnez le portail, le bâtiment et l'heure de réception.",
      "Le T7 est un repère pour situer l'adresse.",
      "Pour Rungis et Thiais, les courses sont brèves.",
      "Pour un colis lourd, appelez-nous avant : 18 kg maximum.",
    ],
    faq: [
      { q: "Livrez-vous à Thiais depuis Chevilly-Larue ?", a: "Oui, les communes sont voisines." },
      { q: "Peut-on prévoir une tournée régulière ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "lhay-les-roses": {
    cases: [
      { title: "Du matériel pour un événement à la roseraie", body: "Un organisateur a oublié des documents pour une réception. Une course immédiate les livre à l'entrée de service avant l'arrivée des invités." },
      { title: "Un prélèvement de cabinet", body: "Un médecin du centre-ville envoie un échantillon à un laboratoire. Le contenant est isotherme." },
      { title: "Un pli pour un notaire", body: "Un confrère parisien remet un acte à une étude de L'Haÿ. La remise est signée." },
    ],
    tips: [
      "Pour la roseraie, donnez l'entrée de service et le nom de l'organisateur.",
      "L'A6 se charge aux heures de pointe : prévoyez une marge.",
      "Les rues résidentielles sont calmes mais étroites : numéro précis recommandé.",
      "Pour Villejuif et Fresnes, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Chevilly-Larue depuis L'Haÿ ?", a: "Oui, les communes sont voisines." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  fresnes: {
    cases: [
      { title: "Un dossier médical pour un établissement public", body: "Un cabinet transmet un dossier à un service de l'établissement de santé. Le destinataire est prévenu de l'arrivée du coursier." },
      { title: "Un pli de cabinet pour Paris", body: "Un cabinet de Fresnes remet un pli à un client du 13e. La course dédiée prend l'A6." },
      { title: "Un colis de commerçant", body: "Un commerçant du centre expédie une commande à un client de L'Haÿ-les-Roses. Le trajet dure quelques minutes." },
    ],
    tips: [
      "Un site public a un contrôle d'identité : prévenez le destinataire.",
      "Donnez le service, le bâtiment et un contact direct.",
      "L'A6 et l'A86 encadrent la commune : prévoyez une marge aux heures de pointe.",
      "Pour Rungis et Antony, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Antony depuis Fresnes ?", a: "Oui, les communes sont proches." },
      { q: "Peut-on prévoir un passage régulier ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  thiais: {
    cases: [
      { title: "Du réassort pour une enseigne de Belle Épine", body: "Une enseigne attend un réassort d'un entrepôt de Rungis. Le coursier passe par l'entrée de service et remet au responsable." },
      { title: "Un document pour un logisticien", body: "Un logisticien de Thiais envoie un bon de livraison à son client parisien. La remise est horodatée." },
      { title: "Une pièce pour un garage", body: "Un garage de la commune attend une pièce d'un fournisseur d'Orly. La course est très courte." },
    ],
    tips: [
      "Belle Épine : donnez l'enseigne, le lot et le contact du responsable.",
      "Le samedi, les abords du centre sont saturés : planifiez avec une marge.",
      "Le T7 est un repère pour situer l'adresse.",
      "Pour Rungis et Orly, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous au cimetière parisien de Thiais ?", a: "Oui, à l'accueil indiqué, avec un contact." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },
};
