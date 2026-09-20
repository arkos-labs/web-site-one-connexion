const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: env.NEXT_PUBLIC_DEV_ADMIN_EMAIL,
    password: env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD
  });
  if (authErr) { console.error('Auth err', authErr); return; }
  
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0] || {}));
}
test();
