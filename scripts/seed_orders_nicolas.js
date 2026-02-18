import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbwxhmpjxwmsybpxycog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid3hobXBqeHdtc3licHh5Y29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODkzMzAsImV4cCI6MjA4NjY2NTMzMH0.Cp2b6pU-fFrfwcVY08OQp4ng9tO3mCiX8U8VyCC37bg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const driver = profiles.find(p => p.details?.full_name?.toLowerCase().includes('nicolas cherki'));
    const client = profiles.find(p => p.role === 'client' || p.details?.company === 'Client Premium SAS');

    if (!driver || !client) {
        console.log('Driver or Client not found');
        return;
    }

    const cities = ['Paris', 'Saint-Prix', 'Puteaux', 'Nanterre', 'Boulogne-Billancourt', 'Saint-Denis', 'Montreuil', 'Argenteuil'];
    const statusList = ['delivered']; // We want them in the history likely, or 'picked_up' for active.
    // The user asked to "créer des courses", usually means historical or current.
    // I'll make them 'delivered' so they show up in statistics.

    const orders = [];
    for (let i = 0; i < 15; i++) {
        const pickup = cities[Math.floor(Math.random() * cities.length)];
        const delivery = cities[Math.floor(Math.random() * cities.length)];
        const price = 20 + Math.floor(Math.random() * 80);

        orders.push({
            client_id: client.id,
            driver_id: driver.id,
            pickup_address: `${Math.floor(Math.random() * 100)} Rue de la Paix, ${pickup}`,
            pickup_city: pickup,
            pickup_postal_code: '75000',
            delivery_address: `${Math.floor(Math.random() * 100)} Avenue des Champs, ${delivery}`,
            delivery_city: delivery,
            delivery_postal_code: '75000',
            status: 'delivered',
            vehicle_type: 'moto',
            service_level: 'normal',
            price_ht: price,
            price_ttc: price * 1.2,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    console.log(`Attempting to insert ${orders.length} orders...`);
    const { data, error } = await supabase.from('orders').insert(orders).select();
    if (error) {
        console.error('INSERT ERROR:', JSON.stringify(error, null, 2));
    } else {
        console.log(`Success! Inserted ${data.length} orders.`);
    }
}

seed();
