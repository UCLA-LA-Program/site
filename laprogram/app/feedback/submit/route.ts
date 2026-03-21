import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { feedbackFormSchema } from "../schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v7 as uuidv7 } from "uuid";
import { Id } from "@/types/db";

export async function POST(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

    env.data
      ?.prepare(
        `INSERT INTO feedback (id, giverName, giverEmail, recipientId, feedback) 
      VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(
        uuidv7(),
        feedback.data.name,
        feedback.data.email,
        recipient?.results[0].id,
        feedback.data,
      );
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
