import type { ObservationSlot } from "@/types/db";
import { TZDate, tz } from "@date-fns/tz";
import { format } from "date-fns";
import { TIMEZONE } from "@/lib/constants";

export type MyObservation = ObservationSlot & {
  la_image: string | null;
  ta_name: string | null;
  ta_email: string | null;
  /** When the observer signed up. Null for sign-ups predating the migration. */
  signed_up_at: string | null;
};

export function formatTimeLA(d: TZDate): string {
  return format(d, "h:mm a", { in: tz(TIMEZONE) });
}

export function formatDateLA(d: TZDate): string {
  return format(d, "M/d", { in: tz(TIMEZONE) });
}
