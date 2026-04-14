import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

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
