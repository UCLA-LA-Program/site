import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

interface AvailabilityWeek {
  week: string;
  time: string;
}

interface AvailabilityPayload {
  section_id: string;
  weeks: AvailabilityWeek[];
}

export async function POST(request: Request) {
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
    const userId = session.user.id;

    const body = (await request.json()) as AvailabilityPayload;
    const { section_id, weeks } = body;

    if (!section_id || !Array.isArray(weeks)) {
      return new Response("Missing section_id or weeks", { status: 400 });
    }

    const assignment = await db
      .prepare(
        "SELECT la_id FROM section_assignment WHERE la_id = ? AND section_id = ?",
      )
      .bind(userId, section_id)
      .first();

    if (!assignment) {
      return new Response("No section assignment found", { status: 403 });
    }

    await db
      .prepare(
        "DELETE FROM availability WHERE la_id = ? AND section_id = ? AND status = 'open'",
      )
      .bind(userId, section_id)
      .run();

    if (weeks.length > 0) {
      const stmts = weeks.map((w) =>
        db
          .prepare(
            "INSERT INTO availability (id, la_id, section_id, time, week, status) VALUES (?, ?, ?, ?, ?, 'open')",
          )
          .bind(crypto.randomUUID(), userId, section_id, w.time, w.week),
      );
      await db.batch(stmts);
    }

    return Response.json({ success: true, count: weeks.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to save availability: ${message}`, {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
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
    const userId = session.user.id;

    const url = new URL(request.url);
    const sectionId = url.searchParams.get("section_id");

    let result;
    if (sectionId) {
      result = await db
        .prepare(
          "SELECT id, section_id, time, week, status FROM availability WHERE la_id = ? AND section_id = ?",
        )
        .bind(userId, sectionId)
        .all();
    } else {
      result = await db
        .prepare(
          "SELECT id, section_id, time, week, status FROM availability WHERE la_id = ?",
        )
        .bind(userId)
        .all();
    }

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch availability: ${message}`, {
      status: 500,
    });
  }
}
