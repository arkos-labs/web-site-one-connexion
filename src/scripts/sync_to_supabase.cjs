const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load .env from root

async function main() {
    console.log("🛠️ Initialisation de la synchronisation...");

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    // On essaie de trouver une clé service role (souvent pas dans .env client, mais sait-on jamais)
    // Sinon on utilise la clé anon publique (attention aux permissions RLS)
    const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("❌ Variables d'environnement manquantes.");
        console.error("   VITE_SUPABASE_URL:", SUPABASE_URL);
        console.error("   VITE_SUPABASE_KEY (masked):", SUPABASE_KEY ? "********" : "MANQUANT");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });

    const inputPath = path.resolve(__dirname, '../tarifs_input.txt');
    if (!fs.existsSync(inputPath)) {
        console.error("❌ Fichier tarifs_input.txt introuvable");
        process.exit(1);
    }

    const inputContent = fs.readFileSync(inputPath, 'utf8');
    const inputLines = inputContent.split('\n').filter(l => l.trim() && !l.startsWith('Prix') && !l.startsWith('Villes') && !l.startsWith('Page') && !l.startsWith('Tél') && !l.startsWith('Tarifs'));

    const citiesToUpsert = [];

    inputLines.forEach(line => {
        // Regex adaptée au format reçu
        // Alfortville 94140 6 30,00 10 50,00 ...
        const match = line.match(/^(.+?)\s+(\d{5})\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+/);

        if (match) {
            const [_, ville, cp, motoNormal, motoExclu, motoSuper, voitureNormal, voitureExclu, voitureSuper] = match;

            citiesToUpsert.push({
                city_name: ville.trim(),
                zip_code: cp.trim(),
                price_normal: parseInt(motoNormal),
                price_express: parseInt(motoExclu),
                price_urgence: parseInt(motoSuper),
                price_vl_normal: parseInt(voitureNormal),
                price_vl_express: parseInt(voitureExclu),
                updated_at: new Date().toISOString()
            });
        }
    });

    console.log(`📋 ${citiesToUpsert.length} villes à traiter.`);
    console.log(`🚀 Envoi vers Supabase (${SUPABASE_URL})...`);

    let success = 0;
    let errors = 0;

    // Traitement séquentiel pour debug
    for (const city of citiesToUpsert) {
        // Logique de recherche existant pour UPDATE ou INSERT
        const { data: existing } = await supabase
            .from('city_pricing')
            .select('id')
            .eq('zip_code', city.zip_code)
            .ilike('city_name', city.city_name)
            .maybeSingle();

        let op;
        if (existing) {
            op = supabase.from('city_pricing').update(city).eq('id', existing.id);
        } else {
            op = supabase.from('city_pricing').insert(city);
        }

        const { error } = await op;

        if (error) {
            console.error(`❌ Erreur ${city.city_name} (${city.zip_code}): ${error.message}`);
            errors++;
        } else {
            success++;
            // Petit feedback tous les 10 items
            if (success % 20 === 0) process.stdout.write('.');
        }
    }

    console.log("\n");
    console.log(`🏁 Résultat: ${success} succès, ${errors} erreurs.`);

    if (errors > 0) {
        console.warn("⚠️  Attention: Si les erreurs sont des '401 Unauthorized', cela signifie que la clé publique (ANON) n'a pas le droit d'écrire dans la table 'city_pricing'.");
        console.warn("   -> Solution: Ajoutez une Policy RLS 'Enable insert/update for anon' temporairement OU utilisez la clé SERVICE_ROLE.");
    }
}

main();
