import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const VALID_POSITIONS = new Set([
  "new",
  "ret",
  "ped",
  "lcc",
  "ret_lcc",
  "ped_lcc",
]);

export async function POST(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    positions?: string[];
  };
  const positions = body.positions ?? [];

  if (positions.some((p) => !VALID_POSITIONS.has(p))) {
    return new Response("Invalid position", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const stmt =
    positions.length === 0
      ? env.data.prepare(
          "UPDATE availability SET status = 'open' WHERE status = 'hidden'",
        )
      : env.data
          .prepare(
            `UPDATE availability SET status = 'open'
             WHERE status = 'hidden'
             AND id IN (
               SELECT a.id FROM availability a
               JOIN section s ON a.section_id = s.id
               JOIN course c ON a.la_id = c.userId AND s.course_name = c.course_name
               WHERE c.position IN (${positions.map(() => "?").join(",")})
             )`,
          )
          .bind(...positions);

  const result = await stmt.run();

  return Response.json({ reset: result.meta.changes });
}
