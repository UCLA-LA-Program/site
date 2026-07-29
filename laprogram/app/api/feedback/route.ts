import { getAuth } from "@/lib/auth";
import { feedbackFormSchema } from "@/app/feedback/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { v7 as uuidv7 } from "uuid";
import { Id } from "@/types/db";
import { headers } from "next/headers";
import { anonFeedbackSchema } from "@/app/feedback/view/columns";
import { isoNow } from "@/lib/time";
import { EVENT, eventStmt } from "@/lib/events";
import { sortBy } from "lodash";

export async function POST(request: Request) {
  const request_json = await request.json();
  const parsed = feedbackFormSchema.safeParse(request_json);
  if (!parsed.success) {
    return new Response(parsed.error.message, {
      status: 400,
    });
  }

  const feedback = parsed.data;
  try {
    const { env } = getCloudflareContext();
    const recipient = await env.data
      ?.prepare(
        `SELECT user.id AS id
      FROM course
      JOIN user ON course.userId = user.id
      WHERE user.name = ?1 AND course.course_name = ?2`,
      )
      .bind(feedback.la, feedback.course)
      ?.run<Id>();

    const recipientId = recipient?.results[0].id;
    const feedbackId = uuidv7();
    const submittedAt = isoNow();

    await env.data.batch([
      env.data
        .prepare(
          `INSERT INTO feedback (id, recipientId, feedback, submitted_at, created_at)
      VALUES (?1, ?2, ?3, ?4, ?4)`,
        )
        .bind(feedbackId, recipientId, JSON.stringify(feedback), submittedAt),
      eventStmt(env.data, {
        action: EVENT.FeedbackSubmit,
        entityType: "feedback",
        entityId: feedbackId,
        target: { id: recipientId },
        details: {
          feedback_type: feedback.feedback_type,
          role: feedback.role,
          course: feedback.course,
        },
      }),
    ]);
  } catch {
    return new Response("Encountered database error.", { status: 500 });
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
