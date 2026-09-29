import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { laDayBoundary } from "@/lib/time";
import { EVENT, eventStmt } from "@/lib/events";
import { OBSERVATION_CHANGE_DAYS_LIMIT } from "@/lib/constants";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const { id } = await params;
    const db = env.data;

    const observation = await db
      .prepare(
        `SELECT observation.id, observation.observer_id, observation.observee_id,
        observation.availability_id, observation.created_at AS signed_up_at,
        availability.week, availability.start_at, availability.end_at,
        observee.email AS observee_email
        FROM observation
        JOIN availability ON observation.availability_id = availability.id
        JOIN user observee ON observation.observee_id = observee.id
        WHERE observation.id = ?`,
      )
      .bind(id)
      .first<{
        id: string;
        observer_id: string;
        observee_id: string;
        availability_id: string;
        signed_up_at: string | null;
        week: number;
        start_at: string | null;
        end_at: string | null;
        observee_email: string;
      }>();

    if (!observation) {
      return new Response("Observation not found", { status: 404 });
    }

    if (observation.observer_id !== session.user.id) {
      return new Response("Not authorized to cancel this observation", {
        status: 403,
      });
    }

    // Cancellation closes once the observation is within the change window.
    const cutoff = laDayBoundary(OBSERVATION_CHANGE_DAYS_LIMIT);
    if (!observation.start_at || observation.start_at < cutoff) {
      return new Response(
        `Cannot cancel observations within ${OBSERVATION_CHANGE_DAYS_LIMIT} days`,
        { status: 403 },
      );
    }

    await db.batch([
      db.prepare("DELETE FROM observation WHERE id = ?").bind(id),
      db
        .prepare("UPDATE availability SET status = 'open' WHERE id = ?")
        .bind(observation.availability_id),
      db
        .prepare(
          "UPDATE availability SET status = 'open' WHERE la_id = ? AND status = 'hidden'",
        )
        .bind(observation.observee_id),
      eventStmt(db, {
        action: EVENT.ObservationCancel,
        entityType: "observation",
        entityId: id,
        actor: { id: session.user.id, email: session.user.email },
        target: {
          id: observation.observee_id,
          email: observation.observee_email,
        },
        details: {
          availability_id: observation.availability_id,
          week: observation.week,
          start_at: observation.start_at,
          end_at: observation.end_at,
          signed_up_at: observation.signed_up_at,
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to cancel observation: ${message}`, {
      status: 500,
    });
  }
}
