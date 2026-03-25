import "server-only";

import { betterAuth } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { nextCookies } from "better-auth/next-js";
import sendMagicLinkSES from "./email";

async function authBuilder() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.data) {
    throw Error("Could not find D1 for BetterAuth initialization");
  }

  if (!process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    throw Error("Could not find trusted URL");
  }

  return betterAuth({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL],
    database: {
      db: new Kysely({
        dialect: new D1Dialect({ database: env.data }),
      }),
      type: "sqlite",
    },
    plugins: [
      magicLink({
        disableSignUp: true,
        sendMagicLink: (data) => {
          sendMagicLinkSES(data.email, data.url);
        },
      }),
      admin(),
      nextCookies(),
    ],
  });
}

// Singleton pattern to ensure a single auth instance
let auth: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
// Note: we need to do this async as CloudflareContext is not available otherwise
export async function getAuth() {
  if (!auth) {
    auth = await authBuilder();
  }
  return auth;
}
