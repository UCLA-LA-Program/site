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
  { value: "no_change", label: "No change, but still room to improve" },
  { value: "little_improvement", label: "Little improvement" },
  { value: "big_improvement", label: "Big improvement" },
  {
    value: "no_room_for_improvement",
    label: "No room to improve (because of how well they were already doing)",
  },
];

export const AGREEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "strongly_disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "agree", label: "Agree" },
  { value: "strongly_agree", label: "Strongly Agree" },
];

export const ACTIVITIES = [
  { value: "discussion", label: "Discussion or lab section" },
  {
    value: "lecture",
    label: "Lecture (if you have interacted with LAs during lecture)",
  },
  { value: "office_hours", label: "Office hours" },
  { value: "study_session", label: "Review / study session" },
];

export const TA_QUESTIONS = [
  {
    value: "ta_comfortable",
    label:
      "The LA is comfortable with the material and/or asks me when needed...",
  },
  {
    value: "ta_circulates",
    label:
      "The LA circulates so every group gets to interact with an LA or TA during each section...",
  },
  {
    value: "ta_peer_names",
    label:
      "The LA uses peer names (even those that are harder to pronounce)...",
  },
  {
    value: "ta_devotes",
    label:
      "The LA devotes their time to their peers and does not become distracted...",
  },
  {
    value: "ta_empathizes",
    label: "The LA empathizes with struggling peers...",
  },
  {
    value: "ta_redirects",
    label:
      "The LA redirects questions to their peers to foster collaboration...",
  },
  {
    value: "ta_waits",
    label:
      "The LA waits a few seconds for students to respond after asking a question...",
  },
  {
    value: "ta_checks",
    label:
      "The LA checks student understanding before moving on to another topic (e.g., by asking a follow-up question)...",
  },
  {
    value: "ta_encourages",
    label:
      "The LA encourages participation and effort over correct answers...",
  },
  {
    value: "ta_creates",
    label:
      "The LA creates an environment within each group where every group member is engaged...",
  },
];

export const ROLE_OPTIONS = [
  { value: "la", label: "an LA." },
  { value: "student", label: "a student in an LA-supported course." },
  { value: "ta", label: "a TA who interacts with an LA." },
];

export const FEEDBACK_TYPE_OPTIONS = [
  { value: "mid_quarter", label: "Student to LA Mid-Quarter Feedback" },
  { value: "end_of_quarter", label: "Student to LA End-of-Quarter Feedback" },
];

export const LA_FEEDBACK_TYPE_OPTIONS = [
  { value: "la_observation", label: "LA Observation Feedback" },
  { value: "la_head_la", label: "LA to Head LA Feedback" },
];

export const LA_HEAD_TYPE_OPTIONS = [
  { value: "ped_head", label: "Pedagogy Head LA" },
  { value: "lcc", label: "LA Course Coordinator (LCC)" },
];

export const LA_PED_QUESTIONS = [
  {
    value: "la_ped_seminars",
    label:
      "My Head LA tries to engage all New LAs during Pedagogy Seminar discussions.",
  },
  {
    value: "la_ped_applies",
    label: "My Head LA helps me apply pedagogy techniques to my content course.",
  },
  {
    value: "la_ped_discusses",
    label:
      "My Head LA is happy to discuss any questions I have about pedagogy techniques.",
  },
  {
    value: "la_ped_feedback",
    label:
      "My Head LA gives me feedback to improve my LA skills if/when I ask for it.",
  },
  {
    value: "la_ped_content_meeting",
    label: "The content meeting for my course is well-run and organized.",
  },
];

export const LA_LCC_QUESTIONS = [
  {
    value: "la_lcc_emails",
    label: "My Head LA responds to emails in a timely manner.",
  },
  {
    value: "la_lcc_comfortable",
    label:
      "I feel comfortable reaching out to my Head LA for logistical questions.",
  },
  {
    value: "la_lcc_answers",
    label:
      "My Head LA is able to answer questions about the LA Program, or they direct me to the right person.",
  },
  {
    value: "la_lcc_announcements",
    label:
      "My Head LA provides useful announcements and reminders during content meetings.",
  },
  {
    value: "la_lcc_expectations",
    label:
      "Expectations for my assigned sections and content meetings are made clear to me.",
  },
];

export const BECOME_LA_OPTIONS = [
  { value: "yes_this", label: "Yes, for this course." },
  { value: "yes_other", label: "Yes, for another course." },
  { value: "maybe", label: "Maybe." },
  { value: "no_graduating", label: "No, because I am graduating." },
  { value: "no_uninterested", label: "No, because I am not interested." },
  { value: "na_already", label: "N/A – I am/was already an LA." },
];

export const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "nonbinary", label: "Nonbinary" },
  { value: "self_describe", label: "Prefer to self-describe" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const GROUP_OPTIONS = [
  { value: "african", label: "African" },
  { value: "african_american_black", label: "African American / Black" },
  { value: "other_black", label: "Other Black" },
  { value: "caribbean", label: "Caribbean" },
  { value: "mexican", label: "Mexican / Mexican American" },
  { value: "central_american", label: "Central American" },
  { value: "south_american", label: "South American" },
  { value: "puerto_rican", label: "Puerto Rican" },
  { value: "other_hispanic", label: "Other Hispanic or Latine/o/a" },
  { value: "chicane", label: "Chicane/o/a" },
  {
    value: "native_american",
    label: "Native American: American Indian or Alaskan Native",
  },
  {
    value: "pacific_islander",
    label: "Native Hawaiian or Other Pacific Islander",
  },
  {
    value: "east_asian",
    label: "East Asian (e.g., Chinese, Japanese, Korean, Taiwanese)",
  },
  { value: "mena_central_asian", label: "MENA / Central Asian" },
  {
    value: "south_asian",
    label: "South Asian (e.g., Pakistani, Indian, Nepalese, Sri Lankan)",
  },
  {
    value: "southeast_asian",
    label: "Southeast Asian (e.g., Filipino, Indonesian, Vietnamese)",
  },
  { value: "european", label: "European / European American" },
  { value: "other_white", label: "Other White" },
  { value: "other", label: "Other (specify below)" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const MID_QUARTER_QUESTIONS = [
  { value: "mq_approachable", label: "My LA is approachable." },
  {
    value: "mq_helpful",
    label: "My LA is helpful to my learning in this course.",
  },
  {
    value: "mq_familiar",
    label:
      "My LA is familiar with the course material (and/or asks the TA when needed).",
  },
  {
    value: "mq_engagement",
    label:
      "My LA helps create an environment in which every student in my group engages.",
  },
  {
    value: "mq_questioning",
    label:
      "My LA asks me why something is true more often than they explain to me why.",
  },
  {
    value: "mq_supportive",
    label: "My LA supports me if I am struggling and/or frustrated.",
  },
  { value: "mq_name", label: "My LA uses my name when interacting with me." },
  {
    value: "mq_belonging",
    label: "My LA helps me feel more like I belong in STEM.",
  },
  {
    value: "mq_checkin",
    label:
      "An LA checks in on my understanding in every section, especially if I am struggling.",
  },
  {
    value: "mq_small_groups",
    label:
      "This course allows LAs to facilitate learning by having students work in small groups.",
  },
];

export const END_OF_QUARTER_QUESTIONS = [
  {
    value: "eq_approachability",
    label: "How much improvement have you seen in your LA's approachability?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_helpfulness",
    label:
      "How much improvement have you seen in your LA's helpfulness to your learning in this course?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_familiarity",
    label:
      "How much improvement have you seen in your LA's familiarity with the course material?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_engagement",
    label:
      "How much improvement have you seen in your LA's ability to engage everyone in your group?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_questioning",
    label:
      "How much improvement have you seen in your LA's focus on asking questions before explaining?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_supportiveness",
    label:
      "How much improvement have you seen in your LA's supportiveness when you are struggling and/or frustrated?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_name_use",
    label:
      "How much improvement have you seen in your LA's use of your name when interacting with you?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_belonging_stem",
    label:
      "How much improvement have you seen in your LA's support of you feeling more like you belong in STEM?",
    options: IMPROVEMENT_OPTIONS,
  },
  {
    value: "eq_group_belonging",
    label:
      "My group in discussion section helped me feel more like I belong in this class.",
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "eq_group_reliance",
    label:
      "My group in discussion section helped me feel more like I can rely on other students for academic support.",
    options: AGREEMENT_OPTIONS,
  },
];
