import { getCloudflareContext } from "@opennextjs/cloudflare";

const TABLES = [
  "user",
  "session",
  "account",
  "verification",
  "course",
  "feedback",
  "section",
  "section_assignment",
  "availability",
  "observation",
];

export async function backupDatabase() {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.data;
  const backup: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    const { results } = await db.prepare(`SELECT * FROM "${table}"`).all();
    backup[table] = results;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `backups/${timestamp}.json`;

  await env.db_backups.put(key, JSON.stringify(backup, null, 2), {
    httpMetadata: { contentType: "application/json" },
  });

  console.log(`Database backup saved to ${key}`);
}
