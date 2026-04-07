import type { Availability } from "@/types/db";
import { format } from "date-fns";

export type MyObservation = Omit<Availability, "la_name" | "la_email"> & {
  observee_name: string;
  observee_email: string;
  observee_image: string | null;
  ta_name: string | null;
  ta_email: string | null;
};

export function formatTime(d: Date): string {
  return format(d, "h:mm a");
}
