import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import type { AirtableRecord } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const hasCronSecret = request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
    if (!hasCronSecret) {
      const auth = await getAuth();
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    const formula = "AND(OR(FIND('New',{Position}),FIND('PED',{Position}),FIND('Returner',{Position})),{Email},{Assigned Sections (click or mouseover to see all info)})";

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Email");
    baseParams.append("fields[]", "Assigned Sections (click or mouseover to see all info)");
    baseParams.append("filterByFormula", formula);

    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const params = new URLSearchParams(baseParams);
      if (offset) params.append("offset", offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/LA Roster?${params}`,
        { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } }
      );

      if (!response.ok) {
        return new Response(
          `Failed to fetch LA Roster from Airtable: ${response.status} ${response.statusText}`,
          { status: 502 }
        );
      }

      const data = await response.json() as { records: AirtableRecord[]; offset?: string };
      if (!data.records) break;
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    if (allRecords.length === 0) {
      return new Response("No records found in LA Roster", { status: 404 });
    }

    const db = env.data;
    const stmts: D1PreparedStatement[] = [];
    const errors: string[] = [];

    for (const record of allRecords) {
      const email = Array.isArray(record.fields.Email) ? record.fields.Email[0] : record.fields.Email;
      const rawSections = record.fields["Assigned Sections (click or mouseover to see all info)"];
      const sectionsStr = Array.isArray(rawSections) ? rawSections[0] : rawSections;

      if (!email || !sectionsStr) {
        errors.push(`Skipping record ${record.id}: missing email or sections`);
        continue;
      }

      const user = await db.prepare(
        "SELECT id FROM user WHERE email = ?"
      ).bind(email).first<{ id: string }>();

      if (!user) {
        errors.push(`Skipping ${email}: user not found (run init-las first)`);
        continue;
      }

      const sections = sectionsStr.split(",").map(s => s.trim()).filter(Boolean);

      for (const sectionId of sections) {
        const section = await db.prepare(
          "SELECT id FROM section WHERE id = ?"
        ).bind(sectionId).first<{ id: string }>();

        if (!section) {
          errors.push(`Skipping section for ${email}: section not found: "${sectionId}"`);
          continue;
        }

        stmts.push(
          db.prepare(
            `INSERT OR IGNORE INTO section_assignment (la_id, full_section_name) VALUES (?, ?)`
          ).bind(user.id, sectionId)
        );
      }
    }

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    const summary = `Processed ${allRecords.length} records. Assignments: ${stmts.length}` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`init-section-assignments failed: ${message}`, { status: 500 });
  }
}
