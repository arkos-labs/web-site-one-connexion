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
// TYPES ET INTERFACES (LES TYPES SONT DEFINIS PLUS BAS AVEC LES MISES À JOUR)
// ============================================================================
// CONSTANTES (EN CENTIMES POUR ÉVITER LES ERREURS DE FLOTTANTS)
// ============================================================================

/**
 * Prix unitaire d'un bon en CENTIMES (5.5€ = 550 cents)
 */
export const DEFAULT_PRIX_BON_CENTS = 550;

/**
 * Tarif du supplément kilométrique en BONS par km
 */
export const DEFAULT_SUPPLEMENT_PAR_KM_BONS = 0.1;

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

/**
 * Les 5 formules disponibles
 */
export type FormuleNew = 'NORMAL' | 'EXPRESS' | 'URGENCE' | 'VL_NORMAL' | 'VL_EXPRESS';

/**
 * Structure des tarifs de prise en charge pour une ville (en BONS)
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
    bonValueCents: number;
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
    supplement: number;          // En bons
    totalBons: number;
    totalEuros: number;

    // Métadonnées
    isParisDansTrajet: boolean;  // true si Paris est départ OU arrivée
    supplementApplique: boolean; // true si supplément kilométrique appliqué
}

// ============================================================================
// LOGIQUE DE CALCUL (CENTIMES)
// ============================================================================

/**
 * Logique de calcul interne en centimes pour éviter les erreurs d'arrondi JS
 */
export function calculatePriceInternal(
    priseEnChargeBons: number,
    distanceKm: number,
    isParisDansTrajet: boolean,
    config: PricingConfig
) {
    // 1. Déterminer si on applique le supplément
    const supplementApplique = !isParisDansTrajet;

    // 2. Calcul du supplément en BONS (peut être un float temporairement)
    const supplementBons = supplementApplique ? distanceKm * config.supplementPerKmBons : 0;
    const totalBons = priseEnChargeBons + supplementBons;

    // 3. Calcul en CENTIMES (Conversion finale en entier)
    // On multiplie les BONS par la valeur en centimes et on arrondit
    const priseEnChargeCents = Math.round(priseEnChargeBons * config.bonValueCents);
    const supplementCents = Math.round(supplementBons * config.bonValueCents);
    const totalCents = priseEnChargeCents + supplementCents;

    // 4. Conversion finale en EUROS (division par 100 au tout dernier moment)
    const totalEuros = totalCents / 100;

    return {
        priseEnCharge: priseEnChargeBons,
        supplement: supplementBons,
        totalBons: totalBons,
        totalEuros: totalEuros,
        supplementApplique
    };
}

// ============================================================================
// UTILITAIRES DE VILLE
// ============================================================================

/**
 * Normalise un nom de ville pour la recherche
 */
export function normaliserVille(ville: string): string {
    return ville
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/'/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Vérifie si une ville est Paris
 */
export function estParis(ville: string): boolean {
    const villeNormalisee = normaliserVille(ville);
    return villeNormalisee === 'PARIS' || villeNormalisee.startsWith('PARIS-');
}

export default {
    normaliserVille,
    estParis,
    calculatePriceInternal,
    DEFAULT_PRIX_BON_CENTS,
    DEFAULT_SUPPLEMENT_PAR_KM_BONS
};

