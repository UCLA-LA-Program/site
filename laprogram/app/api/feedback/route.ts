import { getAuth } from "@/lib/auth";
import { feedbackFormSchema } from "@/app/feedback/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v7 as uuidv7 } from "uuid";
import { Id } from "@/types/db";
import { headers } from "next/headers";
import { anonFeedbackSchema } from "@/app/feedback/view/columns";
import { sortBy } from "lodash";
import { isQuarterFeedbackType, sendFeedbackConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  const request_json = await request.json();
  const parsed = feedbackFormSchema.safeParse(request_json);
  if (!parsed.success) {
    return new Response(parsed.error.message, {
      status: 400,
    });
  }

  const feedback = parsed.data;
  const { env, ctx } = getCloudflareContext();
  try {
    const recipient = await env.data
      ?.prepare(
        `SELECT user.id AS id
      FROM course
      JOIN user ON course.userId = user.id
      WHERE user.name = ?1 AND course.course_name = ?2`,
      )
      .bind(feedback.la, feedback.course)
      ?.run<Id>();

    await env.data
      ?.prepare(
        `INSERT INTO feedback (id, recipientId, feedback, submitted_at)
      VALUES (?1, ?2, ?3, datetime('now'))`,
      )
      .bind(uuidv7(), recipient?.results[0].id, JSON.stringify(feedback))
      .run();
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }

  // Confirmation only goes out for the two student feedback types that carry a
  // UID. Sent after the response so a slow or failing SES call can't turn a
  // successful submission into an error for the student.
  if (
    feedback.role === "student" &&
    isQuarterFeedbackType(feedback.feedback_type)
  ) {
    ctx.waitUntil(
      sendFeedbackConfirmation({
        email: feedback.email,
        name: feedback.name,
        feedbackType: feedback.feedback_type,
        course: feedback.course,
        la: feedback.la,
        uid: feedback.uid,
      }),
    );
  }

  return new Response(null, { status: 200 });
}

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
      ?.prepare(`SELECT id, feedback FROM feedback WHERE recipientId = ?1`)
      .bind(session.user.id)
      ?.run<{ id: string; feedback: string }>();

    if (!result || result.error) {
      return new Response("Encountered database error.", { status: 500 });
    }
    const rows = result.results;

    const sorted = sortBy(rows, (r) => r.id);

    const safe = sorted.flatMap((r) => {
      const parsed = anonFeedbackSchema.safeParse(JSON.parse(r.feedback));
      return parsed.success ? [parsed.data] : [];
    });

    return new Response(JSON.stringify(safe), { status: 200 });
  } catch {
    return new Response("Encountered database error.", { status: 500 });
  }
}
