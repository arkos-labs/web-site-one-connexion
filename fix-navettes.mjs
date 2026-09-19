import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sbuvhevlvuwepoqxzkmn.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY - using public key will not work for admin operations");
  console.log("Try running with: SUPABASE_SERVICE_ROLE_KEY=your_key node fix-navettes.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNavettes() {
  try {
    console.log("🔍 Finding navettes that need cleanup...");

    // Find navettes that are marked as completed/terminated but have no driver assigned
    const { data: problematicNavettes, error: selectError } = await supabase
      .from("navettes")
      .select("id, name, status, driver_id, point_progress")
      .is("driver_id", null)
      .or(`status.in.("terminee","delivered","livree"),point_progress->>last_completed_at.not.is.null`);

    if (selectError) {
      console.error("❌ Error selecting navettes:", selectError);
      process.exit(1);
    }

    console.log(`Found ${problematicNavettes.length} navettes to clean up`);

    if (problematicNavettes.length === 0) {
      console.log("✅ No problematic navettes found!");
      return;
    }

    // Update them to reset to active status and clear completion data
    const { data: updated, error: updateError } = await supabase
      .from("navettes")
      .update({
        status: "active",
        point_progress: {},
        picked_up_at: null,
        delivered_at: null,
        delivery_recipient: null,
        delivery_department: null,
        delivery_comment: null,
        delivery_photo_url: null,
      })
      .is("driver_id", null)
      .or(`status.in.("terminee","delivered","livree"),point_progress->>last_completed_at.not.is.null`);

    if (updateError) {
      console.error("❌ Error updating navettes:", updateError);
      process.exit(1);
    }

    console.log(`✅ Fixed ${problematicNavettes.length} navettes!`);
    problematicNavettes.forEach(n => {
      console.log(`   - ${n.name} (was: ${n.status})`);
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

fixNavettes();
