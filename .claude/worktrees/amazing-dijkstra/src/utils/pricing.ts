// Facade for Pricing Utilities
// Re-exporting from modular sub-modules to maintain compatibility

export * from './pricing/types';
export * from './pricing/constants';
export * from './pricing/engine';
export * from './pricing/formatter';

import {
    calculerPrix,
    calculerToutesLesFormules,
    appliquerSupplements,
    determinerZone,
} from './pricing/engine';

import {
    getNomZone,
    getNomFormule,
    formaterPrix,
} from './pricing/formatter';

import {
    GRILLE_TARIFAIRE,
    CARACTERISTIQUES_FORMULES,
    SUPPLEMENTS_DISPONIBLES,
} from './pricing/constants';

export default {
    calculerPrix,
    calculerToutesLesFormules,
    appliquerSupplements,
    determinerZone,
    getNomZone,
    getNomFormule,
    formaterPrix,
    GRILLE_TARIFAIRE,
    CARACTERISTIQUES_FORMULES,
    SUPPLEMENTS_DISPONIBLES
};
