
import { calculateOneConnexionPriceAsync, trouverVilleDansBase } from './src/utils/pricingEngineDb';

// Mock Supabase environment for local TS execution if needed, 
// OR just rely on the existing configuration if it works.
// However, tsx might trip over '@/' aliases if tsconfig-paths not registered.
// So we will rewrite imports temporarily in memory or just use relative paths in the test file copy.

// Actually, let's just use the functions.
// If aliases are failing, we might need to register them or simply assume the user tests in browser.
// But to script it, I can copy the necessary logic here to be self-contained or use 'tsconfig-paths/register'

async function testPricing() {
    try {
        console.log("Testing Paris -> Les Mureaux...");
        // Emulate what StepFormula does:
        // calculateOneConnexionPriceAsync(pickup, delivery, distance, formula)

        // Let's first check if we find the cities
        console.log("Looking up 'Paris'...");
        const paris = await trouverVilleDansBase("Paris");
        console.log("Paris found:", paris);

        console.log("Looking up 'Les Mureaux'...");
        const mureaux = await trouverVilleDansBase("Les Mureaux");
        console.log("Les Mureaux found:", mureaux);

        if (paris && mureaux) {
            const result = await calculateOneConnexionPriceAsync("Paris", "Les Mureaux", 40000, 'NORMAL');
            console.log("--- FINAL CALCULATION ---");
            console.log(`Depart: ${result.villeDepart}`);
            console.log(`Arrivee: ${result.villeArrivee}`);
            console.log(`Prise En Charge (Bons): ${result.priseEnCharge}`);
            console.log(`Total Bons: ${result.totalBons}`);
            console.log(`Total Euros: ${result.totalEuros}`);
        } else {
            console.log("Could not find one of the cities.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testPricing();
