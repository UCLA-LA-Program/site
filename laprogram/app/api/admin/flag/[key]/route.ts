import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key } = await params;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const body = await request.text();
  const { env } = await getCloudflareContext({ async: true });
  await env.config.put(key, body);

  return NextResponse.json({ ok: true });
}
