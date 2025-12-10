/**
 * TESTS DU MOTEUR TARIFAIRE ONE CONNEXION
 * ================================================
 * 
 * Tests de validation de la logique tarifaire :
 * - Prise en charge fixe par ville de départ
 * - Supplément kilométrique uniquement pour banlieue → banlieue
 * - Système de bons (1 bon = 5,5€)
 */

import { describe, it, expect } from 'vitest';
import {
    calculateOneConnexionPrice,
    calculerToutesLesFormules,
    getPriseEnCharge,
    trouverVilleDansBase,
    normaliserVille,
    estParis,
    DEFAULT_PRIX_BON,
    DEFAULT_SUPPLEMENT_PAR_KM,
    type FormuleNew
} from './pricingEngine';

describe('Moteur Tarifaire One Connexion', () => {

    // ========================================================================
    // TESTS DES FONCTIONS UTILITAIRES
    // ========================================================================

    describe('normaliserVille', () => {
        it('devrait convertir en majuscules', () => {
            expect(normaliserVille('paris')).toBe('PARIS');
            expect(normaliserVille('Melun')).toBe('MELUN');
        });

        it('devrait supprimer les accents', () => {
            expect(normaliserVille('Évry')).toBe('EVRY');
            expect(normaliserVille('Créteil')).toBe('CRETEIL');
        });

        it('devrait normaliser les espaces', () => {
            expect(normaliserVille('  Paris  ')).toBe('PARIS');
            expect(normaliserVille('Saint   Denis')).toBe('SAINT-DENIS');
        });
    });

    describe('estParis', () => {
        it('devrait reconnaître Paris', () => {
            expect(estParis('Paris')).toBe(true);
            expect(estParis('PARIS')).toBe(true);
            expect(estParis('paris')).toBe(true);
        });

        it('devrait reconnaître les arrondissements de Paris', () => {
            expect(estParis('Paris 1er')).toBe(true);
            expect(estParis('Paris 15e')).toBe(true);
        });

        it('ne devrait pas reconnaître les autres villes', () => {
            expect(estParis('Melun')).toBe(false);
            expect(estParis('Versailles')).toBe(false);
        });
    });

    describe('trouverVilleDansBase', () => {
        it('devrait trouver une ville exacte', () => {
            expect(trouverVilleDansBase('Paris')).toBe('PARIS');
            expect(trouverVilleDansBase('Melun')).toBe('MELUN');
            expect(trouverVilleDansBase('VERSAILLES')).toBe('VERSAILLES');
        });

        it('devrait retourner null pour une ville inconnue', () => {
            expect(trouverVilleDansBase('Ville Inconnue')).toBeNull();
            expect(trouverVilleDansBase('Tokyo')).toBeNull();
        });

        it('devrait trouver Les Mureaux (avec espace)', () => {
            expect(trouverVilleDansBase('Les Mureaux')).toBe('LES-MUREAUX');
        });
    });

    describe('getPriseEnCharge', () => {
        it('devrait retourner la prise en charge correcte pour Paris NORMAL', () => {
            expect(getPriseEnCharge('Paris', 'NORMAL')).toBe(2);
        });

        it('devrait retourner la prise en charge correcte pour Melun EXPRESS', () => {
            expect(getPriseEnCharge('Melun', 'EXPRESS')).toBe(27);
        });

        it('devrait lever une erreur pour une ville inconnue', () => {
            expect(() => getPriseEnCharge('Ville Inconnue', 'NORMAL')).toThrow();
        });
    });

    // ========================================================================
    // TESTS DE LA LOGIQUE TARIFAIRE PRINCIPALE
    // ========================================================================

    describe('calculateOneConnexionPrice - Paris → Ville', () => {
        it('Paris → Melun (47,3 km) NORMAL : pas de supplément', () => {
            const result = calculateOneConnexionPrice('Paris', 'Melun', 47300, 'NORMAL');

            expect(result.priseEnCharge).toBe(24); // Prise en charge Melun NORMAL (MAX de Paris=2 et Melun=24)
            expect(result.supplement).toBe(0); // Pas de supplément (Paris impliqué)
            expect(result.totalBons).toBe(24);
            expect(result.totalEuros).toBe(24 * 5.5);
            expect(result.isParisDansTrajet).toBe(true);
            expect(result.supplementApplique).toBe(false);
        });

        it('Paris → Versailles (18 km) EXPRESS : pas de supplément', () => {
            const result = calculateOneConnexionPrice('Paris', 'Versailles', 18000, 'EXPRESS');

            expect(result.priseEnCharge).toBe(12); // Prise en charge Versailles EXPRESS (MAX de Paris=4 et Versailles=12)
            expect(result.supplement).toBe(0);
            expect(result.totalBons).toBe(12);
            expect(result.totalEuros).toBe(12 * 5.5);
            expect(result.isParisDansTrajet).toBe(true);
        });
    });

    describe('calculateOneConnexionPrice - Ville → Paris', () => {
        it('Melun → Paris (47,3 km) NORMAL : pas de supplément', () => {
            const result = calculateOneConnexionPrice('Melun', 'Paris', 47300, 'NORMAL');

            expect(result.priseEnCharge).toBe(24); // Prise en charge Melun NORMAL
            expect(result.supplement).toBe(0); // Pas de supplément (Paris impliqué)
            expect(result.totalBons).toBe(24);
            expect(result.totalEuros).toBe(24 * 5.5);
            expect(result.isParisDansTrajet).toBe(true);
            expect(result.supplementApplique).toBe(false);
        });

        it('Versailles → Paris (18 km) EXPRESS : pas de supplément', () => {
            const result = calculateOneConnexionPrice('Versailles', 'Paris', 18000, 'EXPRESS');

            expect(result.priseEnCharge).toBe(12); // Prise en charge Versailles EXPRESS
            expect(result.supplement).toBe(0);
            expect(result.totalBons).toBe(12);
            expect(result.totalEuros).toBe(12 * 5.5);
            expect(result.isParisDansTrajet).toBe(true);
        });
    });

    describe('calculateOneConnexionPrice - Ville → Ville (AVEC supplément)', () => {
        it('Melun → Versailles (47,3 km) NORMAL : avec supplément', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 47300, 'NORMAL');

            const distanceKm = 47.3;
            const supplementAttendu = distanceKm * 0.1; // 4.73 bons

            expect(result.priseEnCharge).toBe(24); // Prise en charge Melun NORMAL (MAX de Melun=24 et Versailles=9)
            expect(result.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(result.totalBons).toBeCloseTo(24 + supplementAttendu, 2);
            expect(result.totalEuros).toBeCloseTo((24 + supplementAttendu) * 5.5, 2);
            expect(result.isParisDansTrajet).toBe(false);
            expect(result.supplementApplique).toBe(true);
        });

        it('Clichy → Montreuil (10 km) EXPRESS : avec supplément', () => {
            const result = calculateOneConnexionPrice('Clichy', 'Montreuil', 10000, 'EXPRESS');

            const distanceKm = 10;
            const supplementAttendu = distanceKm * 0.1; // 1 bon

            expect(result.priseEnCharge).toBe(7); // Prise en charge Montreuil EXPRESS (MAX de Clichy=4 et Montreuil=7)
            expect(result.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(result.totalBons).toBeCloseTo(7 + supplementAttendu, 2);
            expect(result.totalEuros).toBeCloseTo((7 + supplementAttendu) * 5.5, 2);
            expect(result.isParisDansTrajet).toBe(false);
            expect(result.supplementApplique).toBe(true);
        });

        it('Versailles → Melun (1 km) URGENCE : avec supplément minimal', () => {
            const result = calculateOneConnexionPrice('Versailles', 'Melun', 1000, 'URGENCE');

            const distanceKm = 1;
            const supplementAttendu = distanceKm * 0.1; // 0.1 bon

            expect(result.priseEnCharge).toBe(30); // Prise en charge Melun URGENCE (MAX de Versailles=15 et Melun=30)
            expect(result.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(result.totalBons).toBeCloseTo(30 + supplementAttendu, 2);
            expect(result.totalEuros).toBeCloseTo((30 + supplementAttendu) * 5.5, 2);
            expect(result.supplementApplique).toBe(true);
        });
    });

    describe('calculateOneConnexionPrice - Formules VL (Véhicule Léger)', () => {
        it('Paris → Melun VL_NORMAL : prise en charge VL', () => {
            const result = calculateOneConnexionPrice('Paris', 'Melun', 47300, 'VL_NORMAL');

            expect(result.priseEnCharge).toBe(28); // Prise en charge Melun VL_NORMAL (MAX de Paris=7 et Melun=28)
            expect(result.supplement).toBe(0);
            expect(result.totalBons).toBe(28);
            expect(result.totalEuros).toBe(28 * 5.5);
        });

        it('Melun → Versailles (47,3 km) VL_EXPRESS : avec supplément', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 47300, 'VL_EXPRESS');

            const distanceKm = 47.3;
            const supplementAttendu = distanceKm * 0.1;

            expect(result.priseEnCharge).toBe(31); // Prise en charge Melun VL_EXPRESS (MAX de Melun=31 et Versailles=16)
            expect(result.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(result.totalBons).toBeCloseTo(31 + supplementAttendu, 2);
            expect(result.supplementApplique).toBe(true);
        });
    });

    // ========================================================================
    // TESTS DES CAS LIMITES
    // ========================================================================

    describe('Cas limites', () => {
        it('Distance 0 km : pas de supplément', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 0, 'NORMAL');

            expect(result.distanceKm).toBe(0);
            expect(result.supplement).toBe(0);
            expect(result.totalBons).toBe(24); // Seulement la prise en charge (MAX de Melun=24 et Versailles=9)
        });

        it('Distance très longue (100 km) : supplément proportionnel', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 100000, 'NORMAL');

            const distanceKm = 100;
            const supplementAttendu = distanceKm * 0.1; // 10 bons

            expect(result.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(result.totalBons).toBeCloseTo(24 + supplementAttendu, 2);
        });

        it('Ville inconnue : devrait lever une erreur', () => {
            expect(() => {
                calculateOneConnexionPrice('Ville Inconnue', 'Paris', 10000, 'NORMAL');
            }).toThrow();
        });
    });

    // ========================================================================
    // TESTS DE calculerToutesLesFormules
    // ========================================================================

    describe('calculerToutesLesFormules', () => {
        it('devrait calculer toutes les formules pour Paris → Melun', () => {
            const resultats = calculerToutesLesFormules('Paris', 'Melun', 47300);

            expect(resultats.NORMAL.priseEnCharge).toBe(24);
            expect(resultats.EXPRESS.priseEnCharge).toBe(27);
            expect(resultats.URGENCE.priseEnCharge).toBe(30);
            expect(resultats.VL_NORMAL.priseEnCharge).toBe(28);
            expect(resultats.VL_EXPRESS.priseEnCharge).toBe(31);

            // Tous sans supplément (Paris impliqué)
            expect(resultats.NORMAL.supplement).toBe(0);
            expect(resultats.EXPRESS.supplement).toBe(0);
            expect(resultats.URGENCE.supplement).toBe(0);
            expect(resultats.VL_NORMAL.supplement).toBe(0);
            expect(resultats.VL_EXPRESS.supplement).toBe(0);
        });

        it('devrait calculer toutes les formules pour Melun → Versailles (avec supplément)', () => {
            const resultats = calculerToutesLesFormules('Melun', 'Versailles', 47300);

            const distanceKm = 47.3;
            const supplementAttendu = distanceKm * 0.1;

            // Toutes les formules devraient avoir le même supplément
            expect(resultats.NORMAL.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(resultats.EXPRESS.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(resultats.URGENCE.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(resultats.VL_NORMAL.supplement).toBeCloseTo(supplementAttendu, 2);
            expect(resultats.VL_EXPRESS.supplement).toBeCloseTo(supplementAttendu, 2);

            // Mais des prises en charge différentes (MAX de Melun et Versailles)
            expect(resultats.NORMAL.priseEnCharge).toBe(24); // MAX(24, 9)
            expect(resultats.EXPRESS.priseEnCharge).toBe(27); // MAX(27, 12)
            expect(resultats.URGENCE.priseEnCharge).toBe(30); // MAX(30, 15)
            expect(resultats.VL_NORMAL.priseEnCharge).toBe(28); // MAX(28, 13)
            expect(resultats.VL_EXPRESS.priseEnCharge).toBe(31); // MAX(31, 16)
        });
    });

    // ========================================================================
    // TESTS DE VALIDATION DES CONSTANTES
    // ========================================================================

    describe('Constantes', () => {
        it('DEFAULT_PRIX_BON devrait être 5.5', () => {
            expect(DEFAULT_PRIX_BON).toBe(5.5);
        });

        it('DEFAULT_SUPPLEMENT_PAR_KM devrait être 0.1', () => {
            expect(DEFAULT_SUPPLEMENT_PAR_KM).toBe(0.1);
        });
    });

    // ========================================================================
    // TESTS DE COHÉRENCE
    // ========================================================================

    describe('Cohérence tarifaire', () => {
        it('Le prix total devrait toujours être positif', () => {
            const result = calculateOneConnexionPrice('Paris', 'Melun', 47300, 'NORMAL');
            expect(result.totalEuros).toBeGreaterThan(0);
        });

        it('Le prix total devrait être égal à totalBons × DEFAULT_PRIX_BON', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 47300, 'NORMAL');
            expect(result.totalEuros).toBeCloseTo(result.totalBons * DEFAULT_PRIX_BON, 2);
        });

        it('totalBons devrait être égal à priseEnCharge + supplement', () => {
            const result = calculateOneConnexionPrice('Melun', 'Versailles', 47300, 'NORMAL');
            expect(result.totalBons).toBeCloseTo(result.priseEnCharge + result.supplement, 2);
        });

        it('Les formules plus chères devraient avoir des prises en charge plus élevées', () => {
            const resultats = calculerToutesLesFormules('Paris', 'Melun', 47300);

            // NORMAL < EXPRESS < URGENCE
            expect(resultats.NORMAL.priseEnCharge).toBeLessThan(resultats.EXPRESS.priseEnCharge);
            expect(resultats.EXPRESS.priseEnCharge).toBeLessThan(resultats.URGENCE.priseEnCharge);

            // VL_NORMAL < VL_EXPRESS
            expect(resultats.VL_NORMAL.priseEnCharge).toBeLessThan(resultats.VL_EXPRESS.priseEnCharge);
        });
    });
});
