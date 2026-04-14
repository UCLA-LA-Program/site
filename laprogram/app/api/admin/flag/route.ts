import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  FEATURE_FLAGS,
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
  QUARTER_START_KEY,
} from "@/lib/constants";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });

  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

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
