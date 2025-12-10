/**
 * EXEMPLES D'UTILISATION DU NOUVEAU MOTEUR TARIFAIRE
 * ===================================================
 * 
 * Ce fichier montre comment utiliser le nouveau moteur tarifaire
 * One Connexion avec des exemples concrets.
 */

import {
    calculateOneConnexionPrice,
    calculerToutesLesFormules,
    formaterResultat,
    type FormuleNew
} from '../utils/pricingEngineNew';

// ============================================================================
// EXEMPLE 1 : Paris → Melun (47,3 km) - NORMAL
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 1 : Paris → Melun (47,3 km) - NORMAL');
console.log('='.repeat(70));

const exemple1 = calculateOneConnexionPrice('Paris', 'Melun', 47300, 'NORMAL');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple1, null, 2));

console.log('\nRésultat formaté :');
console.log(formaterResultat(exemple1));

console.log('\nExplication :');
console.log('- Prise en charge Paris NORMAL : 8 bons');
console.log('- Supplément kilométrique : 0 bon (Paris impliqué)');
console.log('- Total : 8 bons × 5,5€ = 44€');

// ============================================================================
// EXEMPLE 2 : Melun → Paris (47,3 km) - EXPRESS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 2 : Melun → Paris (47,3 km) - EXPRESS');
console.log('='.repeat(70));

const exemple2 = calculateOneConnexionPrice('Melun', 'Paris', 47300, 'EXPRESS');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple2, null, 2));

console.log('\nRésultat formaté :');
console.log(formaterResultat(exemple2));

console.log('\nExplication :');
console.log('- Prise en charge Melun EXPRESS : 27 bons');
console.log('- Supplément kilométrique : 0 bon (Paris impliqué)');
console.log('- Total : 27 bons × 5,5€ = 148,5€');

// ============================================================================
// EXEMPLE 3 : Melun → Versailles (47,3 km) - NORMAL (AVEC SUPPLÉMENT)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 3 : Melun → Versailles (47,3 km) - NORMAL');
console.log('='.repeat(70));

const exemple3 = calculateOneConnexionPrice('Melun', 'Versailles', 47300, 'NORMAL');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple3, null, 2));

console.log('\nRésultat formaté :');
console.log(formaterResultat(exemple3));

console.log('\nExplication :');
console.log('- Prise en charge Melun NORMAL : 25 bons');
console.log('- Supplément kilométrique : 47,3 km × 0,1 = 4,73 bons');
console.log('  (appliqué car banlieue → banlieue)');
console.log('- Total : (25 + 4,73) bons × 5,5€ = 163,52€');

// ============================================================================
// EXEMPLE 4 : Clichy → Montreuil (10 km) - URGENCE (AVEC SUPPLÉMENT)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 4 : Clichy → Montreuil (10 km) - URGENCE');
console.log('='.repeat(70));

const exemple4 = calculateOneConnexionPrice('Clichy', 'Montreuil', 10000, 'URGENCE');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple4, null, 2));

console.log('\nRésultat formaté :');
console.log(formaterResultat(exemple4));

console.log('\nExplication :');
console.log('- Prise en charge Clichy URGENCE : 19 bons');
console.log('- Supplément kilométrique : 10 km × 0,1 = 1 bon');
console.log('  (appliqué car banlieue → banlieue)');
console.log('- Total : (19 + 1) bons × 5,5€ = 110€');

// ============================================================================
// EXEMPLE 5 : Paris → Versailles (18 km) - VL_NORMAL
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 5 : Paris → Versailles (18 km) - VL_NORMAL');
console.log('='.repeat(70));

const exemple5 = calculateOneConnexionPrice('Paris', 'Versailles', 18000, 'VL_NORMAL');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple5, null, 2));

console.log('\nRésultat formaté :');
console.log(formaterResultat(exemple5));

console.log('\nExplication :');
console.log('- Prise en charge Paris VL_NORMAL : 5 bons');
console.log('- Supplément kilométrique : 0 bon (Paris impliqué)');
console.log('- Total : 5 bons × 5,5€ = 27,5€');

// ============================================================================
// EXEMPLE 6 : Comparaison de toutes les formules (Melun → Versailles)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 6 : Comparaison de toutes les formules');
console.log('Melun → Versailles (47,3 km)');
console.log('='.repeat(70));

const toutesFormules = calculerToutesLesFormules('Melun', 'Versailles', 47300);

console.log('\nTableau comparatif :');
console.log('┌─────────────┬────────────────┬────────────┬────────────┬─────────────┐');
console.log('│   Formule   │ Prise en charge│ Supplément │ Total bons │ Total euros │');
console.log('├─────────────┼────────────────┼────────────┼────────────┼─────────────┤');

const formules: FormuleNew[] = ['NORMAL', 'EXPRESS', 'URGENCE', 'VL_NORMAL', 'VL_EXPRESS'];

for (const formule of formules) {
    const result = toutesFormules[formule];
    const formuleStr = formule.padEnd(11);
    const priseEnChargeStr = `${result.priseEnCharge} bons`.padEnd(14);
    const supplementStr = `${result.supplement.toFixed(2)} bons`.padEnd(10);
    const totalBonsStr = `${result.totalBons.toFixed(2)}`.padEnd(10);
    const totalEurosStr = `${result.totalEuros.toFixed(2)}€`.padEnd(11);

    console.log(`│ ${formuleStr} │ ${priseEnChargeStr} │ ${supplementStr} │ ${totalBonsStr} │ ${totalEurosStr} │`);
}

console.log('└─────────────┴────────────────┴────────────┴────────────┴─────────────┘');

console.log('\nObservations :');
console.log('- Le supplément est identique pour toutes les formules (4,73 bons)');
console.log('- La différence de prix vient uniquement de la prise en charge');
console.log('- VL_NORMAL et VL_EXPRESS sont moins chers (véhicule léger)');

// ============================================================================
// EXEMPLE 7 : Distance très courte (1 km)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 7 : Distance très courte - Clichy → Levallois (1 km)');
console.log('='.repeat(70));

const exemple7 = calculateOneConnexionPrice('Clichy', 'Levallois-Perret', 1000, 'NORMAL');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple7, null, 2));

console.log('\nExplication :');
console.log('- Prise en charge Clichy NORMAL : 13 bons');
console.log('- Supplément kilométrique : 1 km × 0,1 = 0,1 bon');
console.log('- Total : (13 + 0,1) bons × 5,5€ = 72,05€');
console.log('\nRemarque : Même pour 1 km, la prise en charge est toujours facturée.');

// ============================================================================
// EXEMPLE 8 : Distance nulle (retrait et livraison au même endroit)
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EXEMPLE 8 : Distance nulle - Melun → Melun (0 km)');
console.log('='.repeat(70));

const exemple8 = calculateOneConnexionPrice('Melun', 'Melun', 0, 'NORMAL');

console.log('\nRésultat brut :');
console.log(JSON.stringify(exemple8, null, 2));

console.log('\nExplication :');
console.log('- Prise en charge Melun NORMAL : 25 bons');
console.log('- Supplément kilométrique : 0 km × 0,1 = 0 bon');
console.log('- Total : 25 bons × 5,5€ = 137,5€');
console.log('\nRemarque : La prise en charge est toujours facturée, même si la distance est nulle.');

// ============================================================================
// RÉSUMÉ DES RÈGLES
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('RÉSUMÉ DES RÈGLES TARIFAIRES');
console.log('='.repeat(70));

console.log(`
1. PRISE EN CHARGE (OBLIGATOIRE)
   - Dépend de la ville de DÉPART et de la formule
   - Toujours facturée, dans tous les cas
   - 5 formules : NORMAL, EXPRESS, URGENCE, VL_NORMAL, VL_EXPRESS

2. SUPPLÉMENT KILOMÉTRIQUE
   - Appliqué UNIQUEMENT si banlieue → banlieue
   - Formule : distance_km × 0,1 bon
   - PAS appliqué si Paris est impliqué (départ OU arrivée)

3. CALCUL FINAL
   - total_bons = prise_en_charge + supplément
   - total_euros = total_bons × 5,5€

4. EXEMPLES
   - Paris → Ville : prise en charge uniquement
   - Ville → Paris : prise en charge uniquement
   - Ville → Ville : prise en charge + supplément kilométrique

5. IMPORTANT
   - Le trajet chauffeur vide n'est JAMAIS facturé
   - La distance utilisée est celle entre retrait et livraison
   - Distance obtenue via LocationIQ Distance Matrix
`);

console.log('='.repeat(70));
console.log('FIN DES EXEMPLES');
console.log('='.repeat(70) + '\n');
