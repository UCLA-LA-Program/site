import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LA } from "@/types/db";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const result = await env.data
      ?.prepare(
        `SELECT user.name AS name, 
        course.course_name AS course, 
        course.position AS position,
        user.image AS image
        FROM course
        JOIN user on course.userId = user.id`,
      )
      .run<LA>();

    if (!result) {
      return new Response("Encountered database error.", { status: 500 });
    }

    return new Response(JSON.stringify(result.results), { status: 200 });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
