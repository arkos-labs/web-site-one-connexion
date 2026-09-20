const { createClient } = require('C:/Users/CHERK/OneDrive/Desktop/One Connexion/one-connexion-v1/site/node_modules/@supabase/supabase-js');
const dotenv = require('C:/Users/CHERK/OneDrive/Desktop/One Connexion/one-connexion-v1/site/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.resolve('C:/Users/CHERK/OneDrive/Desktop/One Connexion/one-connexion-v1/site/.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkNavettes() {
  const { data, error } = await supabase.from('navettes').select('*');
  console.log(JSON.stringify(data, null, 2));
}

checkNavettes();
