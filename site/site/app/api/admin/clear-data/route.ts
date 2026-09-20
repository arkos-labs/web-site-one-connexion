import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Vérifier que c'est une requête autorisée (vérifier le header ou le contexte)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.includes("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Créer un client avec la clé de service (disponible côté serveur)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    console.log("🗑️  Suppression des données en cours...");

    // Supprimer dans l'ordre des dépendances
    const tables = [
      "navette_executions",
      "navette_stops",
      "order_stops",
      "navettes",
      "orders",
      "clients",
    ];

    for (const table of tables) {
      console.log(`Suppression de ${table}...`);
      const { error } = await supabase.from(table).delete().neq("id", "");
      if (error) {
        console.error(`Erreur lors de la suppression de ${table}:`, error.message);
        return NextResponse.json(
          { error: `Erreur lors de la suppression de ${table}` },
          { status: 500 }
        );
      }
    }

    // Supprimer les profils non-admin
    console.log("Suppression des chauffeurs (profils non-admin)...");
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .or("role.neq.admin,role.is.null");

    if (profileError) {
      console.error("Erreur lors de la suppression des profils:", profileError.message);
      return NextResponse.json(
        { error: "Erreur lors de la suppression des profils" },
        { status: 500 }
      );
    }

    // Récupérer le résumé
    const [{ count: clientsCount }, { count: ordersCount }, { count: navettesCount }, { count: profilesCount }] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("navettes").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const { count: adminCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    const summary = {
      clients: clientsCount || 0,
      orders: ordersCount || 0,
      navettes: navettesCount || 0,
      chauffeurs: (profilesCount || 0) - (adminCount || 0),
      admins: adminCount || 0,
    };

    console.log("✅ Suppression terminée:", summary);

    return NextResponse.json({
      success: true,
      message: "Suppression réussie",
      summary,
    });
  } catch (error: any) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}
