import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { isValid as luhnIsValid } from "luhn-js";

export const feedbackFormSchema = z.object({
  // Header fields
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  role: z.string().min(1, "Please select a role"),
  course: z.string().min(1, "Please select a course"),
  la: z.string().min(1, "Please select an LA"),
  feedbackType: z.string().min(1, "Please select a feedback type"),

  // Shared fields
  activities: z.array(z.string()).min(1, "Please select at least one activity"),
  hours: z.string().min(1, "Please enter hours"),

  // Mid-quarter fields
  mqApproachable: z.string().min(1, "Please select a response"),
  mqHelpful: z.string().min(1, "Please select a response"),
  mqFamiliar: z.string().min(1, "Please select a response"),
  mqEngagement: z.string().min(1, "Please select a response"),
  mqQuestioning: z.string().min(1, "Please select a response"),
  mqSupportive: z.string().min(1, "Please select a response"),
  mqName: z.string().min(1, "Please select a response"),
  mqBelonging: z.string().min(1, "Please select a response"),
  mqCheckin: z.string().min(1, "Please select a response"),
  mqSmallGroups: z.string().min(1, "Please select a response"),
  mqStrengths: z.string().min(1, "Please share your LA's strengths"),
  mqImprove: z.string().min(1, "Please share how your LA can improve"),
  mqCourseChange: z.string().min(1, "Please share what you would change"),
  mqStudyHabits: z.string().optional(),

  // End-of-quarter fields
  eqApproachability: z.string().min(1, "Please select a response"),
  eqHelpfulness: z.string().min(1, "Please select a response"),
  eqFamiliarity: z.string().min(1, "Please select a response"),
  eqEngagement: z.string().min(1, "Please select a response"),
  eqQuestioning: z.string().min(1, "Please select a response"),
  eqSupportiveness: z.string().min(1, "Please select a response"),
  eqNameUse: z.string().min(1, "Please select a response"),
  eqBelongingStem: z.string().min(1, "Please select a response"),
  eqGroupBelonging: z.string().min(1, "Please select a response"),
  eqGroupReliance: z.string().min(1, "Please select a response"),
  eqComments: z.string().min(1, "Please share any final comments"),

  // Closing fields (shared)
  coursesWithoutLAs: z.string().optional(),
  becomeLA: z.string().min(1, "Please select an option"),
  uid: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        (val.length === 9 && /^\d{9}$/.test(val) && luhnIsValid(val)),
      {
        message: "Please enter a valid 9-digit UID",
      },
    )
    .optional(),
  gender: z.string().optional(),
  genderOther: z.string().optional(),
  groups: z.array(z.string()).optional(),
  groupOther: z.string().optional(),
  laProgramComments: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export const defaultValues: FeedbackFormValues = {
  name: "",
  email: "",
  role: "",
  course: "",
  la: "",
  feedbackType: "",
  activities: [],
  hours: "",

  mqApproachable: "",
  mqHelpful: "",
  mqFamiliar: "",
  mqEngagement: "",
  mqQuestioning: "",
  mqSupportive: "",
  mqName: "",
  mqBelonging: "",
  mqCheckin: "",
  mqSmallGroups: "",
  mqStrengths: "",
  mqImprove: "",
  mqCourseChange: "",
  mqStudyHabits: "",

  eqApproachability: "",
  eqHelpfulness: "",
  eqFamiliarity: "",
  eqEngagement: "",
  eqQuestioning: "",
  eqSupportiveness: "",
  eqNameUse: "",
  eqBelongingStem: "",
  eqGroupBelonging: "",
  eqGroupReliance: "",
  eqComments: "",

  coursesWithoutLAs: "",
  becomeLA: "",
  uid: "",
  gender: "",
  genderOther: "",
  groups: [],
  groupOther: "",
  laProgramComments: "",
};

// Never called — exists only to infer the form instance type
function _feedbackFormFactory() {
  return useForm({
    defaultValues,
    validators: { onSubmit: feedbackFormSchema },
    onSubmit: async () => {},
  });
}
export type FeedbackFormInstance = ReturnType<typeof _feedbackFormFactory>;
