import { getAuth } from "@/lib/auth";
import { feedbackFormSchema } from "@/app/feedback/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v7 as uuidv7 } from "uuid";
import { Id } from "@/types/db";
import { headers } from "next/headers";
import { anonFeedbackSchema } from "@/app/feedback/view/columns";

export async function POST(request: Request) {
  const feedback_request = await request.json();
  const feedback = feedbackFormSchema.safeParse(feedback_request);
  if (!feedback.success) {
    return new Response(feedback.error.message, {
      status: 400,
    });
  }

  try {
    const { env } = getCloudflareContext();
    const recipient = await env.data
      ?.prepare(
        `SELECT user.id AS id
      FROM course
      JOIN user ON course.userId = user.id
      WHERE user.name = ?1 AND course.course_name = ?2`,
      )
      .bind(feedback.data.la, feedback.data.course)
      ?.run<Id>();

    await env.data
      ?.prepare(
        `INSERT INTO feedback (id, recipientId, feedback) 
      VALUES (?1, ?2, ?3)`,
      )
      .bind(uuidv7(), recipient?.results[0].id, JSON.stringify(feedback))
      .run();
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthenticated user.", { status: 401 });
  }

  let rows;
  try {
    const { env } = getCloudflareContext();
    const result = await env.data
      ?.prepare(`SELECT feedback FROM feedback WHERE recipientId = ?1`)
      .bind(session.user.id)
      ?.run<{ feedback: string }>();

    if (!result || result.error) {
      return new Response("Encountered database error.", { status: 500 });
    }
    rows = result.results;
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }

  const safe = rows.flatMap((row) => {
    const parsed = anonFeedbackSchema.safeParse(JSON.parse(row.feedback));
    return parsed.success ? [parsed.data] : [];
  });

  return new Response(JSON.stringify(safe), { status: 200 });
}
