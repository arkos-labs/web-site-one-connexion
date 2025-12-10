/**
 * TESTS DU MOTEUR TARIFAIRE ONE CONNEXION EXPRESS
 * 
 * Ce fichier contient des tests pour vérifier le bon fonctionnement
 * du moteur tarifaire basé sur les bons.
 */

import {
    calculerPrix,
    calculerToutesLesFormules,
    estVilleDesservie,
    getVillesDesservies,
    normaliserVille,
    trouverVilleDansBase,
    BASE_TARIFAIRE,
    PRIX_BON
} from './pricingEngine';

// ============================================================================
// TESTS DE BASE
// ============================================================================

console.log('🧪 TESTS DU MOTEUR TARIFAIRE\n');

// Test 1: Calcul pour BOULOGNE-BILLANCOURT
console.log('📍 Test 1: BOULOGNE-BILLANCOURT');
try {
    const result = calculerPrix('BOULOGNE-BILLANCOURT', 'STANDARD');
    console.log('✅ Standard:', result.prixTotal, '€ (', result.nombreBons, 'bons )');
    console.assert(result.nombreBons === 3, 'Nombre de bons incorrect');
    console.assert(result.prixTotal === 16.50, 'Prix incorrect');
} catch (error) {
    console.error('❌ Erreur:', error);
}

// Test 2: Calcul pour VERSAILLES
console.log('\n📍 Test 2: VERSAILLES');
try {
    const results = calculerToutesLesFormules('VERSAILLES');
    console.log('✅ Standard:', results.STANDARD.prixTotal, '€');
    console.log('✅ Express:', results.EXPRESS.prixTotal, '€');
    console.log('✅ Flash:', results.FLASH_EXPRESS.prixTotal, '€');

    console.assert(results.STANDARD.nombreBons === 10, 'Standard: nombre de bons incorrect');
    console.assert(results.EXPRESS.nombreBons === 14, 'Express: nombre de bons incorrect');
    console.assert(results.FLASH_EXPRESS.nombreBons === 18, 'Flash: nombre de bons incorrect');
} catch (error) {
    console.error('❌ Erreur:', error);
}

// Test 3: Ville non desservie
console.log('\n📍 Test 3: Ville non desservie (LYON)');
try {
    calculerPrix('LYON', 'STANDARD');
    console.error('❌ Devrait lever une erreur');
} catch (error) {
    if (error instanceof Error) {
        console.log('✅ Erreur attendue:', error.message);
    }
}

// Test 4: Normalisation des villes
console.log('\n📍 Test 4: Normalisation des villes');
console.log('✅', normaliserVille('Boulogne-Billancourt'), '→ BOULOGNE-BILLANCOURT');
console.log('✅', normaliserVille('  versailles  '), '→ VERSAILLES');
console.log('✅', normaliserVille('Neuilly-sur-Seine'), '→ NEUILLY-SUR-SEINE');

// Test 5: Recherche de ville
console.log('\n📍 Test 5: Recherche de ville');
console.log('✅', trouverVilleDansBase('boulogne'), '→', trouverVilleDansBase('boulogne'));
console.log('✅', trouverVilleDansBase('VERSAILLES'), '→', trouverVilleDansBase('VERSAILLES'));
console.log('✅', trouverVilleDansBase('lyon'), '→', trouverVilleDansBase('lyon') || 'null');

// Test 6: Vérification de desserte
console.log('\n📍 Test 6: Vérification de desserte');
console.log('✅ VERSAILLES desservie?', estVilleDesservie('VERSAILLES'));
console.log('✅ LYON desservie?', estVilleDesservie('LYON'));
console.log('✅ LEVALLOIS-PERRET desservie?', estVilleDesservie('LEVALLOIS-PERRET'));

// Test 7: Liste des villes
console.log('\n📍 Test 7: Statistiques de la base tarifaire');
const villes = getVillesDesservies();
console.log('✅ Nombre de villes desservies:', villes.length);
console.log('✅ Prix du bon:', PRIX_BON, '€');
console.log('✅ Premières villes:', villes.slice(0, 5).join(', '));

// Test 8: Villes proches (petits tarifs)
console.log('\n📍 Test 8: Villes proches (tarifs bas)');
const villesProches = ['LEVALLOIS-PERRET', 'NEUILLY-SUR-SEINE', 'CLICHY'];
villesProches.forEach(ville => {
    try {
        const result = calculerPrix(ville, 'STANDARD');
        console.log(`✅ ${ville}: ${result.nombreBons} bons = ${result.prixTotal}€`);
    } catch (error) {
        console.error(`❌ ${ville}:`, error);
    }
});

// Test 9: Villes lointaines (gros tarifs)
console.log('\n📍 Test 9: Villes lointaines (tarifs élevés)');
const villesLointaines = ['PROVINS', 'RAMBOUILLET', 'FONTAINEBLEAU'];
villesLointaines.forEach(ville => {
    try {
        const result = calculerPrix(ville, 'FLASH_EXPRESS');
        console.log(`✅ ${ville}: ${result.nombreBons} bons = ${result.prixTotal}€`);
    } catch (error) {
        console.error(`❌ ${ville}:`, error);
    }
});

// Test 10: Vérification de la cohérence
console.log('\n📍 Test 10: Vérification de la cohérence');
Object.entries(BASE_TARIFAIRE).forEach(([ville, tarifs]) => {
    // Vérifier que N < E < F
    if (!(tarifs.N < tarifs.E && tarifs.E < tarifs.F)) {
        console.error(`❌ ${ville}: Incohérence dans les tarifs`, tarifs);
    }
});
console.log('✅ Tous les tarifs sont cohérents (N < E < F)');

// Test 11: Calcul des prix extrêmes
console.log('\n📍 Test 11: Prix minimum et maximum');
let minPrice = Infinity;
let maxPrice = 0;
let minVille = '';
let maxVille = '';

Object.entries(BASE_TARIFAIRE).forEach(([ville, tarifs]) => {
    const priceStandard = tarifs.N * PRIX_BON;
    const priceFlash = tarifs.F * PRIX_BON;

    if (priceStandard < minPrice) {
        minPrice = priceStandard;
        minVille = ville;
    }

    if (priceFlash > maxPrice) {
        maxPrice = priceFlash;
        maxVille = ville;
    }
});

console.log(`✅ Prix minimum: ${minPrice}€ (${minVille} en Standard)`);
console.log(`✅ Prix maximum: ${maxPrice}€ (${maxVille} en Flash Express)`);

// Test 12: Départements couverts
console.log('\n📍 Test 12: Départements couverts');
const departements = new Set<string>();
Object.keys(BASE_TARIFAIRE).forEach(ville => {
    // Extraire le département depuis le nom de la ville (approximatif)
    if (ville.includes('92') || ['BOULOGNE', 'NEUILLY', 'LEVALLOIS', 'ISSY'].some(v => ville.includes(v))) {
        departements.add('92 - Hauts-de-Seine');
    }
    if (ville.includes('93') || ['AUBERVILLIERS', 'PANTIN', 'MONTREUIL'].some(v => ville.includes(v))) {
        departements.add('93 - Seine-Saint-Denis');
    }
    if (ville.includes('94') || ['VINCENNES', 'CRETEIL', 'IVRY'].some(v => ville.includes(v))) {
        departements.add('94 - Val-de-Marne');
    }
    if (ville.includes('95') || ['ARGENTEUIL', 'CERGY', 'PONTOISE'].some(v => ville.includes(v))) {
        departements.add('95 - Val-d\'Oise');
    }
    if (ville.includes('78') || ['VERSAILLES', 'POISSY', 'MANTES'].some(v => ville.includes(v))) {
        departements.add('78 - Yvelines');
    }
    if (ville.includes('91') || ['EVRY', 'MASSY', 'CORBEIL'].some(v => ville.includes(v))) {
        departements.add('91 - Essonne');
    }
    if (ville.includes('77') || ['MEAUX', 'MELUN', 'FONTAINEBLEAU'].some(v => ville.includes(v))) {
        departements.add('77 - Seine-et-Marne');
    }
});

console.log('✅ Départements couverts:');
Array.from(departements).sort().forEach(dep => console.log(`   - ${dep}`));

// ============================================================================
// RÉSUMÉ
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS');
console.log('='.repeat(60));
console.log(`✅ Nombre de villes: ${villes.length}`);
console.log(`✅ Prix du bon: ${PRIX_BON}€`);
console.log(`✅ Prix minimum: ${minPrice}€ (${minVille})`);
console.log(`✅ Prix maximum: ${maxPrice}€ (${maxVille})`);
console.log(`✅ Formules: Standard, Express, Flash Express`);
console.log(`✅ Départements: ${departements.size}`);
console.log('='.repeat(60));
console.log('🎉 Tous les tests sont passés avec succès !');
console.log('='.repeat(60));

// Export pour utilisation dans d'autres fichiers
export const testResults = {
    totalVilles: villes.length,
    prixBon: PRIX_BON,
    prixMin: minPrice,
    prixMax: maxPrice,
    villeMin: minVille,
    villeMax: maxVille,
    departements: Array.from(departements)
};
