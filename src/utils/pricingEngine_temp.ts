/**
 * ONE CONNEXION EXPRESS - MOTEUR TARIFAIRE OFFICIEL
 * 
 * Ce module implÃ©mente la logique tarifaire basÃ©e sur le systÃ¨me de BONS.
 * 
 * RÃˆGLES TARIFAIRES :
 * - 1 bon = 5,50 â‚¬
 * - Prix = nombre de bons Ã— 5,50 â‚¬
 * - Le nombre de bons dÃ©pend uniquement de la VILLE D'ARRIVÃ‰E
 * 
 * FORMULES & DÃ‰LAIS :
 * - Standard (N) : 2h Ã  4h
 * - Express (E) : 1h30 Ã  2h
 * - Flash Express (F) : 30 min Ã  1h
 * 
 * @version 2.0
 * @date 2025-12-03
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export type Formule = 'STANDARD' | 'EXPRESS' | 'FLASH_EXPRESS';

export interface TarifVille {
    N: number; // Standard
    E: number; // Express
    F: number; // Flash Express
}

export interface PricingResult {
    // DonnÃ©es de base
    formule: Formule;
    villeArrivee: string;

    // Calcul tarifaire
    nombreBons: number;
    prixUnitaireBon: number;
    prixTotal: number;

    // MÃ©tadonnÃ©es
    delaiEstime: string;
    formuleLabel: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PRIX_BON = 5.50; // Prix unitaire d'un bon en euros

// ============================================================================
// BASE TARIFAIRE OFFICIELLE
// ============================================================================

export const BASE_TARIFAIRE: Record<string, TarifVille> = {
    // Paris (75)
    "PARIS": { N: 3, E: 5, F: 7 },

    // Hauts-de-Seine (92)
    "ANTONY": { N: 6, E: 10, F: 14 },
    "ASNIERES-SUR-SEINE": { N: 4, E: 8, F: 12 },
    "BAGNEUX": { N: 5, E: 9, F: 13 },
    "BOIS-COLOMBES": { N: 4, E: 8, F: 12 },
    "BOULOGNE-BILLANCOURT": { N: 3, E: 6, F: 9 },
    "BOURG-LA-REINE": { N: 5, E: 9, F: 13 },
    "CHATENAY-MALABRY": { N: 7, E: 11, F: 15 },
    "CHATILLON": { N: 4, E: 8, F: 12 },
    "CHAVILLE": { N: 6, E: 10, F: 14 },
    "CLAMART": { N: 5, E: 9, F: 13 },
    "CLICHY": { N: 3, E: 5, F: 9 },
    "COLOMBES": { N: 5, E: 10, F: 15 },
    "COURBEVOIE": { N: 3, E: 6, F: 9 },
    "FONTENAY-AUX-ROSES": { N: 6, E: 10, F: 14 },
    "GARCHES": { N: 7, E: 11, F: 15 },
    "GENNEVILLIERS": { N: 5, E: 10, F: 15 },
    "ISSY-LES-MOULINEAUX": { N: 3, E: 6, F: 9 },
    "LA DEFENSE": { N: 4, E: 8, F: 12 },
    "LA GARENNE-COLOMBES": { N: 4, E: 8, F: 12 },
    "LE PLESSIS-ROBINSON": { N: 7, E: 11, F: 15 },
    "LEVALLOIS-PERRET": { N: 3, E: 5, F: 7 },
    "MALAKOFF": { N: 4, E: 8, F: 12 },
    "MARNES-LA-COQUETTE": { N: 8, E: 12, F: 16 },
    "MEUDON": { N: 7, E: 12, F: 15 },
    "MONTROUGE": { N: 3, E: 6, F: 9 },
    "NANTERRE": { N: 4, E: 8, F: 12 },
    "NEUILLY-SUR-SEINE": { N: 3, E: 5, F: 7 },
    "PUTEAUX": { N: 4, E: 8, F: 12 },
    "RUEIL-MALMAISON": { N: 8, E: 14, F: 19 },
    "SAINT-CLOUD": { N: 6, E: 10, F: 14 },
    "SCEAUX": { N: 6, E: 10, F: 14 },
    "SEVRES": { N: 5, E: 10, F: 15 },
    "SURESNES": { N: 4, E: 8, F: 12 },
    "VANVES": { N: 3, E: 6, F: 9 },
    "VAUCRESSON": { N: 8, E: 12, F: 16 },
    "VILLE-DAVRAY": { N: 7, E: 11, F: 15 },
    "VILLENEUVE-LA-GARENNE": { N: 5, E: 10, F: 15 },

    // Seine-Saint-Denis (93)
    "AUBERVILLIERS": { N: 3, E: 6, F: 9 },
    "AULNAY-SOUS-BOIS": { N: 6, E: 12, F: 16 },
    "BAGNOLET": { N: 3, E: 6, F: 10 },
    "BOBIGNY": { N: 5, E: 10, F: 15 },
    "BONDY": { N: 5, E: 10, F: 14 },
    "CLICHY-SOUS-BOIS": { N: 8, E: 14, F: 18 },
    "COUBRON": { N: 10, E: 15, F: 20 },
    "DRANCY": { N: 5, E: 10, F: 14 },
    "DUGNY": { N: 6, E: 11, F: 15 },
    "EPINAY-SUR-SEINE": { N: 6, E: 11, F: 15 },
    "GAGNY": { N: 7, E: 12, F: 16 },
    "GOURNAY-SUR-MARNE": { N: 9, E: 14, F: 18 },
    "LILE-SAINT-DENIS": { N: 5, E: 9, F: 13 },
    "LA COURNEUVE": { N: 5, E: 10, F: 14 },
    "LA PLAINE-SAINT-DENIS": { N: 3, E: 6, F: 9 },
    "LE BLANC-MESNIL": { N: 6, E: 11, F: 15 },
    "LE BOURGET": { N: 5, E: 10, F: 14 },
    "LE PRE-SAINT-GERVAIS": { N: 3, E: 6, F: 9 },
    "LE RAINCY": { N: 7, E: 12, F: 16 },
    "LES LILAS": { N: 3, E: 6, F: 9 },
    "LES PAVILLONS-SOUS-BOIS": { N: 7, E: 12, F: 16 },
    "LIVRY-GARGAN": { N: 8, E: 13, F: 17 },
    "MONTFERMEIL": { N: 9, E: 14, F: 18 },
    "MONTREUIL": { N: 3, E: 6, F: 9 },
    "NEUILLY-PLAISANCE": { N: 6, E: 11, F: 15 },
    "NEUILLY-SUR-MARNE": { N: 7, E: 12, F: 16 },
    "NOISY-LE-GRAND": { N: 8, E: 13, F: 17 },
    "NOISY-LE-SEC": { N: 4, E: 8, F: 12 },
    "PANTIN": { N: 3, E: 6, F: 9 },
    "PIERREFITTE-SUR-SEINE": { N: 6, E: 11, F: 15 },
    "ROMAINVILLE": { N: 4, E: 8, F: 12 },
    "ROSNY-SOUS-BOIS": { N: 5, E: 10, F: 14 },
    "SAINT-DENIS": { N: 4, E: 8, F: 12 },
    "SAINT-OUEN": { N: 3, E: 6, F: 9 },
    "SEVRAN": { N: 8, E: 13, F: 17 },
    "STAINS": { N: 6, E: 11, F: 15 },
    "TREMBLAY-EN-FRANCE": { N: 15, E: 18, F: 21 },
    "VAUJOURS": { N: 10, E: 15, F: 19 },
    "VILLEMOMBLE": { N: 6, E: 11, F: 15 },
    "VILLEPINTE": { N: 12, E: 15, F: 20 },
    "VILLETANEUSE": { N: 5, E: 10, F: 14 },

    // Val-de-Marne (94)
    "ABLON-SUR-SEINE": { N: 8, E: 13, F: 17 },
    "ALFORTVILLE": { N: 4, E: 8, F: 12 },
    "ARCUEIL": { N: 4, E: 8, F: 12 },
    "BOISSY-SAINT-LEGER": { N: 9, E: 14, F: 18 },
    "BONNEUIL-SUR-MARNE": { N: 7, E: 12, F: 16 },
    "BRY-SUR-MARNE": { N: 6, E: 11, F: 15 },
    "CACHAN": { N: 4, E: 8, F: 15 },
    "CHAMPIGNY-SUR-MARNE": { N: 6, E: 11, F: 15 },
    "CHARENTON-LE-PONT": { N: 3, E: 6, F: 9 },
    "CHENNEVIERES-SUR-MARNE": { N: 8, E: 13, F: 17 },
    "CHEVILLY-LARUE": { N: 7, E: 12, F: 16 },
    "CHOISY-LE-ROI": { N: 6, E: 11, F: 15 },
    "CRETEIL": { N: 6, E: 11, F: 15 },
    "FONTENAY-SOUS-BOIS": { N: 5, E: 10, F: 14 },
    "FRESNES": { N: 8, E: 13, F: 17 },
    "GENTILLY": { N: 3, E: 6, F: 10 },
    "IVRY-SUR-SEINE": { N: 3, E: 6, F: 9 },
    "JOINVILLE-LE-PONT": { N: 5, E: 9, F: 13 },
    "LHAY-LES-ROSES": { N: 6, E: 11, F: 15 },
    "LA QUEUE-EN-BRIE": { N: 10, E: 15, F: 19 },
    "LE KREMLIN-BICETRE": { N: 3, E: 6, F: 10 },
    "LE PERREUX-SUR-MARNE": { N: 5, E: 10, F: 14 },
    "LIMEIL-BREVANNES": { N: 9, E: 14, F: 18 },
    "MAISONS-ALFORT": { N: 4, E: 8, F: 12 },
    "MANDRES-LES-ROSES": { N: 12, E: 16, F: 20 },
    "MAROLLES-EN-BRIE": { N: 11, E: 15, F: 19 },
    "NOGENT-SUR-MARNE": { N: 5, E: 9, F: 13 },
    "NOISEAU": { N: 10, E: 15, F: 19 },
    "ORLY": { N: 8, E: 13, F: 17 },
    "ORMESSON-SUR-MARNE": { N: 9, E: 14, F: 18 },
    "PERIGNY": { N: 10, E: 15, F: 19 },
    "RUNGIS": { N: 8, E: 14, F: 19 },
    "SAINT-MANDE": { N: 3, E: 5, F: 8 },
    "SAINT-MAUR-DES-FOSSES": { N: 6, E: 12, F: 15 },
    "SAINT-MAURICE": { N: 4, E: 8, F: 12 },
    "SANTENY": { N: 12, E: 16, F: 20 },
    "SUCY-EN-BRIE": { N: 9, E: 14, F: 18 },
    "THIAIS": { N: 10, E: 13, F: 18 },
    "VALENTON": { N: 9, E: 14, F: 18 },
    "VILLECRESNES": { N: 10, E: 15, F: 19 },
    "VILLEJUIF": { N: 4, E: 8, F: 12 },
    "VILLENEUVE-LE-ROI": { N: 8, E: 13, F: 17 },
    "VILLENEUVE-SAINT-GEORGES": { N: 8, E: 13, F: 17 },
    "VILLIERS-SUR-MARNE": { N: 7, E: 12, F: 16 },
    "VINCENNES": { N: 3, E: 6, F: 9 },
    "VITRY-SUR-SEINE": { N: 5, E: 10, F: 15 },

    // Val-d'Oise (95)
    "ARGENTEUIL": { N: 6, E: 11, F: 15 },
    "ARNOUVILLE": { N: 8, E: 13, F: 17 },
    "BEAUCHAMP": { N: 10, E: 15, F: 19 },
    "BEAUMONT-SUR-OISE": { N: 18, E: 22, F: 28 },
    "BESSANCOURT": { N: 12, E: 16, F: 21 },
    "BEZONS": { N: 6, E: 11, F: 15 },
    "CERGY": { N: 15, E: 18, F: 25 },
    "CORMEILLES-EN-PARISIS": { N: 10, E: 15, F: 19 },
    "DEUIL-LA-BARRE": { N: 8, E: 13, F: 17 },
    "DOMONT": { N: 12, E: 16, F: 21 },
    "EAUBONNE": { N: 9, E: 14, F: 18 },
    "ECOUEN": { N: 10, E: 15, F: 19 },
    "ENGHIEN-LES-BAINS": { N: 7, E: 12, F: 16 },
    "ERMONT": { N: 9, E: 14, F: 18 },
    "EZANVILLE": { N: 10, E: 15, F: 19 },
    "FOSSES": { N: 15, E: 19, F: 24 },
    "FRANCONVILLE": { N: 9, E: 14, F: 18 },
    "GARGES-LES-GONESSE": { N: 8, E: 13, F: 17 },
    "GOUSSAINVILLE": { N: 12, E: 16, F: 21 },
    "GONESSE": { N: 10, E: 15, F: 19 },
    "GROSLAY": { N: 9, E: 14, F: 18 },
    "HERBLAY": { N: 10, E: 15, F: 19 },
    "LISLE-ADAM": { N: 20, E: 25, F: 32 },
    "LOUVRES": { N: 14, E: 18, F: 23 },
    "MARGENCY": { N: 9, E: 14, F: 18 },
    "MONTIGNY-LES-CORMEILLES": { N: 10, E: 15, F: 19 },
    "MONTMAGNY": { N: 7, E: 12, F: 16 },
    "MONTMORENCY": { N: 9, E: 14, F: 18 },
    "OSNY": { N: 15, E: 18, F: 25 },
    "PERSAN": { N: 20, E: 25, F: 32 },
    "PIERRELAYE": { N: 12, E: 16, F: 21 },
    "PONTOISE": { N: 15, E: 18, F: 25 },
    "ROISSY-EN-FRANCE": { N: 15, E: 19, F: 25 },
    "SAINT-BRICE-SOUS-FORET": { N: 9, E: 14, F: 18 },
    "SAINT-GRATIEN": { N: 8, E: 13, F: 17 },
    "SAINT-LEU-LA-FORET": { N: 11, E: 15, F: 20 },
    "SAINT-OUEN-LAUMONE": { N: 15, E: 18, F: 25 },
    "SAINT-PRIX": { N: 11, E: 15, F: 20 },
    "SANNOIS": { N: 8, E: 13, F: 17 },
    "SARCELLES": { N: 7, E: 14, F: 19 },
    "SOISY-SOUS-MONTMORENCY": { N: 9, E: 14, F: 18 },
    "TAVERNY": { N: 11, E: 15, F: 20 },
    "VIARMES": { N: 16, E: 20, F: 26 },
    "VILLIERS-LE-BEL": { N: 8, E: 13, F: 17 },

    // Yvelines (78)
    "ACHERES": { N: 12, E: 16, F: 21 },
    "ANDRESY": { N: 14, E: 18, F: 23 },
    "AUBERGENVILLE": { N: 18, E: 22, F: 28 },
    "BEYNES": { N: 18, E: 22, F: 28 },
    "BOIS-DARCY": { N: 14, E: 18, F: 23 },
    "BOUGIVAL": { N: 10, E: 14, F: 18 },
    "BUC": { N: 12, E: 16, F: 21 },
    "CARRIERES-SOUS-POISSY": { N: 14, E: 18, F: 23 },
    "CARRIERES-SUR-SEINE": { N: 10, E: 14, F: 18 },
    "CELLE-SAINT-CLOUD": { N: 10, E: 14, F: 18 },
    "CHAMBOURCY": { N: 14, E: 18, F: 23 },
    "CHANTELOUP-LES-VIGNES": { N: 15, E: 19, F: 24 },
    "CHATOU": { N: 9, E: 13, F: 17 },
    "CHEVREUSE": { N: 18, E: 22, F: 28 },
    "CLAYES-SOUS-BOIS": { N: 14, E: 18, F: 23 },
    "CONFLANS-SAINTE-HONORINE": { N: 14, E: 18, F: 23 },
    "CROISSY-SUR-SEINE": { N: 10, E: 14, F: 18 },
    "ELANCOURT": { N: 15, E: 18, F: 24 },
    "EPONE": { N: 20, E: 24, F: 30 },
    "FONTENAY-LE-FLEURY": { N: 13, E: 17, F: 22 },
    "GUYANCOURT": { N: 14, E: 18, F: 23 },
    "HOUILLES": { N: 9, E: 13, F: 17 },
    "JOUY-EN-JOSAS": { N: 12, E: 16, F: 21 },
    "LE CHESNAY": { N: 10, E: 14, F: 18 },
    "LE MESNIL-LE-ROI": { N: 12, E: 16, F: 21 },
    "LE PECQ": { N: 10, E: 14, F: 18 },
    "LE VESINET": { N: 9, E: 13, F: 17 },
    "LES MUREAUX": { N: 18, E: 22, F: 28 },
    "LIMAY": { N: 22, E: 26, F: 32 },
    "LOUVECIENNES": { N: 11, E: 15, F: 19 },
    "MAGNANVILLE": { N: 22, E: 26, F: 32 },
    "MAISONS-LAFFITTE": { N: 10, E: 14, F: 18 },
    "MANTES-LA-JOLIE": { N: 22, E: 26, F: 32 },
    "MANTES-LA-VILLE": { N: 22, E: 26, F: 32 },
    "MARLY-LE-ROI": { N: 11, E: 15, F: 19 },
    "MAUREPAS": { N: 15, E: 18, F: 24 },
    "MEDAN": { N: 14, E: 18, F: 23 },
    "MEULAN": { N: 18, E: 22, F: 28 },
    "MONTESSON": { N: 10, E: 14, F: 18 },
    "MONTIGNY-LE-BRETONNEUX": { N: 14, E: 18, F: 23 },
    "ORGEVAL": { N: 14, E: 18, F: 23 },
    "PLAISIR": { N: 15, E: 18, F: 24 },
    "POISSY": { N: 12, E: 16, F: 21 },
    "RAMBOUILLET": { N: 25, E: 30, F: 38 },
    "ROCQUENCOURT": { N: 10, E: 14, F: 18 },
    "SAINT-CYR-LECOLE": { N: 12, E: 16, F: 21 },
    "SAINT-GERMAIN-EN-LAYE": { N: 11, E: 15, F: 19 },
    "SARTROUVILLE": { N: 9, E: 13, F: 17 },
    "TRAPPES": { N: 15, E: 18, F: 24 },
    "TRIEL-SUR-SEINE": { N: 16, E: 20, F: 25 },
    "VELIZY-VILLACOUBLAY": { N: 12, E: 14, F: 18 },
    "VERNEUIL-SUR-SEINE": { N: 16, E: 20, F: 25 },
    "VERNOUILLET": { N: 16, E: 20, F: 25 },
    "VERSAILLES": { N: 10, E: 14, F: 18 },
    "VIROFLAY": { N: 10, E: 14, F: 18 },
    "VOISINS-LE-BRETONNEUX": { N: 14, E: 18, F: 23 },

    // Essonne (91)
    "ARPAJON": { N: 16, E: 20, F: 26 },
    "ATHIS-MONS": { N: 10, E: 14, F: 18 },
    "BALLAINVILLIERS": { N: 14, E: 18, F: 23 },
    "BRETIGNY-SUR-ORGE": { N: 16, E: 20, F: 26 },
    "BRUNOY": { N: 12, E: 16, F: 21 },
    "CHILLY-MAZARIN": { N: 10, E: 14, F: 18 },
    "CORBEIL-ESSONNES": { N: 16, E: 20, F: 26 },
    "COURCOURONNES": { N: 15, E: 18, F: 25 },
    "DOURDAN": { N: 25, E: 30, F: 38 },
    "DRAVEIL": { N: 12, E: 16, F: 21 },
    "EPINAY-SOUS-SENART": { N: 14, E: 18, F: 23 },
    "EPINAY-SUR-ORGE": { N: 12, E: 16, F: 21 },
    "ETAMPES": { N: 28, E: 33, F: 40 },
    "EVRY-COURCOURONNES": { N: 15, E: 18, F: 25 },
    "FLEURY-MEROGIS": { N: 14, E: 18, F: 23 },
    "GIF-SUR-YVETTE": { N: 16, E: 20, F: 26 },
    "GRIGNY": { N: 14, E: 18, F: 23 },
    "IGNY": { N: 12, E: 16, F: 21 },
    "JUVISY-SUR-ORGE": { N: 10, E: 14, F: 18 },
    "LES ULIS": { N: 12, E: 15, F: 25 },
    "LISSES": { N: 15, E: 18, F: 25 },
    "LONGJUMEAU": { N: 12, E: 16, F: 21 },
    "LONGPONT-SUR-ORGE": { N: 14, E: 18, F: 23 },
    "MARCOUSSIS": { N: 14, E: 18, F: 23 },
    "MASSY": { N: 10, E: 15, F: 20 },
    "MENNECY": { N: 16, E: 20, F: 26 },
    "MILLY-LA-FORET": { N: 28, E: 33, F: 40 },
    "MONTGERON": { N: 12, E: 16, F: 21 },
    "MORANGIS": { N: 10, E: 14, F: 18 },
    "MORSANG-SUR-ORGE": { N: 12, E: 16, F: 21 },
    "ORSAY": { N: 14, E: 18, F: 23 },
    "PALAISEAU": { N: 12, E: 16, F: 21 },
    "PARAY-VIEILLE-POSTE": { N: 10, E: 14, F: 18 },
    "RIS-ORANGIS": { N: 14, E: 18, F: 23 },
    "SACLAY": { N: 14, E: 18, F: 23 },
    "SAINT-GERMAIN-LES-ARPAJON": { N: 16, E: 20, F: 26 },
    "SAINT-MICHEL-SUR-ORGE": { N: 14, E: 18, F: 23 },
    "SAINT-PIERRE-DU-PERRAY": { N: 16, E: 20, F: 26 },
    "SAINTE-GENEVIEVE-DES-BOIS": { N: 14, E: 18, F: 23 },
    "SAVIGNY-SUR-ORGE": { N: 12, E: 16, F: 21 },
    "VERRIERES-LE-BUISSON": { N: 10, E: 14, F: 18 },
    "VERT-LE-GRAND": { N: 18, E: 22, F: 28 },
    "VERT-LE-PETIT": { N: 18, E: 22, F: 28 },
    "VIGNEUX-SUR-SEINE": { N: 12, E: 16, F: 21 },
    "VILLEBON-SUR-YVETTE": { N: 12, E: 16, F: 21 },
    "VIRY-CHATILLON": { N: 12, E: 16, F: 21 },
    "WISSOUS": { N: 10, E: 14, F: 18 },
    "YERRES": { N: 12, E: 16, F: 21 },

    // Seine-et-Marne (77)
    "AVON": { N: 30, E: 35, F: 42 },
    "BRIE-COMTE-ROBERT": { N: 16, E: 20, F: 26 },
    "BUSSY-SAINT-GEORGES": { N: 18, E: 22, F: 28 },
    "CHAMPS-SUR-MARNE": { N: 12, E: 16, F: 21 },
    "CHELLES": { N: 10, E: 15, F: 19 },
    "CHESSY": { N: 18, E: 22, F: 28 },
    "CLAYE-SOUILLY": { N: 14, E: 18, F: 23 },
    "COLLEGIEN": { N: 16, E: 20, F: 25 },
    "COMBS-LA-VILLE": { N: 14, E: 18, F: 23 },
    "COULOMMIERS": { N: 35, E: 40, F: 48 },
    "CROISSY-BEAUBOURG": { N: 16, E: 20, F: 25 },
    "DAMMARIE-LES-LYS": { N: 28, E: 33, F: 40 },
    "EMERAINVILLE": { N: 14, E: 18, F: 23 },
    "FONTAINEBLEAU": { N: 30, E: 35, F: 42 },
    "LAGNY-SUR-MARNE": { N: 16, E: 20, F: 25 },
    "LE MEE-SUR-SEINE": { N: 28, E: 33, F: 40 },
    "LIEUSAINT": { N: 16, E: 20, F: 26 },
    "LOGNES": { N: 14, E: 18, F: 23 },
    "MAGNY-LE-HONGRE": { N: 18, E: 22, F: 28 },
    "MARNE-LA-VALLÃ‰E": { N: 18, E: 22, F: 28 },
    "MEAUX": { N: 30, E: 35, F: 42 },
    "MELUN": { N: 28, E: 33, F: 40 },
    "MITRY-MORY": { N: 14, E: 18, F: 23 },
    "MOISSY-CRAMAYEL": { N: 16, E: 20, F: 26 },
    "MONTEVRAIN": { N: 18, E: 22, F: 28 },
    "NANGIS": { N: 35, E: 40, F: 48 },
    "NEMOURS": { N: 38, E: 44, F: 52 },
    "NOISIEL": { N: 14, E: 18, F: 23 },
    "OZOIR-LA-FERRIERE": { N: 16, E: 20, F: 26 },
    "PONTAULT-COMBAULT": { N: 14, E: 18, F: 23 },
    "PROVINS": { N: 45, E: 52, F: 62 },
    "ROISSY-EN-BRIE": { N: 14, E: 18, F: 23 },
    "SAINT-FARGEAU-PONTHIERRY": { N: 25, E: 30, F: 36 },
    "SAINT-THIBAULT-DES-VIGNES": { N: 16, E: 20, F: 25 },
    "SAVIGNY-LE-TEMPLE": { N: 16, E: 20, F: 26 },
    "SENART": { N: 16, E: 20, F: 26 },
    "SERRIS": { N: 18, E: 22, F: 28 },
    "TORCY": { N: 15, E: 18, F: 24 },
    "TOURNAN-EN-BRIE": { N: 18, E: 22, F: 28 },
    "VAIRES-SUR-MARNE": { N: 12, E: 16, F: 21 },
    "VAUX-LE-PENIL": { N: 28, E: 33, F: 40 },
    "VILLEPARISIS": { N: 12, E: 16, F: 21 }
};

// ============================================================================
// DÃ‰LAIS PAR FORMULE
// ============================================================================

const DELAIS_FORMULES: Record<Formule, string> = {
    STANDARD: '2h Ã  4h',
    EXPRESS: '1h30 Ã  2h',
    FLASH_EXPRESS: '30 min Ã  1h'
};

const LABELS_FORMULES: Record<Formule, string> = {
    STANDARD: 'Standard',
    EXPRESS: 'Express',
    FLASH_EXPRESS: 'Flash Express'
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Normalise un nom de ville pour la recherche dans la base tarifaire
 * - Convertit en majuscules
 * - Supprime les accents
 * - Supprime les espaces multiples
 */
export function normaliserVille(ville: string): string {
    return ville
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .trim()
        .replace(/\s+/g, ' '); // Normalise les espaces
}

/**
 * Recherche une ville dans la base tarifaire
 * Essaie plusieurs variantes pour maximiser les chances de trouver
 */
export function trouverVilleDansBase(villeRecherchee: string): string | null {
    const villeNormalisee = normaliserVille(villeRecherchee);

    // Recherche exacte
    if (BASE_TARIFAIRE[villeNormalisee]) {
        return villeNormalisee;
    }

    // Recherche partielle (la ville recherchÃ©e contient le nom de la base)
    for (const villeBase of Object.keys(BASE_TARIFAIRE)) {
        if (villeNormalisee.includes(villeBase) || villeBase.includes(villeNormalisee)) {
            return villeBase;
        }
    }

    return null;
}

// ============================================================================
// FONCTION PRINCIPALE DE CALCUL
// ============================================================================

