"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { FeedbackFormValues } from "../schema";
import {
  type FieldEntry,
  OBSERVATION_QUESTIONS,
  LA_PED_QUESTIONS,
  LA_LCC_QUESTIONS,
  MID_QUARTER_QUESTIONS,
  END_OF_QUARTER_QUESTIONS,
  TA_QUESTIONS,
  OBS_TEXT_FIELDS,
  MQ_TEXT_FIELDS,
  EQ_TEXT_FIELDS,
  TA_TEXT_FIELDS,
  LA_HEAD_TEXT_FIELDS,
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
// 1. Observation
// ---------------------------------------------------------------------------
export const observationColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(OBSERVATION_QUESTIONS),
  ...fromQuestions(OBS_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 2. Ped Head (LA → Head LA)
// ---------------------------------------------------------------------------
export const pedHeadColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(LA_PED_QUESTIONS),
  ...fromQuestions(LA_HEAD_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 3. LCC (LA → Head LA)
// ---------------------------------------------------------------------------
export const lccColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(LA_LCC_QUESTIONS),
  ...fromQuestions(LA_HEAD_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 4. Mid-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const midQuarterColumns: ColumnDef<FeedbackFormValues>[] = [
  { accessorKey: "activities", header: "LA-Supported Activities" },
  { accessorKey: "hours", header: "Hours Spent in LA-Supported Activities" },
  ...fromQuestions(MID_QUARTER_QUESTIONS),
  ...fromQuestions(MQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 5. End-of-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const endOfQuarterColumns: ColumnDef<FeedbackFormValues>[] = [
  { accessorKey: "activities", header: "LA-Supported Activities" },
  { accessorKey: "hours", header: "Hours Spent in LA-Supported Activities" },
  ...fromQuestions(END_OF_QUARTER_QUESTIONS),
  ...fromQuestions(EQ_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 6. TA → LA
// ---------------------------------------------------------------------------
export const taColumns: ColumnDef<FeedbackFormValues>[] = [
  ...fromQuestions(TA_QUESTIONS),
  ...fromQuestions(TA_TEXT_FIELDS),
];
