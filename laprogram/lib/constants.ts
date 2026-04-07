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

export const OBSERVATION_ACTIVE_ROUND_KEY = "OBSERVATION_ACTIVE_ROUND";
export const OBSERVATION_ROUND_WEEKS_PREFIX = "OBSERVATION_ROUND_WEEKS_";
export const OBSERVATION_CHANGE_DAYS_LIMIT = 2;

export const DAY_INDEX = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const IMAGE_SIZE = 400;
