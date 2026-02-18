import { getTariffMetadata } from "@/services/settingsService";
import { PricingConfig } from "@/utils/pricingEngine";

/**
 * Charge la configuration de pricing depuis Supabase
 * Retourne les valeurs par défaut en cas d'erreur
 */
export async function loadPricingConfig(): Promise<PricingConfig> {
    try {
        const settings = await getTariffMetadata();

        return {
            bonValueCents: Math.round((parseFloat(settings.bon_value_eur) || 5.5) * 100),
            supplementPerKmBons: parseFloat(settings.supplement_per_km_bons) || 0.1
        };
    } catch (error) {
        console.error("Error loading pricing config, using defaults:", error);

        // Retourner les valeurs par défaut en cas d'erreur
        return {
            bonValueCents: 550,
            supplementPerKmBons: 0.1
        };
    }
}

/**
 * Cache pour la configuration (évite de recharger à chaque calcul)
 */
let cachedConfig: PricingConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Charge la configuration avec cache
 */
export async function loadPricingConfigCached(): Promise<PricingConfig> {
    const now = Date.now();

    // Si le cache est valide, le retourner
    if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedConfig;
    }

    // Sinon, recharger depuis la base
    cachedConfig = await loadPricingConfig();
    cacheTimestamp = now;

    return cachedConfig;
}

/**
 * Invalide le cache (à appeler après modification des tarifs)
 */
export function invalidatePricingConfigCache(): void {
    cachedConfig = null;
    cacheTimestamp = 0;
}
