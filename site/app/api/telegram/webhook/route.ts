import { refreshPinnedDashboard, renderChauffeurs, renderCoursesDuJour } from "@/lib/telegram-dashboard";
import { telegramConfig, tg } from "@/lib/telegram";

// Reçoit les mises à jour du bot (commandes + bouton « Actualiser »).
// Enregistré par /api/telegram/setup avec un secret vérifié ici.
export async function POST(req: Request) {
  const config = telegramConfig();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!config || !secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = await req.json();

  try {
    if (update.callback_query) {
      const cb = update.callback_query;
      if (String(cb.message?.chat?.id) !== config.chatId) return Response.json({ ok: true });

      if (cb.data === "dashboard:refresh") await refreshPinnedDashboard();
      await tg("answerCallbackQuery", { callback_query_id: cb.id, text: "Tableau de bord à jour ✅" });
      return Response.json({ ok: true });
    }

    const msg = update.message;
    // Seul le chat configuré peut piloter le bot.
    if (!msg?.text || String(msg.chat.id) !== config.chatId) return Response.json({ ok: true });

    const command = msg.text.split(/[\s@]/)[0].toLowerCase();
    const reply = (text: string) => tg("sendMessage", { chat_id: config.chatId, text, parse_mode: "HTML" });

    switch (command) {
      case "/stats":
      case "/dashboard":
        // Nouveau message en bas du chat, épinglé à la place de l'ancien.
        await refreshPinnedDashboard({ forceNew: true });
        break;
      case "/courses_jour":
        await reply(await renderCoursesDuJour());
        break;
      case "/chauffeurs":
        await reply(await renderChauffeurs());
        break;
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
  }

  // Toujours 200 : sinon Telegram renvoie la même mise à jour en boucle.
  return Response.json({ ok: true });
}
