-- Migration number: 0005 	 2026-07-29

/*
Move every app-owned time value onto a standard format, and record when rows
are created, changed, and acted on.

CANONICAL FORMATS
  instant       TEXT, ISO-8601 UTC with milliseconds: '2026-07-29T04:12:33.123Z'
                SQL:  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                TS:   new Date().toISOString()
  time of day   TEXT, 24-hour zero-padded 'HH:MM' (America/Los_Angeles wall time)
  day of week   INTEGER, ISO-8601 weekday: 1 = Monday ... 7 = Sunday
  week          INTEGER (was TEXT)

The BetterAuth tables (user, session, account, verification) are deliberately
untouched. BetterAuth already writes ISO-8601 UTC strings into them, so the data
is already canonical; only the declared column types are odd, and that is inert
in SQLite. Rebuilding them would mean dropping the production user table for a
cosmetic change.

created_at / updated_at are nullable on purpose. Rows that predate this
migration genuinely have no known creation time, so they carry NULL rather than
a migration-time value that would claim they were created today. Every row
inserted from here on picks up the DEFAULT.
*/

/* ---------------------------------------------------------------- section --
   Replaces day ('Monday') + time ('9:00-9:50', sometimes '1:00pm-1:50pm')
   with day_of_week + start_time/end_time.

   The backfill parses the two legacy time formats that reach this column:
   24-hour ('14:00') and 12-hour with a period suffix ('2:00pm'). Rows whose
   time does not parse land as NULL; init-sections rewrites the whole table
   from Airtable each quarter, which repairs them.
*/

CREATE TABLE "section_new" (
    "id" text NOT NULL PRIMARY KEY,
    "raw" text NOT NULL DEFAULT '',
    "course_name" text NOT NULL,
    "section_name" text NOT NULL,
    "day_of_week" integer CHECK ("day_of_week" BETWEEN 1 AND 7),
    "start_time" text,
    "end_time" text,
    "location" text NOT NULL,
    "ta_name" text,
    "ta_email" text,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO "section_new" (
    id, raw, course_name, section_name, day_of_week, start_time, end_time,
    location, ta_name, ta_email, created_at, updated_at
)
WITH halves AS (
    SELECT id, raw, course_name, section_name, location, ta_name, ta_email, day,
           CASE WHEN instr(time, '-') > 0
                THEN substr(time, 1, instr(time, '-') - 1) END AS s_raw,
           CASE WHEN instr(time, '-') > 0
                THEN substr(time, instr(time, '-') + 1) END AS e_raw
    FROM "section"
),
stripped AS (
    SELECT *,
           CASE WHEN s_raw LIKE '%am' OR s_raw LIKE '%pm'
                THEN substr(s_raw, 1, length(s_raw) - 2) ELSE s_raw END AS s_core,
           CASE WHEN s_raw LIKE '%pm' THEN 'pm'
                WHEN s_raw LIKE '%am' THEN 'am' ELSE '' END AS s_per,
           CASE WHEN e_raw LIKE '%am' OR e_raw LIKE '%pm'
                THEN substr(e_raw, 1, length(e_raw) - 2) ELSE e_raw END AS e_core,
           CASE WHEN e_raw LIKE '%pm' THEN 'pm'
                WHEN e_raw LIKE '%am' THEN 'am' ELSE '' END AS e_per
    FROM halves
),
parts AS (
    SELECT *,
           -- A row is parseable only if both halves carry an 'H:MM'. Rows that
           -- are not keep their identity and take NULL times; dropping them
           -- would orphan section_assignment.
           (instr(s_core, ':') > 0 AND instr(e_core, ':') > 0) AS parseable,
           CAST(substr(s_core, 1, instr(s_core, ':') - 1) AS INTEGER) AS s_h,
           substr(s_core, instr(s_core, ':') + 1) AS s_m,
           CAST(substr(e_core, 1, instr(e_core, ':') - 1) AS INTEGER) AS e_h,
           substr(e_core, instr(e_core, ':') + 1) AS e_m
    FROM stripped
)
SELECT id, raw, course_name, section_name,
       CASE day
           WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7 END,
       CASE WHEN parseable THEN printf('%02d:%s',
           CASE WHEN s_per = 'pm' AND s_h <> 12 THEN s_h + 12
                WHEN s_per = 'am' AND s_h = 12 THEN 0 ELSE s_h END, s_m) END,
       CASE WHEN parseable THEN printf('%02d:%s',
           CASE WHEN e_per = 'pm' AND e_h <> 12 THEN e_h + 12
                WHEN e_per = 'am' AND e_h = 12 THEN 0 ELSE e_h END, e_m) END,
       location, ta_name, ta_email, NULL, NULL
FROM parts;

DROP TABLE "section";
ALTER TABLE "section_new" RENAME TO "section";

CREATE INDEX "section_course" ON "section" ("course_name");
CREATE INDEX "section_raw" ON "section" ("raw");

/* ----------------------------------------------------------------- course */

CREATE TABLE "course_new" (
    "userId" text NOT NULL,
    "course_name" text NOT NULL,
    "position" text NOT NULL,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY ("userId", "course_name"),
    FOREIGN KEY ("userId") REFERENCES "user" ("id")
);

INSERT INTO "course_new" (userId, course_name, position, created_at, updated_at)
SELECT userId, course_name, position, NULL, NULL FROM "course";

DROP TABLE "course";
ALTER TABLE "course_new" RENAME TO "course";

CREATE INDEX "course_name" ON "course" ("course_name");

/* ----------------------------------------------------- section_assignment */

CREATE TABLE "section_assignment_new" (
    "la_id" text NOT NULL,
    "section_id" text NOT NULL,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY ("la_id", "section_id"),
    FOREIGN KEY ("la_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("section_id") REFERENCES "section" ("id") ON UPDATE CASCADE
);

INSERT INTO "section_assignment_new" (la_id, section_id, created_at, updated_at)
SELECT la_id, section_id, NULL, NULL FROM "section_assignment";

DROP TABLE "section_assignment";
ALTER TABLE "section_assignment_new" RENAME TO "section_assignment";

/* ----------------------------------------------------------- availability --
   week becomes INTEGER; the '9:20-9:50' string is replaced by real instants.

   start_at/end_at are left NULL for existing rows: deriving them needs
   QUARTER_START, which lives in KV and is not reachable from SQL. The API
   computes them on write, so rows created from here on are complete.
*/

CREATE TABLE "availability_new" (
    "id" text NOT NULL PRIMARY KEY,
    "la_id" text NOT NULL,
    "section_id" text NOT NULL,
    "week" integer NOT NULL,
    "start_at" text,
    "end_at" text,
    "status" text NOT NULL CHECK ("status" IN ('open', 'hidden', 'taken')),
    "status_changed_at" text,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("la_id", "section_id")
        REFERENCES "section_assignment" ("la_id", "section_id")
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO "availability_new" (
    id, la_id, section_id, week, start_at, end_at, status,
    status_changed_at, created_at, updated_at
)
SELECT id, la_id, section_id, CAST(week AS INTEGER), NULL, NULL, status,
       NULL, NULL, NULL
FROM "availability";

DROP TABLE "availability";
ALTER TABLE "availability_new" RENAME TO "availability";

CREATE INDEX "availability_start" ON "availability" ("start_at");
CREATE INDEX "availability_status" ON "availability" ("status");

/* ------------------------------------------------------------ observation --
   Sign-up time was never recorded anywhere; created_at fixes that.
*/

CREATE TABLE "observation_new" (
    "id" text NOT NULL PRIMARY KEY,
    "observer_id" text NOT NULL,
    "observee_id" text NOT NULL,
    "availability_id" text NOT NULL,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("observer_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("observee_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("availability_id") REFERENCES "availability" ("id") ON DELETE CASCADE
);

INSERT INTO "observation_new" (
    id, observer_id, observee_id, availability_id, created_at, updated_at
)
SELECT id, observer_id, observee_id, availability_id, NULL, NULL
FROM "observation";

DROP TABLE "observation";
ALTER TABLE "observation_new" RENAME TO "observation";

CREATE INDEX "observation_observer" ON "observation" ("observer_id");
CREATE INDEX "observation_availability" ON "observation" ("availability_id");

/* --------------------------------------------------------------- feedback --
   submitted_at was written with datetime('now'), producing
   '2026-04-28 17:03:11' -- not ISO-8601, and parsed as *local* time by
   JS Date, which is why the admin panel had to hand-patch the string.
*/

CREATE TABLE "feedback_new" (
    "id" text NOT NULL PRIMARY KEY,
    "recipientId" text NOT NULL,
    "feedback" text NOT NULL,
    "submitted_at" text,
    "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("recipientId") REFERENCES "user" ("id")
);

INSERT INTO "feedback_new" (
    id, recipientId, feedback, submitted_at, created_at, updated_at
)
SELECT id, recipientId, feedback,
       CASE
           WHEN submitted_at IS NULL THEN NULL
           WHEN submitted_at LIKE '%T%' THEN submitted_at
           ELSE replace(submitted_at, ' ', 'T') || '.000Z'
       END,
       CASE
           WHEN submitted_at IS NULL THEN NULL
           WHEN submitted_at LIKE '%T%' THEN submitted_at
           ELSE replace(submitted_at, ' ', 'T') || '.000Z'
       END,
       NULL
FROM "feedback";

DROP TABLE "feedback";
ALTER TABLE "feedback_new" RENAME TO "feedback";

CREATE INDEX "feedback_recipient" ON "feedback" ("recipientId");
CREATE INDEX "feedback_submitted" ON "feedback" ("submitted_at");

/* -------------------------------------------------------------- event_log --
   Append-only record of things that happen, especially the ones that delete
   rows (cancellations, admin removals, withdraws) where a column on the row
   cannot survive to tell the story.

   Flat, indexed columns carry everything you would filter or sort on, so the
   common queries never need to open `details`. actor_email and target_email
   are denormalized on purpose: process-withdraws removes users, and a log
   entry that degrades to a dangling id is not worth much. No foreign keys --
   the log outlives what it describes.
*/

CREATE TABLE "event_log" (
    "id" text NOT NULL PRIMARY KEY,
    "occurred_at" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "action" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" text,
    "actor_id" text,
    "actor_email" text,
    "target_id" text,
    "target_email" text,
    "details" text NOT NULL DEFAULT '{}'
);

CREATE INDEX "event_log_occurred" ON "event_log" ("occurred_at");
CREATE INDEX "event_log_action" ON "event_log" ("action", "occurred_at");
CREATE INDEX "event_log_entity" ON "event_log" ("entity_type", "entity_id");
CREATE INDEX "event_log_actor" ON "event_log" ("actor_id", "occurred_at");

/* --------------------------------------------------------------- triggers --
   updated_at maintains itself, so plain UPDATEs anywhere in the codebase stay
   observable without every call site remembering to set it. The
   `NEW.updated_at IS OLD.updated_at` guard leaves explicit writes alone and
   stops the trigger's own UPDATE from looping.
*/

CREATE TRIGGER "course_touch" AFTER UPDATE ON "course" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "course" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE userId = NEW.userId AND course_name = NEW.course_name;
END;

CREATE TRIGGER "section_touch" AFTER UPDATE ON "section" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "section" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER "section_assignment_touch" AFTER UPDATE ON "section_assignment" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "section_assignment" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE la_id = NEW.la_id AND section_id = NEW.section_id;
END;

CREATE TRIGGER "availability_touch" AFTER UPDATE ON "availability" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "availability" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

-- Every open/hidden/taken flip is timestamped, including the bulk resets that
-- do not go through a per-row code path.
CREATE TRIGGER "availability_status_touch" AFTER UPDATE OF "status" ON "availability" FOR EACH ROW
WHEN NEW.status <> OLD.status
BEGIN
    UPDATE "availability" SET status_changed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER "observation_touch" AFTER UPDATE ON "observation" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "observation" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER "feedback_touch" AFTER UPDATE ON "feedback" FOR EACH ROW
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
    UPDATE "feedback" SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;
