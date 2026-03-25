import z from "zod";
import {
  type FieldEntry,
  ACTIVITIES,
  MID_QUARTER_NONSENSITIVE_QUESTIONS,
  END_OF_QUARTER_NONSENSITIVE_QUESTIONS,
  OBSERVATION_NONSENSITIVE_QUESTIONS,
  LA_PED_NONSENSITIVE_QUESTIONS,
  LA_LCC_NONSENSITIVE_QUESTIONS,
  TA_NONSENSITIVE_QUESTIONS,
  MQ_NONSENSITIVE_TEXT_FIELDS,
  EQ_NONSENSITIVE_TEXT_FIELDS,
  OBS_NONSENSITIVE_TEXT_FIELDS,
  LA_HEAD_NONSENSITIVE_TEXT_FIELDS,
  TA_NONSENSITIVE_TEXT_FIELDS,
} from "../constants";

export interface Column {
  key: string;
  header: string;
  width?: string;
  render?: (value: unknown) => React.ReactNode;
}

function fromQuestions(questions: readonly FieldEntry[]): Column[] {
  return questions.map((q) => {
    const optionMap = q.options
      ? new Map(q.options.map((o) => [o.value, o.label]))
      : null;
    return {
      key: q.value,
      header: q.label,
      ...(!optionMap && { width: "w-64" }),
      ...(optionMap && {
        render: (val: unknown) =>
          optionMap.get(val as string) ?? (val as React.ReactNode),
      }),
    };
  });
}

const activityMap = new Map(ACTIVITIES.map((a) => [a.value, a.label]));

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
  header: "Hours in LA-Supported Activities",
  width: "w-20",
};

// ---------------------------------------------------------------------------
// 1. Mid-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const midQuarterColumns: Column[] = [
  activitiesColumn,
  hoursColumn,
  ...fromQuestions(MID_QUARTER_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(MQ_NONSENSITIVE_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 2. End-of-Quarter (student → LA)
// ---------------------------------------------------------------------------
export const endOfQuarterColumns: Column[] = [
  activitiesColumn,
  hoursColumn,
  ...fromQuestions(END_OF_QUARTER_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(EQ_NONSENSITIVE_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 3. Observation (LA → LA)
// ---------------------------------------------------------------------------
export const observationColumns: Column[] = [
  ...fromQuestions(OBSERVATION_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(OBS_NONSENSITIVE_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 4. Head LA (LA → Head LA) — split by position
// ---------------------------------------------------------------------------
export const headLAPedColumns: Column[] = [
  ...fromQuestions(LA_PED_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(LA_HEAD_NONSENSITIVE_TEXT_FIELDS),
];

export const headLALccColumns: Column[] = [
  ...fromQuestions(LA_LCC_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(LA_HEAD_NONSENSITIVE_TEXT_FIELDS),
];

export const headLAAllColumns: Column[] = [
  ...fromQuestions(LA_PED_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(LA_LCC_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(LA_HEAD_NONSENSITIVE_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// 5. TA → LA
// ---------------------------------------------------------------------------
export const taColumns: Column[] = [
  ...fromQuestions(TA_NONSENSITIVE_QUESTIONS),
  ...fromQuestions(TA_NONSENSITIVE_TEXT_FIELDS),
];

// ---------------------------------------------------------------------------
// Anonymous view schemas — only fields safe to display per tab.
// Parsing through these strips everything else (demographics, sensitive text).
// ---------------------------------------------------------------------------

function viewFields(fields: readonly FieldEntry[]) {
  return Object.fromEntries(fields.map((f) => [f.value, z.any()]));
}

const anonMidQuarterSchema = z.object({
  feedback_type: z.literal("mid_quarter"),
  activities: z.any(),
  hours: z.any(),
  ...viewFields(MID_QUARTER_NONSENSITIVE_QUESTIONS),
  ...viewFields(MQ_NONSENSITIVE_TEXT_FIELDS),
});

const anonEndOfQuarterSchema = z.object({
  feedback_type: z.literal("end_of_quarter"),
  activities: z.any(),
  hours: z.any(),
  ...viewFields(END_OF_QUARTER_NONSENSITIVE_QUESTIONS),
  ...viewFields(EQ_NONSENSITIVE_TEXT_FIELDS),
});

const anonObservationSchema = z.object({
  feedback_type: z.literal("la_observation"),
  ...viewFields(OBSERVATION_NONSENSITIVE_QUESTIONS),
  ...viewFields(OBS_NONSENSITIVE_TEXT_FIELDS),
});

const anonHeadLASchema = z.object({
  feedback_type: z.literal("la_head_la"),
  ...viewFields(LA_PED_NONSENSITIVE_QUESTIONS),
  ...viewFields(LA_LCC_NONSENSITIVE_QUESTIONS),
  ...viewFields(LA_HEAD_NONSENSITIVE_TEXT_FIELDS),
});

const anonTASchema = z.object({
  role: z.literal("ta"),
  ...viewFields(TA_NONSENSITIVE_QUESTIONS),
  ...viewFields(TA_NONSENSITIVE_TEXT_FIELDS),
});

export const anonFeedbackSchema = z.union([
  anonMidQuarterSchema,
  anonEndOfQuarterSchema,
  anonObservationSchema,
  anonHeadLASchema,
  anonTASchema,
]);

export type AnonFeedback = z.infer<typeof anonFeedbackSchema>;
