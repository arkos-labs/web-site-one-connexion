/**
 * ONE CONNEXION - EXEMPLES D'UTILISATION DU NOUVEAU SYSTÈME DE TARIFICATION
 * =========================================================================
 * 
 * Ce fichier contient des exemples d'utilisation du nouveau système de tarification
 * basé sur Supabase au lieu de l'objet en dur.
 * 
 * @version 2.0
 * @date 2025-12-19
 */

import {
    calculateOneConnexionPriceAsync,
    calculerToutesLesFormulesAsync,
    getPriseEnCharge,
    getAllCities,
    searchCitiesByPrefix,
    preloadCityPricingCache,
    clearCityPricingCache,
} from './pricingEngineDb';

// ============================================================================
// EXEMPLE 1 : Calcul de prix simple
// ============================================================================

async function exemple1_CalculSimple() {
    console.log('=== EXEMPLE 1 : Calcul de prix simple ===\n');

    try {
        const result = await calculateOneConnexionPriceAsync(
            'Paris',           // Ville de départ
            'Versailles',      // Ville d'arrivée
            15000,             // Distance en mètres (15 km)
            'NORMAL'           // Formule
        );

        console.log('Résultat du calcul :');
        console.log(`- Départ : ${result.villeDepart}`);
        console.log(`- Arrivée : ${result.villeArrivee}`);
        console.log(`- Distance : ${result.distanceKm} km`);
        console.log(`- Prise en charge : ${result.priseEnCharge} bons`);
        console.log(`- Supplément : ${result.supplement} bons`);
        console.log(`- Total : ${result.totalBons} bons = ${result.totalEuros}€`);
        console.log(`- Paris dans le trajet : ${result.isParisDansTrajet ? 'Oui' : 'Non'}`);
        console.log(`- Supplément appliqué : ${result.supplementApplique ? 'Oui' : 'Non'}\n`);

    } catch (error) {
        console.error('Erreur lors du calcul :', error);
    }
}

// ============================================================================
// EXEMPLE 2 : Calcul pour toutes les formules
// ============================================================================

async function exemple2_ToutesLesFormules() {
    console.log('=== EXEMPLE 2 : Calcul pour toutes les formules ===\n');

    try {
        const resultats = await calculerToutesLesFormulesAsync(
            'Nanterre',
            'Boulogne-Billancourt',
            8000  // 8 km
        );

        console.log('Comparaison des formules :\n');

        Object.entries(resultats).forEach(([formule, result]) => {
            console.log(`${formule.padEnd(12)} : ${result.totalBons.toFixed(2)} bons = ${result.totalEuros}€`);
        });
        console.log('');

    } catch (error) {
        console.error('Erreur lors du calcul :', error);
    }
}

// ============================================================================
// EXEMPLE 3 : Récupération d'un tarif spécifique
// ============================================================================

async function exemple3_TarifSpecifique() {
    console.log('=== EXEMPLE 3 : Récupération d\'un tarif spécifique ===\n');

    try {
        const tarifNormal = await getPriseEnCharge('PARIS', 'NORMAL');
        const tarifExpress = await getPriseEnCharge('PARIS', 'EXPRESS');
        const tarifUrgence = await getPriseEnCharge('PARIS', 'URGENCE');

        console.log('Tarifs pour Paris :');
        console.log(`- NORMAL : ${tarifNormal} bons`);
        console.log(`- EXPRESS : ${tarifExpress} bons`);
        console.log(`- URGENCE : ${tarifUrgence} bons\n`);

    } catch (error) {
        console.error('Erreur lors de la récupération des tarifs :', error);
    }
}

// ============================================================================
// EXEMPLE 4 : Recherche de villes pour autocomplétion
// ============================================================================

async function exemple4_RechercheVilles() {
    console.log('=== EXEMPLE 4 : Recherche de villes ===\n');

    try {
        // Recherche par préfixe
        const villesParis = await searchCitiesByPrefix('PAR', 5);
        console.log('Villes commençant par "PAR" :');
        villesParis.forEach(ville => console.log(`  - ${ville}`));
        console.log('');

        const villesVersailles = await searchCitiesByPrefix('VER', 5);
        console.log('Villes commençant par "VER" :');
        villesVersailles.forEach(ville => console.log(`  - ${ville}`));
        console.log('');

    } catch (error) {
        console.error('Erreur lors de la recherche :', error);
    }
}

// ============================================================================
// EXEMPLE 5 : Récupération de toutes les villes
// ============================================================================

async function exemple5_ToutesLesVilles() {
    console.log('=== EXEMPLE 5 : Liste de toutes les villes ===\n');

    try {
        const villes = await getAllCities();

        console.log(`Nombre total de villes : ${villes.length}`);
        console.log('Premières villes (par ordre alphabétique) :');
        villes.slice(0, 10).forEach(ville => console.log(`  - ${ville}`));
        console.log('  ...\n');

    } catch (error) {
        console.error('Erreur lors de la récupération des villes :', error);
    }
}

// ============================================================================
// EXEMPLE 6 : Préchargement du cache
// ============================================================================

async function exemple6_PrechargerCache() {
    console.log('=== EXEMPLE 6 : Préchargement du cache ===\n');

    try {
        console.log('Préchargement du cache en cours...');
        await preloadCityPricingCache();
        console.log('Cache préchargé avec succès !\n');

        // Maintenant, les requêtes suivantes seront ultra-rapides
        const start = Date.now();
        await getPriseEnCharge('PARIS', 'NORMAL');
        const end = Date.now();

        console.log(`Temps de réponse avec cache : ${end - start}ms\n`);

    } catch (error) {
        console.error('Erreur lors du préchargement :', error);
    }
}

// ============================================================================
// EXEMPLE 7 : Calcul banlieue → banlieue (avec supplément)
// ============================================================================

async function exemple7_BanlieueVersBanlieue() {
    console.log('=== EXEMPLE 7 : Calcul banlieue → banlieue ===\n');

    try {
        const result = await calculateOneConnexionPriceAsync(
            'Nanterre',
            'Versailles',
            20000,  // 20 km
            'NORMAL'
        );

        console.log('Trajet banlieue → banlieue :');
        console.log(`- ${result.villeDepart} → ${result.villeArrivee}`);
        console.log(`- Distance : ${result.distanceKm} km`);
        console.log(`- Prise en charge : ${result.priseEnCharge} bons`);
        console.log(`- Supplément kilométrique : ${result.supplement} bons (${result.distanceKm} km × 0.1)`);
        console.log(`- Total : ${result.totalBons} bons = ${result.totalEuros}€`);
        console.log(`- Supplément appliqué : ${result.supplementApplique ? 'OUI' : 'NON'}\n`);

    } catch (error) {
        console.error('Erreur lors du calcul :', error);
    }
}

// ============================================================================
// EXEMPLE 8 : Calcul avec Paris (sans supplément)
// ============================================================================

async function exemple8_AvecParis() {
    console.log('=== EXEMPLE 8 : Calcul avec Paris (sans supplément) ===\n');

    try {
        const result = await calculateOneConnexionPriceAsync(
            'Paris',
            'Versailles',
            20000,  // 20 km
            'NORMAL'
        );

        console.log('Trajet Paris → banlieue :');
        console.log(`- ${result.villeDepart} → ${result.villeArrivee}`);
        console.log(`- Distance : ${result.distanceKm} km`);
        console.log(`- Prise en charge : ${result.priseEnCharge} bons`);
        console.log(`- Supplément kilométrique : ${result.supplement} bons (Paris impliqué)`);
        console.log(`- Total : ${result.totalBons} bons = ${result.totalEuros}€`);
        console.log(`- Supplément appliqué : ${result.supplementApplique ? 'OUI' : 'NON'}\n`);

    } catch (error) {
        console.error('Erreur lors du calcul :', error);
    }
}

// ============================================================================
// EXEMPLE 9 : Gestion d'erreur (ville non trouvée)
// ============================================================================

async function exemple9_VilleNonTrouvee() {
    console.log('=== EXEMPLE 9 : Gestion d\'erreur ===\n');

    try {
        await calculateOneConnexionPriceAsync(
            'VilleInexistante',
            'Paris',
            10000,
            'NORMAL'
        );
    } catch (error) {
        console.log('Erreur attendue :');
        console.log(`  ${error instanceof Error ? error.message : error}\n`);
    }
}

// ============================================================================
// EXEMPLE 10 : Configuration personnalisée
// ============================================================================

async function exemple10_ConfigurationPersonnalisee() {
    console.log('=== EXEMPLE 10 : Configuration personnalisée ===\n');

    try {
        // Configuration avec prix du bon à 6€ au lieu de 5.5€
        const result = await calculateOneConnexionPriceAsync(
            'Paris',
            'Versailles',
            15000,
            'NORMAL',
            {
                bonValueEur: 6.0,
                supplementPerKmBons: 0.15  // 0.15 bon/km au lieu de 0.1
            }
        );

        console.log('Calcul avec configuration personnalisée :');
        console.log(`- Prix du bon : 6.00€ (au lieu de 5.50€)`);
        console.log(`- Supplément : 0.15 bon/km (au lieu de 0.1)`);
        console.log(`- Total : ${result.totalBons} bons = ${result.totalEuros}€\n`);

    } catch (error) {
        console.error('Erreur lors du calcul :', error);
    }
}

// ============================================================================
// FONCTION PRINCIPALE : Exécuter tous les exemples
// ============================================================================

export async function executerTousLesExemples() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ONE CONNEXION - EXEMPLES SYSTÈME DE TARIFICATION         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');

    await exemple1_CalculSimple();
    await exemple2_ToutesLesFormules();
    await exemple3_TarifSpecifique();
    await exemple4_RechercheVilles();
    await exemple5_ToutesLesVilles();
    await exemple6_PrechargerCache();
    await exemple7_BanlieueVersBanlieue();
    await exemple8_AvecParis();
    await exemple9_VilleNonTrouvee();
    await exemple10_ConfigurationPersonnalisee();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  TOUS LES EXEMPLES ONT ÉTÉ EXÉCUTÉS AVEC SUCCÈS !         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    exemple1_CalculSimple,
    exemple2_ToutesLesFormules,
    exemple3_TarifSpecifique,
    exemple4_RechercheVilles,
    exemple5_ToutesLesVilles,
    exemple6_PrechargerCache,
    exemple7_BanlieueVersBanlieue,
    exemple8_AvecParis,
    exemple9_VilleNonTrouvee,
    exemple10_ConfigurationPersonnalisee,
    executerTousLesExemples,
};

// ============================================================================
// UTILISATION DANS UN COMPOSANT REACT
// ============================================================================

/*
import { useEffect, useState } from 'react';
import { calculateOneConnexionPriceAsync, preloadCityPricingCache } from '@/utils/pricingEngineDb';

function PricingComponent() {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Précharger le cache au montage du composant
    useEffect(() => {
        preloadCityPricingCache();
    }, []);

    const calculatePrice = async () => {
        setLoading(true);
        try {
            const result = await calculateOneConnexionPriceAsync(
                'Paris',
                'Versailles',
                15000,
                'NORMAL'
            );
            setPrice(result.totalEuros);
        } catch (error) {
            console.error('Erreur de calcul :', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={calculatePrice} disabled={loading}>
                {loading ? 'Calcul en cours...' : 'Calculer le prix'}
            </button>
            {price !== null && <p>Prix : {price}€</p>}
        </div>
    );
}
*/
