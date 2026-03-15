import { z } from "zod";
import { isValid as luhnIsValid } from "luhn-js";

const required = (msg: string) => z.string().min(1, msg);

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
  hours: required("Please enter hours"),
};

const mqFields = {
  mq_approachable: required("Please select a response"),
  mq_helpful: required("Please select a response"),
  mq_familiar: required("Please select a response"),
  mq_engagement: required("Please select a response"),
  mq_questioning: required("Please select a response"),
  mq_supportive: required("Please select a response"),
  mq_name: required("Please select a response"),
  mq_belonging: required("Please select a response"),
  mq_checkin: required("Please select a response"),
  mq_small_groups: required("Please select a response"),
  mq_strengths: required("Please share your LA's strengths"),
  mq_improve: required("Please share how your LA can improve"),
  mq_course_change: required("Please share what you would change"),
  mq_study_habits: z.string().optional(),
};

const eqFields = {
  eq_approachability: required("Please select a response"),
  eq_helpfulness: required("Please select a response"),
  eq_familiarity: required("Please select a response"),
  eq_engagement: required("Please select a response"),
  eq_questioning: required("Please select a response"),
  eq_supportiveness: required("Please select a response"),
  eq_name_use: required("Please select a response"),
  eq_belonging_stem: required("Please select a response"),
  eq_group_belonging: required("Please select a response"),
  eq_group_reliance: required("Please select a response"),
  eq_comments: required("Please share any final comments"),
};

const laFields = {
  la_head_type: z.array(z.string()),
  la_ped_seminars: z.string(),
  la_ped_applies: z.string(),
  la_ped_discusses: z.string(),
  la_ped_feedback: z.string(),
  la_ped_content_meeting: z.string(),
  la_lcc_emails: z.string(),
  la_lcc_comfortable: z.string(),
  la_lcc_answers: z.string(),
  la_lcc_announcements: z.string(),
  la_lcc_expectations: z.string(),
  la_strengths: z.string(),
  la_improve: z.string(),
};

const taFields = {
  ta_comfortable: required("Please select a response"),
  ta_circulates: required("Please select a response"),
  ta_peer_names: required("Please select a response"),
  ta_devotes: required("Please select a response"),
  ta_empathizes: required("Please select a response"),
  ta_redirects: required("Please select a response"),
  ta_waits: required("Please select a response"),
  ta_checks: required("Please select a response"),
  ta_encourages: required("Please select a response"),
  ta_creates: required("Please select a response"),
  ta_strengths: required("Please share the LA's strengths"),
  ta_improve: required("Please share how the LA can improve"),
  ta_comments: z.string().optional(),
};

// Built from field groups — single source of truth for FeedbackFormValues
export const baseSchema = z.object({
  ...headerFields,
  role: z.string(),
  feedback_type: z.string(),
  ...studentSharedFields,
  ...mqFields,
  ...eqFields,
  ...laFields,
  ...taFields,
  ...closingFields,
});

export type FeedbackFormValues = z.infer<typeof baseSchema>;

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

const laHeadLASchema = z
  .object({
    ...headerFields,
    role: z.literal("la"),
    feedback_type: z.literal("la_head_la"),
    la_head_type: z
      .array(z.string())
      .min(1, "Please select at least one option"),
    la_ped_seminars: z.string().optional(),
    la_ped_applies: z.string().optional(),
    la_ped_discusses: z.string().optional(),
    la_ped_feedback: z.string().optional(),
    la_ped_content_meeting: z.string().optional(),
    la_lcc_emails: z.string().optional(),
    la_lcc_comfortable: z.string().optional(),
    la_lcc_answers: z.string().optional(),
    la_lcc_announcements: z.string().optional(),
    la_lcc_expectations: z.string().optional(),
    la_strengths: required("Please share your Head LA's strengths"),
    la_improve: required("Please share how your Head LA can improve"),
  })
  .superRefine((data, ctx) => {
    if (data.la_head_type.includes("ped_head")) {
      for (const [field, msg] of [
        ["la_ped_seminars", "Please select a response"],
        ["la_ped_applies", "Please select a response"],
        ["la_ped_discusses", "Please select a response"],
        ["la_ped_feedback", "Please select a response"],
        ["la_ped_content_meeting", "Please select a response"],
      ] as const) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: msg,
          });
        }
      }
    }
    if (data.la_head_type.includes("lcc")) {
      for (const [field, msg] of [
        ["la_lcc_emails", "Please select a response"],
        ["la_lcc_comfortable", "Please select a response"],
        ["la_lcc_answers", "Please select a response"],
        ["la_lcc_announcements", "Please select a response"],
        ["la_lcc_expectations", "Please select a response"],
      ] as const) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: msg,
          });
        }
      }
    }
  });

const studentSchema = z.discriminatedUnion("feedback_type", [
  studentMidQuarterSchema,
  studentEndOfQuarterSchema,
]);

export const feedbackFormSchema = z.discriminatedUnion("role", [
  studentSchema,
  taSchema,
  laHeadLASchema,
]) as unknown as z.ZodType<FeedbackFormValues, FeedbackFormValues>;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const ARRAY_FIELDS: (keyof FeedbackFormValues)[] = [
  "activities",
  "la_head_type",
  "groups",
];

const defaultValues = Object.fromEntries(
  Object.keys(baseSchema.shape).map((key) => [
    key,
    ARRAY_FIELDS.includes(key as keyof FeedbackFormValues) ? [] : "",
  ]),
) as unknown as FeedbackFormValues;

export { defaultValues };
