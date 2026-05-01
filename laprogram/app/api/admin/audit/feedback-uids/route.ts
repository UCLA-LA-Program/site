import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type FeedbackUidRow = {
  course: string | null;
  feedback_type: "mid_quarter" | "end_of_quarter";
  uid: string | null;
};

export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const result = await env.data
    .prepare(
      `SELECT DISTINCT
         json_extract(f.feedback, '$.course') AS course,
         json_extract(f.feedback, '$.feedback_type') AS feedback_type,
         json_extract(f.feedback, '$.uid') AS uid
       FROM feedback f
       WHERE json_extract(f.feedback, '$.feedback_type') IN ('mid_quarter', 'end_of_quarter')
         AND json_extract(f.feedback, '$.uid') IS NOT NULL
         AND json_extract(f.feedback, '$.uid') != ''
       ORDER BY course, feedback_type, uid`,
    )
    .all<FeedbackUidRow>();

  return Response.json(result.results);
}
