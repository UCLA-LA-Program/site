import { z } from "zod";
import { isValid as luhnIsValid } from "luhn-js";

const required = (msg: string) => z.string().min(1, msg);

const baseSchema = z.object({
  // Header fields
  name: required("Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  role: required("Please select a role"),
  course: required("Please select a course"),
  la: required("Please select an LA"),

  // Conditionally required — student only
  feedback_type: z.string(),
  activities: z.array(z.string()),
  hours: z.string(),

  // Mid-quarter fields
  mq_approachable: z.string(),
  mq_helpful: z.string(),
  mq_familiar: z.string(),
  mq_engagement: z.string(),
  mq_questioning: z.string(),
  mq_supportive: z.string(),
  mq_name: z.string(),
  mq_belonging: z.string(),
  mq_checkin: z.string(),
  mq_small_groups: z.string(),
  mq_strengths: z.string(),
  mq_improve: z.string(),
  mq_course_change: z.string(),
  mq_study_habits: z.string().optional(),

  // End-of-quarter fields
  eq_approachability: z.string(),
  eq_helpfulness: z.string(),
  eq_familiarity: z.string(),
  eq_engagement: z.string(),
  eq_questioning: z.string(),
  eq_supportiveness: z.string(),
  eq_name_use: z.string(),
  eq_belonging_stem: z.string(),
  eq_group_belonging: z.string(),
  eq_group_reliance: z.string(),
  eq_comments: z.string(),

  // LA Head LA fields
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

  // TA fields
  ta_comfortable: z.string(),
  ta_circulates: z.string(),
  ta_peer_names: z.string(),
  ta_devotes: z.string(),
  ta_empathizes: z.string(),
  ta_redirects: z.string(),
  ta_waits: z.string(),
  ta_checks: z.string(),
  ta_encourages: z.string(),
  ta_creates: z.string(),
  ta_strengths: z.string(),
  ta_improve: z.string(),
  ta_comments: z.string().optional(),

  // Closing fields — student only
  courses_without_las: z.string().optional(),
  become_la: z.string(),
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
});

function req(
  ctx: z.RefinementCtx,
  val: string | undefined,
  path: string,
  message: string,
) {
  if (!val || val.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  }
}

export const feedbackFormSchema = baseSchema.superRefine((data, ctx) => {
  if (data.role === "student") {
    req(ctx, data.feedback_type, "feedback_type", "Please select a feedback type");
    if (!data.activities.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["activities"],
        message: "Please select at least one activity",
      });
    }
    req(ctx, data.hours, "hours", "Please enter hours");

    if (data.feedback_type === "mid_quarter") {
      req(ctx, data.mq_approachable, "mq_approachable", "Please select a response");
      req(ctx, data.mq_helpful, "mq_helpful", "Please select a response");
      req(ctx, data.mq_familiar, "mq_familiar", "Please select a response");
      req(ctx, data.mq_engagement, "mq_engagement", "Please select a response");
      req(ctx, data.mq_questioning, "mq_questioning", "Please select a response");
      req(ctx, data.mq_supportive, "mq_supportive", "Please select a response");
      req(ctx, data.mq_name, "mq_name", "Please select a response");
      req(ctx, data.mq_belonging, "mq_belonging", "Please select a response");
      req(ctx, data.mq_checkin, "mq_checkin", "Please select a response");
      req(ctx, data.mq_small_groups, "mq_small_groups", "Please select a response");
      req(ctx, data.mq_strengths, "mq_strengths", "Please share your LA's strengths");
      req(ctx, data.mq_improve, "mq_improve", "Please share how your LA can improve");
      req(ctx, data.mq_course_change, "mq_course_change", "Please share what you would change");
    }

    if (data.feedback_type === "end_of_quarter") {
      req(ctx, data.eq_approachability, "eq_approachability", "Please select a response");
      req(ctx, data.eq_helpfulness, "eq_helpfulness", "Please select a response");
      req(ctx, data.eq_familiarity, "eq_familiarity", "Please select a response");
      req(ctx, data.eq_engagement, "eq_engagement", "Please select a response");
      req(ctx, data.eq_questioning, "eq_questioning", "Please select a response");
      req(ctx, data.eq_supportiveness, "eq_supportiveness", "Please select a response");
      req(ctx, data.eq_name_use, "eq_name_use", "Please select a response");
      req(ctx, data.eq_belonging_stem, "eq_belonging_stem", "Please select a response");
      req(ctx, data.eq_group_belonging, "eq_group_belonging", "Please select a response");
      req(ctx, data.eq_group_reliance, "eq_group_reliance", "Please select a response");
      req(ctx, data.eq_comments, "eq_comments", "Please share any final comments");
    }

    req(ctx, data.become_la, "become_la", "Please select an option");
  }

  if (data.role === "la" && data.feedback_type === "la_head_la") {
    if (!data.la_head_type.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["la_head_type"],
        message: "Please select at least one option",
      });
    }
    if (data.la_head_type.includes("ped_head")) {
      req(ctx, data.la_ped_seminars, "la_ped_seminars", "Please select a response");
      req(ctx, data.la_ped_applies, "la_ped_applies", "Please select a response");
      req(ctx, data.la_ped_discusses, "la_ped_discusses", "Please select a response");
      req(ctx, data.la_ped_feedback, "la_ped_feedback", "Please select a response");
      req(ctx, data.la_ped_content_meeting, "la_ped_content_meeting", "Please select a response");
    }
    if (data.la_head_type.includes("lcc")) {
      req(ctx, data.la_lcc_emails, "la_lcc_emails", "Please select a response");
      req(ctx, data.la_lcc_comfortable, "la_lcc_comfortable", "Please select a response");
      req(ctx, data.la_lcc_answers, "la_lcc_answers", "Please select a response");
      req(ctx, data.la_lcc_announcements, "la_lcc_announcements", "Please select a response");
      req(ctx, data.la_lcc_expectations, "la_lcc_expectations", "Please select a response");
    }
    req(ctx, data.la_strengths, "la_strengths", "Please share your Head LA's strengths");
    req(ctx, data.la_improve, "la_improve", "Please share how your Head LA can improve");
  }

  if (data.role === "ta") {
    req(ctx, data.ta_comfortable, "ta_comfortable", "Please select a response");
    req(ctx, data.ta_circulates, "ta_circulates", "Please select a response");
    req(ctx, data.ta_peer_names, "ta_peer_names", "Please select a response");
    req(ctx, data.ta_devotes, "ta_devotes", "Please select a response");
    req(ctx, data.ta_empathizes, "ta_empathizes", "Please select a response");
    req(ctx, data.ta_redirects, "ta_redirects", "Please select a response");
    req(ctx, data.ta_waits, "ta_waits", "Please select a response");
    req(ctx, data.ta_checks, "ta_checks", "Please select a response");
    req(ctx, data.ta_encourages, "ta_encourages", "Please select a response");
    req(ctx, data.ta_creates, "ta_creates", "Please select a response");
    req(ctx, data.ta_strengths, "ta_strengths", "Please share the LA's strengths");
    req(ctx, data.ta_improve, "ta_improve", "Please share how the LA can improve");
  }
});

export type FeedbackFormValues = z.infer<typeof baseSchema>;

const defaultValues: FeedbackFormValues = {
  name: "",
  email: "",
  role: "",
  course: "",
  la: "",
  feedback_type: "",
  activities: [],
  hours: "",

  mq_approachable: "",
  mq_helpful: "",
  mq_familiar: "",
  mq_engagement: "",
  mq_questioning: "",
  mq_supportive: "",
  mq_name: "",
  mq_belonging: "",
  mq_checkin: "",
  mq_small_groups: "",
  mq_strengths: "",
  mq_improve: "",
  mq_course_change: "",
  mq_study_habits: "",

  eq_approachability: "",
  eq_helpfulness: "",
  eq_familiarity: "",
  eq_engagement: "",
  eq_questioning: "",
  eq_supportiveness: "",
  eq_name_use: "",
  eq_belonging_stem: "",
  eq_group_belonging: "",
  eq_group_reliance: "",
  eq_comments: "",

  la_head_type: [],
  la_ped_seminars: "",
  la_ped_applies: "",
  la_ped_discusses: "",
  la_ped_feedback: "",
  la_ped_content_meeting: "",
  la_lcc_emails: "",
  la_lcc_comfortable: "",
  la_lcc_answers: "",
  la_lcc_announcements: "",
  la_lcc_expectations: "",
  la_strengths: "",
  la_improve: "",

  ta_comfortable: "",
  ta_circulates: "",
  ta_peer_names: "",
  ta_devotes: "",
  ta_empathizes: "",
  ta_redirects: "",
  ta_waits: "",
  ta_checks: "",
  ta_encourages: "",
  ta_creates: "",
  ta_strengths: "",
  ta_improve: "",
  ta_comments: "",

  courses_without_las: "",
  become_la: "",
  uid: "",
  gender: "",
  gender_other: "",
  groups: [],
  group_other: "",
  la_program_comments: "",
};

export { defaultValues };
