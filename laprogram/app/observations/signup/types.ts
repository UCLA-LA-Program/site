import type { Availability } from "@/types/db";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export type MyObservation = Availability & {
  la_image: string | null;
  ta_name: string | null;
  ta_email: string | null;
};

export function formatTime(d: TZDate): string {
  return format(d, "h:mm a");
}
