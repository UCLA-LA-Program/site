import { getCloudflareContext } from "@opennextjs/cloudflare";
import { backupDatabase } from "@/lib/backup";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { SQL_NOW } from "@/lib/time";
import { EVENT, SYSTEM_ACTOR, recordEvent } from "@/lib/events";

interface SectionRecord {
  fields: Record<string, string>;
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

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Section");
    baseParams.append("fields[]", "TA Name");
    baseParams.append("fields[]", "TA Email");
    baseParams.append("fields[]", "ID");
    baseParams.append("filterByFormula", "{Section}");

    const allRecords: SectionRecord[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams(baseParams);
      if (offset) params.append("offset", offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/List of Sections?${params}`,
        {
          headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
        },
      );

      if (!response.ok) {
        return new Response(
          `Failed to fetch sections from Airtable: ${response.status} ${response.statusText}`,
          { status: 502 },
        );
      }

      const data = (await response.json()) as {
        records: SectionRecord[];
        offset?: string;
      };
      if (!data.records) break;
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (allRecords.length === 0) {
      return new Response("No records found in List of Sections", {
        status: 404,
      });
    }

    // ISO weekday, 1 = Monday.
    const dayMap: Record<string, number> = { M: 1, T: 2, W: 3, R: 4, F: 5 };

    function to24(hour: number, period: string): number {
      if (period === "am") return hour === 12 ? 0 : hour;
      return hour === 12 ? 12 : hour + 12;
    }

    /**
     * Airtable section times arrive in whatever shape a human typed them
     * ("2-2:50pm", "9 - 9:50 a"). This is the one place that mess is
     * untangled: everything downstream sees 'HH:MM'.
     */
    function standardizeTime(
      raw: string,
    ): { start: string; end: string } | null {
      const cleaned = raw
        .replace(/\*/g, "")
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+(am|pm|a|p)\b/gi, "$1");

      const parts = cleaned.split("-").map((part) => {
        const m = part.trim().match(/^(\d+)(?::(\d+))?(am|pm|a|p)?$/i);
        if (!m) return null;
        const [, hours, minutes, period] = m;
        return {
          hour: parseInt(hours),
          mins: minutes ?? "00",
          period: period
            ? period.toLowerCase().startsWith("a")
              ? "am"
              : "pm"
            : "",
        };
      });

      if (parts.length !== 2 || parts.some((p) => p === null)) return null;
      const [start, end] = parts as NonNullable<(typeof parts)[number]>[];

      // Infer missing am/pm on start from end time
      if (!start.period && end.period) {
        const endPeriod = end.period;
        const start24 = to24(start.hour, endPeriod);
        const end24 = to24(end.hour, endPeriod);
        // If assuming same period makes start > end, flip to opposite
        start.period =
          start24 <= end24 ? endPeriod : endPeriod === "am" ? "pm" : "am";
      }

      const clock = (p: { hour: number; mins: string; period: string }) => {
        const h = p.period ? to24(p.hour, p.period) : p.hour;
        return `${String(h).padStart(2, "0")}:${p.mins.padStart(2, "0")}`;
      };

      return { start: clock(start), end: clock(end) };
    }

    const db = env.data;
    const stmts: D1PreparedStatement[] = [];
    const errors: string[] = [];

    for (const record of allRecords) {
      const raw = record.fields["Section"].trim();
      const taName = record.fields["TA Name"] ?? "";
      const taEmail = record.fields["TA Email"] ?? "";
      const id = record.fields["ID"]
        ? parseInt(record.fields["ID"]).toString()
        : null;

      const match = raw.match(
        /^(.+?):\s*([MTWRF]);?\s+(.*)\(([^)]+)\)\s+(.+)$/,
      );
      if (!match || !id) {
        errors.push(`Failed to parse section: ${raw}`);
        continue;
      }

      const [, courseName, dayAbbr, rawTime, sectionName, location] = match;
      const dayOfWeek = dayMap[dayAbbr] ?? null;
      const time = standardizeTime(rawTime.replace(/\([^)]*\)/g, "").trim());

      if (!dayOfWeek || !time) {
        errors.push(`Failed to parse section time or day: ${raw}`);
        continue;
      }

      stmts.push(
        db
          .prepare(
            `INSERT INTO section (id, raw, course_name, section_name, day_of_week, start_time, end_time, location, ta_name, ta_email, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${SQL_NOW})
           ON CONFLICT (id) DO UPDATE SET
            raw = excluded.raw,
            course_name = excluded.course_name,
            section_name = excluded.section_name,
            day_of_week = excluded.day_of_week,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            location = excluded.location,
            ta_name = excluded.ta_name,
            ta_email = excluded.ta_email,
            updated_at = excluded.updated_at`,
          )
          .bind(
            id,
            raw,
            courseName.trim(),
            sectionName.trim(),
            dayOfWeek,
            time.start,
            time.end,
            location.trim(),
            taName,
            taEmail,
          ),
      );
    }

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    await recordEvent(db, {
      action: EVENT.SyncSections,
      entityType: "section",
      actor: SYSTEM_ACTOR,
      details: {
        records: allRecords.length,
        written: stmts.length,
        errors: errors.length,
      },
    });

    const summary =
      `Processed ${allRecords.length} records. Sections: ${stmts.length}` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`init-sections failed: ${message}`, { status: 500 });
  }
}
