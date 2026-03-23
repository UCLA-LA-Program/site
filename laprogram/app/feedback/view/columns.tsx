"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { FeedbackFormValues } from "../schema";
import {
  type FieldEntry,
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

function fromQuestions(
  questions: readonly FieldEntry[],
): ColumnDef<FeedbackFormValues>[] {
  return questions.map((q) => ({
    accessorKey: q.value,
    header: q.label,
  }));
}

// ---------------------------------------------------------------------------
// 1. Mid-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const midQuarterColumns: ColumnDef<FeedbackFormValues>[] = [
  { accessorKey: "activities", header: "LA-Supported Activities" },
  { accessorKey: "hours", header: "Hours Spent in LA-Supported Activities" },
  ...fromQuestions(MID_QUARTER_QUESTIONS),
  ...fromQuestions(MQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 2. End-of-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const endOfQuarterColumns: ColumnDef<FeedbackFormValues>[] = [
  { accessorKey: "activities", header: "LA-Supported Activities" },
  { accessorKey: "hours", header: "Hours Spent in LA-Supported Activities" },
  ...fromQuestions(END_OF_QUARTER_QUESTIONS),
  ...fromQuestions(EQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 3. Observation (LA → LA)
// ---------------------------------------------------------------------------
export const observationColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(OBSERVATION_QUESTIONS),
  ...fromQuestions(OBS_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 4. Head LA (LA → Head LA) — Ped + LCC merged
// ---------------------------------------------------------------------------
export const headLAColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(LA_PED_QUESTIONS),
  ...fromQuestions(LA_LCC_QUESTIONS),
  ...fromQuestions(LA_HEAD_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 5. TA → LA
// ---------------------------------------------------------------------------
export const taColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(TA_QUESTIONS),
  ...fromQuestions(TA_TEXT_FIELDS),
];
