import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site-content";
import { escapeHtml, tg, TelegramError, telegramConfig, type InlineKeyboard } from "@/lib/telegram";

// Message épinglé en haut du chat Telegram, édité à chaque nouvelle commande
// ou appui sur « Actualiser ». Ce marqueur permet de le retrouver via getChat.
const DASHBOARD_MARKER = "Live dashboard";

const TZ = "Europe/Paris";
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const parisDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const parisTime = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);

// Minuit (heure de Paris) du jour courant, en ISO UTC.
function parisMidnightISO(now = new Date()) {
  const guess = new Date(`${parisDate(now)}T00:00:00Z`);
  const offsetHours = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(guess)
  );
  return new Date(guess.getTime() - offsetHours * 3_600_000).toISOString();
}

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n).replace(/ | /g, " ");

export type Kpis = {
  caJour: number;
  coursesJour: number;
  enAttente: number;
  enCours: number;
  livreesJour: number;
  navettesADispatcher: number;
  chauffeursDispo: number;
  chauffeursEnCourse: number;
  chauffeursTotal: number;
  inscriptionsJour: number;
  messagesNonTraites: number;
  visitesJour: number;
  pagesVuesJour: number;
  derniereCourse: { createdAt: string; pickup: string | null; dropoff: string | null } | null;
};

export async function fetchKpis(): Promise<Kpis> {
  const supabase = adminClient();
  const now = new Date();
  const startOfDay = parisMidnightISO(now);
  const today = parisDate(now);
  const todayId = WEEKDAY_IDS[new Date(`${today}T12:00:00Z`).getUTCDay()];

  const [ordersToday, enAttente, enCours, navettes, drivers, inscriptions, messages, derniere, visites] = await Promise.all([
    supabase.from("orders").select("price_estimate, status").gte("created_at", startOfDay).neq("status", "annulee"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_cours"),
    supabase
      .from("navettes")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .contains("days_of_week", [todayId])
      .or(`driver_id.is.null,last_dispatch_date.is.null,last_dispatch_date.neq.${today}`),
    supabase.from("drivers").select("status"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .gte("created_at", startOfDay),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
    supabase
      .from("orders")
      .select("created_at, pickup_address, dropoff_address")
      .gte("created_at", startOfDay)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc("site_visit_stats", { p_date: today }).single<{ visites: number; pages: number }>(),
  ]);

  // Mieux vaut ne pas éditer le message que d'afficher des zéros trompeurs.
  const failed = [ordersToday, enAttente, enCours, navettes, drivers, inscriptions, messages, derniere, visites].find((r) => r.error);
  if (failed?.error) throw new Error(`KPI Supabase: ${failed.error.message}`);

  const rows = ordersToday.data ?? [];
  const driverRows = drivers.data ?? [];

  return {
    caJour: rows.reduce((sum, o) => sum + (o.price_estimate ?? 0), 0),
    coursesJour: rows.length,
    enAttente: enAttente.count ?? 0,
    enCours: enCours.count ?? 0,
    livreesJour: rows.filter((o) => o.status === "livree" || o.status === "terminee").length,
    navettesADispatcher: navettes.count ?? 0,
    chauffeursDispo: driverRows.filter((d) => d.status === "disponible").length,
    chauffeursEnCourse: driverRows.filter((d) => d.status === "en_course").length,
    chauffeursTotal: driverRows.length,
    inscriptionsJour: inscriptions.count ?? 0,
    messagesNonTraites: messages.count ?? 0,
    visitesJour: visites.data?.visites ?? 0,
    pagesVuesJour: visites.data?.pages ?? 0,
    derniereCourse: derniere.data
      ? { createdAt: derniere.data.created_at, pickup: derniere.data.pickup_address, dropoff: derniere.data.dropoff_address }
      : null,
  };
}

export function renderDashboard(k: Kpis, now = new Date()) {
  const c = k.derniereCourse;
  return [
    // 1re ligne = ce que Telegram affiche dans la barre épinglée en haut du chat.
    `💶 <b>${euros(k.caJour)}</b> · 📦 <b>${k.coursesJour}</b> courses · 👥 <b>${k.visitesJour}</b> visites`,
    "",
    `📊 <b>${DASHBOARD_MARKER.toUpperCase()}</b> · 🟢 ${parisTime(now)}`,
    "",
    `💶 CA du jour : <b>${euros(k.caJour)}</b>`,
    `📦 Courses : <b>${k.coursesJour}</b>${k.enAttente ? ` (⏳ ${k.enAttente} en attente)` : ""}`,
    `🆕 Inscriptions : <b>${k.inscriptionsJour}</b>`,
    `👥 Visites du site : <b>${k.visitesJour}</b> (${k.pagesVuesJour} pages vues)`,
    "",
    c
      ? `🚗 Dernière course · <b>${parisTime(new Date(c.createdAt))}</b>\n${escapeHtml(c.pickup ?? "?")} → ${escapeHtml(c.dropoff ?? "?")}`
      : "🚗 Aucune course aujourd'hui",
  ].join("\n");
}

const KEYBOARD: InlineKeyboard = {
  inline_keyboard: [
    [
      { text: "🔄 Actualiser", callback_data: "dashboard:refresh" },
      { text: "📊 Ouvrir l'admin", url: `${SITE_URL}/admin` },
    ],
  ],
};

async function findPinnedDashboard(chatId: string, botId: number) {
  const chat = await tg<{ pinned_message?: { message_id: number; text?: string; from?: { id: number } } }>(
    "getChat",
    { chat_id: chatId }
  );
  const pinned = chat.pinned_message;
  return pinned && pinned.from?.id === botId && pinned.text?.toLowerCase().includes(DASHBOARD_MARKER.toLowerCase()) ? pinned.message_id : null;
}

/**
 * Met à jour le tableau de bord épinglé (ou le crée et l'épingle s'il n'existe pas).
 * `forceNew` renvoie un nouveau message en bas du chat et l'épingle à la place de l'ancien.
 */
export async function refreshPinnedDashboard({ forceNew = false, kpis: given }: { forceNew?: boolean; kpis?: Kpis } = {}) {
  const config = telegramConfig();
  if (!config) return { ok: false as const, reason: "missing-config" };

  const kpis = given ?? (await fetchKpis());
  const text = renderDashboard(kpis);
  const botId = Number(config.token.split(":")[0]);
  const existingId = await findPinnedDashboard(config.chatId, botId);

  if (existingId && !forceNew) {
    try {
      await tg("editMessageText", {
        chat_id: config.chatId,
        message_id: existingId,
        text,
        parse_mode: "HTML",
        reply_markup: KEYBOARD,
      });
    } catch (err) {
      // Contenu identique (même minute, mêmes chiffres) : rien à faire.
      if (!(err instanceof TelegramError && err.description.includes("message is not modified"))) throw err;
    }
    return { ok: true as const, messageId: existingId, created: false, kpis };
  }

  const sent = await tg<{ message_id: number }>("sendMessage", {
    chat_id: config.chatId,
    text,
    parse_mode: "HTML",
    reply_markup: KEYBOARD,
    disable_notification: true,
  });
  if (existingId) {
    // L'ancien tableau disparaît : il n'en reste qu'un, toujours en bas du chat.
    await tg("deleteMessage", { chat_id: config.chatId, message_id: existingId }).catch(() =>
      tg("unpinChatMessage", { chat_id: config.chatId, message_id: existingId }).catch(() => {})
    );
  }
  await tg("pinChatMessage", { chat_id: config.chatId, message_id: sent.message_id, disable_notification: true });
  return { ok: true as const, messageId: sent.message_id, created: true, kpis };
}

/** Notification d'une ligne (fait sonner le téléphone sans noyer le tableau épinglé). */
export function renderAlerteCourse(k: Kpis) {
  const c = k.derniereCourse;
  if (!c) return "🚗 <b>Nouvelle course</b>";
  return `🚗 <b>Nouvelle course</b> · ${escapeHtml(c.pickup ?? "?")} → ${escapeHtml(c.dropoff ?? "?")}`;
}

/** Liste des courses du jour, pour la commande /courses_jour. */
export async function renderCoursesDuJour() {
  const { data } = await adminClient()
    .from("orders")
    .select("tracking_code, pickup_address, dropoff_address, status, price_estimate, created_at")
    .gte("created_at", parisMidnightISO())
    .order("created_at", { ascending: false })
    .limit(15);

  if (!data?.length) return "📦 <b>Courses du jour</b>\n\nAucune course aujourd'hui.";

  const lignes = data.map(
    (o) =>
      `• <b>${parisTime(new Date(o.created_at))}</b> · <code>${escapeHtml(o.tracking_code ?? "—")}</code> · ${escapeHtml(o.status)}` +
      `${o.price_estimate ? ` · ${euros(o.price_estimate)}` : ""}\n` +
      `   ${escapeHtml(o.pickup_address ?? "?")} → ${escapeHtml(o.dropoff_address ?? "?")}`
  );
  return `📦 <b>Courses du jour</b> (${data.length})\n\n${lignes.join("\n")}`;
}

/** État des chauffeurs, pour la commande /chauffeurs. */
export async function renderChauffeurs() {
  const { data } = await adminClient().from("drivers").select("name, status, vehicle").order("name");
  if (!data?.length) return "🚚 <b>Chauffeurs</b>\n\nAucun chauffeur enregistré.";

  const dot: Record<string, string> = { disponible: "🟢", en_course: "🟠", hors_service: "⚫" };
  const lignes = data.map(
    (d) => `${dot[d.status] ?? "⚪"} ${escapeHtml(d.name)}${d.vehicle ? ` · ${escapeHtml(d.vehicle)}` : ""}`
  );
  return `🚚 <b>Chauffeurs</b>\n\n${lignes.join("\n")}`;
}
