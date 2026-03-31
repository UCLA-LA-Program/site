import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  FEATURE_FLAGS,
  OBSERVATION_COUNT_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { LA_POSITION_OPTIONS } from "@/app/feedback/constants";

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
    ...LA_POSITION_OPTIONS.map((p) => `${OBSERVATION_COUNT_PREFIX}${p.value}`),
    QUARTER_START_KEY,
  ];

  const entries = Object.fromEntries(await env.config.get(keys));
  return NextResponse.json(entries);
}
