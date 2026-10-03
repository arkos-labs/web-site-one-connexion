/**
 * app/api/keep-alive/route.ts
 * Cron Vercel (tous les 5 jours) pour garder la base de données active.
 * Empêche Supabase de mettre le projet en pause après inactivité, puis envoie
 * sur Telegram un bouton pour relancer la requête à la main.
 */
import { NextResponse } from "next/server";
import { KEEP_ALIVE_CALLBACK, pingDatabase } from "@/lib/keep-alive";
import { telegramConfig, tg } from "@/lib/telegram";

export async function GET(req: Request) {
  // Vercel envoie ce header aux crons quand CRON_SECRET est défini.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dbOk = true;
  try {
    await pingDatabase();
  } catch (err) {
    console.error("Keep-alive error:", err);
    dbOk = false;
  }

  const config = telegramConfig();
  if (config) {
    await tg("sendMessage", {
      chat_id: config.chatId,
      text: dbOk
        ? "🗄️ <b>Base de données</b> · vérification automatique OK\nAppuie sur le bouton pour la relancer à la main."
        : "⚠️ <b>Base de données</b> · la vérification automatique a échoué\nAppuie sur le bouton pour réessayer.",
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🟢 Garder la base active", callback_data: KEEP_ALIVE_CALLBACK }]] },
    }).catch((err) => console.error("Keep-alive Telegram error:", err));
  }

  return NextResponse.json({ success: dbOk, timestamp: new Date().toISOString() }, { status: dbOk ? 200 : 500 });
}
