export type FieldEntry = {
  value: string;
  label: string;
  required: boolean;
  options?: readonly { value: string; label: string }[];
};

export const IMPROVEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "no_change", label: "No change, but still room to improve" },
  { value: "little_improvement", label: "Little improvement" },
  { value: "big_improvement", label: "Big improvement" },
  {
    value: "no_room_for_improvement",
    label: "No room to improve (because of how well they were already doing)",
  },
] as const;

export const AGREEMENT_OPTIONS = [
  { value: "na", label: "N/A" },
  { value: "strongly_disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
  { value: "agree", label: "Agree" },
  { value: "strongly_agree", label: "Strongly Agree" },
] as const;

export const OBSERVATION_OPTIONS = [
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
] as const;

export const ROLE_OPTIONS = [
  { value: "la", label: "an LA." },
  { value: "student", label: "a student in an LA-supported course." },
  { value: "ta", label: "a TA who interacts with an LA." },
] as const;

export const STUDENT_FEEDBACK_TYPE_OPTIONS = [
  { value: "mid_quarter", label: "Student to LA Mid-Quarter Feedback" },
  { value: "end_of_quarter", label: "Student to LA End-of-Quarter Feedback" },
] as const;

export const LA_FEEDBACK_TYPE_OPTIONS = [
  { value: "la_observation", label: "LA Observation Feedback" },
  { value: "la_head_la", label: "LA to Head LA Feedback" },
] as const;

export const LA_HEAD_TYPE_OPTIONS = [
  { value: "ped_head", label: "Pedagogy Head LA" },
  { value: "lcc", label: "LA Course Coordinator (LCC)" },
  { value: "ped_lcc", label: "Both Ped Head and LCC" },
] as const;

export const BECOME_LA_OPTIONS = [
  { value: "yes_this", label: "Yes, for this course." },
  { value: "yes_other", label: "Yes, for another course." },
  { value: "maybe", label: "Maybe." },
  { value: "no_graduating", label: "No, because I am graduating." },
  { value: "no_uninterested", label: "No, because I am not interested." },
  { value: "na_already", label: "N/A – I am/was already an LA." },
] as const;

export const GENDER_OPTIONS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "nonbinary", label: "Nonbinary" },
  { value: "self_describe", label: "Prefer to self-describe" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

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
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "discussion", label: "Discussion/Lab Section" },
  {
    value: "lecture",
    label: "Lecture",
  },
  { value: "office_hours", label: "Office Hours" },
  { value: "study_session", label: "Review/Study Session" },
] as const;

export const OBSERVATION_ROUND_OPTIONS = [
  { value: "round_1", label: "Observations Round 1 (Weeks 3-4)" },
  { value: "round_2", label: "Observations Round 2 (Weeks 7-8)" },
] as const;
