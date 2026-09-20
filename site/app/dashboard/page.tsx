import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@supabase/supabase-js";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Lier les anciennes commandes (Guest) au nouveau compte
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await adminSupabase
        .from("orders")
        .update({ user_id: user.id })
        .eq("contact_email", user.email)
        .is("user_id", null);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Si admin, rediriger vers /admin
    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  redirect("/dashboard/commander");
}
