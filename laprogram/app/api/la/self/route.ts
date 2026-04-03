import { getAuth } from "@/lib/auth";
import { Position } from "@/types/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const result = await env.data
      ?.prepare(
        `SELECT course_name, position
        FROM course
        WHERE userId = ?1`,
      )
      .bind(session.user.id)
      .run<Position>();

    if (!result || result.error) {
      return new Response("Encountered database error.", { status: 500 });
    }
    return new Response(JSON.stringify(result.results), { status: 200 });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
