import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getCurrentWeek } from "@/lib/utils";
import { QUARTER_START_KEY } from "@/lib/constants";
import { AvailabilityRow } from "@/types/db";

interface AvailabilityPayload {
  section_id: string;
  weeks: AvailabilityWeek[];
}

interface AvailabilityWeek {
  week: number;
  time: string;
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const db = env.data;
    const userId = session.user.id;

    const body = (await request.json()) as AvailabilityPayload;
    const { section_id, weeks } = body;

    if (!section_id || !Array.isArray(weeks)) {
      return new Response("Missing section_id or weeks", { status: 400 });
    }

    const assignment = await db
      .prepare(
        "SELECT la_id FROM section_assignment WHERE la_id = ? AND section_id = ?",
      )
      .bind(userId, section_id)
      .first();

    if (!assignment) {
      return new Response("No section assignment found", { status: 403 });
    }

    // filter to just the availabilities in the future (only those can be edited)
    const currentWeek = getCurrentWeek(
      (await env.config.get(QUARTER_START_KEY)) ?? "",
    );

    // grab future existing availability + statuses by week
    const existingAvailability = await db
      .prepare(
        "SELECT id, CAST(week as INTEGER) as week, status FROM availability WHERE la_id = ? AND section_id = ? AND CAST(week AS INTEGER) >= ?",
      )
      .bind(userId, section_id, currentWeek)
      .all<{ id: string; week: number; status: string }>();

    const existingStatusByWeek = new Map<number, string>();
    for (const r of existingAvailability.results) {
      existingStatusByWeek.set(r.week, r.status);
    }

    const stmts: D1PreparedStatement[] = [];

    // delete all future where it's currently open or hidden
    const deleteIds = existingAvailability.results
      .filter((r) => r.status === "open" || r.status === "hidden")
      .map((r) => r.id);

    for (const id of deleteIds) {
      stmts.push(db.prepare("DELETE FROM availability WHERE id = ?").bind(id));
    }

    // insert all future where it's currently open or hidden or not present
    const weeksToInsert = weeks.filter((w) => {
      const status = existingStatusByWeek.get(w.week);
      return (
        w.week >= currentWeek &&
        (!status || status === "open" || status === "hidden")
      );
    });

    for (const w of weeksToInsert) {
      const status = existingStatusByWeek.get(w.week) ?? "open";
      stmts.push(
        db
          .prepare(
            "INSERT INTO availability (id, la_id, section_id, time, week, status) VALUES (?, ?, ?, ?, ?, ?)",
          )
          .bind(
            crypto.randomUUID(),
            userId,
            section_id,
            w.time,
            w.week.toString(),
            status,
          ),
      );
    }

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    return Response.json({
      success: true,
      inserted: weeksToInsert.length,
      skipped: weeks.length - weeksToInsert.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to save availability: ${message}`, {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthenticated user.", { status: 401 });
    }

    const db = env.data;
    const userId = session.user.id;

    const url = new URL(request.url);
    const sectionId = url.searchParams.get("section_id");

    let result;
    if (sectionId) {
      result = await db
        .prepare(
          "SELECT id, section_id, time, CAST(week AS INTEGER) as week, status FROM availability WHERE la_id = ? AND section_id = ?",
        )
        .bind(userId, sectionId)
        .all<AvailabilityRow>();
    } else {
      result = await db
        .prepare(
          "SELECT id, section_id, time, CAST(week AS INTEGER) as week, status FROM availability WHERE la_id = ?",
        )
        .bind(userId)
        .all<AvailabilityRow>();
    }

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch availability: ${message}`, {
      status: 500,
    });
  }
}
