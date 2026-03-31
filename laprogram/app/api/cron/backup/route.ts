import { backupDatabase } from "@/lib/backup";

export async function POST(request: Request) {
  try {
    if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    await backupDatabase();

    return new Response("Backup complete", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`backup failed: ${message}`, { status: 500 });
  }
}
