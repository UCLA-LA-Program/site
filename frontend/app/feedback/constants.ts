export const COURSES = [
  "CS 31 – Introduction to Computer Science I",
  "CS 32 – Object-Oriented Programming",
  "CS 33 – Introduction to Computer Organization",
  "CS 35L – Software Construction Laboratory",
  "MATH 31A – Differential and Integral Calculus",
  "MATH 31B – Integration and Infinite Series",
  "MATH 32A – Calculus of Several Variables",
  "PHYSICS 1A – Physics for Scientists and Engineers",
  "PHYSICS 1B – Physics for Scientists and Engineers",
  "CHEM 14A – Atomic and Molecular Structure",
  "CHEM 14B – Thermodynamics and Kinetics",
  "No LA",
];

export const LAS = ["AAAA", "BBBB", "CCCC", "No LA"];

export const IMPROVEMENT_OPTIONS = [
  "N/A",
  "No change",
  "A little improvement",
  "Some improvement",
  "A lot of improvement",
];

export const AGREEMENT_OPTIONS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

export const ACTIVITIES = [
  { id: "discussion", label: "Discussion or lab section" },
  {
    id: "lecture",
    label: "Lecture (if you have interacted with LAs during lecture)",
  },
  { id: "office-hours", label: "Office hours" },
  { id: "study-session", label: "Review / study session" },
];

export const ROLE_OPTIONS = [
  { value: "la", label: "an LA." },
  { value: "student", label: "a student in an LA-supported course." },
  { value: "ta", label: "a TA who interacts with an LA." },
];

export const FEEDBACK_TYPE_OPTIONS = [
  { value: "mid-quarter", label: "Student to LA Mid-Quarter Feedback" },
  { value: "end-of-quarter", label: "Student to LA End-of-Quarter Feedback" },
];

export const BECOME_LA_OPTIONS = [
  { value: "yes-this", label: "Yes, for this course." },
  { value: "yes-other", label: "Yes, for another course." },
  { value: "maybe", label: "Maybe." },
  { value: "no-graduating", label: "No, because I am graduating." },
  { value: "no-uninterested", label: "No, because I am not interested." },
  { value: "na-already", label: "N/A – I am/was already an LA." },
];

export const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Nonbinary",
  "Prefer to self-describe",
  "Prefer not to say",
];

export const GROUP_OPTIONS = [
  { id: "grp-african", label: "African" },
  { id: "grp-african-american-black", label: "African American / Black" },
  { id: "grp-other-black", label: "Other Black" },
  { id: "grp-caribbean", label: "Caribbean" },
  { id: "grp-mexican", label: "Mexican / Mexican American" },
  { id: "grp-central-american", label: "Central American" },
  { id: "grp-south-american", label: "South American" },
  { id: "grp-puerto-rican", label: "Puerto Rican" },
  { id: "grp-other-hispanic", label: "Other Hispanic or Latine/o/a" },
  { id: "grp-chicane", label: "Chicane/o/a" },
  {
    id: "grp-native-american",
    label: "Native American: American Indian or Alaskan Native",
  },
  {
    id: "grp-pacific-islander",
    label: "Native Hawaiian or Other Pacific Islander",
  },
  {
    id: "grp-east-asian",
    label: "East Asian (e.g., Chinese, Japanese, Korean, Taiwanese)",
  },
  { id: "grp-mena-central-asian", label: "MENA / Central Asian" },
  {
    id: "grp-south-asian",
    label: "South Asian (e.g., Pakistani, Indian, Nepalese, Sri Lankan)",
  },
  {
    id: "grp-southeast-asian",
    label: "Southeast Asian (e.g., Filipino, Indonesian, Vietnamese)",
  },
  { id: "grp-european", label: "European / European American" },
  { id: "grp-other-white", label: "Other White" },
  { id: "grp-other", label: "Other (specify below)" },
  { id: "grp-prefer-not-to-say", label: "Prefer not to say" },
];

export const MID_QUARTER_QUESTIONS = [
  { id: "mq-approachable", label: "My LA is approachable." },
  {
    id: "mq-helpful",
    label: "My LA is helpful to my learning in this course.",
  },
  {
    id: "mq-familiar",
    label:
      "My LA is familiar with the course material (and/or asks the TA when needed).",
  },
  {
    id: "mq-engagement",
    label:
      "My LA helps create an environment in which every student in my group engages.",
  },
  {
    id: "mq-questioning",
    label:
      "My LA asks me why something is true more often than they explain to me why.",
  },
  {
    id: "mq-supportive",
    label: "My LA supports me if I am struggling and/or frustrated.",
  },
  { id: "mq-name", label: "My LA uses my name when interacting with me." },
  {
    id: "mq-belonging",
    label: "My LA helps me feel more like I belong in STEM.",
  },
  {
    id: "mq-checkin",
    label:
      "An LA checks in on my understanding in every section, especially if I am struggling.",
  },
  {
    id: "mq-small-groups",
    label:
      "This course allows LAs to facilitate learning by having students work in small groups.",
  },
];

export const END_OF_QUARTER_QUESTIONS = [
  {
    id: "approachability",
    label: "How much improvement have you seen in your LA's approachability?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "helpfulness",
    label:
      "How much improvement have you seen in your LA's helpfulness to your learning in this course?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "familiarity",
    label:
      "How much improvement have you seen in your LA's familiarity with the course material?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "engagement",
    label:
      "How much improvement have you seen in your LA's ability to engage everyone in your group?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "questioning",
    label:
      "How much improvement have you seen in your LA's focus on asking questions before explaining?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "supportiveness",
    label:
      "How much improvement have you seen in your LA's supportiveness when you are struggling and/or frustrated?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "name-use",
    label:
      "How much improvement have you seen in your LA's use of your name when interacting with you?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "belonging-stem",
    label:
      "How much improvement have you seen in your LA's support of you feeling more like you belong in STEM?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    id: "group-belonging",
    label:
      "My group in discussion section helped me feel more like I belong in this class.",
    options: AGREEMENT_OPTIONS,
  },
  {
    id: "group-reliance",
    label:
      "My group in discussion section helped me feel more like I can rely on other students for academic support.",
    options: AGREEMENT_OPTIONS,
  },
];
