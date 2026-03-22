import { z } from "zod";
import { isValid as luhnIsValid } from "luhn-js";

const required = (msg: string) => z.string().min(1, msg);

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
  hours: required("Please enter hours"),
};

export const mqFields = {
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

export const eqFields = {
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

export const laPedFields = {
  la_ped_seminars: required("Please select a response"),
  la_ped_applies: required("Please select a response"),
  la_ped_discusses: required("Please select a response"),
  la_ped_feedback: required("Please select a response"),
  la_ped_content_meeting: required("Please select a response"),
};

export const laLccFields = {
  la_lcc_emails: required("Please select a response"),
  la_lcc_comfortable: required("Please select a response"),
  la_lcc_answers: required("Please select a response"),
  la_lcc_announcements: required("Please select a response"),
  la_lcc_expectations: required("Please select a response"),
};

export const laSharedFields = {
  la_strengths: required("Please share your Head LA's strengths"),
  la_improve: required("Please share how your Head LA can improve"),
};

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
  obs_empathized: required("Please select a response"),
  obs_redirected: required("Please select a response"),
  obs_wait_time: required("Please select a response"),
  obs_open_closed: required("Please select a response"),
  obs_closed_check: required("Please select a response"),
  obs_peer_names: required("Please select a response"),
  obs_growth_mindset: required("Please select a response"),
  obs_circulated: required("Please select a response"),
  obs_environment: required("Please select a response"),
  obs_familiarity: required("Please select a response"),
  obs_devoted: required("Please select a response"),
  obs_strengths: required("Please share the LA's strengths"),
  obs_improve: required("Please share how the LA can improve"),
  obs_pedagogy_techniques: z.string().optional(),
  obs_comments: z.string().optional(),
};

export const taFields = {
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
