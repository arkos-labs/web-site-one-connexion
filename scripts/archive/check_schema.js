import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    const { data: _data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log('Profiles accessed:', !error);
    if (error) console.log('Profiles error:', error.message);

    const { data: _oData, error: oError } = await supabase.from('orders').select('*').limit(1);
    console.log('Orders accessed:', !oError);
    if (oError) console.log('Orders error:', oError.message);
}

checkSchema();
