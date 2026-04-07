/**
 * Observation sign-up filtering rules.
 *
 * Each rule has:
 *  - `description` — shown to the user on the sign-up page
 *  - `applies`     — returns true if the rule is active for the given observer positions
 *  - `filter`      — returns true if a slot should be KEPT (visible to the observer)
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
