import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchPositionCoursePairs, type AirtableRecord } from "@/lib/airtable";


export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formula = "AND(OR(FIND('New',{Position}),FIND('PED',{Position}),FIND('LCC',{Position}),FIND('Returner',{Position})),{Course},{Email})";

    const baseParams = new URLSearchParams();
    baseParams.append("fields[]", "Name");
    baseParams.append("fields[]", "Course");
    baseParams.append("fields[]", "Position");
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
    const userStmts: D1PreparedStatement[] = [];
    const courseStmts: D1PreparedStatement[] = [];
    const errors: string[] = [];

    for (const record of allRecords) {
      const name = record.fields.Name;
      const email = Array.isArray(record.fields.Email) ? record.fields.Email[0] : record.fields.Email;
      const courses = record.fields.Course;
      const positions = record.fields.Position;
      const assignedSections = Array.isArray(record.fields["Assigned Sections (click or mouseover to see all info)"])
        ? record.fields["Assigned Sections (click or mouseover to see all info)"][0]
        : record.fields["Assigned Sections (click or mouseover to see all info)"];
      const now = new Date().toISOString();

      if (!name || !email) {
        errors.push(`Skipping record ${record.id}: missing name or email`);
        continue;
      }

      let userId: string;
      const existing = await db.prepare(
        "SELECT id FROM user WHERE email = ?"
      ).bind(email).first<{ id: string }>();

      if (existing) {
        userId = existing.id;
      } else {
        userId = crypto.randomUUID();
      }

      userStmts.push(
        db.prepare(
          `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
           VALUES (?, ?, ?, 0, ?, ?, 'user')
           ON CONFLICT (id) DO UPDATE SET
            name = excluded.name,
            updatedAt = excluded.updatedAt`
        ).bind(userId, name, email, now, now)
      );

      try {
        const coursePositionPairs = await fetchPositionCoursePairs(name, courses, positions, assignedSections);

        for (const [courseName, position] of coursePositionPairs) {
          courseStmts.push(
            db.prepare(
              `INSERT OR IGNORE INTO course (userId, course_name, position) VALUES(?, ?, ?)`
            ).bind(userId, courseName, position)
          );
        }
      } catch (e) {
        errors.push(`${name} (${email}): ${e instanceof Error ? e.message : "failed to resolve courses"}`);
      }
    }

    await db.batch([...userStmts, ...courseStmts]);

    const summary = `Processed ${allRecords.length} records. Users: ${userStmts.length}, Courses: ${courseStmts.length}` +
      (errors.length > 0 ? `\nErrors:\n${errors.join("\n")}` : "");

    return new Response(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`init-las failed: ${message}`, { status: 500 });
  }
}
