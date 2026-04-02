import { FieldEntry, AGREEMENT_OPTIONS } from "./options";

export const LA_HEAD_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "la_strengths",
    label: "What are some of your Head LA's strengths?",
    required: true,
  },
  {
    value: "la_improve",
    label:
      "What can your Head LA improve upon or do differently to better support you?",
    required: true,
  },
] as const;

export const LA_PED_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "la_ped_seminars",
    label:
      "My Head LA tries to engage all New LAs during Pedagogy Seminar discussions.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_ped_applies",
    label:
      "My Head LA helps me apply pedagogy techniques to my content course.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_ped_discusses",
    label:
      "My Head LA is happy to discuss any questions I have about pedagogy techniques.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_ped_feedback",
    label:
      "My Head LA gives me feedback to improve my LA skills if/when I ask for it.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_ped_content_meeting",
    label: "The content meeting for my course is well-run and organized.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
];

export const LA_LCC_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "la_lcc_emails",
    label: "My Head LA responds to emails in a timely manner.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_lcc_comfortable",
    label:
      "I feel comfortable reaching out to my Head LA for logistical questions.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_lcc_answers",
    label:
      "My Head LA is able to answer questions about the LA Program, or they direct me to the right person.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_lcc_announcements",
    label:
      "My Head LA provides useful announcements and reminders during content meetings.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "la_lcc_expectations",
    label:
      "Expectations for my assigned sections and content meetings are made clear to me.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
];
