"use client";

import type { AnonFeedback } from "../schema";
import {
  type FieldEntry,
  ACTIVITIES,
  MID_QUARTER_QUESTIONS,
  END_OF_QUARTER_QUESTIONS,
  OBSERVATION_QUESTIONS,
  LA_PED_QUESTIONS,
  LA_LCC_QUESTIONS,
  TA_QUESTIONS,
  MQ_TEXT_FIELDS,
  EQ_TEXT_FIELDS,
  OBS_TEXT_FIELDS,
  LA_HEAD_TEXT_FIELDS,
  TA_TEXT_FIELDS,
} from "../constants";

export interface Column {
  key: string;
  header: string;
  render?: (value: unknown) => React.ReactNode;
}

const activityMap = new Map(ACTIVITIES.map((a) => [a.value, a.label]));

function fromQuestions(questions: readonly FieldEntry[]): Column[] {
  return questions.map((q) => {
    const optionMap = q.options
      ? new Map(q.options.map((o) => [o.value, o.label]))
      : null;
    return {
      key: q.value,
      header: q.label,
      ...(optionMap && {
        render: (val: unknown) =>
          optionMap.get(val as string) ?? (val as React.ReactNode),
      }),
    };
  });
}

const activitiesColumn: Column = {
  key: "activities",
  header: "LA-Supported Activities",
  render: (val) => {
    if (!Array.isArray(val)) return val as React.ReactNode;
    return val.map((v: string) => activityMap.get(v) ?? v).join(", ");
  },
};

const hoursColumn: Column = {
  key: "hours",
  header: "Hours Spent in LA-Supported Activities",
};

// ---------------------------------------------------------------------------
// 1. Mid-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const midQuarterColumns: Column[] = [
  activitiesColumn,
  hoursColumn,
  ...fromQuestions(MID_QUARTER_QUESTIONS),
  ...fromQuestions(MQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 2. End-of-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const endOfQuarterColumns: Column[] = [
  activitiesColumn,
  hoursColumn,
  ...fromQuestions(END_OF_QUARTER_QUESTIONS),
  ...fromQuestions(EQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 3. Observation (LA → LA)
// ---------------------------------------------------------------------------
export const observationColumns: Column[] = [
  ...fromQuestions(OBSERVATION_QUESTIONS),
  ...fromQuestions(OBS_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 4. Head LA (LA → Head LA) — Ped + LCC merged
// ---------------------------------------------------------------------------
export const headLAColumns: Column[] = [
  ...fromQuestions(LA_PED_QUESTIONS),
  ...fromQuestions(LA_LCC_QUESTIONS),
  ...fromQuestions(LA_HEAD_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 5. TA → LA
// ---------------------------------------------------------------------------
export const taColumns: Column[] = [
  ...fromQuestions(TA_QUESTIONS),
  ...fromQuestions(TA_TEXT_FIELDS),
];
