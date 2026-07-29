import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { QUARTER_START_KEY, TIMEZONE } from "@/lib/constants";
import { fromISO, nowLA } from "@/lib/time";
import { TZDate } from "@date-fns/tz";
import { parse, startOfDay, differenceInCalendarDays } from "date-fns";
import { luhn } from "cdigit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetcher(url: string): Promise<any> {
  return fetch(url).then((r) => r.json());
}

/**
 * The quarter's first Monday. Stored in KV as 'yyyy-MM-dd' -- a date, not an
 * instant, so it stays a plain calendar day rather than an ISO timestamp.
 */
export function parseQuarterStart(raw: string): TZDate {
  return startOfDay(parse(raw, "yyyy-MM-dd", nowLA()));
}

export async function getQuarterStart(env: CloudflareEnv): Promise<TZDate> {
  const raw = await env.config.get(QUARTER_START_KEY);
  if (!raw) throw new Error("QUARTER_START not configured");
  return parseQuarterStart(raw);
}

export function daysUntil(target: TZDate): number {
  return differenceInCalendarDays(target, nowLA());
}

export function getCurrentWeek(quarterStart: string | undefined): number {
  if (!quarterStart) return 11;
  const start = new TZDate(quarterStart, TIMEZONE);
  const now = nowLA();
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1);
}

/**
 * JSON carries instants as strings; turn them back into dates positioned in LA
 * so `format` and comparisons behave.
 */
export function hydrateDates<
  T extends { start_at: string | TZDate; end_at: string | TZDate },
>(items: T[]): (Omit<T, "start_at" | "end_at"> & {
  start_at: TZDate;
  end_at: TZDate;
})[] {
  return items.map((item) => ({
    ...item,
    start_at: fromISO(item.start_at as string),
    end_at: fromISO(item.end_at as string),
  }));
}

export function isLS7(course: string) {
  return (
    course.includes("LS 7A") ||
    course.includes("LS 7B") ||
    course.includes("LS 7C")
  );
}

export function isValidUID(uid: string) {
  return (
    uid.length === 9 &&
    /^\d{9}$/.test(uid) &&
    luhn.validate(uid.slice(1) + uid[0])
  );
}
