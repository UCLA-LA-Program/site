import { getCloudflareContext } from "@opennextjs/cloudflare";
import { backupDatabase } from "@/lib/backup";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

interface WithdrawnRecord {
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

    const formula = "FIND('Withdrawn',{Position})";

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Email");
    baseParams.append("fields[]", "Name");
    baseParams.append("filterByFormula", formula);

    const withdrawnLARecords: WithdrawnRecord[] = [];
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
        records: WithdrawnRecord[];
        offset?: string;
      };
      if (!data.records) break;
      withdrawnLARecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (withdrawnLARecords.length === 0) {
      return new Response("No withdrawn LAs found", { status: 200 });
    }

    const errors: string[] = [];
    const affectedObservers: Map<string, string[]> = new Map();
    let removedCount = 0;

    for (const withdrawnLARecord of withdrawnLARecords) {
      const email = Array.isArray(withdrawnLARecord.fields.Email)
        ? withdrawnLARecord.fields.Email[0]
        : withdrawnLARecord.fields.Email;
      const name = withdrawnLARecord.fields.Name;

      if (!email) {
        errors.push(`Skipping record ${withdrawnLARecord.id}: missing email`);
        continue;
      }

      const user = await db
        .prepare("SELECT id FROM user WHERE email = ?")
        .bind(email)
        .first<{ id: string }>();

      if (!user) {
        errors.push(`Skipping ${email}: user not found in DB`);
        continue;
      }

      const observations = await db
        .prepare(
          `SELECT observation.id AS obs_id,
          observation.observer_id,
          observation.availability_id,
          user.email AS observer_email
          FROM observation
          JOIN user ON observation.observer_id = user.id
          WHERE observation.observee_id = ?`,
        )
        .bind(user.id)
        .all<{
          obs_id: string;
          observer_id: string;
          availability_id: string;
          observer_email: string;
        }>();

      for (const obs of observations.results) {
        const existing = affectedObservers.get(obs.observer_email) ?? [];
        existing.push(name);
        affectedObservers.set(obs.observer_email, existing);
      }

      // Revert availability for observees this LA was signed up to observe
      const observerObs = await db
        .prepare(
          "SELECT availability_id, observee_id FROM observation WHERE observer_id = ?",
        )
        .bind(user.id)
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
        db
          .prepare("DELETE FROM observation WHERE observee_id = ?")
          .bind(user.id),
        db
          .prepare("DELETE FROM observation WHERE observer_id = ?")
          .bind(user.id),
        db.prepare("DELETE FROM availability WHERE la_id = ?").bind(user.id),
        db
          .prepare("DELETE FROM section_assignment WHERE la_id = ?")
          .bind(user.id),
        db.prepare("DELETE FROM course WHERE userId = ?").bind(user.id),
        db.prepare("DELETE FROM feedback WHERE recipientId = ?").bind(user.id),
        db.prepare("DELETE FROM session WHERE userId = ?").bind(user.id),
        db.prepare("DELETE FROM account WHERE userId = ?").bind(user.id),
        db.prepare("DELETE FROM user WHERE id = ?").bind(user.id),
      ]);

      removedCount++;
    }

    if (affectedObservers.size > 0 && process.env.POSTMARK_SERVER_TOKEN) {
      await fetch("https://api.postmarkapp.com/email/batchWithTemplates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
        },
        body: JSON.stringify(
          [...affectedObservers].map(([key, value]) => ({
            From: "admin@laprogramucla.com",
            To: key,
            TemplateId: 44230508,
            TemplateModel: {
              la_name: value.join(", "),
            },
          })),
        ),
      });
    }

    const summary =
      `Processed ${withdrawnLARecords.length} withdrawn LAs. Removed: ${removedCount}. Notified: ${affectedObservers.size} observers.` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`process-withdraws failed: ${message}`, {
      status: 500,
    });
  }
}
