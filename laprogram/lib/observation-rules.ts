/**
 * Observation sign-up filtering rules and contextual notes.
 */

type ObservationRule = {
  description: string;
  applies: (observerPositions: string[]) => boolean;
  filter: (slot: { la_position: string }) => boolean;
};

export const OBSERVATION_RULES: ObservationRule[] = [
  {
    description: "Ped Heads can only observe New LAs.",
    applies: (positions) => positions.some((p) => p.includes("ped")),
    filter: (slot) => slot.la_position === "new",
  },
];

export function getApplicableRules(observerPositions: string[]): {
  descriptions: string[];
  filter: (slot: { la_position: string }) => boolean;
} {
  const active = OBSERVATION_RULES.filter((r) => r.applies(observerPositions));

  if (active.length === 0) {
    return { descriptions: [], filter: () => true };
  }

  return {
    descriptions: active.map((r) => r.description),
    filter: (slot) => active.every((r) => r.filter(slot)),
  };
}

// --- Notes ---

type CoursePosition = { course_name: string; position: string };

type ObservationNote = {
  text: string;
  applies: (context: { observerCourses: CoursePosition[] }) => boolean;
};

const isLSCourse = (name: string) => name.startsWith("LS 7A");
const OBSERVATION_NOTES: ObservationNote[] = [
  {
    text: "LS 7 Ped Heads: Please prioritize observing LS 7 New LAs.",
    applies: ({ observerCourses }) =>
      observerCourses.some(
        (c) => isLSCourse(c.course_name) && c.position.includes("ped"),
      ),
  },
  {
    text: "LS 7 Returners: Please prioritize observing LS 7 Returners and Ped Heads.",
    applies: ({ observerCourses }) =>
      observerCourses.some(
        (c) => isLSCourse(c.course_name) && c.position.includes("ret"),
      ),
  },
  {
    text: "If observing in a lab course: long pants required, no open-toed shoes, no food or drinks. Ask your observee if a lab coat is needed.",
    applies: () => true,
  },
];

export function getApplicableNotes(
  observerCourses: CoursePosition[],
): string[] {
  return OBSERVATION_NOTES.filter((n) => n.applies({ observerCourses })).map(
    (n) => n.text,
  );
}
