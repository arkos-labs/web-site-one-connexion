const send = async (text) => {
    const clientEnabled = import.meta.env.VITE_TELEGRAM_CLIENT_ENABLED === "true";
    if (!clientEnabled) {
        console.warn("⚠️ Telegram client désactivé (backend only). Définis VITE_TELEGRAM_CLIENT_ENABLED=true pour réactiver.");
        return;
    }

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("⚠️ Telegram non configuré (VITE_TELEGRAM_BOT_TOKEN ou VITE_TELEGRAM_CHAT_ID manquant).");
        return;
    }

    try {
        console.log("📤 Tentative envoi Telegram...");
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("❌ Telegram API error:", err);
            // Fallback: send as plain text if HTML fails (stripping tags)
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: text.replace(/<[^>]*>/g, "") }),
            });
        } else {
            console.log("✅ Telegram envoyé avec succès.");
        }
    } catch (e) {
        console.error("❌ Telegram fetch error:", e);
    }
};

// ─── Helpers ──────────────────────────────────────────────────────
const esc = (str) => {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

const fmt = (label, value) => (value && value !== "null" && value !== "undefined") ? `<b>${label} :</b> ${esc(value)}\n` : "";
const hr = () => "─────────────────────\n";

const safeDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
};

const fmtTime = (d) => {
    const date = safeDate(d);
    return date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
};

const fmtDateTime = (d) => {
    const date = safeDate(d);
    return date ? date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : null;
};

const fmtRef = (id) => id ? id.slice(0, 8).toUpperCase() : "NOUVELLE";

const orderBlock = (o) => {
    const price = Number(o.price_ht || 0);
    const commDriver = price * 0.4;
    const commOC = price * 0.6;

    return hr() +
        fmt("📍 Enlèvement", o.pickup_address || o.pickup) +
        fmt("🏁 Livraison", o.delivery_address || o.delivery) +
        (o.pickup_city && o.delivery_city ? fmt("🗺️  Trajet", `${esc(o.pickup_city)} → ${esc(o.delivery_city)}`) : "") +
        fmt("🚗 Véhicule", o.vehicle_type ? o.vehicle_type.charAt(0).toUpperCase() + o.vehicle_type.slice(1) : null) +
        fmt("⚡ Formule", o.service_level ? o.service_level.toUpperCase() : null) +
        fmt("💰 Prix HT", price > 0 ? `${price.toFixed(2)} €` : null) +
        fmt("👷 Comm. Chauffeur (40%)", price > 0 ? `${commDriver.toFixed(2)} €` : null) +
        fmt("🏢 Comm. One Connexion (60%)", price > 0 ? `${commOC.toFixed(2)} €` : null) +
        fmt("🕐 Enlèvement", fmtDateTime(o.scheduled_at || o.pickup_time)) +
        fmt("⏰ Deadline", fmtTime(o.delivery_deadline)) +
        hr();
};

const resolveClient = (o, name) => name || o.client_name || o.client || "Client";
const resolveEmail = (o, name) => {
    // Try to extract email from name if it follows "Name (email)" pattern
    if (name && name.includes('(') && name.includes(')')) {
        return name.split('(')[1].split(')')[0];
    }
    return o.client_email || o.email || null;
};

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 1 — Nouvelle commande (client ou admin)
// ─────────────────────────────────────────────────────────────────
export const notifyNewOrder = (order, clientName) => send(
    `📦 <b>NOUVELLE COMMANDE</b>\n\n` +
    fmt("👤 Client", resolveClient(order, clientName)) +
    fmt("📧 Email", resolveEmail(order, clientName)) +
    fmt("🆔 Référence", fmtRef(order.id)) +
    orderBlock(order) +
    `➡️ En attente d'acceptation admin`
);

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 2 — Commande acceptée par l'admin
// ─────────────────────────────────────────────────────────────────
export const notifyOrderAccepted = (order, clientName) => send(
    `✅ <b>COMMANDE ACCEPTÉE</b>\n\n` +
    fmt("👤 Client", resolveClient(order, clientName)) +
    fmt("📧 Email", resolveEmail(order, clientName)) +
    fmt("🆔 Référence", fmtRef(order.id)) +
    orderBlock(order) +
    `➡️ En attente d'assignation chauffeur`
);

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 3 — Mission assignée à un chauffeur
// ─────────────────────────────────────────────────────────────────
export const notifyOrderAssigned = (order, driverName = "Chauffeur") => send(
    `🚴 <b>MISSION ASSIGNÉE</b>\n\n` +
    fmt("👷 Chauffeur", driverName) +
    fmt("🆔 Référence", fmtRef(order.id)) +
    orderBlock(order) +
    `➡️ En attente d'acceptation du chauffeur`
);

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 4 — Chauffeur accepte la mission
// ─────────────────────────────────────────────────────────────────
export const notifyDriverAccepted = (order, driverName = "Chauffeur") => send(
    `👍 <b>CHAUFFEUR EN ROUTE</b>\n\n` +
    fmt("👷 Chauffeur", driverName) +
    fmt("🆔 Référence", fmtRef(order?.id)) +
    fmt("📍 Vers Enlèvement", order?.pickup_address || order?.pickup) +
    fmt("📞 Contact", order?.pickup_phone) +
    hr() +
    `➡️ Le chauffeur ${esc(driverName)} se dirige vers le point d'enlèvement`
);

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 5 — Colis enlevé (in_progress)
// ─────────────────────────────────────────────────────────────────
export const notifyPickupDone = (order, driverName = "Chauffeur") => send(
    `🔵 <b>COLIS ENLEVÉ — EN LIVRAISON</b>\n\n` +
    fmt("👷 Chauffeur", driverName) +
    fmt("🆔 Référence", fmtRef(order?.id)) +
    fmt("📍 Enlèvement", order?.pickup_address || order?.pickup) +
    fmt("🏁 Destination", order?.delivery_address || order?.delivery) +
    fmt("⏰ Deadline", fmtTime(order?.delivery_deadline)) +
    hr() +
    `➡️ Le chauffeur ${esc(driverName)} a récupéré le colis et est en route`
);

// ─────────────────────────────────────────────────────────────────
// ÉTAPE 6 — Livraison terminée
// ─────────────────────────────────────────────────────────────────
export const notifyDelivered = (order, driverName = "Chauffeur") => send(
    `✅ <b>LIVRAISON TERMINÉE !</b>\n\n` +
    fmt("👷 Chauffeur", driverName) +
    fmt("🆔 Référence", fmtRef(order?.id)) +
    fmt("📍 Livré à", order?.delivery_address || order?.delivery) +
    fmt("💰 Montant HT", order?.price_ht ? `${Number(order.price_ht).toFixed(2)} €` : null) +
    hr() +
    `🎉 Mission accomplie avec succès par ${esc(driverName)}`
);

// ─────────────────────────────────────────────────────────────────
// Chauffeur refuse ou enlève la mission
// ─────────────────────────────────────────────────────────────────
export const notifyDriverDeclined = (order, driverName = "Chauffeur") => send(
    `✋ <b>MISSION REFUSÉE / ENLEVÉE</b>\n\n` +
    fmt("👷 Chauffeur", driverName) +
    fmt("🆔 Référence", fmtRef(order.id)) +
    orderBlock(order) +
    `⚠️ Le chauffeur a retiré ou refusé la mission. Elle est de nouveau disponible.`
);

// ─────────────────────────────────────────────────────────────────
// Annulation
// ─────────────────────────────────────────────────────────────────
export const notifyOrderCancelled = (order, byWhom = "Admin") => send(
    `❌ <b>COMMANDE ANNULÉE</b>\n\n` +
    fmt("👤 Annulée par", byWhom) +
    fmt("🆔 Référence", fmtRef(order.id)) +
    fmt("📍 Trajet", order.pickup_address && order.delivery_address ? `${order.pickup_address} → ${order.delivery_address}` : null) +
    fmt("💰 Montant HT", order.price_ht ? `${Number(order.price_ht).toFixed(2)} €` : null) +
    hr()
);

// ─────────────────────────────────────────────────────────────────
// Compat – ancienne fonction
// ─────────────────────────────────────────────────────────────────
export const sendTelegramMessage = send;
