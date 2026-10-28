export function todayKey(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseKey(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: string, n: number): string {
  const d = parseKey(date);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000);
}

export function weekday(date: string): number {
  return parseKey(date).getDay();
}

export function startOfWeek(date: string, weekStartsOn: 0 | 1): string {
  const diff = (weekday(date) - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
}

export function weekDates(date: string, weekStartsOn: 0 | 1): string[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function monthDates(date: string): string[] {
  const d = parseKey(date);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const first = `${monthKey(date)}-01`;
  return Array.from({ length: days }, (_, i) => addDays(first, i));
}

export function addMonths(date: string, n: number): string {
  const d = parseKey(date);
  return todayKey(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

export function formatDayLabel(date: string): string {
  return parseKey(date).toLocaleDateString(undefined, { weekday: "short" });
}

export function formatLongDate(date: string): string {
  return parseKey(date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatShortDate(date: string): string {
  return parseKey(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatMonth(date: string): string {
  return parseKey(date).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
