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
  { value: "na", label: "N/A" },
  { value: "no-change", label: "No change, but still room to improve" },
  { value: "little-improvement", label: "Little improvement" },
  { value: "big-improvement", label: "Big improvement" },
  {
    value: "no-room-for-improvement",
    label: "No room to improve (because of how well they were already doing)",
  },
];

export const AGREEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "strongly-disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "agree", label: "Agree" },
  { value: "strongly-agree", label: "Strongly Agree" },
];

export const ACTIVITIES = [
  { value: "discussion", label: "Discussion or lab section" },
  {
    value: "lecture",
    label: "Lecture (if you have interacted with LAs during lecture)",
  },
  { value: "office-hours", label: "Office hours" },
  { value: "study-session", label: "Review / study session" },
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
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "nonbinary", label: "Nonbinary" },
  { value: "self-describe", label: "Prefer to self-describe" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const GROUP_OPTIONS = [
  { value: "african", label: "African" },
  { value: "african-american-black", label: "African American / Black" },
  { value: "other-black", label: "Other Black" },
  { value: "caribbean", label: "Caribbean" },
  { value: "mexican", label: "Mexican / Mexican American" },
  { value: "central-american", label: "Central American" },
  { value: "south-american", label: "South American" },
  { value: "puerto-rican", label: "Puerto Rican" },
  { value: "other-hispanic", label: "Other Hispanic or Latine/o/a" },
  { value: "chicane", label: "Chicane/o/a" },
  {
    value: "native-american",
    label: "Native American: American Indian or Alaskan Native",
  },
  {
    value: "pacific-islander",
    label: "Native Hawaiian or Other Pacific Islander",
  },
  {
    value: "east-asian",
    label: "East Asian (e.g., Chinese, Japanese, Korean, Taiwanese)",
  },
  { value: "mena-central-asian", label: "MENA / Central Asian" },
  {
    value: "south-asian",
    label: "South Asian (e.g., Pakistani, Indian, Nepalese, Sri Lankan)",
  },
  {
    value: "southeast-asian",
    label: "Southeast Asian (e.g., Filipino, Indonesian, Vietnamese)",
  },
  { value: "european", label: "European / European American" },
  { value: "other-white", label: "Other White" },
  { value: "other", label: "Other (specify below)" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const MID_QUARTER_QUESTIONS = [
  { value: "mq-approachable", label: "My LA is approachable." },
  {
    value: "mq-helpful",
    label: "My LA is helpful to my learning in this course.",
  },
  {
    value: "mq-familiar",
    label:
      "My LA is familiar with the course material (and/or asks the TA when needed).",
  },
  {
    value: "mq-engagement",
    label:
      "My LA helps create an environment in which every student in my group engages.",
  },
  {
    value: "mq-questioning",
    label:
      "My LA asks me why something is true more often than they explain to me why.",
  },
  {
    value: "mq-supportive",
    label: "My LA supports me if I am struggling and/or frustrated.",
  },
  { value: "mq-name", label: "My LA uses my name when interacting with me." },
  {
    value: "mq-belonging",
    label: "My LA helps me feel more like I belong in STEM.",
  },
  {
    value: "mq-checkin",
    label:
      "An LA checks in on my understanding in every section, especially if I am struggling.",
  },
  {
    value: "mq-small-groups",
    label:
      "This course allows LAs to facilitate learning by having students work in small groups.",
  },
];

export const END_OF_QUARTER_QUESTIONS = [
  {
    value: "approachability",
    label: "How much improvement have you seen in your LA's approachability?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "helpfulness",
    label:
      "How much improvement have you seen in your LA's helpfulness to your learning in this course?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "familiarity",
    label:
      "How much improvement have you seen in your LA's familiarity with the course material?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "engagement",
    label:
      "How much improvement have you seen in your LA's ability to engage everyone in your group?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "questioning",
    label:
      "How much improvement have you seen in your LA's focus on asking questions before explaining?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "supportiveness",
    label:
      "How much improvement have you seen in your LA's supportiveness when you are struggling and/or frustrated?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "name-use",
    label:
      "How much improvement have you seen in your LA's use of your name when interacting with you?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "belonging-stem",
    label:
      "How much improvement have you seen in your LA's support of you feeling more like you belong in STEM?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "group-belonging",
    label:
      "My group in discussion section helped me feel more like I belong in this class.",
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "group-reliance",
    label:
      "My group in discussion section helped me feel more like I can rely on other students for academic support.",
    options: AGREEMENT_OPTIONS,
  },
];
