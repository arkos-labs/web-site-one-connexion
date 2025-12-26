
import fs from 'fs';
import path from 'path';

// Assuming the file path relative to this script or consistent absolute path
const tariffsPath = path.join(process.cwd(), 'src/data/tarifs_idf.ts');

try {
    const content = fs.readFileSync(tariffsPath, 'utf8');

    // Dirty parsing to extract the array without importing (since importing is hard in this env)
    // We look for 'export const TARIFS_BONS: TarifVille[] = [' and the closing '].map'
    const startMarker = 'export const TARIFS_BONS: TarifVille[] = [';
    const endMarker = '].map(t => ({';

    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not parse TARIFS_BONS array in file.');
    }

    const arrayContent = content.substring(startIndex + startMarker.length, endIndex);

    // Evaluate the array content safely-ish
    // It contains objects like { ville: "Name", cp: "00000", base: 0 },
    // We can wrap it in brackets and eval it, or JSON.parse it if we regex replace keys to quotes.
    // Since it's valid JS object notation (keys might not be quoted), eval is easiest for a script like this.
    const rawData = eval(`[${arrayContent}]`);

    console.log(`Analyzing ${rawData.length} cities...`);

    const issues: string[] = [];
    const cityMap = new Set<string>();
    const cpMap = new Map<string, string>(); // CP -> Ville

    rawData.forEach((item: any, index: number) => {
        // Check missing fields
        if (!item.ville) issues.push(`Index ${index}: Missing 'ville'`);
        if (!item.cp) issues.push(`Index ${index}: Missing 'cp' for ${item.ville}`);
        if (typeof item.base !== 'number') issues.push(`Index ${index}: Invalid 'base' for ${item.ville}`);

        // Check duplicates
        if (cityMap.has(item.ville)) {
            issues.push(`Duplicate city name: ${item.ville}`);
        }
        cityMap.add(item.ville);

        // Check realistic base price
        if (item.base <= 0) {
            issues.push(`Suspicious base price (<=0) for ${item.ville}: ${item.base}`);
        }

        // Check for "Paris" specifically
        if (item.ville.toLowerCase().includes('paris') && item.base !== 3) {
            // Just a heuristic, maybe not an error, but worth noting for the user
            // Actually Paris base is 3, so this is fine.
        }
    });

    // Specific check for key cities user mentioned
    const criticalCities = ['Paris', 'Les Mureaux', 'Versailles', 'Cergy', 'Evry', 'Melun'];
    criticalCities.forEach(city => {
        const found = rawData.find((c: any) => c.ville === city || c.ville.startsWith(city));
        if (!found) {
            issues.push(`Critical city missing: ${city}`);
        } else {
            console.log(`Verified ${city}: Base ${found.base}`);
        }
    });

    if (issues.length > 0) {
        console.log('--- ISSUES FOUND ---');
        issues.forEach(issue => console.error(`[!] ${issue}`));
        console.log(`Total issues: ${issues.length}`);
    } else {
        console.log('--- NO CONFIGURATION ISSUES FOUND ---');
        console.log('All cities appear to have valid names, CPs, and base prices.');
    }

} catch (err) {
    console.error('Error auditing file:', err);
}
