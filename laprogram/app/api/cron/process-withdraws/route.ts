import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });

  if (request.headers.get("x-cron-secret") !== env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // TODO
  return new Response("OK");
}
