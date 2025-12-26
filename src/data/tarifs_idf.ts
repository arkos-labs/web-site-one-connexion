
/**
 * GRILLE TARIFAIRE ONE CONNEXION - ILE-DE-FRANCE
 * ===============================================
 * 
 * Basée sur la liste fournie par le client (26/12/2025)
 */

export type Formule = "NORMAL" | "EXPRESS" | "URGENCE" | "VL_NORMAL" | "VL_EXPRESS";

export interface TarifVille {
  cp: string;
  ville: string;
  formules: Record<Formule, number>;
}

export const TARIFS_BONS: TarifVille[] = [
  {
    "ville": "Alfortville",
    "cp": "94140",
    base: 6
  },
  {
    "ville": "Antony",
    "cp": "92160",
    base: 8
  },
  {
    "ville": "Arcueil",
    "cp": "94110",
    base: 4
  },
  {
    "ville": "Argenteuil",
    "cp": "95100",
    base: 8
  },
  {
    "ville": "Arpajon",
    "cp": "91290",
    base: 15
  },
  {
    "ville": "Asnières sur Seine",
    "cp": "92600",
    base: 4
  },
  {
    "ville": "Athis Mons",
    "cp": "91200",
    base: 12
  },
  {
    "ville": "Aubervilliers",
    "cp": "93300",
    base: 4
  },
  {
    "ville": "Aulnay sous Bois",
    "cp": "93600",
    base: 12
  },
  {
    "ville": "Bagneux",
    "cp": "92220",
    base: 4
  },
  {
    "ville": "Bagnolet",
    "cp": "93170",
    base: 4
  },
  {
    "ville": "Bezons",
    "cp": "95870",
    base: 8
  },
  {
    "ville": "Bièvres",
    "cp": "91570",
    base: 12
  },
  {
    "ville": "Blanc Mesnil (le)",
    "cp": "93150",
    base: 8
  },
  {
    "ville": "Bobigny",
    "cp": "93000",
    base: 6
  },
  {
    "ville": "Bois Colombes",
    "cp": "92270",
    base: 4
  },
  {
    "ville": "Bois d'Arcy",
    "cp": "78390",
    base: 14
  },
  {
    "ville": "Bondoufle",
    "cp": "91070",
    base: 15
  },
  {
    "ville": "Bondy",
    "cp": "93140",
    base: 8
  },
  {
    "ville": "Bonneuil sur Marne",
    "cp": "94380",
    base: 12
  },
  {
    "ville": "Bougival",
    "cp": "78380",
    base: 8
  },
  {
    "ville": "Boulogne Billancourt",
    "cp": "92100",
    base: 3
  },
  {
    "ville": "Bourg la Reine",
    "cp": "92340",
    base: 8
  },
  {
    "ville": "Bourget (le)",
    "cp": "93350",
    base: 8
  },
  {
    "ville": "Brie Comte Robert",
    "cp": "77170",
    base: 20
  },
  {
    "ville": "Bry sur Marne",
    "cp": "94360",
    base: 8
  },
  {
    "ville": "Buc",
    "cp": "78530",
    base: 8
  },
  {
    "ville": "Bussy Saint Georges",
    "cp": "77600",
    base: 14
  },
  {
    "ville": "Cachan",
    "cp": "94230",
    base: 4
  },
  {
    "ville": "Carrières sur Seine",
    "cp": "78420",
    base: 8
  },
  {
    "ville": "Cergy",
    "cp": "95800",
    base: 15
  },
  {
    "ville": "Champigny sur Marne",
    "cp": "94500",
    base: 8
  },
  {
    "ville": "Champs sur Marne",
    "cp": "77420",
    base: 14
  },
  {
    "ville": "Charenton le Pont",
    "cp": "94220",
    base: 4
  },
  {
    "ville": "Châtenay Malabry",
    "cp": "92290",
    base: 8
  },
  {
    "ville": "Chatillon",
    "cp": "92320",
    base: 4
  },
  {
    "ville": "Chatou",
    "cp": "78400",
    base: 8
  },
  {
    "ville": "Chaville",
    "cp": "92370",
    base: 7
  },
  {
    "ville": "Chelles",
    "cp": "77500",
    base: 14
  },
  {
    "ville": "Chennevières sur Marne",
    "cp": "94430",
    base: 12
  },
  {
    "ville": "Chesnay Rocquencourt (le)",
    "cp": "78150",
    base: 8
  },
  {
    "ville": "Chessy",
    "cp": "77700",
    base: 20
  },
  {
    "ville": "Chevilly Larue",
    "cp": "94550",
    base: 8
  },
  {
    "ville": "Chilly Mazarin",
    "cp": "91380",
    base: 12
  },
  {
    "ville": "Choisy le Roi",
    "cp": "94600",
    base: 8
  },
  {
    "ville": "Clamart",
    "cp": "92140",
    base: 4
  },
  {
    "ville": "Clichy",
    "cp": "92110",
    base: 3
  },
  {
    "ville": "Clichy sous Bois",
    "cp": "93390",
    base: 14
  },
  {
    "ville": "Colombes",
    "cp": "92700",
    base: 4
  },
  {
    "ville": "Combs la Ville",
    "cp": "77380",
    base: 18
  },
  {
    "ville": "Conflans Ste Honorine",
    "cp": "78700",
    base: 15
  },
  {
    "ville": "Coubron",
    "cp": "93470",
    base: 14
  },
  {
    "ville": "Coulommiers",
    "cp": "77120",
    base: 30
  },
  {
    "ville": "Courbevoie",
    "cp": "92400",
    base: 3
  },
  {
    "ville": "Courcouronnes",
    "cp": "91080",
    base: 15
  },
  {
    "ville": "Courneuve (la)",
    "cp": "93120",
    base: 6
  },
  {
    "ville": "Créteil",
    "cp": "94000",
    base: 8
  },
  {
    "ville": "Croissy Beaubourg",
    "cp": "77183",
    base: 14
  },
  {
    "ville": "Défense (la)",
    "cp": "92060",
    base: 3
  },
  {
    "ville": "Deuil la Barre",
    "cp": "95170",
    base: 10
  },
  {
    "ville": "Domont",
    "cp": "95330",
    base: 14
  },
  {
    "ville": "Drancy",
    "cp": "93700",
    base: 8
  },
  {
    "ville": "Dugny",
    "cp": "93440",
    base: 8
  },
  {
    "ville": "Elancourt",
    "cp": "78990",
    base: 14
  },
  {
    "ville": "Emerainville",
    "cp": "77184",
    base: 14
  },
  {
    "ville": "Enghien les Bains",
    "cp": "95880",
    base: 10
  },
  {
    "ville": "Epinay sur Seine",
    "cp": "93800",
    base: 6
  },
  {
    "ville": "Étampes",
    "cp": "91150",
    base: 25
  },
  {
    "ville": "Evry",
    "cp": "91000",
    base: 15
  },
  {
    "ville": "Fontainebleau",
    "cp": "77300",
    base: 30
  },
  {
    "ville": "Fontenay aux Roses",
    "cp": "92260",
    base: 4
  },
  {
    "ville": "Fontenay sous Bois",
    "cp": "94120",
    base: 6
  },
  {
    "ville": "Fourqueux",
    "cp": "78112",
    base: 10
  },
  {
    "ville": "Franconville la Garenne",
    "cp": "95130",
    base: 10
  },
  {
    "ville": "Fresnes",
    "cp": "94260",
    base: 8
  },
  {
    "ville": "Gagny",
    "cp": "93220",
    base: 12
  },
  {
    "ville": "Garches",
    "cp": "92380",
    base: 4
  },
  {
    "ville": "Garenne Colombes (la)",
    "cp": "92250",
    base: 4
  },
  {
    "ville": "Garges les Gonesse",
    "cp": "95140",
    base: 10
  },
  {
    "ville": "Gennevilliers",
    "cp": "92230",
    base: 4
  },
  {
    "ville": "Gentilly",
    "cp": "94250",
    base: 4
  },
  {
    "ville": "Gif sur Yvette",
    "cp": "91190",
    base: 15
  },
  {
    "ville": "Gometz le Châtel",
    "cp": "91940",
    base: 15
  },
  {
    "ville": "Gonesse",
    "cp": "95000",
    base: 10
  },
  {
    "ville": "Gournay sur Marne",
    "cp": "93460",
    base: 14
  },
  {
    "ville": "Goussainville",
    "cp": "95190",
    base: 14
  },
  {
    "ville": "Guyancourt",
    "cp": "78280",
    base: 14
  },
  {
    "ville": "Hay les Roses (l')",
    "cp": "94240",
    base: 6
  },
  {
    "ville": "Herblay",
    "cp": "95220",
    base: 15
  },
  {
    "ville": "Houilles",
    "cp": "78800",
    base: 8
  },
  {
    "ville": "Iles Saint Denis (l')",
    "cp": "93450",
    base: 6
  },
  {
    "ville": "Issy les Moulineaux",
    "cp": "92130",
    base: 3
  },
  {
    "ville": "Ivry sur Seine",
    "cp": "94200",
    base: 4
  },
  {
    "ville": "Joinville le Pont",
    "cp": "94340",
    base: 6
  },
  {
    "ville": "Jouy en Josas",
    "cp": "78350",
    base: 8
  },
  {
    "ville": "Juvisy sur Orge",
    "cp": "91260",
    base: 12
  },
  {
    "ville": "Kremlin Bicêtre (le)",
    "cp": "94250",
    base: 4
  },
  {
    "ville": "Le Queue en Brie",
    "cp": "94510",
    base: 14
  },
  {
    "ville": "Levallois Perret",
    "cp": "92300",
    base: 3
  },
  {
    "ville": "Lieusaint",
    "cp": "77127",
    base: 18
  },
  {
    "ville": "Lilas (les)",
    "cp": "93260",
    base: 4
  },
  {
    "ville": "Limeil Brevannes",
    "cp": "94450",
    base: 12
  },
  {
    "ville": "Lisses",
    "cp": "91090",
    base: 15
  },
  {
    "ville": "Livry Gargan",
    "cp": "93190",
    base: 14
  },
  {
    "ville": "Lognes",
    "cp": "77185",
    base: 14
  },
  {
    "ville": "Longjumeau",
    "cp": "91160",
    base: 12
  },
  {
    "ville": "Louveciennes",
    "cp": "78430",
    base: 8
  },
  {
    "ville": "Maisons Alfort",
    "cp": "94700",
    base: 6
  },
  {
    "ville": "Maisons Laffite",
    "cp": "78600",
    base: 10
  },
  {
    "ville": "Malakoff",
    "cp": "92240",
    base: 3
  },
  {
    "ville": "Mantes la Jolie",
    "cp": "78200",
    base: 25
  },
  {
    "ville": "Marly le Roi",
    "cp": "78160",
    base: 8
  },
  {
    "ville": "Marnes la Coquette",
    "cp": "92430",
    base: 7
  },
  {
    "ville": "Massy",
    "cp": "91300",
    base: 12
  },
  {
    "ville": "Meaux",
    "cp": "77100",
    base: 25
  },
  {
    "ville": "Melun",
    "cp": "77000",
    base: 25
  },
  {
    "ville": "Meudon",
    "cp": "92190",
    base: 4
  },
  {
    "ville": "Meudon La Forêt",
    "cp": "92390",
    base: 7
  },
  {
    "ville": "Meulan en Yvelines",
    "cp": "78250",
    base: 20
  },
  {
    "ville": "Mitry Mory",
    "cp": "77290",
    base: 14
  },
  {
    "ville": "Moissy Cramayel",
    "cp": "77550",
    base: 18
  },
  {
    "ville": "Monfermeil",
    "cp": "93370",
    base: 14
  },
  {
    "ville": "Montfort l'Amaury",
    "cp": "78490",
    base: 20
  },
  {
    "ville": "Montigny le Bretonneux",
    "cp": "78180",
    base: 14
  },
  {
    "ville": "Montlhéry",
    "cp": "91310",
    base: 15
  },
  {
    "ville": "Montreuil sous Bois",
    "cp": "93100",
    base: 4
  },
  {
    "ville": "Montrouge",
    "cp": "92120",
    base: 3
  },
  {
    "ville": "Morangis",
    "cp": "91420",
    base: 12
  },
  {
    "ville": "Mureaux (les)",
    "cp": "78130",
    base: 20
  },
  {
    "ville": "Nanterre",
    "cp": "92000",
    base: 4
  },
  {
    "ville": "Neuilly Plaisance",
    "cp": "93360",
    base: 12
  },
  {
    "ville": "Neuilly sur Marne",
    "cp": "93330",
    base: 12
  },
  {
    "ville": "Neuilly sur Seine",
    "cp": "92200",
    base: 3
  },
  {
    "ville": "Nogent sur Marne",
    "cp": "94130",
    base: 6
  },
  {
    "ville": "Noiseau",
    "cp": "94370",
    base: 12
  },
  {
    "ville": "Noisy le Grand",
    "cp": "93160",
    base: 12
  },
  {
    "ville": "Noisy le Sec",
    "cp": "93130",
    base: 6
  },
  {
    "ville": "Orly",
    "cp": "94310",
    base: 8
  },
  {
    "ville": "Ormesson sur Marne",
    "cp": "94490",
    base: 12
  },
  {
    "ville": "Orsay",
    "cp": "91400",
    base: 15
  },
  {
    "ville": "Palaiseau",
    "cp": "91120",
    base: 12
  },
  {
    "ville": "Pantin",
    "cp": "93500",
    base: 4
  },
  {
    "ville": "Pavillons sous Bois (les)",
    "cp": "93320",
    base: 12
  },
  {
    "ville": "Perreux sur Marne (le)",
    "cp": "94170",
    base: 8
  },
  {
    "ville": "Pierrefitte sur Seine",
    "cp": "93380",
    base: 8
  },
  {
    "ville": "Plaisir",
    "cp": "78370",
    base: 14
  },
  {
    "ville": "Plessis Robinson (le)",
    "cp": "92350",
    base: 8
  },
  {
    "ville": "Plessis Trévise (le)",
    "cp": "94420",
    base: 14
  },
  {
    "ville": "Poissy",
    "cp": "78300",
    base: 15
  },
  {
    "ville": "Pontoise",
    "cp": "95300",
    base: 15
  },
  {
    "ville": "Pré Saint Gervais (le)",
    "cp": "93310",
    base: 4
  },
  {
    "ville": "Puteaux",
    "cp": "92800",
    base: 3
  },
  {
    "ville": "Raincy (le)",
    "cp": "93340",
    base: 12
  },
  {
    "ville": "Rambouillet",
    "cp": "78120",
    base: 25
  },
  {
    "ville": "Roissy en France",
    "cp": "95700",
    base: 14
  },
  {
    "ville": "Romainville",
    "cp": "93230",
    base: 6
  },
  {
    "ville": "Rosny sous Bois",
    "cp": "93110",
    base: 6
  },
  {
    "ville": "Rueil Malmaison",
    "cp": "92500",
    base: 4
  },
  {
    "ville": "Rungis",
    "cp": "94150",
    base: 8
  },
  {
    "ville": "Saclay",
    "cp": "91400",
    base: 15
  },
  {
    "ville": "Saint Cloud",
    "cp": "92210",
    base: 4
  },
  {
    "ville": "Saint Denis",
    "cp": "93200",
    base: 6
  },
  {
    "ville": "Saint Germain en Laye",
    "cp": "78100",
    base: 10
  },
  {
    "ville": "Saint Gratien",
    "cp": "95210",
    base: 10
  },
  {
    "ville": "Saint Mande",
    "cp": "94160",
    base: 4
  },
  {
    "ville": "Saint Maur des Fossés",
    "cp": "94210",
    base: 8
  },
  {
    "ville": "Saint Maurice",
    "cp": "94410",
    base: 6
  },
  {
    "ville": "Saint Ouen l'Aumône",
    "cp": "95310",
    base: 15
  },
  {
    "ville": "Saint Ouen sur Seine",
    "cp": "93400",
    base: 4
  },
  {
    "ville": "Saint Thibault des Vignes",
    "cp": "77400",
    base: 16
  },
  {
    "ville": "Sarcelles",
    "cp": "95200",
    base: 10
  },
  {
    "ville": "Sartrouville",
    "cp": "78500",
    base: 8
  },
  {
    "ville": "Sceaux",
    "cp": "92330",
    base: 8
  },
  {
    "ville": "Sevran",
    "cp": "93270",
    base: 14
  },
  {
    "ville": "Sèvres",
    "cp": "92310",
    base: 4
  },
  {
    "ville": "Stains",
    "cp": "93240",
    base: 8
  },
  {
    "ville": "Sucy en Brie",
    "cp": "94370",
    base: 12
  },
  {
    "ville": "Suresnes",
    "cp": "92150",
    base: 3
  },
  {
    "ville": "Thiais",
    "cp": "94320",
    base: 8
  },
  {
    "ville": "Torcy",
    "cp": "77200",
    base: 14
  },
  {
    "ville": "Trappes",
    "cp": "78190",
    base: 14
  },
  {
    "ville": "Tremblay en France",
    "cp": "93290",
    base: 14
  },
  {
    "ville": "Ulis (les)",
    "cp": "91940",
    base: 15
  },
  {
    "ville": "Valenton",
    "cp": "94460",
    base: 12
  },
  {
    "ville": "Vanves",
    "cp": "92170",
    base: 3
  },
  {
    "ville": "Vaucresson",
    "cp": "92420",
    base: 7
  },
  {
    "ville": "Vaujours",
    "cp": "93410",
    base: 14
  },
  {
    "ville": "Vélisy Villacoublay",
    "cp": "78140",
    base: 8
  },
  {
    "ville": "Versailles",
    "cp": "78000",
    base: 8
  },
  {
    "ville": "Vesinet (le)",
    "cp": "78110",
    base: 8
  },
  {
    "ville": "Ville d'Avray",
    "cp": "92410",
    base: 7
  },
  {
    "ville": "Villecresnes",
    "cp": "94440",
    base: 14
  },
  {
    "ville": "Villejuif",
    "cp": "94800",
    base: 6
  },
  {
    "ville": "Villemomble",
    "cp": "93250",
    base: 8
  },
  {
    "ville": "Villeneuve la Garenne",
    "cp": "92390",
    base: 6
  },
  {
    "ville": "Villeneuve St Georges",
    "cp": "94190",
    base: 12
  },
  {
    "ville": "Villepinte",
    "cp": "93420",
    base: 14
  },
  {
    "ville": "Villetaneuse",
    "cp": "93430",
    base: 8
  },
  {
    "ville": "Villiers sur Marne",
    "cp": "94350",
    base: 8
  },
  {
    "ville": "Vincennes",
    "cp": "94300",
    base: 4
  },
  {
    "ville": "Viroflay",
    "cp": "78220",
    base: 8
  },
  {
    "ville": "Vitry sur Seine",
    "cp": "94400",
    base: 6
  },
  {
    "ville": "Voisins le Bretonneux",
    "cp": "78960",
    base: 14
  },
  {
    "ville": "Wissous",
    "cp": "91320",
    "base": 10
  },
  {
    "ville": "Paris 01",
    "cp": "75001",
    base: 3
  },
  {
    "ville": "Paris 02",
    "cp": "75002",
    base: 3
  },
  {
    "ville": "Paris 03",
    "cp": "75003",
    base: 3
  },
  {
    "ville": "Paris 04",
    "cp": "75004",
    base: 3
  },
  {
    "ville": "Paris 05",
    "cp": "75005",
    base: 3
  },
  {
    "ville": "Paris 06",
    "cp": "75006",
    base: 3
  },
  {
    "ville": "Paris 07",
    "cp": "75007",
    base: 3
  },
  {
    "ville": "Paris 08",
    "cp": "75008",
    base: 3
  },
  {
    "ville": "Paris 09",
    "cp": "75009",
    base: 3
  },
  {
    "ville": "Paris 10",
    "cp": "75010",
    base: 3
  },
  {
    "ville": "Paris 11",
    "cp": "75011",
    base: 3
  },
  {
    "ville": "Paris 12",
    "cp": "75012",
    base: 3
  },
  {
    "ville": "Paris 13",
    "cp": "75013",
    base: 3
  },
  {
    "ville": "Paris 14",
    "cp": "75014",
    base: 3
  },
  {
    "ville": "Paris 15",
    "cp": "75015",
    base: 3
  },
  {
    "ville": "Paris 16",
    "cp": "75016",
    base: 3
  },
  {
    "ville": "Paris 17",
    "cp": "75017",
    base: 3
  },
  {
    "ville": "Paris 18",
    "cp": "75018",
    base: 3
  },
  {
    "ville": "Paris 19",
    "cp": "75019",
    base: 3
  },
  {
    "ville": "Paris 20",
    "cp": "75020",
    base: 3
  }
].map(t => ({
  cp: t.cp,
  ville: t.ville,
  // Calcul automatique des formules : Normal +4, +8 etc.
  formules: {
    "NORMAL": t.base,
    "EXPRESS": t.base + 5,
    "URGENCE": t.base + 10,
    "VL_NORMAL": t.base + 5,
    "VL_EXPRESS": t.base + 10
  }
}));


export function getTarifParNom(villeRecherchee: string): TarifVille | undefined {
  const villeNormalisee = normaliserVilleSafe(villeRecherchee);

  return TARIFS_BONS.find(t => {
    const tNorm = normaliserVilleSafe(t.ville);
    return tNorm === villeNormalisee;
  });
}

/**
 * Normalise une ville pour la recherche (en utilisant la même logique que getTarifParNom)
 */
export function normaliserVilleSafe(ville: string): string {
  if (!ville) return "";
  return ville
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(LE|LA|LES|L')\b/g, '') // Supprime les articles
    .replace(/[^A-Z0-9]/g, ' ') // Remplace tout ce qui n'est pas alphanum par espace (incluant tirets)
    .replace(/\s+/g, ' ') // Réduit les espaces multiples
    .trim();
}

/**
 * Trouve une ville par ZIP ou Nom avec une meilleure robustesse
 * Priorité : Nom Exact > ZIP Exact > Contient Nom
 */
export function findCityByZipAndName(query: string, villeName?: string): TarifVille | undefined {
  if (!query) return undefined;

  // 1. PRIORITÉ ABSOLUE : Essai par Code Postal (si query est un CP valide 5 chiffres)
  // Cela évite que "75020" + "Paris" match "Paris 01" à cause du nom "Paris"
  if (/^\d{5}$/.test(query)) {
    const candidates = TARIFS_BONS.filter(t => t.cp === query);

    // Cas parfait : 1 seul résultat (ex: 75020 -> Paris 20)
    if (candidates.length === 1) return candidates[0];

    // Cas multiple : On essaie de départager avec le nom de ville
    if (candidates.length > 1 && villeName) {
      const vNameNorm = normaliserVilleSafe(villeName);
      // 1. Essai match exact
      const exact = candidates.find(t => normaliserVilleSafe(t.ville) === vNameNorm);
      if (exact) return exact;

      // 2. Essai match partiel
      const best = candidates.find(t => normaliserVilleSafe(t.ville).includes(vNameNorm) || vNameNorm.includes(normaliserVilleSafe(t.ville)));
      return best || candidates[0]; // Fallback au premier
    }

    if (candidates.length > 0) return candidates[0];
  }

  // 2. Essai direct par nom (héritage)
  let match = getTarifParNom(query);
  if (match) return match;

  // 3. Si on a un nom de ville explicite (venant de l'autocomplete)
  if (villeName) {
    match = getTarifParNom(villeName);
    if (match) return match;

    // Normalisation pour recherche floue
    const vNameNorm = normaliserVilleSafe(villeName);
    // Recherche si le nom contient ou est contenu (ex: Saint Ouen vs Saint Ouen sur Seine)
    match = TARIFS_BONS.find(t => {
      const tName = normaliserVilleSafe(t.ville);
      return tName === vNameNorm || tName.includes(vNameNorm) || vNameNorm.includes(tName);
    });
    if (match) return match;
  }

  return undefined;
}

/**
 * Vérifie si une ville est desservie
 * Supporte signature (ville) ou (cp, ville)
 */
export function estVilleDesservie(query: string, villeName?: string): boolean {
  return !!findCityByZipAndName(query, villeName);
}

/**
 * Récupère le tarif de base pour une ville
 */
export function getTarifBase(ville: string): number | undefined {
  const tarif = getTarifParNom(ville);
  return tarif?.formules.NORMAL;
}

/**
 * Recherche des villes dans la base locale (pour l'autocomplétion)
 * @param query Le texte à rechercher (début du nom ou du code postal)
 * @param limit Nombre maximum de résultats
 */
export function rechercherVilles(query: string, limit: number = 5): TarifVille[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = normaliserVilleSafe(query);

  return TARIFS_BONS.filter(t => {
    const normalizedVille = normaliserVilleSafe(t.ville);
    // Match nom (début ou contient) OU Match Code Postal (début)
    return normalizedVille.includes(normalizedQuery) || t.cp.startsWith(query);
  }).slice(0, limit);
}

