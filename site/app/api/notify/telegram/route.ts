import { NextResponse } from "next/server";
import { fetchKpis, refreshPinnedDashboard, renderAlerteCourse } from "@/lib/telegram-dashboard";
import { telegramConfig, tg } from "@/lib/telegram";

// Appelée après chaque nouvelle commande : alerte d'une ligne (fait sonner le téléphone),
// puis le tableau de bord est renvoyé en dessous et ré-épinglé (l'ancien est supprimé).
export async function POST() {
  try {
    const config = telegramConfig();
    if (!config) {
      console.warn("Telegram bot token or chat ID is missing.");
      // We don't fail the order if Telegram is not configured
      return NextResponse.json({ success: false, error: "Missing config" }, { status: 200 });
    }

    const kpis = await fetchKpis();
    // Route publique : on ne sonne que pour une commande réellement créée à l'instant.
    const recente = kpis.derniereCourse && Date.now() - new Date(kpis.derniereCourse.createdAt).getTime() < 2 * 60_000;
    if (!recente) {
      await refreshPinnedDashboard({ kpis });
      return NextResponse.json({ success: true, alert: false });
    }

    await tg("sendMessage", { chat_id: config.chatId, text: renderAlerteCourse(kpis), parse_mode: "HTML" });
    await refreshPinnedDashboard({ forceNew: true, kpis });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending telegram notification:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
