-- Migration number: 0002 	 2026-04-01T21:36:38.586Z

-- Add raw column to section (stores the original full section name string)
ALTER TABLE "section" ADD COLUMN "raw" text NOT NULL DEFAULT '';

-- Populate raw with the current id (which is the full section name)
UPDATE "section" SET "raw" = "id";

CREATE INDEX "section_raw" ON "section" ("raw");

-- Recreate section_assignment: rename full_section_name -> section_id, add ON UPDATE CASCADE
CREATE TABLE "section_assignment_new" (
    "la_id" text NOT NULL,
    "section_id" text NOT NULL,
    FOREIGN KEY ("la_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("section_id") REFERENCES "section" ("id") ON UPDATE CASCADE,
    PRIMARY KEY ("la_id", "section_id")
);

INSERT INTO "section_assignment_new" ("la_id", "section_id")
SELECT "la_id", "full_section_name" FROM "section_assignment";

DROP TABLE "section_assignment";
ALTER TABLE "section_assignment_new" RENAME TO "section_assignment";

-- Recreate availability: composite FK to section_assignment
CREATE TABLE "availability_new" (
    "id" text NOT NULL PRIMARY KEY,
    "la_id" text NOT NULL,
    "section_id" text NOT NULL,
    "time" text NOT NULL,
    "week" text NOT NULL,
    "status" text NOT NULL CHECK ("status" IN ('open', 'hidden', 'taken')),
    FOREIGN KEY ("la_id", "section_id") REFERENCES "section_assignment" ("la_id", "section_id") ON UPDATE CASCADE
);

INSERT INTO "availability_new" ("id", "la_id", "section_id", "time", "week", "status")
SELECT "id", "la_id", "section_id", "time", "week", "status" FROM "availability";

DROP TABLE "availability";
ALTER TABLE "availability_new" RENAME TO "availability";
