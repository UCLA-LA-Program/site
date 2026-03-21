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
	"updatedAt" date NOT NULL
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

/*
DATA SECTION
*/
