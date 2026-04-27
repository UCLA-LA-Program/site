import "server-only";

// Required gap (seconds) before the Nth send to a given email.
// Index = number of sends already made in the current window.
export const BACKOFF_SECONDS = [0, 30, 120, 600, 1800, 3600];
const WINDOW_TTL_SECONDS = 60 * 60;
const KEY_PREFIX = "magic-link:";

type RateLimitState = { count: number; lastAttemptAt: number };

function gapForCount(count: number): number {
  return BACKOFF_SECONDS[Math.min(count, BACKOFF_SECONDS.length - 1)];
}

export async function getMagicLinkWait(
  kv: KVNamespace,
  email: string,
): Promise<number> {
  const state = await kv.get<RateLimitState>(KEY_PREFIX + email, "json");
  if (!state) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, gapForCount(state.count) - (now - state.lastAttemptAt));
}

export async function clearMagicLinkRateLimit(
  kv: KVNamespace,
  email: string,
): Promise<void> {
  await kv.delete(KEY_PREFIX + email);
}

export async function reserveMagicLinkSend(
  kv: KVNamespace,
  email: string,
): Promise<boolean> {
  const state = await kv.get<RateLimitState>(KEY_PREFIX + email, "json");
  const now = Math.floor(Date.now() / 1000);
  const count = state?.count ?? 0;

  if (state && now - state.lastAttemptAt < gapForCount(count)) {
    return false;
  }

  const next: RateLimitState = { count: count + 1, lastAttemptAt: now };
  await kv.put(KEY_PREFIX + email, JSON.stringify(next), {
    expirationTtl: WINDOW_TTL_SECONDS,
  });
  return true;
}
