import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log("Checking connectivity...");
    const { data: countCheck, error: cError } = await supabase.from('orders').select('id', { count: 'exact', head: true });
    if (cError) {
        console.error("Connect error:", cError);
        return;
    }
    console.log("Connected. Existing orders count:", countCheck?.length || 0);

    const { data: drivers } = await supabase.from('profiles').select('id, details').eq('role', 'courier').limit(1);
    if (!drivers || drivers.length === 0) {
        console.error("No driver found.");
        return;
    }
    const driverId = drivers[0].id;
    const driverName = drivers[0].details?.full_name || "Driver";
    console.log(`Driver found: ${driverName} (${driverId})`);

    const { data: clients } = await supabase.from('profiles').select('id').eq('role', 'client').limit(1);
    const clientId = clients?.[0]?.id || null;

    const cities = [
        { name: "Paris", zip: "75001" },
        { name: "Lyon", zip: "69001" },
        { name: "Marseille", zip: "13001" },
        { name: "Bordeaux", zip: "33000" },
        { name: "Lille", zip: "59000" }
    ];

    const orders = [];
    for (let m = 0; m < 5; m++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - m);

        // 5 orders per month
        for (let i = 0; i < 5; i++) {
            const orderDate = new Date(monthDate);
            orderDate.setDate(1 + i * 5);
            orderDate.setHours(10, 0, 0, 0);

            const p = cities[Math.floor(Math.random() * cities.length)];
            const d = cities[Math.floor(Math.random() * cities.length)];
            const price = 25 + Math.floor(Math.random() * 30);

            orders.push({
                client_id: clientId,
                driver_id: driverId,
                status: 'delivered',
                pickup_address: `Rue de la Paix ${i}`,
                pickup_city: p.name,
                pickup_postal_code: p.zip,
                pickup_name: "Expéditeur Test",
                delivery_address: `Boulevard du Test ${i}`,
                delivery_city: d.name,
                delivery_postal_code: d.zip,
                delivery_name: "Destinataire Test",
                vehicle_type: 'moto',
                service_level: 'normal',
                price_ht: price,
                scheduled_at: orderDate.toISOString(),
                picked_up_at: new Date(orderDate.getTime() + 15 * 60000).toISOString(),
                updated_at: new Date(orderDate.getTime() + 45 * 60000).toISOString(),
                created_at: orderDate.toISOString()
            });
        }
    }

    console.log(`Inserting ${orders.length} orders...`);
    // Insert in batches of 5 to avoid potential size limits or timeout during debug
    for (let i = 0; i < orders.length; i += 5) {
        const batch = orders.slice(i, i + 5);
        const { error: insError } = await supabase.from('orders').insert(batch);
        if (insError) {
            console.error(`Batch ${i / 5 + 1} Error:`, insError);
            break;
        } else {
            console.log(`Batch ${i / 5 + 1} OK`);
        }
    }

    console.log("Seeding complete check history on Admin page.");
}

seed();
