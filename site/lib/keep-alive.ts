import { createClient } from "@supabase/supabase-js";

// Petite requête qui compte comme activité : Supabase (offre gratuite) met en pause
// un projet resté 7 jours sans activité.
export async function pingDatabase() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error) throw new Error(`Keep-alive Supabase: ${error.message}`);
}

export const KEEP_ALIVE_CALLBACK = "keepalive:ping";
