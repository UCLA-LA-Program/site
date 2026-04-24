import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getObsDate, getQuarterStart } from "@/lib/utils";
import { formatDateLA } from "@/app/observations/signup/types";

export type SignupRow = {
  id: string;
  observer_id: string;
  observer_name: string;
  observer_email: string;
  observer_position: string | null;
  observee_id: string;
  observee_name: string;
  observee_email: string;
  observee_position: string | null;
  course_name: string;
  section_name: string;
  day: string;
  time: string;
  week: string;
  completed: boolean;
};

type SignupQueryRow = Omit<SignupRow, "completed">;

type FeedbackMatchRow = {
  observer_email: string | null;
  observee_id: string;
  obs_section: string | null;
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

  // TODO: logic for extracting completed observations is not good. This should be refactored
  // once the major sign-up changes go through in a few weeks this quarter

  const [signupsResult, feedbackResult, quarterStart] = await Promise.all([
    env.data
      .prepare(
        `SELECT
           o.id AS id,
           o.observer_id AS observer_id,
           observer.name AS observer_name,
           observer.email AS observer_email,
           (SELECT GROUP_CONCAT(DISTINCT position)
              FROM course WHERE userId = o.observer_id) AS observer_position,
           o.observee_id AS observee_id,
           observee.name AS observee_name,
           observee.email AS observee_email,
           (SELECT GROUP_CONCAT(DISTINCT position)
              FROM course WHERE userId = o.observee_id) AS observee_position,
           s.course_name AS course_name,
           s.section_name AS section_name,
           s.day AS day,
           a.time AS time,
           a.week AS week
         FROM observation o
         JOIN availability a ON o.availability_id = a.id
         JOIN section s ON a.section_id = s.id
         JOIN "user" observer ON o.observer_id = observer.id
         JOIN "user" observee ON o.observee_id = observee.id
         ORDER BY a.week, s.day, a.time, observer.name COLLATE NOCASE`,
      )
      .all<SignupQueryRow>(),
    env.data
      .prepare(
        `SELECT
           json_extract(feedback, '$.email') AS observer_email,
           recipientId AS observee_id,
           json_extract(feedback, '$.obs_section') AS obs_section
         FROM feedback
         WHERE json_extract(feedback, '$.feedback_type') = 'la_observation'`,
      )
      .all<FeedbackMatchRow>(),
    getQuarterStart(env).catch(() => null),
  ]);

  const completedKeys = new Set<string>();
  for (const fb of feedbackResult.results) {
    if (!fb.observer_email || !fb.obs_section) continue;
    completedKeys.add(
      `${fb.observer_email.toLowerCase()}|${fb.observee_id}|${fb.obs_section}`,
    );
  }

  const rows: SignupRow[] = signupsResult.results.map((r) => {
    let completed = false;
    if (quarterStart) {
      const obsDate = getObsDate(r.week, r.day, quarterStart);
      const expected = `${r.section_name} — ${formatDateLA(obsDate)}`;
      const key = `${r.observer_email.toLowerCase()}|${r.observee_id}|${expected}`;
      completed = completedKeys.has(key);
    }
    return { ...r, completed };
  });

  return Response.json(rows);
}
