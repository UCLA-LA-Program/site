export const FEATURE_FLAGS = [
  { key: "OBSERVATION_AVAILABILITY", label: "Observation Availability" },
  { key: "OBSERVATION_ROUND1_SIGNUP", label: "Observation Round 1 Sign-up" },
  { key: "OBSERVATION_ROUND2_SIGNUP", label: "Observation Round 2 Sign-up" },
  { key: "MID_QUARTER_FEEDBACK", label: "Mid-Quarter Feedback" },
  { key: "END_OF_QUARTER_FEEDBACK", label: "End-of-Quarter Feedback" },
  { key: "HEAD_LA_FEEDBACK", label: "Head LA Feedback" },
  { key: "OBSERVATION_FEEDBACK", label: "Observation Feedback" },
  { key: "TA_FEEDBACK", label: "TA Feedback" },
] as const;

export const OBSERVATION_COUNT_PREFIX = "OBSERVATION_COUNT_";

export const QUARTER_START_KEY = "QUARTER_START";
