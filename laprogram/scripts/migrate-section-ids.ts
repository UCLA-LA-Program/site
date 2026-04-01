// Fetches sections from Airtable and outputs SQL to replace section IDs in D1.
// Currently section.id = full section name string. This outputs UPDATE statements
// to change each section.id to the Airtable record ID. ON UPDATE CASCADE propagates
// the change to section_assignment and availability.
//
// Usage: npx tsx scripts/migrate-section-ids.ts > scripts/migrate-section-ids.sql
//        npx wrangler d1 execute data --remote --file=scripts/migrate-section-ids.sql
//
// Requires AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env

import "dotenv/config";

interface SectionRecord {
  id: string;
  fields: Record<string, string>;
}

async function main() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error(
      "Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in .env",
    );
    process.exit(1);
  }

  const allRecords: SectionRecord[] = [];
  let offset: string | undefined;

  const baseParams = new URLSearchParams();
  baseParams.append("fields[]", "Section");
  baseParams.append("filterByFormula", "{Section}");

  do {
    const params = new URLSearchParams(baseParams);
    if (offset) params.append("offset", offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/List of Sections?${params}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } },
    );

    if (!response.ok) {
      console.error(
        `Airtable fetch failed: ${response.status} ${response.statusText}`,
      );
      process.exit(1);
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
    console.error("No sections found in Airtable.");
    process.exit(1);
  }

  for (const record of allRecords) {
    const sectionName = record.fields["Section"]?.trim();
    if (!sectionName) continue;

    const escapedName = sectionName.replace(/'/g, "''");
    const airtableId = record.id;

    console.log(
      `UPDATE section SET id = '${airtableId}' WHERE id = '${escapedName}';`,
    );
  }

  console.error(
    `Generated UPDATE statements for ${allRecords.length} sections.`,
  );
}

main();
