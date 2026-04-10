import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ObservationAuditRow = {
  observer_id: string;
  observer_name: string;
  week: string | null;
  obs_count: number;
};

export type ObserverCourse = {
  user_id: string;
  course_name: string;
  position: string;
};

export type ObservationAuditData = {
  observations: ObservationAuditRow[];
  courses: ObserverCourse[];
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

  const [obsResult, courseResult] = await env.data.batch([
    env.data.prepare(
      `SELECT
         o.observer_id,
         u.name AS observer_name,
         a.week,
         COUNT(o.id) AS obs_count
       FROM observation o
       JOIN "user" u ON u.id = o.observer_id
       JOIN availability a ON a.id = o.availability_id
       GROUP BY o.observer_id, a.week
       ORDER BY u.name COLLATE NOCASE, a.week`,
    ),
    env.data.prepare(
      `SELECT c.userId AS user_id, c.course_name, c.position
       FROM course c
       ORDER BY c.course_name`,
    ),
  ]);

  return Response.json({
    observations: obsResult.results as ObservationAuditRow[],
    courses: courseResult.results as ObserverCourse[],
  });
}
