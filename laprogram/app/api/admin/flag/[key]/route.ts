import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { env } = await getCloudflareContext({ async: true });

  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { key } = await params;

  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  const body = await request.text();
  await env.config.put(key, body);

  return new Response(null, { status: 200 });
}
