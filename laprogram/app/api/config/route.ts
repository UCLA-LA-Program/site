import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  FEATURE_FLAGS,
  OBSERVATION_COUNT_PREFIX,
} from "@/lib/constants";
import { LA_POSITION_OPTIONS } from "@/app/feedback/constants";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const value = await env.config.get(key);
    return NextResponse.json({ key, value });
  }

  // Fetch all known keys
  const flagEntries = await Promise.all(
    FEATURE_FLAGS.map(async (flag) => {
      const value = await env.config.get(flag.key);
      return [flag.key, value] as const;
    }),
  );

  const countEntries = await Promise.all(
    LA_POSITION_OPTIONS.map(async (pos) => {
      const value = await env.config.get(
        `${OBSERVATION_COUNT_PREFIX}${pos.value}`,
      );
      return [pos.value, value] as const;
    }),
  );

  const flags: Record<string, boolean> = {};
  for (const [k, v] of flagEntries) {
    flags[k] = v === "true";
  }

  const observationCounts: Record<string, number> = {};
  for (const [k, v] of countEntries) {
    observationCounts[k] = v !== null ? parseInt(v, 10) : 0;
  }

  return NextResponse.json({ flags, observationCounts });
}
