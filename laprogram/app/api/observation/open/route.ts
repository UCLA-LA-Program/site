import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { AvailabilityRow } from "@/types/db";
import {
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
} from "@/lib/constants";
import {
  getObsDate,
  getQuarterStart,
  daysUntil,
  parseTimeRange,
} from "@/lib/utils";
import {
  getApplicableRules,
  getApplicableNotes,
} from "@/lib/observation-rules";

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

    const activeRound = await env.config.get(OBSERVATION_ACTIVE_ROUND_KEY);
    if (!activeRound || activeRound === "0") {
      return new Response("[]", { status: 200 });
    }

    const weeksRaw =
      (await env.config.get(
        `${OBSERVATION_ROUND_WEEKS_PREFIX}${activeRound}`,
      )) ?? "";
    const weeks = weeksRaw
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    if (weeks.length === 0) {
      return Response.json({ slots: [], filters: [] });
    }

    // Get observer's courses/positions to determine filtering rules and notes
    const observerCourses = await env.data
      .prepare("SELECT course_name, position FROM course WHERE userId = ?")
      .bind(session.user.id)
      .all<{ course_name: string; position: string }>();
    const positions = observerCourses.results.map((r) => r.position);
    const { descriptions, filter } = getApplicableRules(positions);

    const result = await env.data
      .prepare(
        `SELECT user.name AS la_name,
        user.email AS la_email,
        course.position AS la_position,
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
        JOIN course ON availability.la_id = course.userId AND section.course_name = course.course_name
        WHERE availability.status = 'open'
        AND availability.la_id <> ?
        AND availability.week IN (${weeks.map(() => "?").join(", ")})`,
      )
      .bind(session.user.id, ...weeks)
      .all<AvailabilityRow>();

    if (!result) {
      return new Response("Encountered database error.", { status: 500 });
    }

    // Filter out past slots, apply observation rules, and parse time ranges
    const quarterStart = await getQuarterStart(env);
    const slots = result.results
      .filter((s) => daysUntil(getObsDate(s.week, s.day, quarterStart)) >= 0)
      .filter(filter)
      .map(({ week, day, time, ...rest }) => ({
        ...rest,
        ...parseTimeRange(week, day, time, quarterStart),
      }));

    const notes = getApplicableNotes(observerCourses.results);

    return Response.json({ slots, filters: descriptions, notes });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
