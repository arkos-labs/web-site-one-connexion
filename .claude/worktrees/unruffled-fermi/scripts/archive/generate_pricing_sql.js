
import fs from 'node:fs';
import path from 'node:path';

const csvPath = path.join(process.cwd(), 'src', 'data', 'tarifs_coursier.csv');
const outPath = path.join(process.cwd(), 'scripts', 'pricing_migration.sql');

try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    // Skip header
    const dataLines = lines.slice(1);

    let sql = 'INSERT INTO pricing_zones (city, city_slug, postal_code, moto_normal_price, moto_exclu_price, moto_super_price, car_normal_price, car_exclu_price, car_super_price) VALUES\n';

    const values = dataLines.map(line => {
        const parts = line.split(';');
        if (parts.length < 14) return null;

        const city = parts[0].trim().replace(/'/g, "''"); // Escape single quotes
        const postalCode = parts[1].trim();

        // Helper to format price (replace , with .)
        const p = (idx) => {
            const val = parts[idx].trim().replace(',', '.');
            return val === '' ? 'NULL' : val;
        };

        // Indices based on CSV:
        // 0: Ville
        // 1: CP
        // 3: Moto Normal Price
        // 5: Moto Exclu Price
        // 7: Moto Super Price
        // 9: Car Normal Price
        // 11: Car Exclu Price
        // 13: Car Super Price

        const slug = city.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]/g, "-"); // Replace non-alphanum with dash

        return `('${city}', '${slug}', '${postalCode}', ${p(3)}, ${p(5)}, ${p(7)}, ${p(9)}, ${p(11)}, ${p(13)})`;
    }).filter(v => v !== null);

    sql += values.join(',\n') + ';';

    fs.writeFileSync(outPath, sql);
    console.log(`Generated SQL with ${values.length} rows.`);

} catch (err) {
    console.error('Error:', err);
}
