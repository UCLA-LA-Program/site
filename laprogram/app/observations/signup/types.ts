import type { ObservationAvailability } from "@/types/db";
import { TZDate, tz } from "@date-fns/tz";
import { format } from "date-fns";
import { TIMEZONE } from "@/lib/constants";

export type MyObservation = ObservationAvailability & {
  la_image: string | null;
  ta_name: string | null;
  ta_email: string | null;
};

export function formatTimeLA(d: TZDate): string {
  return format(d, "h:mm a", { in: tz(TIMEZONE) });
}

export function formatDateLA(d: TZDate): string {
  return format(d, "M/d", { in: tz(TIMEZONE) });
}
