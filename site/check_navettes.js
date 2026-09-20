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
  const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayId = WEEKDAY_IDS[new Date().getDay()];
  console.log("Current todayId:", todayId);
  console.log("Current date:", new Date().toISOString());

  const { data, error } = await supabase.from('navettes').select('id, name, days_of_week, status, point_progress');
  if (error) console.error(error);
  else {
    console.log("Navettes:", data);
  }
}
test();
