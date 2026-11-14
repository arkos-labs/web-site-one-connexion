import { createBrowserClient } from "@supabase/ssr";
import { createDemoClient, isDemoMode } from "./demo-client";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    // Mode démo (développement uniquement, voir demo-client.ts) : fausses données, aucune requête vers la vraie base.
    client = isDemoMode()
      ? createDemoClient()
      : createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
  }
  return client;
}
