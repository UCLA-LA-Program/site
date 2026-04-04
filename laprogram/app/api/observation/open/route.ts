import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { Availability } from "@/types/db";
import {
  OBSERVATION_ACTIVE_ROUND_KEY,
  OBSERVATION_ROUND_WEEKS_PREFIX,
} from "@/lib/constants";

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
      return new Response("[]", { status: 200 });
    }

    const placeholders = weeks.map(() => "?").join(", ");
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
        AND availability.la_id <> ?
        AND availability.week IN (${placeholders})`,
      )
      .bind(session.user.id, ...weeks)
      .all<Availability>();

    if (!result) {
      return new Response("Encountered database error.", { status: 500 });
    }

    return new Response(JSON.stringify(result.results), { status: 200 });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
