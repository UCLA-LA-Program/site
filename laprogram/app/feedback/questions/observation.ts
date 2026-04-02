import { FieldEntry, OBSERVATION_OPTIONS } from "./options";

export const OBS_NONSENSITIVE_QUESTIONS: FieldEntry[] = [
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
] as const;

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
