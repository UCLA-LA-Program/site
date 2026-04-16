import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
      "SELECT availability_id, observee_id FROM observation WHERE id = ?",
    )
    .bind(id)
    .first<{ availability_id: string; observee_id: string }>();

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
  ]);

  return Response.json({ success: true });
}
