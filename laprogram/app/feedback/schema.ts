import { z } from "zod";
import { isValid as luhnIsValid } from "luhn-js";
import {
  EQ_NONSENSITIVE_QUESTIONS,
  EQ_SENSITIVE_QUESTIONS,
  EQ_NONSENSITIVE_TEXT_FIELDS,
} from "./questions/end_quarter";
import {
  LA_PED_NONSENSITIVE_QUESTIONS,
  LA_LCC_NONSENSITIVE_QUESTIONS,
  LA_HEAD_NONSENSITIVE_TEXT_FIELDS,
} from "./questions/head_la";
import {
  MQ_NONSENSITIVE_QUESTIONS,
  MQ_NONSENSITIVE_TEXT_FIELDS,
  MQ_SENSITIVE_TEXT_FIELDS,
} from "./questions/mid_quarter";
import {
  OBS_NONSENSITIVE_QUESTIONS,
  OBS_NONSENSITIVE_TEXT_FIELDS,
  OBS_SENSITIVE_TEXT_FIELDS,
} from "./questions/observation";
import { FieldEntry } from "./questions/options";
import {
  TA_NONSENSITIVE_QUESTIONS,
  TA_NONSENSITIVE_TEXT_FIELDS,
} from "./questions/ta";

const required = (msg: string) => z.string().min(1, msg);

// ---------------------------------------------------------------------------
// Helper to derive zod fields from constants
// ---------------------------------------------------------------------------

function zodFromFields(fields: readonly FieldEntry[]) {
  return Object.fromEntries(
    fields.map((f) => {
      const values = f.options?.map((o) => o.value);
      const schema = values
        ? z.enum(values as [string, ...string[]], {
            message: "Please select a response",
          })
        : f.required
          ? required(f.label)
          : z.string().optional();
      return [f.value, f.required ? schema : schema.optional()];
    }),
  );
}

// ---------------------------------------------------------------------------
// Shared field groups
// ---------------------------------------------------------------------------

const headerFields = {
  name: required("Name is required"),
  email: z.email("Please enter a valid email"),
  course: required("Please select a course"),
  la: required("Please select an LA"),
};

const closingFields = {
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

const studentSharedFields = {
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  hours: required("Please enter a number of hours"),
};

const mqFields = {
  ...zodFromFields(MQ_NONSENSITIVE_QUESTIONS),
  ...zodFromFields(MQ_NONSENSITIVE_TEXT_FIELDS),
  ...zodFromFields(MQ_SENSITIVE_TEXT_FIELDS),
};

const eqFields = {
  ...zodFromFields(EQ_NONSENSITIVE_QUESTIONS),
  ...zodFromFields(EQ_SENSITIVE_QUESTIONS),
  ...zodFromFields(EQ_NONSENSITIVE_TEXT_FIELDS),
};

const laPedFields = zodFromFields(LA_PED_NONSENSITIVE_QUESTIONS);

const laLccFields = zodFromFields(LA_LCC_NONSENSITIVE_QUESTIONS);

const laSharedFields = zodFromFields(LA_HEAD_NONSENSITIVE_TEXT_FIELDS);

const laFields = {
  la_head_type: z.string(),
  ...laPedFields,
  ...laLccFields,
  ...laSharedFields,
};

const obsFields = {
  obs_round: required("Please select a round"),
  obs_section: required("Please describe the observed section"),
  obs_la_position: required("Please select an LA position"),
  ...zodFromFields(OBS_NONSENSITIVE_QUESTIONS),
  ...zodFromFields(OBS_NONSENSITIVE_TEXT_FIELDS),
  ...zodFromFields(OBS_SENSITIVE_TEXT_FIELDS),
};

const taFields = {
  ...zodFromFields(TA_NONSENSITIVE_QUESTIONS),
  ...zodFromFields(TA_NONSENSITIVE_TEXT_FIELDS),
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
  role: z.literal("student"),
  feedback_type: z.literal("mid_quarter"),
  ...studentSharedFields,
  ...mqFields,
  ...closingFields,
});

const studentEndOfQuarterSchema = z.object({
  role: z.literal("student"),
  feedback_type: z.literal("end_of_quarter"),
  ...studentSharedFields,
  ...eqFields,
  ...closingFields,
});

const taSchema = z.object({
  role: z.literal("ta"),
  ...taFields,
});

const laCommon = {
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

export const feedbackFormSchema = z
  .object(headerFields)
  .and(
    z.discriminatedUnion("role", [studentSchema, taSchema, laSchema]),
  ) as unknown as z.ZodType<FeedbackFormValues, FeedbackFormValues>;
