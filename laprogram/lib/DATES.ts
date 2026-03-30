export const QUARTER_START_DATE = "03-30-2026";
export const ROUND_1_START_DATE = "04-13-2026";
export const ROUND_1_END_DATE = "04-24-2026";
export const ROUND_2_START_DATE = "05-11-2026";
export const ROUND_2_END_DATE = "05-22-2026";

const LA_POSITION_OBSERVATION_COUNTS = [
  { value: "new", count: 1 },
  { value: "returner", count: 2 },
  { value: "ped", count: 2 },
  { value: "lcc", count: 0 },
  { value: "returner_lcc", count: 2 },
  { value: "ped_lcc", count: 1 },
];

export const LA_POSITION_OBSERVATION_COUNTS_MAP = new Map(
  LA_POSITION_OBSERVATION_COUNTS.map((o) => [o.value, o.count]),
);
