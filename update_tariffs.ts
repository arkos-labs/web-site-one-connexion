
import fs from 'fs';
import path from 'path';

const csvData = `Alfortville;94140;6;30,00;55,00
Antony;92160;8;40,00;65,00
Arcueil;94110;4;20,00;45,00
Argenteuil;95100;8;40,00;65,00
Arpajon;91290;15;75,00;100,00
Asnières sur Seine;92600;4;20,00;45,00
Athis Mons;91200;12;60,00;85,00
Aubervilliers;93300;4;20,00;45,00
Aulnay sous Bois;93600;12;60,00;85,00
Bagneux;92220;4;20,00;45,00
Bagnolet;93170;4;20,00;45,00
Bezons;95870;8;40,00;65,00
Bièvres;91570;12;60,00;85,00
Blanc Mesnil (le);93150;8;40,00;65,00
Bobigny;93000;6;30,00;55,00
Bois Colombes;92270;4;20,00;45,00
Bois d'Arcy;78390;14;70,00;95,00
Bondoufle;91070;15;75,00;100,00
Bondy;93140;8;40,00;65,00
Bonneuil sur Marne;94380;12;60,00;85,00
Bougival;78380;8;40,00;65,00
Boulogne Billancourt;92100;3;15,00;40,00
Bourg la Reine;92340;8;40,00;65,00
Bourget (le);93350;8;40,00;65,00
Brie Comte Robert;77170;20;100,00;125,00
Bry sur Marne;94360;8;40,00;65,00
Buc;78530;8;40,00;65,00
Bussy Saint Georges;77600;14;70,00;95,00
Cachan;94230;4;20,00;45,00
Carrières sur Seine;78420;8;40,00;65,00
Cergy;95800;15;75,00;100,00
Champigny sur Marne;94500;8;40,00;65,00
Champs sur Marne;77420;14;70,00;95,00
Charenton le Pont;94220;4;20,00;45,00
Châtenay Malabry;92290;8;40,00;65,00
Chatillon;92320;4;20,00;45,00
Chatou;78400;8;40,00;65,00
Chaville;92370;7;35,00;60,00
Chelles;77500;14;70,00;95,00
Chennevières sur Marne;94430;12;60,00;85,00
Chesnay Rocquencourt (le);78150;8;40,00;65,00
Chessy;77700;20;100,00;125,00
Chevilly Larue;94550;8;40,00;65,00
Chilly Mazarin;91380;12;60,00;85,00
Choisy le Roi;94600;8;40,00;65,00
Clamart;92140;4;20,00;45,00
Clichy;92110;3;15,00;40,00
Clichy sous Bois;93390;14;70,00;95,00
Colombes;92700;4;20,00;45,00
Combs la Ville;77380;18;90,00;115,00
Conflans Ste Honorine;78700;15;75,00;100,00
Coubron;93470;14;70,00;95,00
Coulommiers;77120;30;150,00;175,00
Courbevoie;92400;3;15,00;40,00
Courcouronnes;91080;15;75,00;100,00
Courneuve (la);93120;6;30,00;55,00
Créteil;94000;8;40,00;65,00
Croissy Beaubourg;77183;14;70,00;95,00
Défense (la);92060;3;15,00;40,00
Deuil la Barre;95170;10;50,00;75,00
Domont;95330;14;70,00;95,00
Drancy;93700;8;40,00;65,00
Dugny;93440;8;40,00;65,00
Elancourt;78990;14;70,00;95,00
Emerainville;77184;14;70,00;95,00
Enghien les Bains;95880;10;50,00;75,00
Epinay sur Seine;93800;6;30,00;55,00
Étampes;91150;25;125,00;150,00
Evry;91000;15;75,00;100,00
Fontainebleau;77300;30;150,00;175,00
Fontenay aux Roses;92260;4;20,00;45,00
Fontenay sous Bois;94120;6;30,00;55,00
Fourqueux;78112;10;50,00;75,00
Franconville la Garenne;95130;10;50,00;75,00
Fresnes;94260;8;40,00;65,00
Gagny;93220;12;60,00;85,00
Garches;92380;4;20,00;45,00
Garenne Colombes (la);92250;4;20,00;45,00
Garges les Gonesse;95140;10;50,00;75,00
Gennevilliers;92230;4;20,00;45,00
Gentilly;94250;4;20,00;45,00
Gif sur Yvette;91190;15;75,00;100,00
Gometz le Châtel;91940;15;75,00;100,00
Gonesse;95000;10;50,00;75,00
Gournay sur Marne;93460;14;70,00;95,00
Goussainville;95190;14;70,00;95,00
Guyancourt;78280;14;70,00;95,00
Hay les Roses (l');94240;6;30,00;55,00
Herblay;95220;15;75,00;100,00
Houilles;78800;8;40,00;65,00
Iles Saint Denis (l');93450;6;30,00;55,00
Issy les Moulineaux;92130;3;15,00;40,00
Ivry sur Seine;94200;4;20,00;45,00
Joinville le Pont;94340;6;30,00;55,00
Jouy en Josas;78350;8;40,00;65,00
Juvisy sur Orge;91260;12;60,00;85,00
Kremlin Bicêtre (le);94250;4;20,00;45,00
Le Queue en Brie;94510;14;70,00;95,00
Levallois Perret;92300;3;15,00;40,00
Lieusaint;77127;18;90,00;115,00
Lilas (les);93260;4;20,00;45,00
Limeil Brevannes;94450;12;60,00;85,00
Lisses;91090;15;75,00;100,00
Livry Gargan;93190;14;70,00;95,00
Lognes;77185;14;70,00;95,00
Longjumeau;91160;12;60,00;85,00
Louveciennes;78430;8;40,00;65,00
Maisons Alfort;94700;6;30,00;55,00
Maisons Laffite;78600;10;50,00;75,00
Malakoff;92240;3;15,00;40,00
Mantes la Jolie;78200;25;125,00;150,00
Marly le Roi;78160;8;40,00;65,00
Marnes la Coquette;92430;7;35,00;60,00
Massy;91300;12;60,00;85,00
Meaux;77100;25;125,00;150,00
Melun;77000;25;125,00;150,00
Meudon;92190;4;20,00;45,00
Meudon La Forêt;92390;7;35,00;60,00
Meulan en Yvelines;78250;20;100,00;125,00
Mitry Mory;77290;14;70,00;95,00
Moissy Cramayel;77550;18;90,00;115,00
Monfermeil;93370;14;70,00;95,00
Montfort l'Amaury;78490;20;100,00;125,00
Montigny le Bretonneux;78180;14;70,00;95,00
Montlhéry;91310;15;75,00;100,00
Montreuil sous Bois;93100;4;20,00;45,00
Montrouge;92120;3;15,00;40,00
Morangis;91420;12;60,00;85,00
Mureaux (les);78130;20;100,00;125,00
Nanterre;92000;4;20,00;45,00
Neuilly Plaisance;93360;12;60,00;85,00
Neuilly sur Marne;93330;12;60,00;85,00
Neuilly sur Seine;92200;3;15,00;40,00
Nogent sur Marne;94130;6;30,00;55,00
Noiseau;94370;12;60,00;85,00
Noisy le Grand;93160;12;60,00;85,00
Noisy le Sec;93130;6;30,00;55,00
Orly;94310;8;40,00;65,00
Ormesson sur Marne;94490;12;60,00;85,00
Orsay;91400;15;75,00;100,00
Palaiseau;91120;12;60,00;85,00
Pantin;93500;4;20,00;45,00
Paris (Tous arrondissements);75000;3;15,00;40,00
Pavillons sous Bois (les);93320;12;60,00;85,00
Perreux sur Marne (le);94170;8;40,00;65,00
Pierrefitte sur Seine;93380;8;40,00;65,00
Plaisir;78370;14;70,00;95,00
Plessis Robinson (le);92350;8;40,00;65,00
Plessis Trévise (le);94420;14;70,00;95,00
Poissy;78300;15;75,00;100,00
Pontoise;95300;15;75,00;100,00
Pré Saint Gervais (le);93310;4;20,00;45,00
Puteaux;92800;3;15,00;40,00
Raincy (le);93340;12;60,00;85,00
Rambouillet;78120;25;125,00;150,00
Roissy en France;95700;14;70,00;95,00
Romainville;93230;6;30,00;55,00
Rosny sous Bois;93110;6;30,00;55,00
Rueil Malmaison;92500;4;20,00;45,00
Rungis;94150;8;40,00;65,00
Saclay;91400;15;75,00;100,00
Saint Cloud;92210;4;20,00;45,00
Saint Denis;93200;6;30,00;55,00
Saint Germain en Laye;78100;10;50,00;75,00
Saint Gratien;95210;10;50,00;75,00
Saint Mande;94160;4;20,00;45,00
Saint Maur des Fossés;94210;8;40,00;65,00
Saint Maurice;94410;6;30,00;55,00
Saint Ouen l'Aumône;95310;15;75,00;100,00
Saint Ouen sur Seine;93400;4;20,00;45,00
Saint Thibault des Vignes;77400;16;80,00;105,00
Sarcelles;95200;10;50,00;75,00
Sartrouville;78500;8;40,00;65,00
Sceaux;92330;8;40,00;65,00
Sevran;93270;14;70,00;95,00
Sèvres;92310;4;20,00;45,00
Stains;93240;8;40,00;65,00
Sucy en Brie;94370;12;60,00;85,00
Suresnes;92150;3;15,00;40,00
Thiais;94320;8;40,00;65,00
Torcy;77200;14;70,00;95,00
Trappes;78190;14;70,00;95,00
Tremblay en France;93290;14;70,00;95,00
Ulis (les);91940;15;75,00;100,00
Valenton;94460;12;60,00;85,00
Vanves;92170;3;15,00;40,00
Vaucresson;92420;7;35,00;60,00
Vaujours;93410;14;70,00;95,00
Vélisy Villacoublay;78140;8;40,00;65,00
Versailles;78000;8;40,00;65,00
Vesinet (le);78110;8;40,00;65,00
Ville d'Avray;92410;7;35,00;60,00
Villecresnes;94440;14;70,00;95,00
Villejuif;94800;6;30,00;55,00
Villemomble;93250;8;40,00;65,00
Villeneuve la Garenne;92390;6;30,00;55,00
Villeneuve St Georges;94190;12;60,00;85,00
Villepinte;93420;14;70,00;95,00
Villetaneuse;93430;8;40,00;65,00
Villiers sur Marne;94350;8;40,00;65,00
Vincennes;94300;4;20,00;45,00
Viroflay;78220;8;40,00;65,00
Vitry sur Seine;94400;6;30,00;55,00
Voisins le Bretonneux;78960;14;70,00;95,00
Wissous;91320;10;50,00;75,00`;

const newTariffs = csvData.split('\n').filter(l => l.trim()).map(line => {
    const [ville, cp, base, moto, car] = line.split(';');
    return {
        ville: ville.trim(),
        cp: cp.trim(),
        base: parseInt(base.trim())
    };
});

// Expand Paris
const parisEntry = newTariffs.find(t => t.ville.toLowerCase().includes('paris'));
if (parisEntry) {
    // Remove "Paris (Tous...)"
    const index = newTariffs.indexOf(parisEntry);
    newTariffs.splice(index, 1);

    // Add clean entries
    newTariffs.push({ ville: "Paris", cp: "75000", base: parisEntry.base });
    for (let i = 1; i <= 20; i++) {
        const arrt = i.toString().padStart(2, '0');
        newTariffs.push({ ville: `Paris ${arrt}`, cp: `750${arrt}`, base: parisEntry.base });
    }
}

// Generate file content
const fileContent = `
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

export const TARIFS_BONS: TarifVille[] = ${JSON.stringify(newTariffs.map(t => ({
    ville: t.ville,
    cp: t.cp,
    base: t.base
})), null, 2).replace(/"base":/g, 'base:')}.map(t => ({
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
  const villeNormalisee = villeRecherchee
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .replace(/\\b(LE|LA|LES|L')\\b/g, '')
      .replace(/[^A-Z0-9]/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();

  return TARIFS_BONS.find(t => {
      const tNorm = t.ville
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\\u0300-\\u036f]/g, '')
          .replace(/\\b(LE|LA|LES|L')\\b/g, '')
          .replace(/[^A-Z0-9]/g, ' ')
          .replace(/\\s+/g, ' ')
          .trim();
      
      return tNorm === villeNormalisee;
  });
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/data/tarifs_idf.ts'), fileContent);
console.log(`Updated tarifs_idf.ts with ${newTariffs.length} cities.`);
