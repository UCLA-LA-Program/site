import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { ObservationAvailability } from "@/types/db";
import { laDayBoundary } from "@/lib/time";
import {
  getApplicableRules,
  getApplicableNotes,
} from "@/lib/observation-rules";
import { getAccessibleWeeks } from "@/lib/observation-weeks";

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

    const weeks = await getAccessibleWeeks(env, session.user.email);

    if (weeks.length === 0) {
      return Response.json({ slots: [], filters: [], notes: [] });
    }

    // Get observer's courses/positions to determine filtering rules and notes
    const observerCourses = await env.data
      .prepare("SELECT course_name, position FROM course WHERE userId = ?")
      .bind(session.user.id)
      .all<{ course_name: string; position: string }>();
    const positions = observerCourses.results.map((r) => r.position);
    const { descriptions, filter } = getApplicableRules(positions);

    // Slots become unavailable at the end of the day before they happen.
    const cutoff = laDayBoundary(1);

    const result = await env.data
      .prepare(
        `SELECT user.name AS la_name,
        user.email AS la_email,
        course.position AS la_position,
        section.course_name AS course_name,
        section.section_name AS section_name,
        section.location AS location,
        availability.id AS id,
        availability.start_at AS start_at,
        availability.end_at AS end_at
        FROM availability
        JOIN user ON availability.la_id = user.id
        JOIN section ON availability.section_id = section.id
        JOIN course ON availability.la_id = course.userId AND section.course_name = course.course_name
        WHERE availability.status = 'open'
        AND availability.start_at >= ?
        AND availability.la_id <> ?
        AND availability.id NOT IN (
          SELECT availability_id FROM observation WHERE observer_id = ?
        )
        AND availability.section_id NOT IN (
          SELECT section_id FROM section_assignment WHERE la_id = ?
        )
        AND availability.week IN (${weeks.map(() => "?").join(", ")})`,
      )
      .bind(
        cutoff,
        session.user.id,
        session.user.id,
        session.user.id,
        ...weeks,
      )
      .all<ObservationAvailability>();

    if (!result) {
      return new Response("Encountered database error.", { status: 500 });
    }

    const slots = result.results.filter(filter);
    const notes = getApplicableNotes(observerCourses.results);

    return Response.json({ slots, filters: descriptions, notes });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
