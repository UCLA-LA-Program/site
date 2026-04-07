import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getObsDate, getQuarterStart, daysUntil } from "@/lib/utils";
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
        `SELECT observation.id, observation.observer_id, observation.observee_id, observation.availability_id,
        availability.week, section.day, availability.time
        FROM observation
        JOIN availability ON observation.availability_id = availability.id
        JOIN section ON availability.section_id = section.id
        WHERE observation.id = ?`,
      )
      .bind(id)
      .first<{
        id: string;
        observer_id: string;
        observee_id: string;
        availability_id: string;
        week: string;
        day: string;
        time: string;
      }>();

    if (!observation) {
      return new Response("Observation not found", { status: 404 });
    }

    if (observation.observer_id !== session.user.id) {
      return new Response("Not authorized to cancel this observation", {
        status: 403,
      });
    }

    // Block deletion if observation is too close
    const quarterStart = await getQuarterStart(env);
    const obsDate = getObsDate(observation.week, observation.day, quarterStart);

    if (daysUntil(obsDate) < OBSERVATION_CHANGE_DAYS_LIMIT) {
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
    ]);

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to cancel observation: ${message}`, {
      status: 500,
    });
  }
}
