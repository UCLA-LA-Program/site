import { FieldEntry, IMPROVEMENT_OPTIONS, AGREEMENT_OPTIONS } from "./options";

export const EQ_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "eq_comments",
    label:
      "Are there any final comments you'd like to share with your LA now that the quarter is coming to an end?",
    required: true,
  },
] as const;

export const EQ_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "eq_approachability",
    label: "How much improvement have you seen in your LA's approachability?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_helpfulness",
    label:
      "How much improvement have you seen in your LA's helpfulness to your learning in this course?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_familiarity",
    label:
      "How much improvement have you seen in your LA's familiarity with the course material?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_engagement",
    label:
      "How much improvement have you seen in your LA's ability to engage everyone in your group?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_questioning",
    label:
      "How much improvement have you seen in your LA's focus on asking questions before explaining?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_supportiveness",
    label:
      "How much improvement have you seen in your LA's supportiveness when you are struggling and/or frustrated?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_name_use",
    label:
      "How much improvement have you seen in your LA's use of your name when interacting with you?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_belonging_stem",
    label:
      "How much improvement have you seen in your LA's support of you feeling more like you belong in STEM?",
    required: true,
    options: IMPROVEMENT_OPTIONS,
  },
];

export const EQ_SENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "eq_group_belonging",
    label:
      "My group in discussion section helped me feel more like I belong in this class.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "eq_group_reliance",
    label:
      "My group in discussion section helped me feel more like I can rely on other students for academic support.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
];
