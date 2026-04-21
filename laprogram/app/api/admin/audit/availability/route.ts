import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AvailabilityAuditRow = {
  la_id: string;
  la_name: string;
  la_email: string;
  course_name: string;
  section_name: string;
  section_time: string;
  section_id: string;
  section_day: string;
  section_time_raw: string;
  section_location: string;
  position: string;
  week: string | null;
  slot_count: number;
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
         sa.la_id,
         u.name AS la_name,
         u.email AS la_email,
         s.course_name,
         s.section_name,
         s.day || ' ' || s.time AS section_time,
         s.day AS section_day,
         s.time AS section_time_raw,
         s.location AS section_location,
         sa.section_id,
         c.position,
         a.week,
         COUNT(a.id) AS slot_count
       FROM section_assignment sa
       JOIN "user" u ON u.id = sa.la_id
       JOIN section s ON s.id = sa.section_id
       JOIN course c ON c.userId = sa.la_id AND c.course_name = s.course_name
       LEFT JOIN availability a ON a.la_id = sa.la_id AND a.section_id = sa.section_id
       GROUP BY sa.la_id, sa.section_id, a.week
       ORDER BY u.name COLLATE NOCASE, s.course_name, s.section_name`,
    )
    .all<AvailabilityAuditRow>();

  return Response.json(result.results);
}
