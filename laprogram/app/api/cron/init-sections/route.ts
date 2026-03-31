import { getCloudflareContext } from "@opennextjs/cloudflare";
import { backupDatabase } from "@/lib/backup";

interface SectionRecord {
  id: string;
  fields: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    await backupDatabase();

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Section");
    baseParams.append("fields[]", "TA Name");
    baseParams.append("fields[]", "TA Email");
    baseParams.append("filterByFormula", "{Section}");

    const allRecords: SectionRecord[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams(baseParams);
      if (offset) params.append("offset", offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/List of Sections?${params}`,
        { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } }
      );

      if (!response.ok) {
        return new Response(
          `Failed to fetch sections from Airtable: ${response.status} ${response.statusText}`,
          { status: 502 }
        );
      }

      const data = await response.json() as { records: SectionRecord[]; offset?: string };
      if (!data.records) break;
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (allRecords.length === 0) {
      return new Response("No records found in List of Sections", { status: 404 });
    }

    const dayMap: Record<string, string> = {
      M: "Monday", T: "Tuesday", W: "Wednesday", R: "Thursday", F: "Friday",
    };

    function to24(hour: number, period: string): number {
      if (period === "am") return hour === 12 ? 0 : hour;
      return hour === 12 ? 12 : hour + 12;
    }

    function standardizeTime(raw: string): string {
      const cleaned = raw
        .replace(/\*/g, "")
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+(am|pm|a|p)\b/gi, "$1");

      const parts = cleaned.split("-").map(part => {
        const m = part.trim().match(/^(\d+)(?::(\d+))?(am|pm|a|p)?$/i);
        if (!m) return { text: part.trim(), hour: 0, mins: "00", period: "" };
        const [, hours, minutes, period] = m;
        return {
          text: part.trim(),
          hour: parseInt(hours),
          mins: minutes ?? "00",
          period: period ? (period.toLowerCase().startsWith("a") ? "am" : "pm") : "",
        };
      });

      // Infer missing am/pm on start from end time
      if (parts.length === 2 && !parts[0].period && parts[1].period) {
        const endPeriod = parts[1].period;
        const start24 = to24(parts[0].hour, endPeriod);
        const end24 = to24(parts[1].hour, endPeriod);
        // If assuming same period makes start > end, flip to opposite
        parts[0].period = start24 <= end24 ? endPeriod : (endPeriod === "am" ? "pm" : "am");
      }

      return parts.map(p => `${p.hour}:${p.mins}${p.period}`).join("-");
    }

    const db = env.data;
    const stmts: D1PreparedStatement[] = [];
    const errors: string[] = [];

    for (const record of allRecords) {
      const raw = record.fields["Section"];
      const taName = record.fields["TA Name"];
      const taEmail = record.fields["TA Email"];

      const match = raw.match(/^(.+?):\s*([MTWRF]);?\s+(.*)\(([^)]+)\)\s+(.+)$/);
      if (!match) {
        errors.push(`Failed to parse section: ${raw}`);
        continue;
      }

      const [, courseName, dayAbbr, rawTime, sectionName, location] = match;
      const day = dayMap[dayAbbr] ?? dayAbbr;
      const time = standardizeTime(rawTime.replace(/\([^)]*\)/g, "").trim());
      const id = raw;

      stmts.push(
        db.prepare(
          `INSERT INTO section (id, course_name, section_name, day, time, location, ta_name, ta_email)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
            day = excluded.day,
            time = excluded.time,
            location = excluded.location,
            ta_name = excluded.ta_name,
            ta_email = excluded.ta_email`
        ).bind(id, courseName.trim(), sectionName.trim(), day, time, location.trim(), taName, taEmail)
      );
    }

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    const summary = `Processed ${allRecords.length} records. Sections: ${stmts.length}` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`init-sections failed: ${message}`, { status: 500 });
  }
}
