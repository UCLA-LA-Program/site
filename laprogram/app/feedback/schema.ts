import { z } from "zod";
import { isValid as luhnIsValid } from "luhn-js";
import {
  type FieldEntry,
  OBSERVATION_QUESTIONS,
  MID_QUARTER_QUESTIONS,
  END_OF_QUARTER_QUESTIONS,
  EQ_SENSITIVE_QUESTIONS,
  TA_QUESTIONS,
  LA_PED_QUESTIONS,
  LA_LCC_QUESTIONS,
  OBS_TEXT_FIELDS,
  OBS_SENSITIVE_TEXT_FIELDS,
  MQ_TEXT_FIELDS,
  MQ_SENSITIVE_TEXT_FIELDS,
  EQ_TEXT_FIELDS,
  TA_TEXT_FIELDS,
  LA_HEAD_TEXT_FIELDS,
} from "./constants";

const required = (msg: string) => z.string().min(1, msg);

// ---------------------------------------------------------------------------
// Helper to derive zod fields from constants
// ---------------------------------------------------------------------------

function zodFromFields(fields: readonly FieldEntry[]) {
  return Object.fromEntries(
    fields.map((f) => [
      f.value,
      f.required ? required(f.label) : z.string().optional(),
    ]),
  );
}

// ---------------------------------------------------------------------------
// Shared field groups
// ---------------------------------------------------------------------------

export const headerFields = {
  name: required("Name is required"),
  email: z.email("Please enter a valid email"),
  course: required("Please select a course"),
  la: required("Please select an LA"),
};

export const closingFields = {
  become_la: required("Please select an option"),
  courses_without_las: z.string().optional(),
  uid: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        (val.length === 9 && /^\d{9}$/.test(val) && luhnIsValid(val)),
      { message: "Please enter a valid 9-digit UID" },
    )
    .optional(),
  gender: z.string().optional(),
  gender_other: z.string().optional(),
  groups: z.array(z.string()).optional(),
  group_other: z.string().optional(),
  la_program_comments: z.string().optional(),
};

export const studentSharedFields = {
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  hours: required("Please enter a number of hours"),
};

export const mqFields = {
  ...zodFromFields(MID_QUARTER_QUESTIONS),
  ...zodFromFields(MQ_TEXT_FIELDS),
  ...zodFromFields(MQ_SENSITIVE_TEXT_FIELDS),
};

export const eqFields = {
  ...zodFromFields(END_OF_QUARTER_QUESTIONS),
  ...zodFromFields(EQ_SENSITIVE_QUESTIONS),
  ...zodFromFields(EQ_TEXT_FIELDS),
};

export const laPedFields = zodFromFields(LA_PED_QUESTIONS);

export const laLccFields = zodFromFields(LA_LCC_QUESTIONS);

export const laSharedFields = zodFromFields(LA_HEAD_TEXT_FIELDS);

const laFields = {
  la_head_type: z.string(),
  ...laPedFields,
  ...laLccFields,
  ...laSharedFields,
};

export const obsFields = {
  obs_round: required("Please select a round"),
  obs_section: required("Please describe the observed section"),
  obs_la_position: required("Please select an LA position"),
  ...zodFromFields(OBSERVATION_QUESTIONS),
  ...zodFromFields(OBS_TEXT_FIELDS),
  ...zodFromFields(OBS_SENSITIVE_TEXT_FIELDS),
};

export const taFields = {
  ...zodFromFields(TA_QUESTIONS),
  ...zodFromFields(TA_TEXT_FIELDS),
};

// Built from field groups — single source of truth for FeedbackFormValues
const baseSchema = z.object({
  ...headerFields,
  role: z.string(),
  feedback_type: z.string(),
  ...studentSharedFields,
  ...mqFields,
  ...eqFields,
  ...laFields,
  ...obsFields,
  ...taFields,
  ...closingFields,
});

export type FeedbackFormValues = z.infer<typeof baseSchema>;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const ARRAY_FIELDS: (keyof FeedbackFormValues)[] = ["activities", "groups"];

export const defaultValues = Object.fromEntries(
  Object.keys(baseSchema.shape).map((key) => [
    key,
    ARRAY_FIELDS.includes(key as keyof FeedbackFormValues) ? [] : "",
  ]),
) as unknown as FeedbackFormValues;

// ---------------------------------------------------------------------------
// Variant schemas
// ---------------------------------------------------------------------------

const studentMidQuarterSchema = z.object({
  ...headerFields,
  role: z.literal("student"),
  feedback_type: z.literal("mid_quarter"),
  ...studentSharedFields,
  ...mqFields,
  ...closingFields,
});

const studentEndOfQuarterSchema = z.object({
  ...headerFields,
  role: z.literal("student"),
  feedback_type: z.literal("end_of_quarter"),
  ...studentSharedFields,
  ...eqFields,
  ...closingFields,
});

const taSchema = z.object({
  ...headerFields,
  role: z.literal("ta"),
  ...taFields,
});

const laCommon = {
  ...headerFields,
  role: z.literal("la"),
  feedback_type: z.literal("la_head_la"),
  ...laSharedFields,
};

const laPedHeadSchema = z.object({
  ...laCommon,
  la_head_type: z.literal("ped_head"),
  ...laPedFields,
});

const laLccSchema = z.object({
  ...laCommon,
  la_head_type: z.literal("lcc"),
  ...laLccFields,
});

const laPedLccSchema = z.object({
  ...laCommon,
  la_head_type: z.literal("ped_lcc"),
  ...laPedFields,
  ...laLccFields,
});

const laHeadLASchema = z.discriminatedUnion("la_head_type", [
  laPedHeadSchema,
  laLccSchema,
  laPedLccSchema,
]);

const laObservationSchema = z.object({
  ...headerFields,
  role: z.literal("la"),
  feedback_type: z.literal("la_observation"),
  ...obsFields,
});

const laSchema = z.discriminatedUnion("feedback_type", [
  laObservationSchema,
  laHeadLASchema,
]);

const studentSchema = z.discriminatedUnion("feedback_type", [
  studentMidQuarterSchema,
  studentEndOfQuarterSchema,
]);

export const feedbackFormSchema = z.discriminatedUnion("role", [
  studentSchema,
  taSchema,
  laSchema,
]) as unknown as z.ZodType<FeedbackFormValues, FeedbackFormValues>;
