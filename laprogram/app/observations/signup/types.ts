import type { Availability } from "@/types/db";
import { format } from "date-fns";

export type MyObservation = Availability & {
  la_image: string | null;
  ta_name: string | null;
  ta_email: string | null;
};

export function formatTime(d: Date): string {
  return format(d, "h:mm a");
}
