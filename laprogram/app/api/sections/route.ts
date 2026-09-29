import { getAuth } from "@/lib/auth";
import { Section } from "@/types/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const db = env.data;

    const result = await db
      .prepare(
        `SELECT section.id AS section_id,
        section.course_name,
        section.section_name,
        section.day_of_week,
        section.start_time,
        section.end_time,
        section.location
        FROM section_assignment
        JOIN section ON section_assignment.section_id = section.id
        WHERE section_assignment.la_id = ?
        ORDER BY section.day_of_week, section.start_time`,
      )
      .bind(session.user.id)
      .all<Section>();

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch sections: ${message}`, {
      status: 500,
    });
  }
}
