
import { TARIFS_BONS, getTarifParNom } from './src/data/tarifs_idf';
import fs from 'fs';

const report = [];
report.push(`Starting integrity check on ${TARIFS_BONS.length} cities...`);

let errors = 0;
let success = 0;

TARIFS_BONS.forEach(city => {
    // Test 1: Exact lookup
    const foundExact = getTarifParNom(city.ville);

    // Test 2: Upper case lookup
    const foundUpper = getTarifParNom(city.ville.toUpperCase());

    // Test 3: No accents lookup (if applicable)
    const noAccents = city.ville.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const foundNoAccents = getTarifParNom(noAccents);

    if (!foundExact || !foundUpper || !foundNoAccents) {
        report.push(`[FAIL] Lookup failed for: ${city.ville} (CP: ${city.cp})`);
        if (!foundExact) report.push(`   - Exact match failed`);
        if (!foundUpper) report.push(`   - Uppercase match failed`);
        if (!foundNoAccents) report.push(`   - No-accents match failed (tried: ${noAccents})`);
        errors++;
    } else {
        // Verify price consistency
        // Note: Exported objects in TARIFS_BONS have 'formules', not 'base'.
        if (foundExact.formules.NORMAL !== city.formules.NORMAL) {
            report.push(`[FAIL] Price mismatch for: ${city.ville}. Expected ${city.formules.NORMAL}, got ${foundExact.formules.NORMAL}`);
            errors++;
        } else {
            success++;
        }
    }
});

report.push("---------------------------------------------------");
report.push(`Integrity Check Complete.`);
report.push(`Success: ${success}`);
report.push(`Errors:  ${errors}`);

if (errors === 0) {
    report.push("✅ All cities are correctly configured and locatable.");
} else {
    report.push("❌ Some cities have issues.");
}

fs.writeFileSync('city_check_report.txt', report.join('\n'));
console.log("Report generated.");
