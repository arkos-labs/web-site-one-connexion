/**
 * ONE CONNEXION - MOTEUR TARIFAIRE
 * =========================================
 * 
 * LOGIQUE TARIFAIRE :
 * 
 * 1. PRISE EN CHARGE (OBLIGATOIRE ET FIXE)
 *    - Chaque ville possède 5 tarifs de prise en charge
 *    - Dépend UNIQUEMENT de la ville de départ et de la formule
 *    - Toujours facturée (Paris→Ville, Ville→Paris, Ville→Ville, etc.)
 *    - Le trajet chauffeur vide n'est JAMAIS facturé
 * 
 * 2. SUPPLÉMENT KILOMÉTRIQUE (SEULEMENT SI BANLIEUE → BANLIEUE)
 *    - Ajouté UNIQUEMENT si ville_départ ≠ Paris ET ville_arrivée ≠ Paris
 *    - Formule : supplément = distance_km × 0.1 bon
 *    - Distance obtenue via LocationIQ Distance Matrix (valeur exacte en mètres)
 * 
 * 3. CALCUL FINAL
 *    - total_bons = prise_en_charge + supplément
 *    - total_euros = total_bons × 5.5
 * 
 * @version 1.0
 * @date 2025-12-04
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

/**
 * Les 5 formules disponibles
 */
export type FormuleNew = 'NORMAL' | 'EXPRESS' | 'URGENCE' | 'VL_NORMAL' | 'VL_EXPRESS';

/**
 * Structure des tarifs de prise en charge pour une ville
 */
export interface PriseEnChargeVille {
    NORMAL: number;      // Prise en charge en bons
    EXPRESS: number;
    URGENCE: number;
    VL_NORMAL: number;
    VL_EXPRESS: number;
}

/**
 * Configuration dynamique du moteur de pricing
 */
export interface PricingConfig {
    bonValueEur: number;
    supplementPerKmBons: number;
}

/**
 * Résultat du calcul tarifaire
 */
export interface CalculTarifaireResult {
    // Données d'entrée
    villeDepart: string;
    villeArrivee: string;
    formule: FormuleNew;

    // Distance
    distanceKm: number;

    // Calcul détaillé
    priseEnCharge: number;      // En bons
    supplement: number;          // En bons (0 si Paris impliqué)
    totalBons: number;
    totalEuros: number;

    // Métadonnées
    isParisDansTrajet: boolean;  // true si Paris est départ OU arrivée
    supplementApplique: boolean; // true si supplément kilométrique appliqué
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Prix unitaire d'un bon (DÉFAUT)
 * Peut être surchargé via PricingConfig
 */
export const DEFAULT_PRIX_BON = 5.5;

/**
 * Tarif du supplément kilométrique (en bons par km) (DÉFAUT)
 * Appliqué uniquement pour banlieue → banlieue
 * Peut être surchargé via PricingConfig
 */
export const DEFAULT_SUPPLEMENT_PAR_KM = 0.1;

// ============================================================================
// BASE TARIFAIRE - PRISES EN CHARGE PAR VILLE
// ============================================================================

/**
 * Tarifs de prise en charge pour chaque ville d'Île-de-France
 * 
 * IMPORTANT : Ces tarifs représentent la PRISE EN CHARGE uniquement,
 * pas le prix total de la course.
 * 
 * Format : { VILLE: { NORMAL, EXPRESS, URGENCE, VL_NORMAL, VL_EXPRESS } }
 * Tous les montants sont en BONS (à multiplier par 5.5€)
 */
export const PRISES_EN_CHARGE: Record<string, PriseEnChargeVille> = {
    // ============================================================================
    // PARIS (75)
    // ============================================================================
    "PARIS": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-01": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-02": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-03": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-04": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-05": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-06": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-07": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-08": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-09": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-10": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-11": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-12": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-13": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-14": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-15": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-16": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-17": { NORMAL: 2, EXPRESS: 4, URGENCE: 7, VL_NORMAL: 7, VL_EXPRESS: 14 },
    "PARIS-18": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-19": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },
    "PARIS-20": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 18 },

    // ============================================================================
    // SEINE-ET-MARNE (77)
    // ============================================================================
    "MELUN": { NORMAL: 24, EXPRESS: 27, URGENCE: 30, VL_NORMAL: 28, VL_EXPRESS: 31 },
    "COLLEGIEN": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "MEAUX": { NORMAL: 20, EXPRESS: 23, URGENCE: 26, VL_NORMAL: 24, VL_EXPRESS: 27 },
    "BRIE-COMTE-ROBERT": { NORMAL: 20, EXPRESS: 25, URGENCE: 30, VL_NORMAL: 25, VL_EXPRESS: 30 },
    "NOISIEL": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "DAMMARIE-LES-LYS": { NORMAL: 22, EXPRESS: 25, URGENCE: 28, VL_NORMAL: 26, VL_EXPRESS: 29 },
    "TORCY": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "MITRY-MORY": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },
    "FONTAINEBLEAU": { NORMAL: 30, EXPRESS: 33, URGENCE: 36, VL_NORMAL: 34, VL_EXPRESS: 37 },
    "LE-MEE-SUR-SEINE": { NORMAL: 23, EXPRESS: 26, URGENCE: 29, VL_NORMAL: 27, VL_EXPRESS: 30 },
    "LAGNY-SUR-MARNE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "CHAMPS-SUR-MARNE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MARNE-LA-VALLEE": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "CHELLES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BUSSY-SAINT-GEORGES": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "SERRIS": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },
    "MONTEREAU-FAULT-YONNE": { NORMAL: 25, EXPRESS: 28, URGENCE: 31, VL_NORMAL: 29, VL_EXPRESS: 32 },

    // ============================================================================
    // YVELINES (78)
    // ============================================================================
    "VERSAILLES": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "LES-MUREAUX": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "LE-CHESNAY": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LA-CELLE-SAINT-CLOUD": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "SAINT-QUENTIN-EN-YVELINES": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "TRAPPES": { NORMAL: 16, EXPRESS: 19, URGENCE: 22, VL_NORMAL: 20, VL_EXPRESS: 23 },
    "MANTES-LA-JOLIE": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "POISSY": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "PLAISIR": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "BOUGIVAL": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "CHATOU": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "LOUVECIENNES": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "SARTROUVILLE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "BUC": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MAISONS-LAFFITTE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "VOISINS-LE-BRETONNEUX": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },

    // ============================================================================
    // ESSONNE (91)
    // ============================================================================
    "EVRY": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "BONDOUFLE": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },
    "COURCOURONNES": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "CORBEIL-ESSONNES": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },
    "LONGJUMEAU": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "VIRY-CHATILLON": { NORMAL: 10, EXPRESS: 3, URGENCE: 6, VL_NORMAL: 14, VL_EXPRESS: 5 },
    "GIF-SUR-YVETTE": { NORMAL: 6, EXPRESS: 8, URGENCE: 6, VL_NORMAL: 10, VL_EXPRESS: 6 },
    "ATHIS-MONS": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "JUVISY": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MASSY": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "CHILLY-MAZARIN": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "ORSAY": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "MORANGIS": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "SAVIGNY-SUR-ORGE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "BRUNOY": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "FLEURY-MEROGIS": { NORMAL: 9, EXPRESS: 3, URGENCE: 10, VL_NORMAL: 4, VL_EXPRESS: 6 },
    "LES-ULIS": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },

    // ============================================================================
    // HAUTS-DE-SEINE (92)
    // ============================================================================
    "NANTERRE": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "BOULOGNE-BILLANCOURT": { NORMAL: 2, EXPRESS: 4, URGENCE: 6, VL_NORMAL: 6, VL_EXPRESS: 9 },
    "NEUILLY-SUR-SEINE": { NORMAL: 2, EXPRESS: 4, URGENCE: 6, VL_NORMAL: 6, VL_EXPRESS: 9 },
    "LEVALLOIS-PERRET": { NORMAL: 2, EXPRESS: 4, URGENCE: 6, VL_NORMAL: 6, VL_EXPRESS: 9 },
    "COURBEVOIE": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "RUEIL-MALMAISON": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "ASNIERES-SUR-SEINE": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "COLOMBES": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "PUTEAUX": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "BAGNEUX": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "FONTENAY-AUX-ROSES": { NORMAL: 6, EXPRESS: 7, URGENCE: 5, VL_NORMAL: 3, VL_EXPRESS: 8 },
    "CHATENAY-MALABRY": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "CHATILLON": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "LE-PLESSIS-ROBINSON": { NORMAL: 8, EXPRESS: 7, URGENCE: 8, VL_NORMAL: 5, VL_EXPRESS: 7 },
    "CHAVILLE": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "MARNES-LA-COQUETTE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "CLICHY": { NORMAL: 2, EXPRESS: 4, URGENCE: 6, VL_NORMAL: 6, VL_EXPRESS: 9 },
    "VILLE-D-AVRAY": { NORMAL: 5, EXPRESS: 7, URGENCE: 8, VL_NORMAL: 7, VL_EXPRESS: 9 },
    "SEVRES": { NORMAL: 7, EXPRESS: 8, URGENCE: 9, VL_NORMAL: 8, VL_EXPRESS: 9 },
    "GARCHES": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "ISSY-LES-MOULINEAUX": { NORMAL: 4, EXPRESS: 6, URGENCE: 8, VL_NORMAL: 7, VL_EXPRESS: 9 },
    "CLAMART": { NORMAL: 4, EXPRESS: 6, URGENCE: 8, VL_NORMAL: 7, VL_EXPRESS: 9 },
    "VANVES": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "MEUDON": { NORMAL: 5, EXPRESS: 7, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 9 },
    "LA-GARENNE-COLOMBES": { NORMAL: 4, EXPRESS: 6, URGENCE: 8, VL_NORMAL: 7, VL_EXPRESS: 9 },
    "BOIS-COLOMBES": { NORMAL: 4, EXPRESS: 6, URGENCE: 8, VL_NORMAL: 7, VL_EXPRESS: 9 },

    // ============================================================================
    // SEINE-SAINT-DENIS (93)
    // ============================================================================
    "BOBIGNY": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "MONTREUIL": { NORMAL: 4, EXPRESS: 7, URGENCE: 11, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "SAINT-DENIS": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "AUBERVILLIERS": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "SAINT-OUEN": { NORMAL: 3, EXPRESS: 6, URGENCE: 9, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "PANTIN": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 7, VL_EXPRESS: 10 },
    "AULNAY-SOUS-BOIS": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "DRANCY": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "EPINAY-SUR-SEINE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LA-COURNEUVE": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "LE-BLANC-MESNIL": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LIVRY-GARGAN": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "GAGNY": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "ROMAINVILLE": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "STAINS": { NORMAL: 4, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "VILLEMOMBLE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LES-LILAS": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "LE-PRE-SAINT-GERVAIS": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "LES-PAVILLONS-SOUS-BOIS": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "NEUILLY-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LE-RAINCY": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "LE-BOURGET": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "NEUILLY-PLAISANCE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "MONTFERMEIL": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "PIERREFITTE-SUR-SEINE": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "CLICHY-SOUS-BOIS": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "VAUJOURS": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "VILLEPINTE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "VILLETANEUSE": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "DUGNY": { NORMAL: 6, EXPRESS: 9, URGENCE: 12, VL_NORMAL: 10, VL_EXPRESS: 13 },
    "L-ILE-SAINT-DENIS": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "GOURNAY-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "COUBRON": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },

    // ============================================================================
    // VAL-DE-MARNE (94)
    // ============================================================================
    "CRETEIL": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "SAINT-MAUR-DES-FOSSES": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "ARCUEIL": { NORMAL: 6, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "FONTENAY-SOUS-BOIS": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "NOGENT-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "ALFORTVILLE": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "RUNGIS": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "SAINT-MANDE": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "IVRY-SUR-SEINE": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "CHARENTON-LE-PONT": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "CACHAN": { NORMAL: 6, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "L-HAY-LES-ROSES": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "GENTILLY": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "FRESNES": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "LE-KREMLIN-BICETRE": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "VILLENEUVE-LE-ROI": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "VINCENNES": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "ORLY": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "THIAIS": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "JOINVILLE-LE-PONT": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "VILLIERS-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "VITRY-SUR-SEINE": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "SAINT-MAURICE": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "LE-PLESSIS-TREVISE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "CHENNEVIERES-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "MAROLLES-EN-BRIE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "LIMEIL-BREVANNES": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "VALENTON": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "BOISSY-SAINT-LEGER": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "ORMESSON-SUR-MARNE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "CHAMPIGNY-SUR-MARNE": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "LA-QUEUE-EN-BRIE": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "MANDRES-LES-ROSES": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "CHEVILLY-LARUE": { NORMAL: 6, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "CHOISY-LE-ROI": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "MAISONS-ALFORT": { NORMAL: 5, EXPRESS: 8, URGENCE: 11, VL_NORMAL: 9, VL_EXPRESS: 12 },
    "VILLEJUIF": { NORMAL: 4, EXPRESS: 7, URGENCE: 10, VL_NORMAL: 8, VL_EXPRESS: 11 },
    "NOISEAU": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },

    // ============================================================================
    // VAL-D'OISE (95)
    // ============================================================================
    "CERGY-PONTOISE": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "ARGENTEUIL": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "ERMONT": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "FRANCONVILLE": { NORMAL: 6, EXPRESS: 7, URGENCE: 6, VL_NORMAL: 10, VL_EXPRESS: 6 },
    "GARGES-LES-GONESSE": { NORMAL: 6, EXPRESS: 8, URGENCE: 6, VL_NORMAL: 10, VL_EXPRESS: 6 },
    "TAVERNY": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MONTMORENCY": { NORMAL: 6, EXPRESS: 7, URGENCE: 6, VL_NORMAL: 10, VL_EXPRESS: 6 },
    "DEUIL-LA-BARRE": { NORMAL: 9, EXPRESS: 3, URGENCE: 10, VL_NORMAL: 4, VL_EXPRESS: 6 },
    "GOUSSAINVILLE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "SARCELLES": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "SAINT-GRATIEN": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "HERBLAY": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "SOISY-SOUS-MONTMORENCY": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "CORMEILLES-EN-PARISIS": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "BEAUCHAMP": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MONTMAGNY": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "VIARMES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "JOUY-LE-MOUTIER": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "L-ISLE-ADAM": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "PONTOISE": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "SAINT-OUEN-L-AUMONE": { NORMAL: 14, EXPRESS: 17, URGENCE: 20, VL_NORMAL: 18, VL_EXPRESS: 21 },
    "SAINT-PRIX": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "DOMONT": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "PERSAN": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "SAINT-BRICE-SOUS-FORET": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "MONTIGNY-LES-CORMEILLES": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "LOUVRES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "VILLIERS-LE-BEL": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "GROSLAY": { NORMAL: 6, EXPRESS: 10, URGENCE: 6, VL_NORMAL: 10, VL_EXPRESS: 6 },
    "MAGNY-EN-VEXIN": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "AUVERS-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "ECOUEN": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "US": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "EZANVILLE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "FOSSES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "PIERRELAYE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "VAUDHERLAND": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "GONESSE": { NORMAL: 10, EXPRESS: 13, URGENCE: 16, VL_NORMAL: 14, VL_EXPRESS: 17 },
    "VEMARS": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "OSNY": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "LA-FRETTE-SUR-SEINE": { NORMAL: 8, EXPRESS: 11, URGENCE: 14, VL_NORMAL: 12, VL_EXPRESS: 15 },
    "MERY-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BESSANCOURT": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BAILLET-EN-FRANCE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "ATTAINVILLE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "ANDILLY": { NORMAL: 7, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 11, VL_EXPRESS: 14 },
    "PRESLES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "EAUBONNE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "ERAGNY": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "PARMAIN": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "MERIEL": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "MARLY-LA-VILLE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BOISSY-L-AILLERIE": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "CHAMPAGNE-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "MONTLOUIS": { NORMAL: 13, EXPRESS: 16, URGENCE: 19, VL_NORMAL: 17, VL_EXPRESS: 20 },
    "LABBEVILLE": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "ROISSY-EN-FRANCE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BRAY-ET-LU": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "LE-PLESSIS-LUZARCHES": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "ENGHIEN-LES-BAINS": { NORMAL: 9, EXPRESS: 12, URGENCE: 15, VL_NORMAL: 13, VL_EXPRESS: 16 },
    "FREPILLON": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "CHARS": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "VALMONDOIS": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "SAINT-CLAIR-SUR-EPTE": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "CHERSY": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "MOUSSY-LE-NEUF": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "CERGY": { NORMAL: 15, EXPRESS: 18, URGENCE: 21, VL_NORMAL: 19, VL_EXPRESS: 22 },
    "EPERNAY-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BRUYERES-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "CORMEILLES-EN-VEXIN": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "VALLANGOUJARD": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "MAREIL-SUR-OURCQ": { NORMAL: 17, EXPRESS: 20, URGENCE: 23, VL_NORMAL: 21, VL_EXPRESS: 24 },
    "BEAUMONT-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
    "BERNES-SUR-OISE": { NORMAL: 12, EXPRESS: 15, URGENCE: 18, VL_NORMAL: 16, VL_EXPRESS: 19 },
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Normalise un nom de ville pour la recherche
 * - Convertit en majuscules
 * - Supprime les accents
 * - Supprime les espaces multiples
 */
export function normaliserVille(ville: string): string {
    return ville
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/'/g, '-') // Remplace les apostrophes par des tirets (ex: L'HAY -> L-HAY)
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/-+/g, '-') // Évite les doubles tirets
        .trim();
}

/**
 * Vérifie si une ville est Paris
 */
export function estParis(ville: string): boolean {
    const villeNormalisee = normaliserVille(ville);
    return villeNormalisee === 'PARIS' || villeNormalisee.startsWith('PARIS-');
}

/**
 * Recherche une ville dans la base de prises en charge
 * Retourne le nom normalisé de la ville si trouvée, null sinon
 */
export function trouverVilleDansBase(villeRecherchee: string): string | null {
    const villeNormalisee = normaliserVille(villeRecherchee);

    // Recherche exacte
    if (PRISES_EN_CHARGE[villeNormalisee]) {
        return villeNormalisee;
    }

    // Recherche partielle
    for (const villeBase of Object.keys(PRISES_EN_CHARGE)) {
        if (villeNormalisee.includes(villeBase) || villeBase.includes(villeNormalisee)) {
            return villeBase;
        }
    }

    return null;
}

/**
 * Récupère la prise en charge pour une ville et une formule
 * @throws Error si la ville n'est pas trouvée
 */
export function getPriseEnCharge(ville: string, formule: FormuleNew): number {
    const villeTrouvee = trouverVilleDansBase(ville);

    if (!villeTrouvee) {
        throw new Error(`Ville non trouvée dans la base tarifaire : ${ville}`);
    }

    const tarifs = PRISES_EN_CHARGE[villeTrouvee];
    return tarifs[formule];
}

// ============================================================================
// FONCTION PRINCIPALE DE CALCUL
// ============================================================================

/**
 * Calcule le prix d'une course selon la logique tarifaire One Connexion
 * 
 * LOGIQUE COMPLÈTE :
 * 
 * 1️⃣ RÈGLE UNIVERSELLE : Base = plus grand nombre de bons
 *    - Récupérer les bons de la ville de départ
 *    - Récupérer les bons de la ville d'arrivée
 *    - Choisir toujours la valeur la plus élevée (MAX)
 *    - Prix prise en charge = bons_max × 5,50 €
 * 
 * 2️⃣ RÈGLE SPÉCIALE : BANLIEUE ↔ BANLIEUE
 *    Si AUCUNE des deux villes n'est Paris :
 *    - Appliquer un supplément kilométrique
 *    - Supplément = distance_km × 0,1 bon
 *    - Montant = supplément × 5,50 €
 * 
 * 3️⃣ RÈGLE SPÉCIALE : PARIS impliqué
 *    Si Paris est départ OU arrivée :
 *    - PAS de supplément kilométrique
 *    - Uniquement le MAX des bons
 * 
 * @param villeDepart - Nom de la ville de départ
 * @param villeArrivee - Nom de la ville d'arrivée
 * @param distanceMeters - Distance en mètres (obtenue via LocationIQ)
 * @param formule - Formule choisie (NORMAL, EXPRESS, URGENCE, VL_NORMAL, VL_EXPRESS)
 * @returns Résultat détaillé du calcul de prix
 * @throws Error si une ville n'est pas dans la base tarifaire
 */
export function calculateOneConnexionPrice(
    villeDepart: string,
    villeArrivee: string,
    distanceMeters: number,
    formule: FormuleNew = 'NORMAL',
    config?: PricingConfig
): CalculTarifaireResult {
    // 1. Normaliser les villes
    const villeDepartNormalisee = trouverVilleDansBase(villeDepart);
    const villeArriveeNormalisee = trouverVilleDansBase(villeArrivee);

    if (!villeDepartNormalisee) {
        throw new Error(`Ville de départ non trouvée : ${villeDepart}`);
    }

    if (!villeArriveeNormalisee) {
        throw new Error(`Ville d'arrivée non trouvée : ${villeArrivee}`);
    }

    // 2. Convertir la distance en km
    const distanceKm = distanceMeters / 1000;

    // 3. Récupérer les tarifs des deux villes
    const tarifDepart = getPriseEnCharge(villeDepartNormalisee, formule);
    const tarifArrivee = getPriseEnCharge(villeArriveeNormalisee, formule);

    // 4. ✅ RÈGLE UNIVERSELLE : Prendre le MAX
    const priseEnCharge = Math.max(tarifDepart, tarifArrivee);

    // 5. Déterminer si Paris est impliqué
    const departEstParis = estParis(villeDepartNormalisee);
    const arriveeEstParis = estParis(villeArriveeNormalisee);
    const isParisDansTrajet = departEstParis || arriveeEstParis;

    // 6. Récupérer la configuration (ou utiliser les valeurs par défaut)
    const bonValue = config?.bonValueEur ?? DEFAULT_PRIX_BON;
    const supplementPerKm = config?.supplementPerKmBons ?? DEFAULT_SUPPLEMENT_PAR_KM;

    // 7. Calculer le supplément kilométrique
    let supplement = 0;
    let supplementApplique = false;

    // ✅ RÈGLE SPÉCIALE : Supplément UNIQUEMENT si banlieue ↔ banlieue
    // (ni départ ni arrivée n'est Paris)
    if (!departEstParis && !arriveeEstParis) {
        supplement = distanceKm * supplementPerKm;
        supplementApplique = true;
    }

    // 8. Calculer le total
    const totalBons = priseEnCharge + supplement;
    const totalEuros = totalBons * bonValue;

    // 9. Retourner le résultat détaillé
    return {
        villeDepart: villeDepartNormalisee,
        villeArrivee: villeArriveeNormalisee,
        formule,
        distanceKm: parseFloat(distanceKm.toFixed(3)),
        priseEnCharge: parseFloat(priseEnCharge.toFixed(3)),
        supplement: parseFloat(supplement.toFixed(3)),
        totalBons: parseFloat(totalBons.toFixed(3)),
        totalEuros: parseFloat(totalEuros.toFixed(2)),
        isParisDansTrajet,
        supplementApplique
    };
}

/**
 * Calcule les prix pour toutes les formules en une seule fois
 * Utile pour afficher une comparaison au client
 */
export function calculerToutesLesFormules(
    villeDepart: string,
    villeArrivee: string,
    distanceMeters: number,
    config?: PricingConfig
): Record<FormuleNew, CalculTarifaireResult> {
    const formules: FormuleNew[] = ['NORMAL', 'EXPRESS', 'URGENCE', 'VL_NORMAL', 'VL_EXPRESS'];

    const resultats: Partial<Record<FormuleNew, CalculTarifaireResult>> = {};

    for (const formule of formules) {
        resultats[formule] = calculateOneConnexionPrice(
            villeDepart,
            villeArrivee,
            distanceMeters,
            formule,
            config
        );
    }

    return resultats as Record<FormuleNew, CalculTarifaireResult>;
}

/**
 * Formate un résultat de pricing pour l'affichage
 */
export function formaterResultat(result: CalculTarifaireResult): string {
    const lignes = [
        '╔════════════════════════════════════════════════════════════╗',
        `║  ONE CONNEXION - ${result.formule}`,
        '╠════════════════════════════════════════════════════════════╣',
        `║  Départ : ${result.villeDepart}`,
        `║  Arrivée : ${result.villeArrivee}`,
        `║  Distance : ${result.distanceKm} km`,
        '║  ',
        '║  ✅ RÈGLE UNIVERSELLE : MAX des deux villes',
        `║  • Prise en charge : ${result.priseEnCharge} bons (le plus élevé)`,
    ];

    if (result.supplementApplique) {
        lignes.push(
            `║  • Supplément kilométrique : +${result.supplement.toFixed(2)} bons`,
            `║    (${result.distanceKm} km × 0.1 bon/km - Banlieue ↔ Banlieue)`
        );
    } else {
        lignes.push(
            '║  • Supplément kilométrique : 0 bon',
            '║    (Paris impliqué dans le trajet)'
        );
    }

    lignes.push(
        '║  ',
        `║  TOTAL : ${result.totalBons.toFixed(2)} bons = ${result.totalEuros}€`,
        '╚════════════════════════════════════════════════════════════╝'
    );

    return lignes.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    calculateOneConnexionPrice,
    calculerToutesLesFormules,
    getPriseEnCharge,
    trouverVilleDansBase,
    normaliserVille,
    estParis,
    formaterResultat,
    PRISES_EN_CHARGE,
    DEFAULT_PRIX_BON,
    DEFAULT_SUPPLEMENT_PAR_KM
};
