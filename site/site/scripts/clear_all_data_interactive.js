#!/usr/bin/env node

/**
 * Script interactif pour supprimer toutes les données
 * Demande la clé de service Supabase si elle n'est pas définie
 */

import { createClient } from "@supabase/supabase-js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("🗑️  Script de suppression des données\n");

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.log("❌ NEXT_PUBLIC_SUPABASE_URL n'est pas défini");
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.log("⚠️  SUPABASE_SERVICE_ROLE_KEY n'est pas défini");
    console.log("\nPour obtenir la clé de service:");
    console.log("1. Allez sur https://app.supabase.com");
    console.log("2. Sélectionnez votre projet");
    console.log("3. Allez dans Settings > API");
    console.log("4. Copiez la clé 'service_role' (secret)\n");

    serviceRoleKey = await prompt("Entrez la clé de service Supabase: ");

    if (!serviceRoleKey) {
      console.log("❌ Clé de service requise");
      rl.close();
      process.exit(1);
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Confirmation finale
  console.log("\n⚠️  ATTENTION: Cette action est IRRÉVERSIBLE");
  console.log("Vous allez supprimer:");
  console.log("  - Tous les clients");
  console.log("  - Toutes les commandes");
  console.log("  - Toutes les navettes");
  console.log("  - Tous les chauffeurs (sauf admin)\n");

  const confirmation = await prompt("Tapez 'OUI' pour continuer: ");

  if (confirmation.toUpperCase() !== "OUI") {
    console.log("❌ Suppression annulée");
    rl.close();
    process.exit(0);
  }

  try {
    console.log("\n🗑️  Suppression en cours...\n");

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
      process.stdout.write(`  Suppression de ${table}... `);
      const { error } = await supabase.from(table).delete().neq("id", "");
      if (error) {
        console.log(`❌ Erreur: ${error.message}`);
      } else {
        console.log("✓");
      }
    }

    process.stdout.write("  Suppression des chauffeurs (profils non-admin)... ");
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .or("role.neq.admin,role.is.null");

    if (profileError) {
      console.log(`❌ Erreur: ${profileError.message}`);
    } else {
      console.log("✓");
    }

    // Récupérer le résumé
    console.log("\n📊 Résumé final:");
    const results = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("navettes").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    ]);

    const [clientsResult, ordersResult, navettesResult, profilesResult, adminResult] = results;

    console.log(`  Clients: ${clientsResult.count || 0}`);
    console.log(`  Commandes: ${ordersResult.count || 0}`);
    console.log(`  Navettes: ${navettesResult.count || 0}`);
    console.log(`  Chauffeurs: ${(profilesResult.count || 0) - (adminResult.count || 0)}`);
    console.log(`  Administrateurs: ${adminResult.count || 0}`);

    console.log("\n✅ Suppression terminée avec succès!");
    rl.close();
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    rl.close();
    process.exit(1);
  }
}

main();
