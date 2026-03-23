import { getAuth } from "@/lib/auth";
import { feedbackFormSchema, FeedbackFormValues } from "@/app/feedback/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v7 as uuidv7 } from "uuid";
import { Id } from "@/types/db";
import { headers } from "next/headers";

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

    // avoid storing name and email in the feedback so we can show without identifiable data
    const { name, email, ...anon_feedback } = feedback.data;
    await env.data
      ?.prepare(
        `INSERT INTO feedback (id, giverName, giverEmail, recipientId, feedback) 
      VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(
        uuidv7(),
        name,
        email,
        recipient?.results[0].id,
        JSON.stringify(anon_feedback),
      )
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

  let feedback;
  try {
    const { env } = getCloudflareContext();
    feedback = await env.data
      ?.prepare(`SELECT feedback FROM feedback WHERE recipientId = ?1`)
      .bind(session.user.id)
      ?.run<FeedbackFormValues>();

    if (!feedback || feedback.error) {
      return new Response("Encountered database error.", { status: 500 });
    }
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }

  return new Response(JSON.stringify(feedback.results), { status: 200 });
}
