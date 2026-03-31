export const LA_POSITION_OPTIONS = [
  { value: "new", label: "New LA" },
  { value: "ret", label: "Returning LA" },
  { value: "ped", label: "Pedagogy Head LA" },
  { value: "lcc", label: "LA Course Coordinator (LCC)" },
  { value: "ret_lcc", label: "Returner + LCC" },
  { value: "ped_lcc", label: "Pedagogy Head + LCC" },
];

export const LA_POSITION_MAP = new Map(
  LA_POSITION_OPTIONS.map((o) => [o.value, o.label]),
);

export type FieldEntry = {
  value: string;
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
};

const IMPROVEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "no_change", label: "No change, but still room to improve" },
  { value: "little_improvement", label: "Little improvement" },
  { value: "big_improvement", label: "Big improvement" },
  {
    value: "no_room_for_improvement",
    label: "No room to improve (because of how well they were already doing)",
  },
];

const AGREEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "strongly_disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "agree", label: "Agree" },
  { value: "strongly_agree", label: "Strongly Agree" },
];

const OBSERVATION_OPTIONS = [
  { value: "na", label: "N/A (no opportunities to do so)" },
  { value: "not_yet", label: "Not yet" },
  { value: "almost_never", label: "Almost never" },
  { value: "sometimes", label: "Sometimes" },
  {
    value: "most_missed",
    label: "Most of the time (because the LA missed opportunities)",
  },
  {
    value: "most_instructor",
    label:
      "Most of the time (because the instructor was talking >50% of the time)",
  },
  { value: "always", label: "Always" },
];

export const ACTIVITIES = [
  { value: "discussion", label: "Discussion/Lab Section" },
  {
    value: "lecture",
    label: "Lecture",
  },
  { value: "office_hours", label: "Office Hours" },
  { value: "study_session", label: "Review/Study Session" },
];

export const TA_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "ta_comfortable",
    label:
      "The LA is comfortable with the material and/or asks me when needed...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_circulates",
    label:
      "The LA circulates so every group gets to interact with an LA or TA during each section...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_peer_names",
    label:
      "The LA uses peer names (even those that are harder to pronounce)...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_devotes",
    label:
      "The LA devotes their time to their peers and does not become distracted...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_empathizes",
    label: "The LA empathizes with struggling peers...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_redirects",
    label:
      "The LA redirects questions to their peers to foster collaboration...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_waits",
    label:
      "The LA waits a few seconds for students to respond after asking a question...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_checks",
    label:
      "The LA checks student understanding before moving on to another topic (e.g., by asking a follow-up question)...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_encourages",
    label: "The LA encourages participation and effort over correct answers...",
    required: true,
    options: AGREEMENT_OPTIONS,
  },
  {
    value: "ta_creates",
    label:
      "The LA creates an environment within each group where every group member is engaged...",
    required: true,
    options: AGREEMENT_OPTIONS,
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
  { value: "ped_lcc", label: "Both Ped Head and LCC" },
];

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

// ---------------------------------------------------------------------------
// Free-text field labels (shared between form sections and view tables)
// ---------------------------------------------------------------------------

export const OBS_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "obs_strengths",
    label: "What are the LA's strengths at the moment?",
    required: true,
  },
  {
    value: "obs_improve",
    label: "What can the LA improve at the moment?",
    required: true,
  },
  { value: "obs_comments", label: "Additional Comments", required: false },
] as const;

export const OBS_SENSITIVE_TEXT_FIELDS = [
  {
    value: "obs_pedagogy_techniques",
    label:
      "Did you notice your peer implementing pedagogy techniques in a way similar to you, different from you, and/or in a way you want to try?",
    required: false,
  },
] as const;

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

export const EQ_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "eq_comments",
    label:
      "Are there any final comments you'd like to share with your LA now that the quarter is coming to an end?",
    required: true,
  },
] as const;

export const TA_NONSENSITIVE_TEXT_FIELDS = [
  {
    value: "ta_strengths",
    label: "What are the LA's strengths currently?",
    required: true,
  },
  {
    value: "ta_improve",
    label: "What can the LA improve currently?",
    required: true,
  },
  { value: "ta_comments", label: "Any additional comments?", required: false },
] as const;

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

export const OBSERVATION_ROUND_OPTIONS = [
  { value: "round_1", label: "Observations Round 1 (Weeks 3-4)" },
  { value: "round_2", label: "Observations Round 2 (Weeks 7-8)" },
];

export const OBSERVATION_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
  {
    value: "obs_empathized",
    label: "The LA empathized with struggling peers...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_redirected",
    label: "The LA redirected questions to foster collaboration...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_wait_time",
    label: "The LA used wait time...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_open_closed",
    label:
      "The LA asked a mix of open and closed questions to encourage engagement...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_closed_check",
    label:
      "The LA asked closed questions to check for understanding before moving on...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_peer_names",
    label:
      "The LA used peer names (even those that are harder to pronounce)...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_growth_mindset",
    label:
      "The LA used growth mindset feedback (e.g., encouraging participation and effort over correct answers)...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_circulated",
    label:
      "The LA circulated so that every group got to interact with an LA during the section...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_environment",
    label:
      "The LA created an environment within each group where every group member was engaged...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_familiarity",
    label:
      "The LA demonstrated familiarity with the material (and/or asked the TA when needed)...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
  {
    value: "obs_devoted",
    label:
      "The LA devoted their attention to their peers and did not become distracted...",
    required: true,
    options: OBSERVATION_OPTIONS,
  },
];

export const MID_QUARTER_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
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
];

export const END_OF_QUARTER_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
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
