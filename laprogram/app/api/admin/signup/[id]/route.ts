import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { EVENT, eventStmt } from "@/lib/events";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = env.data;

  const observation = await db
    .prepare(
      `SELECT o.availability_id, o.observee_id, o.observer_id, o.created_at AS signed_up_at,
              a.week, a.start_at, a.end_at,
              observer.email AS observer_email, observee.email AS observee_email
       FROM observation o
       JOIN availability a ON o.availability_id = a.id
       JOIN "user" observer ON o.observer_id = observer.id
       JOIN "user" observee ON o.observee_id = observee.id
       WHERE o.id = ?`,
    )
    .bind(id)
    .first<{
      availability_id: string;
      observee_id: string;
      observer_id: string;
      signed_up_at: string | null;
      week: number;
      start_at: string | null;
      end_at: string | null;
      observer_email: string;
      observee_email: string;
    }>();

  if (!observation) {
    return new Response("Observation not found", { status: 404 });
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
      action: EVENT.ObservationAdminRemove,
      entityType: "observation",
      entityId: id,
      actor: { id: session.user.id, email: session.user.email },
      target: {
        id: observation.observee_id,
        email: observation.observee_email,
      },
      details: {
        availability_id: observation.availability_id,
        observer_id: observation.observer_id,
        observer_email: observation.observer_email,
        week: observation.week,
        start_at: observation.start_at,
        end_at: observation.end_at,
        signed_up_at: observation.signed_up_at,
      },
    }),
  ]);

  return Response.json({ success: true });
}
