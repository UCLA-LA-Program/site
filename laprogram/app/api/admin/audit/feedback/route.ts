import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sortBy } from "lodash";
import { anonFeedbackSchema } from "@/app/feedback/view/columns";
import type { Position } from "@/types/db";

export async function GET(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const [feedbackResult, positionsResult] = await Promise.all([
    env.data
      .prepare(`SELECT id, feedback FROM feedback WHERE recipientId = ?1`)
      .bind(userId)
      .all<{ id: string; feedback: string }>(),
    env.data
      .prepare(`SELECT course_name, position FROM course WHERE userId = ?1`)
      .bind(userId)
      .all<Position>(),
  ]);

  const sorted = sortBy(feedbackResult.results, (r) => r.id);
  const feedback = sorted.flatMap((r) => {
    const parsed = anonFeedbackSchema.safeParse(JSON.parse(r.feedback));
    return parsed.success ? [parsed.data] : [];
  });

  return Response.json({
    feedback,
    positions: positionsResult.results,
  });
}
