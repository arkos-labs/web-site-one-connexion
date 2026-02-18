
import { TARIFS_BONS } from './src/data/tarifs_idf';

// Generates SQL to insert/update cities in Supabase
console.log(`-- Syncing ${TARIFS_BONS.length} cities to Supabase`);

TARIFS_BONS.forEach(t => {
    // Normalisation pour match (doublon check)
    const normalized = t.ville.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/-/g, ' ')
        .replace(/^LE /, '')
        .replace(/^LA /, '')
        .replace(/^L'/, '')
        .replace(/^LES /, '')
        .trim();

    const sql = `
INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    '${t.ville.replace(/'/g, "''")}',
    '${t.cp}',
    ${t.formules.NORMAL},
    ${t.formules.EXPRESS},
    ${t.formules.URGENCE},
    ${t.formules.VL_NORMAL},
    ${t.formules.VL_EXPRESS},
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();
`;
    console.log(sql);
});
