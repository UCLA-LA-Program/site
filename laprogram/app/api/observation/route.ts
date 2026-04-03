import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function POST(request: Request) {
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
    const observerId = session.user.id;

    const { availability_id } = (await request.json()) as {
      availability_id: string;
    };

    if (!availability_id) {
      return new Response("Missing availability_id", { status: 400 });
    }

    const slot = await db
      .prepare(
        "SELECT id, la_id, section_id, time, week FROM availability WHERE id = ? AND status = 'open'",
      )
      .bind(availability_id)
      .first<{
        id: string;
        la_id: string;
        section_id: string;
        time: string;
        week: string;
      }>();

    if (!slot) {
      return new Response("Slot not found or not available", { status: 404 });
    }

    if (slot.la_id === observerId) {
      return new Response("Cannot observe yourself", { status: 400 });
    }

    const observationId = crypto.randomUUID();

    await db.batch([
      db
        .prepare(
          "INSERT INTO observation (id, observer_id, observee_id, availability_id) VALUES (?, ?, ?, ?)",
        )
        .bind(observationId, observerId, slot.la_id, availability_id),
      db
        .prepare("UPDATE availability SET status = 'taken' WHERE id = ?")
        .bind(availability_id),
      db
        .prepare(
          "UPDATE availability SET status = 'hidden' WHERE la_id = ? AND status = 'open'",
        )
        .bind(slot.la_id),
    ]);

    const openCount = await db
      .prepare(
        "SELECT COUNT(*) as count FROM availability WHERE la_id = ? AND status = 'open'",
      )
      .bind(slot.la_id)
      .first<{ count: number }>();

    if (openCount && openCount.count === 0) {
      await db
        .prepare(
          "UPDATE availability SET status = 'open' WHERE la_id = ? AND status = 'hidden'",
        )
        .bind(slot.la_id)
        .run();
    }

    return Response.json({ success: true, observation_id: observationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to sign up for observation: ${message}`, {
      status: 500,
    });
  }
}

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
        `SELECT observation.id AS id,
        user.name AS observee_name,
        section.course_name AS course_name,
        section.section_name AS section_name,
        section.day AS day,
        availability.week AS week,
        availability.time AS time,
        section.location AS location,
        section.ta_name AS ta_name,
        section.ta_email AS ta_email
        FROM observation
        JOIN availability ON observation.availability_id = availability.id
        JOIN section ON availability.section_id = section.id
        JOIN user ON observation.observee_id = user.id
        WHERE observation.observer_id = ?`,
      )
      .bind(session.user.id)
      .all();

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch observations: ${message}`, {
      status: 500,
    });
  }
}
