import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbwxhmpjxwmsybpxycog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid3hobXBqeHdtc3licHh5Y29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODkzMzAsImV4cCI6MjA4NjY2NTMzMH0.Cp2b6pU-fFrfwcVY08OQp4ng9tO3mCiX8U8VyCC37bg';

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
