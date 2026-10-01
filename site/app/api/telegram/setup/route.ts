import { refreshPinnedDashboard } from "@/lib/telegram-dashboard";
import { tg } from "@/lib/telegram";

// À appeler une fois après déploiement (protégé par CRON_SECRET) :
// enregistre le webhook, le menu de commandes et épingle le tableau de bord.
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ error: "TELEGRAM_WEBHOOK_SECRET manquant" }, { status: 500 });
  }

  const webhookUrl = `${new URL(req.url).origin}/api/telegram/webhook`;

  await tg("setWebhook", {
    url: webhookUrl,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
  });
  await tg("setMyCommands", {
    commands: [
      { command: "stats", description: "Tableau de bord KPI en direct" },
      { command: "courses_jour", description: "Courses passées aujourd'hui" },
      { command: "chauffeurs", description: "Disponibilité des chauffeurs" },
    ],
  });
  const dashboard = await refreshPinnedDashboard();

  return Response.json({ ok: true, webhookUrl, dashboard });
}
