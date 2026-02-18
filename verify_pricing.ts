
import { calculateOneConnexionPriceAsync } from './src/utils/pricingEngineDb';

async function testPricing() {
    try {
        console.log("Testing Paris -> Les Mureaux...");
        const result = await calculateOneConnexionPriceAsync("Paris", "Les Mureaux", 40000, 'NORMAL');
        console.log("Result:", result);
        console.log(`Total Bons: ${result.totalBons}`);
        console.log(`Total Euros: ${result.totalEuros}`);
    } catch (e) {
        console.error("Error:", e);
    }
}

testPricing();
