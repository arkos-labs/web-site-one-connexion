
/**
 * GRILLE TARIFAIRE ONE CONNEXION - ILE-DE-FRANCE
 * ===============================================
 * 
 * Basée sur la grille officielle fournie (Images 1-5).
 * Les tarifs sont exprimés en nombre de BONS.
 * 1 BON = 5.00 € HT.
 */

export type Formule = "NORMAL" | "EXPRESS" | "URGENCE" | "VL_NORMAL" | "VL_EXPRESS";

export interface TarifVille {
  cp: string;
  ville: string;
  formules: Record<Formule, number>;
}

// t = Tarif Helper (Normal, Express, Urgence)
// VL prices are calculated based on Moto Normal price (standard ratio: 2x for VL Normal, 3x for VL Express)
const t = (n: number, e: number, u: number) => ({
  "NORMAL": n,
  "EXPRESS": e,
  "URGENCE": u,
  "VL_NORMAL": n * 2,
  "VL_EXPRESS": n * 3
});

export const TARIFS_BONS: TarifVille[] = [
  { ville: "Alfortville", cp: "94140", formules: t(6, 10, 14) },
  { ville: "Antony", cp: "92160", formules: t(8, 12, 16) },
  { ville: "Arcueil", cp: "94110", formules: t(4, 7, 10) },
  { ville: "Argenteuil", cp: "95100", formules: t(8, 12, 16) },
  { ville: "Arpajon", cp: "91290", formules: t(15, 20, 25) },
  { ville: "Asnières sur Seine", cp: "92600", formules: t(4, 7, 10) },
  { ville: "Athis Mons", cp: "91200", formules: t(12, 17, 22) },
  { ville: "Aubervilliers", cp: "93300", formules: t(4, 7, 10) },
  { ville: "Aulnay sous Bois", cp: "93600", formules: t(12, 17, 22) },
  { ville: "Bagneux", cp: "92220", formules: t(4, 7, 10) },
  { ville: "Bagnolet", cp: "93170", formules: t(4, 7, 10) },
  { ville: "Bezons", cp: "95870", formules: t(8, 12, 16) },
  { ville: "Bièvres", cp: "91570", formules: t(12, 17, 22) },
  { ville: "Blanc Mesnil (le)", cp: "93150", formules: t(8, 12, 16) },
  { ville: "Bobigny", cp: "93000", formules: t(6, 10, 14) },
  { ville: "Bois Colombes", cp: "92270", formules: t(4, 7, 10) },
  { ville: "Bois d'Arcy", cp: "78390", formules: t(14, 19, 24) },
  { ville: "Bondoufle", cp: "91070", formules: t(15, 20, 25) },
  { ville: "Bondy", cp: "93140", formules: t(8, 12, 16) },
  { ville: "Bonneuil sur Marne", cp: "94380", formules: t(12, 17, 22) },
  { ville: "Bougival", cp: "78380", formules: t(8, 12, 16) },
  { ville: "Boulogne Billancourt", cp: "92100", formules: t(3, 6, 9) },
  { ville: "Bourg la Reine", cp: "92340", formules: t(8, 12, 16) },
  { ville: "Bourget (le)", cp: "93350", formules: t(8, 12, 16) },
  { ville: "Brie Comte Robert", cp: "77170", formules: t(20, 25, 30) },
  { ville: "Bry sur Marne", cp: "94360", formules: t(8, 12, 16) },
  { ville: "Buc", cp: "78530", formules: t(8, 12, 16) },
  { ville: "Bussy Saint Georges", cp: "77600", formules: t(14, 19, 24) },
  { ville: "Cachan", cp: "94230", formules: t(4, 7, 10) },
  { ville: "Carrières sur Seine", cp: "78420", formules: t(8, 12, 16) },
  { ville: "Cergy", cp: "95800", formules: t(15, 20, 25) },
  { ville: "Champigny sur Marne", cp: "94500", formules: t(8, 12, 16) },
  { ville: "Champs sur Marne", cp: "77420", formules: t(14, 19, 24) },
  { ville: "Charenton le Pont", cp: "94220", formules: t(4, 7, 10) },
  { ville: "Châtenay Malabry", cp: "92290", formules: t(8, 12, 16) },
  { ville: "Châtillon", cp: "92320", formules: t(4, 7, 10) },
  { ville: "Chatou", cp: "78400", formules: t(8, 12, 16) },
  { ville: "Chaville", cp: "92370", formules: t(7, 11, 15) },
  { ville: "Chelles", cp: "77500", formules: t(14, 19, 24) },
  { ville: "Chennevières sur Marne", cp: "94430", formules: t(12, 17, 22) },
  { ville: "Chesnay Rocquencourt (le)", cp: "78150", formules: t(8, 12, 16) },
  { ville: "Chessy", cp: "77700", formules: t(20, 25, 30) },
  { ville: "Chevilly Larue", cp: "94550", formules: t(8, 12, 16) },
  { ville: "Chilly Mazarin", cp: "91380", formules: t(12, 17, 22) },
  { ville: "Choisy le Roi", cp: "94600", formules: t(8, 12, 16) },
  { ville: "Clamart", cp: "92140", formules: t(4, 7, 10) },
  { ville: "Clichy", cp: "92110", formules: t(3, 6, 9) },
  { ville: "Clichy sous Bois", cp: "93390", formules: t(14, 19, 24) },
  { ville: "Colombes", cp: "92700", formules: t(4, 7, 10) },
  { ville: "Combs la Ville", cp: "77380", formules: t(18, 23, 28) },
  { ville: "Conflans Ste Honorine", cp: "78700", formules: t(15, 20, 25) },
  { ville: "Coubron", cp: "93470", formules: t(14, 19, 24) },
  { ville: "Coulommiers", cp: "77120", formules: t(30, 35, 40) },
  { ville: "Courbevoie", cp: "92400", formules: t(3, 6, 9) },
  { ville: "Courcouronnes", cp: "91080", formules: t(15, 20, 25) },
  { ville: "Courneuve (la)", cp: "93120", formules: t(6, 10, 14) },
  { ville: "Créteil", cp: "94000", formules: t(8, 12, 16) },
  { ville: "Croissy Beaubourg", cp: "77183", formules: t(14, 19, 24) },
  { ville: "Défense (la)", cp: "92060", formules: t(3, 6, 9) },
  { ville: "Deuil la Barre", cp: "95170", formules: t(10, 15, 20) },
  { ville: "Domont", cp: "95330", formules: t(14, 19, 24) },
  { ville: "Drancy", cp: "93700", formules: t(8, 12, 16) },
  { ville: "Dugny", cp: "93440", formules: t(8, 12, 16) },
  { ville: "Elancourt", cp: "78990", formules: t(14, 19, 24) },
  { ville: "Emerainville", cp: "77184", formules: t(14, 19, 24) },
  { ville: "Enghien les Bains", cp: "95880", formules: t(10, 15, 20) },
  { ville: "Epinay sur Seine", cp: "93800", formules: t(6, 10, 14) },
  { ville: "Étampes", cp: "91150", formules: t(25, 30, 35) },
  { ville: "Evry", cp: "91000", formules: t(15, 20, 25) },
  { ville: "Fontainebleau", cp: "77300", formules: t(30, 35, 40) },
  { ville: "Fontenay aux Roses", cp: "92260", formules: t(4, 7, 10) },
  { ville: "Fontenay sous Bois", cp: "94120", formules: t(6, 10, 14) },
  { ville: "Fourqueux", cp: "78112", formules: t(10, 15, 20) },
  { ville: "Franconville la Garenne", cp: "95130", formules: t(10, 15, 20) },
  { ville: "Fresnes", cp: "94260", formules: t(8, 12, 16) },
  { ville: "Gagny", cp: "93220", formules: t(12, 17, 22) },
  { ville: "Garches", cp: "92380", formules: t(4, 7, 10) },
  { ville: "Garenne Colombes (la)", cp: "92250", formules: t(4, 7, 10) },
  { ville: "Garges les Gonesse", cp: "95140", formules: t(10, 15, 20) },
  { ville: "Gennevilliers", cp: "92230", formules: t(4, 7, 10) },
  { ville: "Gentilly", cp: "94250", formules: t(4, 7, 10) },
  { ville: "Gif sur Yvette", cp: "91190", formules: t(15, 20, 25) },
  { ville: "Gometz le Châtel", cp: "91940", formules: t(15, 20, 25) },
  { ville: "Gonesse", cp: "95000", formules: t(10, 15, 20) },
  { ville: "Gournay sur Marne", cp: "93460", formules: t(14, 19, 24) },
  { ville: "Goussainville", cp: "95190", formules: t(14, 19, 24) },
  { ville: "Guyancourt", cp: "78280", formules: t(14, 19, 24) },
  { ville: "Hay les Roses (l')", cp: "94240", formules: t(6, 10, 14) },
  { ville: "Herblay", cp: "95220", formules: t(15, 20, 25) },
  { ville: "Houilles", cp: "78800", formules: t(8, 12, 16) },
  { ville: "Iles Saint Denis (l')", cp: "93450", formules: t(6, 10, 14) },
  { ville: "Issy les Moulineaux", cp: "92130", formules: t(3, 6, 9) },
  { ville: "Ivry sur Seine", cp: "94200", formules: t(4, 7, 10) },
  { ville: "Joinville le Pont", cp: "94340", formules: t(6, 10, 14) },
  { ville: "Jouy en Josas", cp: "78350", formules: t(8, 12, 16) },
  { ville: "Juvisy sur Orge", cp: "91260", formules: t(12, 17, 22) },
  { ville: "Kremlin Bicêtre (le)", cp: "94250", formules: t(4, 7, 10) },
  { ville: "La Queue-en-Brie", cp: "94510", formules: t(14, 19, 24) },
  { ville: "Levallois Perret", cp: "92300", formules: t(3, 6, 9) },
  { ville: "Lieusaint", cp: "77127", formules: t(18, 23, 28) },
  { ville: "Lilas (les)", cp: "93260", formules: t(4, 7, 10) },
  { ville: "Limeil Brevannes", cp: "94450", formules: t(12, 17, 22) },
  { ville: "Lisses", cp: "91090", formules: t(15, 20, 25) },
  { ville: "Livry Gargan", cp: "93190", formules: t(14, 19, 24) },
  { ville: "Lognes", cp: "77185", formules: t(14, 19, 24) },
  { ville: "Longjumeau", cp: "91160", formules: t(12, 17, 22) },
  { ville: "Louveciennes", cp: "78430", formules: t(8, 12, 16) },
  { ville: "Maisons Alfort", cp: "94700", formules: t(6, 10, 14) },
  { ville: "Maisons Laffite", cp: "78600", formules: t(10, 15, 20) },
  { ville: "Malakoff", cp: "92240", formules: t(3, 6, 9) },
  { ville: "Mantes la Jolie", cp: "78200", formules: t(25, 30, 35) },
  { ville: "Marly le Roi", cp: "78160", formules: t(8, 12, 16) },
  { ville: "Marnes la Coquette", cp: "92430", formules: t(7, 11, 15) },
  { ville: "Massy", cp: "91300", formules: t(12, 17, 22) },
  { ville: "Meaux", cp: "77100", formules: t(25, 30, 35) },
  { ville: "Melun", cp: "77000", formules: t(25, 30, 35) },
  { ville: "Meudon", cp: "92190", formules: t(4, 7, 10) },
  { ville: "Meudon La Forêt", cp: "92390", formules: t(7, 11, 15) },
  { ville: "Meulan en Yvelines", cp: "78250", formules: t(20, 25, 30) },
  { ville: "Mitry Mory", cp: "77290", formules: t(14, 19, 24) },
  { ville: "Moissy Cramayel", cp: "77550", formules: t(18, 23, 28) },
  { ville: "Monfermeil", cp: "93370", formules: t(14, 19, 24) },
  { ville: "Montfort l'Amaury", cp: "78490", formules: t(20, 23, 27) },
  { ville: "Montigny le Bretonneux", cp: "78180", formules: t(14, 19, 24) },
  { ville: "Montlhéry", cp: "91310", formules: t(15, 20, 25) },
  { ville: "Montreuil sous Bois", cp: "93100", formules: t(4, 7, 10) },
  { ville: "Montrouge", cp: "92120", formules: t(3, 6, 9) },
  { ville: "Morangis", cp: "91420", formules: t(12, 17, 22) },
  { ville: "Mureaux (les)", cp: "78130", formules: t(20, 25, 30) },
  { ville: "Nanterre", cp: "92000", formules: t(4, 7, 10) },
  { ville: "Neuilly Plaisance", cp: "93360", formules: t(12, 17, 22) },
  { ville: "Neuilly sur Marne", cp: "93330", formules: t(12, 17, 22) },
  { ville: "Neuilly sur Seine", cp: "92200", formules: t(3, 6, 9) },
  { ville: "Nogent sur Marne", cp: "94130", formules: t(6, 10, 14) },
  { ville: "Noiseau", cp: "94370", formules: t(12, 17, 22) },
  { ville: "Noisy le Grand", cp: "93160", formules: t(12, 17, 22) },
  { ville: "Noisy le Sec", cp: "93130", formules: t(6, 10, 14) },
  { ville: "Orly", cp: "94310", formules: t(8, 12, 16) },
  { ville: "Ormesson sur Marne", cp: "94490", formules: t(12, 17, 22) },
  { ville: "Orsay", cp: "91400", formules: t(15, 20, 25) },
  { ville: "Palaiseau", cp: "91120", formules: t(12, 17, 22) },
  { ville: "Pantin", cp: "93500", formules: t(4, 7, 10) },
  { ville: "Paris 01", cp: "75001", formules: t(2, 4, 7) },
  { ville: "Paris 02", cp: "75002", formules: t(2, 4, 7) },
  { ville: "Paris 03", cp: "75003", formules: t(3, 6, 9) },
  { ville: "Paris 04", cp: "75004", formules: t(3, 6, 9) },
  { ville: "Paris 05", cp: "75005", formules: t(3, 6, 9) },
  { ville: "Paris 06", cp: "75006", formules: t(3, 6, 9) },
  { ville: "Paris 07", cp: "75007", formules: t(2, 4, 7) },
  { ville: "Paris 08", cp: "75008", formules: t(2, 4, 7) },
  { ville: "Paris 09", cp: "75009", formules: t(2, 4, 7) },
  { ville: "Paris 10", cp: "75010", formules: t(3, 6, 9) },
  { ville: "Paris 11", cp: "75011", formules: t(3, 6, 9) },
  { ville: "Paris 12", cp: "75012", formules: t(3, 6, 9) },
  { ville: "Paris 13", cp: "75013", formules: t(3, 6, 9) },
  { ville: "Paris 14", cp: "75014", formules: t(3, 6, 9) },
  { ville: "Paris 15", cp: "75015", formules: t(2, 4, 7) },
  { ville: "Paris 16", cp: "75016", formules: t(2, 4, 7) },
  { ville: "Paris 17", cp: "75017", formules: t(2, 4, 7) },
  { ville: "Paris 18", cp: "75018", formules: t(3, 6, 9) },
  { ville: "Paris 19", cp: "75019", formules: t(3, 6, 9) },
  { ville: "Paris 20", cp: "75020", formules: t(3, 6, 9) },
  { ville: "Pavillons sous Bois (les)", cp: "93320", formules: t(12, 17, 22) },
  { ville: "Perreux sur Marne (le)", cp: "94170", formules: t(8, 12, 16) },
  { ville: "Pierrefitte sur Seine", cp: "93380", formules: t(8, 12, 16) },
  { ville: "Plaisir", cp: "78370", formules: t(14, 19, 24) },
  { ville: "Plessis Robinson (le)", cp: "92350", formules: t(8, 12, 16) },
  { ville: "Plessis Trévise (le)", cp: "94420", formules: t(14, 19, 24) },
  { ville: "Poissy", cp: "78300", formules: t(15, 20, 25) },
  { ville: "Pontoise", cp: "95300", formules: t(15, 20, 25) },
  { ville: "Pré Saint Gervais (le)", cp: "93310", formules: t(4, 7, 10) },
  { ville: "Puteaux", cp: "92800", formules: t(3, 6, 9) },
  { ville: "Raincy (le)", cp: "93340", formules: t(12, 17, 22) },
  { ville: "Rambouillet", cp: "78120", formules: t(25, 30, 35) },
  { ville: "Roissy en France", cp: "95700", formules: t(14, 19, 24) },
  { ville: "Romainville", cp: "93230", formules: t(6, 10, 14) },
  { ville: "Rosny sous Bois", cp: "93110", formules: t(6, 10, 14) },
  { ville: "Rueil Malmaison", cp: "92500", formules: t(4, 7, 10) },
  { ville: "Rungis", cp: "94150", formules: t(8, 12, 16) },
  { ville: "Saclay", cp: "91400", formules: t(15, 20, 25) },
  { ville: "Saint Cloud", cp: "92210", formules: t(4, 7, 10) },
  { ville: "Saint Denis (la plaine)", cp: "93210", formules: t(4, 7, 10) },
  { ville: "Saint Denis (nord)", cp: "93200", formules: t(6, 10, 14) },
  { ville: "Saint Germain en Laye", cp: "78100", formules: t(10, 15, 20) },
  { ville: "Saint Gratien", cp: "95210", formules: t(10, 15, 20) },
  { ville: "Saint Mandé", cp: "94160", formules: t(4, 7, 10) },
  { ville: "Saint Maur des Fossés", cp: "94210", formules: t(8, 12, 16) },
  { ville: "Saint Maurice", cp: "94410", formules: t(6, 10, 14) },
  { ville: "Saint Ouen l'Aumône", cp: "95310", formules: t(15, 20, 25) },
  { ville: "Saint Ouen sur Seine", cp: "93400", formules: t(4, 7, 10) },
  { ville: "Saint Thibault des Vignes", cp: "77400", formules: t(16, 21, 26) },
  { ville: "Sarcelles", cp: "95200", formules: t(10, 15, 20) },
  { ville: "Sartrouville", cp: "78500", formules: t(8, 12, 16) },
  { ville: "Sceaux", cp: "92330", formules: t(8, 12, 16) },
  { ville: "Sevran", cp: "93270", formules: t(14, 19, 24) },
  { ville: "Sèvres", cp: "92310", formules: t(4, 7, 10) },
  { ville: "Stains", cp: "93240", formules: t(8, 12, 16) },
  { ville: "Sucy en Brie", cp: "94370", formules: t(12, 17, 22) },
  { ville: "Suresnes", cp: "92150", formules: t(3, 6, 9) },
  { ville: "Thiais", cp: "94320", formules: t(8, 12, 16) },
  { ville: "Torcy", cp: "77200", formules: t(14, 19, 24) },
  { ville: "Trappes", cp: "78190", formules: t(14, 19, 24) },
  { ville: "Tremblay en France", cp: "93290", formules: t(14, 19, 24) },
  { ville: "Ulis (les)", cp: "91940", formules: t(15, 20, 25) },
  { ville: "Valenton", cp: "94460", formules: t(12, 17, 22) },
  { ville: "Vanves", cp: "92170", formules: t(3, 6, 9) },
  { ville: "Vaucresson", cp: "92420", formules: t(7, 11, 15) },
  { ville: "Vaujours", cp: "93410", formules: t(14, 19, 24) },
  { ville: "Vélizy Villacoublay", cp: "78140", formules: t(8, 12, 16) },
  { ville: "Versailles", cp: "78000", formules: t(8, 12, 16) },
  { ville: "Vesinet (le)", cp: "78110", formules: t(8, 12, 16) },
  { ville: "Ville d'Avray", cp: "92410", formules: t(7, 11, 15) },
  { ville: "Villecresnes", cp: "94440", formules: t(14, 19, 24) },
  { ville: "Villejuif", cp: "94800", formules: t(6, 10, 14) },
  { ville: "Villemomble", cp: "93250", formules: t(8, 12, 16) },
  { ville: "Villeneuve la Garenne", cp: "92390", formules: t(6, 10, 14) },
  { ville: "Villeneuve St Georges", cp: "94190", formules: t(12, 17, 22) },
  { ville: "Villepinte", cp: "93420", formules: t(14, 19, 24) },
  { ville: "Villetaneuse", cp: "93430", formules: t(8, 12, 16) },
  { ville: "Villiers sur Marne", cp: "94350", formules: t(8, 12, 16) },
  { ville: "Vincennes", cp: "94300", formules: t(4, 7, 10) },
  { ville: "Viroflay", cp: "78220", formules: t(8, 12, 16) },
  { ville: "Vitry sur Seine", cp: "94400", formules: t(6, 10, 14) },
  { ville: "Voisins le Bretonneux", cp: "78960", formules: t(14, 19, 24) },
  { ville: "Wissous", cp: "91320", formules: t(10, 15, 20) },
];


export function getTarifParNom(villeRecherchee: string): TarifVille | undefined {
  const villeNormalisee = villeRecherchee.toLowerCase().trim();
  return TARIFS_BONS.find(v => v.ville.toLowerCase().trim() === villeNormalisee);
}

export function estVilleDesservie(cp: string): boolean {
  return TARIFS_BONS.some(v => v.cp === cp);
}

export function findCityByZipAndName(zip: string, city?: string): TarifVille | undefined {
  // Helper de normalisation : minuscule, sans tirets, sans accents, sans parenthèses
  const normalize = (str: string) =>
    str.toLowerCase()
      .trim()
      .replace(/-/g, ' ')
      .replace(/\(.*\)/g, '')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();

  // 1. Stratégie combinée (Zip + Ville) - Prioritaire
  if (city) {
    const targetCity = normalize(city);

    // 1a. Match exact sur le nom normalisé
    // (Ex: "Saint-Mande" vs "Saint Mandé")
    const matchName = TARIFS_BONS.find(t => t.cp === zip && normalize(t.ville) === targetCity);
    if (matchName) return matchName;

    // 1b. Match partiel (inclusion)
    // (Ex: "Saint-Denis" API vs "Saint Denis (nord)" Grid)
    const matchFuzzy = TARIFS_BONS.find(t =>
      t.cp === zip && (normalize(t.ville).includes(targetCity) || targetCity.includes(normalize(t.ville)))
    );
    if (matchFuzzy) return matchFuzzy;
  }

  // 2. Stratégie de repli sur le Code Postal uniquement
  // Si le nom ne correspond pas, on prend le premier qui matche le CP (Souvent suffisant pour les petites villes)
  const byZip = TARIFS_BONS.find(t => t.cp === zip);
  return byZip;
}

export function rechercherVilles(recherche: string, limit: number = 10): TarifVille[] {
  const terme = recherche.toLowerCase().trim();
  if (!terme) return [];

  // Helper pour normaliser "Le Raincy" -> "Raincy" et "Raincy (le)" -> "Raincy"
  const cleanName = (name: string) => {
    return name.toLowerCase()
      .replace(/\(le\)|\(la\)|\(les\)|le |la |les /g, '')
      .trim();
  };

  const termClean = cleanName(terme);

  return TARIFS_BONS.filter(t => {
    // 1. Match exact CP
    if (t.cp.startsWith(terme)) return true;

    // 2. Match nom standard
    const villeLower = t.ville.toLowerCase();
    if (villeLower.includes(terme)) return true;

    // 3. Match inversé (Le Plessis vs Plessis (Le))
    const villeClean = cleanName(t.ville);
    if (villeClean.includes(termClean)) return true;

    return false;
  }).slice(0, limit);
}
