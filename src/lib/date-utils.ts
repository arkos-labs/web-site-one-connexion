import { parse, isSameDay, isSameWeek, isSameMonth, isSameYear, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export type TimeRange = "today" | "week" | "month" | "year" | "all";

export const filterByDate = (dateStr: string, range: TimeRange, formatStr?: string) => {
    if (range === "all") return true;

    let date: Date;

    // Try parsing as ISO first if no format or if it looks like ISO
    if (!formatStr || dateStr.includes('T')) {
        date = parseISO(dateStr);
        if (!isValid(date)) {
            date = new Date(dateStr);
        }
    } else {
        // Fallback to format string parsing
        date = parse(dateStr, formatStr!, new Date(), { locale: fr });
    }

    if (!isValid(date)) {
        console.error("Invalid date", dateStr);
        return false;
    }

    const now = new Date();

    switch (range) {
        case "today":
            return isSameDay(date, now);
        case "week":
            return isSameWeek(date, now, { locale: fr, weekStartsOn: 1 }); // Monday start
        case "month":
            return isSameMonth(date, now);
        case "year":
            return isSameYear(date, now);
        default:
            return true;
    }
};
