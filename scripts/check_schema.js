import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbwxhmpjxwmsybpxycog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid3hobXBqeHdtc3licHh5Y29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODkzMzAsImV4cCI6MjA4NjY2NTMzMH0.Cp2b6pU-fFrfwcVY08OQp4ng9tO3mCiX8U8VyCC37bg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log('Profiles accessed:', !error);
    if (error) console.log('Profiles error:', error.message);

    const { data: oData, error: oError } = await supabase.from('orders').select('*').limit(1);
    console.log('Orders accessed:', !oError);
    if (oError) console.log('Orders error:', oError.message);
}

checkSchema();
