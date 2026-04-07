import { AGREEMENT_OPTIONS, FieldEntry } from "./options";

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
