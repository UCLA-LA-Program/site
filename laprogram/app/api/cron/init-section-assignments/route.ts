import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import type { AirtableRecord } from "@/lib/airtable";
import { backupDatabase } from "@/lib/backup";
import { getQuarterStart } from "@/lib/utils";
import {
  defaultAvailabilityWindow,
  toISO,
  weekdayInstant,
} from "@/lib/time";
import { EVENT, SYSTEM_ACTOR, recordEvent } from "@/lib/events";
import { OBSERVATION_WEEK_RANGE } from "@/lib/constants";

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

    const formula =
      "AND(OR(FIND('New',{Position}),FIND('PED',{Position}),FIND('Returner',{Position})),{Email},{Assigned Sections (click or mouseover to see all info)})";

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Email");
    baseParams.append(
      "fields[]",
      "Assigned Sections (click or mouseover to see all info)",
    );
    baseParams.append("filterByFormula", formula);

    const allRecords: AirtableRecord[] = [];
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
          `Failed to fetch LA Roster from Airtable: ${response.status} ${response.statusText}`,
          { status: 502 },
        );
      }

      const data = (await response.json()) as {
        records: AirtableRecord[];
        offset?: string;
      };
      if (!data.records) break;
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (allRecords.length === 0) {
      return new Response("No records found in LA Roster", { status: 404 });
    }

    const db = env.data;
    const insertStmts: D1PreparedStatement[] = [];
    const deleteStmts: D1PreparedStatement[] = [];
    const errors: string[] = [];
    let message = "";
    let staleCount = 0;

    // Default availability slots are real instants, so they need the quarter's
    // start date to exist before any of them can be written.
    const quarterStart = await getQuarterStart(env);

    for (const record of allRecords) {
      const email = (
        Array.isArray(record.fields.Email)
          ? record.fields.Email[0]
          : record.fields.Email
      )
        .trim()
        .toLowerCase();
      const rawSections =
        record.fields["Assigned Sections (click or mouseover to see all info)"];
      const sectionsStr = Array.isArray(rawSections)
        ? rawSections[0]
        : rawSections;

      if (!email || !sectionsStr) {
        errors.push(`Skipping record ${record.id}: missing email or sections`);
        continue;
      }

      const user = await db
        .prepare("SELECT id FROM user WHERE email = ?")
        .bind(email)
        .first<{ id: string }>();

      if (!user) {
        errors.push(`Skipping ${email}: user not found (run init-las first)`);
        continue;
      }

      const existing = await db
        .prepare("SELECT section_id FROM section_assignment WHERE la_id = ?")
        .bind(user.id)
        .all<{ section_id: string }>();
      const dbSections = new Set(existing.results.map((r) => r.section_id));

      const airtableSections = sectionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const rawName of airtableSections) {
        const section = await db
          .prepare(
            "SELECT id, day_of_week, end_time FROM section WHERE raw = ?",
          )
          .bind(rawName)
          .first<{
            id: string;
            day_of_week: number | null;
            end_time: string | null;
          }>();

        if (!section) {
          errors.push(
            `Skipping section for ${email}: section not found: "${rawName}"`,
          );
          continue;
        }

        if (dbSections.has(section.id)) {
          dbSections.delete(section.id);
        } else {
          insertStmts.push(
            db
              .prepare(
                `INSERT OR IGNORE INTO section_assignment (la_id, section_id) VALUES (?, ?)`,
              )
              .bind(user.id, section.id),
          );

          if (!section.day_of_week || !section.end_time) {
            errors.push(
              `Added ${email} to ${section.id} without default availability: section has no scheduled time`,
            );
            message += `adding ${email} ${section.id} (no default availability)\n`;
            continue;
          }

          const window = defaultAvailabilityWindow(section.end_time);
          for (const week of OBSERVATION_WEEK_RANGE) {
            insertStmts.push(
              db
                .prepare(
                  `INSERT OR IGNORE INTO availability
                     (id, la_id, section_id, week, start_at, end_at, status)
                   VALUES (?, ?, ?, ?, ?, ?, 'open')`,
                )
                .bind(
                  crypto.randomUUID(),
                  user.id,
                  section.id,
                  week,
                  toISO(
                    weekdayInstant(
                      quarterStart,
                      week,
                      section.day_of_week,
                      window.start,
                    ),
                  ),
                  toISO(
                    weekdayInstant(
                      quarterStart,
                      week,
                      section.day_of_week,
                      window.end,
                    ),
                  ),
                ),
            );
          }
          message += `adding ${email} ${section.id} (with default availability)\n`;
        }
      }

      for (const staleSectionId of dbSections) {
        staleCount++;
        deleteStmts.push(
          db
            .prepare(
              `DELETE FROM section_assignment WHERE la_id = ? AND section_id = ?`,
            )
            .bind(user.id, staleSectionId),
        );
        message += `deleting ${email} ${staleSectionId}\n`;
      }
    }

    if (insertStmts.length > 0 || deleteStmts.length > 0) {
      await db.batch([...insertStmts, ...deleteStmts]);
    }

    await recordEvent(db, {
      action: EVENT.SyncSectionAssignments,
      entityType: "section_assignment",
      actor: SYSTEM_ACTOR,
      details: {
        records: allRecords.length,
        added: insertStmts.length,
        removed_stale: staleCount,
        errors: errors.length,
      },
    });

    const summary =
      `Processed ${allRecords.length} records. Added: ${insertStmts.length}, Removed stale: ${staleCount}\n${message}` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`init-section-assignments failed: ${message}`, {
      status: 500,
    });
  }
}
