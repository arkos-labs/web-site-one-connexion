import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reset navettes that are marked as completed/terminated but have no driver
    const { data: updated, error } = await supabase
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
      .in("status", ["terminee", "delivered", "livree"]);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${updated.length} navettes`,
        count: updated.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
