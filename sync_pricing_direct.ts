
import { createClient } from '@supabase/supabase-js';
import { TARIFS_BONS } from './src/data/tarifs_idf';

const supabaseUrl = 'https://ldmusfsvedsuvnblgrlf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbXVzZnN2ZWRzdXZuYmxncmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTc5NjUsImV4cCI6MjA4MTg5Mzk2NX0.CGoFXyw7XhvW-49lHWJMKgjj4EiFIWeByRVxayDN7QE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncPricing() {
    console.log(`Starting sync for ${TARIFS_BONS.length} cities...`);

    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 50 to avoid rate limits or huge payloads
    const batchSize = 50;

    for (let i = 0; i < TARIFS_BONS.length; i += batchSize) {
        const batch = TARIFS_BONS.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1}...`);

        const rows = batch.map(t => {
            // Normalisation pour match (logic from generate_sql_sync)
            const normalized = t.ville.toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/-/g, ' ')
                .replace(/^LE /, '')
                .replace(/^LA /, '')
                .replace(/^L'/, '')
                .replace(/^LES /, '')
                .trim();

            // Clean city name for display/storage (keep accents)
            const cityName = t.ville;

            return {
                city_name: cityName,
                zip_code: t.cp,
                price_normal: t.formules.NORMAL,
                price_express: t.formules.EXPRESS,
                price_urgence: t.formules.URGENCE,
                price_vl_normal: t.formules.VL_NORMAL,
                price_vl_express: t.formules.VL_EXPRESS,
                updated_at: new Date().toISOString()
            };
        });


        const { error } = await supabase
            .from('city_pricing')
            .insert(rows);

        if (error) {
            console.error('Error inserting batch:', error);
            errorCount += rows.length;
        } else {
            successCount += rows.length;
        }
    }

    console.log(`Sync complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

syncPricing().catch(console.error);
