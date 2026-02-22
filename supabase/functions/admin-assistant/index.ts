// supabase/functions/admin-assistant/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { messages = [], userId = "" } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OLLAMA_API_BASE_URL = Deno.env.get("OLLAMA_API_BASE_URL") || "https://ollama.com";
    const OLLAMA_API_KEY = Deno.env.get("OLLAMA_API_KEY") || "";
    const OLLAMA_MODEL = Deno.env.get("OLLAMA_MODEL") || "gpt-oss:120b";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Fetch minimal context
    const [{ data: orders }, { data: invoices }, { data: drivers }, { data: appSettings }] = await Promise.all([
      supabase.from("orders").select("id,status,price_ht,pickup_city,delivery_city,created_at,updated_at").order("updated_at", { ascending: false }).limit(25),
      supabase.from("invoices").select("id,status,total_ht,period_start,period_end,created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("drivers").select("id,first_name,last_name,status,vehicle_type").order("created_at", { ascending: false }).limit(20),
      supabase.from("app_settings").select("key,value"),
    ]);

    const orderCounts = (orders || []).reduce((acc: Record<string, number>, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const systemPrompt = `Tu es l'assistant admin de One Connexion. Réponds de façon courte, opérationnelle et claire.\n\nContexte (résumé):\n- Orders (25 dernières): ${JSON.stringify(orders || []).slice(0, 4000)}\n- Order status counts: ${JSON.stringify(orderCounts)}\n- Invoices (10 dernières): ${JSON.stringify(invoices || [])}\n- Drivers (20 derniers): ${JSON.stringify(drivers || [])}\n- App settings: ${JSON.stringify(appSettings || [])}\n\nRègles:\n- Donne des conseils et corrections pour le site/admin, pas d'actions automatiques.\n- Si tu manques d'info, pose des questions ciblées.\n`;

    const payload = {
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || []),
      ],
      stream: false,
    };

    const resp = await fetch(`${OLLAMA_API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply = data?.message?.content || data?.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
