import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  FEATURE_FLAGS,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });

  // Fetch only a single key
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key) {
    const value = (await env.config.get(key)) ?? "";
    return NextResponse.json({ key, value });
  }

  // Fetch all known keys
  const keys = [
    ...FEATURE_FLAGS.map((f) => f.key),
    QUARTER_START_KEY,
    OBSERVATION_ACTIVE_ROUND_KEY,
    `${OBSERVATION_ROUND_WEEKS_PREFIX}1`,
    `${OBSERVATION_ROUND_WEEKS_PREFIX}2`,
  ];

  const entries = Object.fromEntries(await env.config.get(keys));
  return NextResponse.json(entries);
}
