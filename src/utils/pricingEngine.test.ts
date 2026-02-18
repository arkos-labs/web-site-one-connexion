import { describe, it, expect } from 'vitest';
import {
    normaliserVille,
    estParis
} from './pricingEngine';

describe('Moteur Tarifaire One Connexion - Utilitaires', () => {

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
            expect(estParis('Paris-01')).toBe(true);
            expect(estParis('Paris-15')).toBe(true);
        });

        it('ne devrait pas reconnaître les autres villes', () => {
            expect(estParis('Melun')).toBe(false);
            expect(estParis('Versailles')).toBe(false);
        });
    });
});
