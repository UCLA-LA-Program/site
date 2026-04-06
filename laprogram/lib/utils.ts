import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DAY_INDEX, QUARTER_START_KEY } from "@/lib/constants";
import {
  parse,
  addDays,
  addWeeks,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetcher(url: string): Promise<any> {
  return fetch(url).then((r) => r.json());
}

function parseQuarterStart(raw: string): Date {
  return startOfDay(parse(raw, "yyyy-MM-dd", new Date()));
}

export async function getQuarterStart(env: CloudflareEnv): Promise<Date> {
  const raw = await env.config.get(QUARTER_START_KEY);
  if (!raw) throw new Error("QUARTER_START not configured");
  return parseQuarterStart(raw);
}

export function getObsDate(
  week: string | number,
  day: string,
  quarterStart: Date | string,
): Date {
  const qs =
    typeof quarterStart === "string"
      ? parseQuarterStart(quarterStart)
      : quarterStart;
  const weekNum = typeof week === "string" ? parseInt(week, 10) : week;
  const dayOffset = Math.max(DAY_INDEX.indexOf(day), 0);
  return startOfDay(addDays(addWeeks(qs, weekNum - 1), dayOffset));
}

export function daysUntil(target: Date): number {
  return differenceInCalendarDays(target, new Date());
}

/** Build full Date objects from week/day/quarterStart + "H:mm-H:mm" time range. */
export function parseTimeRange(
  week: string | number,
  day: string,
  time: string,
  quarterStart: Date | string,
): { time_start: Date; time_end: Date } {
  const baseDate = getObsDate(week, day, quarterStart);
  const [startRaw, endRaw] = time.split("-");
  const [sh, sm] = startRaw.split(":").map(Number);
  const [eh, em] = endRaw.split(":").map(Number);
  return {
    time_start: new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      sh,
      sm,
    ),
    time_end: new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      eh,
      em,
    ),
  };
}
