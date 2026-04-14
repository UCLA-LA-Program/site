import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ObservationAuditRow = {
  user_id: string;
  user_name: string;
  user_email: string;
  course_name: string;
  position: string;
  week: string | null;
  obs_count: number;
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
      `SELECT
         c.userId AS user_id,
         u.name AS user_name,
         u.email AS user_email,
         c.course_name,
         c.position,
         a.week,
         COUNT(o.id) AS obs_count
       FROM course c
       JOIN "user" u ON u.id = c.userId
       LEFT JOIN observation o ON o.observer_id = c.userId
       LEFT JOIN availability a ON a.id = o.availability_id
       GROUP BY c.userId, c.course_name, a.week
       ORDER BY u.name COLLATE NOCASE, c.course_name, a.week`,
    )
    .all<ObservationAuditRow>();

  return Response.json(result.results);
}
