// Petit client pour l'API Bot Telegram (https://core.telegram.org/bots/api).

export type InlineKeyboard = { inline_keyboard: { text: string; callback_data?: string; url?: string }[][] };

export function telegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  return token && chatId ? { token, chatId } : null;
}

export class TelegramError extends Error {
  constructor(public method: string, public description: string) {
    super(`Telegram ${method}: ${description}`);
  }
}

export async function tg<T = unknown>(method: string, body: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new TelegramError(method, "TELEGRAM_BOT_TOKEN manquant");

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({ ok: false, description: res.statusText }));
  if (!json.ok) throw new TelegramError(method, json.description ?? "erreur inconnue");
  return json.result as T;
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
