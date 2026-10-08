/**
 * lib/zones/extra-75.ts
 * Approfondissement des 20 arrondissements : trois situations concrètes, des
 * conseils avant commande et deux questions en plus. Les situations sont des
 * exemples réalistes, pas des références clients.
 */
import type { ExtraZoneContent } from "./types";

export const EXTRA_75: Record<string, ExtraZoneContent> = {
  "paris-1er": {
    cases: [
      { title: "Un mémoire à remettre au Conseil d'État", body: "Un cabinet du 8e doit déposer un mémoire au Palais-Royal avant la fin du délai. Le coursier se présente à l'accueil avec le nom du service et rapporte un récépissé." },
      { title: "Un bijou à livrer place Vendôme", body: "Un atelier de joaillerie envoie une pièce à un client dans un hôtel de la place. La remise se fait en main propre, contre signature, avec la valeur déclarée." },
      { title: "Des pièces pour le ministère de la Justice", body: "Une étude transmet un dossier à un service de la chancellerie. Le destinataire est prévenu, le pli remis à l'accueil, l'heure consignée." },
    ],
    tips: [
      "Pour une institution, donnez le service, le nom du destinataire et un numéro direct.",
      "Dans le quartier des Halles, indiquez un point de remise hors zone piétonne.",
      "Le Louvre et les musées ont des entrées de service distinctes : précisez-la.",
      "Pour un objet de valeur, indiquez la valeur et le mode de remise voulu.",
    ],
    faq: [
      { q: "Quel délai pour le 1er arrondissement ?", a: "Moins de 45 minutes pour l'enlèvement ; le délai de livraison est confirmé à la commande." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu de remise." },
    ],
  },

  "paris-2e": {
    cases: [
      { title: "Des échantillons pour un showroom du Sentier", body: "Un atelier de confection envoie des échantillons de tissu à un showroom avant l'ouverture. Le coursier les remet à l'étage, après le code de la cour." },
      { title: "Un pli pour une société près de la Bourse", body: "Une société de gestion attend un contrat à signer d'un cabinet. La remise est faite à l'accueil, contre signature." },
      { title: "Un document pour la bibliothèque Richelieu", body: "Un chercheur envoie un document à un service de la bibliothèque. Le colis est remis à l'accueil indiqué." },
    ],
    tips: [
      "Pour une cour intérieure, donnez le code, l'étage et un contact.",
      "Les passages couverts ferment à certaines heures : précisez le créneau.",
      "Pour du textile, indiquez si le colis doit rester à plat.",
      "Pour le 8e et le 9e, une course immédiate suffit presque toujours.",
    ],
    faq: [
      { q: "Livrez-vous dans les passages couverts ?", a: "Oui, à pied depuis l'entrée du passage. Donnez un contact pour la remise." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-3e": {
    cases: [
      { title: "Un tirage pour une galerie du Haut Marais", body: "Un photographe envoie un tirage encadré à une galerie avant un vernissage. Le coursier le remet à l'entrée de service." },
      { title: "Des maquettes pour une agence de design", body: "Une agence reçoit des maquettes d'un atelier du 11e. La remise est signée à l'accueil." },
      { title: "Un document pour les Archives nationales", body: "Un chercheur envoie un justificatif à un service des archives. Le colis est remis à l'accueil." },
    ],
    tips: [
      "Pour une galerie, précisez l'entrée de service et le nom du régisseur.",
      "Les hôtels particuliers ont plusieurs cours : donnez le bâtiment.",
      "Le week-end, le quartier est très fréquenté : prévoyez une marge.",
      "Pour une œuvre, indiquez les dimensions et la fragilité.",
    ],
    faq: [
      { q: "Livrez-vous au Carreau du Temple ?", a: "Oui, avec le nom de l'organisateur et l'entrée de service." },
      { q: "Peut-on suivre la course en ligne ?", a: "Oui, jusqu'à la remise." },
    ],
  },

  "paris-4e": {
    cases: [
      { title: "Un acte à déposer au tribunal de commerce", body: "Une société dépose un acte au greffe de l'Île de la Cité avant la fermeture. Le coursier rapporte le justificatif horodaté." },
      { title: "Un document pour la préfecture de police", body: "Un cabinet transmet un dossier de demande. La remise est faite à l'accueil désigné, contre signature." },
      { title: "Un colis pour un restaurateur de l'île Saint-Louis", body: "Un fournisseur envoie une pièce de matériel. La remise est faite à l'entrée, avec contact." },
    ],
    tips: [
      "Pour les institutions de l'Île de la Cité, précisez l'entrée à utiliser.",
      "Autour de Notre-Dame, les accès changent selon les travaux : prévenez-nous.",
      "Indiquez l'heure limite de dépôt au greffe.",
      "Dans le Marais sud, donnez le code de la porte cochère.",
    ],
    faq: [
      { q: "Livrez-vous à l'Hôtel de Ville ?", a: "Oui, au service destinataire, avec un contact." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-5e": {
    cases: [
      { title: "Un réactif pour un laboratoire de l'Institut Curie", body: "Un fournisseur du 13e envoie un consommable. Le coursier le remet au laboratoire, avec contenant isotherme si besoin." },
      { title: "Des épreuves pour un éditeur", body: "Un éditeur du 6e transmet des épreuves à un auteur de la Sorbonne. La remise est faite en main propre." },
      { title: "Un dossier d'étudiant à la Sorbonne", body: "Un service de scolarité reçoit des attestations. La remise est signée au secrétariat." },
    ],
    tips: [
      "Pour un laboratoire, donnez le bâtiment, l'étage et le responsable.",
      "La montagne Sainte-Geneviève est en pente : les trajets montants sont plus longs.",
      "Pour un échantillon, indiquez la température et le délai de stabilité.",
      "Pour les éditeurs, précisez le nom du réceptionnaire.",
    ],
    faq: [
      { q: "Livrez-vous au Collège de France ?", a: "Oui, à l'accueil désigné." },
      { q: "Peut-on prévoir des tournées entre deux laboratoires ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "paris-6e": {
    cases: [
      { title: "Un manuscrit pour un éditeur de Saint-Germain", body: "Un auteur envoie un manuscrit à une maison d'édition. La remise est signée à l'accueil." },
      { title: "Un petit tableau pour une galerie de la rue de Seine", body: "Un collectionneur confie une œuvre de petit format. Le coursier la remet en main propre, avec la valeur déclarée." },
      { title: "Un pli pour un cabinet près du Luxembourg", body: "Un cabinet attend un acte d'un confrère. La remise est faite contre signature." },
    ],
    tips: [
      "Pour une galerie, donnez l'entrée de service.",
      "Pour une œuvre, indiquez dimensions, fragilité et valeur.",
      "Autour du Sénat, les accès sont contrôlés : prévenez le destinataire.",
      "Dans les cours, précisez le bâtiment et l'étage.",
    ],
    faq: [
      { q: "Livrez-vous à l'École des Beaux-Arts ?", a: "Oui, à l'accueil désigné." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-7e": {
    cases: [
      { title: "Un pli pour un ministère", body: "Un cabinet de conseil remet un rapport à un service ministériel. Le destinataire est prévenu, le pli remis à l'accueil désigné." },
      { title: "Un document pour une ambassade", body: "Un cabinet juridique transmet un contrat à une ambassade. La remise est signée." },
      { title: "Du matériel pour un événement aux Invalides", body: "Un organisateur a besoin d'accréditations avant l'ouverture. Une course immédiate les livre à l'entrée de service." },
    ],
    tips: [
      "Donnez le service, le nom du destinataire et un numéro direct.",
      "Un contrôle d'identité peut être demandé : prévenez le destinataire.",
      "Les jours d'événement, les accès changent : informez-nous.",
      "Pour une ambassade, précisez l'entrée du service consulaire ou administratif.",
    ],
    faq: [
      { q: "Livrez-vous au Palais Bourbon ?", a: "À l'accueil désigné, contre signature. L'accès dépend des règles du site." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-8e": {
    cases: [
      { title: "Des pièces de closing pour un cabinet", body: "Un cabinet d'affaires attend les signatures d'une partie dans le 17e. Le coursier fait l'aller-retour et rapporte l'original." },
      { title: "Un pli pour un client d'hôtel", body: "Un notaire fait remettre un document à un client d'un hôtel de luxe, à la conciergerie ou en chambre selon la consigne." },
      { title: "Des échantillons pour un siège de marque", body: "Une maison de mode envoie des échantillons à son siège. La remise est signée à l'accueil." },
    ],
    tips: [
      "Dans un immeuble haussmannien, donnez l'étage, la porte et le nom exact du destinataire.",
      "Pour un hôtel, précisez le nom du séjour et le mode de remise.",
      "Autour des Champs-Élysées, les jours de manifestation modifient l'itinéraire.",
      "Pour les cabinets, indiquez l'heure de signature.",
    ],
    faq: [
      { q: "Livrez-vous à la gare Saint-Lazare ?", a: "Oui, au point de rendez-vous indiqué." },
      { q: "Quelle preuve de livraison recevons-nous ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-9e": {
    cases: [
      { title: "Un lot pour une vente à Drouot", body: "Un antiquaire fait livrer un objet à l'hôtel des ventes avant l'heure du dépôt. La remise est signée." },
      { title: "Un retour de marchandise pour un grand magasin", body: "Une boutique renvoie un article à un grand magasin du boulevard Haussmann. La remise est faite à l'entrée de service." },
      { title: "Un pli pour un cabinet du quartier Saint-Georges", body: "Un cabinet reçoit un contrat. La remise est signée à l'accueil." },
    ],
    tips: [
      "Pour une vente, donnez l'heure limite de dépôt.",
      "Pour un grand magasin, précisez l'entrée de service et le contact.",
      "Le boulevard Haussmann est saturé en fin d'après-midi : prévoyez une marge.",
      "Pour un objet, indiquez la valeur et le mode de remise.",
    ],
    faq: [
      { q: "Livrez-vous à l'Opéra Garnier ?", a: "Oui, à l'entrée de service." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-10e": {
    cases: [
      { title: "Un colis à remettre avant un train", body: "Un voyageur d'un train de la gare de l'Est attend un document. Le coursier le remet au point de rendez-vous avant le départ." },
      { title: "Un prélèvement pour Saint-Louis", body: "Un cabinet envoie un échantillon à un service de l'hôpital. Le contenant est isotherme." },
      { title: "Des maquettes pour une agence du Canal", body: "Une agence attend des maquettes d'un imprimeur. La remise est signée." },
    ],
    tips: [
      "Pour une gare, donnez le point de rendez-vous et l'heure du train.",
      "Pour un hôpital, indiquez le service, le bâtiment et un contact.",
      "Le Canal Saint-Martin a des quais piétons : précisez un point de remise.",
      "Pour un échantillon, précisez la température et le délai de stabilité.",
    ],
    faq: [
      { q: "Livrez-vous à Lariboisière et Fernand-Widal ?", a: "Oui, avec le service et un contact." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-11e": {
    cases: [
      { title: "Un prototype pour un atelier du faubourg", body: "Un designer envoie un prototype à un atelier d'ébénisterie. La remise est signée à l'atelier." },
      { title: "Des épreuves pour une imprimerie", body: "Un éditeur transmet des fichiers imprimés. La remise est faite avant la fermeture." },
      { title: "Un document pour une start-up d'Oberkampf", body: "Une start-up attend un contrat. Le coursier remet à l'accueil de l'espace de coworking." },
    ],
    tips: [
      "Pour un atelier en cour, donnez le code et un contact.",
      "Dans un espace de coworking, indiquez le nom de l'équipe.",
      "Pour un prototype, précisez poids et fragilité.",
      "Entre Bastille et Nation, une course immédiate suffit presque toujours.",
    ],
    faq: [
      { q: "Livrez-vous à Bastille le soir ?", a: "Oui jusqu'à 23h, 7j/7, sous réserve de disponibilité." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-12e": {
    cases: [
      { title: "Un dossier pour un ministère de Bercy", body: "Un cabinet remet un dossier à un service. Le destinataire est prévenu, la remise est faite à l'accueil." },
      { title: "Un colis à récupérer à la Gare de Lyon", body: "Un voyageur attend un document avant son TGV. Le coursier le remet au point de rendez-vous." },
      { title: "Un prélèvement pour Saint-Antoine", body: "Un cabinet envoie un échantillon à un service de l'hôpital. Le contenant est isotherme." },
    ],
    tips: [
      "À Bercy, donnez le bâtiment et le service.",
      "Pour une gare, indiquez le point de rendez-vous et l'heure du train.",
      "Les jours d'événement à l'Accor Arena, la circulation change : prévenez-nous.",
      "Pour Saint-Mandé et Charenton, les courses sont très courtes.",
    ],
    faq: [
      { q: "Livrez-vous aux Quinze-Vingts ?", a: "Oui, avec le service et un contact." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-13e": {
    cases: [
      { title: "Du matériel informatique pour une start-up de Station F", body: "Une équipe reçoit des ordinateurs. Le coursier remet à l'accueil, avec le nom de l'équipe." },
      { title: "Un prélèvement pour la Pitié-Salpêtrière", body: "Un cabinet envoie un échantillon à un service. Le contenant est isotherme." },
      { title: "Un document pour la BnF", body: "Un chercheur remet un justificatif à un service de la bibliothèque. La remise est signée." },
    ],
    tips: [
      "Pour Station F, donnez le nom de l'équipe et un contact.",
      "Pour l'hôpital, indiquez le service, le bâtiment et un contact.",
      "Dans le quartier chinois, de nombreuses entrées sont en galerie : donnez le numéro.",
      "Pour Gentilly et Ivry, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous aux Gobelins ?", a: "Oui, à l'accueil désigné." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-14e": {
    cases: [
      { title: "Un colis à remettre à Montparnasse", body: "Un voyageur attend un document avant son train. Le coursier le remet au point de rendez-vous." },
      { title: "Un prélèvement pour Cochin", body: "Un cabinet envoie un échantillon à un service. Le contenant est isotherme." },
      { title: "Un document pour la Cité universitaire", body: "Un étudiant attend une attestation. La remise est faite à l'accueil de la maison." },
    ],
    tips: [
      "Pour une gare, donnez le train, le quai et l'heure.",
      "Pour la Cité universitaire, précisez la maison.",
      "Pour Sainte-Anne, indiquez le service et un contact.",
      "Pour Montrouge et Malakoff, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à la Fondation Cartier ?", a: "Oui, à l'entrée de service." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-15e": {
    cases: [
      { title: "Du matériel de stand à la Porte de Versailles", body: "Un exposant attend des prospectus. Le coursier livre au hall et au stand." },
      { title: "Un échantillon pour l'Institut Pasteur", body: "Un laboratoire envoie un échantillon. Le contenant est isotherme et le délai de stabilité respecté." },
      { title: "Un document pour un plateau de télévision", body: "Une production attend un script. La remise est faite à la régie." },
    ],
    tips: [
      "Pour un salon, donnez le hall, le stand et le contact exposant.",
      "Pour un institut de recherche, indiquez le laboratoire.",
      "Pour Necker ou Pompidou, indiquez le service et un contact.",
      "Pour Vanves et Issy, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à Balard ?", a: "À l'accueil désigné. L'accès dépend des règles du site." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-16e": {
    cases: [
      { title: "Des accréditations pour Roland-Garros", body: "Un organisateur a besoin d'accréditations imprimées. Le coursier les livre à l'entrée désignée." },
      { title: "Un pli pour une ambassade", body: "Un cabinet transmet un document. La remise est signée à l'accueil." },
      { title: "Un document pour Radio France", body: "Un producteur remet un contrat. La remise est faite à l'accueil de la Maison de la Radio." },
    ],
    tips: [
      "Les jours de tournoi ou de match, prévenez-nous.",
      "Pour une résidence, donnez le nom du gardien.",
      "Pour le bois de Boulogne, précisez l'entrée.",
      "Pour Boulogne et Neuilly, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous au Palais de Tokyo ?", a: "Oui, à l'entrée de service." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-17e": {
    cases: [
      { title: "Des conclusions avant la clôture du greffe", body: "Un cabinet dépose des conclusions avant l'heure limite. Le coursier rapporte un justificatif horodaté." },
      { title: "Un dossier pour un cabinet de Wagram", body: "Un confrère transmet des pièces. La remise est signée." },
      { title: "Du matériel pour un salon au Palais des Congrès", body: "Un exposant attend des supports. Le coursier livre au hall." },
    ],
    tips: [
      "Pour le tribunal, donnez le service, la référence du dossier et l'heure limite.",
      "Pour le Palais des Congrès, indiquez l'entrée exposants.",
      "Aux Batignolles, les chantiers modifient les accès.",
      "Pour Clichy et Levallois, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous au parc Monceau ?", a: "Oui, à l'entrée indiquée." },
      { q: "Peut-on prévoir une navette quotidienne ?", a: "Oui, avec un compte entreprise, sur créneaux fixes." },
    ],
  },

  "paris-18e": {
    cases: [
      { title: "Un document pour un commerce de Montmartre", body: "Un commerçant attend un contrat. Le coursier le remet à la boutique." },
      { title: "Un prélèvement pour Bichat", body: "Un cabinet envoie un échantillon à un service. Le contenant est isotherme." },
      { title: "Une pièce pour un atelier de Pigalle", body: "Un atelier attend une pièce d'un fournisseur. La remise est signée." },
    ],
    tips: [
      "Sur la butte, donnez la rue accessible la plus proche.",
      "Pour Bichat, indiquez le service et un contact.",
      "Autour de la Porte de la Chapelle, le trafic est dense.",
      "Pour Saint-Ouen et Clichy, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous au Sacré-Cœur ?", a: "À l'accueil indiqué, avec un contact." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },

  "paris-19e": {
    cases: [
      { title: "Un accessoire pour la Philharmonie", body: "Une production a besoin d'un accessoire. Le coursier le livre à la régie." },
      { title: "Un prélèvement pour Robert-Debré", body: "Un cabinet envoie un échantillon. Le contenant est isotherme." },
      { title: "Une pièce pour un restaurateur de la Villette", body: "Un restaurateur attend un matériel. La remise est signée." },
    ],
    tips: [
      "Pour une salle, donnez le nom de la régie et l'heure du spectacle.",
      "Pour l'hôpital, indiquez le service et un contact.",
      "Le canal de l'Ourcq a des quais piétons : précisez le point de remise.",
      "Pour Pantin et Aubervilliers, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous à la Cité des sciences ?", a: "Oui, à l'entrée de service." },
      { q: "Quelle preuve de livraison est fournie ?", a: "Nom du signataire, date, heure et lieu." },
    ],
  },

  "paris-20e": {
    cases: [
      { title: "Un document pour un atelier de Belleville", body: "Un atelier attend un contrat. Le coursier le remet après le code de la cour." },
      { title: "Un dossier pour Tenon", body: "Un cabinet transmet un dossier à un service. La remise est signée." },
      { title: "Des plans pour une association", body: "Une association attend des plans imprimés. La remise est signée." },
    ],
    tips: [
      "À Belleville, donnez le code et l'étage.",
      "Pour Tenon, indiquez le service et un contact.",
      "Autour de Gambetta, les rues sont étroites : numéro précis recommandé.",
      "Pour Montreuil et Bagnolet, les courses sont brèves.",
    ],
    faq: [
      { q: "Livrez-vous au Père-Lachaise ?", a: "À l'entrée indiquée, avec un contact." },
      { q: "Quel poids maximum pour un colis ?", a: "18 kg dans le top-case." },
    ],
  },
};
