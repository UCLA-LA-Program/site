import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type SignupRow = {
  id: string;
  observer_id: string;
  observer_name: string;
  observer_email: string;
  observer_position: string | null;
  observee_id: string;
  observee_name: string;
  observee_email: string;
  observee_position: string | null;
  course_name: string;
  section_name: string;
  day: string;
  time: string;
  week: string;
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
         o.id AS id,
         o.observer_id AS observer_id,
         observer.name AS observer_name,
         observer.email AS observer_email,
         (SELECT GROUP_CONCAT(DISTINCT position)
            FROM course WHERE userId = o.observer_id) AS observer_position,
         o.observee_id AS observee_id,
         observee.name AS observee_name,
         observee.email AS observee_email,
         (SELECT GROUP_CONCAT(DISTINCT position)
            FROM course WHERE userId = o.observee_id) AS observee_position,
         s.course_name AS course_name,
         s.section_name AS section_name,
         s.day AS day,
         a.time AS time,
         a.week AS week
       FROM observation o
       JOIN availability a ON o.availability_id = a.id
       JOIN section s ON a.section_id = s.id
       JOIN "user" observer ON o.observer_id = observer.id
       JOIN "user" observee ON o.observee_id = observee.id
       ORDER BY a.week, s.day, a.time, observer.name COLLATE NOCASE`,
    )
    .all<SignupRow>();

  return Response.json(result.results);
}
