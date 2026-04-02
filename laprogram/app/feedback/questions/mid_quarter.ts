import { FieldEntry, AGREEMENT_OPTIONS } from "./options";

export const MQ_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "mq_strengths",
    label: "What are your LA's strengths?",
    required: true,
  },
  {
    value: "mq_improve",
    label: "How can your LA improve to help you learn more?",
    required: true,
  },
] as const;

export const MQ_SENSITIVE_TEXT_FIELDS = [
  {
    value: "mq_course_change",
    label:
      "What would you change about this course to improve how LAs help you learn?",
    required: true,
  },
  {
    value: "mq_study_habits",
    label:
      "Is there anything you want to change about your own learning or study habits to improve your learning in this course?",
    required: false,
  },
] as const;

export const MQ_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "mq_approachable",
    label: "My LA is approachable.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_helpful",
    label: "My LA is helpful to my learning in this course.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_familiar",
    label:
      "My LA is familiar with the course material (and/or asks the TA when needed).",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_engagement",
    label:
      "My LA helps create an environment in which every student in my group engages.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_questioning",
    label:
      "My LA asks me why something is true more often than they explain to me why.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_supportive",
    label: "My LA supports me if I am struggling and/or frustrated.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_name",
    label: "My LA uses my name when interacting with me.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_belonging",
    label: "My LA helps me feel more like I belong in STEM.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_checkin",
    label:
      "An LA checks in on my understanding in every section, especially if I am struggling.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "mq_small_groups",
    label:
      "This course allows LAs to facilitate learning by having students work in small groups.",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
] as const;
