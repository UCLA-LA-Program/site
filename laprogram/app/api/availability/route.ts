import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { getCurrentWeek, parseQuarterStart } from "@/lib/utils";
import { toISO, weekdayInstant } from "@/lib/time";
import { EVENT, eventStmt } from "@/lib/events";
import { QUARTER_START_KEY } from "@/lib/constants";
import { AvailabilityRow } from "@/types/db";

interface AvailabilityPayload {
  section_id: string;
  weeks: AvailabilityWeek[];
  la_id?: string;
}

interface AvailabilityWeek {
  week: number;
  /** Wall-clock 'HH:MM' in LA. */
  start_time: string;
  end_time: string;
}

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

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

    const body = (await request.json()) as AvailabilityPayload;
    const { section_id, weeks, la_id } = body;

    if (!section_id || !Array.isArray(weeks)) {
      return new Response("Missing section_id or weeks", { status: 400 });
    }

    if (
      weeks.some((w) => !CLOCK.test(w.start_time) || !CLOCK.test(w.end_time))
    ) {
      return new Response("Times must be 'HH:MM'", { status: 400 });
    }

    const isAdmin = session.user.role === "admin";
    const userId = la_id && isAdmin ? la_id : session.user.id;

    const assignment = await db
      .prepare(
        "SELECT la_id FROM section_assignment WHERE la_id = ? AND section_id = ?",
      )
      .bind(userId, section_id)
      .first();

    if (!assignment) {
      return new Response("No section assignment found", { status: 403 });
    }

    // The weekday a slot lands on comes from the section it belongs to.
    const section = await db
      .prepare("SELECT day_of_week FROM section WHERE id = ?")
      .bind(section_id)
      .first<{ day_of_week: number | null }>();

    if (!section?.day_of_week) {
      return new Response("Section has no scheduled day", { status: 409 });
    }

    const quarterStartRaw = (await env.config.get(QUARTER_START_KEY)) ?? "";
    if (!quarterStartRaw) {
      return new Response("QUARTER_START not configured", { status: 409 });
    }
    const quarterStart = parseQuarterStart(quarterStartRaw);

    // filter to just the availabilities in the future (only those can be edited)
    const currentWeek = getCurrentWeek(quarterStartRaw);

    // grab future existing availability + statuses by week
    const existingAvailability = await db
      .prepare(
        "SELECT id, week, status FROM availability WHERE la_id = ? AND section_id = ? AND week >= ?",
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
            `INSERT INTO availability
               (id, la_id, section_id, week, start_at, end_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            crypto.randomUUID(),
            userId,
            section_id,
            w.week,
            toISO(
              weekdayInstant(
                quarterStart,
                w.week,
                section.day_of_week,
                w.start_time,
              ),
            ),
            toISO(
              weekdayInstant(
                quarterStart,
                w.week,
                section.day_of_week,
                w.end_time,
              ),
            ),
            status,
          ),
      );
    }

    stmts.push(
      eventStmt(db, {
        action: EVENT.AvailabilitySave,
        entityType: "availability",
        entityId: section_id,
        actor: { id: session.user.id, email: session.user.email },
        target: userId === session.user.id ? null : { id: userId },
        details: {
          section_id,
          removed: deleteIds.length,
          inserted: weeksToInsert.length,
          weeks: weeksToInsert.map((w) => w.week),
          on_behalf_of: userId === session.user.id ? null : userId,
        },
      }),
    );

    await db.batch(stmts);

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

    const url = new URL(request.url);
    const sectionId = url.searchParams.get("section_id");
    const laIdParam = url.searchParams.get("la_id");
    const isAdmin = session.user.role === "admin";
    const userId = laIdParam && isAdmin ? laIdParam : session.user.id;

    const columns = "id, section_id, week, start_at, end_at, status";
    const result = sectionId
      ? await db
          .prepare(
            `SELECT ${columns} FROM availability WHERE la_id = ? AND section_id = ?`,
          )
          .bind(userId, sectionId)
          .all<AvailabilityRow>()
      : await db
          .prepare(`SELECT ${columns} FROM availability WHERE la_id = ?`)
          .bind(userId)
          .all<AvailabilityRow>();

    return Response.json(result.results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to fetch availability: ${message}`, {
      status: 500,
    });
  }
}
