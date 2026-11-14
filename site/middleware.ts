import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Mode démo de l'espace client, en développement uniquement (voir lib/supabase/demo-client.ts) :
  // /dashboard?demo=1 pose le cookie et laisse entrer sans compte, ?demo=0 le retire.
  // En production cette branche n'existe pas : l'accès reste réservé aux comptes connectés.
  if (process.env.NODE_ENV === "development" && request.nextUrl.pathname.startsWith("/dashboard")) {
    const flag = request.nextUrl.searchParams.get("demo");
    if (flag === "1" || flag === "0") {
      const url = request.nextUrl.clone();
      url.searchParams.delete("demo");
      const response = NextResponse.redirect(url);
      if (flag === "1") response.cookies.set("oc_demo", "1", { path: "/" });
      else response.cookies.delete("oc_demo");
      return response;
    }
    if (request.cookies.get("oc_demo")?.value === "1") return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protéger les routes /dashboard et /admin
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // Réserver /admin aux comptes admin
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Rediriger vers dashboard ou admin si déjà connecté
  if (user && (request.nextUrl.pathname === "/connexion" || request.nextUrl.pathname === "/inscription")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/connexion", "/inscription"],
};
