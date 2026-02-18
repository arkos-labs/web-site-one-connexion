
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars from .env if present
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const clientEmail = process.env.CLIENT_EMAIL;
const clientPassword = process.env.CLIENT_PASSWORD;

if (!adminEmail || !adminPassword || !clientEmail || !clientPassword) {
    console.error('Missing ADMIN_EMAIL/ADMIN_PASSWORD or CLIENT_EMAIL/CLIENT_PASSWORD');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
    console.log('Creating Admin User...');
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword
    });

    if (adminError) console.error('Admin Error:', adminError.message);
    else console.log('Admin created (check email for confirmation unless auto-confirm is on):', adminData.user?.id);

    console.log('Creating Client User...');
    const { data: clientData, error: clientError } = await supabase.auth.signUp({
        email: clientEmail,
        password: clientPassword
    });

    if (clientError) console.error('Client Error:', clientError.message);
    else console.log('Client created:', clientData.user?.id);
}

createUsers();
