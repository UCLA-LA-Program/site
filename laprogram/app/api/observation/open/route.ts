import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { Availability } from "@/types/db";

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
    const result = await env.data
      .prepare(
        `SELECT user.name AS la_name,
        user.email AS la_email,
        section.course_name AS course_name,
        section.section_name AS section_name,
        section.day AS day,
        section.location AS location,
        availability.id AS id,
        availability.week AS week,
        availability.time AS time
        FROM availability
        JOIN user ON availability.la_id = user.id
        JOIN section ON availability.section_id = section.id
        WHERE availability.status = 'open' 
        AND availability.la_id <> ?1`,
      )
      .bind(session.user.id)
      .all<Availability>();

    if (!result) {
      return new Response("Encountered database error.", { status: 500 });
    }

    return new Response(JSON.stringify(result.results), { status: 200 });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
