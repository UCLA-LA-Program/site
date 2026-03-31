import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const hasCronSecret = request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
  if (!hasCronSecret) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // TODO
  return new Response("OK");
}

