export const MAINTENANCE_KEY = "MAINTENANCE_MODE";

export const FEATURE_FLAGS = [
  { key: MAINTENANCE_KEY, label: "Under Maintenance" },
  { key: "OBSERVATION_AVAILABILITY", label: "Observation Availability" },
  { key: "MID_QUARTER_FEEDBACK", label: "Mid-Quarter Feedback" },
  { key: "END_OF_QUARTER_FEEDBACK", label: "End-of-Quarter Feedback" },
  { key: "HEAD_LA_FEEDBACK", label: "Head LA Feedback" },
  { key: "OBSERVATION_FEEDBACK", label: "Observation Feedback" },
  { key: "TA_FEEDBACK", label: "TA Feedback" },
] as const;

export const QUARTER_START_KEY = "QUARTER_START";

export const OBSERVATION_ENABLED_WEEKS_KEY = "OBSERVATION_ENABLED_WEEKS";
export const OBSERVATION_WEEK_ALLOWLIST_PREFIX = "OBSERVATION_WEEK_ALLOWLIST_";
export const OBSERVATION_WEEK_RANGE = [3, 4, 5, 6, 7, 8, 9, 10];
export const OBSERVATION_CHANGE_DAYS_LIMIT = 2;
export const OBSERVATION_FUTURE_LIMIT = 5;

/** Weekdays sections actually meet, as ISO weekdays (1 = Monday). */
export const SECTION_WEEKDAYS = [1, 2, 3, 4, 5];

export const IMAGE_SIZE = 500;

export const TIMEZONE = "America/Los_Angeles";

const LA_POSITION_OPTIONS = [
  { value: "new", label: "New LA" },
  { value: "ret", label: "Returning LA" },
  { value: "ped", label: "Pedagogy Head LA" },
  { value: "lcc", label: "LA Course Coordinator (LCC)" },
  { value: "ret_lcc", label: "Returner + LCC" },
  { value: "ped_lcc", label: "Pedagogy Head + LCC" },
];

export const LA_POSITION_MAP = new Map(
  LA_POSITION_OPTIONS.map((o) => [o.value, o.label]),
);
