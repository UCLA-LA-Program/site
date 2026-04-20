import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DAY_INDEX, QUARTER_START_KEY, TIMEZONE } from "@/lib/constants";
import { TZDate } from "@date-fns/tz";
import {
  parse,
  addDays,
  addWeeks,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { luhn } from "cdigit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetcher(url: string): Promise<any> {
  return fetch(url).then((r) => r.json());
}

/** Current time in LA timezone. */
export function nowLA(): TZDate {
  return TZDate.tz(TIMEZONE);
}

function parseQuarterStart(raw: string): TZDate {
  return startOfDay(parse(raw, "yyyy-MM-dd", nowLA()));
}

export async function getQuarterStart(env: CloudflareEnv): Promise<TZDate> {
  const raw = await env.config.get(QUARTER_START_KEY);
  if (!raw) throw new Error("QUARTER_START not configured");
  return parseQuarterStart(raw);
}

export function getObsDate(
  week: string | number,
  day: string,
  quarterStart: TZDate | string,
): TZDate {
  const qs =
    typeof quarterStart === "string"
      ? parseQuarterStart(quarterStart)
      : quarterStart;
  const weekNum = typeof week === "string" ? parseInt(week, 10) : week;
  const dayOffset = Math.max(DAY_INDEX.indexOf(day), 0);
  return startOfDay(addDays(addWeeks(qs, weekNum - 1), dayOffset));
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

/** Parse a time string like "9:00" or "9:00am" into total minutes since midnight. */
export function parseTime(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)(am|pm)?$/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3]?.toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return h * 60 + m;
}

/** Parse a time range like "9:00-9:50" into [startMinutes, endMinutes]. */
export function parseSectionTime(time: string): [number, number] {
  const [start, end] = time.split("-");
  return [parseTime(start), parseTime(end)];
}

/** Convert minutes since midnight to display label like "9:00 AM". */
export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Convert minutes since midnight to "H:mm" string. */
export function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * Given a section time like "9:00-9:50", return the default availability
 * window: the last 30 minutes of the section, e.g. "9:20-9:50".
 */
export function defaultAvailabilityTime(sectionTime: string): string {
  const [, endMin] = parseSectionTime(sectionTime);
  const startMin = endMin - 30;
  return `${minutesToTimeStr(startMin)}-${minutesToTimeStr(endMin)}`;
}

/** Build full Date objects from week/day/quarterStart + "H:mm-H:mm" time range. */
export function parseTimeRange(
  week: string | number,
  day: string,
  time: string,
  quarterStart: TZDate,
): { time_start: TZDate; time_end: TZDate } {
  const baseDate = getObsDate(week, day, quarterStart);
  const [startRaw, endRaw] = time.split("-");
  const [sh, sm] = startRaw.split(":").map(Number);
  const [eh, em] = endRaw.split(":").map(Number);
  return {
    time_start: new TZDate(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      sh,
      sm,
      TIMEZONE,
    ),
    time_end: new TZDate(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      eh,
      em,
      TIMEZONE,
    ),
  };
}

export function hydrateDates<
  T extends { time_start: TZDate; time_end: TZDate },
>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    time_start: new TZDate(item.time_start, TIMEZONE),
    time_end: new TZDate(item.time_end, TIMEZONE),
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
  return /^\d{9}$/.test(uid) && luhn.validate(uid.slice(1) + uid[0]);
}
