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
  /** ISO weekday, 1 = Monday. Null if the section has never been synced. */
  day_of_week: number | null;
  /** Wall-clock 'HH:MM' in LA. */
  start_time: string | null;
  end_time: string | null;
  location: string;
};

export type AvailabilityRow = {
  id: string;
  section_id: string;
  week: number;
  /** Instants. Null on rows created before the timestamp migration. */
  start_at: string | null;
  end_at: string | null;
  status: "open" | "hidden" | "taken";
};

/** An open slot as the API returns it: instants, already resolved. */
export type ObservationAvailability = {
  id: string;
  la_name: string;
  la_email: string;
  la_position: string;
  course_name: string;
  section_name: string;
  location: string;
  start_at: string;
  end_at: string;
};

/** The same slot client-side, after `hydrateDates`. */
export type ObservationSlot = Omit<
  ObservationAvailability,
  "start_at" | "end_at"
> & {
  start_at: TZDate;
  end_at: TZDate;
};
