import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function GET() {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = env.data;

    const result = await db
      .prepare(
        `SELECT section.id AS section_id,
        section.course_name,
        section.section_name,
        section.day,
        section.time,
        section.location,
        course.position
        FROM section_assignment
        JOIN section ON section_assignment.section_id = section.id
        JOIN course ON course.userId = section_assignment.la_id
          AND course.course_name = section.course_name
        WHERE section_assignment.la_id = ?`,
      )
      .bind(session.user.id)
      .all();

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch sections: ${message}`, {
      status: 500,
    });
  }
}
