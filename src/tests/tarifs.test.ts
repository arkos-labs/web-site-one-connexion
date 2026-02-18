/**
 * TEST DE VALIDATION - SYSTÈME DE TARIFICATION
 * =============================================
 * 
 * Vérifie que tous les exemples obligatoires fonctionnent correctement.
 * À exécuter pour valider l'intégration.
 */

import tarifs from '@/data/tarifs_idf';

// ===================================================================
// TESTS OBLIGATOIRES
// ===================================================================

function test(nom: string, condition: boolean, details: string = '') {
  if (condition) {
    console.log(`✅ ${nom}`);
    if (details) console.log(`   ${details}`);
  } else {
    console.error(`❌ ${nom}`);
    if (details) console.error(`   ${details}`);
    process.exit(1);
  }
}

console.log('==========================================');
console.log('TESTS DE VALIDATION');
console.log('==========================================\n');

// ===================================================================
// TEST 1: EXEMPLE OBLIGATOIRE - MELUN + EXPRESS
// ===================================================================
console.log('TEST 1: Melun (77000) + EXPRESS');
console.log('--------------------------------');

const melun = tarifs.calculerPrix('77000', 'Melun', 'EXPRESS');

test(
  'Melun existe',
  melun !== null && melun !== undefined,
  'Tarif récupéré'
);

test(
  'Melun: EXPRESS = 27 bons',
  melun.nb_bons === 27,
  `Attendu: 27, Obtenu: ${melun.nb_bons}`
);

test(
  'Melun: EXPRESS = 148,5€',
  melun.prix_euros === 148.5,
  `Attendu: 148.5, Obtenu: ${melun.prix_euros}`
);

test(
  'Melun: calcul correct',
  melun.calcul === '27 × 5,5€ = 148,5€',
  `Obtenu: ${melun.calcul}`
);

test(
  'Melun: formule correcte',
  melun.formule === 'EXPRESS',
  `Formule: ${melun.formule}`
);

test(
  'Melun: CP correct',
  melun.cp === '77000',
  `CP: ${melun.cp}`
);

test(
  'Melun: Ville correcte',
  melun.ville === 'Melun',
  `Ville: ${melun.ville}`
);

// ===================================================================
// TEST 2: EXEMPLE OBLIGATOIRE - CACHAN + URGENCE
// ===================================================================
console.log('\nTEST 2: Cachan (94230) + URGENCE');
console.log('--------------------------------');

const cachan = tarifs.calculerPrix('94230', 'Cachan', 'URGENCE');

test(
  'Cachan existe',
  cachan !== null && cachan !== undefined,
  'Tarif récupéré'
);

test(
  'Cachan: URGENCE = 11 bons',
  cachan.nb_bons === 11,
  `Attendu: 11, Obtenu: ${cachan.nb_bons}`
);

test(
  'Cachan: URGENCE = 60,5€',
  cachan.prix_euros === 60.5,
  `Attendu: 60.5, Obtenu: ${cachan.prix_euros}`
);

test(
  'Cachan: calcul correct',
  cachan.calcul === '11 × 5,5€ = 60,5€',
  `Obtenu: ${cachan.calcul}`
);

// ===================================================================
// TEST 3: VALIDATION DE VILLE
// ===================================================================
console.log('\nTEST 3: Validation');
console.log('------------------');

test(
  'Melun valide',
  tarifs.validerVille('77000', 'Melun'),
  'Ville trouvée'
);

test(
  'Cachan valide',
  tarifs.validerVille('94230', 'Cachan'),
  'Ville trouvée'
);

test(
  'Paris 1er valide',
  tarifs.validerVille('75001', 'Paris 1er'),
  'Ville trouvée'
);

test(
  'Ville inexistante détectée',
  !tarifs.validerVille('99999', 'Inexistant'),
  'Ville non trouvée (comportement attendu)'
);

test(
  'CP invalide détecté',
  !tarifs.validerVille('99999', 'Melun'),
  'Mauvais CP (comportement attendu)'
);

// ===================================================================
// TEST 4: AUTOCOMPLÉTION
// ===================================================================
console.log('\nTEST 4: Autocomplétion');
console.log('---------------------');

const rechercheParisResultat = tarifs.rechercherVilles('Paris', 25);
test(
  'Recherche "Paris" retourne au moins 20 résultats',
  rechercheParisResultat.length >= 20,
  `Résultats trouvés: ${rechercheParisResultat.length}`
);

const rechercheMelunResultat = tarifs.rechercherVilles('Melun', 5);
test(
  'Recherche "Melun" retourne au moins 1 résultat',
  rechercheMelunResultat.length >= 1,
  `Résultats trouvés: ${rechercheMelunResultat.length}`
);

test(
  'Recherche "Melun" contient Melun',
  rechercheMelunResultat.some(v => v.ville === 'Melun'),
  'Melun trouvé dans les résultats'
);

const rechercheLimitee = tarifs.rechercherVilles('Paris', 3);
test(
  'Limite respectée (max 3)',
  rechercheLimitee.length <= 3,
  `Résultats: ${rechercheLimitee.length}`
);

// ===================================================================
// TEST 5: TOUS LES TARIFS D'UNE VILLE
// ===================================================================
console.log('\nTEST 5: Tous les tarifs');
console.log('-----------------------');

const tousMelun = tarifs.calculerTousLesPrix('77000', 'Melun');

test(
  'NORMAL calculé',
  tousMelun.NORMAL !== undefined && tousMelun.NORMAL.nb_bons === 25,
  `Melun NORMAL: ${tousMelun.NORMAL.prix_euros}€`
);

test(
  'EXPRESS calculé',
  tousMelun.EXPRESS !== undefined && tousMelun.EXPRESS.nb_bons === 27,
  `Melun EXPRESS: ${tousMelun.EXPRESS.prix_euros}€`
);

test(
  'URGENCE calculé',
  tousMelun.URGENCE !== undefined && tousMelun.URGENCE.nb_bons === 35,
  `Melun URGENCE: ${tousMelun.URGENCE.prix_euros}€`
);

test(
  'VL_NORMAL calculé',
  tousMelun.VL_NORMAL !== undefined && tousMelun.VL_NORMAL.nb_bons === 18,
  `Melun VL_NORMAL: ${tousMelun.VL_NORMAL.prix_euros}€`
);

test(
  'VL_EXPRESS calculé',
  tousMelun.VL_EXPRESS !== undefined && tousMelun.VL_EXPRESS.nb_bons === 22,
  `Melun VL_EXPRESS: ${tousMelun.VL_EXPRESS.prix_euros}€`
);

// ===================================================================
// TEST 6: FORMULES DISPONIBLES
// ===================================================================
console.log('\nTEST 6: Formules');
console.log('----------------');

test(
  'Formules contient 5 éléments',
  tarifs.FORMULES.length === 5,
  `Formules: ${tarifs.FORMULES.join(', ')}`
);

test(
  'Tous les noms de formules présents',
  Object.keys(tarifs.NOMS_FORMULES).length === 5,
  'NOMS_FORMULES OK'
);

test(
  'NORMAL existe',
  tarifs.FORMULES.includes('NORMAL'),
  'Formule NORMAL OK'
);

test(
  'EXPRESS existe',
  tarifs.FORMULES.includes('EXPRESS'),
  'Formule EXPRESS OK'
);

test(
  'URGENCE existe',
  tarifs.FORMULES.includes('URGENCE'),
  'Formule URGENCE OK'
);

test(
  'VL_NORMAL existe',
  tarifs.FORMULES.includes('VL_NORMAL'),
  'Formule VL_NORMAL OK'
);

test(
  'VL_EXPRESS existe',
  tarifs.FORMULES.includes('VL_EXPRESS'),
  'Formule VL_EXPRESS OK'
);

// ===================================================================
// TEST 7: DONNÉES COMPLÈTES
// ===================================================================
console.log('\nTEST 7: Données');
console.log('---------------');

test(
  'Tarifs contient au moins 80 villes',
  tarifs.TARIFS_BONS.length >= 80,
  `Villes: ${tarifs.TARIFS_BONS.length}`
);

test(
  'Paris 1er présent',
  tarifs.TARIFS_BONS.some(t => t.cp === '75001' && t.ville === 'Paris 1er'),
  'Paris 1er trouvé'
);

test(
  'Versailles présent',
  tarifs.TARIFS_BONS.some(t => t.ville === 'Versailles'),
  'Versailles trouvé'
);

test(
  'Montmorency présent',
  tarifs.TARIFS_BONS.some(t => t.villa === 'Montmorency' || t.villa === 'Montreuil'),
  'Montreuil trouvé'
);

// ===================================================================
// TEST 8: CONVERSION BONS -> EUROS
// ===================================================================
console.log('\nTEST 8: Conversion');
console.log('------------------');

test(
  'PRIX_PAR_BON = 5.5',
  tarifs.PRIX_PAR_BON === 5.5,
  `Prix par bon: ${tarifs.PRIX_PAR_BON}`
);

test(
  'Conversion: 10 bons = 55€',
  Math.round(10 * tarifs.PRIX_PAR_BON * 100) / 100 === 55,
  '10 × 5.5 = 55'
);

test(
  'Conversion: 27 bons = 148.5€',
  Math.round(27 * tarifs.PRIX_PAR_BON * 100) / 100 === 148.5,
  '27 × 5.5 = 148.5'
);

test(
  'Conversion: 11 bons = 60.5€',
  Math.round(11 * tarifs.PRIX_PAR_BON * 100) / 100 === 60.5,
  '11 × 5.5 = 60.5'
);

// ===================================================================
// TEST 9: RECHERCHE PAR NOM
// ===================================================================
console.log('\nTEST 9: Recherche par nom');
console.log('------------------------');

const parisByName = tarifs.getTarifParNom('Paris 1er');
test(
  'getTarifParNom("Paris 1er")',
  parisByName !== undefined && parisByName.cp === '75001',
  `CP: ${parisByName?.cp}`
);

const melunByName = tarifs.getTarifParNom('Melun');
test(
  'getTarifParNom("Melun")',
  melunByName !== undefined && melunByName.cp === '77000',
  `CP: ${melunByName?.cp}`
);

// ===================================================================
// TEST 10: VILLES PAR CP
// ===================================================================
console.log('\nTEST 10: Villes par CP');
console.log('---------------------');

const villesParis = tarifs.getVillesParCP('75');
test(
  'Villes CP 75 = 20 arrondissements',
  villesParis.length === 20,
  `Arrondissements: ${villesParis.length}`
);

const villesSeineMarne = tarifs.getVillesParCP('77');
test(
  'Villes CP 77 > 10',
  villesSeineMarne.length > 10,
  `Villes trouvées: ${villesSeineMarne.length}`
);

// ===================================================================
// TEST 11: GESTION D'ERREURS
// ===================================================================
console.log('\nTEST 11: Gestion d\'erreurs');
console.log('---------------------------');

let errorCaught = false;
try {
  tarifs.calculerPrix('99999', 'Inexistant', 'EXPRESS');
} catch (e) {
  errorCaught = true;
}
test(
  'Erreur levée pour ville inexistante',
  errorCaught,
  'Exception correctement levée'
);

// ===================================================================
// TEST 12: FORMATAGE
// ===================================================================
console.log('\nTEST 12: Formatage');
console.log('------------------');

const formatted1 = tarifs.formaterPrix(148.5, 27);
test(
  'Formatage avec bons',
  formatted1 === '27 bons = 148,50€',
  `Résultat: "${formatted1}"`
);

const formatted2 = tarifs.formaterPrix(148.5);
test(
  'Formatage sans bons',
  formatted2 === '148,50€',
  `Résultat: "${formatted2}"`
);

// ===================================================================
// RÉSUMÉ
// ===================================================================
console.log('\n==========================================');
console.log('✅ TOUS LES TESTS RÉUSSIS');
console.log('==========================================');
console.log(`
Statistiques:
  - Villes: ${tarifs.TARIFS_BONS.length}
  - Formules: ${tarifs.FORMULES.length}
  - Exemples obligatoires: ✓ Validés
  
Exemple 1 (Melun + EXPRESS):
  Bons: ${melun.nb_bons}
  Prix: ${melun.prix_euros}€
  Calcul: ${melun.calcul}

Exemple 2 (Cachan + URGENCE):
  Bons: ${cachan.nb_bons}
  Prix: ${cachan.prix_euros}€
  Calcul: ${cachan.calcul}

Statut: ✅ PRÊT POUR PRODUCTION
`);

export default { test, melun, cachan, tousMelun, rechercheParisResultat };
