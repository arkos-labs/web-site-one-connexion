/**
 * ONE CONNEXION - MOTEUR TARIFAIRE (VERSION SUPABASE)
 * =========================================
 * 
 * Ce fichier contient les fonctions asynchrones pour récupérer les tarifs
 * depuis la base de données Supabase au lieu de l'objet en dur.
 * 
 * @version 2.0
 * @date 2025-12-19
 */

import { supabase } from '../lib/supabase';
import {
    type FormuleNew,
    type PricingConfig,
    calculatePriceInternal,
    normaliserVille,
    DEFAULT_PRIX_BON_CENTS,
    DEFAULT_SUPPLEMENT_PAR_KM_BONS
} from './pricingEngine';
import { findCityByZipAndName } from '@/data/tarifs_idf';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Structure de la table city_pricing dans Supabase
 */
export interface CityPricingRow {
    id: string;
    city_name: string;
    zip_code: string | null;
    price_normal: number;
    price_express: number;
    price_urgence: number;
    price_vl_normal: number;
    price_vl_express: number;
    created_at: string;
    updated_at: string;
}

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
 * Cache en mémoire pour éviter trop de requêtes à Supabase
 * Clé : nom de ville normalisé
 * Valeur : tarifs de prise en charge
 */
const cityPricingCache = new Map<string, PriseEnChargeVille>();

/**
 * Durée de vie du cache (en millisecondes)
 * Par défaut : 1 heure
 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Timestamp de la dernière mise à jour du cache
 */
let lastCacheUpdate = 0;

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Vérifie si une ville est Paris
 */
export function estParis(ville: string): boolean {
    const villeNormalisee = normaliserVille(ville);
    return villeNormalisee === 'PARIS' || villeNormalisee.startsWith('PARIS-');
}

// La fonction normaliserVille est maintenant importée depuis pricingEngine.ts

/**
 * Convertit une ligne de la base de données en objet PriseEnChargeVille
 */
function rowToPriseEnCharge(row: CityPricingRow): PriseEnChargeVille {
    return {
        NORMAL: row.price_normal,
        EXPRESS: row.price_express,
        URGENCE: row.price_urgence,
        VL_NORMAL: row.price_vl_normal,
        VL_EXPRESS: row.price_vl_express,
    };
}

/**
 * Vérifie si le cache doit être rafraîchi
 */
function shouldRefreshCache(): boolean {
    const now = Date.now();
    return now - lastCacheUpdate > CACHE_TTL;
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Recherche une ville dans la base locale (tarifs_idf.ts)
 * 
 * NOTE: Modifié pour utiliser le fichier local mis à jour par le client.
 * La base Supabase sera synchronisée plus tard.
 * 
 * @param villeRecherchee - Nom de la ville à rechercher
 * @returns Tarifs de prise en charge ou null
 */
export async function trouverVilleDansBase(villeRecherchee: string): Promise<PriseEnChargeVille | null> {
    const villeNormalisee = normaliserVille(villeRecherchee);

    // 1. Recherche dans le fichier local (SOURCE DE VÉRITÉ ACTUELLE)
    // Utilisation de la nouvelle fonction robuste (supporte flou et variations)
    const tarifTrouve = findCityByZipAndName(villeRecherchee);

    if (tarifTrouve) {
        console.log(`[Source Locale] Ville trouvée : ${tarifTrouve.ville}`);
        return {
            NORMAL: tarifTrouve.formules.NORMAL,
            EXPRESS: tarifTrouve.formules.EXPRESS,
            URGENCE: tarifTrouve.formules.URGENCE,
            VL_NORMAL: tarifTrouve.formules.VL_NORMAL,
            VL_EXPRESS: tarifTrouve.formules.VL_EXPRESS
        };
    }

    // Fallback Supabase (si non trouvé en local)
    try {
        console.log(`[PricingDb] Recherche Supabase pour : ${villeRecherchee}`);

        // 1. Essai avec le nom normalisé (qui garde les ESPACES maintenant)
        let result = await supabase
            .from('city_pricing')
            .select('*')
            .ilike('city_name', villeNormalisee)
            .maybeSingle();

        // 2. Si non trouvé, essai avec le nom brut original
        if (!result.data && !result.error) {
            console.log(`[PricingDb] Essai nom brut pour : ${villeRecherchee}`);
            result = await supabase
                .from('city_pricing')
                .select('*')
                .ilike('city_name', villeRecherchee)
                .maybeSingle();
        }

        // 3. TROISIÈME ESSAI : Remplacer les tirets par des espaces (pour les villes comme "Combs-la-Ville" stockées "Combs la Ville")
        if (!result.data && !result.error) {
            const villeAvecEspaces = villeNormalisee.replace(/-/g, ' ');
            console.log(`[PricingDb] Essai avec espaces pour : ${villeAvecEspaces}`);
            result = await supabase
                .from('city_pricing')
                .select('*')
                .ilike('city_name', villeAvecEspaces)
                .maybeSingle();
        }

        const { data, error } = result;

        if (error) {
            // On log warning que si on a vraiment rien trouvé et qu'il y avait une erreur
            if (!data) console.warn(`[Supabase Warning] Erreur ou non-trouvé pour ${villeRecherchee}`, error);
        }

        if (data) {
            console.log(`[Supabase Hit] Ville trouvée : ${data.city_name}`);
            const tarifs = rowToPriseEnCharge(data);

            // Mise en cache
            cityPricingCache.set(data.city_name, tarifs);
            cityPricingCache.set(villeNormalisee, tarifs);

            return tarifs;
        }
    } catch (err) {
        console.error("Error fetching city pricing from Supabase", err);
    }

    console.warn(`[Local & Remote Miss] Ville non trouvée nulle part : ${villeRecherchee}`);
    return null;
}

/**
 * Récupère la prise en charge pour une ville et une formule (VERSION ASYNCHRONE)
 * 
 * @param ville - Nom de la ville
 * @param formule - Formule tarifaire
 * @returns Montant de la prise en charge en bons
 * @throws Error si la ville n'est pas trouvée
 */
export async function getPriseEnCharge(ville: string, formule: FormuleNew): Promise<number> {
    const tarifs = await trouverVilleDansBase(ville);

    if (!tarifs) {
        throw new Error(`Ville non trouvée dans la base tarifaire : ${ville}`);
    }

    return tarifs[formule];
}

/**
 * Précharge toutes les villes dans le cache au démarrage de l'application
 * Recommandé pour améliorer les performances
 */
export async function preloadCityPricingCache(): Promise<void> {
    console.log('[Cache] Préchargement de toutes les villes...');

    try {
        const { data, error } = await supabase
            .from('city_pricing')
            .select('*');

        if (error) {
            console.error('[Erreur] Impossible de précharger le cache des villes', error);
            return;
        }

        if (!data || data.length === 0) {
            console.warn('[Avertissement] Aucune ville trouvée dans la base de données');
            return;
        }

        // Mettre toutes les villes en cache
        data.forEach((row: CityPricingRow) => {
            const tarifs = rowToPriseEnCharge(row);
            cityPricingCache.set(row.city_name, tarifs);
        });

        lastCacheUpdate = Date.now();
        console.log(`[Cache] ${data.length} villes préchargées avec succès`);

    } catch (err) {
        console.error('[Erreur critique] Échec du préchargement du cache', err);
    }
}

/**
 * Vide le cache (utile pour forcer un rafraîchissement)
 */
export function clearCityPricingCache(): void {
    cityPricingCache.clear();
    lastCacheUpdate = 0;
    console.log('[Cache] Cache vidé');
}

/**
 * Récupère toutes les villes disponibles
 * Utile pour les autocomplétions ou les listes déroulantes
 */
export async function getAllCities(): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('city_pricing')
            .select('city_name')
            .order('city_name', { ascending: true });

        if (error) {
            console.error('[Erreur] Impossible de récupérer la liste des villes', error);
            return [];
        }

        return data.map((row: { city_name: string }) => row.city_name);

    } catch (err) {
        console.error('[Erreur critique] Échec de la récupération des villes', err);
        return [];
    }
}

/**
 * Recherche des villes par préfixe (pour l'autocomplétion)
 * 
 * @param prefix - Préfixe de recherche
 * @param limit - Nombre maximum de résultats (défaut: 10)
 * @returns Liste des villes correspondantes
 */
export async function searchCitiesByPrefix(prefix: string, limit: number = 10): Promise<string[]> {
    const normalizedPrefix = normaliserVille(prefix);

    try {
        const { data, error } = await supabase
            .from('city_pricing')
            .select('city_name')
            .ilike('city_name', `${normalizedPrefix}%`)
            .order('city_name', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('[Erreur] Impossible de rechercher les villes', error);
            return [];
        }

        return data.map((row: { city_name: string }) => row.city_name);

    } catch (err) {
        console.error('[Erreur critique] Échec de la recherche de villes', err);
        return [];
    }
}

// ============================================================================
// FONCTION PRINCIPALE DE CALCUL (VERSION ASYNCHRONE)
// ============================================================================

/**
 * Calcule le prix d'une course selon la logique tarifaire One Connexion (VERSION ASYNCHRONE)
 * 
 * Cette fonction récupère les tarifs depuis Supabase au lieu d'utiliser l'objet en dur.
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
 * @param config - Configuration optionnelle (prix du bon, supplément par km)
 * @returns Résultat détaillé du calcul de prix
 * @throws Error si une ville n'est pas dans la base tarifaire
 */
export async function calculateOneConnexionPriceAsync(
    villeDepart: string,
    villeArrivee: string,
    distanceMeters: number,
    formule: FormuleNew = 'NORMAL',
    config?: Partial<PricingConfig>
): Promise<{
    villeDepart: string;
    villeArrivee: string;
    formule: FormuleNew;
    distanceKm: number;
    priseEnCharge: number;
    supplement: number;
    totalBons: number;
    totalEuros: number;
    isParisDansTrajet: boolean;
    supplementApplique: boolean;
}> {
    // 1. Normaliser les villes
    const villeDepartNormalisee = normaliserVille(villeDepart);
    const villeArriveeNormalisee = normaliserVille(villeArrivee);

    // 2. Récupérer les tarifs des deux villes depuis Supabase
    const tarifsDepartPromise = trouverVilleDansBase(villeDepartNormalisee);
    const tarifsArriveePromise = trouverVilleDansBase(villeArriveeNormalisee);

    const [tarifsDepart, tarifsArrivee] = await Promise.all([
        tarifsDepartPromise,
        tarifsArriveePromise,
    ]);

    if (!tarifsDepart) {
        throw new Error(`Ville de départ non trouvée : ${villeDepart}`);
    }

    if (!tarifsArrivee) {
        throw new Error(`Ville d'arrivée non trouvée : ${villeArrivee}`);
    }

    // 3. Convertir la distance en km
    const distanceKm = distanceMeters / 1000;

    // 4. Récupérer les tarifs pour la formule choisie
    const tarifDepart = tarifsDepart[formule];
    const tarifArrivee = tarifsArrivee[formule];

    // 5. ✅ RÈGLE UNIVERSELLE : Prendre le MAX
    const priseEnCharge = Math.max(tarifDepart, tarifArrivee);

    // 6. Déterminer si Paris est impliqué
    const departEstParis = estParis(villeDepartNormalisee);
    const arriveeEstParis = estParis(villeArriveeNormalisee);
    const isParisDansTrajet = departEstParis || arriveeEstParis;

    // 7. Récupérer la configuration (ou utiliser les valeurs par défaut)
    const bonValueCents = config?.bonValueCents ?? DEFAULT_PRIX_BON_CENTS;
    const supplementPerKmBons = config?.supplementPerKmBons ?? DEFAULT_SUPPLEMENT_PAR_KM_BONS;

    // 8. Calculer via la logique interne (CENTIMES)
    const calculation = calculatePriceInternal(
        priseEnCharge,
        distanceKm,
        isParisDansTrajet,
        { bonValueCents, supplementPerKmBons }
    );

    // 10. Retourner le résultat détaillé
    return {
        villeDepart: villeDepartNormalisee,
        villeArrivee: villeArriveeNormalisee,
        formule,
        distanceKm: parseFloat(distanceKm.toFixed(3)),
        priseEnCharge: calculation.priseEnCharge,
        supplement: calculation.supplement,
        totalBons: parseFloat(calculation.totalBons.toFixed(3)),
        totalEuros: calculation.totalEuros,
        isParisDansTrajet,
        supplementApplique: calculation.supplementApplique,
    };
}

/**
 * Calcule les prix pour toutes les formules en une seule fois (VERSION ASYNCHRONE)
 * Utile pour afficher une comparaison au client
 */
export async function calculerToutesLesFormulesAsync(
    villeDepart: string,
    villeArrivee: string,
    distanceMeters: number,
    config?: Partial<PricingConfig>
): Promise<Record<FormuleNew, Awaited<ReturnType<typeof calculateOneConnexionPriceAsync>>>> {
    const formules: FormuleNew[] = ['NORMAL', 'EXPRESS', 'URGENCE', 'VL_NORMAL', 'VL_EXPRESS'];

    const promises = formules.map((formule) =>
        calculateOneConnexionPriceAsync(villeDepart, villeArrivee, distanceMeters, formule, config)
    );

    const resultats = await Promise.all(promises);

    const resultatMap = {} as Record<FormuleNew, Awaited<ReturnType<typeof calculateOneConnexionPriceAsync>>>;
    formules.forEach((formule, index) => {
        resultatMap[formule] = resultats[index];
    });

    return resultatMap;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    calculateOneConnexionPriceAsync,
    calculerToutesLesFormulesAsync,
    getPriseEnCharge,
    trouverVilleDansBase,
    normaliserVille,
    estParis,
    preloadCityPricingCache,
    clearCityPricingCache,
    getAllCities,
    searchCitiesByPrefix,
};
