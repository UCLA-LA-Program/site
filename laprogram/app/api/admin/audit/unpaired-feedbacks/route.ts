import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getObsDate, getQuarterStart } from "@/lib/utils";
import { formatDateLA } from "@/app/observations/signup/types";

export type UnpairedFeedback = {
  id: string;
  observer_name: string | null;
  observer_email: string | null;
  observee_id: string;
  observee_name: string;
  observee_email: string;
  course: string | null;
  obs_section: string | null;
  obs_la_position: string | null;
};

type FeedbackRow = UnpairedFeedback;

type SignupKeyRow = {
  observer_email: string;
  observee_id: string;
  section_name: string;
  day: string;
  week: string;
};

export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });

  const [signupsResult, feedbackResult, quarterStart] = await Promise.all([
    env.data
      .prepare(
        `SELECT
           observer.email AS observer_email,
           o.observee_id AS observee_id,
           s.section_name AS section_name,
           s.day AS day,
           a.week AS week
         FROM observation o
         JOIN availability a ON o.availability_id = a.id
         JOIN section s ON a.section_id = s.id
         JOIN "user" observer ON o.observer_id = observer.id`,
      )
      .all<SignupKeyRow>(),
    env.data
      .prepare(
        `SELECT
           f.id AS id,
           json_extract(f.feedback, '$.name') AS observer_name,
           json_extract(f.feedback, '$.email') AS observer_email,
           f.recipientId AS observee_id,
           observee.name AS observee_name,
           observee.email AS observee_email,
           json_extract(f.feedback, '$.course') AS course,
           json_extract(f.feedback, '$.obs_section') AS obs_section,
           json_extract(f.feedback, '$.obs_la_position') AS obs_la_position
         FROM feedback f
         JOIN "user" observee ON observee.id = f.recipientId
         WHERE json_extract(f.feedback, '$.feedback_type') = 'la_observation'`,
      )
      .all<FeedbackRow>(),
    getQuarterStart(env).catch(() => null),
  ]);

  const validKeys = new Set<string>();
  if (quarterStart) {
    for (const s of signupsResult.results) {
      const obsDate = getObsDate(s.week, s.day, quarterStart);
      const expected = `${s.section_name} — ${formatDateLA(obsDate)}`;
      validKeys.add(
        `${s.observer_email.toLowerCase()}|${s.observee_id}|${expected}`,
      );
    }
  }

  const unpaired = feedbackResult.results.filter((f) => {
    if (!f.observer_email || !f.obs_section) return true;
    const key = `${f.observer_email.toLowerCase()}|${f.observee_id}|${f.obs_section}`;
    return !validKeys.has(key);
  });

  return Response.json(unpaired);
}
