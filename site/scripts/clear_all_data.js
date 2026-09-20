#!/usr/bin/env node

/**
 * Script pour supprimer toutes les données (clients, commandes, navettes, chauffeurs)
 * ATTENTION: Cette action est IRRÉVERSIBLE
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erreur: Variables d'environnement manquantes");
  console.error("   Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllData() {
  try {
    console.log("🗑️  Suppression des données en cours...\n");

    // 1. Supprimer les navette_executions
    console.log("Suppression des navette_executions...");
    const { error: error1 } = await supabase.from("navette_executions").delete().neq("id", "");
    if (error1) console.error("  Erreur:", error1.message);
    else console.log("  ✓ Suppression réussie");

    // 2. Supprimer les navette_stops
    console.log("Suppression des navette_stops...");
    const { error: error2 } = await supabase.from("navette_stops").delete().neq("id", "");
    if (error2) console.error("  Erreur:", error2.message);
    else console.log("  ✓ Suppression réussie");

    // 3. Supprimer les order_stops
    console.log("Suppression des order_stops...");
    const { error: error3 } = await supabase.from("order_stops").delete().neq("id", "");
    if (error3) console.error("  Erreur:", error3.message);
    else console.log("  ✓ Suppression réussie");

    // 4. Supprimer les navettes
    console.log("Suppression des navettes...");
    const { error: error4 } = await supabase.from("navettes").delete().neq("id", "");
    if (error4) console.error("  Erreur:", error4.message);
    else console.log("  ✓ Suppression réussie");

    // 5. Supprimer les orders
    console.log("Suppression des orders...");
    const { error: error5 } = await supabase.from("orders").delete().neq("id", "");
    if (error5) console.error("  Erreur:", error5.message);
    else console.log("  ✓ Suppression réussie");

    // 6. Supprimer les clients
    console.log("Suppression des clients...");
    const { error: error6 } = await supabase.from("clients").delete().neq("id", "");
    if (error6) console.error("  Erreur:", error6.message);
    else console.log("  ✓ Suppression réussie");

    // 7. Supprimer les profils non-admin (chauffeurs)
    console.log("Suppression des chauffeurs (profils non-admin)...");
    const { error: error7 } = await supabase
      .from("profiles")
      .delete()
      .or("role.neq.admin,role.is.null");
    if (error7) console.error("  Erreur:", error7.message);
    else console.log("  ✓ Suppression réussie");

    // Afficher le résumé
    console.log("\n📊 Résumé:");
    const { data: clientsCount } = await supabase.from("clients").select("id", { count: "exact", head: true });
    const { data: ordersCount } = await supabase.from("orders").select("id", { count: "exact", head: true });
    const { data: navettesCount } = await supabase.from("navettes").select("id", { count: "exact", head: true });
    const { data: profilesCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { data: adminCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    console.log(`  Clients restants: ${clientsCount?.length || 0}`);
    console.log(`  Commandes restantes: ${ordersCount?.length || 0}`);
    console.log(`  Navettes restantes: ${navettesCount?.length || 0}`);
    console.log(`  Chauffeurs restants: ${(profilesCount?.length || 0) - (adminCount?.length || 0)}`);
    console.log(`  Administrateurs: ${adminCount?.length || 0}`);

    console.log("\n✅ Suppression terminée avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    process.exit(1);
  }
}

clearAllData();
