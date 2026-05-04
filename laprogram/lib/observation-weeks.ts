import {
  OBSERVATION_ENABLED_WEEKS_KEY,
  OBSERVATION_WEEK_ALLOWLIST_PREFIX,
} from "@/lib/constants";

export function parseAllowlist(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\s,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function parseWeekList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
}

/**
 * Returns the weeks the given user is permitted to sign up for. A week is
 * accessible if it is in the enabled-weeks list and either has no allowlist
 * or the user's email is on it.
 */
export async function getAccessibleWeeks(
  env: CloudflareEnv,
  userEmail: string,
): Promise<string[]> {
  const enabled = parseWeekList(
    await env.config.get(OBSERVATION_ENABLED_WEEKS_KEY),
  );
  if (enabled.length === 0) return [];

  const email = userEmail.toLowerCase();
  const allowlistKeys = enabled.map(
    (w) => `${OBSERVATION_WEEK_ALLOWLIST_PREFIX}${w}`,
  );
  const allowlists = await env.config.get(allowlistKeys);

  return enabled.filter((w) => {
    const list = parseAllowlist(
      allowlists.get(`${OBSERVATION_WEEK_ALLOWLIST_PREFIX}${w}`),
    );
    return list.length === 0 || list.includes(email);
  });
}
