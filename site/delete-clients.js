const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, role, full_name');
  if (error) { console.error(error); return; }
  
  const toDelete = profiles.filter(p => p.role === 'client' && p.id !== '98d70737-a30d-46c8-a299-924c64ed45fa');
  console.log('Found', toDelete.length, 'clients to delete');
  
  for (const p of toDelete) {
    const { error: delErr } = await supabase.from('profiles').delete().eq('id', p.id);
    if (delErr) { console.error('Failed to delete', p.id, delErr); }
    else { console.log('Deleted', p.id, p.full_name); }
  }
  
  console.log('Done.');
}
run();
