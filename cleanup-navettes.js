const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupNavettes() {
  try {
    // Réinitialiser les navettes non-dispatched qui sont marquées comme complétées
    const { data, error } = await supabase.from("navettes")
      .update({
        point_progress: {},
        picked_up_at: null,
        delivered_at: null,
        delivery_recipient: null,
        delivery_department: null,
        delivery_comment: null,
        delivery_photo_url: null,
      })
      .is("driver_id", null)
      .not("point_progress->>last_completed_at", "is", null);

    if (error) {
      console.error("Error cleaning up navettes:", error);
      process.exit(1);
    }

    console.log(`✅ Navettes nettoyées : ${data.length} navettes réinitialisées`);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

cleanupNavettes();
