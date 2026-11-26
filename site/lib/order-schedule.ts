/**
 * Date d'enlèvement programmée d'une commande (courses « pour un autre jour »).
 *
 * La date est enregistrée dans `orders.scheduled_at`. Les anciennes commandes passées
 * par le formulaire public ne la portaient que dans `notes`
 * (« Enlèvement souhaité le 27/11/2026 à 09:30 ») : on la relit alors depuis ce texte.
 * Toutes les dates s'entendent à l'heure de Paris.
 */

const TZ = "Europe/Paris";

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function parisDateStr(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Convertit une date + heure saisies à l'heure de Paris en ISO (UTC). */
export function parisLocalToISO(date: string, time?: string | null): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const [hh, mm] = (time && /^\d{1,2}:\d{2}$/.test(time) ? time : "00:00").split(":").map(Number);
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hh, mm);
  // Décalage de Paris (UTC+1 / UTC+2) à cet instant.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(new Date(guess)).map((p) => [p.type, p.value])
  );
  const asParis = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(guess - (asParis - guess)).toISOString();
}

const NOTES_RE = /Enl[eè]vement souhait[ée] le (\d{2})\/(\d{2})\/(\d{4})(?: à (\d{1,2}:\d{2}))?/i;

/** Date d'enlèvement programmée (ISO) ou null si la course est « dès que possible ». */
export function orderScheduledAt(o: { scheduled_at?: string | null; notes?: string | null }): string | null {
  if (o.scheduled_at) return o.scheduled_at;
  const m = o.notes ? NOTES_RE.exec(o.notes) : null;
  if (!m) return null;
  return parisLocalToISO(`${m[3]}-${m[2]}-${m[1]}`, m[4] ?? null);
}

/** Vrai si l'enlèvement est prévu un jour après aujourd'hui (heure de Paris). */
export function isScheduledAfterToday(iso: string | null | undefined, now: Date = new Date()): boolean {
  if (!iso) return false;
  return parisDateStr(new Date(iso)) > parisDateStr(now);
}

/** « jeu. 27/11 à 09:30 » (sans heure si minuit pile). */
export function formatScheduled(iso: string): string {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
  return time === "00:00" ? day : `${day} à ${time}`;
}
