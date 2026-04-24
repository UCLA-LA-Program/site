import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(
  request: Request,
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

  let body: { name?: string; email?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string };
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    !body.name ||
    !body.email
  ) {
    return new Response("name and email are required", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const result = await env.data
    .prepare(
      `UPDATE feedback
       SET feedback = json_set(json_set(feedback, '$.name', ?1), '$.email', ?2)
       WHERE id = ?3`,
    )
    .bind(body.name, body.email, id)
    .run();

  if (!result.meta.changes) {
    return new Response("Feedback not found", { status: 404 });
  }

  return Response.json({ success: true });
}
