import { TZDate } from "@date-fns/tz";

export type Id = {
  id: string;
};

export type LA = {
  name: string;
  course: string;
  position: string;
  image: string;
};

export type Position = {
  course_name: string;
  position: string;
};

export type Section = {
  section_id: string;
  course_name: string;
  section_name: string;
  day: string;
  time: string; // e.g. "9:00-9:50"
  location: string;
};

export type AvailabilityRow = {
  id: string;
  section_id: string;
  time: string; // e.g. "9:10-9:40"
  week: number;
  status: "open" | "hidden" | "taken";
};

/** Raw DB query result — includes week/day/time before API transformation. */
export type ObservationAvailabilityRow = {
  id: string;
  la_name: string;
  la_email: string;
  la_position: string;
  course_name: string;
  section_name: string;
  location: string;
  week: string;
  day: string;
  time: string;
};

/** API response — week/day/time replaced with parsed datetimes. */
export type ObservationAvailability = Omit<
  ObservationAvailabilityRow,
  "week" | "day" | "time"
> & {
  time_start: TZDate;
  time_end: TZDate;
};
