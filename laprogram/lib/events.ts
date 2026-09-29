import { v7 as uuidv7 } from "uuid";

/*
Append-only event log. Row timestamps cover "when was this last changed"; this
covers "what happened", including the things that delete the row they describe.

Actions are `domain.verb` so a prefix match gets a whole domain:
  SELECT * FROM event_log WHERE action LIKE 'observation.%' ORDER BY occurred_at DESC;
*/

export const EVENT = {
  ObservationSignup: "observation.signup",
  ObservationCancel: "observation.cancel",
  ObservationAdminRemove: "observation.admin_remove",
  AvailabilitySave: "availability.save",
  AvailabilityReset: "availability.reset",
  FeedbackSubmit: "feedback.submit",
  FeedbackPair: "feedback.pair",
  SyncLAs: "sync.las",
  SyncSections: "sync.sections",
  SyncSectionAssignments: "sync.section_assignments",
  UserWithdraw: "user.withdraw",
} as const;

export type EventAction = (typeof EVENT)[keyof typeof EVENT];

/** Who did it. Cron runs have no session, so pass `SYSTEM_ACTOR`. */
export type EventActor = {
  id?: string | null;
  email?: string | null;
};

export const SYSTEM_ACTOR: EventActor = { id: null, email: "system:cron" };

export type EventInput = {
  action: EventAction;
  entityType: string;
  entityId?: string | null;
  actor?: EventActor | null;
  /** The other party, where there is one -- the observee on a sign-up. */
  target?: EventActor | null;
  /** Anything worth keeping that is not worth a column. Stored as JSON. */
  details?: Record<string, unknown>;
};

/**
 * Builds the insert without running it, so a log entry can ride along in the
 * same `db.batch()` as the change it describes and cannot drift from it.
 */
export function eventStmt(
  db: D1Database,
  event: EventInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO event_log
         (id, action, entity_type, entity_id, actor_id, actor_email,
          target_id, target_email, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      uuidv7(),
      event.action,
      event.entityType,
      event.entityId ?? null,
      event.actor?.id ?? null,
      event.actor?.email ?? null,
      event.target?.id ?? null,
      event.target?.email ?? null,
      JSON.stringify(event.details ?? {}),
    );
}

/**
 * Logs an event on its own. Never throws: losing an audit line should not fail
 * the request that produced it. Prefer `eventStmt` inside an existing batch.
 */
export async function recordEvent(
  db: D1Database,
  event: EventInput,
): Promise<void> {
  try {
    await eventStmt(db, event).run();
  } catch (error) {
    console.error(`Failed to log ${event.action}:`, error);
  }
}
