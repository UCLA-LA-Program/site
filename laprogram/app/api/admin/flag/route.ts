import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import {
  FEATURE_FLAGS,
  OBSERVATION_ENABLED_WEEKS_KEY,
  OBSERVATION_WEEK_ALLOWLIST_PREFIX,
  OBSERVATION_WEEK_RANGE,
  QUARTER_START_KEY,
} from "@/lib/constants";

export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const keys = [
    ...FEATURE_FLAGS.map((f) => f.key),
    QUARTER_START_KEY,
    OBSERVATION_ENABLED_WEEKS_KEY,
    ...OBSERVATION_WEEK_RANGE.map(
      (w) => `${OBSERVATION_WEEK_ALLOWLIST_PREFIX}${w}`,
    ),
  ];

  const entries = Object.fromEntries(await env.config.get(keys));
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });

  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const body = (await request.json()) as Record<string, string>;

  await Promise.all(
    Object.entries(body).map(([key, value]) => env.config.put(key, value)),
  );

  return new Response(null, { status: 200 });
}
