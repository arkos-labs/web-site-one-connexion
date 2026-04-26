// supabase/functions/telegram-notify/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const esc = (str: unknown) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const fmt = (label: string, value: unknown) => (value && value !== "null" && value !== "undefined")
  ? `<b>${label} :</b> ${esc(value)}\n`
  : "";

const hr = () => "─────────────────────\n";

const safeDate = (d: any) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

const fmtTime = (d: any) => {
  const date = safeDate(d);
  return date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
};

const fmtDateTime = (d: any) => {
  const date = safeDate(d);
  return date ? date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : null;
};

const fmtRef = (id?: string) => id ? id.slice(0, 8).toUpperCase() : "NOUVELLE";

const orderBlock = (o: any) =>
  hr() +
  fmt("📍 Enlèvement", o.pickup_address || o.pickup) +
  fmt("🏁 Livraison", o.delivery_address || o.delivery) +
  (o.pickup_city && o.delivery_city ? fmt("🗺️  Trajet", `${o.pickup_city} → ${o.delivery_city}`) : "") +
  fmt("🚗 Véhicule", o.vehicle_type ? o.vehicle_type.charAt(0).toUpperCase() + o.vehicle_type.slice(1) : null) +
  fmt("⚡ Formule", o.service_level ? String(o.service_level).toUpperCase() : null) +
  fmt("💰 Prix HT", o.price_ht ? `${Number(o.price_ht).toFixed(2)} €` : null) +
  fmt("🕐 Enlèvement", fmtDateTime(o.scheduled_at)) +
  fmt("⏰ Deadline", fmtTime(o.delivery_deadline)) +
  hr();

const resolveClient = (o: any) => o.client_name || o.client || "Client";

const formatMessage = (event: string, order: any) => {
  switch (event) {
    case 'new':
      return (
        `📦 <b>NOUVELLE COMMANDE</b>\n\n` +
        fmt("👤 Client", resolveClient(order)) +
        fmt("🆔 Référence", fmtRef(order.id)) +
        orderBlock(order) +
        `➡️ En attente d'acceptation admin`
      );
    case 'accepted':
      return (
        `✅ <b>COMMANDE ACCEPTÉE</b>\n\n` +
        fmt("👤 Client", resolveClient(order)) +
        fmt("🆔 Référence", fmtRef(order.id)) +
        orderBlock(order) +
        `➡️ En attente d'assignation chauffeur`
      );
    case 'assigned':
    case 'driver_accepted':
      return (
        `🚴 <b>MISSION ASSIGNÉE</b>\n\n` +
        fmt("👷 Chauffeur", order.driver_name || "Chauffeur") +
        fmt("🆔 Référence", fmtRef(order.id)) +
        orderBlock(order) +
        `➡️ En attente d'acceptation du chauffeur`
      );
    case 'picked_up':
      return (
        `🔵 <b>COLIS ENLEVÉ — EN LIVRAISON</b>\n\n` +
        fmt("👷 Chauffeur", order.driver_name || "Chauffeur") +
        fmt("🆔 Référence", fmtRef(order.id)) +
        fmt("📍 Enlèvement", order.pickup_address || order.pickup) +
        fmt("🏁 Destination", order.delivery_address || order.delivery) +
        fmt("⏰ Deadline", fmtTime(order.delivery_deadline)) +
        hr() +
        `➡️ Le colis est en cours de livraison`
      );
    case 'delivered':
      return (
        `✅ <b>LIVRAISON TERMINÉE !</b>\n\n` +
        fmt("👷 Chauffeur", order.driver_name || "Chauffeur") +
        fmt("🆔 Référence", fmtRef(order.id)) +
        fmt("📍 Livré à", order.delivery_address || order.delivery) +
        fmt("💰 Montant HT", order.price_ht ? `${Number(order.price_ht).toFixed(2)} €` : null) +
        hr() +
        `🎉 Mission accomplie avec succès`
      );
    case 'cancelled':
      return (
        `❌ <b>COMMANDE ANNULÉE</b>\n\n` +
        fmt("👤 Annulée par", order.cancelled_by || "Admin") +
        fmt("🆔 Référence", fmtRef(order.id)) +
        fmt("📍 Trajet", order.pickup_address && order.delivery_address ? `${order.pickup_address} → ${order.delivery_address}` : null) +
        fmt("💰 Montant HT", order.price_ht ? `${Number(order.price_ht).toFixed(2)} €` : null) +
        hr()
      );
    default:
      return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-secret",
      },
    });
  }

  try {
    const secret = Deno.env.get("TELEGRAM_NOTIFY_SECRET");
    const incomingSecret = req.headers.get("x-telegram-secret") || "";
    if (secret && incomingSecret !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { event, order } = await req.json();
    if (!event || !order) {
      return new Response(JSON.stringify({ error: "Missing event or order" }), { status: 400 });
    }

    const text = formatMessage(event, order);
    if (!text) {
      return new Response(JSON.stringify({ ok: true, skipped: true }));
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ error: "Telegram not configured" }), { status: 500 });
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
