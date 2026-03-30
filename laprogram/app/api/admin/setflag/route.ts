import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  if (
    !body ||
    typeof body !== "object" ||
    !("key" in body) ||
    !("value" in body)
  ) {
    return NextResponse.json(
      { error: "Missing key or value" },
      { status: 400 },
    );
  }

  const { key, value } = body as { key: unknown; value: unknown };

  if (typeof key !== "string" || key.length === 0) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  if (typeof value === "boolean" || typeof value === "number") {
    await env.config.put(key, value.toString());
  } else if (typeof value === "string") {
    await env.config.put(key, value);
  } else {
    return NextResponse.json({ error: "Invalid value type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
