import { TZDate } from "@date-fns/tz";
import { addDays, addWeeks, startOfDay } from "date-fns";
import { TIMEZONE } from "@/lib/constants";

/*
Canonical time formats. See migrations/0005_standard_timestamps.sql.

  instant      ISO-8601 UTC with ms, '2026-07-29T04:12:33.123Z'
  time of day  'HH:MM', 24-hour, zero-padded, America/Los_Angeles wall time
  day of week  ISO-8601 weekday, 1 = Monday ... 7 = Sunday

Nothing outside this file should be splitting a time string apart.
*/

/** SQL expression producing an instant. The exact mirror of `isoNow()`. */
export const SQL_NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

/** Current time in LA. Wall-clock reads (`getHours`) use the LA offset. */
export function nowLA(): TZDate {
  return TZDate.tz(TIMEZONE);
}

/** Current instant. */
export function isoNow(): string {
  return new Date().toISOString();
}

/** An instant, from anything date-like. */
export function toISO(value: Date | TZDate | number): string {
  return new Date(value as Date).toISOString();
}

/** An instant, back into a date positioned in LA. */
export function fromISO(iso: string): TZDate {
  return new TZDate(iso, TIMEZONE);
}

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** ISO weekday (1-7) to its name. */
export function dayName(dayOfWeek: number | null | undefined): string {
  if (!dayOfWeek || dayOfWeek < 1 || dayOfWeek > 7) return "";
  return DAY_NAMES[dayOfWeek - 1];
}

/** A day name to its ISO weekday, or null if it is not one. */
export function dayOfWeek(name: string): number | null {
  const i = DAY_NAMES.indexOf(name as (typeof DAY_NAMES)[number]);
  return i === -1 ? null : i + 1;
}

/** 'HH:MM' to minutes since midnight. */
export function clockToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/** Minutes since midnight to 'HH:MM'. */
export function minutesToClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 'HH:MM' to a display label, '09:20' -> '9:20 AM'. */
export function clockLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Minutes since midnight to a display label, 560 -> '9:20 AM'. */
export function minutesLabel(minutes: number): string {
  return clockLabel(minutesToClock(minutes));
}

/** Minutes an LA is observable by default: the tail end of their section. */
export const DEFAULT_AVAILABILITY_MINUTES = 30;

/**
 * The default observation window for a section: its last 30 minutes.
 * '09:00'-'09:50' gives '09:20'-'09:50'.
 */
export function defaultAvailabilityWindow(endTime: string): {
  start: string;
  end: string;
} {
  const end = clockToMinutes(endTime);
  return {
    start: minutesToClock(Math.max(0, end - DEFAULT_AVAILABILITY_MINUTES)),
    end: endTime,
  };
}

/**
 * The instant a wall-clock time falls on, for a given quarter week and weekday.
 * Week 1 is the quarter's first week; dayOfWeek is ISO (1 = Monday).
 */
export function weekdayInstant(
  quarterStart: TZDate,
  week: number,
  dayOfWeek: number,
  hhmm: string,
): TZDate {
  const date = weekdayDate(quarterStart, week, dayOfWeek);
  const [h, m] = hhmm.split(":").map(Number);
  return new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    h,
    m,
    TIMEZONE,
  );
}

/** Start of day for a given quarter week and ISO weekday. */
export function weekdayDate(
  quarterStart: TZDate,
  week: number,
  dayOfWeek: number,
): TZDate {
  return startOfDay(addDays(addWeeks(quarterStart, week - 1), dayOfWeek - 1));
}

/**
 * The instant midnight-in-LA falls on, `days` calendar days from today.
 * `laDayBoundary(1)` is the start of tomorrow: the cutoff separating slots that
 * are still open for sign-up from ones that have effectively passed.
 */
export function laDayBoundary(days: number): string {
  return toISO(startOfDay(addDays(nowLA(), days)));
}
