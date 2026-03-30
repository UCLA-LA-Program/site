-- Migration number: 0001 	 2026-03-21T05:39:19.526Z

/*
AUTH SECTION
DO NOT EDIT
*/

CREATE TABLE IF NOT EXISTS "user" (
	"id" text NOT NULL PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" integer NOT NULL,
	"image" text,
	"createdAt" date NOT NULL,
	"updatedAt" date NOT NULL,
    "role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamptz
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" date NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" date NOT NULL,
	"updatedAt" date NOT NULL,
    "impersonatedBy" text,
	FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" date,
	"refreshTokenExpiresAt" date,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" date NOT NULL,
	"updatedAt" date NOT NULL,
	FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text NOT NULL PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" date NOT NULL,
	"createdAt" date NOT NULL,
	"updatedAt" date NOT NULL
);

-- Create admin user
INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
VALUES ('admin_user_id', 'Program Development Team', 'pdt.laprogram@gmail.com', 1, datetime('now'), datetime('now'), 'admin');

/*
DATA SECTION
*/

-- Course assignments (which user is in which course, and their role)
CREATE TABLE IF NOT EXISTS "course" (
	"userId" text NOT NULL,
	"course_name" text NOT NULL,
	"position" text NOT NULL,
	PRIMARY KEY ("userId", "course_name", "position"),
	FOREIGN KEY ("userId") REFERENCES "user" ("id")
);

CREATE INDEX "course_name" ON "course" ("course_name");

-- Feedback submissions
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" text NOT NULL PRIMARY KEY,
	"recipientId" text NOT NULL,
	"feedback" text NOT NULL,
	FOREIGN KEY ("recipientId") REFERENCES "user" ("id")
);

CREATE INDEX "feedback_recipient" ON "feedback" ("recipientId");

-- Sections
CREATE TABLE IF NOT EXISTS "section" (
    "id" text NOT NULL PRIMARY KEY,
    "course_name" text NOT NULL,
    "section_name" text NOT NULL,
    "day" text NOT NULL,
    "time" text NOT NULL,
    "location" text NOT NULL,
    "ta_name" text,
    "ta_email" text
);

CREATE INDEX "section_course" ON "section" ("course_name");

-- Section Assignments
CREATE TABLE IF NOT EXISTS "section_assignment" (
	"la_id" text NOT NULL,
	"full_section_name" text NOT NULL,
	FOREIGN KEY ("la_id") REFERENCES "user" ("id"),
	FOREIGN KEY ("full_section_name") REFERENCES "section" ("id"),
	PRIMARY KEY ("la_id", "full_section_name")
);

-- Availability
CREATE TABLE IF NOT EXISTS "availability" (
    "id" text NOT NULL PRIMARY KEY,
    "la_id" text NOT NULL,
    "section_id" text NOT NULL,
    "time" text NOT NULL,
    "week" text NOT NULL,
    "status" text NOT NULL CHECK ("status" IN ('open', 'hidden', 'taken')),
    FOREIGN KEY ("la_id") REFERENCES "user" ("id"),
	FOREIGN KEY ("section_id") REFERENCES "section" ("id")
);

-- Observations
CREATE TABLE IF NOT EXISTS "observation" (
    "id" text NOT NULL PRIMARY KEY,
    "observer_id" text NOT NULL,
    "observee_id" text NOT NULL,
    "availability_id" text NOT NULL,
    FOREIGN KEY ("observer_id") REFERENCES "user" ("id"),
    FOREIGN KEY ("observee_id") REFERENCES "user" ("id"),
	FOREIGN KEY ("availability_id") REFERENCES "availability" ("id")
);