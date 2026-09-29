import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { laDayBoundary } from "@/lib/time";
import { EVENT, eventStmt } from "@/lib/events";
import { OBSERVATION_FUTURE_LIMIT } from "@/lib/constants";

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
        `SELECT availability.id, availability.la_id, availability.section_id,
        availability.week, availability.start_at, availability.end_at,
        observee.email AS la_email
        FROM availability
        JOIN user observee ON availability.la_id = observee.id
        WHERE availability.id = ? AND availability.status = 'open'`,
      )
      .bind(availability_id)
      .first<{
        id: string;
        la_id: string;
        section_id: string;
        week: number;
        start_at: string | null;
        end_at: string | null;
        la_email: string;
      }>();

    if (!slot) {
      return new Response("Slot not found or not available", { status: 404 });
    }

    if (slot.la_id === observerId) {
      return new Response("Cannot observe yourself", { status: 400 });
    }

    const sameSection = await db
      .prepare(
        "SELECT 1 FROM section_assignment WHERE la_id = ? AND section_id = ? LIMIT 1",
      )
      .bind(observerId, slot.section_id)
      .first();
    if (sameSection) {
      return new Response("Cannot observe an LA in your own section", {
        status: 400,
      });
    }

    const existing = await db
      .prepare(
        "SELECT 1 FROM observation WHERE observer_id = ? AND availability_id = ? LIMIT 1",
      )
      .bind(observerId, availability_id)
      .first();
    if (existing) {
      return new Response(
        "You have already signed up to observe this availability slot",
        { status: 400 },
      );
    }

    // Sign-ups close at the end of the day before the observation.
    const cutoff = laDayBoundary(1);
    if (!slot.start_at || slot.start_at < cutoff) {
      return new Response("Cannot sign up for past observations", {
        status: 400,
      });
    }

    const upcoming = await db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM observation
         JOIN availability ON observation.availability_id = availability.id
         WHERE observation.observer_id = ? AND availability.start_at >= ?`,
      )
      .bind(observerId, cutoff)
      .first<{ count: number }>();

    if ((upcoming?.count ?? 0) >= OBSERVATION_FUTURE_LIMIT) {
      return new Response(
        `You can only have ${OBSERVATION_FUTURE_LIMIT} upcoming observations at a time. Complete or cancel one before signing up for another.`,
        { status: 400 },
      );
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
      eventStmt(db, {
        action: EVENT.ObservationSignup,
        entityType: "observation",
        entityId: observationId,
        actor: { id: observerId, email: session.user.email },
        target: { id: slot.la_id, email: slot.la_email },
        details: {
          availability_id,
          section_id: slot.section_id,
          week: slot.week,
          start_at: slot.start_at,
          end_at: slot.end_at,
        },
      }),
    ]);

    const openCount = await db
      .prepare(
        "SELECT COUNT(*) as count FROM availability WHERE status = 'open'",
      )
      .first<{ count: number }>();

    if (openCount && openCount.count === 0) {
      await db
        .prepare(
          "UPDATE availability SET status = 'open' WHERE status = 'hidden'",
        )
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
        observation.created_at AS signed_up_at,
        user.name AS la_name,
        user.email AS la_email,
        user.image AS la_image,
        course.position AS la_position,
        section.course_name AS course_name,
        section.section_name AS section_name,
        section.location AS location,
        section.ta_name AS ta_name,
        section.ta_email AS ta_email,
        availability.start_at AS start_at,
        availability.end_at AS end_at
        FROM observation
        JOIN availability ON observation.availability_id = availability.id
        JOIN section ON availability.section_id = section.id
        JOIN user ON observation.observee_id = user.id
        JOIN course ON observation.observee_id = course.userId AND section.course_name = course.course_name
        WHERE observation.observer_id = ?
        ORDER BY availability.start_at`,
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
