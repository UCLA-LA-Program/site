import { getCloudflareContext } from "@opennextjs/cloudflare";
import { backupDatabase } from "@/lib/backup";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

interface WithdrewRecord {
  id: string;
  fields: {
    Email: string | string[];
    Name: string;
  };
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const hasCronSecret =
      request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
    if (!hasCronSecret) {
      const auth = await getAuth();
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    await backupDatabase();

    const db = env.data;

    const formula = "FIND('Withdrew',{Position})";

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Email");
    baseParams.append("fields[]", "Name");
    baseParams.append("filterByFormula", formula);

    const withdrewLARecords: WithdrewRecord[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams(baseParams);
      if (offset) params.append("offset", offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/LA Roster?${params}`,
        {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
        },
      );

      if (!response.ok) {
        return new Response(
          `Failed to fetch LA Roster: ${response.status} ${response.statusText}`,
          { status: 502 },
        );
      }

      const data = (await response.json()) as {
        records: WithdrewRecord[];
        offset?: string;
      };
      if (!data.records) break;
      withdrewLARecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (withdrewLARecords.length === 0) {
      return new Response("No withdrawn LAs found", { status: 200 });
    }

    const errors: string[] = [];
    const affectedObservers: Map<string, string[]> = new Map();
    const observerNames: Map<string, string> = new Map();
    let removedCount = 0;

    for (const withdrewLARecord of withdrewLARecords) {
      const withdrewLAEmail = Array.isArray(withdrewLARecord.fields.Email)
        ? withdrewLARecord.fields.Email[0]
        : withdrewLARecord.fields.Email;
      const withdrewLAName = withdrewLARecord.fields.Name;

      if (!withdrewLAEmail) {
        errors.push(`Skipping record ${withdrewLARecord.id}: missing email`);
        continue;
      }

      const withdrewUser = await db
        .prepare("SELECT id FROM user WHERE email = ?")
        .bind(withdrewLAEmail)
        .first<{ id: string }>();

      if (!withdrewUser) {
        errors.push(`Skipping ${withdrewLAEmail}: user not found in DB`);
        continue;
      }

      // withdrawn user is the observee
      const observeeObs = await db
        .prepare(
          `SELECT observation.id AS obs_id,
          observation.observer_id,
          observation.availability_id,
          user.email AS observer_email,
          user.name AS observer_name
          FROM observation
          JOIN user ON observation.observer_id = user.id
          WHERE observation.observee_id = ?`,
        )
        .bind(withdrewUser.id)
        .all<{
          obs_id: string;
          observer_id: string;
          availability_id: string;
          observer_email: string;
          observer_name: string;
        }>();

      for (const obs of observeeObs.results) {
        const existing = affectedObservers.get(obs.observer_email) ?? [];
        existing.push(withdrewLAName);

        affectedObservers.set(obs.observer_email, existing);
        observerNames.set(obs.observer_email, obs.observer_name);
      }

      // withdrawn user is the observer (revert availability for those sections)
      const observerObs = await db
        .prepare(
          "SELECT availability_id, observee_id FROM observation WHERE observer_id = ?",
        )
        .bind(withdrewUser.id)
        .all<{ availability_id: string; observee_id: string }>();

      const revertStmts: D1PreparedStatement[] = [];
      for (const obs of observerObs.results) {
        revertStmts.push(
          db
            .prepare("UPDATE availability SET status = 'open' WHERE id = ?")
            .bind(obs.availability_id),
          db
            .prepare(
              "UPDATE availability SET status = 'open' WHERE la_id = ? AND status = 'hidden'",
            )
            .bind(obs.observee_id),
        );
      }
      if (revertStmts.length > 0) {
        await db.batch(revertStmts);
      }

      await db.batch([
        /*
        db
          .prepare("DELETE FROM observation WHERE observee_id = ?")
          .bind(withdrewUser.id),
        db
          .prepare("DELETE FROM observation WHERE observer_id = ?")
          .bind(withdrewUser.id),
        db
          .prepare("DELETE FROM availability WHERE la_id = ?")
          .bind(withdrewUser.id),
        */
        db
          .prepare("DELETE FROM section_assignment WHERE la_id = ?")
          .bind(withdrewUser.id),
        db.prepare("DELETE FROM course WHERE userId = ?").bind(withdrewUser.id),
        /*
        db
          .prepare("DELETE FROM feedback WHERE recipientId = ?")
          .bind(withdrewUser.id),
        db
          .prepare("DELETE FROM session WHERE userId = ?")
          .bind(withdrewUser.id),
        db
          .prepare("DELETE FROM account WHERE userId = ?")
          .bind(withdrewUser.id),
        db.prepare("DELETE FROM user WHERE id = ?").bind(withdrewUser.id),
        */
      ]);

      removedCount++;
    }

    /*
    if (affectedObservers.size > 0 && process.env.POSTMARK_SERVER_TOKEN) {
      await fetch("https://api.postmarkapp.com/email/batchWithTemplates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
        },
        body: JSON.stringify({
          Messages: [...affectedObservers].map(([email, withdrawnNames]) => ({
            From: "admin@laprogramucla.com",
            To: email,
            TemplateId: 44230508,
            TemplateModel: {
              name: observerNames.get(email),
              la_name: withdrawnNames.join(", "),
            },
          })),
        }),
      });
    }
    */

    const summary =
      `Processed ${withdrewLARecords.length} withdrawn LAs. Removed: ${removedCount}. Notified: ${affectedObservers.size} observers.` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`process-withdraws failed: ${message}`, {
      status: 500,
    });
  }
}
