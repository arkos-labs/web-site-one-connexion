import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCols() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (data && data[0]) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No orders found or error:', error);
    }
}

checkCols();
