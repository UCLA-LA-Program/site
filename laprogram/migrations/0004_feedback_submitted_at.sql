-- Migration number: 0004 	 2026-04-28
-- Record when each feedback row is submitted. NULL for rows inserted
-- before this migration.

ALTER TABLE feedback ADD COLUMN submitted_at TEXT;
