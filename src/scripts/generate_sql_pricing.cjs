const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../tarifs_input.txt');
const inputContent = fs.readFileSync(inputPath, 'utf8');
const inputLines = inputContent.split('\n').filter(l => l.trim() && !l.startsWith('Prix') && !l.startsWith('Villes') && !l.startsWith('Page') && !l.startsWith('Tél') && !l.startsWith('Tarifs'));

const cities = [];

inputLines.forEach(line => {
    const match = line.match(/^(.+?)\s+(\d{5})\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+/);

    if (match) {
        const [_, ville, cp, motoNormal, motoExclu, motoSuper, voitureNormal, voitureExclu, voitureSuper] = match;

        // Escape single quotes in city name (e.g. L'Haÿ-les-Roses -> L''Haÿ-les-Roses)
        const safeVille = ville.trim().replace(/'/g, "''");

        cities.push(`(
    '${safeVille}', 
    '${cp.trim()}', 
    ${motoNormal}, 
    ${motoExclu}, 
    ${motoSuper}, 
    ${voitureNormal}, 
    ${voitureExclu},
    NOW(),
    NOW()
)`);
    }
});

const sql = `
-- MIGRATION DE MISE À JOUR DES TARIFS (Généré automatiquement)
-- Date: ${new Date().toISOString()}

-- 1. Insérer ou Mettre à jour les données
INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    created_at,
    updated_at
)
VALUES 
${cities.join(',\n')}
ON CONFLICT (city_name, zip_code) 
DO UPDATE SET
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();
`;

fs.writeFileSync(path.resolve(__dirname, '../../SUPABASE_UPDATE_PRICING.sql'), sql, 'utf8');
console.log(`✅ Fichier SQL généré : SUPABASE_UPDATE_PRICING.sql (${cities.length} villes)`);
