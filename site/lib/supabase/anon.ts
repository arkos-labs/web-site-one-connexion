import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Client « visiteur » : jamais de session (ni lue, ni enregistrée, ni rafraîchie).
// Sert aux commandes passées sans compte, pour qu'elles partent toujours en rôle « anon »,
// même si le navigateur garde un jeton d'un autre compte.
let anon: SupabaseClient | null = null;

export function createAnonClient(): SupabaseClient {
  if (!anon) {
    anon = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "oc-anon" },
    });
  }
  return anon;
}
