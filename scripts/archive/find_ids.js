import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findDriver() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    const driver = data.find(p =>
        p.details?.full_name?.toLowerCase().includes('nicolas cherki') ||
        p.email?.toLowerCase().includes('nicolas cherki')
    );

    const clients = data.filter(p => (p.role === 'client' || !p.role) && p.id !== driver?.id);

    console.log('DATA_START');
    console.log(JSON.stringify({
        driverId: driver?.id,
        clients: clients.map(c => ({ id: c.id, name: c.details?.company || c.details?.full_name || c.email }))
    }, null, 2));
    console.log('DATA_END');
}

findDriver();
